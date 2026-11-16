import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'modal' | 'drawer';
}

// Hộp thoại Modal / Ngăn kéo dùng chung: Bottom sheet trên di động (< md), Modal giữa hoặc Drawer bên phải từ md trở lên
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  variant = 'modal',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
    xl: 'md:max-w-xl',
    '2xl': 'md:max-w-2xl',
  };

  const isDrawer = variant === 'drawer';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center',
        isDrawer ? 'md:items-stretch md:justify-end' : 'md:items-center md:p-4'
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Lớp phủ mờ */}
      <div
        className="fixed inset-0 bg-[rgba(59,42,53,0.35)] transition-opacity"
        onClick={onClose}
      />

      {/* Thân hộp thoại: Bảng trượt đáy (tối đa 90dvh) trên di động, Hộp thoại hoặc Ngăn kéo min(480px, 90vw) từ md */}
      <div
        className={cn(
          'relative w-full bg-white shadow-xl transition-all border border-[#F3D9E3] overflow-hidden flex flex-col',
          'rounded-t-[20px] max-h-[90dvh]',
          isDrawer
            ? 'md:w-[min(480px,90vw)] md:h-[100dvh] md:max-h-[100dvh] md:rounded-l-[16px] md:rounded-r-none'
            : cn('md:rounded-[20px] md:max-h-[90dvh]', maxWidthStyles[maxWidth])
        )}
      >
        {/* Thanh nắm kéo nhỏ trên cùng dành cho bảng trượt đáy di động */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#F3D9E3]" />
        </div>

        {/* Đầu hộp thoại cố định */}
        <div className="flex items-center justify-between border-b border-[#F3D9E3] px-5 md:px-6 py-3.5 md:py-4 flex-shrink-0">
          <div className="min-w-0 pr-3">
            {title && (
              <h3 className="font-playfair text-[20px] font-bold text-[#3B2A35] leading-snug truncate">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[13px] text-[#6B5560] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#FFF6F9] hover:text-[#3B2A35] transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Nội dung cuộn được */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1">{children}</div>

        {/* Chân hộp thoại cố định */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 border-t border-[#F3D9E3] bg-white px-5 md:px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] flex-shrink-0 [&>button]:min-h-[44px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
