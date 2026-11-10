import React, { useState } from 'react';
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
} from 'lucide-react';

// Kiểu dữ liệu cấu hình một lịch học cố định hàng tuần
interface FixedSchedule {
  id: number;
  className: string;
  weekdays: string;
  timeRange: string;
  bgColor: string;
  textColor: string;
  isToday?: boolean;
}

// Kiểu dữ liệu tiết học hiển thị trên lưới thời khóa biểu
interface ScheduleSession {
  id: string;
  dayIndex: number; // 0: T2, 1: T3, 2: T4, 3: T5, 4: T6, 5: T7, 6: CN
  className: string;
  timeRange: string;
  startHour: number; // Ví dụ: 15.5 tương đương 15:30
  durationHours: number; // Ví dụ: 1.5 tiếng (90 phút)
  bgColor: string;
  textColor: string;
  hasPopover?: boolean;
}

// Danh sách 6 ô lịch cố định bên cột trái
const INITIAL_FIXED_SCHEDULES: FixedSchedule[] = [
  {
    id: 1,
    className: 'Lớp 6',
    weekdays: 'Thứ 4 · 6',
    timeRange: '19:00–20:30',
    bgColor: '#C4ECF7',
    textColor: '#0E5470',
  },
  {
    id: 2,
    className: 'Lớp 7',
    weekdays: 'Thứ 3 · 5',
    timeRange: '15:30–17:00',
    bgColor: '#F2CFF0',
    textColor: '#7A1F7A',
    isToday: true,
  },
  {
    id: 3,
    className: 'Lớp 8',
    weekdays: 'Thứ 2 · 4',
    timeRange: '15:30–17:00',
    bgColor: '#DADDFB',
    textColor: '#3B3F9B',
  },
  {
    id: 4,
    className: 'Lớp 9',
    weekdays: 'Thứ 2 · 4 · 6',
    timeRange: '17:30–19:00',
    bgColor: '#FFD1E3',
    textColor: '#9C1F4B',
  },
  {
    id: 5,
    className: 'Lớp 10',
    weekdays: 'Thứ 3 · 5 · 7',
    timeRange: '18:00–19:30',
    bgColor: '#CFE3FF',
    textColor: '#1F4E79',
    isToday: true,
  },
  {
    id: 6,
    className: 'Lớp 12',
    weekdays: 'Thứ 7 · CN',
    timeRange: '08:00–10:00',
    bgColor: '#FFC9D0',
    textColor: '#A3243B',
  },
];

// Danh sách đúng 14 buổi học trong tuần theo mô hình lịch cố định
const WEEK_SESSIONS: ScheduleSession[] = [
  // Thứ 2 (T2 09)
  {
    id: 's-t2-8',
    dayIndex: 0,
    className: 'Lớp 8',
    timeRange: '15:30–17:00',
    startHour: 15.5,
    durationHours: 1.5,
    bgColor: '#DADDFB',
    textColor: '#3B3F9B',
  },
  {
    id: 's-t2-9',
    dayIndex: 0,
    className: 'Lớp 9',
    timeRange: '17:30–19:00',
    startHour: 17.5,
    durationHours: 1.5,
    bgColor: '#FFD1E3',
    textColor: '#9C1F4B',
  },

  // Thứ 3 (T3 10 - Hôm nay)
  {
    id: 's-t3-7',
    dayIndex: 1,
    className: 'Lớp 7',
    timeRange: '15:30–17:00',
    startHour: 15.5,
    durationHours: 1.5,
    bgColor: '#F2CFF0',
    textColor: '#7A1F7A',
  },
  {
    id: 's-t3-10',
    dayIndex: 1,
    className: 'Lớp 10',
    timeRange: '18:00–19:30',
    startHour: 18.0,
    durationHours: 1.5,
    bgColor: '#CFE3FF',
    textColor: '#1F4E79',
    hasPopover: true, // Có đính kèm cửa sổ popover tương tác mẫu
  },

  // Thứ 4 (T4 11)
  {
    id: 's-t4-8',
    dayIndex: 2,
    className: 'Lớp 8',
    timeRange: '15:30–17:00',
    startHour: 15.5,
    durationHours: 1.5,
    bgColor: '#DADDFB',
    textColor: '#3B3F9B',
  },
  {
    id: 's-t4-9',
    dayIndex: 2,
    className: 'Lớp 9',
    timeRange: '17:30–19:00',
    startHour: 17.5,
    durationHours: 1.5,
    bgColor: '#FFD1E3',
    textColor: '#9C1F4B',
  },
  {
    id: 's-t4-6',
    dayIndex: 2,
    className: 'Lớp 6',
    timeRange: '19:00–20:30',
    startHour: 19.0,
    durationHours: 1.5,
    bgColor: '#C4ECF7',
    textColor: '#0E5470',
  },

  // Thứ 5 (T5 12)
  {
    id: 's-t5-7',
    dayIndex: 3,
    className: 'Lớp 7',
    timeRange: '15:30–17:00',
    startHour: 15.5,
    durationHours: 1.5,
    bgColor: '#F2CFF0',
    textColor: '#7A1F7A',
  },
  {
    id: 's-t5-10',
    dayIndex: 3,
    className: 'Lớp 10',
    timeRange: '18:00–19:30',
    startHour: 18.0,
    durationHours: 1.5,
    bgColor: '#CFE3FF',
    textColor: '#1F4E79',
  },

  // Thứ 6 (T6 13)
  {
    id: 's-t6-9',
    dayIndex: 4,
    className: 'Lớp 9',
    timeRange: '17:30–19:00',
    startHour: 17.5,
    durationHours: 1.5,
    bgColor: '#FFD1E3',
    textColor: '#9C1F4B',
  },
  {
    id: 's-t6-6',
    dayIndex: 4,
    className: 'Lớp 6',
    timeRange: '19:00–20:30',
    startHour: 19.0,
    durationHours: 1.5,
    bgColor: '#C4ECF7',
    textColor: '#0E5470',
  },

  // Thứ 7 (T7 14)
  {
    id: 's-t7-12',
    dayIndex: 5,
    className: 'Lớp 12',
    timeRange: '08:00–10:00',
    startHour: 8.0,
    durationHours: 2.0,
    bgColor: '#FFC9D0',
    textColor: '#A3243B',
  },
  {
    id: 's-t7-10',
    dayIndex: 5,
    className: 'Lớp 10',
    timeRange: '18:00–19:30',
    startHour: 18.0,
    durationHours: 1.5,
    bgColor: '#CFE3FF',
    textColor: '#1F4E79',
  },

  // Chủ Nhật (CN 15)
  {
    id: 's-cn-12',
    dayIndex: 6,
    className: 'Lớp 12',
    timeRange: '08:00–10:00',
    startHour: 8.0,
    durationHours: 2.0,
    bgColor: '#FFC9D0',
    textColor: '#A3243B',
  },
];

