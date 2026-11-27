import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  X,
  Pencil,
  Check,
  FileText,
  Download,
  Mail,
  Calculator,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import bankQrImage from '@/assets/images/mã_qr_ngân_hàng.jpg';
import { exportTuitionSlipPng } from '../utils/exportTuitionSlipPng';
import {
  TuitionClassStudentRow,
  TuitionPaymentMethod,
  TuitionPaymentStatus,
} from '../types/tuition.types';

interface TuitionPaymentModalProps {
  student: TuitionClassStudentRow | null;
  classNameLabel: string;
  month: number;
  year: number;
  totalClassSessionsInMonth: number;
  onClose: () => void;
  onSave: (payload: {
    studentId: string;
    amount: number;
    teacherComment: string;
    status: TuitionPaymentStatus;
    paymentMethod: TuitionPaymentMethod | null;
    attendedCountSnapshot: number | null;
    unitPriceSnapshot: number | null;
  }) => Promise<void>;
  onSendEmail: (recordId: string) => Promise<void>;
}

const formatTuitionNumber = (raw: string | number): string => {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedMoney = (formatted: string): number => {
  const digits = formatted.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const removeVietnameseTones = (str: string): string => {
  return str
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

export const TuitionPaymentModal: React.FC<TuitionPaymentModalProps> = ({
  student,
  classNameLabel,
  month,
  year,
  totalClassSessionsInMonth,
  onClose,
  onSave,
  onSendEmail,
}) => {
  const [amountInput, setAmountInput] = useState<string>('');
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [status, setStatus] = useState<TuitionPaymentStatus>('UNPAID');
  const [paymentMethod, setPaymentMethod] = useState<TuitionPaymentMethod>('TRANSFER');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!student) return;
    if (student.record) {
      setAmountInput(formatTuitionNumber(student.record.amount));
      setUnitPriceInput(
        student.record.unitPriceSnapshot
          ? formatTuitionNumber(student.record.unitPriceSnapshot)
          : ''
      );
      setComment(student.record.teacherComment || '');
      setStatus(student.record.status);
      setPaymentMethod(student.record.paymentMethod || 'TRANSFER');
    } else {
      setAmountInput('');
      setUnitPriceInput('');
      setComment('');
      setStatus('UNPAID');
      setPaymentMethod('TRANSFER');
    }
  }, [student]);

  if (!student) return null;

  const monthPadded = String(month).padStart(2, '0');
  const monthLabel = `${monthPadded}/${year}`;
  const numericAmount = parseFormattedMoney(amountInput);
  const displayAmount = `${formatTuitionNumber(numericAmount) || '0'} đ`;
  const transferContent = `${student.studentCode} - ${removeVietnameseTones(
    classNameLabel
  )} - T${monthPadded}`;
  const downloadFileName = `${student.fullName} - ${classNameLabel} - T${monthPadded}-${year}.png`;

  const handleApplyPerSessionCalc = () => {
    const unit = parseFormattedMoney(unitPriceInput);
    if (unit <= 0) return;
    const computed = student.attendedCount * unit;
    setAmountInput(formatTuitionNumber(computed));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const unitNum = parseFormattedMoney(unitPriceInput);
      await onSave({
        studentId: student.studentId,
        amount: numericAmount,
        teacherComment: comment.trim(),
        status,
        paymentMethod: status === 'PAID' ? paymentMethod : null,
        attendedCountSnapshot: unitNum > 0 ? student.attendedCount : null,
        unitPriceSnapshot: unitNum > 0 ? unitNum : null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmailClick = async () => {
    if (!student.record?.id) return;
    setIsSendingEmail(true);
    try {
      await onSendEmail(student.record.id);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadImage = () => {
    void exportTuitionSlipPng({
      studentName: student.fullName,
      classNameLabel,
      studentCode: student.studentCode,
      monthLabel,
      formattedAmount: displayAmount,
      transferContent,
      teacherComment: comment.trim(),
      fileName: downloadFileName,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[rgba(59,42,53,0.35)] p-0 md:p-4 select-none"
      onClick={() => !isSaving && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tuition-modal-title"
    >
      <div
        className="w-full md:w-[min(900px,94vw)] max-h-[92dvh] bg-white rounded-t-[20px] md:rounded-[20px] shadow-[0_20px_50px_rgba(59,42,53,0.18)] flex flex-col justify-between overflow-hidden font-nunito text-[#3B2A35]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề đầu hộp thoại */}
        <div className="px-5 lg:px-6 py-4 border-b border-[#F3D9E3] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[44px] h-[44px] rounded-full bg-[#FFE0EB] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-[#A61E4D]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h2
                id="tuition-modal-title"
                className="font-playfair text-[20px] lg:text-[23px] font-bold text-[#3B2A35] leading-tight truncate"
              >
                Phiếu học phí tháng {monthLabel}
              </h2>
              <p className="text-[13px] font-medium text-[#6B5560] mt-0.5 truncate">
                {student.fullName} ({student.studentCode}) · {classNameLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#FFF6F9] hover:text-[#3B2A35] cursor-pointer flex-shrink-0"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Thân hộp thoại */}
        <div className="flex-1 px-5 lg:px-6 py-4 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* CỘT TRÁI (6/12): Thông tin học sinh, Chuyên cần & Nhập học phí */}
            <div className="md:col-span-6 bg-[#FFF6F9] rounded-[16px] p-4 flex flex-col justify-between gap-3.5 border border-[#F3D9E3]/70">
              <div className="divide-y divide-[#F3D9E3] text-[13px]">
                <div className="py-1.5 flex items-center justify-between gap-2">
                  <span className="font-medium text-[#6B5560]">Học sinh</span>
                  <span className="font-bold text-[#3B2A35] text-right">
                    {student.fullName} ({student.studentCode})
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-2">
                  <span className="font-medium text-[#6B5560]">SĐT / Email</span>
                  <span className="font-semibold text-[#3B2A35] text-right truncate">
                    {student.parentPhone || '—'}
                    {student.email ? ` · ${student.email}` : ''}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-2">
                  <span className="font-medium text-[#6B5560]">
                    Chuyên cần tháng {monthLabel}
                  </span>
                  <span className="font-bold text-[#1F4E79]">
                    Có mặt {student.attendedCount}/{totalClassSessionsInMonth} buổi
                    {student.excusedLeaveCount > 0
                      ? ` · ${student.excusedLeaveCount} phép`
                      : ''}
                  </span>
                </div>
              </div>

              {/* Công cụ tính nhanh theo buổi từ Điểm danh */}
              <div className="p-2.5 rounded-[12px] bg-white border border-[#F3D9E3] space-y-1.5">
                <div className="text-[12px] font-bold text-[#1F4E79] flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Tính nhanh theo số buổi có mặt ({student.attendedCount} buổi):</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={unitPriceInput}
                    onChange={(e) =>
                      setUnitPriceInput(formatTuitionNumber(e.target.value))
                    }
                    placeholder="Đơn giá / 1 buổi (VD: 150.000)"
                    className="flex-1 h-[36px] px-3 rounded-[9px] border border-[#9C6B84] text-[12px] font-bold text-[#3B2A35] outline-none focus:border-[#2F6FA8]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPerSessionCalc}
                    className="h-[36px] px-3 rounded-[9px] bg-[#E9F3FF] hover:bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    Nhân {student.attendedCount} buổi
                  </button>
                </div>
              </div>

              {/* Ô nhập Học phí tháng */}
              <div>
                <label
                  htmlFor="tuition-amount-input"
                  className="block text-[13px] font-bold text-[#3B2A35] mb-1"
                >
                  Mức học phí tháng {monthLabel}
                </label>
                <div
                  onClick={() => amountRef.current?.focus()}
                  className="h-[52px] px-3.5 bg-white rounded-[12px] border-2 border-[#2F6FA8] flex items-center justify-between cursor-text"
                >
                  <input
                    ref={amountRef}
                    id="tuition-amount-input"
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={(e) => setAmountInput(formatTuitionNumber(e.target.value))}
                    className="w-full bg-transparent outline-none font-playfair text-[26px] font-bold text-[#3B2A35] leading-none"
                    placeholder="VD: 1.200.000"
                  />
                  <span className="font-playfair text-[22px] font-bold text-[#6B5560] ml-2">
                    đ
                  </span>
                </div>
              </div>

              {/* Trạng thái đóng học phí */}
              <div className="space-y-2">
                <span className="block text-[12px] font-bold text-[#3B2A35]">
                  Trạng thái thanh toán:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('UNPAID')}
                    className={`h-[40px] rounded-[10px] text-[12px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      status === 'UNPAID'
                        ? 'bg-[#FFE0EB] border-[#A61E4D] text-[#A61E4D]'
                        : 'bg-white border-[#F3D9E3] text-[#6B5560]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Chờ đóng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('PAID')}
                    className={`h-[40px] rounded-[10px] text-[12px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      status === 'PAID'
                        ? 'bg-[#DCEBFA] border-[#2F6FA8] text-[#1F4E79]'
                        : 'bg-white border-[#F3D9E3] text-[#6B5560]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã đóng học phí</span>
                  </button>
                </div>

                {status === 'PAID' && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[12px] font-semibold text-[#6B5560]">
                      Hình thức:
                    </span>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TRANSFER')}
                      className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold cursor-pointer ${
                        paymentMethod === 'TRANSFER'
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-white border border-[#F3D9E3] text-[#3B2A35]'
                      }`}
                    >
                      Chuyển khoản QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold cursor-pointer ${
                        paymentMethod === 'CASH'
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-white border border-[#F3D9E3] text-[#3B2A35]'
                      }`}
                    >
                      Tiền mặt
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI (6/12): Mã QR ngân hàng gốc */}
            <div className="md:col-span-6 bg-white border border-[#F3D9E3] rounded-[16px] p-4 flex flex-col items-center justify-between gap-3">
              <div className="text-center">
                <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-tight">
                  Quét mã để thanh toán
                </h3>
                <p className="text-[13px] font-bold text-[#3B2A35] mt-0.5">
                  HA THAO VAN
                </p>
                <p className="text-[13px] font-semibold text-[#6B5560] tracking-wide">
                  1907 3422 4380 15 · Techcombank
                </p>
              </div>

              <div className="w-[208px] h-[208px] bg-white border border-[#F3D9E3] rounded-[12px] p-2 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="225 523 378 378"
                  className="w-full h-full"
                  role="img"
                  aria-label="Mã QR ngân hàng thanh toán học phí"
                >
                  <image href={bankQrImage} x="0" y="0" width="828" height="1608" />
                </svg>
              </div>

              <div className="text-center">
                <div className="font-nunito text-[19px] font-bold text-[#A61E4D]">
                  Số tiền: {displayAmount}
                </div>
                <div className="text-[12px] font-semibold text-[#6B5560] mt-0.5">
                  Nội dung CK: <strong className="text-[#3B2A35]">{transferContent}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Nhận xét của giáo viên */}
          <div className="bg-white border border-[#F3D9E3] rounded-[16px] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#A61E4D]" strokeWidth={1.75} />
                <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                  Nhận xét tháng học gửi phụ huynh
                </h3>
              </div>
              <span className="text-[12px] font-semibold text-[#6B5560]">
                {comment.length}/500
              </span>
            </div>

            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`VD: Tháng này ${student.fullName} đi học đều đặn, tiếp thu bài tốt và có nhiều tiến bộ ở phần viết đoạn văn nghị luận...`}
              className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#9C6B84] focus:border-[#2F6FA8] focus:ring-2 focus:ring-[#2F6FA8]/25 outline-none resize-none text-[14px] leading-snug text-[#3B2A35]"
            />
          </div>
        </div>

        {/* Chân hộp thoại */}
        <div className="px-5 lg:px-6 py-3.5 border-t border-[#F3D9E3] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white flex-shrink-0">
          <div className="flex flex-col gap-0.5 text-[12px] min-w-0">
            {student.record ? (
              <div className="flex items-center gap-1.5 font-semibold text-[#1F4E79]">
                <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} />
                <span>
                  Đã lưu lúc {formatDateTimeVN(student.record.updatedAt)}
                  {student.record.emailSentAt
                    ? ` · Đã gửi email lúc ${formatDateTimeVN(student.record.emailSentAt)}`
                    : ''}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-[#A61E4D]">
                Chưa lưu phiếu học phí tháng này — hãy bấm Lưu phiếu trước khi gửi Email
              </span>
            )}
            <div className="flex items-center gap-1.5 text-[#6B5560] truncate">
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Ảnh tải về: {downloadFileName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] px-3.5 rounded-[12px] text-[13px] font-bold text-[#6B5560] hover:bg-[#FFF6F9] cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              disabled={!student.record?.id || !student.email || isSendingEmail}
              onClick={handleSendEmailClick}
              title={
                !student.email
                  ? 'Học sinh chưa có Email trong hồ sơ'
                  : !student.record?.id
                  ? 'Hãy bấm Lưu phiếu học phí trước khi gửi Email'
                  : `Gửi tới ${student.email}`
              }
              className="h-[44px] px-4 rounded-[12px] border border-[#2F6FA8] bg-[#E9F3FF] hover:bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold inline-flex items-center gap-1.5 disabled:opacity-45 cursor-pointer"
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>Gửi Email</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="h-[44px] px-4 rounded-[12px] border border-[#D6336C] bg-white hover:bg-[#FFF0F6] text-[#D6336C] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải PNG</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveClick}
              className="h-[44px] px-5 rounded-[12px] bg-[#D6336C] hover:bg-[#BE285C] text-white text-[13px] font-bold inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" strokeWidth={2.2} />
              )}
              <span>Lưu phiếu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
