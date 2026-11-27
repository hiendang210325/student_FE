import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Clock,
  Check,
  X,
  ChevronRight,
  FileText,
  Lock,
  Calendar,
  Info,
  Send,
  ChevronDown,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { TileGrid } from '@/components/common/TileGrid/TileGrid';
import { classApi } from '@/features/classes/api/classApi';
import { ClassRoom } from '@/features/classes/types/class.types';
import { leaveRequestApi } from '../api/leaveRequestApi';
import {
  LeaveFilterTab,
  LeaveRequestItem,
  LeaveStatus,
  UpcomingClassSession,
} from '../types/leaveRequest.types';

const getTodayYMD = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateDMY = (ymd?: string): string => {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateShortDM = (ymd?: string): string => {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  return `${parts[2]}/${parts[1]}`;
};

const formatDateTimeVN = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${hh}:${mm}, ${dd}/${mo}/${yyyy}`;
};

const getInitials = (fullName: string): string => {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return String(fullName || 'HS')
    .slice(0, 2)
    .toUpperCase();
};

const getStatusTheme = (status: LeaveStatus) => {
  switch (status) {
    case 'PENDING':
      return {
        bg: '#FFE0EB',
        border: '#F8A5C2',
        textColor: '#A61E4D',
        label: 'Chờ duyệt',
      };
    case 'APPROVED':
      return {
        bg: '#DCEBFA',
        border: '#8EC5FC',
        textColor: '#1F4E79',
        label: 'Đã duyệt',
      };
    case 'REJECTED':
      return {
        bg: '#EFE9ED',
        border: '#D9CBD2',
        textColor: '#6B5560',
        label: 'Từ chối',
      };
  }
};

export const LeaveRequestsPage: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  // Bảo vệ vai trò: tài khoản học sinh thật luôn chỉ thấy màn hình Học sinh
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
      }, 3200);
    },
    []
  );

  // ==================== TRẠNG THÁI VAI TRÒ ADMIN ====================
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<LeaveFilterTab>('ALL');
  const [adminPage, setAdminPage] = useState<number>(1);
  const [tiles, setTiles] = useState<LeaveRequestItem[]>([]);
  const [globalPendingCount, setGlobalPendingCount] = useState<number>(0);
  const [adminCounts, setAdminCounts] = useState({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [adminPagination, setAdminPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [isLoadingAdmin, setIsLoadingAdmin] = useState<boolean>(false);
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);

  // Hộp thoại xem / duyệt / xóa đơn phía Admin
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestItem | null>(
    null
  );
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [confirmingDeleteInModal, setConfirmingDeleteInModal] =
    useState<boolean>(false);
  const [isDeletingAdminRequest, setIsDeletingAdminRequest] =
    useState<boolean>(false);

  // ==================== TRẠNG THÁI VAI TRÒ HỌC SINH ====================
  const [studentProfile, setStudentProfile] = useState<{
    id: string;
    studentCode: string;
    fullName: string;
    classes: string[];
  } | null>(null);
  const [upcomingSessionsByClass, setUpcomingSessionsByClass] = useState<
    Record<string, UpcomingClassSession[]>
  >({});
  const [studentSentList, setStudentSentList] = useState<LeaveRequestItem[]>([]);
  const [studentPendingCount, setStudentPendingCount] = useState<number>(0);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);

  const [studentClass, setStudentClass] = useState<string>('');
  const [studentLeaveDate, setStudentLeaveDate] = useState<string>(getTodayYMD());
  const [studentReason, setStudentReason] = useState<string>('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState<boolean>(false);
  const [cancellingLeaveId, setCancellingLeaveId] = useState<string | null>(null);
  const [viewingStudentItem, setViewingStudentItem] =
    useState<LeaveRequestItem | null>(null);

  // ==================== TẢI DỮ LIỆU ADMIN ====================
  const fetchClasses = useCallback(async () => {
    try {
      const res = await classApi.getClasses();
      setClasses(res.data || []);
    } catch {
      // Bỏ qua lỗi phụ
    }
  }, []);

  const fetchAdminRequests = useCallback(
    async (
      pageToLoad = adminPage,
      statusFilter = activeFilter,
      classFilter = selectedClassFilter
    ) => {
      setIsLoadingAdmin(true);
      try {
        const res = await leaveRequestApi.getAdminLeaveRequests({
          status: statusFilter,
          className: classFilter === 'all' ? undefined : classFilter,
          page: pageToLoad,
          limit: 12,
        });
        if (res.data) {
          setTiles(res.data.items || []);
          setGlobalPendingCount(res.data.globalPendingCount || 0);
          setAdminCounts(res.data.counts);
          setAdminPagination(res.data.pagination);
          if (res.data.pagination.page !== pageToLoad) {
            setAdminPage(res.data.pagination.page);
          }
        }
      } catch (err: any) {
        showToast(err?.message || 'Không thể tải danh sách đơn xin nghỉ.', 'error');
      } finally {
        setIsLoadingAdmin(false);
      }
    },
    [adminPage, activeFilter, selectedClassFilter, showToast]
  );

  useEffect(() => {
    if (!isStudentView) {
      fetchClasses();
    }
  }, [isStudentView, fetchClasses]);

  useEffect(() => {
    if (!isStudentView) {
      fetchAdminRequests(adminPage, activeFilter, selectedClassFilter);
    }
  }, [isStudentView, adminPage, activeFilter, selectedClassFilter, fetchAdminRequests]);

  // ==================== TẢI DỮ LIỆU HỌC SINH ====================
  const fetchMyRequests = useCallback(async () => {
    setIsLoadingStudent(true);
    try {
      const res = await leaveRequestApi.getMyLeaveRequests();
      if (res.data) {
        const stu = res.data.student;
        const sessionsMap = res.data.upcomingSessionsByClass || {};
        setStudentProfile(stu);
        setUpcomingSessionsByClass(sessionsMap);
        setStudentSentList(res.data.items || []);
        setStudentPendingCount(res.data.counts?.pending || 0);

        if (stu && stu.classes.length > 0) {
          setStudentClass((prev) => {
            const chosenClass =
              prev && stu.classes.includes(prev) ? prev : stu.classes[0];
            const hints = sessionsMap[chosenClass] || [];
            if (hints.length > 0) {
              setStudentLeaveDate((currDate) =>
                currDate < getTodayYMD() ? hints[0].date : currDate
              );
            }
            return chosenClass;
          });
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải đơn xin nghỉ của em.', 'error');
    } finally {
      setIsLoadingStudent(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isStudentView) {
      fetchMyRequests();
    }
  }, [isStudentView, fetchMyRequests]);

  // ==================== THAO TÁC HỌC SINH ====================
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile || studentProfile.classes.length === 0) {
      showToast('Tài khoản của em hiện chưa được xếp vào lớp học nào.', 'error');
      return;
    }
    if (!studentClass) {
      showToast('Vui lòng chọn lớp xin nghỉ.', 'error');
      return;
    }
    if (!studentLeaveDate || studentLeaveDate < getTodayYMD()) {
      showToast('Chỉ được chọn ngày xin nghỉ từ hôm nay trở đi.', 'error');
      return;
    }
    if (!studentReason.trim()) {
      showToast('Vui lòng nhập lý do xin nghỉ học.', 'error');
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await leaveRequestApi.createLeaveRequest({
        className: studentClass,
        leaveDate: studentLeaveDate,
        reason: studentReason.trim(),
      });
      showToast(res.message || 'Đã gửi đơn xin nghỉ tới giáo viên!');
      setStudentReason('');
      await fetchMyRequests();
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi đơn xin nghỉ.', 'error');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const handleCancelPendingLeave = async (item: LeaveRequestItem) => {
    setCancellingLeaveId(item.id);
    try {
      const res = await leaveRequestApi.cancelMyLeaveRequest(item.id);
      showToast(
        res.message ||
          `Đã rút lại đơn xin nghỉ ngày ${formatDateDMY(item.leaveDate)}.`
      );
      if (viewingStudentItem?.id === item.id) {
        setViewingStudentItem(null);
      }
      await fetchMyRequests();
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    } catch (err: any) {
      showToast(err?.message || 'Không thể rút lại đơn xin nghỉ.', 'error');
    } finally {
      setCancellingLeaveId(null);
    }
  };

  // ==================== THAO TÁC ADMIN ====================
  const openAdminRequestModal = (item: LeaveRequestItem) => {
    setSelectedRequest(item);
    setTeacherNoteInput(item.teacherNote || '');
    setConfirmingDeleteInModal(false);
  };

  const handleReviewDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setIsReviewing(true);
    try {
      const res = await leaveRequestApi.reviewLeaveRequest(selectedRequest.id, {
        status,
        teacherNote: teacherNoteInput.trim(),
      });
      showToast(
        res.message ||
          (status === 'APPROVED'
            ? `Đã duyệt đơn của ${selectedRequest.studentName} (Đã đồng bộ Nghỉ có phép sang Điểm danh)!`
            : `Đã từ chối đơn của ${selectedRequest.studentName}.`)
      );
      setSelectedRequest(null);
      await fetchAdminRequests(adminPage, activeFilter, selectedClassFilter);
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật trạng thái đơn.', 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeleteAdminRequest = async () => {
    if (!selectedRequest) return;
    setIsDeletingAdminRequest(true);
    try {
      const res = await leaveRequestApi.deleteLeaveRequest(selectedRequest.id);
      showToast(res.message || 'Đã xóa đơn xin nghỉ.');
      setSelectedRequest(null);
      setConfirmingDeleteInModal(false);
      await fetchAdminRequests(adminPage, activeFilter, selectedClassFilter);
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa đơn xin nghỉ.', 'error');
    } finally {
      setIsDeletingAdminRequest(false);
    }
  };

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
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
    const todayYmd = getTodayYMD();
    const upcomingHints = upcomingSessionsByClass[studentClass] || [];
    const existingDatesForClass = new Set(
      studentSentList
        .filter((item) => item.className === studentClass)
        .map((item) => item.leaveDate)
    );

    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35] relative">
        {renderToast()}

        <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-4 md:gap-6 box-border select-none">
          {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
          <header className="min-h-[72px] w-full lg:w-[1136px] flex items-center justify-between flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Đơn xin nghỉ
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                  <span>{studentPendingCount} đơn chờ duyệt</span>
                </span>
              </div>

              <div className="flex items-center mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Xin nghỉ sớm để cô sắp xếp buổi học bù nhé!
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-2 ml-[24px]">
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
          </header>

          {isLoadingStudent ? (
            <div className="w-full lg:w-[1136px] min-h-[480px] bg-white border border-[#F3D9E3] rounded-[16px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
              <span className="text-[14px] font-semibold text-[#6B5560]">
                Đang tải dữ liệu đơn xin nghỉ...
              </span>
            </div>
          ) : (
            <div className="w-full lg:w-[1136px] grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
              {/* ==================== CỘT TRÁI (7 CỘT): BIỂU MẪU GỬI ĐƠN ==================== */}
              <form
                onSubmit={handleStudentSubmit}
                className="lg:col-span-7 min-h-[680px] bg-white border border-[#F3D9E3] rounded-[16px] p-5 lg:p-[24px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between box-border"
              >
                <div>
                  <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                    Đơn xin nghỉ học
                  </h2>
                  <p className="font-nunito text-[14px] font-medium text-[#6B5560] mt-1">
                    Điền thông tin buổi học cần nghỉ, cô sẽ xem và phản hồi ngay trên hệ thống
                  </p>
                </div>

                <div className="flex-1 flex flex-col gap-[20px] my-[20px]">
                  {/* Trường 1: Tên học sinh (lấy thật từ hồ sơ) */}
                  <div>
                    <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2">
                      Họ và tên học sinh
                    </label>
                    <div className="w-full h-[48px] px-4 rounded-[12px] border border-[#9C6B84] bg-[#FFF6F9] flex items-center justify-between box-border">
                      <span className="font-nunito text-[15px] font-bold text-[#3B2A35] truncate">
                        {studentProfile
                          ? `${studentProfile.fullName} (${studentProfile.studentCode})`
                          : user?.fullName || 'Chưa liên kết hồ sơ học sinh'}
                      </span>
                      <Lock className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                    </div>
                  </div>

                  {/* Trường 2: Lớp (chỉ lấy các lớp học sinh đang theo học thực tế) */}
                  <div>
                    <label
                      htmlFor="student-leave-class"
                      className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                    >
                      Lớp theo học
                    </label>
                    <div className="relative">
                      <select
                        id="student-leave-class"
                        disabled={!studentProfile || studentProfile.classes.length === 0}
                        value={studentClass}
                        onChange={(e) => {
                          const nextCls = e.target.value;
                          setStudentClass(nextCls);
                          const hints = upcomingSessionsByClass[nextCls] || [];
                          if (hints.length > 0) {
                            setStudentLeaveDate(hints[0].date);
                          }
                        }}
                        className="w-full h-[48px] px-4 pr-10 rounded-[12px] border-2 border-[#2F6FA8] bg-white font-nunito text-[15px] font-bold text-[#3B2A35] appearance-none focus:outline-none cursor-pointer disabled:bg-[#F5F2F4] disabled:opacity-60 box-border"
                      >
                        {!studentProfile || studentProfile.classes.length === 0 ? (
                          <option value="">Chưa được xếp vào lớp học nào</option>
                        ) : (
                          studentProfile.classes.map((clsName) => (
                            <option key={clsName} value={clsName}>
                              {clsName}
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown
                        className="w-4 h-4 text-[#2F6FA8] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>

                  {/* Trường 3: Ngày xin nghỉ (chặn ngày quá khứ + gợi ý buổi học sắp tới từ Lịch học) */}
                  <div>
                    <label
                      htmlFor="student-leave-date"
                      className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                    >
                      Ngày xin nghỉ (từ hôm nay trở đi)
                    </label>
                    <div className="relative">
                      <input
                        id="student-leave-date"
                        type="date"
                        min={todayYmd}
                        value={studentLeaveDate}
                        onChange={(e) => setStudentLeaveDate(e.target.value)}
                        className="w-full h-[48px] pl-11 pr-4 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[15px] font-bold text-[#3B2A35] focus:outline-none focus:border-2 focus:border-[#2F6FA8] box-border"
                      />
                      <Calendar
                        className="w-4 h-4 text-[#6B5560] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                    </div>

                    {/* Gợi ý nhanh các buổi học sắp tới của lớp đang chọn từ Lịch học */}
                    {upcomingHints.length > 0 && (
                      <div className="mt-2.5">
                        <span className="block text-[12px] font-bold text-[#6B5560] mb-1.5">
                          Chọn nhanh buổi học sắp tới của {studentClass}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {upcomingHints.map((hint) => {
                            const isPicked = studentLeaveDate === hint.date;
                            const alreadySent = existingDatesForClass.has(hint.date);
                            return (
                              <button
                                key={hint.date}
                                type="button"
                                disabled={alreadySent}
                                onClick={() => setStudentLeaveDate(hint.date)}
                                className={`px-2.5 py-1.5 rounded-[9px] text-[12px] font-bold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isPicked
                                    ? 'bg-[#2F6FA8] text-white border-[#2F6FA8]'
                                    : 'bg-[#FFF6F9] text-[#3B2A35] border-[#F3D9E3] hover:border-[#2F6FA8]'
                                }`}
                              >
                                {hint.weekdayLabel} · {formatDateShortDM(hint.date)} (
                                {hint.timeRange}){alreadySent ? ' · Đã gửi' : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trường 4: Lí do nghỉ */}
                  <div className="flex-1 flex flex-col min-h-[150px]">
                    <label
                      htmlFor="student-leave-reason"
                      className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                    >
                      Lí do xin nghỉ
                    </label>
                    <div className="relative flex-1 flex flex-col">
                      <textarea
                        id="student-leave-reason"
                        maxLength={300}
                        rows={4}
                        value={studentReason}
                        onChange={(e) => setStudentReason(e.target.value)}
                        placeholder="VD: Em bị sốt phải đi khám bác sĩ nên xin phép cô cho em nghỉ buổi học hôm đó. Em hứa sẽ chép bài và làm bài tập bù đầy đủ ạ..."
                        className="w-full flex-1 p-4 pb-8 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[15px] font-semibold text-[#3B2A35] leading-relaxed resize-none focus:outline-none focus:border-2 focus:border-[#2F6FA8] box-border"
                      />
                      <span className="absolute bottom-3 right-4 font-nunito text-[12px] font-semibold text-[#6B5560] pointer-events-none">
                        {studentReason.length}/300
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chân biểu mẫu */}
                <div className="pt-4 border-t border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 text-[#6B5560]">
                    <Send className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                    <span className="font-nunito text-[12px] font-semibold text-[#6B5560]">
                      Có thể rút lại đơn khi đang Chờ duyệt
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmittingLeave ||
                      !studentProfile ||
                      studentProfile.classes.length === 0
                    }
                    className="h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white font-nunito text-[14px] font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingLeave ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                    )}
                    <span>Gửi đơn</span>
                  </button>
                </div>
              </form>

              {/* ==================== CỘT PHẢI (5 CỘT): THẺ "ĐƠN ĐÃ GỬI" ==================== */}
              <section className="lg:col-span-5 min-h-[680px] max-h-[780px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col overflow-hidden box-border">
                <div className="h-[64px] px-6 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
                  <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                    Đơn đã gửi
                  </h2>
                  <span className="font-nunito text-[13px] font-semibold text-[#6B5560]">
                    {studentSentList.length} đơn
                  </span>
                </div>

                {studentSentList.length === 0 ? (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center gap-2.5">
                    <div className="w-12 h-12 rounded-full bg-[#FFF6F9] text-[#A61E4D] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                      Chưa có đơn xin nghỉ nào
                    </div>
                    <p className="text-[13px] text-[#6B5560]">
                      Các đơn xin nghỉ em đã gửi và lời nhắn phản hồi của giáo viên sẽ hiển thị tại đây.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 divide-y divide-[#F3D9E3] overflow-y-auto">
                    {studentSentList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setViewingStudentItem(item)}
                        className="px-5 py-4 flex flex-col gap-2 hover:bg-[#FFF6F9]/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-nunito text-[15px] font-bold text-[#3B2A35]">
                                Nghỉ {formatDateDMY(item.leaveDate)}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                                {item.className}
                              </span>
                            </div>
                            <p className="font-nunito text-[13px] font-medium text-[#6B5560] line-clamp-2 mt-1">
                              {item.reason}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {item.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                                <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                                <span>Chờ duyệt</span>
                              </span>
                            )}
                            {item.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                                <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                                <span>Đã duyệt</span>
                              </span>
                            )}
                            {item.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE9ED] text-[#6B5560] text-[12px] font-bold">
                                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                                <span>Từ chối</span>
                              </span>
                            )}

                            {item.status === 'PENDING' && (
                              <button
                                type="button"
                                disabled={cancellingLeaveId === item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelPendingLeave(item);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-[#F3D9E3] bg-white hover:bg-[#FFE3E3] text-[#B02525] text-[11px] font-bold cursor-pointer disabled:opacity-50"
                              >
                                {cancellingLeaveId === item.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3 h-3" />
                                )}
                                <span>Rút lại đơn</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {item.teacherNote && (
                          <div className="px-3 py-2 rounded-[10px] bg-[#E9F3FF]/70 border border-[#CFE8FF] text-[12px] text-[#1F4E79] flex items-start gap-2">
                            <MessageSquareText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>{item.reviewedByName || 'Giáo viên'}:</strong>{' '}
                              {item.teacherNote}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* Hộp thoại xem chi tiết đơn đã gửi phía Học sinh */}
        {viewingStudentItem && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#3B2A35]/35 p-0 md:p-4"
            onClick={() => setViewingStudentItem(null)}
          >
            <div
              className="w-full md:w-[500px] bg-white rounded-t-[20px] md:rounded-[20px] p-6 border border-[#F3D9E3] shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-playfair text-[21px] font-bold text-[#3B2A35]">
                    Chi tiết đơn xin nghỉ
                  </h3>
                  <p className="text-[12px] text-[#6B5560] mt-0.5">
                    Gửi lúc {formatDateTimeVN(viewingStudentItem.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingStudentItem(null)}
                  className="w-8 h-8 rounded-[10px] hover:bg-[#FFF6F9] flex items-center justify-center text-[#6B5560] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-[14px]">
                <div className="p-3 rounded-[12px] bg-[#FFF6F9] flex items-center justify-between">
                  <span className="text-[#6B5560] font-semibold">Lớp & Ngày nghỉ:</span>
                  <span className="font-bold text-[#3B2A35]">
                    {viewingStudentItem.className} ·{' '}
                    {formatDateDMY(viewingStudentItem.leaveDate)}
                  </span>
                </div>

                <div className="p-3 rounded-[12px] bg-[#FFF6F9]">
                  <div className="text-[12px] font-semibold text-[#6B5560] mb-1">
                    Lý do xin nghỉ:
                  </div>
                  <p className="text-[#3B2A35] font-medium whitespace-pre-line">
                    {viewingStudentItem.reason}
                  </p>
                </div>

                {viewingStudentItem.teacherNote && (
                  <div className="p-3 rounded-[12px] bg-[#E9F3FF] border border-[#CFE8FF]">
                    <div className="text-[12px] font-bold text-[#1F4E79] mb-1">
                      Lời nhắn của {viewingStudentItem.reviewedByName || 'Giáo viên'}:
                    </div>
                    <p className="text-[#1F4E79] font-medium whitespace-pre-line">
                      {viewingStudentItem.teacherNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                {viewingStudentItem.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={cancellingLeaveId === viewingStudentItem.id}
                    onClick={() => handleCancelPendingLeave(viewingStudentItem)}
                    className="h-[40px] px-4 rounded-[10px] border border-[#B02525] text-[#B02525] hover:bg-[#FFE3E3] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rút lại đơn</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingStudentItem(null)}
                  className="h-[40px] px-5 rounded-[10px] bg-[#2F6FA8] text-white text-[13px] font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
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

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35] relative">
      {renderToast()}

      <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col justify-start gap-4 md:gap-5 box-border select-none">
        {/* ==================== HÀNG 1: TIÊU ĐỀ & BỘ LỌC TRẠNG THÁI ==================== */}
        <header className="min-h-[72px] w-full lg:w-[1136px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Đơn xin nghỉ
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                <span>{globalPendingCount} đơn chờ duyệt</span>
              </span>
            </div>

            <div className="flex items-center mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Bấm vào ô để đọc đơn, nhắn lịch học bù và duyệt nhé!
                </span>
              </div>
            </div>
          </div>

          {/* Bộ lọc theo Lớp + Thanh phân đoạn trạng thái */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedClassFilter}
                onChange={(e) => {
                  setSelectedClassFilter(e.target.value);
                  setAdminPage(1);
                }}
                className="h-[40px] pl-3.5 pr-9 rounded-[12px] border border-[#F3D9E3] bg-white text-[13px] font-bold text-[#3B2A35] appearance-none focus:outline-none focus:border-[#2F6FA8] cursor-pointer"
              >
                <option value="all">Tất cả lớp</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#6B5560] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div
              className="flex items-center gap-1.5 overflow-x-auto max-w-full"
              role="tablist"
              aria-label="Lọc đơn xin nghỉ theo trạng thái"
            >
              {(
                [
                  { key: 'ALL', label: 'Tất cả', count: adminCounts.ALL },
                  { key: 'PENDING', label: 'Chờ duyệt', count: adminCounts.PENDING },
                  { key: 'APPROVED', label: 'Đã duyệt', count: adminCounts.APPROVED },
                  { key: 'REJECTED', label: 'Từ chối', count: adminCounts.REJECTED },
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
                      setAdminPage(1);
                    }}
                    className={`h-[40px] px-3.5 rounded-[12px] text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2F6FA8] text-white shadow-2xs'
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
        </header>

        {/* ==================== HÀNG 2: LƯỚI Ô VUÔNG ĐƠN XIN NGHỈ ==================== */}
        {isLoadingAdmin ? (
          <div className="w-full lg:w-[1136px] min-h-[420px] bg-white border border-[#F3D9E3] rounded-[20px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
            <span className="text-[14px] font-semibold text-[#6B5560]">
              Đang tải danh sách đơn xin nghỉ...
            </span>
          </div>
        ) : tiles.length === 0 ? (
          <div className="w-full lg:w-[1136px] min-h-[420px] bg-white border border-[#F3D9E3] rounded-[20px] p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="font-playfair text-[21px] font-bold text-[#3B2A35]">
              Chưa có đơn xin nghỉ nào trong mục này
            </h2>
            <p className="text-[14px] text-[#6B5560] max-w-[420px]">
              Khi học sinh gửi đơn xin nghỉ học, các ô đơn mới sẽ xuất hiện tại đây với trạng thái Chờ duyệt đứng đầu.
            </p>
          </div>
        ) : (
          <>
            <TileGrid className="lg:w-[1136px] flex-shrink-0">
              {tiles.map((tile) => {
                const theme = getStatusTheme(tile.status);
                const isHovered = hoveredTileId === tile.id;

                return (
                  <div
                    key={tile.id}
                    onClick={() => openAdminRequestModal(tile)}
                    onMouseEnter={() => setHoveredTileId(tile.id)}
                    onMouseLeave={() => setHoveredTileId(null)}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: isHovered ? '#2F6FA8' : theme.border,
                    }}
                    className={`aspect-square w-full lg:w-[266px] lg:h-[266px] rounded-[16px] lg:rounded-[20px] p-4 md:p-5 lg:p-[24px] box-border flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${
                      isHovered
                        ? 'border-2 -translate-y-1 shadow-[0_8px_16px_rgba(59,42,53,0.12)]'
                        : 'border shadow-[0_1px_2px_rgba(59,42,53,0.06)]'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div
                        style={{ color: theme.textColor }}
                        className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center font-nunito font-bold text-[16px] flex-shrink-0"
                      >
                        {getInitials(tile.studentName)}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          style={{ color: theme.textColor }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[12px] font-bold leading-none"
                        >
                          {tile.status === 'PENDING' && (
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                          )}
                          {tile.status === 'APPROVED' && (
                            <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                          )}
                          {tile.status === 'REJECTED' && (
                            <X className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                          )}
                          <span>{theme.label}</span>
                        </span>

                        {tile.teacherNote && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 text-[#1F4E79] text-[10px] font-bold">
                            <MessageSquareText className="w-3 h-3" />
                            <span>Có lời nhắn</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between w-full gap-2">
                      <div className="flex flex-col min-w-0 flex-1">
                        <h2
                          style={{ color: theme.textColor }}
                          className="font-playfair text-[24px] lg:text-[26px] font-bold leading-[1.18] tracking-tight line-clamp-2"
                        >
                          {tile.studentName}
                        </h2>
                        <p className="font-nunito text-[13px] font-semibold text-[#3B2A35] leading-snug mt-2 truncate">
                          {tile.className} · Nghỉ {formatDateDMY(tile.leaveDate)}
                        </p>
                      </div>

                      <div className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center text-[#3B2A35] flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </TileGrid>

            {/* Thanh phân trang khi có dữ liệu */}
            {adminPagination.totalPages > 1 && (
              <div className="w-full lg:w-[1136px] px-5 py-3 bg-white border border-[#F3D9E3] rounded-[14px] flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-[#6B5560]">
                <span>
                  Hiển thị {startIdx}–{endIdx} trên {adminPagination.total} đơn xin nghỉ
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={adminPagination.page <= 1}
                    onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] disabled:opacity-40 cursor-pointer"
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: adminPagination.totalPages },
                    (_, idx) => idx + 1
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAdminPage(p)}
                      className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center cursor-pointer ${
                        adminPagination.page === p
                          ? 'bg-[#2F6FA8] text-white'
                          : 'text-[#1F4E79] hover:bg-[#E9F3FF]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={adminPagination.page >= adminPagination.totalPages}
                    onClick={() =>
                      setAdminPage((p) =>
                        Math.min(adminPagination.totalPages, p + 1)
                      )
                    }
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] disabled:opacity-40 cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== HỘP THOẠI ADMIN XỬ LÝ ĐƠN XIN NGHỈ ==================== */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#3B2A35]/35 p-0 md:p-4"
          onClick={() => !isReviewing && setSelectedRequest(null)}
        >
          <div
            className="w-full md:w-[580px] max-w-full max-h-[92dvh] overflow-y-auto bg-white rounded-t-[20px] md:rounded-[20px] p-5 md:p-[28px] border border-[#F3D9E3] shadow-[0_16px_40px_rgba(59,42,53,0.16)] box-border flex flex-col select-none"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-[48px] h-[48px] rounded-full bg-[#FFE0EB] flex items-center justify-center text-[#A61E4D] flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#A61E4D]" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-playfair text-[23px] font-bold text-[#3B2A35] leading-tight">
                    Đơn xin nghỉ học
                  </h2>
                  <span className="font-nunito text-[12px] font-medium text-[#6B5560] mt-1">
                    Gửi lúc {formatDateTimeVN(selectedRequest.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] cursor-pointer -mr-1 -mt-1"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>

                {selectedRequest.status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold leading-none">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Chờ duyệt</span>
                  </span>
                )}
                {selectedRequest.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold leading-none">
                    <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Đã duyệt</span>
                  </span>
                )}
                {selectedRequest.status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9ED] text-[#6B5560] text-[12px] font-bold leading-none">
                    <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Từ chối</span>
                  </span>
                )}
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#F3D9E3] my-4" />

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[12px] font-semibold text-[#6B5560] mb-1">
                    Học sinh
                  </span>
                  <div className="w-full rounded-[12px] bg-[#FFF6F9] p-[11px] flex items-center justify-between gap-2">
                    <span className="text-[14px] font-bold text-[#3B2A35] truncate">
                      {selectedRequest.studentName} ({selectedRequest.studentCode})
                    </span>
                    <Lock className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" />
                  </div>
                </div>

                <div>
                  <span className="block text-[12px] font-semibold text-[#6B5560] mb-1">
                    Lớp & Ngày nghỉ
                  </span>
                  <div className="w-full rounded-[12px] bg-[#FFF6F9] p-[11px] flex items-center justify-between gap-2">
                    <span className="text-[14px] font-bold text-[#3B2A35]">
                      {selectedRequest.className} ·{' '}
                      {formatDateDMY(selectedRequest.leaveDate)}
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" />
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-[12px] font-semibold text-[#6B5560] mb-1">
                  Lí do xin nghỉ của học sinh
                </span>
                <div className="w-full min-h-[84px] rounded-[12px] bg-[#FFF6F9] p-[12px] flex items-start justify-between gap-3">
                  <p className="text-[14px] font-semibold text-[#3B2A35] leading-relaxed whitespace-pre-line">
                    {selectedRequest.reason}
                  </p>
                  <Lock className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0 mt-1" />
                </div>
              </div>

              {/* Ô nhập Lời nhắn phản hồi của Giáo viên */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="admin-teacher-note"
                    className="text-[12px] font-bold text-[#3B2A35]"
                  >
                    Lời nhắn của giáo viên (tùy chọn — dặn ca học bù hoặc lý do từ chối)
                  </label>
                  <span className="text-[11px] font-semibold text-[#6B5560]">
                    {teacherNoteInput.length}/300
                  </span>
                </div>
                <textarea
                  id="admin-teacher-note"
                  rows={2}
                  maxLength={300}
                  value={teacherNoteInput}
                  onChange={(e) => setTeacherNoteInput(e.target.value)}
                  placeholder="VD: Cô duyệt cho em nghỉ nhé. Tối thứ 6 lúc 18h em sang học bù với lớp bên cạnh nhé..."
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#9C6B84] bg-white text-[13px] font-medium text-[#3B2A35] outline-none focus:ring-2 focus:ring-[#2F6FA8] resize-none"
                />
              </div>
            </div>

            <div className="mt-4 rounded-[12px] bg-[#E9F3FF] p-3 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
              <span className="text-[12px] font-semibold text-[#1F4E79] leading-snug">
                Khi bấm Duyệt đơn, hệ thống tự động gắn nhãn <strong>Nghỉ có phép</strong> cho{' '}
                {selectedRequest.studentName} trên bảng Điểm danh lớp{' '}
                {selectedRequest.className} ngày {formatDateDMY(selectedRequest.leaveDate)}.
              </span>
            </div>

            {selectedRequest.reviewedAt && (
              <div className="mt-2.5 text-[11px] font-semibold text-[#6B5560] text-right">
                Cập nhật lần cuối lúc {formatDateTimeVN(selectedRequest.reviewedAt)} bởi{' '}
                {selectedRequest.reviewedByName || 'Chị Vân'}
              </div>
            )}

            {/* Chân hộp thoại: Xóa đơn bên trái + Đóng / Từ chối / Duyệt đơn bên phải */}
            <div className="mt-5 pt-3 border-t border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2">
              {confirmingDeleteInModal ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isDeletingAdminRequest}
                    onClick={handleDeleteAdminRequest}
                    className="h-[40px] px-3.5 rounded-[10px] bg-[#B02525] text-white text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDeletingAdminRequest && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Xác nhận xóa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteInModal(false)}
                    className="h-[40px] px-3 rounded-[10px] bg-[#EFE9ED] text-[#3B2A35] text-[12px] font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteInModal(true)}
                  className="h-[42px] px-3 rounded-[10px] text-[#B02525] hover:bg-[#FFE3E3] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa đơn</span>
                </button>
              )}

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => setSelectedRequest(null)}
                  className="h-[44px] px-4 rounded-[12px] text-[13px] font-bold text-[#6B5560] hover:bg-[#FFF6F9] cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleReviewDecision('REJECTED')}
                  className="h-[44px] px-4 rounded-[12px] border border-[#A61E4D] bg-white hover:bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                  <span>Từ chối</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleReviewDecision('APPROVED')}
                  className="h-[44px] px-5 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isReviewing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" strokeWidth={1.75} />
                  )}
                  <span>Duyệt đơn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
