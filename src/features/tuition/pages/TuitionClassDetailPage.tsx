import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wallet,
  Check,
  Calendar,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TuitionPaymentModal,
  TuitionModalStudent,
} from '../components/TuitionPaymentModal';

// Kiểu dữ liệu học phí của từng học sinh trong Lớp 10
type ClassTuitionStudent = TuitionModalStudent;

// Danh sách đúng 10 học sinh của Lớp 10 kèm mức học phí tháng 11 theo đặc tả
const CLASS_10_TUITION_STUDENTS: ClassTuitionStudent[] = [
  {
    id: 1,
    studentCode: 'HS0007',
    fullName: 'Phạm Hoàng Nam',
    parentPhone: '0900 111 207',
    tuitionAmount: '1.200.000 đ',
  },
  {
    id: 2,
    studentCode: 'HS0009',
    fullName: 'Hoàng Minh Khôi',
    parentPhone: '0900 111 209',
    tuitionAmount: '1.200.000 đ',
  },
  {
    id: 3,
    studentCode: 'HS0021',
    fullName: 'Nguyễn Thu Hà',
    parentPhone: '0900 111 221',
    tuitionAmount: '1.200.000 đ',
  },
  {
    id: 4,
    studentCode: 'HS0022',
    fullName: 'Trần Đức Anh',
    parentPhone: '0900 111 222',
    tuitionAmount: '1.200.000 đ',
  },
  {
    id: 5,
    studentCode: 'HS0023',
    fullName: 'Lê Phương Thảo',
    parentPhone: '0900 111 223',
    tuitionAmount: '1.000.000 đ',
  },
  {
    id: 6,
    studentCode: 'HS0024',
    fullName: 'Võ Thành Đạt',
    parentPhone: '0900 111 224',
    tuitionAmount: '1.200.000 đ',
  },
  {
    id: 7,
    studentCode: 'HS0025',
    fullName: 'Đặng Khánh Vy',
    parentPhone: '0900 111 225',
    tuitionAmount: '1.200.000 đ',
  },
  {
    id: 8,
    studentCode: 'HS0026',
    fullName: 'Bùi Quốc Bảo',
    parentPhone: '0900 111 226',
    tuitionAmount: null,
  },
  {
    id: 9,
    studentCode: 'HS0027',
    fullName: 'Phan Ngọc Mai',
    parentPhone: '0900 111 227',
    tuitionAmount: null,
  },
  {
    id: 10,
    studentCode: 'HS0028',
    fullName: 'Dương Hải Đăng',
    parentPhone: '0900 111 228',
    tuitionAmount: '1.200.000 đ',
  },
];

