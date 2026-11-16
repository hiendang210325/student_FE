import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  X,
  Pencil,
  Check,
  FileText,
  Download,
} from 'lucide-react';
import bankQrImage from '@/assets/images/mã_qr_ngân_hàng.jpg';
import { exportTuitionSlipPng } from '../utils/exportTuitionSlipPng';

export interface TuitionModalStudent {
  id: number;
  studentCode: string;
  fullName: string;
  parentPhone: string;
  tuitionAmount: string | null;
  teacherComment?: string;
  lastSavedAt?: string;
}

interface TuitionPaymentModalProps {
  student: TuitionModalStudent | null;
  classNameLabel?: string;
  monthLabel?: string;
  onClose: () => void;
  onSave: (studentId: number, formattedAmount: string, comment: string, savedAt: string) => void;
}

// Nhận xét mặc định mẫu cho học sinh
const DEFAULT_COMMENT =
  'Nam học rất chăm chỉ, tiến bộ rõ ở kỹ năng phân tích văn bản. Em cần luyện thêm cách mở bài và dẫn chứng trong bài nghị luận.';

// Định dạng chuỗi số thành dạng tiền tệ có dấu chấm ngăn cách hàng nghìn (ví dụ: 1.200.000)
const formatTuitionNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Loại bỏ dấu tiếng Việt để tạo nội dung chuyển khoản không dấu chuẩn ngân hàng
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const TuitionPaymentModal: React.FC<TuitionPaymentModalProps> = ({
  student,
  classNameLabel = 'Lớp 10',
  monthLabel = '11/2026',
  onClose,
  onSave,
}) => {
  const [amountInput, setAmountInput] = useState<string>('1.200.000');
  const [comment, setComment] = useState<string>(DEFAULT_COMMENT);
  const [savedAt, setSavedAt] = useState<string>('09:12, 13/11/2026');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(true);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!student) return;
    const rawDigits = student.tuitionAmount
      ? student.tuitionAmount.replace(/\D/g, '')
      : '1200000';
    setAmountInput(formatTuitionNumber(rawDigits));
    setComment(student.teacherComment ?? DEFAULT_COMMENT);
    setSavedAt(student.lastSavedAt ?? '09:12, 13/11/2026');
    setIsInputFocused(true);
  }, [student]);

  if (!student) return null;

  const displayAmount = amountInput ? `${amountInput} đ` : '0 đ';
  const monthCode = monthLabel.split('/')[0] || '11';
  const transferContent = `${student.studentCode} - ${removeVietnameseTones(classNameLabel)} - T${monthCode}`;
  const downloadFileName = `${student.fullName} - ${classNameLabel}.png`;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTuitionNumber(e.target.value);
    setAmountInput(formatted);
  };

  const handleSaveClick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const formattedTime = `${hh}:${mm}, ${dd}/${mo}/${yyyy}`;

    setSavedAt(formattedTime);
    onSave(student.id, displayAmount, comment, formattedTime);
  };

  // Xuất ảnh Phiếu học phí chân dung 1080×1350 px để giáo viên tải về gửi phụ huynh
  const handleDownloadImage = () => {
    void exportTuitionSlipPng({
      studentName: student.fullName,
      classNameLabel,
      studentCode: student.studentCode,
      monthLabel,
      formattedAmount: displayAmount,
      transferContent,
      teacherComment: comment,
      fileName: downloadFileName,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[rgba(59,42,53,0.35)] p-0 md:p-4 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tuition-modal-title"
    >
      {/* Bottom sheet trên mobile, hộp thoại căn giữa trên tablet/desktop */}
      <div
        className="w-full md:w-[min(880px,92vw)] lg:w-[880px] max-h-[90dvh] lg:max-h-none lg:h-[700px] bg-white rounded-t-[20px] md:rounded-[20px] shadow-[0_20px_50px_rgba(59,42,53,0.18)] flex flex-col justify-between overflow-hidden font-nunito text-[#3B2A35]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh kéo nhỏ trên mobile */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#E5D3DC]" />
        </div>
        {/* ==================== HEADER ==================== */}
        <div className="min-h-[68px] lg:h-[80px] px-4 lg:px-6 py-3 lg:py-0 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon chip tròn 48px */}
            <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] rounded-full bg-[#FFE0EB] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-[#A61E4D]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h2
                id="tuition-modal-title"
                className="font-playfair text-[20px] lg:text-[24px] font-bold text-[#3B2A35] leading-tight truncate"
              >
                Học phí tháng {monthLabel}
              </h2>
              <p className="text-[13px] lg:text-[14px] font-medium text-[#6B5560] mt-0.5 truncate">
                {student.fullName} · {classNameLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#FFF6F9] hover:text-[#3B2A35] transition-colors cursor-pointer flex-shrink-0"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* ==================== BODY (cuộn trên mobile/tablet) ==================== */}
        <div className="flex-1 px-4 lg:px-6 py-3 flex flex-col justify-between gap-3 overflow-y-auto lg:overflow-hidden">
          {/* Phần trên: 2 cột xếp chồng trên mobile, chia 5/7 từ md trở lên */}
          <div className="lg:h-[336px] grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[24px] flex-shrink-0">
            {/* CỘT TRÁI (5/12): Thẻ #FFF6F9 */}
            <div className="md:col-span-5 bg-[#FFF6F9] rounded-[16px] p-4 lg:p-5 flex flex-col justify-between gap-3 lg:gap-0 lg:h-full box-border">
              <div>
                <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-snug mb-2">
                  Thông tin học sinh
                </h3>

                {/* 4 dòng nhãn - giá trị ngăn cách bởi đường kẻ 1px #F3D9E3 */}
                <div className="divide-y divide-[#F3D9E3]">
                  <div className="py-1.5 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#6B5560]">Họ và tên</span>
                    <span className="text-[16px] font-bold text-[#3B2A35] text-right truncate">
                      {student.fullName}
                    </span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#6B5560]">Lớp</span>
                    <span className="text-[16px] font-bold text-[#3B2A35]">{classNameLabel}</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#6B5560]">Mã học sinh</span>
                    <span className="text-[16px] font-bold text-[#3B2A35]">{student.studentCode}</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#6B5560]">Tháng</span>
                    <span className="text-[16px] font-bold text-[#3B2A35]">{monthLabel}</span>
                  </div>
                </div>
              </div>

              {/* Ô nhập Học phí 1 tháng (cao 56px, Playfair Display 28px, hậu tố "đ") */}
              <div className="pt-1">
                <label
                  htmlFor="tuition-amount-input"
                  className="block text-[13px] font-semibold text-[#6B5560] mb-1.5"
                >
                  Học phí 1 tháng
                </label>
                <div
                  onClick={() => amountRef.current?.focus()}
                  className={`h-[56px] px-3.5 bg-white rounded-[12px] flex items-center justify-between transition-all cursor-text ${
                    isInputFocused
                      ? 'border border-[#2F6FA8] ring-2 ring-[#2F6FA8]/80'
                      : 'border border-[#9C6B84]'
                  }`}
                >
                  <input
                    ref={amountRef}
                    id="tuition-amount-input"
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={handleAmountChange}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className="w-full bg-transparent outline-none font-playfair text-[28px] font-bold text-[#3B2A35] leading-none"
                    placeholder="0"
                  />
                  <span className="font-playfair text-[24px] font-bold text-[#6B5560] ml-2 flex-shrink-0">
                    đ
                  </span>
                </div>
                <p className="text-[12px] text-[#6B5560] mt-1">
                  Giáo viên nhập số tiền học phí
                </p>
              </div>
            </div>

            {/* CỘT PHẢI (7/12): Thẻ trắng viền 1px #F3D9E3, bo góc 16px, căn giữa */}
            <div className="md:col-span-7 bg-white border border-[#F3D9E3] rounded-[16px] px-4 lg:px-5 py-4 lg:py-2 flex flex-col items-center justify-between gap-3 lg:gap-0 lg:h-full box-border">
              <div className="text-center">
                <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-tight">
                  Quét mã để thanh toán
                </h3>
                <p className="text-[13px] font-bold text-[#3B2A35] leading-snug mt-0.5">
                  HA THAO VAN
                </p>
                <p className="text-[13px] font-semibold text-[#6B5560] leading-snug tracking-wide">
                  1907 3422 4380 15
                </p>
              </div>

              {/* Khung ảnh vuông 212×212px viền 1px #F3D9E3, bo góc 12px phóng to lấy riêng phần mã QR */}
              <div className="w-[212px] h-[212px] bg-white border border-[#F3D9E3] rounded-[12px] p-2 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <svg
                  viewBox="225 523 378 378"
                  className="w-full h-full"
                  role="img"
                  aria-label="Mã QR ngân hàng thanh toán học phí"
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

              {/* Số tiền đồng bộ trực tiếp theo ô nhập và nội dung chuyển khoản */}
              <div className="text-center">
                <div className="font-nunito text-[20px] font-bold text-[#A61E4D] leading-tight">
                  Số tiền: {displayAmount}
                </div>
                <div className="text-[13px] font-medium text-[#6B5560] mt-0.5">
                  Nội dung chuyển khoản: {transferContent}
                </div>
              </div>
            </div>
          </div>

          {/* Phần dưới: Thẻ nhận xét toàn chiều rộng */}
          <div className="min-h-[140px] lg:h-[168px] bg-white border border-[#F3D9E3] rounded-[16px] px-4 lg:px-5 py-3 flex flex-col justify-between flex-shrink-0 box-border">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#A61E4D]" strokeWidth={1.75} />
              <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-tight">
                Nhận xét của giáo viên
              </h3>
            </div>

            <div className="relative flex-1 mt-1.5 flex flex-col">
              <textarea
                rows={4}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập nhận xét gửi phụ huynh..."
                className="w-full flex-1 px-3.5 py-2 pb-6 rounded-[12px] border border-[#9C6B84] focus:border-[#2F6FA8] focus:ring-2 focus:ring-[#2F6FA8]/25 outline-none resize-none text-[14px] leading-snug text-[#3B2A35]"
              />
              <span className="absolute right-3 bottom-2 text-[12px] font-medium text-[#6B5560] pointer-events-none">
                {comment.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* ==================== FOOTER (cố định dưới đáy) ==================== */}
        <div className="lg:h-[80px] px-4 lg:px-6 py-3 lg:py-0 border-t border-[#F3D9E3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-shrink-0 bg-white">
          {/* Bên trái: 2 dòng trạng thái nhỏ */}
          <div className="flex flex-col gap-0.5 lg:gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[12px] lg:text-[13px] font-semibold text-[#1F4E79]">
              <Check className="w-4 h-4 text-[#1F4E79] flex-shrink-0" strokeWidth={2} />
              <span>Đã lưu lúc {savedAt}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B5560] truncate">
              <FileText className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
              <span className="truncate">Tên file tải xuống: {downloadFileName}</span>
            </div>
          </div>

          {/* Bên phải: Nút chữ "Đóng", nút "Lưu" (#2F6FA8) và nút chính "Tải xuống" (#D6336C) */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="hidden md:inline-flex h-[48px] px-4 rounded-[12px] text-[14px] font-bold text-[#6B5560] hover:bg-[#FFF6F9] hover:text-[#3B2A35] items-center justify-center transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleSaveClick}
              className="w-full sm:w-auto h-[48px] px-5 rounded-[12px] bg-[#2F6FA8] hover:bg-[#255C8D] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={2} />
              <span>Lưu</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="w-full sm:w-auto h-[48px] px-5 rounded-[12px] bg-[#D6336C] hover:bg-[#BE285C] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" strokeWidth={2} />
              <span>Tải xuống</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