// Danh sách các ngày trong tuần hiển thị ở đầu bảng lịch
const DAYS_OF_WEEK = [
  { shortName: 'T2', dateNumber: '09', isToday: false },
  { shortName: 'T3', dateNumber: '10', isToday: true },
  { shortName: 'T4', dateNumber: '11', isToday: false },
  { shortName: 'T5', dateNumber: '12', isToday: false },
  { shortName: 'T6', dateNumber: '13', isToday: false },
  { shortName: 'T7', dateNumber: '14', isToday: false },
  { shortName: 'CN', dateNumber: '15', isToday: false },
];

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

// Cấu trúc một chip buổi dạy hiển thị trong ô lịch tháng
interface MonthSessionChip {
  time: string;
  className: string;
  label: string;
  bgColor: string;
  textColor: string;
}

// Cấu trúc dữ liệu cho một ô ngày trong bảng lịch tháng (42 ô: 26/10 -> 06/12)
interface MonthDayCell {
  id: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  chips: MonthSessionChip[];
}

// Định nghĩa mẫu chip của từng lớp theo đúng màu sắc và giờ học quy định
const CHIP_LOP_8: MonthSessionChip = {
  time: '15:30',
  className: 'Lớp 8',
  label: '15:30 Lớp 8',
  bgColor: '#DADDFB',
  textColor: '#3B3F9B',
};

const CHIP_LOP_9: MonthSessionChip = {
  time: '17:30',
  className: 'Lớp 9',
  label: '17:30 Lớp 9',
  bgColor: '#FFD1E3',
  textColor: '#9C1F4B',
};

const CHIP_LOP_7: MonthSessionChip = {
  time: '15:30',
  className: 'Lớp 7',
  label: '15:30 Lớp 7',
  bgColor: '#F2CFF0',
  textColor: '#7A1F7A',
};

const CHIP_LOP_10: MonthSessionChip = {
  time: '18:00',
  className: 'Lớp 10',
  label: '18:00 Lớp 10',
  bgColor: '#CFE3FF',
  textColor: '#1F4E79',
};

const CHIP_LOP_6: MonthSessionChip = {
  time: '19:00',
  className: 'Lớp 6',
  label: '19:00 Lớp 6',
  bgColor: '#C4ECF7',
  textColor: '#0E5470',
};

const CHIP_LOP_12: MonthSessionChip = {
  time: '08:00',
  className: 'Lớp 12',
  label: '08:00 Lớp 12',
  bgColor: '#FFC9D0',
  textColor: '#A3243B',
};

// Danh sách các chip theo ngày trong tuần theo quy luật từ ngày 02/11 trở đi
const WEEKLY_CHIPS: MonthSessionChip[][] = [
  // 0: Thứ 2
  [CHIP_LOP_8, CHIP_LOP_9],
  // 1: Thứ 3
  [CHIP_LOP_7, CHIP_LOP_10],
  // 2: Thứ 4
  [CHIP_LOP_8, CHIP_LOP_9, CHIP_LOP_6],
  // 3: Thứ 5
  [CHIP_LOP_7, CHIP_LOP_10],
  // 4: Thứ 6
  [CHIP_LOP_9, CHIP_LOP_6],
  // 5: Thứ 7
  [CHIP_LOP_12, CHIP_LOP_10],
  // 6: Chủ Nhật
  [CHIP_LOP_12],
];

