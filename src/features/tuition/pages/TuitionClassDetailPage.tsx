import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wallet,
  Check,
  Calendar,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TuitionPaymentModal } from '../components/TuitionPaymentModal';
import { tuitionApi } from '../api/tuitionApi';
import {
  TuitionClassDetailResponse,
  TuitionClassStudentRow,
  TuitionPaymentMethod,
  TuitionPaymentStatus,
} from '../types/tuition.types';

const formatCurrencyVND = (amount?: number | null): string => {
  const safe = Math.max(0, Math.round(amount || 0));
  return `${String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`;
};

const formatTuitionInputNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedMoney = (formatted: string): number => {
  const digits = formatted.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const getInitials = (name: string): string => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return String(name || 'HS')
    .slice(0, 2)
    .toUpperCase();
};

export const TuitionClassDetailPage: React.FC = () => {
  const { id: classId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const now = new Date();
  const initMonth = Math.min(
    12,
    Math.max(1, Number(searchParams.get('month')) || now.getMonth() + 1)
  );
  const initYear = Math.min(
    2100,
    Math.max(2020, Number(searchParams.get('year')) || now.getFullYear())
  );

  const [selectedMonth, setSelectedMonth] = useState<number>(initMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initYear);
  const [detail, setDetail] = useState<TuitionClassDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'UNPAID' | 'PAID' | 'UNSET'
  >('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [togglingRecordId, setTogglingRecordId] = useState<string | null>(null);

  // Hộp thoại Áp mức học phí chung cho cả lớp
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<'FIXED' | 'PER_SESSION'>('FIXED');
  const [bulkFixedInput, setBulkFixedInput] = useState<string>('1.200.000');
  const [bulkUnitPriceInput, setBulkUnitPriceInput] = useState<string>('150.000');
  const [bulkOverwrite, setBulkOverwrite] = useState<boolean>(false);
  const [bulkComment, setBulkComment] = useState<string>('');
  const [isSubmittingBulk, setIsSubmittingBulk] = useState<boolean>(false);

  // Popover chọn nhanh Tháng / Năm
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(initYear);
  const monthPickerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isMonthPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(e.target as Node)
      ) {
        setIsMonthPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMonthPickerOpen]);

  const fetchClassTuition = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await tuitionApi.getClassDetail(classId, {
        month: selectedMonth,
        year: selectedYear,
      });
      setDetail(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không tìm thấy thông tin lớp học.');
    } finally {
      setIsLoading(false);
    }
  }, [classId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchClassTuition();
    setSearchParams(
      { month: String(selectedMonth), year: String(selectedYear) },
      { replace: true }
    );
  }, [fetchClassTuition, selectedMonth, selectedYear, setSearchParams]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const students = detail?.students || [];
  const selectedStudent: TuitionClassStudentRow | null = useMemo(
    () => students.find((s) => s.studentId === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((st) => {
      if (statusFilter !== 'ALL' && st.tuitionStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        st.fullName.toLowerCase().includes(q) ||
        st.studentCode.toLowerCase().includes(q) ||
        (st.parentPhone || '').includes(q) ||
        (st.email || '').toLowerCase().includes(q)
      );
    });
  }, [students, statusFilter, searchQuery]);

  // Lưu phiếu học phí cho 1 học sinh từ Modal
  const handleSaveStudentTuition = async (payload: {
    studentId: string;
    amount: number;
    teacherComment: string;
    status: TuitionPaymentStatus;
    paymentMethod: TuitionPaymentMethod | null;
    attendedCountSnapshot: number | null;
    unitPriceSnapshot: number | null;
  }) => {
    if (!classId) return;
    try {
      await tuitionApi.upsertStudentTuition(classId, payload.studentId, {
        month: selectedMonth,
        year: selectedYear,
        amount: payload.amount,
        teacherComment: payload.teacherComment,
        status: payload.status,
        paymentMethod: payload.paymentMethod,
        attendedCountSnapshot: payload.attendedCountSnapshot,
        unitPriceSnapshot: payload.unitPriceSnapshot,
      });
      await fetchClassTuition();
      showToast(
        `Đã lưu phiếu học phí (${formatCurrencyVND(payload.amount)}) thành công!`
      );
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu phiếu học phí.', 'error');
      throw err;
    }
  };

  // Gửi Email phiếu học phí
  const handleSendTuitionEmail = async (recordId: string) => {
    try {
      const res = await tuitionApi.sendTuitionEmail(recordId);
      await fetchClassTuition();
      showToast(res.message || 'Đã gửi Email phiếu học phí thành công!');
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi Email phiếu học phí.', 'error');
      throw err;
    }
  };

  // Bấm nhanh chuyển trạng thái Đã đóng / Chờ đóng ngay trên dòng bảng
  const handleQuickTogglePaid = async (row: TuitionClassStudentRow) => {
    if (!row.record) return;
    const nextStatus: TuitionPaymentStatus =
      row.record.status === 'PAID' ? 'UNPAID' : 'PAID';
    setTogglingRecordId(row.record.id);
    try {
      await tuitionApi.updatePaymentStatus(row.record.id, {
        status: nextStatus,
        paymentMethod: 'TRANSFER',
      });
      await fetchClassTuition();
      showToast(
        nextStatus === 'PAID'
          ? `Đã xác nhận ${row.fullName} hoàn tất đóng học phí!`
          : `Đã chuyển ${row.fullName} về trạng thái Chờ đóng.`
      );
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật trạng thái.', 'error');
    } finally {
      setTogglingRecordId(null);
    }
  };

  // Áp mức học phí chung cho cả lớp
  const handleBulkApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;

    const fixedVal = parseFormattedMoney(bulkFixedInput);
    const unitVal = parseFormattedMoney(bulkUnitPriceInput);

    if (bulkMode === 'FIXED' && fixedVal <= 0) {
      showToast('Vui lòng nhập mức học phí trọn gói lớn hơn 0 đ.', 'error');
      return;
    }
    if (bulkMode === 'PER_SESSION' && unitVal <= 0) {
      showToast('Vui lòng nhập đơn giá 1 buổi lớn hơn 0 đ.', 'error');
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const res = await tuitionApi.bulkApplyTuition(classId, {
        month: selectedMonth,
        year: selectedYear,
        mode: bulkMode,
        fixedAmount: bulkMode === 'FIXED' ? fixedVal : undefined,
        unitPrice: bulkMode === 'PER_SESSION' ? unitVal : undefined,
        overwriteExisting: bulkOverwrite,
        defaultComment: bulkComment.trim(),
      });
      setIsBulkModalOpen(false);
      await fetchClassTuition();
      showToast(
        res.message ||
          `Đã áp mức học phí cho ${res.data?.appliedCount || 0} học sinh!`
      );
    } catch (err: any) {
      showToast(err?.message || 'Không thể áp mức học phí hàng loạt.', 'error');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const monthLabel = `${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;

  if (isLoading) {
    return (
      <div className="w-full min-h-[420px] flex flex-col items-center justify-center gap-3 text-[#6B5560] bg-[#FFF6F9] font-nunito">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F6FA8]" />
        <span className="text-sm font-semibold">
          Đang tải danh sách học phí tháng {monthLabel}...
        </span>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="w-full max-w-[1136px] mx-auto p-6 lg:p-8 font-nunito">
        <div className="rounded-[16px] border border-[#F3D9E3] bg-white p-10 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[#A61E4D] mx-auto" />
          <h2 className="font-playfair text-2xl font-bold text-[#3B2A35]">
            Không tìm thấy lớp học
          </h2>
          <p className="text-sm text-[#6B5560]">{errorMsg}</p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.TUITION)}
            className="h-10 px-5 rounded-[10px] bg-[#2F6FA8] text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách lớp học phí</span>
          </button>
        </div>
      </div>
    );
  }

  const { classInfo, summary, totalClassSessionsInMonth } = detail;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35]">
        <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-5 box-border select-none relative">
          {toast && (
            <div
              className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 ${
                toast.type === 'error'
                  ? 'bg-[#B02525] text-white'
                  : 'bg-[#1F4E79] text-white'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-[#FFE3E3] flex-shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2.2} />
              )}
              <span>{toast.message}</span>
            </div>
          )}

          {/* ==================== HÀNG 1: TIÊU ĐỀ & BỘ CHỌN THÁNG ==================== */}
          <header className="w-full lg:w-[1136px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 mb-1 text-[14px] text-[#6B5560]">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.TUITION)}
                  className="p-1 -ml-1 rounded-[6px] hover:bg-white/60 text-[#6B5560] hover:text-[#2F6FA8] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <Link
                  to={ROUTES.TUITION}
                  className="text-[#2F6FA8] hover:underline font-semibold"
                >
                  Học phí
                </Link>
                <span>›</span>
                <span className="font-semibold truncate">{classInfo.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Học phí · {classInfo.name}
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold">
                  {summary.totalStudents} học sinh
                </span>
                <span className="px-2.5 py-1 rounded-[10px] bg-[#FFF0F6] text-[#A61E4D] text-[12px] font-bold">
                  {totalClassSessionsInMonth} buổi điểm danh tháng {selectedMonth}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={students.length === 0}
                onClick={() => setIsBulkModalOpen(true)}
                className="h-[44px] px-4 rounded-[12px] bg-[#D6336C] hover:bg-[#BE285C] text-white text-[13px] font-bold inline-flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Áp mức học phí cả lớp</span>
              </button>

              {/* Bộ chọn Tháng / Năm */}
              <div ref={monthPickerRef} className="relative">
                <div className="h-[44px] px-3 bg-white border border-[#9C6B84] rounded-[12px] flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA]/60 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPickerYear(selectedYear);
                      setIsMonthPickerOpen((v) => !v);
                    }}
                    className="px-2 py-1 rounded-[8px] hover:bg-[#FFF6F9] text-[14px] font-bold text-[#3B2A35] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#1F4E79]" />
                    <span>Tháng {monthLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA]/60 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>

                {isMonthPickerOpen && (
                  <div className="absolute right-0 top-[52px] z-40 w-[260px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-xl p-4">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#F3D9E3]">
                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y - 1)}
                        className="w-7 h-7 rounded-[8px] hover:bg-[#DCEBFA] flex items-center justify-center text-[#1F4E79] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-playfair font-bold text-[16px] text-[#3B2A35]">
                        Năm {pickerYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y + 1)}
                        className="w-7 h-7 rounded-[8px] hover:bg-[#DCEBFA] flex items-center justify-center text-[#1F4E79] cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => {
                        const active =
                          m === selectedMonth && pickerYear === selectedYear;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setSelectedMonth(m);
                              setSelectedYear(pickerYear);
                              setIsMonthPickerOpen(false);
                            }}
                            className={`h-[34px] rounded-[9px] text-[12px] font-bold cursor-pointer ${
                              active
                                ? 'bg-[#2F6FA8] text-white'
                                : 'bg-[#FFF6F9] text-[#3B2A35] hover:bg-[#DCEBFA]'
                            }`}
                          >
                            Tháng {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ==================== HÀNG 2: THANH TỔNG HỢP DOANH THU ==================== */}
          <div className="w-full lg:w-[1136px] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#F3D9E3] rounded-[14px] px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold text-[#6B5560]">
                  Tổng dự thu tháng {monthLabel}
                </div>
                <div className="font-playfair text-[22px] font-bold text-[#3B2A35] mt-0.5">
                  {formatCurrencyVND(summary.expectedAmount)}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-[8px] bg-[#FFF6F9] text-[#6B5560] text-[12px] font-bold">
                {summary.paidCount + summary.unpaidCount}/{summary.totalStudents} phiếu
              </span>
            </div>

            <div className="bg-white border border-[#F3D9E3] rounded-[14px] px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold text-[#1F4E79]">
                  Đã thu thành công
                </div>
                <div className="font-playfair text-[22px] font-bold text-[#1F4E79] mt-0.5">
                  {formatCurrencyVND(summary.collectedAmount)}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-[8px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                {summary.paidCount} đã đóng
              </span>
            </div>

            <div className="bg-white border border-[#F3D9E3] rounded-[14px] px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold text-[#A61E4D]">
                  Còn chờ thanh toán
                </div>
                <div className="font-playfair text-[22px] font-bold text-[#A61E4D] mt-0.5">
                  {formatCurrencyVND(summary.remainingAmount)}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                {summary.unpaidCount} chờ đóng
              </span>
            </div>
          </div>

          {/* ==================== HÀNG 3: BẢNG DANH SÁCH HỌC SINH ==================== */}
          <div className="w-full lg:w-[1136px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col overflow-hidden">
            {/* Thanh tìm kiếm & lọc trạng thái */}
            <div className="p-4 lg:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#F3D9E3]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#9C6B84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên, mã HS, SĐT phụ huynh..."
                  className="w-full h-[40px] pl-10 pr-8 rounded-[10px] border border-[#F3D9E3] bg-[#FFF6F9]/50 focus:bg-white text-[13px] font-semibold text-[#3B2A35] outline-none focus:border-[#2F6FA8]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B5560] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(
                  [
                    { key: 'ALL', label: `Tất cả (${summary.totalStudents})` },
                    { key: 'UNPAID', label: `Chờ đóng (${summary.unpaidCount})` },
                    { key: 'PAID', label: `Đã đóng (${summary.paidCount})` },
                    { key: 'UNSET', label: `Chưa tạo phiếu (${summary.unsetCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`h-[36px] px-3 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === tab.key
                        ? 'bg-[#2F6FA8] text-white'
                        : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-16 px-6 text-center flex flex-col items-center gap-2.5 text-[#6B5560]">
                <Users className="w-9 h-9 text-[#9C6B84]/60" />
                <div className="font-bold text-[15px] text-[#3B2A35]">
                  {students.length === 0
                    ? `Lớp ${classInfo.name} hiện chưa có học sinh nào`
                    : 'Không có học sinh nào khớp với bộ lọc hiện tại'}
                </div>
              </div>
            ) : (
              <>
                {/* Tiêu đề bảng Desktop */}
                <div className="hidden md:grid md:grid-cols-[100px_1.5fr_120px_160px_120px] lg:grid-cols-[110px_1.5fr_160px_140px_190px_130px] h-[46px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold items-center px-4 lg:px-6 border-b border-[#F3D9E3]">
                  <div>Mã HS</div>
                  <div>Họ và tên</div>
                  <div className="hidden lg:block">SĐT Phụ huynh</div>
                  <div>Chuyên cần</div>
                  <div>Học phí tháng {selectedMonth}</div>
                  <div className="text-center">Thao tác</div>
                </div>

                {/* Dòng bảng Desktop / Tablet */}
                <div className="hidden md:flex flex-col divide-y divide-[#F3D9E3]">
                  {filteredStudents.map((st, idx) => {
                    const isPinkAvatar = idx % 2 === 0;
                    const isPaid = st.tuitionStatus === 'PAID';
                    return (
                      <div
                        key={st.studentId}
                        className="md:grid md:grid-cols-[100px_1.5fr_120px_160px_120px] lg:grid-cols-[110px_1.5fr_160px_140px_190px_130px] min-h-[64px] px-4 lg:px-6 py-2 bg-white hover:bg-[#FFF6F9] items-center text-[13px]"
                      >
                        <div className="font-mono font-bold text-[#1F4E79]">
                          {st.studentCode}
                        </div>

                        <div className="flex items-center gap-2.5 pr-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0 ${
                              isPinkAvatar
                                ? 'bg-[#FFE0EB] text-[#A61E4D]'
                                : 'bg-[#DCEBFA] text-[#1F4E79]'
                            }`}
                          >
                            {getInitials(st.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#3B2A35] truncate">
                              {st.fullName}
                            </div>
                            {st.email && (
                              <div className="text-[11px] text-[#6B5560] truncate">
                                {st.email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="hidden lg:block font-medium text-[#3B2A35]">
                          {st.parentPhone || '—'}
                        </div>

                        <div className="text-[12px] font-semibold text-[#3B2A35]">
                          <span>
                            {st.attendedCount}/{totalClassSessionsInMonth} buổi
                          </span>
                          {st.excusedLeaveCount > 0 && (
                            <span className="block text-[11px] text-[#A61E4D]">
                              {st.excusedLeaveCount} nghỉ phép
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-start gap-1">
                          {st.record ? (
                            <>
                              <span className="font-bold text-[14px] text-[#3B2A35]">
                                {formatCurrencyVND(st.record.amount)}
                              </span>
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[11px] font-bold">
                                  <Check className="w-3 h-3" strokeWidth={2.3} />
                                  <span>Đã đóng</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[11px] font-bold">
                                  <Clock className="w-3 h-3" strokeWidth={1.75} />
                                  <span>Chờ đóng</span>
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[9px] bg-[#EFE9ED] text-[#6B5560] text-[11px] font-bold">
                              <Clock className="w-3 h-3" strokeWidth={1.75} />
                              <span>Chưa tạo phiếu</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-1.5">
                          {st.record && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  disabled={togglingRecordId === st.record.id}
                                  onClick={() => handleQuickTogglePaid(st)}
                                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ${
                                    isPaid
                                      ? 'bg-[#DCEBFA] text-[#1F4E79] hover:bg-[#CFE3FF]'
                                      : 'text-[#6B5560] hover:bg-[#DCEBFA] hover:text-[#1F4E79]'
                                  }`}
                                  aria-label={`Đổi trạng thái thu học phí của ${st.fullName}`}
                                >
                                  {togglingRecordId === st.record.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-[18px] h-[18px]" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <span>
                                  {isPaid
                                    ? 'Đã đóng (Bấm để chuyển về Chờ đóng)'
                                    : 'Xác nhận Đã đóng học phí'}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setSelectedStudentId(st.studentId)}
                                className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer"
                                aria-label={`Mở phiếu học phí và mã QR của ${st.fullName}`}
                              >
                                <Wallet className="w-[18px] h-[18px]" strokeWidth={1.75} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span>Nhập học phí, xuất phiếu PNG &amp; gửi Email</span>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Danh sách thẻ trên Di động */}
                <div className="md:hidden divide-y divide-[#F3D9E3]">
                  {filteredStudents.map((st, idx) => {
                    const isPinkAvatar = idx % 2 === 0;
                    const isPaid = st.tuitionStatus === 'PAID';
                    return (
                      <div
                        key={st.studentId}
                        className="p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0 ${
                              isPinkAvatar
                                ? 'bg-[#FFE0EB] text-[#A61E4D]'
                                : 'bg-[#DCEBFA] text-[#1F4E79]'
                            }`}
                          >
                            {getInitials(st.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[14px] text-[#3B2A35] truncate">
                              {st.fullName}
                            </div>
                            <div className="text-[12px] font-semibold text-[#6B5560] mt-0.5">
                              {st.studentCode} · {st.attendedCount}/
                              {totalClassSessionsInMonth} buổi
                            </div>
                            <div className="mt-1">
                              {st.record ? (
                                <span className="font-bold text-[13px] text-[#A61E4D]">
                                  {formatCurrencyVND(st.record.amount)} ·{' '}
                                  {isPaid ? 'Đã đóng' : 'Chờ đóng'}
                                </span>
                              ) : (
                                <span className="text-[12px] font-bold text-[#6B5560]">
                                  Chưa tạo phiếu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {st.record && (
                            <button
                              type="button"
                              onClick={() => handleQuickTogglePaid(st)}
                              className={`w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer ${
                                isPaid
                                  ? 'bg-[#DCEBFA] text-[#1F4E79]'
                                  : 'bg-[#FFF6F9] text-[#6B5560]'
                              }`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(st.studentId)}
                            className="w-10 h-10 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] flex items-center justify-center cursor-pointer"
                          >
                            <Wallet className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="min-h-[42px] px-4 lg:px-6 border-t border-[#F3D9E3] bg-[#FCF8FA] flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-[#6B5560]">
              <span>
                {classInfo.name} có <strong>{summary.totalStudents}</strong> học sinh
              </span>
              <span>
                Đã thu {summary.paidCount}/{summary.totalStudents} học sinh ·{' '}
                <strong className="text-[#1F4E79]">
                  {formatCurrencyVND(summary.collectedAmount)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* HỘP THOẠI ÁP MỨC HỌC PHÍ CHUNG CHO CẢ LỚP */}
        {isBulkModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#3B2A35]/35 p-0 md:p-4"
            onClick={() => !isSubmittingBulk && setIsBulkModalOpen(false)}
          >
            <form
              onSubmit={handleBulkApplySubmit}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-[520px] bg-white rounded-t-[20px] md:rounded-[20px] p-6 border border-[#F3D9E3] shadow-xl space-y-4 font-nunito"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                    Áp mức học phí cả lớp
                  </h2>
                  <p className="text-[13px] text-[#6B5560] mt-0.5">
                    {classInfo.name} · Tháng {monthLabel} ({summary.totalStudents} học sinh)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="w-8 h-8 rounded-[10px] hover:bg-[#FFF6F9] flex items-center justify-center text-[#6B5560] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBulkMode('FIXED')}
                  className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                    bulkMode === 'FIXED'
                      ? 'bg-[#E9F3FF] border-[#2F6FA8] text-[#1F4E79]'
                      : 'bg-white border-[#F3D9E3] text-[#3B2A35]'
                  }`}
                >
                  <div className="text-[13px] font-bold">Trọn gói cố định</div>
                  <div className="text-[11px] text-[#6B5560] mt-0.5">
                    Cùng 1 mức tiền cho cả lớp
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkMode('PER_SESSION')}
                  className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                    bulkMode === 'PER_SESSION'
                      ? 'bg-[#E9F3FF] border-[#2F6FA8] text-[#1F4E79]'
                      : 'bg-white border-[#F3D9E3] text-[#3B2A35]'
                  }`}
                >
                  <div className="text-[13px] font-bold">Theo buổi điểm danh</div>
                  <div className="text-[11px] text-[#6B5560] mt-0.5">
                    Số buổi có mặt × Đơn giá
                  </div>
                </button>
              </div>

              {bulkMode === 'FIXED' ? (
                <div>
                  <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                    Mức học phí 1 tháng (VNĐ)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bulkFixedInput}
                    onChange={(e) =>
                      setBulkFixedInput(formatTuitionInputNumber(e.target.value))
                    }
                    placeholder="VD: 1.200.000"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#9C6B84] font-bold text-[16px] text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                    Đơn giá 1 buổi học (VNĐ)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bulkUnitPriceInput}
                    onChange={(e) =>
                      setBulkUnitPriceInput(formatTuitionInputNumber(e.target.value))
                    }
                    placeholder="VD: 150.000"
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#9C6B84] font-bold text-[16px] text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                  />
                  <p className="text-[12px] text-[#1F4E79] font-semibold mt-1">
                    Hệ thống tự lấy số buổi có mặt thực tế trong tháng {monthLabel} của từng em để nhân với đơn giá.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                  Lời nhắn / nhận xét chung (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={bulkComment}
                  onChange={(e) => setBulkComment(e.target.value)}
                  placeholder="Có thể để trống và nhập nhận xét riêng cho từng em sau..."
                  className="w-full px-3.5 py-2 rounded-[12px] border border-[#9C6B84] text-[13px] text-[#3B2A35] outline-none focus:border-[#2F6FA8] resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 text-[13px] font-semibold text-[#3B2A35] cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkOverwrite}
                  onChange={(e) => setBulkOverwrite(e.target.checked)}
                  className="w-4 h-4 accent-[#2F6FA8]"
                />
                <span>
                  Cập nhật đè cả các phiếu đang Chờ đóng (không ảnh hưởng phiếu Đã đóng)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="h-[42px] px-4 rounded-[11px] bg-[#EFE9ED] text-[#3B2A35] text-[13px] font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBulk}
                  className="h-[42px] px-5 rounded-[11px] bg-[#D6336C] text-white text-[13px] font-bold inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingBulk && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>Áp dụng ngay</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HỘP THOẠI CHI TIẾT HỌC PHÍ, QR, GỬI EMAIL & TẢI PNG */}
        <TuitionPaymentModal
          student={selectedStudent}
          classNameLabel={classInfo.name}
          month={selectedMonth}
          year={selectedYear}
          totalClassSessionsInMonth={totalClassSessionsInMonth}
          onClose={() => setSelectedStudentId(null)}
          onSave={handleSaveStudentTuition}
          onSendEmail={handleSendTuitionEmail}
        />
      </div>
    </TooltipProvider>
  );
};
