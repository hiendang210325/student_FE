import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

export interface PermanentDeleteStudent {
  id: string;
  name: string;
  code: string;
  className: string;
  email: string;
}

interface PermanentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: PermanentDeleteStudent | null;
  isLoading?: boolean;
}

export const PermanentDeleteModal: React.FC<PermanentDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  isLoading = false,
}) => {
  // Giá trị ô nhập xác nhận mã học sinh (mặc định điền sẵn mã của học sinh theo thiết kế)
  const [confirmInput, setConfirmInput] = useState('');

  // Tự động điền mã khi mở modal cho học sinh
  useEffect(() => {
    if (student) {
      setConfirmInput(student.code);
    }
  }, [student]);

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const isCodeMatched = confirmInput.trim().toUpperCase() === student.code.trim().toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="perm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(59, 42, 53, 0.35)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Thẻ Dialog: 480px, nền trắng, bo góc 20px, đệm 24px, đổ bóng mềm */}
      <div className="w-[480px] max-w-full bg-white rounded-[20px] p-6 shadow-xl border border-[#F3D9E3] space-y-4 animate-in fade-in zoom-in-95 duration-150 box-border text-[#3B2A35]">
        {/* Đỉnh: Chip biểu tượng tròn 48px (#FFE3E3, biểu tượng tam giác cảnh báo #B02525) */}
        <div className="w-12 h-12 rounded-full bg-[#FFE3E3] flex items-center justify-center text-[#B02525] flex-shrink-0">
          <AlertTriangle className="w-6 h-6" strokeWidth={1.75} />
        </div>

        {/* Tiêu đề Playfair Display 22px */}
        <h2
          id="perm-delete-title"
          className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-snug"
        >
          Xóa vĩnh viễn {student.name}?
        </h2>

        {/* Dòng tóm tắt mini (nền #FFF6F9, viền 1px #F3D9E3, bo góc 12px, đệm 12px) */}
        <div className="bg-[#FFF6F9] border border-[#F3D9E3] rounded-[12px] p-3">
          <p className="font-nunito text-[13px] font-semibold text-[#3B2A35] leading-tight">
            {student.code} · {student.className} · {student.email}
          </p>
        </div>

        {/* Thân thông báo Nunito 14px #3B2A35 */}
        <p className="font-nunito text-[14px] text-[#3B2A35] leading-relaxed">
          Thao tác này xóa hẳn tài khoản và dữ liệu đăng nhập khỏi hệ thống và không thể hoàn tác.
        </p>

        {/* Trường nhập mã xác nhận: nhãn + ô nhập 48px với viền #9C6B84 */}
        <div className="space-y-1.5 pt-1">
          <label
            htmlFor="confirm-code-input"
            className="block font-nunito font-semibold text-[13px] text-[#3B2A35]"
          >
            Nhập mã học sinh {student.code} để xác nhận
          </label>
          <input
            id="confirm-code-input"
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={`Nhập ${student.code}`}
            className="w-full h-12 px-3.5 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[14px] text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#B02525]/20 focus:border-[#B02525] transition-all"
          />
        </div>

        {/* Các nút bấm căn phải, chiều cao đúng 48px */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Nút Hủy: Nút văn bản, màu #6B5560 */}
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-5 rounded-[12px] font-nunito font-semibold text-[14px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#F3D9E3]/30 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          {/* Nút Xóa vĩnh viễn: Điền nền #B02525, chữ trắng, kèm biểu tượng thùng rác, chỉ bật khi mã khớp */}
          <button
            type="button"
            disabled={!isCodeMatched || isLoading}
            onClick={onConfirm}
            className={`h-12 px-6 rounded-[12px] font-nunito font-semibold text-[14px] flex items-center justify-center gap-2 transition-all shadow-2xs ${
              isCodeMatched && !isLoading
                ? 'bg-[#B02525] text-white hover:bg-[#8F1D1D] cursor-pointer'
                : 'bg-[#B02525]/40 text-white/80 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-white" strokeWidth={2} />
                <span>Xóa vĩnh viễn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