// Danh sách 42 ô ngày (6 hàng tuần × 7 ngày: 26/10 -> 06/12)
const MONTH_DAY_CELLS: MonthDayCell[] = [
  // Tuần 1: 26/10 đến 01/11 (Các ngày ngoài tháng 11 có độ mờ thấp, không có chip)
  { id: 'm-26-10', dayNumber: 26, isCurrentMonth: false, chips: [] },
  { id: 'm-27-10', dayNumber: 27, isCurrentMonth: false, chips: [] },
  { id: 'm-28-10', dayNumber: 28, isCurrentMonth: false, chips: [] },
  { id: 'm-29-10', dayNumber: 29, isCurrentMonth: false, chips: [] },
  { id: 'm-30-10', dayNumber: 30, isCurrentMonth: false, chips: [] },
  { id: 'm-31-10', dayNumber: 31, isCurrentMonth: false, chips: [] },
  { id: 'm-01-11', dayNumber: 1, isCurrentMonth: true, chips: [] },

  // Tuần 2: 02/11 đến 08/11 (Bắt đầu áp dụng lịch cố định hàng tuần)
  { id: 'm-02-11', dayNumber: 2, isCurrentMonth: true, chips: WEEKLY_CHIPS[0] },
  { id: 'm-03-11', dayNumber: 3, isCurrentMonth: true, chips: WEEKLY_CHIPS[1] },
  { id: 'm-04-11', dayNumber: 4, isCurrentMonth: true, chips: WEEKLY_CHIPS[2] },
  { id: 'm-05-11', dayNumber: 5, isCurrentMonth: true, chips: WEEKLY_CHIPS[3] },
  { id: 'm-06-11', dayNumber: 6, isCurrentMonth: true, chips: WEEKLY_CHIPS[4] },
  { id: 'm-07-11', dayNumber: 7, isCurrentMonth: true, chips: WEEKLY_CHIPS[5] },
  { id: 'm-08-11', dayNumber: 8, isCurrentMonth: true, chips: WEEKLY_CHIPS[6] },

  // Tuần 3: 09/11 đến 15/11 (Tuần hiện tại có ngày 10 là Hôm nay)
  { id: 'm-09-11', dayNumber: 9, isCurrentMonth: true, chips: WEEKLY_CHIPS[0] },
  { id: 'm-10-11', dayNumber: 10, isCurrentMonth: true, isToday: true, chips: WEEKLY_CHIPS[1] },
  { id: 'm-11-11', dayNumber: 11, isCurrentMonth: true, chips: WEEKLY_CHIPS[2] },
  { id: 'm-12-11', dayNumber: 12, isCurrentMonth: true, chips: WEEKLY_CHIPS[3] },
  { id: 'm-13-11', dayNumber: 13, isCurrentMonth: true, chips: WEEKLY_CHIPS[4] },
  { id: 'm-14-11', dayNumber: 14, isCurrentMonth: true, chips: WEEKLY_CHIPS[5] },
  { id: 'm-15-11', dayNumber: 15, isCurrentMonth: true, chips: WEEKLY_CHIPS[6] },

  // Tuần 4: 16/11 đến 22/11
  { id: 'm-16-11', dayNumber: 16, isCurrentMonth: true, chips: WEEKLY_CHIPS[0] },
  { id: 'm-17-11', dayNumber: 17, isCurrentMonth: true, chips: WEEKLY_CHIPS[1] },
  { id: 'm-18-11', dayNumber: 18, isCurrentMonth: true, chips: WEEKLY_CHIPS[2] },
  { id: 'm-19-11', dayNumber: 19, isCurrentMonth: true, chips: WEEKLY_CHIPS[3] },
  { id: 'm-20-11', dayNumber: 20, isCurrentMonth: true, chips: WEEKLY_CHIPS[4] },
  { id: 'm-21-11', dayNumber: 21, isCurrentMonth: true, chips: WEEKLY_CHIPS[5] },
  { id: 'm-22-11', dayNumber: 22, isCurrentMonth: true, chips: WEEKLY_CHIPS[6] },

  // Tuần 5: 23/11 đến 29/11
  { id: 'm-23-11', dayNumber: 23, isCurrentMonth: true, chips: WEEKLY_CHIPS[0] },
  { id: 'm-24-11', dayNumber: 24, isCurrentMonth: true, chips: WEEKLY_CHIPS[1] },
  { id: 'm-25-11', dayNumber: 25, isCurrentMonth: true, chips: WEEKLY_CHIPS[2] },
  { id: 'm-26-11', dayNumber: 26, isCurrentMonth: true, chips: WEEKLY_CHIPS[3] },
  { id: 'm-27-11', dayNumber: 27, isCurrentMonth: true, chips: WEEKLY_CHIPS[4] },
  { id: 'm-28-11', dayNumber: 28, isCurrentMonth: true, chips: WEEKLY_CHIPS[5] },
  { id: 'm-29-11', dayNumber: 29, isCurrentMonth: true, chips: WEEKLY_CHIPS[6] },

  // Tuần 6: 30/11 đến 06/12 (Ngày 30/11 trong tháng 11; từ 01/12 đến 06/12 ngoài tháng)
  { id: 'm-30-11', dayNumber: 30, isCurrentMonth: true, chips: WEEKLY_CHIPS[0] },
  { id: 'm-01-12', dayNumber: 1, isCurrentMonth: false, chips: [] },
  { id: 'm-02-12', dayNumber: 2, isCurrentMonth: false, chips: [] },
  { id: 'm-03-12', dayNumber: 3, isCurrentMonth: false, chips: [] },
  { id: 'm-04-12', dayNumber: 4, isCurrentMonth: false, chips: [] },
  { id: 'm-05-12', dayNumber: 5, isCurrentMonth: false, chips: [] },
  { id: 'm-06-12', dayNumber: 6, isCurrentMonth: false, chips: [] },
];

// Các tùy chọn thứ trong tuần cho Side Drawer Thêm lịch dạy
const DRAWER_WEEKDAY_OPTIONS = [
  { key: 'T2', label: 'T2', fullName: 'Thứ 2' },
  { key: 'T3', label: 'T3', fullName: 'Thứ 3' },
  { key: 'T4', label: 'T4', fullName: 'Thứ 4' },
  { key: 'T5', label: 'T5', fullName: 'Thứ 5' },
  { key: 'T6', label: 'T6', fullName: 'Thứ 6' },
  { key: 'T7', label: 'T7', fullName: 'Thứ 7' },
  { key: 'CN', label: 'CN', fullName: 'Chủ Nhật' },
];

// 6 ô màu hình tròn chuẩn 32px cho Side Drawer
const DRAWER_SWATCH_COLORS = [
  '#C4ECF7',
  '#F2CFF0',
  '#DADDFB',
  '#FFD1E3',
  '#CFE3FF',
  '#FFC9D0',
];

