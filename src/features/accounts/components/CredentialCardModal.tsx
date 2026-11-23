import React, { useState } from 'react';
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
import logoImage from '@/assets/logo/logo.png';
import {
  Copy,
  Check,
  Mail,
  User,
  Key,
  GraduationCap,
  Eye,
  Send,
  Loader2,
} from 'lucide-react';
import { accountApi } from '../api/accountApi';

interface CredentialCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetail?: (account: {
    id: string;
    fullName: string;
    studentCode: string;
    email?: string;
    className?: string;
    temporaryPassword?: string;
  }) => void;
  account: {
    id: string;
    fullName: string;
    studentCode: string;
    email?: string;
    className?: string;
    temporaryPassword?: string;
  } | null;
}

export const CredentialCardModal: React.FC<CredentialCardModalProps> = ({
  isOpen,
  onClose,
  onViewDetail,
  account,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!account) return null;

  const password = account.temporaryPassword || 'Password123!';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendCredentialsEmail = async () => {
    if (!account.email || isSendingEmail) return;
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await accountApi.sendCredentials(account.id, password);
      setEmailStatus(
        res.data?.emailSent
          ? `Đã gửi thông tin đăng nhập tới ${account.email}!`
          : 'Đã ghi nhận yêu cầu gửi email (kiểm tra cấu hình SMTP).'
      );
    } catch {
      setEmailStatus('Không thể gửi email lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleViewDetail = () => {
    onClose();
    if (onViewDetail) {
      onViewDetail(account);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-bgPink border border-[#F8A5C2]/50 text-brand-btnPink text-xs font-bold w-fit">
            
            <span>Thẻ Thông Tin Đăng Nhập Học Sinh</span>
          </div>
          <DialogTitle className="text-2xl font-bold font-playfair text-brand-textDark pt-1">
            Cấp tài khoản: {account.fullName}
          </DialogTitle>
          <DialogDescription className="text-xs font-nunito text-brand-textMuted leading-relaxed">
            Thẻ thông tin để gửi trực tiếp cho học sinh hoặc phụ huynh đăng nhập vào hệ thống Lớp Văn chị Vân.
          </DialogDescription>
        </DialogHeader>

        {/* ==========================================
            TẤM THẺ HỌC SINH PASTEL CHUẨN THƯƠNG HIỆU
            ========================================== */}
        <div className="my-3 rounded-[20px] bg-gradient-to-br from-[#FFF5F8] via-[#FFFFFF] to-[#FFF0F5] border-2 border-[#F8A5C2]/60 p-5 shadow-[0_8px_24px_rgba(214,51,108,0.08)] relative overflow-hidden">
          {/* Logo mờ góc dưới */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 pointer-events-none select-none">
            <img src={logoImage} alt="" className="w-full h-full object-contain" />
          </div>

          {/* Phần đầu thẻ: Logo & Nhận diện lớp */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F8A5C2]/30">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImage}
                alt="Logo"
                className="w-9 h-9 object-contain rounded-lg"
              />
              <div>
                <h4 className="font-playfair font-bold text-base text-brand-textDark leading-tight">
                  Lớp Văn chị Vân
                </h4>
                <p className="text-[11px] font-nunito font-semibold text-brand-textMuted">
                  Cổng học sinh trực tuyến
                </p>
              </div>
            </div>
            <Badge className="bg-[#D6336C] hover:bg-[#D6336C] text-white text-[11px] font-bold px-2.5 py-0.5">
              {account.className || 'Học sinh chính thức'}
            </Badge>
          </div>

          {/* Thông tin học sinh */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-nunito text-brand-textMuted font-medium">
                <User className="w-3.5 h-3.5 text-brand-btnPink" />
                <span>Họ và tên học sinh:</span>
              </div>
              <span className="font-nunito font-bold text-sm text-brand-textDark">
                {account.fullName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-nunito text-brand-textMuted font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-[#2F6FA8]" />
                <span>Mã học sinh (đăng nhập):</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-[#2F6FA8] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
                  {account.studentCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(account.studentCode, 'code')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Sao chép mã học sinh"
                >
                  {copiedField === 'code' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-nunito text-brand-textMuted font-medium">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Email tài khoản:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {account.email ? (
                  <>
                    <span className="font-nunito font-bold text-xs text-brand-textDark">
                      {account.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(account.email || '', 'email')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                      title="Sao chép email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                ) : (
                  <span className="font-nunito text-xs text-slate-400 italic">
                    Chưa cập nhật (bổ sung sau)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-nunito text-brand-textMuted font-medium">
                <Key className="w-3.5 h-3.5 text-rose-500" />
                <span>Mật khẩu ban đầu:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-[#D6336C] bg-white px-2 py-0.5 rounded-md border border-[#F8A5C2]/60 shadow-2xs">
                  {password}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(password, 'password')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Sao chép mật khẩu"
                >
                  {copiedField === 'password' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hướng dẫn ngắn */}
        <div className="pt-2 text-center border-t border-slate-100 space-y-1">
          <p className="text-[11px] font-nunito text-brand-textMuted">
            💡 Học sinh có thể dùng <strong>Mã học sinh ({account.studentCode})</strong> hoặc <strong>Email</strong> kết hợp cùng mật khẩu trên để đăng nhập.
          </p>
          {emailStatus && (
            <p className="text-[11px] font-nunito font-bold text-[#2F6FA8]">
              {emailStatus}
            </p>
          )}
        </div>

        {/* Chân hộp thoại: Các nút hành động */}
        <DialogFooter className="pt-3 flex flex-row flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-[#9C6B84] text-[#3B2A35] font-nunito font-semibold text-sm hover:bg-[#FFE0EB]/40 cursor-pointer"
          >
            Đóng
          </Button>
          {account.email && (
            <Button
              type="button"
              variant="outline"
              disabled={isSendingEmail}
              onClick={handleSendCredentialsEmail}
              className="h-10 px-3.5 rounded-xl border border-[#2F6FA8] text-[#2F6FA8] font-nunito font-bold text-sm hover:bg-[#E9F3FF] flex items-center gap-1.5 cursor-pointer"
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Gửi qua Email</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={handleViewDetail}
            className="h-10 px-4 rounded-xl bg-[#2F6FA8] hover:bg-[#255885] text-white font-nunito font-bold text-sm flex items-center gap-2 shadow-[0_2px_8px_rgba(47,111,168,0.25)] cursor-pointer"
          >
            <Eye className="w-4 h-4 text-white" strokeWidth={2} />
            <span>Xem chi tiết học sinh</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