// Hàm lấy chữ cái đầu của họ và tên để hiển thị trong avatar 36px
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const TuitionClassDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<ClassTuitionStudent[]>(CLASS_10_TUITION_STUDENTS);
  // Học sinh đang được chọn để mở hộp thoại nhập học phí và mã QR (mặc định null để không tự mở khi tải trang)
  const [selectedStudent, setSelectedStudent] = useState<ClassTuitionStudent | null>(null);
  // Thông báo Toast phản hồi sau khi lưu học phí
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ngày, tháng và năm đang xem (mặc định 13/11/2026)
  const [selectedDay, setSelectedDay] = useState<number>(13);
  const [selectedMonth, setSelectedMonth] = useState<number>(11);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [pickerMonth, setPickerMonth] = useState<number>(11);
  const [pickerYear, setPickerYear] = useState<number>(2026);
  const [pickerMode, setPickerMode] = useState<'day' | 'month'>('day');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Đóng bảng chọn ngày/tháng/năm khi bấm ra ngoài
  useEffect(() => {
    if (!isDatePickerOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  const monthLabel = `${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
  const fullDateLabel = `${String(selectedDay).padStart(2, '0')}/${monthLabel}`;

  // Số ngày trong một tháng bất kỳ
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // Vị trí thứ trong tuần (Thứ 2 = 0 ... Chủ nhật = 6) của ngày 1
  const getMondayStartOffset = (month: number, year: number): number => {
    const jsDay = new Date(year, month - 1, 1).getDay(); // CN = 0, T2 = 1...
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  const handlePrevMonth = () => {
    const nextMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const nextYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const maxDays = getDaysInMonth(nextMonth, nextYear);
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    if (selectedDay > maxDays) setSelectedDay(maxDays);
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    const maxDays = getDaysInMonth(nextMonth, nextYear);
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    if (selectedDay > maxDays) setSelectedDay(maxDays);
  };

  const handleToggleDatePicker = () => {
    setPickerMonth(selectedMonth);
    setPickerYear(selectedYear);
    setPickerMode('day');
    setIsDatePickerOpen((prev) => !prev);
  };

  const handleSelectDayFromPicker = (day: number) => {
    setSelectedDay(day);
    setSelectedMonth(pickerMonth);
    setSelectedYear(pickerYear);
    setIsDatePickerOpen(false);
  };

  const handleSelectMonthInPicker = (month: number) => {
    setPickerMonth(month);
    setPickerMode('day');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Lưu số tiền học phí và nhận xét giáo viên cho học sinh, đóng hộp thoại và hiện thông báo
  const handleSaveTuition = (
    studentId: number,
    formattedAmount: string,
    comment: string,
    savedAt: string
  ) => {
    const targetStudent = students.find((item) => item.id === studentId);
    setStudents((prev) =>
      prev.map((item) =>
        item.id === studentId
          ? {
              ...item,
              tuitionAmount: formattedAmount,
              teacherComment: comment,
              lastSavedAt: savedAt,
            }
          : item
      )
    );
    setSelectedStudent(null);
    showToast(
      `Đã lưu học phí (${formattedAmount}) cho ${targetStudent?.fullName ?? 'học sinh'} thành công!`
    );
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px] font-nunito text-[#3B2A35]">
        {/* Vùng nội dung chính 1200px trên desktop, co giãn theo viewport trên mobile/tablet */}
        <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-0 lg:justify-between box-border select-none relative">
          {/* Thông báo Toast phản hồi khi lưu học phí */}
          {toastMessage && (
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#1F4E79] text-white px-4 py-3 rounded-[12px] shadow-lg text-[13px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2.2} />
              <span>{toastMessage}</span>
            </div>
          )}
          {/* ==================== HÀNG 1: HEADER ==================== */}
          <header className="min-h-[72px] lg:h-[88px] w-full lg:w-[1136px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              {/* Dòng Breadcrumb phía trên tiêu đề: nút mũi tên quay lại và "Học phí › Lớp 10" */}
              <div className="flex items-center gap-1.5 mb-1 text-[14px] text-[#6B5560]">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.TUITION)}
                  className="p-1 -ml-1 rounded-[6px] hover:bg-white/60 text-[#6B5560] hover:text-[#2F6FA8] transition-colors flex items-center justify-center cursor-pointer"
                  title="Quay lại danh sách lớp học phí"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <Link
                  to={ROUTES.TUITION}
                  className="text-[#2F6FA8] hover:underline cursor-pointer font-semibold"
                >
                  Học phí
                </Link>
                <span className="text-[#6B5560]">›</span>
                <span className="text-[#6B5560] font-semibold">Lớp 10</span>
              </div>

              {/* Tiêu đề "Học phí · Lớp 10" cạnh chip sĩ số */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Học phí · Lớp 10
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                  {students.length} học sinh
                </span>
              </div>

              {/* Ghi chú viết tay của giáo viên dưới tiêu đề kèm gạch chân lượn sóng và 2 sticker pastel */}
              <div className="flex items-center mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Bấm biểu tượng ví để nhập học phí và gửi QR cho phụ huynh!
                  </span>
                </div>

                {/* Đúng 2 sticker vector phẳng pastel (ẩn trên mobile) */}
                <div className="hidden md:flex items-center gap-2 ml-[24px]">
                  {/* Sticker 1: Ngôi sao pastel #F8A5C2 (24px) */}
                  <svg
                    className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                  </svg>

                  {/* Sticker 2: Ngòi bút nhỏ pastel #2F6FA8 (24px) */}
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

            {/* Bên phải: Bộ điều khiển ngày/tháng/năm */}
            <div ref={datePickerRef} className="relative flex-shrink-0 w-full md:w-auto">
              <div className="h-[48px] px-3.5 bg-white border border-[#9C6B84] rounded-[12px] flex items-center justify-between md:justify-start gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA]/60 transition-colors cursor-pointer"
                  aria-label="Tháng trước"
                >
                  <ChevronLeft className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                </button>

                <span className="font-nunito text-[14px] font-bold text-[#3B2A35] pl-1">
                  {fullDateLabel}
                </span>

                {/* Biểu tượng lịch bên cạnh ngày/tháng/năm để mở bảng chọn ngày, tháng, năm bất kỳ */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleToggleDatePicker}
                      className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer ${
                        isDatePickerOpen
                          ? 'bg-[#DCEBFA] text-[#1F4E79]'
                          : 'text-[#1F4E79] hover:bg-[#DCEBFA]/60'
                      }`}
                      aria-label="Chọn ngày, tháng và năm"
                    >
                      <Calendar className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Chọn ngày, tháng &amp; năm</span>
                  </TooltipContent>
                </Tooltip>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#1F4E79] hover:bg-[#DCEBFA]/60 transition-colors cursor-pointer"
                  aria-label="Tháng sau"
                >
                  <ChevronRight className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                </button>
              </div>

              {/* Popover lịch chọn Ngày / Tháng / Năm */}
              {isDatePickerOpen && (
                <div className="absolute right-0 top-[56px] z-40 w-[300px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_12px_32px_rgba(59,42,53,0.14)] p-4">
                  {/* Thanh điều hướng Tháng / Năm */}
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
                      aria-label={pickerMode === 'month' ? 'Năm trước' : 'Tháng trước'}
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPickerMode((prev) => (prev === 'day' ? 'month' : 'day'))
                      }
                      className="px-2.5 py-1 rounded-[8px] font-playfair text-[16px] font-bold text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors cursor-pointer"
                      title="Bấm để chuyển nhanh giữa chọn Ngày và chọn Tháng/Năm"
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
                      aria-label={pickerMode === 'month' ? 'Năm sau' : 'Tháng sau'}
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </div>

                  {pickerMode === 'month' ? (
                    /* Lưới 12 tháng để nhảy nhanh tới tháng & năm bất kỳ */
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => {
                        const isCurrent =
                          month === pickerMonth && pickerYear === selectedYear;
                        return (
                          <button
                            key={month}
                            type="button"
                            onClick={() => handleSelectMonthInPicker(month)}
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
                    /* Lưới lịch chọn ngày trong tháng */
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
                            day === selectedDay &&
                            pickerMonth === selectedMonth &&
                            pickerYear === selectedYear;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleSelectDayFromPicker(day)}
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
          </header>

          {/* ==================== HÀNG 2: THẺ TRẮNG DUY NHẤT ==================== */}
          <div className="w-full lg:w-[1136px] lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between overflow-hidden flex-shrink-0">
            {/* Thanh tiêu đề thẻ */}
            <div className="min-h-[60px] lg:h-[72px] px-4 lg:px-6 py-3 lg:py-0 flex items-center justify-between gap-2 border-b border-[#F3D9E3] flex-shrink-0">
              <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                Danh sách học sinh lớp 10
              </h2>
              <span className="font-nunito text-[13px] lg:text-[14px] font-semibold text-[#6B5560] whitespace-nowrap">
                Học phí tháng {monthLabel}
              </span>
            </div>

            {/* Tiêu đề bảng (ẩn trên mobile, ẩn SĐT phụ huynh trên tablet) */}
            <div className="hidden md:grid md:grid-cols-[120px_1.5fr_160px_100px] lg:flex h-[48px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-semibold items-center border-b border-[#F3D9E3] flex-shrink-0">
              <div className="lg:w-[160px] pl-4 lg:pl-6 flex-shrink-0">Mã học sinh</div>
              <div className="lg:w-[340px] flex-shrink-0">Họ và tên</div>
              <div className="hidden lg:block lg:w-[260px] flex-shrink-0">Số điện thoại phụ huynh</div>
              <div className="lg:w-[220px] flex-shrink-0">Học phí tháng {selectedMonth}</div>
              <div className="lg:w-[156px] pr-4 lg:pr-6 text-center flex-shrink-0">Thao tác</div>
            </div>

            {/* Bảng Tablet/Desktop */}
            <div className="hidden md:flex flex-1 flex-col">
              {students.map((student, index) => {
                // Avatar 36px đan xen hồng (#FFE0EB / #A61E4D) và xanh (#DCEBFA / #1F4E79)
                const isPinkAvatar = index % 2 === 0;

                return (
                  <div
                    key={student.id}
                    className="md:grid md:grid-cols-[120px_1.5fr_160px_100px] lg:flex h-[64px] bg-white hover:bg-[#FFF6F9] border-b border-[#F3D9E3] items-center transition-colors select-none text-[14px]"
                  >
                    {/* Cột 1: Mã học sinh */}
                    <div className="lg:w-[160px] pl-4 lg:pl-6 font-semibold text-[#3B2A35] flex-shrink-0">
                      {student.studentCode}
                    </div>

                    {/* Cột 2: Họ và tên kèm avatar chữ cái đầu 36px */}
                    <div className="lg:w-[340px] flex items-center gap-3 pr-4 flex-shrink-0 min-w-0">
                      <div
                        className={`w-[36px] h-[36px] rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                          isPinkAvatar
                            ? 'bg-[#FFE0EB] text-[#A61E4D]'
                            : 'bg-[#DCEBFA] text-[#1F4E79]'
                        }`}
                      >
                        {getInitials(student.fullName)}
                      </div>
                      <span className="font-bold text-[#3B2A35] text-[14px] truncate" title={student.fullName}>
                        {student.fullName}
                      </span>
                    </div>

                    {/* Cột 3: Số điện thoại phụ huynh (ẩn trên tablet) */}
                    <div className="hidden lg:block lg:w-[260px] font-medium text-[#3B2A35] flex-shrink-0">
                      {student.parentPhone}
                    </div>

                    {/* Cột 4: Học phí tháng */}
                    <div className="lg:w-[220px] flex-shrink-0">
                      {student.tuitionAmount ? (
                        <span className="font-bold text-[15px] text-[#3B2A35]">
                          {student.tuitionAmount}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                          <Clock className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                          <span>Chưa nhập</span>
                        </span>
                      )}
                    </div>

                    {/* Cột 5: Thao tác */}
                    <div className="lg:w-[156px] pr-4 lg:pr-6 flex items-center justify-center flex-shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(student)}
                            className="w-[40px] h-[40px] rounded-[10px] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer"
                            aria-label={`Học phí và mã QR của ${student.fullName}`}
                          >
                            <Wallet className="w-[18px] h-[18px] text-[#1F4E79]" strokeWidth={1.75} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span>Học phí và mã QR</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden divide-y divide-[#F3D9E3]">
              {students.map((student, index) => {
                const isPinkAvatar = index % 2 === 0;
                return (
                  <div
                    key={student.id}
                    className="p-4 bg-white flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                          isPinkAvatar
                            ? 'bg-[#FFE0EB] text-[#A61E4D]'
                            : 'bg-[#DCEBFA] text-[#1F4E79]'
                        }`}
                      >
                        {getInitials(student.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[15px] text-[#3B2A35] truncate">
                          {student.fullName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-mono text-[12px] font-semibold text-[#6B5560]">
                            {student.studentCode}
                          </span>
                          <span className="text-[#F3D9E3]">•</span>
                          {student.tuitionAmount ? (
                            <span className="font-bold text-[14px] text-[#3B2A35]">
                              {student.tuitionAmount}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                              <Clock className="w-3 h-3 text-[#A61E4D]" strokeWidth={1.75} />
                              <span>Chưa nhập</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className="w-11 h-11 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                      aria-label={`Học phí và mã QR của ${student.fullName}`}
                    >
                      <Wallet className="w-5 h-5 text-[#1F4E79]" strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Chân thẻ cố định (40px): "Lớp 10 có 10 học sinh" */}
            <div className="min-h-[40px] px-4 lg:px-6 border-t border-[#F3D9E3] bg-white flex items-center justify-between flex-shrink-0">
              <span className="font-nunito text-[13px] font-medium text-[#6B5560]">
                Lớp 10 có {students.length} học sinh
              </span>
            </div>
          </div>
        </div>

        {/* Hộp thoại Modal nhập học phí, nhận xét giáo viên và mã QR thanh toán */}
        <TuitionPaymentModal
          student={selectedStudent}
          classNameLabel="Lớp 10"
          monthLabel={monthLabel}
          onClose={() => setSelectedStudent(null)}
          onSave={handleSaveTuition}
        />
      </div>
    </TooltipProvider>
  );
};