export const SchedulePage: React.FC = () => {
  // Trạng thái chế độ xem Tuần hoặc Tháng (mặc định là Tháng theo yêu cầu)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  // Trạng thái hiển thị Popover nhỏ đính kèm vào Lớp 10
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // Trạng thái mở Side Drawer Thêm lịch dạy
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Trạng thái mở Hộp thoại xác nhận Xóa lịch dạy (mặc định đóng, chỉ mở khi bấm nút Xóa lịch)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Đối tượng lịch đang được chọn để xóa
  const [deleteTarget, setDeleteTarget] = useState({
    className: 'Lớp 10',
    summary: 'Lớp 10 · Thứ 3, 5, 7 · 18:00–19:30',
  });
  // Trạng thái mở menu ba chấm của ô lịch cố định
  const [activeTileMenuId, setActiveTileMenuId] = useState<number | null>(null);
  // Thông báo phản hồi Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Biểu mẫu Side Drawer Thêm lịch dạy
  const [drawerClass, setDrawerClass] = useState('Lớp 10');
  const [drawerWeekdays, setDrawerWeekdays] = useState<string[]>(['T3', 'T5', 'T7']);
  const [drawerStartTime, setDrawerStartTime] = useState('18:00');
  const [drawerEndTime, setDrawerEndTime] = useState('19:30');
  const [drawerStartDate, setDrawerStartDate] = useState('10/11/2026');
  const [drawerColor, setDrawerColor] = useState('#CFE3FF');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chiều cao cho mỗi giờ học trên trục lịch (tính bằng pixel)
  const HOUR_HEIGHT = 48;
  const START_HOUR = 7; // Bắt đầu từ 07:00

  // Bật/tắt chọn thứ trong tuần trong Side Drawer
  const handleToggleDrawerWeekday = (key: string) => {
    if (drawerWeekdays.includes(key)) {
      if (drawerWeekdays.length > 1) {
        setDrawerWeekdays(drawerWeekdays.filter((d) => d !== key));
      } else {
        showToast('Vui lòng chọn ít nhất một thứ trong tuần');
      }
    } else {
      setDrawerWeekdays([...drawerWeekdays, key]);
    }
  };

  // Chọn màu ngẫu nhiên từ bảng màu
  const handleRandomColor = () => {
    const remaining = DRAWER_SWATCH_COLORS.filter((c) => c !== drawerColor);
    const randomIndex = Math.floor(Math.random() * remaining.length);
    setDrawerColor(remaining[randomIndex]);
    showToast('Đã chọn màu ngẫu nhiên');
  };

  // Định dạng danh sách thứ hiển thị trong hộp tóm tắt
  const formattedWeekdays = DRAWER_WEEKDAY_OPTIONS
    .filter((d) => drawerWeekdays.includes(d.key))
    .map((d) => d.fullName)
    .join(', ');

  // Câu tóm tắt quy luật lặp lại của lịch dạy
  const summaryText = `${drawerClass} · ${formattedWeekdays || 'Thứ 3, Thứ 5, Thứ 7'} · ${drawerStartTime}–${drawerEndTime} · lặp mỗi tuần từ ${drawerStartDate} cho đến khi Admin xóa lịch.`;

  // Xử lý lưu lịch dạy từ Side Drawer
  const handleSaveDrawerSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDrawerOpen(false);
    showToast(`Đã lưu lịch dạy cố định cho ${drawerClass} (${drawerStartTime}–${drawerEndTime})!`);
  };

  // Xử lý xác nhận xóa lịch dạy
  const handleConfirmDeleteSchedule = () => {
    setIsDeleteDialogOpen(false);
    showToast(`Đã xóa lịch dạy của ${deleteTarget.className} thành công`);
  };

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[976px]">
      {/* Khung nội dung chuẩn 1200px với padding 32px (chiều rộng nội dung đúng 1136px) */}
      <div className="w-[1200px] h-[976px] p-8 flex flex-col justify-between box-border select-none relative font-nunito">
        {/* Thông báo dạng Toast hiển thị phản hồi tức thì */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-[#CFE8FF]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ==================== HÀNG 1: HEADER (88px) ==================== */}
        <header className="h-[88px] flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col justify-center">
            {/* Tiêu đề trang và huy hiệu lịch cố định */}
            <div className="flex items-center gap-3">
              <h1 className="font-playfair text-[28px] font-bold text-[#3B2A35] leading-tight">
                Lịch học
              </h1>
              <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                6 lịch cố định · 14 buổi/tuần
              </span>
            </div>

            {/* Dòng ghi chú viết tay của giáo viên và 2 hình dán pastel */}
            <div className="flex items-center gap-3 mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Tạo lịch một lần, tuần nào cũng tự hiện đến khi xóa nhé!
                </span>
              </div>

              {/* 2 hình dán vector phẳng pastel (ngôi sao và ngòi bút nhỏ) */}
              <div className="flex items-center gap-2 pl-3">
                {/* Hình dán 1: Ngôi sao pastel #F8A5C2 */}
                <svg
                  className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                </svg>

                {/* Hình dán 2: Ngòi bút nhỏ pastel #2F6FA8 */}
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

          {/* Phía bên phải: Nút chính Thêm lịch dạy */}
          <div className="flex items-center">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="h-[44px] px-5 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2} />
              <span>Thêm lịch dạy</span>
            </button>
          </div>
        </header>

        {/* ==================== HÀNG 2: BỐ CỤC 2 CỘT (800px) ==================== */}
        <div className="w-[1136px] h-[800px] flex gap-[24px] flex-shrink-0">
          {/* ========== CỘT BÊN TRÁI (4/12 chiều rộng, 366px): 2 THẺ ========== */}
          <div className="w-[366px] h-[800px] flex flex-col justify-between flex-shrink-0">
            {/* THẺ TRÊN: THẺ THÔNG BÁO "HÔM NAY" (~180px) */}
            <div className="h-[180px] p-5 rounded-[16px] bg-[#DCEBFA] border border-[#CFE8FF] shadow-card flex flex-col justify-between flex-shrink-0">
              {/* Nhãn HÔM NAY và ngày Thứ Ba 10/11/2026 */}
              <div>
                <span className="font-nunito text-[12px] font-bold tracking-widest text-[#1F4E79] uppercase block mb-1">
                  HÔM NAY
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-playfair text-[32px] font-bold text-[#1F4E79] leading-none">
                    Thứ Ba
                  </span>
                  <span className="font-nunito text-[16px] font-semibold text-[#1F4E79]">
                    10/11/2026
                  </span>
                </div>
              </div>

              {/* Huy hiệu thông báo có 2 buổi dạy kèm biểu tượng chuông */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white text-[#1F4E79] text-[13px] font-bold shadow-2xs w-fit">
                <Bell className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                <span>Hôm nay có 2 buổi dạy</span>
              </div>

              {/* 2 dòng lịch dạy trong ngày kèm chấm tròn màu của lớp */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1F4E79]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#7A1F7A' }}
                  />
                  <span>15:30–17:00 · Lớp 7</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1F4E79]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#1F4E79' }}
                  />
                  <span>18:00–19:30 · Lớp 10</span>
                </div>
              </div>
            </div>

            {/* THẺ DƯỚI: THẺ "LỊCH CỐ ĐỊNH" (596px) */}
            <div className="h-[596px] p-5 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col justify-between flex-shrink-0">
              {/* Tiêu đề thẻ Lịch cố định */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-nunito text-[12px] font-bold tracking-widest text-[#6B5560] uppercase">
                  LỊCH CỐ ĐỊNH
                </span>
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[12px] font-bold">
                  6 lớp
                </span>
              </div>

              {/* Lưới 6 ô vuông lịch học (2 cột × 3 hàng, tỉ lệ vuông 1:1) */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {INITIAL_FIXED_SCHEDULES.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: item.bgColor,
                    }}
                    className="rounded-[16px] p-3.5 flex flex-col justify-between shadow-2xs relative select-none"
                  >
                    {/* Hàng trên: Tên lớp và nút ba chấm ⋮ */}
                    <div className="flex items-start justify-between">
                      <span
                        className="font-playfair text-[24px] font-bold leading-none"
                        style={{ color: item.textColor }}
                      >
                        {item.className}
                      </span>
                      {/* Nút ba chấm ⋮ và menu thao tác Sửa / Xóa */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTileMenuId(activeTileMenuId === item.id ? null : item.id);
                          }}
                          className="text-inherit opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer"
                          title="Tùy chọn"
                        >
                          <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
                        </button>

                        {/* Menu thao tác thả xuống khi bấm ba chấm */}
                        {activeTileMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-6 w-[120px] bg-white rounded-[10px] border border-[#F3D9E3] shadow-md py-1 z-30 animate-in fade-in zoom-in-95"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTileMenuId(null);
                                setDrawerClass(item.className);
                                setDrawerColor(item.bgColor);
                                setIsDrawerOpen(true);
                              }}
                              className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-[#1F4E79] hover:bg-[#E9F3FF] flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Sửa lịch</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTileMenuId(null);
                                setDeleteTarget({
                                  className: item.className,
                                  summary: `${item.className} · ${item.weekdays} · ${item.timeRange}`,
                                });
                                setIsDeleteDialogOpen(true);
                              }}
                              className="w-full px-3 py-1.5 text-left text-[12px] font-bold text-[#B02525] hover:bg-[#FFE3E3] flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Xóa lịch</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hàng giữa: Các ngày trong tuần và khung giờ học */}
                    <div>
                      <div
                        className="font-nunito text-[14px] font-bold leading-tight mb-1"
                        style={{ color: item.textColor }}
                      >
                        {item.weekdays}
                      </div>
                      <div className="flex items-center gap-1 text-[13px] text-[#3B2A35] font-semibold leading-tight">
                        <Clock className="w-3.5 h-3.5 text-[#3B2A35] flex-shrink-0" strokeWidth={1.75} />
                        <span>{item.timeRange}</span>
                      </div>
                    </div>

                    {/* Hàng dưới: Huy hiệu "Hôm nay" nếu lớp có lịch dạy trong ngày */}
                    <div className="h-5 flex items-center">
                      {item.isToday ? (
                        <span className="px-2 py-0.5 rounded-[6px] bg-white text-[#1F4E79] text-[11px] font-bold shadow-2xs">
                          Hôm nay
                        </span>
                      ) : (
                        <span className="text-[11px] opacity-0">Lịch thường</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========== CỘT BÊN PHẢI (8/12 chiều rộng, 746px): THẺ THỜI KHÓA BIỂU CALENDAR (800px) ========== */}
          <div className="w-[746px] h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col justify-between overflow-hidden relative flex-shrink-0">
            {/* 1. THANH CÔNG CỤ TOOLBAR (64px) */}
            <div className="h-[64px] px-6 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
              {/* Bên trái: Nút điều hướng và nhãn thời gian */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    showToast(
                      viewMode === 'month'
                        ? 'Chuyển về Tháng 10/2026'
                        : 'Chuyển về tuần trước'
                    )
                  }
                  className="w-8 h-8 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF] flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  title={viewMode === 'month' ? 'Tháng trước' : 'Tuần trước'}
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() =>
                    showToast(
                      viewMode === 'month'
                        ? 'Chuyển sang Tháng 12/2026'
                        : 'Chuyển sang tuần sau'
                    )
                  }
                  className="w-8 h-8 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF] flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  title={viewMode === 'month' ? 'Tháng sau' : 'Tuần sau'}
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() =>
                    showToast(
                      viewMode === 'month'
                        ? 'Đang ở Tháng 11/2026 (Tháng hiện tại)'
                        : 'Đang ở tuần hiện tại'
                    )
                  }
                  className="h-8 px-3 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#CFE8FF] font-nunito text-[12px] font-bold cursor-pointer transition-colors ml-1"
                >
                  Hôm nay
                </button>
                <span
                  className={`font-playfair font-bold text-[#3B2A35] ml-3 ${
                    viewMode === 'month' ? 'text-[20px]' : 'text-[18px]'
                  }`}
                >
                  {viewMode === 'month' ? 'Tháng 11/2026' : '09/11 – 15/11/2026'}
                </span>
              </div>

              {/* Bên phải: Nút chuyển đổi Tuần | Tháng với Tháng kích hoạt (#2F6FA8 nền, chữ trắng) */}
              <div className="h-9 p-1 rounded-[10px] bg-[#E9F3FF] flex items-center gap-1">
                <button
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

            {/* 2. KHUNG NỘI DUNG LỊCH (736px): CHẾ ĐỘ THÁNG HOẶC CHẾ ĐỘ TUẦN */}
            {viewMode === 'month' ? (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Hàng tiêu đề 7 ngày trong tuần: T2, T3, T4, T5, T6, T7, CN (#DCEBFA, #1F4E79, 13px semibold) */}
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

                {/* Lưới 6 hàng tuần × 7 cột ngày lấp đầy toàn bộ chiều cao thẻ (26/10 đến 06/12) */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-white overflow-hidden">
                  {MONTH_DAY_CELLS.map((cell, idx) => {
                    const isLastCol = (idx + 1) % 7 === 0;
                    const isLastRow = idx >= 35;
                    const maxChips = 3;
                    const visibleChips = cell.chips.slice(0, maxChips);
                    const remainingCount = cell.chips.length - maxChips;

                    return (
                      <div
                        key={cell.id}
                        className={`pt-1 pb-1 px-1.5 flex flex-col justify-start overflow-hidden border-[#F3D9E3] select-none ${
                          !isLastCol ? 'border-r' : ''
                        } ${!isLastRow ? 'border-b' : ''} ${
                          cell.isToday ? 'bg-[#F7FBFF]' : ''
                        }`}
                      >
                        {/* Số ngày góc trên bên trái ô (14px) */}
                        <div className="flex items-center justify-between mb-1 h-[22px] flex-shrink-0">
                          {cell.isToday ? (
                            /* Hôm nay ngày 10: Số 10 trong vòng tròn đỏ mâm xôi #D6336C, chữ trắng */
                            <div className="w-[22px] h-[22px] rounded-full bg-[#D6336C] text-white flex items-center justify-center text-[12px] font-bold shadow-2xs">
                              {cell.dayNumber}
                            </div>
                          ) : (
                            <span
                              className={`text-[14px] font-bold pl-0.5 leading-none ${
                                cell.isCurrentMonth
                                  ? 'text-[#3B2A35]'
                                  : 'text-[#6B5560] opacity-40'
                              }`}
                            >
                              {cell.dayNumber}
                            </span>
                          )}
                        </div>

                        {/* Danh sách các chip buổi dạy nhỏ của ngày (tối đa 3 chip/ô, radius 8px, 26px high) */}
                        {cell.isCurrentMonth && cell.chips.length > 0 && (
                          <div className="flex flex-col gap-[2px] overflow-hidden flex-1">
                            {visibleChips.map((chip, chipIdx) => (
                              <div
                                key={chipIdx}
                                style={{
                                  backgroundColor: chip.bgColor,
                                  color: chip.textColor,
                                  borderLeftColor: chip.textColor,
                                }}
                                onClick={() =>
                                  showToast(
                                    `Buổi dạy ${chip.label} ngày ${cell.dayNumber}/11`
                                  )
                                }
                                className="h-[26px] px-2 rounded-[8px] border-l-[3px] flex items-center text-[11px] font-bold truncate cursor-pointer hover:brightness-95 transition-all shadow-2xs flex-shrink-0"
                                title={chip.label}
                              >
                                <span className="truncate">{chip.label}</span>
                              </div>
                            ))}

                            {/* Nếu có nhiều hơn 3 buổi thì hiển thị link "+N nữa" màu #2F6FA8 */}
                            {remainingCount > 0 && (
                              <button
                                onClick={() =>
                                  showToast(
                                    `Ngày ${cell.dayNumber}/11 còn ${remainingCount} buổi dạy nữa`
                                  )
                                }
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
              /* KHUNG LƯỚI THỜI KHÓA BIỂU THEO TUẦN (736px) */
              <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Hàng tiêu đề 7 ngày trong tuần (44px) */}
              <div className="h-[44px] border-b border-[#F3D9E3] grid grid-cols-[54px_repeat(7,1fr)] bg-[#FCF8FA] flex-shrink-0">
                {/* Góc trống giao nhau với cột giờ */}
                <div className="border-r border-[#F3D9E3]" />
                {DAYS_OF_WEEK.map((day, idx) => (
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
                      /* Ngày hôm nay (T3 10): Số 10 nằm trong vòng tròn đỏ mâm xôi #D6336C */
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

              {/* Khu vực lưới các khung giờ (07:00 - 21:00) và các buổi dạy */}
              <div className="flex-1 relative overflow-hidden grid grid-cols-[54px_repeat(7,1fr)]">
                {/* Cột trục giờ bên trái */}
                <div className="border-r border-[#F3D9E3] bg-[#FCF8FA]/60 relative">
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

                {/* 7 cột ngày chứa các đường kẻ ngang và các khối buổi học */}
                {DAYS_OF_WEEK.map((day, colIdx) => (
                  <div
                    key={colIdx}
                    className={`relative border-r border-[#F3D9E3] last:border-r-0 ${
                      day.isToday ? 'bg-[#F7FBFF]' : 'bg-white'
                    }`}
                  >
                    {/* Các đường kẻ ngang phân chia khung giờ */}
                    {TIME_SLOTS.map((_, rowIdx) => (
                      <div
                        key={rowIdx}
                        style={{ top: `${rowIdx * HOUR_HEIGHT}px` }}
                        className="absolute left-0 right-0 border-b border-[#F3D9E3]/70 pointer-events-none"
                      />
                    ))}

                    {/* Render các khối buổi học rơi vào ngày này */}
                    {WEEK_SESSIONS.filter((s) => s.dayIndex === colIdx).map((session) => {
                      const topPx = (session.startHour - START_HOUR) * HOUR_HEIGHT;
                      const heightPx = session.durationHours * HOUR_HEIGHT;

                      return (
                        <div
                          key={session.id}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            backgroundColor: session.bgColor,
                            color: session.textColor,
                            borderLeftColor: session.textColor,
                          }}
                          onClick={() => {
                            if (session.hasPopover) {
                              setIsPopoverOpen(!isPopoverOpen);
                            } else {
                              showToast(`Buổi dạy ${session.className} (${session.timeRange})`);
                            }
                          }}
                          className={`absolute left-1 right-1 rounded-[10px] border-l-4 p-2 shadow-2xs cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-start select-none ${
                            session.hasPopover ? 'z-30 overflow-visible' : 'z-10 overflow-hidden'
                          }`}
                        >
                          <span
                            className="font-bold text-[13px] leading-tight block truncate"
                            style={{ color: session.textColor }}
                          >
                            {session.className}
                          </span>
                          <span className="text-[11px] leading-tight opacity-90 block mt-0.5 truncate text-[#3B2A35]">
                            {session.timeRange}
                          </span>

                          {/* ==================== CỬA SỔ POPOVER MẪU CHO LỚP 10 (T3 10) ==================== */}
                          {session.hasPopover && isPopoverOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-[calc(100%+14px)] top-[-10px] w-[260px] rounded-[14px] bg-white border border-[#F3D9E3] shadow-[0_12px_32px_rgba(59,42,53,0.16)] p-3.5 z-40 text-left select-none animate-in fade-in zoom-in-95 duration-150"
                            >
                              {/* Mũi tên tam giác chỉ sang khối Lớp 10 bên trái */}
                              <div className="absolute top-5 -left-2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white filter drop-shadow-[-2px_0_1px_rgba(59,42,53,0.08)]" />

                              {/* Đầu Popover: Tên lớp và nút đóng */}
                              <div className="flex items-center justify-between mb-1.5">
                                <h3 className="font-playfair text-[16px] font-bold text-[#3B2A35]">
                                  Lớp 10
                                </h3>
                                <button
                                  onClick={() => setIsPopoverOpen(false)}
                                  className="text-[#6B5560] hover:text-[#3B2A35] p-0.5 rounded cursor-pointer"
                                  title="Đóng"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Dòng thời gian buổi dạy */}
                              <div className="text-[13px] text-[#3B2A35] font-bold leading-tight mb-1">
                                18:00 – 19:30
                              </div>

                              {/* Dòng quy luật lặp lại hàng tuần */}
                              <div className="text-[12px] text-[#6B5560] font-medium leading-tight mb-3">
                                Lặp Thứ 3, 5, 7 hằng tuần
                              </div>

                              {/* 2 nút thao tác dưới đáy Popover */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#F3D9E3]/80">
                                {/* Nút Sửa lịch */}
                                <button
                                  onClick={() => {
                                    setIsPopoverOpen(false);
                                    setDrawerClass('Lớp 10');
                                    setDrawerWeekdays(['T3', 'T5', 'T7']);
                                    setDrawerStartTime('18:00');
                                    setDrawerEndTime('19:30');
                                    setDrawerColor('#CFE3FF');
                                    setIsDrawerOpen(true);
                                  }}
                                  className="h-7 px-3 rounded-[8px] border border-[#2F6FA8] text-[#2F6FA8] text-[12px] font-bold hover:bg-[#E9F3FF] transition-colors cursor-pointer"
                                >
                                  Sửa lịch
                                </button>

                                {/* Nút Xóa lịch */}
                                <button
                                  onClick={() => {
                                    setIsPopoverOpen(false);
                                    setDeleteTarget({
                                      className: 'Lớp 10',
                                      summary: 'Lớp 10 · Thứ 3, 5, 7 · 18:00–19:30',
                                    });
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-[#B02525] hover:underline text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#B02525]" strokeWidth={1.75} />
                                  <span>Xóa lịch</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* ==================== SIDE DRAWER: THÊM LỊCH DẠY ==================== */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#3B2A35]/35 flex justify-end animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          >
            {/* Thẻ ngăn kéo Drawer: rộng 480px, chiều cao toàn màn hình, nền trắng, bo góc trái 16px, bóng đổ mềm */}
            <div
              className="w-[480px] h-full bg-white rounded-l-[16px] shadow-[-12px_0_40px_rgba(59,42,53,0.18)] flex flex-col justify-between overflow-hidden relative select-none animate-in slide-in-from-right duration-250"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Phần đầu Drawer: Tiêu đề và nút đóng */}
              <div className="px-6 py-5 border-b border-[#F3D9E3] flex items-start justify-between flex-shrink-0">
                <div>
                  <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                    Thêm lịch dạy
                  </h2>
                  <p className="font-nunito text-[14px] text-[#6B5560] mt-1">
                    Tạo một lần, lặp mỗi tuần đến khi Admin xóa
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-[8px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFE0EB] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>

              {/* Phần thân biểu mẫu: khoảng cách 24px giữa các trường */}
              <form
                onSubmit={handleSaveDrawerSchedule}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
              >
                {/* Trường 1: Lớp (select, giá trị "Lớp 10", trạng thái focus viền 2px #2F6FA8) */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Lớp
                  </label>
                  <div className="relative">
                    <select
                      value={drawerClass}
                      onChange={(e) => setDrawerClass(e.target.value)}
                      className="w-full h-[48px] px-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white ring-2 ring-[#2F6FA8] outline-none appearance-none cursor-pointer pr-10"
                    >
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 6">Lớp 6</option>
                      <option value="Lớp 7">Lớp 7</option>
                      <option value="Lớp 8">Lớp 8</option>
                      <option value="Lớp 9">Lớp 9</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                    </select>
                    <ChevronDown
                      className="w-4 h-4 text-[#6B5560] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Trường 2: Các thứ trong tuần (hàng 7 chip 44px, chọn T3, T5, T7) */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Các thứ trong tuần
                  </label>
                  <div className="flex items-center justify-between gap-1.5">
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

                {/* Trường 3: Giờ bắt đầu (18:00) và Giờ kết thúc (19:30) cạnh nhau kèm icon đồng hồ */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                      Giờ bắt đầu
                    </label>
                    <div className="relative">
                      <Clock
                        className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="text"
                        value={drawerStartTime}
                        onChange={(e) => setDrawerStartTime(e.target.value)}
                        className="w-full h-[48px] pl-10 pr-3 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                        placeholder="18:00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                      Giờ kết thúc
                    </label>
                    <div className="relative">
                      <Clock
                        className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="text"
                        value={drawerEndTime}
                        onChange={(e) => setDrawerEndTime(e.target.value)}
                        className="w-full h-[48px] pl-10 pr-3 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                        placeholder="19:30"
                      />
                    </div>
                  </div>
                </div>

                {/* Trường 4: Ngày bắt đầu áp dụng (10/11/2026) */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Ngày bắt đầu áp dụng
                  </label>
                  <div className="relative">
                    <CalendarIcon
                      className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.75}
                    />
                    <input
                      type="text"
                      value={drawerStartDate}
                      onChange={(e) => setDrawerStartDate(e.target.value)}
                      className="w-full h-[48px] pl-10 pr-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                      placeholder="10/11/2026"
                    />
                  </div>
                </div>

                {/* Trường 5: Màu hiển thị (6 ô tròn 32px, #CFE3FF chọn với viền 2px #2F6FA8 và icon check, nút Ngẫu nhiên) */}
                <div>
                  <label className="block text-[14px] font-bold text-[#3B2A35] mb-2">
                    Màu hiển thị
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {DRAWER_SWATCH_COLORS.map((swatch) => {
                        const isSelected = drawerColor === swatch;
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

                {/* Hộp tóm tắt quy luật lặp lại (nền #E9F3FF, radius 12px, biểu tượng thông tin, chữ #1F4E79) */}
                <div className="p-4 rounded-[12px] bg-[#E9F3FF] border border-[#CFE8FF] flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#1F4E79] flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <p className="font-nunito text-[13px] font-bold text-[#1F4E79] leading-relaxed">
                    {summaryText}
                  </p>
                </div>
              </form>

              {/* Chân ngăn kéo cố định: Nút Hủy và Nút Lưu lịch dạy */}
              <div className="h-[80px] px-6 border-t border-[#F3D9E3] flex items-center justify-between flex-shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[#6B5560] hover:text-[#3B2A35] text-[14px] font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawerSchedule}
                  className="h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Lưu lịch dạy
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ==================== HỘP THOẠI XÁC NHẬN: XÓA LỊCH DẠY LỚP 10 ==================== */}
        {isDeleteDialogOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#3B2A35]/35 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            {/* Thẻ Hộp thoại: căn giữa, rộng 480px, nền trắng, bo góc 20px, đệm 24px, bóng đổ mềm */}
            <div
              className="w-[480px] bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(59,42,53,0.22)] border border-[#F3D9E3] flex flex-col gap-5 select-none relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Phía trên: Huy hiệu icon hình tròn 48px (nền #FFE3E3, biểu tượng thùng rác #B02525) */}
              <div className="w-12 h-12 rounded-full bg-[#FFE3E3] flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-[#B02525]" strokeWidth={2} />
              </div>

              {/* Tiêu đề font Playfair Display 22px */}
              <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                Xóa lịch dạy {deleteTarget.className}?
              </h2>

              {/* Hàng tóm tắt nhỏ (nền #CFE3FF, chữ #1F4E79, bo góc 12px, đệm 12px, thanh viền trái 4px #1F4E79) */}
              <div className="p-3 rounded-[12px] bg-[#CFE3FF] border-l-4 border-l-[#1F4E79] flex items-center font-nunito font-bold text-[14px] text-[#1F4E79]">
                {deleteTarget.summary}
              </div>

              {/* Nội dung thông báo font Nunito 14px #3B2A35 */}
              <p className="font-nunito text-[14px] text-[#3B2A35] leading-relaxed">
                Lịch này sẽ biến mất khỏi lịch học từ hôm nay trở đi. Các buổi đã dạy và dữ liệu điểm danh cũ vẫn được giữ. Chỉ Admin mới xóa được lịch dạy.
              </p>

              {/* Các nút bấm căn phải, chiều cao 48px */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {/* Nút Hủy (dạng text button, chữ #6B5560) */}
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="h-[48px] px-5 rounded-[12px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-slate-50 font-bold text-[14px] transition-colors cursor-pointer"
                >
                  Hủy
                </button>

                {/* Nút Xóa lịch (nền phủ #B02525, chữ trắng, icon thùng rác) */}
                <button
                  type="button"
                  onClick={handleConfirmDeleteSchedule}
                  className="h-[48px] px-6 rounded-[12px] bg-[#B02525] hover:bg-[#961F1F] text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-white" strokeWidth={2} />
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
