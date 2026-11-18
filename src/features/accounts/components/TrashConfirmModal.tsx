import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export interface TrashConfirmStudent {
  id: string;
  name: string;
  code: string;
  className: string;
  email: string;
}

interface TrashConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: TrashConfirmStudent | null;
}

export const TrashConfirmModal: React.FC<TrashConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
}) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trash-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(59, 42, 53, 0.35)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Thẻ Dialog: 440px, nền trắng, bo góc 20px, đệm 24px, đổ bóng mềm */}
      <div className="w-[440px] max-w-full bg-white rounded-[20px] p-6 shadow-xl border border-[#F3D9E3] space-y-4 animate-in fade-in zoom-in-95 duration-150 box-border text-[#3B2A35]">
        {/* Đỉnh: Chip biểu tượng tròn 48px (#DCEBFA, biểu tượng thùng rác #1F4E79) */}
        <div className="w-12 h-12 rounded-full bg-[#DCEBFA] flex items-center justify-center text-[#1F4E79] flex-shrink-0">
          <Trash2 className="w-6 h-6" strokeWidth={1.75} />
        </div>

        {/* Tiêu đề Playfair Display 22px */}
        <h2
          id="trash-dialog-title"
          className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-snug"
        >
          Chuyển {student.name} vào thùng rác?
        </h2>

        {/* Dòng tóm tắt mini (nền #E9F3FF, bo góc 12px, đệm 12px, thanh trái 4px #1F4E79) */}
        <div className="bg-[#E9F3FF] rounded-[12px] p-3 border-l-4 border-[#1F4E79]">
          <p className="font-nunito text-[13px] font-semibold text-[#1F4E79] leading-tight">
            {student.code} · {student.className} · {student.email}
          </p>
        </div>

        {/* Nội dung thông báo Nunito 14px #3B2A35 */}
        <p className="font-nunito text-[14px] text-[#3B2A35] leading-relaxed">
          Tài khoản sẽ bị ẩn và học sinh không đăng nhập được nữa. Bạn có thể khôi phục trong thùng rác bất cứ lúc nào.
        </p>

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

          {/* Nút Chuyển vào thùng rác: Điền nền #2F6FA8, chữ trắng */}
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 px-6 rounded-[12px] font-nunito font-semibold text-[14px] text-white bg-[#2F6FA8] hover:bg-[#255885] transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
          >
            Chuyển vào thùng rác
          </button>
        </div>
      </div>
    </div>
  );
};
