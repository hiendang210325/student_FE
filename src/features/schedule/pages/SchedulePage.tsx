import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Bell,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  X,
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
  Shuffle,
  Info,
  Loader2,
  AlertCircle,
  RotateCw,
  UserCheck,
  CalendarOff,
  Pencil,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/routes/paths';
import { scheduleApi } from '../api/scheduleApi';
import { ScheduleItem, WeekdayCode } from '../types/schedule.types';
import { classApi } from '@/features/classes/api/classApi';
import { ClassRoom } from '@/features/classes/types/class.types';
import { ApiError } from '@/services/api/apiError';

// Trục thời gian từ 07:00 đến 21:00 (14 khoảng giờ)
const TIME_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

const WEEKDAY_ORDER: WeekdayCode[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const DRAWER_WEEKDAY_OPTIONS: Array<{
  key: WeekdayCode;
  label: string;
  fullName: string;
}> = [
  { key: 'T2', label: 'T2', fullName: 'Thứ 2' },
  { key: 'T3', label: 'T3', fullName: 'Thứ 3' },
  { key: 'T4', label: 'T4', fullName: 'Thứ 4' },
  { key: 'T5', label: 'T5', fullName: 'Thứ 5' },
  { key: 'T6', label: 'T6', fullName: 'Thứ 6' },
  { key: 'T7', label: 'T7', fullName: 'Thứ 7' },
  { key: 'CN', label: 'CN', fullName: 'Chủ Nhật' },
];

const DRAWER_SWATCH_COLORS = [
  '#C4ECF7',
  '#F2CFF0',
  '#DADDFB',
  '#FFD1E3',
  '#CFE3FF',
  '#FFC9D0',
];

const SWATCH_TEXT_MAP: Record<string, string> = {
  '#c4ecf7': '#0E5470',
  '#f2cff0': '#7A1F7A',
  '#daddfb': '#3B3F9B',
  '#ffd1e3': '#9C1F4B',
  '#cfe3ff': '#1F4E79',
  '#ffc9d0': '#A3243B',
};

const VIETNAMESE_DAY_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

// Định dạng Date -> YYYY-MM-DD theo múi giờ máy khách
const formatYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Định dạng YYYY-MM-DD -> DD/MM/YYYY
const formatDMYFromYMD = (ymd: string): string => {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${d}/${m}/${y}`;
};

// Lấy mã thứ ('T2'..'CN') từ đối tượng Date
const getWeekdayCodeFromDate = (d: Date): WeekdayCode => {
  const jsDay = d.getDay(); // 0 = CN, 1 = T2 ... 6 = T7
  return jsDay === 0 ? 'CN' : (WEEKDAY_ORDER[jsDay - 1] as WeekdayCode);
};

// Chuyển chuỗi HH:mm thành số giờ thập phân (ví dụ "15:30" -> 15.5)
const parseTimeDecimal = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};

// Định dạng danh sách thứ ngắn gọn trên thẻ Lịch cố định (VD: "Thứ 3 · 5 · 7")
const formatShortWeekdays = (days: WeekdayCode[]): string => {
  const sorted = [...days].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b)
  );
  if (sorted.length === 0) return '';
  const parts = sorted.map((d, idx) => {
    if (d === 'CN') return 'CN';
    const num = d.replace('T', '');
    return idx === 0 ? `Thứ ${num}` : num;
  });
  return parts.join(' · ');
};

// Định dạng danh sách thứ đầy đủ (VD: "Thứ 3, Thứ 5, Thứ 7")
const formatFullWeekdays = (days: WeekdayCode[]): string => {
  const sorted = [...days].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b)
  );
  return sorted
    .map((k) => DRAWER_WEEKDAY_OPTIONS.find((opt) => opt.key === k)?.fullName || k)
    .join(', ');
};

interface CalendarSessionInstance {
  instanceId: string;
  schedule: ScheduleItem;
  dateStr: string; // YYYY-MM-DD
  dayIndex: number; // 0: T2 .. 6: CN
  startHour: number;
  durationHours: number;
  isCancelled: boolean;
}

interface MonthDayCell {
  id: string;
  dateStr: string;
  dayNumber: number;
  monthNumber: number;
  yearNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: CalendarSessionInstance[];
}

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useAuthStore();
  const isStudentView = user?.role === 'user' || activeRole === 'student';

  // Thời gian thực hiện tại
  const todayDate = useMemo(() => new Date(), []);
  const todayYMD = useMemo(() => formatYMD(todayDate), [todayDate]);
  const todayWeekdayCode = useMemo(() => getWeekdayCodeFromDate(todayDate), [todayDate]);

  // Chế độ xem: Tháng hoặc Tuần
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  // Dữ liệu thực từ Backend
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Điều hướng lịch
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState<boolean>(false);
  const [pickerMonth, setPickerMonth] = useState<number>(new Date().getMonth() + 1);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());
  const [pickerMode, setPickerMode] = useState<'day' | 'month'>('day');
  const calendarPickerRef = useRef<HTMLDivElement>(null);

  // Tương tác Menu 3 chấm, Popover chi tiết buổi học & Danh sách buổi học trong ngày (+N nữa)
  const [activeTileMenuId, setActiveTileMenuId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<CalendarSessionInstance | null>(null);
  const [dayModalCell, setDayModalCell] = useState<MonthDayCell | null>(null);
  const [isTogglingCancel, setIsTogglingCancel] = useState<boolean>(false);

  // Side Drawer Thêm / Sửa lịch cố định
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [drawerClassId, setDrawerClassId] = useState<string>('');
  const [drawerWeekdays, setDrawerWeekdays] = useState<WeekdayCode[]>(['T3', 'T5']);
  const [drawerStartTime, setDrawerStartTime] = useState<string>('18:00');
  const [drawerEndTime, setDrawerEndTime] = useState<string>('19:30');
  const [drawerStartDate, setDrawerStartDate] = useState<string>(todayYMD);
  const [drawerColor, setDrawerColor] = useState<string>('#CFE3FF');
  const [drawerNote, setDrawerNote] = useState<string>('');
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  // Hộp thoại Xóa lịch cố định
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast phản hồi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tải danh sách lịch học & danh sách lớp học thật
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [schedRes, clsRes] = await Promise.all([
        scheduleApi.getSchedules(),
        classApi.getClasses().catch(() => ({ data: [] as ClassRoom[] })),
      ]);
      setSchedules(schedRes.data || []);
      setClasses(clsRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lịch học:', err);
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Không thể kết nối máy chủ để tải dữ liệu lịch học.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      showToast('Đã cập nhật lịch học mới nhất!');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Đóng menu / date picker khi click ra ngoài
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      setActiveTileMenuId(null);
      if (
        isCalendarPickerOpen &&
        calendarPickerRef.current &&
        !calendarPickerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [isCalendarPickerOpen]);

  // Danh sách các lịch cố định ĐANG HOẠT ĐỘNG (isActive: true)
  const activeSchedules = useMemo(
    () => schedules.filter((s) => s.isActive),
    [schedules]
  );

  // Tổng số buổi/tuần của các lịch cố định đang hoạt động
  const totalSessionsPerWeek = useMemo(
    () => activeSchedules.reduce((sum, s) => sum + (s.weekdays?.length || 0), 0),
    [activeSchedules]
  );

  // Hàm kiểm tra và sinh danh sách buổi học diễn ra vào 1 ngày cụ thể (bao gồm lịch sử các lịch đã xóa trước endDate)
  const getSessionsForDate = useCallback(
    (dateObj: Date): CalendarSessionInstance[] => {
      const dateStr = formatYMD(dateObj);
      const weekdayCode = getWeekdayCodeFromDate(dateObj);
      const dayIndex = WEEKDAY_ORDER.indexOf(weekdayCode);

      const matched = schedules
        .filter((s) => {
          if (!s.weekdays?.includes(weekdayCode)) return false;
          if (dateStr < s.startDate) return false;
          if (s.endDate && dateStr > s.endDate) return false;
          return true;
        })
        .map((s) => {
          const startHour = parseTimeDecimal(s.startTime);
          const endHour = parseTimeDecimal(s.endTime);
          const durationHours = Math.max(0.5, endHour - startHour);
          const isCancelled = Boolean(s.cancelledDates?.includes(dateStr));

          return {
            instanceId: `${s.id}_${dateStr}`,
            schedule: s,
            dateStr,
            dayIndex,
            startHour,
            durationHours,
            isCancelled,
          };
        })
        .sort((a, b) => a.startHour - b.startHour);

      return matched;
    },
    [schedules]
  );

  // Các buổi học của ngày HÔM NAY thật
  const todaySessions = useMemo(
    () => getSessionsForDate(todayDate),
    [getSessionsForDate, todayDate]
  );

  const todayActiveCount = useMemo(
    () => todaySessions.filter((s) => !s.isCancelled).length,
    [todaySessions]
  );

  const activeYear = activeDate.getFullYear();
  const activeMonth = activeDate.getMonth() + 1;

  // Lưới 42 ô ngày cho chế độ Tháng
  const dynamicMonthCells = useMemo<MonthDayCell[]>(() => {
    const firstOfMonth = new Date(activeYear, activeMonth - 1, 1);
    const jsDay = firstOfMonth.getDay();
    const startOffset = jsDay === 0 ? 6 : jsDay - 1;
    const startDate = new Date(activeYear, activeMonth - 1, 1 - startOffset);

    const cells: MonthDayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + i
      );
      const dateStr = formatYMD(cellDate);
      const cellDay = cellDate.getDate();
      const cellMonth = cellDate.getMonth() + 1;
      const cellYear = cellDate.getFullYear();
      const inCurrentMonth = cellMonth === activeMonth && cellYear === activeYear;

      cells.push({
        id: dateStr,
        dateStr,
        dayNumber: cellDay,
        monthNumber: cellMonth,
        yearNumber: cellYear,
        isCurrentMonth: inCurrentMonth,
        isToday: dateStr === todayYMD,
        sessions: getSessionsForDate(cellDate),
      });
    }
    return cells;
  }, [activeYear, activeMonth, todayYMD, getSessionsForDate]);

  // 7 ngày (T2..CN) cho chế độ Tuần
  const dynamicWeekDays = useMemo(() => {
    const jsDay = activeDate.getDay();
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(
      activeDate.getFullYear(),
      activeDate.getMonth(),
      activeDate.getDate() + mondayOffset
    );
    const shortNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return shortNames.map((shortName, idx) => {
      const d = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + idx
      );
      const dateStr = formatYMD(d);
      return {
        shortName,
        dateNumber: String(d.getDate()).padStart(2, '0'),
        dateStr,
        fullDate: d,
        isToday: dateStr === todayYMD,
        sessions: getSessionsForDate(d),
      };
    });
  }, [activeDate, todayYMD, getSessionsForDate]);

  const toolbarTimeLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `Tháng ${String(activeMonth).padStart(2, '0')}/${activeYear}`;
    }
    const start = dynamicWeekDays[0].fullDate;
    const end = dynamicWeekDays[6].fullDate;
    const startStr = `${String(start.getDate()).padStart(2, '0')}/${String(
      start.getMonth() + 1
    ).padStart(2, '0')}`;
    const endStr = `${String(end.getDate()).padStart(2, '0')}/${String(
      end.getMonth() + 1
    ).padStart(2, '0')}/${end.getFullYear()}`;
    return `${startStr} – ${endStr}`;
  }, [viewMode, activeMonth, activeYear, dynamicWeekDays]);

  const handlePrevPeriod = () => {
    if (viewMode === 'month') {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'month') {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setActiveDate(now);
    showToast(
      viewMode === 'month'
        ? `Đang ở Tháng ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
        : 'Đang ở tuần hiện tại'
    );
  };

  const handleToggleCalendarPicker = () => {
    setPickerMonth(activeMonth);
    setPickerYear(activeYear);
    setPickerMode('day');
    setIsCalendarPickerOpen((prev) => !prev);
  };

  const getDaysInMonth = (month: number, year: number): number =>
    new Date(year, month, 0).getDate();

  const getMondayStartOffset = (month: number, year: number): number => {
    const jsDay = new Date(year, month - 1, 1).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  // ==================== MỞ DRAWER THÊM / SỬA ====================
  const handleOpenCreateDrawer = () => {
    setEditingSchedule(null);
    setDrawerClassId(classes[0]?.id || '');
    setDrawerWeekdays(['T3', 'T5']);
    setDrawerStartTime('18:00');
    setDrawerEndTime('19:30');
    setDrawerStartDate(todayYMD);
    setDrawerColor(classes[0]?.colorTheme?.bg || '#CFE3FF');
    setDrawerNote('');
    setDrawerError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setDrawerClassId(item.classId);
    setDrawerWeekdays(item.weekdays);
    setDrawerStartTime(item.startTime);
    setDrawerEndTime(item.endTime);
    setDrawerStartDate(item.startDate);
    setDrawerColor(item.bgColor || '#CFE3FF');
    setDrawerNote(item.note || '');
    setDrawerError(null);
    setSelectedSession(null);
    setDayModalCell(null);
    setIsDrawerOpen(true);
  };

  const handleToggleDrawerWeekday = (key: WeekdayCode) => {
    if (drawerWeekdays.includes(key)) {
      if (drawerWeekdays.length > 1) {
        setDrawerWeekdays(drawerWeekdays.filter((d) => d !== key));
      } else {
        showToast('Vui lòng chọn ít nhất một thứ trong tuần');
      }
    } else {
      const next = [...drawerWeekdays, key].sort(
        (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b)
      );
      setDrawerWeekdays(next);
    }
  };

  const handleRandomColor = () => {
    const remaining = DRAWER_SWATCH_COLORS.filter((c) => c !== drawerColor);
    const randomIndex = Math.floor(Math.random() * remaining.length);
    setDrawerColor(remaining[randomIndex]);
  };

  const selectedClassName = useMemo(() => {
    const found = classes.find((c) => c.id === drawerClassId);
    return found?.name || editingSchedule?.className || 'Chưa chọn lớp';
  }, [classes, drawerClassId, editingSchedule]);

  const summaryText = `${selectedClassName} · ${
    formatFullWeekdays(drawerWeekdays) || 'Chưa chọn thứ'
  } · ${drawerStartTime}–${drawerEndTime} · lặp mỗi tuần từ ${formatDMYFromYMD(
    drawerStartDate
  )} cho đến khi Admin xóa lịch.`;

  const handleSaveDrawerSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError(null);

    if (!drawerClassId) {
      setDrawerError('Vui lòng chọn lớp học trước khi lưu lịch.');
      return;
    }

    if (drawerEndTime <= drawerStartTime) {
      setDrawerError('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
      return;
    }

    const textColor = SWATCH_TEXT_MAP[drawerColor.toLowerCase()] || '#1F4E79';

    setIsSavingSchedule(true);
    try {
      if (editingSchedule) {
        await scheduleApi.updateSchedule(editingSchedule.id, {
          classId: drawerClassId,
          weekdays: drawerWeekdays,
          startTime: drawerStartTime,
          endTime: drawerEndTime,
          startDate: drawerStartDate,
          bgColor: drawerColor,
          textColor,
          note: drawerNote.trim(),
        });
        showToast(`Đã cập nhật lịch dạy cho ${selectedClassName}!`);
      } else {
        await scheduleApi.createSchedule({
          classId: drawerClassId,
          weekdays: drawerWeekdays,
          startTime: drawerStartTime,
          endTime: drawerEndTime,
          startDate: drawerStartDate,
          bgColor: drawerColor,
          textColor,
          note: drawerNote.trim(),
        });
        showToast(`Đã thêm lịch dạy cố định cho ${selectedClassName}!`);
      }
      setIsDrawerOpen(false);
      await fetchData();
    } catch (err) {
      setDrawerError(
        err instanceof ApiError
          ? err.message
          : 'Không thể lưu lịch dạy. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // ==================== XỬ LÝ XÓA LỊCH CỐ ĐỊNH ====================
  const handleConfirmDeleteSchedule = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const name = deleteTarget.className;
      await scheduleApi.deleteSchedule(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedSession(null);
      await fetchData();
      showToast(`Đã kết thúc lịch dạy của ${name} từ hôm nay.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể xóa lịch dạy lúc này.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ==================== BÁO NGHỈ / MỞ LẠI 1 BUỔI HỌC LẺ ====================
  const handleToggleSessionCancel = async (instance: CalendarSessionInstance) => {
    setIsTogglingCancel(true);
    try {
      const targetCancelled = !instance.isCancelled;
      const res = await scheduleApi.toggleCancelDate(
        instance.schedule.id,
        instance.dateStr,
        targetCancelled
      );
      await fetchData();
      setSelectedSession({
        ...instance,
        schedule: res.data,
        isCancelled: targetCancelled,
      });
      showToast(
        targetCancelled
          ? `Đã báo nghỉ buổi ${instance.schedule.className} ngày ${formatDMYFromYMD(
              instance.dateStr
            )}.`
          : `Đã mở lại buổi học ${instance.schedule.className} ngày ${formatDMYFromYMD(
              instance.dateStr
            )}.`
      );
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể cập nhật trạng thái buổi học.'
      );
    } finally {
      setIsTogglingCancel(false);
    }
  };

  // Chiều cao cho mỗi giờ học trên trục lịch tuần
  const HOUR_HEIGHT = 48;
  const START_HOUR = 7;

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px]">
      <div className="w-full lg:w-[1200px] lg:min-h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-6 box-border select-none relative font-nunito">
        {/* Thông báo nổi */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
        <header className="min-h-[72px] lg:h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                {isStudentView ? 'Lịch học của em' : 'Lịch học'}
              </h1>
              <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                {activeSchedules.length} lịch cố định · {totalSessionsPerWeek} buổi/tuần
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  {isStudentView
                    ? 'Theo dõi lịch học hàng tuần và thông báo nghỉ học của lớp nhé!'
                    : 'Tạo lịch một lần, tuần nào cũng tự hiện đến khi xóa nhé!'}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 pl-3">
                <svg
                  className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                </svg>
                <svg
                  className="w-6 h-6 text-[#2F6FA8] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Phía bên phải: Nút Làm mới & Thêm lịch dạy (Chỉ hiện Thêm lịch dạy cho Admin) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-[44px] px-4 rounded-[10px] border border-[#9C6B84] bg-white hover:bg-[#FFE0EB]/40 text-[#3B2A35] font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                strokeWidth={1.75}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {!isStudentView && (
              <button
                type="button"
                onClick={handleOpenCreateDrawer}
                className="flex-1 md:flex-none h-[44px] px-5 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4 text-white" strokeWidth={2} />
                <span>Thêm lịch dạy</span>
              </button>
            )}
          </div>
        </header>

        {loadError && (
          <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="underline font-bold hover:text-amber-900 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* ==================== HÀNG 2: BỐ CỤC 2 CỘT ==================== */}
        <div className="w-full lg:w-[1136px] lg:h-[800px] flex flex-col lg:flex-row gap-4 lg:gap-[24px] flex-shrink-0">
          {/* ========== CỘT BÊN TRÁI (366px): 2 THẺ ========== */}
          <div className="w-full lg:w-[366px] lg:h-[800px] flex flex-col gap-4 lg:gap-0 lg:justify-between flex-shrink-0">
            {/* THẺ TRÊN: THẺ THÔNG BÁO "HÔM NAY" (Thời gian thực) */}
            <div className="min-h-[150px] lg:h-[188px] p-4 lg:p-5 rounded-[16px] bg-[#DCEBFA] border border-[#CFE8FF] shadow-card flex flex-col justify-between gap-2 flex-shrink-0">
              <div>
                <span className="font-nunito text-[12px] font-bold tracking-widest text-[#1F4E79] uppercase block mb-1">
                  HÔM NAY
                </span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-playfair text-[28px] lg:text-[30px] font-bold text-[#1F4E79] leading-none">
                    {VIETNAMESE_DAY_NAMES[todayDate.getDay()]}
                  </span>
                  <span className="font-nunito text-[15px] font-semibold text-[#1F4E79]">
                    {formatDMYFromYMD(todayYMD)}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white text-[#1F4E79] text-[13px] font-bold shadow-2xs w-fit">
                <Bell className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                <span>
                  {todayActiveCount > 0
                    ? isStudentView
                      ? `Hôm nay em có ${todayActiveCount} buổi học`
                      : `Hôm nay có ${todayActiveCount} buổi dạy`
                    : isStudentView
                    ? 'Hôm nay em không có lịch học'
                    : 'Hôm nay không có lịch dạy'}
                </span>
              </div>

              <div className="space-y-1 max-h-[54px] overflow-y-auto pr-1">
                {todaySessions.length === 0 ? (
                  <p className="text-[12px] text-[#1F4E79]/80 font-medium">
                    Chúc {isStudentView ? 'em' : 'cô'} một ngày thật vui và hiệu quả!
                  </p>
                ) : (
                  todaySessions.map((sess) => (
                    <button
                      key={sess.instanceId}
                      type="button"
                      onClick={() => setSelectedSession(sess)}
                      className="w-full flex items-center justify-between gap-2 text-[13px] font-semibold text-[#1F4E79] hover:underline text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sess.schedule.textColor }}
                        />
                        <span
                          className={`truncate ${
                            sess.isCancelled ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {sess.schedule.startTime}–{sess.schedule.endTime} ·{' '}
                          {sess.schedule.className}
                        </span>
                      </div>
                      {sess.isCancelled && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold flex-shrink-0">
                          Nghỉ
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* THẺ DƯỚI: THẺ "LỊCH CỐ ĐỊNH" */}
            <div className="lg:h-[588px] p-4 lg:p-5 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col gap-3 flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between flex-shrink-0">
                <span className="font-nunito text-[12px] font-bold tracking-widest text-[#6B5560] uppercase">
                  LỊCH CỐ ĐỊNH
                </span>
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[12px] font-bold">
                  {activeSchedules.length} khung lịch
                </span>
              </div>

              {isLoading ? (
                <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center gap-2 text-[#6B5560]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2F6FA8]" />
                  <span className="text-xs font-semibold">Đang tải lịch cố định...</span>
                </div>
              ) : activeSchedules.length === 0 ? (
                <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center text-center px-3 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[14px] text-[#3B2A35]">
                      {isStudentView
                        ? 'Chưa có lịch học cố định'
                        : 'Chưa tạo lịch dạy cố định nào'}
                    </p>
                    <p className="text-[12px] text-[#6B5560]">
                      {isStudentView
                        ? 'Khi giáo viên xếp lịch cho lớp của em, lịch học sẽ tự động hiển thị tại đây.'
                        : 'Bấm nút "Thêm lịch dạy" để gán thứ & khung giờ học hàng tuần cho lớp.'}
                    </p>
                  </div>
                  {!isStudentView && (
                    <button
                      type="button"
                      onClick={handleOpenCreateDrawer}
                      className="h-9 px-4 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm lịch ngay</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 overflow-y-auto pr-0.5 content-start flex-1">
                  {activeSchedules.map((item) => {
                    const hasToday =
                      item.weekdays.includes(todayWeekdayCode) &&
                      todayYMD >= item.startDate &&
                      (!item.endDate || todayYMD <= item.endDate);

                    return (
                      <div
                        key={item.id}
                        style={{ backgroundColor: item.bgColor }}
                        className="min-h-[136px] rounded-[16px] p-3.5 flex flex-col justify-between shadow-2xs relative select-none"
                      >
                        {/* Hàng trên: Tên lớp và nút ba chấm ⋮ (chỉ Admin) */}
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className="font-playfair text-[20px] font-bold leading-tight truncate"
                            style={{ color: item.textColor }}
                            title={item.className}
                          >
                            {item.className}
                          </span>

                          {!isStudentView && (
                            <div
                              className="relative flex-shrink-0"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTileMenuId(
                                    activeTileMenuId === item.id ? null : item.id
                                  );
                                }}
                                className="text-inherit opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer"
                                title="Tùy chọn"
                              >
                                <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
                              </button>

                              {activeTileMenuId === item.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-6 w-[132px] bg-white rounded-[10px] border border-[#F3D9E3] shadow-md py-1 z-30 animate-in fade-in zoom-in-95"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTileMenuId(null);
                                      navigate(
                                        `${ROUTES.CLASS_DETAIL.replace(
                                          ':id',
                                          item.classId
                                        )}?date=${todayYMD}`
                                      );
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-[#1F4E79] hover:bg-[#E9F3FF] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Điểm danh</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTileMenuId(null);
                                      handleOpenEditDrawer(item);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-[#1F4E79] hover:bg-[#E9F3FF] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Sửa lịch</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTileMenuId(null);
                                      setDeleteTarget(item);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-[#B02525] hover:bg-[#FFE3E3] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa lịch</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Hàng giữa: Các ngày trong tuần và khung giờ học */}
                        <div className="my-1.5">
                          <div
                            className="font-nunito text-[13px] font-bold leading-tight mb-1 truncate"
                            style={{ color: item.textColor }}
                          >
                            {formatShortWeekdays(item.weekdays)}
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-[#3B2A35] font-semibold leading-tight">
                            <Clock
                              className="w-3.5 h-3.5 text-[#3B2A35] flex-shrink-0"
                              strokeWidth={1.75}
                            />
                            <span>
                              {item.startTime}–{item.endTime}
                            </span>
                          </div>
                        </div>

                        {/* Hàng dưới: Huy hiệu "Hôm nay" */}
                        <div className="h-5 flex items-center justify-between">
                          {hasToday ? (
                            <span className="px-2 py-0.5 rounded-[6px] bg-white text-[#1F4E79] text-[11px] font-bold shadow-2xs">
                              Hôm nay
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#3B2A35]/70 font-medium truncate">
                              {item.roomNumber || ''}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ========== CỘT BÊN PHẢI (746px): THẺ THỜI KHÓA BIỂU CALENDAR ========== */}
          <div className="w-full lg:w-[746px] lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col justify-between overflow-hidden relative flex-shrink-0">
            {/* 1. THANH CÔNG CỤ */}
            <div className="min-h-[64px] lg:h-[64px] px-4 lg:px-6 py-3 lg:py-0 border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
              <div
                ref={calendarPickerRef}
                className="relative flex flex-wrap items-center gap-1.5 lg:gap-2"
              >
                <button
                  type="button"
                  onClick={handlePrevPeriod}
                  className="w-9 h-9 lg:w-8 lg:h-8 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF] flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  title={viewMode === 'month' ? 'Tháng trước' : 'Tuần trước'}
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleNextPeriod}
                  className="w-9 h-9 lg:w-8 lg:h-8 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF] flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  title={viewMode === 'month' ? 'Tháng sau' : 'Tuần sau'}
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="h-9 lg:h-8 px-3 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF] font-nunito text-[12px] font-bold cursor-pointer transition-colors lg:ml-1"
                >
                  Hôm nay
                </button>
                <span
                  className={`font-playfair font-bold text-[#3B2A35] ml-1 lg:ml-3 ${
                    viewMode === 'month'
                      ? 'text-[17px] lg:text-[20px]'
                      : 'text-[16px] lg:text-[18px]'
                  }`}
                >
                  {toolbarTimeLabel}
                </span>

                <button
                  type="button"
                  onClick={handleToggleCalendarPicker}
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ml-0.5 ${
                    isCalendarPickerOpen
                      ? 'bg-[#2F6FA8] text-white'
                      : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF]'
                  }`}
                  title="Xem lịch và chuyển tháng, năm"
                  aria-label="Xem lịch và chuyển tháng, năm"
                >
                  <CalendarIcon className="w-4 h-4" strokeWidth={1.75} />
                </button>

                {/* Popover chọn nhanh Ngày / Tháng / Năm */}
                {isCalendarPickerOpen && (
                  <div className="absolute left-0 top-[44px] z-50 w-[300px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_12px_32px_rgba(59,42,53,0.16)] p-4">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F3D9E3]">
                      <button
                        type="button"
                        onClick={() => {
                          if (pickerMode === 'month') {
                            setPickerYear((y) => y - 1);
                          } else if (pickerMonth === 1) {
                            setPickerMonth(12);
                            setPickerYear((y) => y - 1);
                          } else {
                            setPickerMonth((m) => m - 1);
                          }
                        }}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA] transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPickerMode((prev) => (prev === 'day' ? 'month' : 'day'))
                        }
                        className="px-2.5 py-1 rounded-[8px] font-playfair text-[16px] font-bold text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors cursor-pointer"
                      >
                        {pickerMode === 'month'
                          ? `Năm ${pickerYear}`
                          : `Tháng ${String(pickerMonth).padStart(2, '0')}/${pickerYear}`}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (pickerMode === 'month') {
                            setPickerYear((y) => y + 1);
                          } else if (pickerMonth === 12) {
                            setPickerMonth(1);
                            setPickerYear((y) => y + 1);
                          } else {
                            setPickerMonth((m) => m + 1);
                          }
                        }}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA] transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>

                    {pickerMode === 'month' ? (
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => {
                          const isCurrent =
                            month === activeMonth && pickerYear === activeYear;
                          return (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                setPickerMonth(month);
                                setActiveDate(new Date(pickerYear, month - 1, 1));
                                setPickerMode('day');
                              }}
                              className={`h-[36px] rounded-[10px] text-[13px] font-bold transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#2F6FA8] text-white'
                                  : 'bg-[#FFF6F9] text-[#3B2A35] hover:bg-[#DCEBFA] hover:text-[#1F4E79]'
                              }`}
                            >
                              Tháng {month}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
                          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wd) => (
                            <span
                              key={wd}
                              className="text-[12px] font-bold text-[#6B5560] py-1"
                            >
                              {wd}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from(
                            { length: getMondayStartOffset(pickerMonth, pickerYear) },
                            (_, i) => (
                              <div key={`empty-${i}`} className="h-[34px]" />
                            )
                          )}
                          {Array.from(
                            { length: getDaysInMonth(pickerMonth, pickerYear) },
                            (_, i) => i + 1
                          ).map((day) => {
                            const isSelected =
                              day === activeDate.getDate() &&
                              pickerMonth === activeMonth &&
                              pickerYear === activeYear;
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  setActiveDate(new Date(pickerYear, pickerMonth - 1, day));
                                  setIsCalendarPickerOpen(false);
                                }}
                                className={`h-[34px] rounded-[8px] text-[13px] font-bold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#2F6FA8] text-white'
                                    : 'text-[#3B2A35] hover:bg-[#DCEBFA] hover:text-[#1F4E79]'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Chuyển đổi Tuần | Tháng */}
              <div className="w-full md:w-auto h-9 p-1 rounded-[10px] bg-[#E9F3FF] grid grid-cols-2 md:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-[8px] text-[13px] font-bold transition-all cursor-pointer ${
                    viewMode === 'week'
                      ? 'bg-[#2F6FA8] text-white shadow-2xs'
                      : 'text-[#1F4E79] hover:bg-white/50'
                  }`}
                >
                  Tuần
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-[8px] text-[13px] font-bold transition-all cursor-pointer ${
                    viewMode === 'month'
                      ? 'bg-[#2F6FA8] text-white shadow-2xs'
                      : 'text-[#1F4E79] hover:bg-white/50'
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>

            {/* 2. KHUNG NỘI DUNG LỊCH: THÁNG HOẶC TUẦN */}
            {viewMode === 'month' ? (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="h-[34px] bg-[#DCEBFA] border-b border-[#F3D9E3] grid grid-cols-7 flex-shrink-0">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center border-r border-[#F3D9E3] last:border-r-0 text-[13px] font-semibold text-[#1F4E79] font-nunito"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-white overflow-hidden">
                  {dynamicMonthCells.map((cell, idx) => {
                    const isLastCol = (idx + 1) % 7 === 0;
                    const isLastRow = idx >= 35;
                    const maxChips = 3;
                    const visibleSessions = cell.sessions.slice(0, maxChips);
                    const remainingCount = cell.sessions.length - maxChips;

                    return (
                      <div
                        key={cell.id}
                        className={`min-h-[62px] md:min-h-[108px] lg:min-h-0 pt-1 pb-1 px-1 md:px-1.5 flex flex-col justify-start overflow-hidden border-[#F3D9E3] select-none ${
                          !isLastCol ? 'border-r' : ''
                        } ${!isLastRow ? 'border-b' : ''} ${
                          cell.isToday ? 'bg-[#F7FBFF]' : ''
                        } ${!cell.isCurrentMonth ? 'bg-slate-50/40' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1 h-[22px] flex-shrink-0">
                          {cell.isToday ? (
                            <div className="w-[22px] h-[22px] rounded-full bg-[#D6336C] text-white flex items-center justify-center text-[12px] font-bold shadow-2xs">
                              {cell.dayNumber}
                            </div>
                          ) : (
                            <span
                              className={`text-[13px] md:text-[14px] font-bold pl-0.5 leading-none ${
                                cell.isCurrentMonth
                                  ? 'text-[#3B2A35]'
                                  : 'text-[#6B5560] opacity-40'
                              }`}
                            >
                              {cell.dayNumber}
                            </span>
                          )}
                        </div>

                        {/* Di động: chấm màu */}
                        {cell.sessions.length > 0 && (
                          <div className="flex md:hidden flex-wrap items-center gap-1 pt-0.5">
                            {visibleSessions.map((sess) => (
                              <button
                                key={sess.instanceId}
                                type="button"
                                style={{ backgroundColor: sess.schedule.textColor }}
                                onClick={() => setSelectedSession(sess)}
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 cursor-pointer ${
                                  sess.isCancelled ? 'opacity-35' : ''
                                }`}
                                title={`${sess.schedule.startTime} ${sess.schedule.className}`}
                              />
                            ))}
                            {remainingCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setDayModalCell(cell)}
                                className="text-[10px] font-bold text-[#2F6FA8] leading-none"
                              >
                                +{remainingCount}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Máy tính bảng & Máy tính bàn: Danh sách thẻ buổi dạy */}
                        {cell.sessions.length > 0 && (
                          <div
                            className={`hidden md:flex flex-col gap-[2px] overflow-hidden flex-1 ${
                              !cell.isCurrentMonth ? 'opacity-50' : ''
                            }`}
                          >
                            {visibleSessions.map((sess) => (
                              <button
                                key={sess.instanceId}
                                type="button"
                                style={{
                                  backgroundColor: sess.schedule.bgColor,
                                  color: sess.schedule.textColor,
                                  borderLeftColor: sess.schedule.textColor,
                                }}
                                onClick={() => setSelectedSession(sess)}
                                className={`h-[26px] px-2 rounded-[8px] border-l-[3px] flex items-center justify-between gap-1 text-[11px] font-bold truncate cursor-pointer hover:brightness-95 transition-all shadow-2xs flex-shrink-0 text-left ${
                                  sess.isCancelled ? 'opacity-65 line-through' : ''
                                }`}
                                title={`${sess.schedule.startTime}–${sess.schedule.endTime} ${sess.schedule.className}`}
                              >
                                <span className="truncate">
                                  {sess.schedule.startTime} {sess.schedule.className}
                                </span>
                                {sess.isCancelled && (
                                  <span className="text-[9px] bg-white/80 text-[#B02525] px-1 rounded no-underline flex-shrink-0">
                                    Nghỉ
                                  </span>
                                )}
                              </button>
                            ))}

                            {remainingCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setDayModalCell(cell)}
                                className="text-[11px] font-bold text-[#2F6FA8] hover:underline pl-0.5 text-left cursor-pointer leading-tight flex-shrink-0"
                              >
                                +{remainingCount} nữa
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* KHUNG LƯỚI THỜI KHÓA BIỂU THEO TUẦN */
              <div className="flex-1 flex flex-col overflow-x-auto overflow-y-auto relative">
                <div className="min-w-[640px] flex-1 flex flex-col min-h-[720px]">
                  {/* Hàng tiêu đề 7 ngày trong tuần */}
                  <div className="h-[44px] border-b border-[#F3D9E3] grid grid-cols-[54px_repeat(7,1fr)] bg-[#FCF8FA] flex-shrink-0 sticky top-0 z-30">
                    <div className="sticky left-0 z-20 bg-[#FCF8FA] border-r border-[#F3D9E3]" />
                    {dynamicWeekDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-center gap-1.5 border-r border-[#F3D9E3] last:border-r-0 ${
                          day.isToday ? 'bg-[#F7FBFF]' : ''
                        }`}
                      >
                        <span
                          className={`text-[13px] font-bold ${
                            day.isToday ? 'text-[#1F4E79]' : 'text-[#6B5560]'
                          }`}
                        >
                          {day.shortName}
                        </span>
                        {day.isToday ? (
                          <div className="w-6 h-6 rounded-full bg-[#D6336C] text-white flex items-center justify-center text-[12px] font-bold shadow-2xs">
                            {day.dateNumber}
                          </div>
                        ) : (
                          <span className="text-[13px] font-semibold text-[#6B5560]">
                            {day.dateNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Khu vực lưới các khung giờ (07:00 - 21:00) */}
                  <div
                    style={{ height: `${TIME_SLOTS.length * HOUR_HEIGHT}px` }}
                    className="relative grid grid-cols-[54px_repeat(7,1fr)] flex-shrink-0"
                  >
                    <div className="sticky left-0 z-20 border-r border-[#F3D9E3] bg-[#FCF8FA] relative">
                      {TIME_SLOTS.map((time, idx) => (
                        <div
                          key={idx}
                          style={{ top: `${idx * HOUR_HEIGHT}px` }}
                          className="absolute left-0 right-0 -translate-y-1/2 text-right pr-2 text-[11px] font-medium text-[#6B5560]"
                        >
                          {time}
                        </div>
                      ))}
                    </div>

                    {dynamicWeekDays.map((day, colIdx) => (
                      <div
                        key={colIdx}
                        className={`relative border-r border-[#F3D9E3] last:border-r-0 ${
                          day.isToday ? 'bg-[#F7FBFF]' : 'bg-white'
                        }`}
                      >
                        {TIME_SLOTS.map((_, rowIdx) => (
                          <div
                            key={rowIdx}
                            style={{ top: `${rowIdx * HOUR_HEIGHT}px` }}
                            className="absolute left-0 right-0 border-b border-[#F3D9E3]/70 pointer-events-none"
                          />
                        ))}

                        {day.sessions.map((session) => {
                          const clampedStart = Math.max(START_HOUR, session.startHour);
                          const topPx = (clampedStart - START_HOUR) * HOUR_HEIGHT;
                          const heightPx = Math.max(36, session.durationHours * HOUR_HEIGHT);

                          return (
                            <button
                              key={session.instanceId}
                              type="button"
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                backgroundColor: session.schedule.bgColor,
                                color: session.schedule.textColor,
                                borderLeftColor: session.schedule.textColor,
                              }}
                              onClick={() => setSelectedSession(session)}
                              className={`absolute left-1 right-1 rounded-[10px] border-l-4 p-2 shadow-2xs cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-start text-left select-none z-10 overflow-hidden ${
                                session.isCancelled ? 'opacity-65' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`font-bold text-[12px] leading-tight truncate ${
                                    session.isCancelled ? 'line-through' : ''
                                  }`}
                                  style={{ color: session.schedule.textColor }}
                                >
                                  {session.schedule.className}
                                </span>
                                {session.isCancelled && (
                                  <span className="text-[9px] bg-white/85 text-[#B02525] font-bold px-1 rounded flex-shrink-0">
                                    Nghỉ
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] leading-tight opacity-90 block mt-0.5 truncate text-[#3B2A35]">
                                {session.schedule.startTime}–{session.schedule.endTime}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== HỘP THOẠI POPOVER CHI TIẾT BUỔI HỌC (CHO CẢ LỊCH TUẦN & THÁNG) ==================== */}
        {selectedSession && (
          <div
            className="fixed inset-0 z-50 bg-[#3B2A35]/35 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-150"
            onClick={() => !isTogglingCancel && setSelectedSession(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-[420px] bg-white rounded-t-[20px] md:rounded-[18px] border border-[#F3D9E3] shadow-[0_20px_50px_rgba(59,42,53,0.22)] p-5 md:p-6 flex flex-col gap-4 select-none animate-in slide-in-from-bottom md:zoom-in-95 duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{
                        backgroundColor: selectedSession.schedule.bgColor,
                        color: selectedSession.schedule.textColor,
                      }}
                      className="px-2.5 py-0.5 rounded-[8px] text-[12px] font-bold"
                    >
                      {formatDMYFromYMD(selectedSession.dateStr)}
                    </span>
                    {selectedSession.isCancelled ? (
                      <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFE3E3] text-[#B02525] text-[12px] font-bold">
                        Đã báo nghỉ buổi này
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-[8px] bg-emerald-50 text-emerald-700 text-[12px] font-bold">
                        Buổi học bình thường
                      </span>
                    )}
                  </div>
                  <h3 className="font-playfair text-[22px] font-bold text-[#3B2A35] mt-2 leading-tight">
                    {selectedSession.schedule.className}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="w-8 h-8 rounded-[8px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFE0EB]/50 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3] text-[13px]">
                <div className="flex items-center gap-2 font-bold text-[#3B2A35]">
                  <Clock className="w-4 h-4 text-[#2F6FA8]" />
                  <span>
                    Khung giờ: {selectedSession.schedule.startTime} –{' '}
                    {selectedSession.schedule.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#6B5560] font-semibold">
                  <CalendarIcon className="w-4 h-4 text-[#D6336C]" />
                  <span>
                    Lặp cố định: {formatFullWeekdays(selectedSession.schedule.weekdays)} hằng tuần
                  </span>
                </div>
                {selectedSession.schedule.roomNumber && (
                  <div className="flex items-center gap-2 text-[#6B5560] font-semibold">
                    <MapPin className="w-4 h-4 text-[#1F4E79]" />
                    <span>Phòng học: {selectedSession.schedule.roomNumber}</span>
                  </div>
                )}
                {selectedSession.schedule.note && (
                  <div className="text-xs text-[#6B5560] pt-1 border-t border-[#F3D9E3]/70">
                    Ghi chú: <strong className="text-[#3B2A35]">{selectedSession.schedule.note}</strong>
                  </div>
                )}
              </div>

              {!isStudentView ? (
                <div className="space-y-2.5 pt-1">
                  {/* Hàng 1: Điểm danh lớp & Báo nghỉ buổi lẻ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const clsId = selectedSession.schedule.classId;
                        const dt = selectedSession.dateStr;
                        setSelectedSession(null);
                        navigate(`${ROUTES.CLASS_DETAIL.replace(':id', clsId)}?date=${dt}`);
                      }}
                      className="h-[42px] px-3.5 rounded-[10px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Điểm danh lớp</span>
                    </button>

                    <button
                      type="button"
                      disabled={isTogglingCancel}
                      onClick={() => handleToggleSessionCancel(selectedSession)}
                      className={`h-[42px] px-3.5 rounded-[10px] border font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60 ${
                        selectedSession.isCancelled
                          ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                          : 'border-[#A61E4D] text-[#A61E4D] hover:bg-[#FFE0EB]/50'
                      }`}
                    >
                      {isTogglingCancel ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CalendarOff className="w-4 h-4" />
                      )}
                      <span>
                        {selectedSession.isCancelled
                          ? 'Mở lại buổi này'
                          : 'Báo nghỉ buổi này'}
                      </span>
                    </button>
                  </div>

                  {/* Hàng 2: Sửa lịch cố định & Xóa lịch cố định */}
                  {selectedSession.schedule.isActive && (
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#F3D9E3]">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDrawer(selectedSession.schedule)}
                        className="h-9 px-3.5 rounded-[8px] border border-[#2F6FA8] text-[#2F6FA8] text-[12px] font-bold hover:bg-[#E9F3FF] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Sửa lịch cố định</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const sched = selectedSession.schedule;
                          setSelectedSession(null);
                          setDeleteTarget(sched);
                        }}
                        className="text-[#B02525] hover:underline text-[12px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#B02525]" />
                        <span>Xóa lịch cố định</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSession(null)}
                    className="h-10 px-5 rounded-[10px] bg-[#2F6FA8] text-white font-bold text-sm cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== HỘP THOẠI XEM TẤT CẢ BUỔI HỌC TRONG NGÀY (+N NỮA) ==================== */}
        {dayModalCell && (
          <div
            className="fixed inset-0 z-50 bg-[#3B2A35]/35 flex items-center justify-center p-4"
            onClick={() => setDayModalCell(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-white rounded-[16px] border border-[#F3D9E3] shadow-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#F3D9E3] pb-2.5">
                <h3 className="font-playfair text-lg font-bold text-[#3B2A35]">
                  Lịch ngày {formatDMYFromYMD(dayModalCell.dateStr)}
                </h3>
                <button
                  type="button"
                  onClick={() => setDayModalCell(null)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {dayModalCell.sessions.map((sess) => (
                  <button
                    key={sess.instanceId}
                    type="button"
                    style={{
                      backgroundColor: sess.schedule.bgColor,
                      color: sess.schedule.textColor,
                    }}
                    onClick={() => {
                      setDayModalCell(null);
                      setSelectedSession(sess);
                    }}
                    className="w-full p-3 rounded-[10px] flex items-center justify-between text-left font-bold text-sm cursor-pointer hover:brightness-95"
                  >
                    <span className={sess.isCancelled ? 'line-through opacity-70' : ''}>
                      {sess.schedule.startTime}–{sess.schedule.endTime} ·{' '}
                      {sess.schedule.className}
                    </span>
                    {sess.isCancelled && (
                      <span className="text-[11px] bg-white/85 text-[#B02525] px-2 py-0.5 rounded">
                        Nghỉ
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== NGĂN KÉO: THÊM / SỬA LỊCH DẠY ==================== */}
        {isDrawerOpen && !isStudentView && (
          <div
            className="fixed inset-0 z-50 bg-[#3B2A35]/35 flex items-end md:items-stretch justify-center md:justify-end animate-in fade-in duration-200"
            onClick={() => !isSavingSchedule && setIsDrawerOpen(false)}
          >
            <div
              className="w-full md:w-[min(480px,90vw)] lg:w-[480px] max-h-[92dvh] md:max-h-none md:h-full bg-white rounded-t-[20px] md:rounded-t-none md:rounded-l-[16px] shadow-[-12px_0_40px_rgba(59,42,53,0.18)] flex flex-col justify-between overflow-hidden relative select-none animate-in slide-in-from-bottom md:slide-in-from-right duration-250"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
                <span className="w-10 h-1 rounded-full bg-[#E5D3DC]" />
              </div>

              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-[#F3D9E3] flex items-start justify-between flex-shrink-0">
                <div>
                  <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                    {editingSchedule ? 'Sửa lịch dạy cố định' : 'Thêm lịch dạy'}
                  </h2>
                  <p className="font-nunito text-[14px] text-[#6B5560] mt-1">
                    Tạo một lần, lặp mỗi tuần đến khi Admin xóa
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSavingSchedule}
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-[8px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFE0EB] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              <form
                onSubmit={handleSaveDrawerSchedule}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
              >
                {drawerError && (
                  <div className="p-3.5 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>{drawerError}</span>
                  </div>
                )}

                {classes.length === 0 ? (
                  <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5">
                    <p className="text-[13px] font-bold">
                      Chưa có lớp học nào trong hệ thống!
                    </p>
                    <p className="text-[12px]">
                      Vui lòng tạo lớp học ở mục Lớp học trước, sau đó quay lại đây để xếp lịch dạy cố định.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.CLASSES)}
                      className="h-9 px-3.5 rounded-[8px] bg-[#2F6FA8] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Đi tới mục Lớp học</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                      Lớp học *
                    </label>
                    <div className="relative">
                      <select
                        value={drawerClassId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setDrawerClassId(nextId);
                          const found = classes.find((c) => c.id === nextId);
                          if (found?.colorTheme?.bg && !editingSchedule) {
                            setDrawerColor(found.colorTheme.bg);
                          }
                        }}
                        className="w-full h-[48px] px-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white focus:ring-2 focus:ring-[#2F6FA8] outline-none appearance-none cursor-pointer pr-10"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} (Khối {cls.grade}
                            {cls.roomNumber ? ` · ${cls.roomNumber}` : ''})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="w-4 h-4 text-[#6B5560] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                )}

                {/* Các thứ trong tuần */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Các thứ trong tuần *
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    {DRAWER_WEEKDAY_OPTIONS.map((day) => {
                      const isSelected = drawerWeekdays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => handleToggleDrawerWeekday(day.key)}
                          className={`w-[44px] h-[44px] rounded-[12px] font-bold text-[13px] flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2F6FA8] text-white shadow-2xs'
                              : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF]'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Giờ bắt đầu và Giờ kết thúc */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="time"
                      value={drawerStartTime}
                      onChange={(e) => setDrawerStartTime(e.target.value)}
                      required
                      className="w-full h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                      Giờ kết thúc *
                    </label>
                    <input
                      type="time"
                      value={drawerEndTime}
                      onChange={(e) => setDrawerEndTime(e.target.value)}
                      required
                      className="w-full h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                    />
                  </div>
                </div>

                {/* Ngày bắt đầu áp dụng */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Ngày bắt đầu áp dụng *
                  </label>
                  <input
                    type="date"
                    value={drawerStartDate}
                    onChange={(e) => setDrawerStartDate(e.target.value)}
                    required
                    className="w-full h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                  />
                </div>

                {/* Màu hiển thị */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Màu hiển thị
                  </label>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {DRAWER_SWATCH_COLORS.map((swatch) => {
                        const isSelected =
                          drawerColor.toLowerCase() === swatch.toLowerCase();
                        return (
                          <button
                            key={swatch}
                            type="button"
                            onClick={() => setDrawerColor(swatch)}
                            style={{ backgroundColor: swatch }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-[#2F6FA8] scale-105'
                                : 'hover:scale-105'
                            }`}
                            title={swatch}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#1F4E79]" strokeWidth={2.5} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleRandomColor}
                      className="h-8 px-3 rounded-[10px] bg-[#E9F3FF] hover:bg-[#CFE8FF] text-[#1F4E79] text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                      <span>Ngẫu nhiên</span>
                    </button>
                  </div>
                </div>

                {/* Ghi chú tùy chọn */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={drawerNote}
                    onChange={(e) => setDrawerNote(e.target.value)}
                    placeholder="VD: Chuyên đề Nghị luận văn học..."
                    className="w-full h-[44px] px-3.5 rounded-[12px] border border-[#9C6B84] text-[13px] text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                  />
                </div>

                {/* Hộp tóm tắt quy luật lặp lại */}
                <div className="p-4 rounded-[12px] bg-[#E9F3FF] border border-[#CFE8FF] flex items-start gap-3">
                  <Info
                    className="w-5 h-5 text-[#1F4E79] flex-shrink-0 mt-0.5"
                    strokeWidth={1.75}
                  />
                  <p className="font-nunito text-[13px] font-bold text-[#1F4E79] leading-relaxed">
                    {summaryText}
                  </p>
                </div>
              </form>

              <div className="h-[80px] px-6 border-t border-[#F3D9E3] flex items-center justify-between flex-shrink-0 bg-white">
                <button
                  type="button"
                  disabled={isSavingSchedule}
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[#6B5560] hover:text-[#3B2A35] text-[14px] font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isSavingSchedule || classes.length === 0}
                  onClick={handleSaveDrawerSchedule}
                  className="h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#C2255C] disabled:opacity-50 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {isSavingSchedule && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingSchedule ? 'Cập nhật lịch dạy' : 'Lưu lịch dạy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== HỘP THOẠI XÁC NHẬN: XÓA LỊCH DẠY ==================== */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-50 bg-[#3B2A35]/35 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <div
              className="w-full md:w-[480px] max-h-[90dvh] overflow-y-auto bg-white rounded-t-[20px] md:rounded-[20px] p-5 md:p-6 shadow-[0_20px_50px_rgba(59,42,53,0.22)] border border-[#F3D9E3] flex flex-col gap-4 md:gap-5 select-none relative animate-in slide-in-from-bottom md:zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:hidden -mt-2 pb-1 flex justify-center flex-shrink-0">
                <span className="w-10 h-1 rounded-full bg-[#E5D3DC]" />
              </div>

              <div className="w-12 h-12 rounded-full bg-[#FFE3E3] flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-[#B02525]" strokeWidth={2} />
              </div>

              <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                Xóa lịch dạy {deleteTarget.className}?
              </h2>

              <div className="p-3 rounded-[12px] bg-[#CFE3FF] border-l-4 border-l-[#1F4E79] flex items-center font-nunito font-bold text-[14px] text-[#1F4E79]">
                {deleteTarget.className} · {formatShortWeekdays(deleteTarget.weekdays)} ·{' '}
                {deleteTarget.startTime}–{deleteTarget.endTime}
              </div>

              <p className="font-nunito text-[14px] text-[#3B2A35] leading-relaxed">
                Lịch này sẽ biến mất khỏi lịch học từ hôm nay trở đi. Các buổi đã dạy ở các tuần/tháng trước và dữ liệu điểm danh cũ vẫn được giữ nguyên.
              </p>

              <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-end gap-2.5 md:gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="w-full md:w-auto h-[48px] px-5 rounded-[12px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-slate-50 font-bold text-[14px] transition-colors cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteSchedule}
                  className="w-full md:w-auto h-[48px] px-6 rounded-[12px] bg-[#B02525] hover:bg-[#961F1F] disabled:opacity-60 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-white" strokeWidth={2} />
                  )}
                  <span>Xóa lịch</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
