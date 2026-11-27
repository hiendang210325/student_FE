import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Wallet,
  FileText,
  Megaphone,
  RefreshCw,
  Pencil,
  Check,
  ChevronRight,
  CalendarX,
  CalendarClock,
  X,
  Users,
  Send,
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Trash2,
  Mail,
  Play,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { classApi } from '@/features/classes/api/classApi';
import { ClassRoom } from '@/features/classes/types/class.types';
import { studentApi } from '@/features/students/api/studentApi';
import { Student } from '@/features/students/types/student.types';
import { notificationApi } from '../api/notificationApi';
import {
  AdminNotificationDetailResponse,
  AdminNotificationItem,
  ComposeType,
  HistoryFilter,
  NotificationCategory,
  NotificationReminderSettings,
  StudentNotifFilter,
  StudentNotificationItem,
} from '../types/notification.types';

const formatShortRelativeTime = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  if (isToday) return `Hôm nay ${hh}:${mm}`;
  if (isYesterday) return `Hôm qua ${hh}:${mm}`;

  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo} ${hh}:${mm}`;
};

const formatFullMetaTime = (senderName: string, iso?: string): string => {
  if (!iso) return `Từ ${senderName}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return `Từ ${senderName}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `Từ ${senderName} · ${hh}:${mm}, ${dd}/${mo}/${yyyy}`;
};

const QUICK_TEMPLATES = [
  {
    id: 'class-off',
    name: 'Nghỉ buổi học',
    description: 'Báo lớp tạm nghỉ một buổi học',
    chipBg: '#FFE0EB',
    iconColor: '#A61E4D',
    type: 'GENERAL' as ComposeType,
    defaultTitle: 'Thông báo tạm nghỉ buổi học',
    defaultBody:
      'Buổi học tuần này tạm nghỉ do cô có lịch công tác. Lịch học bù cô sẽ thông báo sớm trên nhóm và trang Lịch học. Các em nhớ ôn bài và hoàn thành bài tập nhé!',
  },
  {
    id: 'reschedule',
    name: 'Đổi lịch học',
    description: 'Báo đổi khung giờ hoặc ngày học',
    chipBg: '#DCEBFA',
    iconColor: '#1F4E79',
    type: 'SCHEDULE' as ComposeType,
    defaultTitle: 'Thông báo điều chỉnh khung giờ học tuần này',
    defaultBody:
      'Buổi học tuần này chuyển sang khung giờ 18:00–19:30 cùng ngày. Các em lưu ý sắp xếp thời gian đến lớp đúng giờ nhé!',
  },
  {
    id: 'general',
    name: 'Thông báo chung',
    description: 'Gửi dặn dò kiểm tra / tài liệu cho lớp',
    chipBg: '#EFE9ED',
    iconColor: '#6B5560',
    type: 'GENERAL' as ComposeType,
    defaultTitle: 'Dặn dò chuẩn bị buổi kiểm tra định kỳ',
    defaultBody:
      'Buổi học tới lớp sẽ làm bài viết nghị luận tổng hợp 90 phút. Các em ôn lại dàn ý các tác phẩm trọng tâm và mang đầy đủ giấy kiểm tra nhé!',
  },
] as const;

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  const isActualStudent = user?.role === 'user';
  const isStudentView =
    isActualStudent ||
    activeRole === 'student' ||
    location.search.includes('role=student');

  // ==================== TOAST THÔNG BÁO ====================
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 3300);
    },
    []
  );

  // ==================== TRẠNG THÁI HỌC SINH ====================
  const [studentNotifs, setStudentNotifs] = useState<StudentNotificationItem[]>([]);
  const [studentCounts, setStudentCounts] = useState({
    ALL: 0,
    UNREAD: 0,
    SCHEDULE: 0,
    TUITION: 0,
    OTHER: 0,
  });
  const [studentFilter, setStudentFilter] = useState<StudentNotifFilter>('ALL');
  const [selectedStudentNotifId, setSelectedStudentNotifId] = useState<string>('');
  const [mobileShowStudentDetail, setMobileShowStudentDetail] =
    useState<boolean>(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);

  // ==================== TRẠNG THÁI ADMIN ====================
  const [historyRows, setHistoryRows] = useState<AdminNotificationItem[]>([]);
  const [adminCounts, setAdminCounts] = useState({
    ALL: 0,
    MANUAL: 0,
    AUTO: 0,
  });
  const [adminPagination, setAdminPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1,
  });
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState<boolean>(false);

  const [reminderSettings, setReminderSettings] =
    useState<NotificationReminderSettings>({
      scheduleReminderOn: true,
      scheduleSendTime: '08:00',
      nextScheduleSummary: 'Đang tải cấu hình...',
      tuitionReminderOn: true,
      tuitionSendTime: '08:00',
      tuitionMonthlyDay: 5,
      tuitionRepeatDays: 7,
      unpaidInvoiceCount: 0,
      nextTuitionSummary: 'Đang tải cấu hình...',
    });
  const [triggeringType, setTriggeringType] = useState<
    'SCHEDULE' | 'TUITION' | null
  >(null);

  // Modal chỉnh giờ gửi Nhắc tự động
  const [editingReminderModal, setEditingReminderModal] = useState<
    'SCHEDULE' | 'TUITION' | null
  >(null);
  const [editScheduleTime, setEditScheduleTime] = useState<string>('08:00');
  const [editTuitionTime, setEditTuitionTime] = useState<string>('08:00');
  const [editTuitionDay, setEditTuitionDay] = useState<number>(5);
  const [editTuitionRepeat, setEditTuitionRepeat] = useState<number>(7);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Modal xem chi tiết ai Đã đọc / Chưa đọc & Xóa thông báo (Admin)
  const [adminDetailModal, setAdminDetailModal] =
    useState<AdminNotificationDetailResponse | null>(null);
  const [isLoadingDetailModal, setIsLoadingDetailModal] = useState<boolean>(false);
  const [confirmDeleteNotif, setConfirmDeleteNotif] = useState<boolean>(false);
  const [isDeletingNotif, setIsDeletingNotif] = useState<boolean>(false);

  // Ngăn kéo "Soạn thông báo"
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isComposeDrawerOpen, setIsComposeDrawerOpen] = useState<boolean>(false);
  const [composeType, setComposeType] = useState<ComposeType>('GENERAL');
  const [targetMode, setTargetMode] = useState<'CLASSES' | 'STUDENTS'>('CLASSES');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [composeTitle, setComposeTitle] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeSendEmail, setComposeSendEmail] = useState<boolean>(false);
  const [isSendingCompose, setIsSendingCompose] = useState<boolean>(false);

  // ==================== TẢI DỮ LIỆU HỌC SINH ====================
  const fetchStudentNotifications = useCallback(async () => {
    setIsLoadingStudent(true);
    try {
      const res = await notificationApi.getMyNotifications();
      if (res.data) {
        const list = res.data.items || [];
        setStudentNotifs(list);
        setStudentCounts(res.data.counts);
        setSelectedStudentNotifId((prev) => {
          if (prev && list.some((i) => i.id === prev)) return prev;
          return list[0]?.id || '';
        });
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải danh sách thông báo.', 'error');
    } finally {
      setIsLoadingStudent(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isStudentView) {
      fetchStudentNotifications();
    }
  }, [isStudentView, fetchStudentNotifications]);

  // ==================== TẢI DỮ LIỆU ADMIN ====================
  const fetchAdminRecipientsPool = useCallback(async () => {
    try {
      const [clsRes, stuRes] = await Promise.all([
        classApi.getClasses(),
        studentApi.getStudents({ page: 1, limit: 500 }),
      ]);
      setClasses(clsRes.data || []);
      const stuItems = Array.isArray(stuRes.data)
        ? stuRes.data
        : (stuRes.data as any)?.items || [];
      setAllStudents(stuItems);
    } catch {
      // Bỏ qua lỗi phụ
    }
  }, []);

  const fetchAdminHistory = useCallback(
    async (pageToLoad = currentPage, sourceFilter = activeFilter) => {
      setIsLoadingAdmin(true);
      try {
        const res = await notificationApi.getAdminNotifications({
          source: sourceFilter,
          page: pageToLoad,
          limit: 8,
        });
        if (res.data) {
          setHistoryRows(res.data.items || []);
          setAdminCounts(res.data.counts);
          setAdminPagination(res.data.pagination);
          setReminderSettings(res.data.settings);
          if (res.data.pagination.page !== pageToLoad) {
            setCurrentPage(res.data.pagination.page);
          }
        }
      } catch (err: any) {
        showToast(err?.message || 'Không thể tải lịch sử thông báo.', 'error');
      } finally {
        setIsLoadingAdmin(false);
      }
    },
    [currentPage, activeFilter, showToast]
  );

  useEffect(() => {
    if (!isStudentView) {
      fetchAdminRecipientsPool();
    }
  }, [isStudentView, fetchAdminRecipientsPool]);

  useEffect(() => {
    if (!isStudentView) {
      fetchAdminHistory(currentPage, activeFilter);
    }
  }, [isStudentView, currentPage, activeFilter, fetchAdminHistory]);

  // Tính số học sinh nhận thực tế (tự khử trùng nếu 1 học sinh học nhiều lớp được chọn)
  const recipientStudentCount = useMemo(() => {
    if (targetMode === 'STUDENTS') {
      return selectedStudentIds.length;
    }
    if (selectedClasses.length === 0) return 0;
    const uniqueIds = new Set<string>();
    for (const st of allStudents) {
      const stClasses = st.classes || (st.className ? [st.className] : []);
      if (stClasses.some((c) => selectedClasses.includes(c))) {
        uniqueIds.add(st.id);
      }
    }
    return uniqueIds.size;
  }, [targetMode, selectedClasses, selectedStudentIds, allStudents]);

  const filteredStudentsForCompose = useMemo(() => {
    const q = studentSearchTerm.trim().toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        (s.className || '').toLowerCase().includes(q)
    );
  }, [allStudents, studentSearchTerm]);

  // ==================== THAO TÁC ADMIN ====================
  const handleOpenComposeDefault = () => {
    setComposeType('GENERAL');
    setTargetMode('CLASSES');
    setSelectedClasses(classes[0] ? [classes[0].name] : []);
    setSelectedStudentIds([]);
    setComposeTitle('');
    setComposeBody('');
    setComposeSendEmail(false);
    setIsComposeDrawerOpen(true);
  };

  const handleOpenQuickTemplate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    setComposeType(tpl.type);
    setTargetMode('CLASSES');
    setSelectedClasses(classes[0] ? [classes[0].name] : []);
    setSelectedStudentIds([]);
    setComposeTitle(tpl.defaultTitle);
    setComposeBody(tpl.defaultBody);
    setComposeSendEmail(false);
    setIsComposeDrawerOpen(true);
  };

  const handleToggleClassChip = (clsName: string) => {
    if (clsName === '__ALL__') {
      if (selectedClasses.length === classes.length) {
        setSelectedClasses([]);
      } else {
        setSelectedClasses(classes.map((c) => c.name));
      }
      return;
    }

    setSelectedClasses((prev) =>
      prev.includes(clsName)
        ? prev.filter((item) => item !== clsName)
        : [...prev, clsName]
    );
  };

  const handleToggleStudentCheck = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeBody.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.', 'error');
      return;
    }
    if (targetMode === 'CLASSES' && selectedClasses.length === 0) {
      showToast('Vui lòng chọn ít nhất một lớp nhận thông báo.', 'error');
      return;
    }
    if (targetMode === 'STUDENTS' && selectedStudentIds.length === 0) {
      showToast('Vui lòng chọn ít nhất một học sinh nhận thông báo.', 'error');
      return;
    }

    setIsSendingCompose(true);
    try {
      const res = await notificationApi.createManualNotification({
        composeType,
        targetMode,
        classNames: targetMode === 'CLASSES' ? selectedClasses : [],
        studentIds: targetMode === 'STUDENTS' ? selectedStudentIds : [],
        title: composeTitle.trim(),
        body: composeBody.trim(),
        sendEmail: composeSendEmail,
      });
      showToast(res.message || 'Đã gửi thông báo thành công!');
      setIsComposeDrawerOpen(false);
      setCurrentPage(1);
      await fetchAdminHistory(1, activeFilter);
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi thông báo.', 'error');
    } finally {
      setIsSendingCompose(false);
    }
  };

  const handleToggleReminderSwitch = async (
    field: 'scheduleReminderOn' | 'tuitionReminderOn'
  ) => {
    const nextVal = !reminderSettings[field];
    setReminderSettings((prev) => ({ ...prev, [field]: nextVal }));
    try {
      const res = await notificationApi.updateReminderSettings({
        [field]: nextVal,
      });
      if (res.data) setReminderSettings(res.data);
      showToast(
        nextVal ? 'Đã bật chế độ nhắc tự động.' : 'Đã tạm tắt chế độ nhắc tự động.'
      );
    } catch (err: any) {
      setReminderSettings((prev) => ({ ...prev, [field]: !nextVal }));
      showToast(err?.message || 'Không thể cập nhật cấu hình.', 'error');
    }
  };

  const handleOpenEditReminderModal = (type: 'SCHEDULE' | 'TUITION') => {
    setEditScheduleTime(reminderSettings.scheduleSendTime || '08:00');
    setEditTuitionTime(reminderSettings.tuitionSendTime || '08:00');
    setEditTuitionDay(reminderSettings.tuitionMonthlyDay || 5);
    setEditTuitionRepeat(reminderSettings.tuitionRepeatDays || 7);
    setEditingReminderModal(type);
  };

  const handleSaveReminderSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await notificationApi.updateReminderSettings({
        scheduleSendTime: editScheduleTime,
        tuitionSendTime: editTuitionTime,
        tuitionMonthlyDay: editTuitionDay,
        tuitionRepeatDays: editTuitionRepeat,
      });
      if (res.data) setReminderSettings(res.data);
      setEditingReminderModal(null);
      showToast('Đã lưu cài đặt giờ gửi Nhắc tự động!');
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu cài đặt giờ gửi.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTriggerReminderNow = async (type: 'SCHEDULE' | 'TUITION') => {
    setTriggeringType(type);
    try {
      const res = await notificationApi.triggerReminderNow(type);
      showToast(res.message || 'Đã phát thông báo nhắc thành công!');
      await fetchAdminHistory(1, activeFilter);
    } catch (err: any) {
      showToast(err?.message || 'Không thể phát nhắc ngay lúc này.', 'error');
    } finally {
      setTriggeringType(null);
    }
  };

  const handleOpenHistoryDetail = async (rowId: string) => {
    setIsLoadingDetailModal(true);
    setConfirmDeleteNotif(false);
    try {
      const res = await notificationApi.getAdminNotificationDetail(rowId);
      if (res.data) {
        setAdminDetailModal(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải chi tiết thông báo.', 'error');
    } finally {
      setIsLoadingDetailModal(false);
    }
  };

  const handleDeleteAdminNotification = async () => {
    if (!adminDetailModal) return;
    setIsDeletingNotif(true);
    try {
      const res = await notificationApi.deleteNotification(
        adminDetailModal.notification.id
      );
      showToast(res.message || 'Đã xóa thông báo khỏi lịch sử.');
      setAdminDetailModal(null);
      await fetchAdminHistory(currentPage, activeFilter);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa thông báo.', 'error');
    } finally {
      setIsDeletingNotif(false);
    }
  };

  // ==================== THAO TÁC HỌC SINH ====================
  const filteredStudentNotifs = useMemo(() => {
    return studentNotifs.filter((item) => {
      if (studentFilter === 'UNREAD') return item.unread;
      if (studentFilter === 'SCHEDULE') return item.category === 'SCHEDULE';
      if (studentFilter === 'TUITION') return item.category === 'TUITION';
      if (studentFilter === 'OTHER')
        return item.category === 'DOCUMENT' || item.category === 'GENERAL';
      return true;
    });
  }, [studentNotifs, studentFilter]);

  const selectedStudentNotif = useMemo(() => {
    if (filteredStudentNotifs.length === 0) return null;
    return (
      filteredStudentNotifs.find((n) => n.id === selectedStudentNotifId) ||
      filteredStudentNotifs[0]
    );
  }, [filteredStudentNotifs, selectedStudentNotifId]);

  const handleSelectStudentNotification = async (item: StudentNotificationItem) => {
    setSelectedStudentNotifId(item.id);
    setMobileShowStudentDetail(true);

    if (item.unread) {
      setStudentNotifs((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
      );
      setStudentCounts((prev) => ({
        ...prev,
        UNREAD: Math.max(0, prev.UNREAD - 1),
      }));
      await notificationApi.setReadState(item.id, true).catch(() => {});
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setStudentNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
      setStudentCounts((prev) => ({ ...prev, UNREAD: 0 }));
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
      showToast('Đã đánh dấu đọc tất cả thông báo.');
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật trạng thái.', 'error');
    }
  };

  const handleToggleSelectedUnread = async () => {
    if (!selectedStudentNotif) return;
    const nextUnread = !selectedStudentNotif.unread;
    try {
      await notificationApi.setReadState(selectedStudentNotif.id, !nextUnread);
      setStudentNotifs((prev) =>
        prev.map((n) =>
          n.id === selectedStudentNotif.id ? { ...n, unread: nextUnread } : n
        )
      );
      setStudentCounts((prev) => ({
        ...prev,
        UNREAD: Math.max(0, prev.UNREAD + (nextUnread ? 1 : -1)),
      }));
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật trạng thái đọc.', 'error');
    }
  };

  const renderCategoryIconChip = (
    category: NotificationCategory,
    sizeClass: 'w-[44px] h-[44px]' | 'w-[40px] h-[40px]' = 'w-[44px] h-[44px]'
  ) => {
    switch (category) {
      case 'SCHEDULE':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0`}
          >
            <Calendar className="w-5 h-5" strokeWidth={1.75} />
          </div>
        );
      case 'TUITION':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center flex-shrink-0`}
          >
            <Wallet className="w-5 h-5" strokeWidth={1.75} />
          </div>
        );
      case 'DOCUMENT':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0`}
          >
            <FileText className="w-5 h-5" strokeWidth={1.75} />
          </div>
        );
      default:
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#EFE9ED] text-[#6B5560] flex items-center justify-center flex-shrink-0`}
          >
            <Megaphone className="w-5 h-5" strokeWidth={1.75} />
          </div>
        );
    }
  };

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-[#B02525] text-white'
            : 'bg-[#3B2A35] text-white'
        }`}
      >
        {toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-[#FFE3E3] flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#CFE8FF] flex-shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    );
  };

  // ============================================================================
  // GIAO DIỆN VAI TRÒ HỌC SINH
  // ============================================================================
  if (isStudentView) {
    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35] relative">
        {renderToast()}

        <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-[20px] box-border select-none">
          <header className="min-h-[72px] w-full lg:w-[1136px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Thông báo
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold tracking-wide">
                  <Bell className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={1.75} />
                  <span>{studentCounts.UNREAD} chưa đọc</span>
                </span>
              </div>

              <div className="mt-1.5">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Xem thông báo mỗi ngày để không lỡ lịch học và bài tập mới nhé!
                </span>
              </div>
            </div>

            {studentCounts.UNREAD > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="w-full md:w-auto h-[44px] px-4 rounded-[12px] border border-[#2F6FA8] bg-white hover:bg-[#E9F3FF] text-[#2F6FA8] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" strokeWidth={1.75} />
                <span>Đánh dấu đã đọc tất cả</span>
              </button>
            )}
          </header>

          {isLoadingStudent ? (
            <div className="w-full lg:w-[1136px] min-h-[440px] bg-white border border-[#F3D9E3] rounded-[16px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
              <span className="text-[14px] font-semibold text-[#6B5560]">
                Đang tải hộp thư thông báo...
              </span>
            </div>
          ) : studentNotifs.length === 0 ? (
            <div className="w-full lg:w-[1136px] min-h-[440px] bg-white border border-[#F3D9E3] rounded-[16px] p-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="font-playfair text-[21px] font-bold text-[#3B2A35]">
                Hộp thư thông báo đang trống
              </h2>
              <p className="text-[14px] text-[#6B5560] max-w-[420px]">
                Khi thầy cô giao bài tập, chấm điểm, phản hồi đơn xin nghỉ hoặc gửi thông báo lớp, tin mới sẽ hiển thị ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="w-full lg:w-[1136px] grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[24px] items-start">
              {/* CỘT TRÁI (5 CỘT) */}
              <section
                className={`${
                  mobileShowStudentDetail ? 'hidden md:flex' : 'flex'
                } md:col-span-5 bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex-col overflow-hidden max-h-[780px]`}
              >
                <div className="min-h-[54px] px-3.5 py-2 border-b border-[#F3D9E3] flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
                  {(
                    [
                      { key: 'ALL', label: `Tất cả ${studentCounts.ALL}` },
                      { key: 'UNREAD', label: `Chưa đọc ${studentCounts.UNREAD}` },
                      { key: 'SCHEDULE', label: `Lịch học ${studentCounts.SCHEDULE}` },
                      { key: 'TUITION', label: `Học phí ${studentCounts.TUITION}` },
                      { key: 'OTHER', label: `Khác ${studentCounts.OTHER}` },
                    ] as const
                  ).map((chip) => {
                    const isSelected = studentFilter === chip.key;
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => setStudentFilter(chip.key)}
                        className={`h-[32px] px-2.5 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {filteredStudentNotifs.length === 0 ? (
                  <div className="p-8 text-center text-[13px] font-semibold text-[#6B5560]">
                    Không có thông báo nào trong mục này.
                  </div>
                ) : (
                  <div className="flex-1 divide-y divide-[#F3D9E3] overflow-y-auto">
                    {filteredStudentNotifs.map((item) => {
                      const isSelected = selectedStudentNotif?.id === item.id;
                      const leftBorderClass = isSelected
                        ? 'border-l-4 border-l-[#2F6FA8] bg-[#E9F3FF]'
                        : item.unread
                        ? 'border-l-4 border-l-[#F8A5C2] bg-white hover:bg-[#FFF6F9]'
                        : 'border-l-4 border-l-transparent bg-white hover:bg-[#FFF6F9]';

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectStudentNotification(item)}
                          className={`min-h-[82px] py-3 px-4 flex items-center justify-between gap-3 transition-colors cursor-pointer ${leftBorderClass}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {renderCategoryIconChip(item.category, 'w-[40px] h-[40px]')}
                            <div className="flex flex-col justify-center min-w-0 flex-1">
                              <span
                                className={`text-[14px] text-[#3B2A35] leading-snug truncate ${
                                  item.unread ? 'font-bold' : 'font-semibold'
                                }`}
                              >
                                {item.title}
                              </span>
                              <span className="text-[13px] font-medium text-[#6B5560] leading-snug mt-0.5 truncate">
                                {item.preview}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-center gap-1.5 flex-shrink-0">
                            <span className="text-[11px] font-semibold text-[#6B5560] whitespace-nowrap">
                              {formatShortRelativeTime(item.createdAt)}
                            </span>
                            {item.unread ? (
                              <span className="w-[10px] h-[10px] rounded-full bg-[#A61E4D] block" />
                            ) : (
                              <span className="w-[10px] h-[10px] block opacity-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* CỘT PHẢI (7 CỘT): CHI TIẾT THÔNG BÁO */}
              {selectedStudentNotif && (
                <section
                  className={`${
                    mobileShowStudentDetail ? 'flex' : 'hidden md:flex'
                  } md:col-span-7 bg-white border border-[#F3D9E3] rounded-[16px] p-5 lg:p-[28px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex-col justify-between gap-5`}
                >
                  <button
                    type="button"
                    onClick={() => setMobileShowStudentDetail(false)}
                    className="md:hidden h-[42px] px-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3] text-[#1F4E79] font-bold text-[13px] flex items-center gap-2 w-fit cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                    <span>Danh sách thông báo</span>
                  </button>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-bold ${
                            selectedStudentNotif.category === 'TUITION'
                              ? 'bg-[#FFE0EB] text-[#A61E4D]'
                              : selectedStudentNotif.category === 'GENERAL'
                              ? 'bg-[#EFE9ED] text-[#6B5560]'
                              : 'bg-[#DCEBFA] text-[#1F4E79]'
                          }`}
                        >
                          <span>{selectedStudentNotif.typeChipLabel}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] text-[13px] font-bold">
                          {selectedStudentNotif.source === 'AUTO' ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span>Tự động</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span>Thủ công</span>
                            </>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleSelectedUnread}
                        className="text-[13px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                      >
                        {selectedStudentNotif.unread
                          ? 'Đánh dấu đã đọc'
                          : 'Đánh dấu chưa đọc'}
                      </button>
                    </div>

                    <div>
                      <h2 className="font-playfair text-[25px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                        {selectedStudentNotif.title}
                      </h2>
                      <p className="text-[13px] font-semibold text-[#6B5560] mt-1.5">
                        {formatFullMetaTime(
                          selectedStudentNotif.senderName,
                          selectedStudentNotif.createdAt
                        )}
                      </p>
                    </div>

                    <div className="h-[1px] w-full bg-[#F3D9E3]" />

                    <p className="text-[15px] lg:text-[16px] font-medium text-[#3B2A35] leading-relaxed whitespace-pre-line">
                      {selectedStudentNotif.body}
                    </p>

                    {selectedStudentNotif.relatedItems?.length > 0 && (
                      <div className="rounded-[16px] bg-[#FFF6F9] border border-[#F3D9E3] p-5 space-y-2">
                        <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                          {selectedStudentNotif.relatedBoxTitle}
                        </h3>
                        <div className="divide-y divide-[#F3D9E3]">
                          {selectedStudentNotif.relatedItems.map((row, idx) => (
                            <div
                              key={idx}
                              className="py-2.5 flex items-center justify-between gap-4 text-[14px]"
                            >
                              <span className="font-semibold text-[#6B5560]">
                                {row.label}
                              </span>
                              {row.isStatusBadge ? (
                                row.statusTone === 'pink' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{row.statusText}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{row.statusText}</span>
                                  </span>
                                )
                              ) : (
                                <span className="font-bold text-[#3B2A35] text-right">
                                  {row.value}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(selectedStudentNotif.targetPath || '/')}
                      className="w-full sm:w-auto h-[46px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
                      <span>{selectedStudentNotif.primaryCtaLabel}</span>
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // GIAO DIỆN VAI TRÒ ADMIN (GIÁO VIÊN)
  // ============================================================================
  const startIdx =
    adminPagination.total === 0
      ? 0
      : (adminPagination.page - 1) * adminPagination.limit + 1;
  const endIdx = Math.min(
    adminPagination.total,
    adminPagination.page * adminPagination.limit
  );
  const isAllClassesSelected =
    classes.length > 0 && selectedClasses.length === classes.length;

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35] relative">
      {renderToast()}

      <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-[22px] box-border select-none">
        {/* ==================== HÀNG 1: TIÊU ĐỀ ADMIN ==================== */}
        <header className="min-h-[72px] w-full lg:w-[1136px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Thông báo
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold tracking-wide">
                {adminCounts.ALL} thông báo đã gửi
              </span>
            </div>

            <div className="mt-1.5">
              <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                Bấm vào từng dòng lịch sử để kiểm tra danh sách học sinh đã đọc nhé!
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenComposeDefault}
            className="w-full md:w-auto h-[44px] px-5 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" strokeWidth={1.75} />
            <span>Soạn thông báo</span>
          </button>
        </header>

        {/* ==================== HÀNG 2: LƯỚI 8 / 4 CỘT ==================== */}
        <div className="w-full lg:w-[1136px] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-[24px] items-start">
          {/* CỘT TRÁI (8 CỘT): LỊCH SỬ THÔNG BÁO */}
          <section className="lg:col-span-8 bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between overflow-hidden min-h-[540px]">
            <div className="min-h-[60px] px-4 lg:px-5 py-2.5 border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2.5">
              <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                Lịch sử thông báo
              </h2>

              <div className="flex items-center gap-1.5 overflow-x-auto" role="tablist">
                {(
                  [
                    { key: 'ALL', label: 'Tất cả', count: adminCounts.ALL },
                    { key: 'MANUAL', label: 'Thủ công', count: adminCounts.MANUAL },
                    { key: 'AUTO', label: 'Tự động', count: adminCounts.AUTO },
                  ] as const
                ).map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveFilter(tab.key);
                        setCurrentPage(1);
                      }}
                      className={`h-[36px] px-3 rounded-[10px] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span>{tab.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isLoadingAdmin ? (
              <div className="flex-1 py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-[#2F6FA8] animate-spin" />
                <span className="text-[13px] font-semibold text-[#6B5560]">
                  Đang tải lịch sử thông báo...
                </span>
              </div>
            ) : historyRows.length === 0 ? (
              <div className="flex-1 py-16 px-6 flex flex-col items-center justify-center text-center gap-2.5">
                <div className="w-12 h-12 rounded-full bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="font-playfair text-[19px] font-bold text-[#3B2A35]">
                  Chưa có thông báo nào trong mục này
                </div>
                <p className="text-[13px] text-[#6B5560] max-w-[380px]">
                  Bấm nút &ldquo;Soạn thông báo&rdquo; hoặc khi bạn giao bài tập, chấm điểm, duyệt đơn nghỉ, thông báo tự động sẽ được lưu tại đây.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col divide-y divide-[#F3D9E3]">
                {historyRows.map((row) => {
                  const progressPct =
                    row.totalCount > 0
                      ? Math.round((row.readCount / row.totalCount) * 100)
                      : 0;

                  return (
                    <div
                      key={row.id}
                      onClick={() => handleOpenHistoryDetail(row.id)}
                      className="min-h-[82px] px-4 lg:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white hover:bg-[#FFF6F9] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {renderCategoryIconChip(row.category, 'w-[44px] h-[44px]')}
                        <div className="flex flex-col justify-center min-w-0">
                          <span className="text-[15px] font-bold text-[#3B2A35] leading-snug truncate">
                            {row.title}
                          </span>
                          <span className="text-[13px] font-semibold text-[#6B5560] mt-0.5 truncate">
                            {row.recipientsSummary}
                            {row.emailSentCount > 0
                              ? ` · Đã gửi ${row.emailSentCount} Email`
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 lg:gap-3.5 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold whitespace-nowrap">
                          {row.source === 'AUTO' ? (
                            <>
                              <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
                              <span>Tự động</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3 h-3" strokeWidth={1.75} />
                              <span>Thủ công</span>
                            </>
                          )}
                        </span>

                        <span className="lg:w-[96px] lg:text-right text-[12px] font-semibold text-[#6B5560] whitespace-nowrap">
                          {formatShortRelativeTime(row.createdAt)}
                        </span>

                        <div className="w-[88px] flex flex-col items-end">
                          <span className="text-[12px] font-bold text-[#3B2A35] whitespace-nowrap">
                            Đã đọc {row.readCount}/{row.totalCount}
                          </span>
                          <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden mt-1.5">
                            <div
                              className="h-full rounded-full bg-[#8EC5FC]"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#6B5560]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="min-h-[54px] px-4 lg:px-5 py-2.5 border-t border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2 bg-white">
              <span className="text-[13px] font-semibold text-[#6B5560]">
                Hiển thị {startIdx}–{endIdx} trên {adminPagination.total} thông báo
              </span>

              <div className="flex items-center gap-1.5 text-[13px] font-bold">
                <button
                  type="button"
                  disabled={adminPagination.page <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#E9F3FF] disabled:opacity-40 cursor-pointer"
                >
                  ‹
                </button>
                {Array.from(
                  { length: adminPagination.totalPages },
                  (_, idx) => idx + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                      adminPagination.page === page
                        ? 'bg-[#2F6FA8] text-white'
                        : 'text-[#6B5560] hover:bg-[#E9F3FF]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={adminPagination.page >= adminPagination.totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(adminPagination.totalPages, p + 1)
                    )
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#E9F3FF] disabled:opacity-40 cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>
          </section>

          {/* CỘT PHẢI (4 CỘT): NHẮC TỰ ĐỘNG & MẪU SOẠN NHANH */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* THẺ TRÊN: NHẮC TỰ ĐỘNG */}
            <section className="bg-white border border-[#F3D9E3] rounded-[16px] p-5 shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col gap-4">
              <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                Nhắc tự động
              </h2>

              <div className="divide-y divide-[#F3D9E3] space-y-4">
                {/* Khối 1: Nhắc lịch học */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-[42px] h-[42px] rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center">
                        <Calendar className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <span className="text-[15px] font-bold text-[#3B2A35]">
                        Nhắc lịch học
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={reminderSettings.scheduleReminderOn}
                      onClick={() =>
                        handleToggleReminderSwitch('scheduleReminderOn')
                      }
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-[13px] font-bold text-[#3B2A35]">
                        {reminderSettings.scheduleReminderOn ? 'Bật' : 'Tắt'}
                      </span>
                      <span
                        className={`w-[40px] h-[22px] rounded-full p-0.5 flex items-center transition-colors ${
                          reminderSettings.scheduleReminderOn
                            ? 'bg-[#2F6FA8] justify-end'
                            : 'bg-[#EFE9ED] justify-start'
                        }`}
                      >
                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                      </span>
                    </button>
                  </div>

                  <p className="text-[12px] font-medium text-[#6B5560]">
                    Tự động gửi lúc <strong>{reminderSettings.scheduleSendTime}</strong> vào ngày có buổi học của từng lớp.
                  </p>

                  <div className="rounded-[12px] bg-[#E9F3FF] px-3 py-2 text-[12px] font-bold text-[#1F4E79]">
                    {reminderSettings.nextScheduleSummary}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      disabled={triggeringType === 'SCHEDULE'}
                      onClick={() => handleTriggerReminderNow('SCHEDULE')}
                      className="h-[34px] px-3 rounded-[9px] bg-[#E9F3FF] hover:bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {triggeringType === 'SCHEDULE' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>Gửi nhắc ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditReminderModal('SCHEDULE')}
                      className="text-[12px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                    >
                      Sửa giờ gửi
                    </button>
                  </div>
                </div>

                {/* Khối 2: Nhắc học phí */}
                <div className="pt-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-[42px] h-[42px] rounded-[12px] bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
                        <Wallet className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <span className="text-[15px] font-bold text-[#3B2A35]">
                        Nhắc học phí
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={reminderSettings.tuitionReminderOn}
                      onClick={() =>
                        handleToggleReminderSwitch('tuitionReminderOn')
                      }
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-[13px] font-bold text-[#3B2A35]">
                        {reminderSettings.tuitionReminderOn ? 'Bật' : 'Tắt'}
                      </span>
                      <span
                        className={`w-[40px] h-[22px] rounded-full p-0.5 flex items-center transition-colors ${
                          reminderSettings.tuitionReminderOn
                            ? 'bg-[#2F6FA8] justify-end'
                            : 'bg-[#EFE9ED] justify-start'
                        }`}
                      >
                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                      </span>
                    </button>
                  </div>

                  <p className="text-[12px] font-medium text-[#6B5560]">
                    Gửi ngày <strong>{reminderSettings.tuitionMonthlyDay}</strong> hàng tháng lúc{' '}
                    <strong>{reminderSettings.tuitionSendTime}</strong>, nhắc lại mỗi{' '}
                    <strong>{reminderSettings.tuitionRepeatDays}</strong> ngày nếu chưa đóng.
                  </p>

                  <div className="rounded-[12px] bg-[#E9F3FF] px-3 py-2 text-[12px] font-bold text-[#1F4E79]">
                    {reminderSettings.nextTuitionSummary}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      disabled={triggeringType === 'TUITION'}
                      onClick={() => handleTriggerReminderNow('TUITION')}
                      className="h-[34px] px-3 rounded-[9px] bg-[#FFE0EB] hover:bg-[#F8A5C2]/50 text-[#A61E4D] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {triggeringType === 'TUITION' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>Gửi nhắc ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditReminderModal('TUITION')}
                      className="text-[12px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                    >
                      Sửa lịch nhắc
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* THẺ DƯỚI: SOẠN NHANH THEO MẪU */}
            <section className="bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] overflow-hidden">
              <div className="h-[54px] px-5 border-b border-[#F3D9E3] flex items-center">
                <h2 className="font-playfair text-[19px] font-bold text-[#3B2A35]">
                  Soạn nhanh theo mẫu
                </h2>
              </div>

              <div className="divide-y divide-[#F3D9E3]">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleOpenQuickTemplate(tpl)}
                    className="w-full px-5 py-3.5 flex items-center justify-between gap-3 bg-white hover:bg-[#FFF6F9] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ backgroundColor: tpl.chipBg, color: tpl.iconColor }}
                        className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                      >
                        {tpl.id === 'class-off' && (
                          <CalendarX className="w-5 h-5" strokeWidth={1.75} />
                        )}
                        {tpl.id === 'reschedule' && (
                          <CalendarClock className="w-5 h-5" strokeWidth={1.75} />
                        )}
                        {tpl.id === 'general' && (
                          <Megaphone className="w-5 h-5" strokeWidth={1.75} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-[#3B2A35] truncate">
                          {tpl.name}
                        </div>
                        <div className="text-[12px] font-semibold text-[#6B5560] truncate">
                          {tpl.description}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#3B2A35] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ==================== MODAL SỬA GIỜ GỬI NHẮC TỰ ĐỘNG ==================== */}
      {editingReminderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B2A35]/35 p-4"
          onClick={() => !isSavingSettings && setEditingReminderModal(null)}
        >
          <form
            onSubmit={handleSaveReminderSettings}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] bg-white rounded-[18px] p-6 border border-[#F3D9E3] shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                {editingReminderModal === 'SCHEDULE'
                  ? 'Cài đặt giờ Nhắc lịch học'
                  : 'Cài đặt lịch Nhắc học phí'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReminderModal(null)}
                className="w-8 h-8 rounded-[8px] hover:bg-[#FFF6F9] flex items-center justify-center text-[#6B5560] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editingReminderModal === 'SCHEDULE' ? (
              <div>
                <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                  Giờ phát nhắc tự động trong ngày có buổi học
                </label>
                <input
                  type="time"
                  value={editScheduleTime}
                  onChange={(e) => setEditScheduleTime(e.target.value)}
                  className="w-full h-[46px] px-4 rounded-[12px] border border-[#9C6B84] text-[15px] font-bold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#3B2A35] mb-1">
                    Ngày bắt đầu nhắc hàng tháng (1–28)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={editTuitionDay}
                    onChange={(e) =>
                      setEditTuitionDay(
                        Math.min(28, Math.max(1, Number(e.target.value) || 5))
                      )
                    }
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-bold text-[#3B2A35]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#3B2A35] mb-1">
                    Chu kỳ nhắc lại nếu chưa đóng (số ngày)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={editTuitionRepeat}
                    onChange={(e) =>
                      setEditTuitionRepeat(
                        Math.min(30, Math.max(1, Number(e.target.value) || 7))
                      )
                    }
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-bold text-[#3B2A35]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#3B2A35] mb-1">
                    Giờ gửi trong ngày
                  </label>
                  <input
                    type="time"
                    value={editTuitionTime}
                    onChange={(e) => setEditTuitionTime(e.target.value)}
                    className="w-full h-[44px] px-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-bold text-[#3B2A35]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingReminderModal(null)}
                className="h-[40px] px-4 rounded-[10px] bg-[#EFE9ED] text-[#3B2A35] text-[13px] font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="h-[40px] px-5 rounded-[10px] bg-[#2F6FA8] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Lưu cài đặt</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CHI TIẾT ĐÃ ĐỌC / CHƯA ĐỌC & XÓA THÔNG BÁO ==================== */}
      {(isLoadingDetailModal || adminDetailModal) && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#3B2A35]/35 p-0 md:p-4"
          onClick={() => {
            if (!isDeletingNotif) {
              setAdminDetailModal(null);
              setIsLoadingDetailModal(false);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full md:w-[640px] max-h-[90dvh] bg-white rounded-t-[20px] md:rounded-[20px] p-6 border border-[#F3D9E3] shadow-xl flex flex-col gap-4 overflow-hidden"
          >
            {isLoadingDetailModal || !adminDetailModal ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-[#2F6FA8] animate-spin" />
                <span className="text-[13px] text-[#6B5560]">
                  Đang tải danh sách học sinh đã đọc...
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-playfair text-[21px] font-bold text-[#3B2A35]">
                      {adminDetailModal.notification.title}
                    </h3>
                    <p className="text-[12px] font-semibold text-[#6B5560] mt-0.5">
                      {formatFullMetaTime(
                        adminDetailModal.notification.senderName,
                        adminDetailModal.notification.createdAt
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminDetailModal(null)}
                    className="w-8 h-8 rounded-[10px] hover:bg-[#FFF6F9] flex items-center justify-center text-[#6B5560] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3] text-[14px] text-[#3B2A35] leading-relaxed whitespace-pre-line">
                  {adminDetailModal.notification.body}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
                  {/* Danh sách Đã đọc */}
                  <div className="border border-[#CFE8FF] bg-[#F7FBFF] rounded-[12px] p-3 flex flex-col overflow-hidden max-h-[240px]">
                    <div className="text-[12px] font-bold text-[#1F4E79] mb-2">
                      Đã đọc ({adminDetailModal.readStudents.length})
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 text-[12px]">
                      {adminDetailModal.readStudents.length === 0 ? (
                        <span className="text-[#6B5560] italic">
                          Chưa có học sinh nào mở đọc.
                        </span>
                      ) : (
                        adminDetailModal.readStudents.map((st) => (
                          <div
                            key={st.id}
                            className="px-2.5 py-1.5 rounded-[8px] bg-white border border-[#E9F3FF] flex items-center justify-between gap-2"
                          >
                            <span className="font-bold text-[#3B2A35] truncate">
                              {st.fullName}
                            </span>
                            <span className="text-[11px] text-[#1F4E79] font-semibold flex-shrink-0">
                              {st.className}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Danh sách Chưa đọc */}
                  <div className="border border-[#F3D9E3] bg-[#FFF9FB] rounded-[12px] p-3 flex flex-col overflow-hidden max-h-[240px]">
                    <div className="text-[12px] font-bold text-[#A61E4D] mb-2">
                      Chưa đọc ({adminDetailModal.unreadStudents.length})
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 text-[12px]">
                      {adminDetailModal.unreadStudents.length === 0 ? (
                        <span className="text-[#1F4E79] font-semibold">
                          Tất cả học sinh đều đã đọc!
                        </span>
                      ) : (
                        adminDetailModal.unreadStudents.map((st) => (
                          <div
                            key={st.id}
                            className="px-2.5 py-1.5 rounded-[8px] bg-white border border-[#F3D9E3] flex items-center justify-between gap-2"
                          >
                            <span className="font-bold text-[#3B2A35] truncate">
                              {st.fullName}
                            </span>
                            <span className="text-[11px] text-[#6B5560] font-semibold flex-shrink-0">
                              {st.className}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F3D9E3] flex items-center justify-between gap-2">
                  {confirmDeleteNotif ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isDeletingNotif}
                        onClick={handleDeleteAdminNotification}
                        className="h-[38px] px-3.5 rounded-[10px] bg-[#B02525] text-white text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {isDeletingNotif && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        <span>Xác nhận xóa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteNotif(false)}
                        className="h-[38px] px-3 rounded-[10px] bg-[#EFE9ED] text-[#3B2A35] text-[12px] font-bold cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteNotif(true)}
                      className="h-[40px] px-3.5 rounded-[10px] text-[#B02525] hover:bg-[#FFE3E3] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa thông báo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setAdminDetailModal(null)}
                    className="h-[40px] px-5 rounded-[10px] bg-[#2F6FA8] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== NGĂN KÉO SOẠN THÔNG BÁO ==================== */}
      {isComposeDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center md:justify-end bg-[#3B2A35]/35"
          onClick={() => !isSendingCompose && setIsComposeDrawerOpen(false)}
        >
          <aside
            className="w-full md:w-[min(540px,92vw)] max-h-[92dvh] md:max-h-none md:h-full bg-white rounded-t-[20px] md:rounded-t-none md:rounded-l-[16px] shadow-[-16px_0_40px_rgba(59,42,53,0.16)] flex flex-col justify-between overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-4 border-b border-[#F3D9E3] flex items-start justify-between gap-4">
              <div>
                <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                  Soạn thông báo
                </h2>
                <p className="text-[13px] font-medium text-[#6B5560] mt-0.5">
                  Học sinh nhận được ngay trên cổng Thông báo của lớp
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeDrawerOpen(false)}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#6B5560] hover:bg-[#FFF6F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="compose-notification-form"
              onSubmit={handleSendNotification}
              className="flex-1 px-6 py-4 overflow-y-auto space-y-4"
            >
              <div>
                <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                  Loại thông báo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'GENERAL', label: 'Thông báo chung' },
                      { key: 'SCHEDULE', label: 'Nhắc lịch học' },
                      { key: 'TUITION', label: 'Nhắc học phí' },
                    ] as const
                  ).map((item) => {
                    const isSelected = composeType === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setComposeType(item.key)}
                        className={`h-[42px] px-2.5 rounded-[11px] text-[12px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.2} />}
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chế độ chọn người nhận: Theo Lớp hoặc Đích danh Học sinh */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-bold text-[#3B2A35]">
                    Gửi tới đối tượng
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetMode('CLASSES')}
                      className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold cursor-pointer ${
                        targetMode === 'CLASSES'
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-[#FFF6F9] text-[#6B5560]'
                      }`}
                    >
                      Theo lớp học
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetMode('STUDENTS')}
                      className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold cursor-pointer ${
                        targetMode === 'STUDENTS'
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-[#FFF6F9] text-[#6B5560]'
                      }`}
                    >
                      Chọn lẻ học sinh
                    </button>
                  </div>
                </div>

                {targetMode === 'CLASSES' ? (
                  classes.length === 0 ? (
                    <div className="p-3 rounded-[12px] bg-[#FFF6F9] text-[13px] text-[#6B5560]">
                      Chưa có lớp học nào. Vui lòng tạo lớp học trước.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 rounded-[12px] border border-[#F3D9E3] bg-[#FFF9FB]">
                      <button
                        type="button"
                        onClick={() => handleToggleClassChip('__ALL__')}
                        className={`h-[34px] px-3 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                          isAllClassesSelected
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#E9F3FF] text-[#1F4E79]'
                        }`}
                      >
                        {isAllClassesSelected && <Check className="w-3.5 h-3.5" />}
                        <span>Tất cả lớp</span>
                      </button>

                      {classes.map((cls) => {
                        const checked = selectedClasses.includes(cls.name);
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => handleToggleClassChip(cls.name)}
                            className={`h-[34px] px-3 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                              checked
                                ? 'bg-[#2F6FA8] text-white'
                                : 'bg-white border border-[#E5D3DC] text-[#3B2A35]'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                            <span>
                              {cls.name} ({cls.totalStudents ?? 0})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="rounded-[12px] border border-[#F3D9E3] bg-[#FFF9FB] p-3 space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#6B5560] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Tìm tên hoặc mã học sinh..."
                        className="w-full h-[36px] pl-8 pr-3 rounded-[9px] border border-[#F3D9E3] bg-white text-[12px] font-semibold outline-none"
                      />
                    </div>
                    <div className="max-h-[150px] overflow-y-auto divide-y divide-[#F3D9E3] bg-white rounded-[9px] border border-[#F3D9E3]">
                      {filteredStudentsForCompose.map((st) => {
                        const checked = selectedStudentIds.includes(st.id);
                        return (
                          <label
                            key={st.id}
                            className="px-3 py-2 flex items-center justify-between gap-2 text-[12px] hover:bg-[#FFF6F9] cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleStudentCheck(st.id)}
                                className="w-4 h-4 accent-[#2F6FA8]"
                              />
                              <span className="font-bold text-[#3B2A35] truncate">
                                {st.fullName} ({st.studentCode})
                              </span>
                            </div>
                            <span className="text-[#6B5560] font-semibold flex-shrink-0">
                              {st.className}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 text-[#1F4E79]">
                  <Users className="w-4 h-4" strokeWidth={1.75} />
                  <span className="text-[12px] font-bold">
                    Sẽ gửi tới {recipientStudentCount} học sinh duy nhất
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="compose-title-input"
                  className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                >
                  Tiêu đề thông báo <span className="text-[#D6336C]">*</span>
                </label>
                <input
                  id="compose-title-input"
                  type="text"
                  maxLength={200}
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="VD: Thông báo lịch kiểm tra định kỳ tháng này"
                  className="w-full h-[46px] px-4 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-bold text-[#3B2A35] focus:outline-none focus:border-2 focus:border-[#2F6FA8]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="compose-body-textarea"
                    className="text-[13px] font-bold text-[#3B2A35]"
                  >
                    Nội dung thông báo <span className="text-[#D6336C]">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#6B5560]">
                    {composeBody.length}/500
                  </span>
                </div>
                <textarea
                  id="compose-body-textarea"
                  rows={5}
                  maxLength={500}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Nhập nội dung chi tiết gửi tới học sinh..."
                  className="w-full p-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-medium text-[#3B2A35] leading-relaxed resize-none focus:outline-none focus:border-2 focus:border-[#2F6FA8]"
                />
              </div>

              <label className="rounded-[12px] bg-[#E9F3FF] p-3.5 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={composeSendEmail}
                  onChange={(e) => setComposeSendEmail(e.target.checked)}
                  className="w-4 h-4 accent-[#2F6FA8]"
                />
                <div className="text-[12px] font-semibold text-[#1F4E79] leading-snug flex items-center gap-1.5">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Gửi kèm bản sao thông báo qua Email cho các học sinh có Email
                  </span>
                </div>
              </label>
            </form>

            <div className="px-6 py-3.5 border-t border-[#F3D9E3] bg-white flex items-center justify-between">
              <button
                type="button"
                disabled={isSendingCompose}
                onClick={() => setIsComposeDrawerOpen(false)}
                className="h-[46px] px-4 rounded-[12px] text-[14px] font-bold text-[#6B5560] hover:bg-[#FFF6F9] cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                form="compose-notification-form"
                disabled={isSendingCompose}
                className="h-[46px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white text-[14px] font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSendingCompose ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                )}
                <span>Gửi thông báo</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
