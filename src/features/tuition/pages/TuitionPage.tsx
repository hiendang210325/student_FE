import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Wallet,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  Download,
  Loader2,
  BookOpen,
  CreditCard,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/useAuthStore';
import { TileGrid } from '@/components/common/TileGrid/TileGrid';
import bankQrImage from '@/assets/images/mã_qr_ngân_hàng.jpg';
import { tuitionApi } from '../api/tuitionApi';
import { exportTuitionSlipPng } from '../utils/exportTuitionSlipPng';
import {
  StudentTuitionSlipItem,
  TuitionClassesOverviewResponse,
  TuitionClassOverviewItem,
} from '../types/tuition.types';

const formatCurrencyVND = (amount?: number | null): string => {
  const safe = Math.max(0, Math.round(amount || 0));
  return `${String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`;
};

const removeVietnameseTones = (str: string): string => {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
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

const getTileTheme = (tile: TuitionClassOverviewItem, index: number) => {
  if (tile.colorTheme?.bg && tile.colorTheme?.border && tile.colorTheme?.text) {
    return {
      bg: tile.colorTheme.bg,
      border: tile.colorTheme.border,
      textColor: tile.colorTheme.text,
    };
  }
  const row = Math.floor(index / 4);
  const col = index % 4;
  const isPink = (row + col) % 2 === 0;
  if (isPink) {
    return {
      bg: '#FFE0EB',
      border: '#F8A5C2',
      textColor: '#A61E4D',
    };
  }
  return {
    bg: '#DCEBFA',
    border: '#8EC5FC',
    textColor: '#1F4E79',
  };
};

export const TuitionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  const isActualStudent = user?.role === 'user';
  const isStudentView =
    isActualStudent ||
    activeRole === 'student' ||
    location.search.includes('role=student');

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // ==================== STATE ADMIN ====================
  const [overview, setOverview] =
    useState<TuitionClassesOverviewResponse | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState<boolean>(false);
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);

  // ==================== STATE HỌC SINH / PHỤ HUYNH ====================
  const [studentSlips, setStudentSlips] = useState<StudentTuitionSlipItem[]>([]);
  const [studentUnpaidCount, setStudentUnpaidCount] = useState<number>(0);
  const [selectedSlipId, setSelectedSlipId] = useState<string>('');
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);

  const fetchAdminOverview = useCallback(async () => {
    setIsLoadingAdmin(true);
    try {
      const res = await tuitionApi.getClassesOverview({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.data) {
        setOverview(res.data);
      }
    } catch {
      // Bỏ qua nếu chưa có dữ liệu
    } finally {
      setIsLoadingAdmin(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchStudentSlips = useCallback(async () => {
    setIsLoadingStudent(true);
    try {
      const res = await tuitionApi.getMyTuitionSlips();
      if (res.data) {
        const list = res.data.items || [];
        setStudentSlips(list);
        setStudentUnpaidCount(res.data.unpaidCount || 0);
        setSelectedSlipId((prev) => {
          if (prev && list.some((s) => s.id === prev)) return prev;
          return list[0]?.id || '';
        });
      }
    } catch {
      // Bỏ qua
    } finally {
      setIsLoadingStudent(false);
    }
  }, []);

  useEffect(() => {
    if (isStudentView) {
      fetchStudentSlips();
    } else {
      fetchAdminOverview();
    }
  }, [isStudentView, fetchAdminOverview, fetchStudentSlips]);

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

  // ============================================================================
  // GIAO DIỆN VAI TRÒ HỌC SINH / PHỤ HUYNH ("HỌC PHÍ CỦA EM")
  // ============================================================================
  if (isStudentView) {
    const activeSlip =
      studentSlips.find((s) => s.id === selectedSlipId) ||
      studentSlips[0] ||
      null;

    const handleDownloadStudentSlip = (slip: StudentTuitionSlipItem) => {
      const monthPadded = String(slip.month).padStart(2, '0');
      const monthLabel = `${monthPadded}/${slip.year}`;
      const transferContent = `${slip.studentCode} - ${removeVietnameseTones(
        slip.className
      )} - T${monthPadded}`;
      void exportTuitionSlipPng({
        studentName: slip.studentName,
        classNameLabel: slip.className,
        studentCode: slip.studentCode,
        monthLabel,
        formattedAmount: formatCurrencyVND(slip.amount),
        transferContent,
        teacherComment: slip.teacherComment,
        fileName: `${slip.studentName} - ${slip.className} - T${monthPadded}-${slip.year}.png`,
        status: slip.status,
      });
    };

    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35]">
        <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-5 box-border select-none">
          <header className="min-h-[68px] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Học phí của em
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[13px] font-bold ${
                    studentUnpaidCount > 0
                      ? 'bg-[#FFE0EB] text-[#A61E4D]'
                      : 'bg-[#DCEBFA] text-[#1F4E79]'
                  }`}
                >
                  {studentUnpaidCount > 0 ? (
                    <>
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{studentUnpaidCount} phiếu chờ đóng</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Đã hoàn tất học phí</span>
                    </>
                  )}
                </span>
              </div>
              <p className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] mt-1">
                Xem phiếu học phí hàng tháng, nhận xét của cô và quét mã QR thanh toán trực tiếp!
              </p>
            </div>
          </header>

          {isLoadingStudent ? (
            <div className="w-full min-h-[440px] bg-white border border-[#F3D9E3] rounded-[18px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
              <span className="text-[14px] font-semibold text-[#6B5560]">
                Đang tải danh sách phiếu học phí...
              </span>
            </div>
          ) : studentSlips.length === 0 ? (
            <div className="w-full min-h-[420px] bg-white border border-[#F3D9E3] rounded-[18px] p-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="font-playfair text-[21px] font-bold text-[#3B2A35]">
                Hiện chưa có phiếu học phí nào
              </h2>
              <p className="text-[14px] text-[#6B5560] max-w-[440px]">
                Khi giáo viên lập phiếu học phí tháng mới cho lớp của em, thông tin số tiền, lời nhận xét và mã QR thanh toán sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* CỘT TRÁI: DANH SÁCH CÁC THÁNG */}
              <div className="lg:col-span-4 bg-white border border-[#F3D9E3] rounded-[16px] shadow-xs overflow-hidden flex flex-col max-h-[760px]">
                <div className="h-[52px] px-5 border-b border-[#F3D9E3] flex items-center justify-between">
                  <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                    Các kỳ học phí
                  </h2>
                  <span className="text-[12px] font-bold text-[#6B5560]">
                    {studentSlips.length} phiếu
                  </span>
                </div>

                <div className="divide-y divide-[#F3D9E3] overflow-y-auto">
                  {studentSlips.map((slip) => {
                    const isSelected = activeSlip?.id === slip.id;
                    const mLabel = `${String(slip.month).padStart(2, '0')}/${slip.year}`;
                    return (
                      <div
                        key={slip.id}
                        onClick={() => setSelectedSlipId(slip.id)}
                        className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E9F3FF] border-l-4 border-l-[#2F6FA8]'
                            : 'bg-white hover:bg-[#FFF6F9] border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[15px] text-[#3B2A35]">
                            Tháng {mLabel} · {slip.className}
                          </div>
                          <div className="font-bold text-[14px] text-[#A61E4D] mt-0.5">
                            {formatCurrencyVND(slip.amount)}
                          </div>
                        </div>

                        {slip.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold flex-shrink-0">
                            <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                            <span>Đã đóng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold flex-shrink-0">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span>Chờ đóng</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CỘT PHẢI: CHI TIẾT PHIẾU HỌC PHÍ & MÃ QR */}
              {activeSlip && (
                <div className="lg:col-span-8 bg-[#FBF6EA] border-2 border-[#F8A5C2] rounded-[22px] p-5 lg:p-7 flex flex-col gap-5 shadow-xs">
                  {(() => {
                    const monthPadded = String(activeSlip.month).padStart(2, '0');
                    const monthLabel = `${monthPadded}/${activeSlip.year}`;
                    const transferContent = `${activeSlip.studentCode} - ${removeVietnameseTones(
                      activeSlip.className
                    )} - T${monthPadded}`;

                    return (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="font-playfair text-[24px] lg:text-[26px] font-bold text-[#A61E4D] leading-tight">
                              Phiếu học phí tháng {monthLabel}
                            </h2>
                            <p className="text-[13px] font-semibold text-[#6B5560] mt-0.5">
                              {activeSlip.studentName} ({activeSlip.studentCode}) ·{' '}
                              {activeSlip.className}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {activeSlip.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                                <Check className="w-4 h-4" strokeWidth={2.2} />
                                <span>
                                  Đã thanh toán
                                  {activeSlip.paidAt
                                    ? ` (${formatDateTimeVN(activeSlip.paidAt)})`
                                    : ''}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                                <Clock className="w-4 h-4" strokeWidth={1.75} />
                                <span>Chờ thanh toán</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadStudentSlip(activeSlip)}
                              className="h-[40px] px-4 rounded-[11px] bg-[#D6336C] hover:bg-[#BE285C] text-white text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>Tải phiếu PNG</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-5 flex flex-col justify-between gap-4">
                            <div className="bg-[#FFE0EB] rounded-[16px] p-5 text-center">
                              <span className="text-[13px] font-bold text-[#A61E4D]">
                                Tổng học phí tháng {monthLabel}
                              </span>
                              <div className="font-playfair text-[34px] font-bold text-[#A61E4D] leading-tight mt-1">
                                {formatCurrencyVND(activeSlip.amount)}
                              </div>
                              {activeSlip.attendedCountSnapshot !== null &&
                                activeSlip.unitPriceSnapshot !== null && (
                                  <div className="text-[12px] font-semibold text-[#6B5560] mt-1">
                                    ({activeSlip.attendedCountSnapshot} buổi ×{' '}
                                    {formatCurrencyVND(activeSlip.unitPriceSnapshot)})
                                  </div>
                                )}
                            </div>

                            <div className="bg-[#DCEBFA] rounded-[16px] p-4 flex-1">
                              <h3 className="font-playfair text-[17px] font-bold text-[#1F4E79]">
                                Nhận xét của giáo viên
                              </h3>
                              <p className="text-[14px] font-medium text-[#3B2A35] leading-relaxed mt-1.5 whitespace-pre-line">
                                {activeSlip.teacherComment ||
                                  'Chúc em luôn giữ tinh thần chăm chỉ, rèn luyện tốt kỹ năng đọc hiểu và nghị luận văn học trong tháng học mới!'}
                              </p>
                            </div>
                          </div>

                          <div className="md:col-span-7 bg-white border border-[#F3D9E3] rounded-[16px] p-5 flex flex-col items-center justify-between gap-3 text-center">
                            <div>
                              <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                                Quét mã QR ngân hàng để thanh toán
                              </h3>
                              <p className="text-[13px] font-bold text-[#3B2A35] mt-0.5">
                                HA THAO VAN · 1907 3422 4380 15 (Techcombank)
                              </p>
                            </div>

                            <div className="w-[220px] h-[220px] bg-white border border-[#F3D9E3] rounded-[12px] p-2 flex items-center justify-center overflow-hidden">
                              <svg
                                viewBox="225 523 378 378"
                                className="w-full h-full"
                                role="img"
                                aria-label="Mã QR thanh toán học phí"
                              >
                                <image
                                  href={bankQrImage}
                                  x="0"
                                  y="0"
                                  width="828"
                                  height="1608"
                                />
                              </svg>
                            </div>

                            <div>
                              <div className="text-[15px] font-bold text-[#A61E4D]">
                                Số tiền: {formatCurrencyVND(activeSlip.amount)}
                              </div>
                              <div className="text-[13px] font-semibold text-[#6B5560] mt-0.5">
                                Nội dung chuyển khoản:{' '}
                                <strong className="text-[#3B2A35]">
                                  {transferContent}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // GIAO DIỆN VAI TRÒ ADMIN: LƯỚI LỚP HỌC PHÍ & TIẾN ĐỘ THU THEO THÁNG
  // ============================================================================
  const monthLabel = `${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
  const classTiles = overview?.items || [];
  const summary = overview?.summary;

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35]">
      <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col justify-start gap-5 box-border select-none">
        {/* ==================== HÀNG 1: TIÊU ĐỀ & BỘ CHỌN THÁNG ==================== */}
        <header className="w-full lg:w-[1136px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Học phí
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                <span>Tháng {monthLabel}</span>
              </span>
            </div>

            <div className="mt-1.5">
              <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                Chọn lớp để áp học phí nhanh, theo dõi đã đóng và xuất phiếu QR gửi phụ huynh!
              </span>
            </div>
          </div>

          {/* Bộ chuyển Tháng / Năm + Tổng hợp nhanh doanh thu */}
          <div className="flex flex-wrap items-center gap-2.5">
            {summary && summary.expectedAmount > 0 && (
              <div className="px-3.5 py-2 rounded-[12px] bg-white border border-[#F3D9E3] text-[12px] font-bold flex items-center gap-3">
                <span className="text-[#1F4E79]">
                  Đã thu: {formatCurrencyVND(summary.collectedAmount)}
                </span>
                <span className="text-[#D9CBD2]">|</span>
                <span className="text-[#6B5560]">
                  Dự thu: {formatCurrencyVND(summary.expectedAmount)}
                </span>
              </div>
            )}

            <div className="h-[44px] px-3 bg-white border border-[#9C6B84] rounded-[12px] flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA]/60 cursor-pointer"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <span className="text-[14px] font-bold text-[#3B2A35] min-w-[92px] text-center">
                Tháng {monthLabel}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA]/60 cursor-pointer"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>

        {/* ==================== HÀNG 2: LƯỚI CÁC LỚP THẬT ==================== */}
        {isLoadingAdmin ? (
          <div className="w-full lg:w-[1136px] min-h-[420px] bg-white border border-[#F3D9E3] rounded-[20px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
            <span className="text-[14px] font-semibold text-[#6B5560]">
              Đang tải dữ liệu học phí các lớp...
            </span>
          </div>
        ) : classTiles.length === 0 ? (
          <div className="w-full lg:w-[1136px] min-h-[420px] bg-white border border-[#F3D9E3] rounded-[20px] p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35]">
              Chưa có lớp học nào để quản lý học phí
            </h2>
            <p className="text-[14px] text-[#6B5560] max-w-[420px]">
              Hãy tạo các lớp học và xếp học sinh tại mục Lớp học trước, các ô lớp học phí sẽ tự động hiển thị tại đây.
            </p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.CLASSES)}
              className="mt-2 h-[44px] px-5 rounded-[12px] bg-[#D6336C] text-white text-[14px] font-bold cursor-pointer"
            >
              Đi tới Quản lý lớp học
            </button>
          </div>
        ) : (
          <TileGrid className="lg:w-[1136px] flex-shrink-0">
            {classTiles.map((tile, index) => {
              const theme = getTileTheme(tile, index);
              const isHovered = hoveredTileId === tile.id;
              const billedCount = tile.paidCount + tile.unpaidCount;

              return (
                <div
                  key={tile.id}
                  onClick={() =>
                    navigate(
                      `${ROUTES.TUITION_CLASS_DETAIL.replace(
                        ':id',
                        tile.id
                      )}?month=${selectedMonth}&year=${selectedYear}`
                    )
                  }
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
                    <div className="w-10 h-10 lg:w-[44px] lg:h-[44px] rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <Wallet
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: theme.textColor }}
                        strokeWidth={1.75}
                      />
                    </div>

                    {tile.studentCount > 0 && (
                      <span
                        style={{ color: theme.textColor }}
                        className="px-2.5 py-1 rounded-full bg-white text-[11px] font-bold leading-none"
                      >
                        {billedCount === 0
                          ? 'Chưa tạo phiếu'
                          : `Đã đóng ${tile.paidCount}/${tile.studentCount}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between w-full gap-2">
                    <div className="flex flex-col min-w-0 flex-1">
                      <h2
                        style={{ color: theme.textColor }}
                        className="font-playfair text-[26px] md:text-[30px] lg:text-[34px] font-bold leading-tight tracking-tight line-clamp-2"
                      >
                        {tile.name}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[13px] lg:text-[14px] font-semibold text-[#3B2A35]">
                        <Users className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                        <span className="truncate">
                          {tile.studentCount} học sinh
                          {tile.collectedAmount > 0
                            ? ` · ${formatCurrencyVND(tile.collectedAmount)}`
                            : ''}
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 lg:w-[36px] lg:h-[36px] rounded-full bg-white flex items-center justify-center text-[#3B2A35] flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>
              );
            })}
          </TileGrid>
        )}
      </div>
    </div>
  );
};
