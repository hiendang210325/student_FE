import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClassRoom } from '../types/class.types';

interface DeleteClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  targetClass: ClassRoom | null;
  isLoading?: boolean;
}

export const DeleteClassDialog: React.FC<DeleteClassDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetClass,
  isLoading = false,
}) => {
  if (!targetClass) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-[12px] bg-white border border-[#F3D9E3] shadow-[0_20px_50px_rgba(59,42,53,0.18)]">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Trash2 className="w-6 h-6 text-[#1F4E79]" strokeWidth={1.75} />
          </div>

          <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
            Xóa lớp {targetClass.name}?
          </DialogTitle>

          <DialogDescription className="font-nunito text-[14px] text-[#6B5560] leading-relaxed">
            Lớp học <strong className="text-[#3B2A35] font-bold">{targetClass.name}</strong> ({targetClass.totalStudents} học sinh) sẽ được gỡ khỏi hệ thống. Các học sinh trong lớp vẫn được giữ nguyên trong danh sách Học sinh và chỉ được gỡ khỏi lớp này.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-[#F3D9E3]/70 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto h-[44px] px-5 rounded-[10px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-slate-50 text-[14px] font-semibold cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full sm:w-auto h-[44px] px-6 rounded-[10px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white font-bold text-[14px] shadow-xs active:scale-95 gap-2 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Xác nhận xóa</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
