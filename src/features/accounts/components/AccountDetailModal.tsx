import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Clock,
  Check,
  Lock,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export interface AccountDetailInfo {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  className: string;
  status: 'Hoạt động' | 'Tạm khóa' | 'Chưa kích hoạt';
  lastLogin: string;
  avatarBg?: string;
  avatarText?: string;
}

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDetailInfo | null;
  onResetPassword?: (account: { id: string; fullName: string; studentCode: string; email: string }) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
  onResetPassword,
}) => {
  const navigate = useNavigate();

  if (!account) return null;

  const initials = account.name
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const handleGoToStudentProfile = () => {
    onClose();
    navigate(`/students/${account.code}`);
  };

  const handleResetPasswordClick = () => {
    onClose();
    if (onResetPassword) {
      onResetPassword({
        id: account.id,
        fullName: account.name,
        studentCode: account.code,
        email: account.email === 'Chưa cập nhật email' ? '' : account.email,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9F3FF] border border-[#BFDBFE] text-[#1F4E79] text-xs font-bold w-fit">
            <User className="w-3.5 h-3.5" />
            <span>Hồ Sơ Tài Khoản Học Sinh</span>
          </div>
          <DialogTitle className="text-2xl font-bold font-playfair text-[#3B2A35] pt-1">
            Chi tiết tài khoản: {account.name}
          </DialogTitle>
          <DialogDescription className="text-xs font-nunito text-[#6B5560] leading-relaxed">
            Xem thông tin tài khoản đăng nhập, lớp học và trạng thái hoạt động trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        {/* Thẻ tóm tắt thông tin học sinh */}
        <div className="my-2 p-4 rounded-[16px] bg-[#FFF6F9] border border-[#F3D9E3] flex items-center gap-4">
          <div
            style={{
              backgroundColor: account.avatarBg || '#DCEBFA',
              color: account.avatarText || '#1F4E79',
            }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 select-none shadow-2xs"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[17px] text-[#3B2A35] leading-tight truncate">
              {account.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-block bg-[#E9F3FF] text-[#1F4E79] font-mono font-bold text-[12px] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
                {account.code}
              </span>
              {account.status === 'Hoạt động' && (
                <span className="inline-flex items-center gap-1 bg-[#DCEBFA] text-[#1F4E79] font-bold text-[11px] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-[#1F4E79]" strokeWidth={2.5} />
                  <span>Đang hoạt động</span>
                </span>
              )}
              {account.status === 'Tạm khóa' && (
                <span className="inline-flex items-center gap-1 bg-[#FFE0EB] text-[#A61E4D] font-bold text-[11px] px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3 text-[#A61E4D]" strokeWidth={2} />
                  <span>Đang tạm khóa</span>
                </span>
              )}
              {account.status === 'Chưa kích hoạt' && (
                <span className="inline-flex items-center gap-1 bg-[#EFE9ED] text-[#6B5560] font-bold text-[11px] px-2 py-0.5 rounded-full">
                  <Mail className="w-3 h-3 text-[#6B5560]" strokeWidth={2} />
                  <span>Chưa kích hoạt</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chi tiết từng trường dữ liệu */}
        <div className="space-y-2.5 text-xs font-nunito">
          {/* Hàng 1: Lớp học */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-[#6B5560] font-semibold">
              <GraduationCap className="w-4 h-4 text-[#2F6FA8]" />
              <span>Lớp đang theo học:</span>
            </div>
            <Badge className="bg-[#FFE0EB] hover:bg-[#FFE0EB] text-[#A61E4D] font-bold text-xs px-2.5 py-0.5">
              {account.className}
            </Badge>
          </div>

          {/* Hàng 2: Email đăng nhập */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-[#6B5560] font-semibold">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>Email liên hệ:</span>
            </div>
            <span className="font-bold text-[#3B2A35] text-xs">
              {account.email}
            </span>
          </div>

          {/* Hàng 3: Số điện thoại */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-[#6B5560] font-semibold">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Số điện thoại:</span>
            </div>
            <span className="font-mono font-bold text-[#3B2A35] text-xs">
              {account.phone}
            </span>
          </div>

          {/* Hàng 4: Lần đăng nhập cuối */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-[#6B5560] font-semibold">
              <Clock className="w-4 h-4 text-[#1F4E79]" />
              <span>Đăng nhập gần nhất:</span>
            </div>
            <span className="font-bold text-[#3B2A35] text-xs">
              {account.lastLogin}
            </span>
          </div>
        </div>

        {/* Chân hộp thoại */}
        <DialogFooter className="pt-3 flex flex-row items-center justify-between gap-2 border-t border-slate-100">
          {onResetPassword && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResetPasswordClick}
              className="h-10 px-3 rounded-xl border border-[#2F6FA8] text-[#2F6FA8] font-nunito font-bold text-xs hover:bg-[#E9F3FF] flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đặt lại MK</span>
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#9C6B84] text-[#3B2A35] font-nunito font-semibold text-sm hover:bg-[#FFE0EB]/40 cursor-pointer"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleGoToStudentProfile}
              className="h-10 px-4 rounded-xl bg-[#2F6FA8] hover:bg-[#255885] text-white font-nunito font-bold text-sm flex items-center gap-1.5 shadow-[0_2px_8px_rgba(47,111,168,0.25)] cursor-pointer"
            >
              <span>Xem trang hồ sơ</span>
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
