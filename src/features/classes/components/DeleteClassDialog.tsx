import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClassTileItem } from '../types/class.types';

interface DeleteClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetClass: ClassTileItem | null;
}

export const DeleteClassDialog: React.FC<DeleteClassDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetClass,
}) => {
  if (!targetClass) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-[12px] bg-white border border-[#F3D9E3] shadow-[0_20px_50px_rgba(59,42,53,0.18)]">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          {/* Biểu tượng thùng rác màu xanh dịu chuẩn nhận diện thương hiệu */}
          <div className="w-12 h-12 rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Trash2 className="w-6 h-6 text-[#1F4E79]" strokeWidth={1.75} />
          </div>

          <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
            Xóa {targetClass.name}?
          </DialogTitle>

          <DialogDescription className="font-nunito text-[14px] text-[#6B5560] leading-relaxed">
            Lớp học <strong className="text-[#3B2A35] font-bold">{targetClass.name}</strong> ({targetClass.studentCount} học sinh) sẽ được gỡ khỏi danh sách lớp học của hệ thống.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-[#F3D9E3]/70 flex flex-row items-center justify-end gap-3 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-[44px] px-5 rounded-[10px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-slate-50 text-[14px] font-semibold"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="h-[44px] px-6 rounded-[10px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white font-bold text-[14px] shadow-xs active:scale-95"
          >
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

