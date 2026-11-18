import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { accountApi } from '../api/accountApi';
import logoImage from '@/assets/logo/logo.png';
import {
  Copy,
  Check,
  Mail,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User,
  Key,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';

interface CredentialCardModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  account,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!account) return null;

  const loginUrl = `${window.location.origin}/login`;
  const password = account.temporaryPassword || 'Password123!';

  // Tạo mẫu tin nhắn chỉn chu để giáo viên copy gửi Zalo hoặc tin nhắn cho phụ huynh / học sinh
  const messageTemplate = `🌸 THÔNG TIN TÀI KHOẢN HỌC TẬP — LỚP VĂN CHỊ VÂN 🌸
Chào em ${account.fullName}, cô gửi em thông tin đăng nhập vào hệ thống học tập trực tuyến của lớp:

📌 Mã học sinh (Tên đăng nhập): ${account.studentCode}
📧 Email: ${account.email || 'Chưa cập nhật (em có thể bổ sung sau khi đăng nhập)'}
🔑 Mật khẩu: ${password}
🌐 Đường dẫn đăng nhập: ${loginUrl}

💡 Em có thể đăng nhập bằng Mã học sinh hoặc Email. Sau khi vào lớp lần đầu, em nhớ bổ sung email và đổi mật khẩu để bảo mật nhé!
Chúc em có những giờ học Văn thật nhiều cảm hứng cùng Chị Vân! ✨`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendEmail = async () => {
    if (!account.email) {
      setEmailStatus('Học sinh chưa có email. Vui lòng sao chép tin nhắn để gửi qua Zalo/SMS.');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await accountApi.sendCredentials(account.id, password);
      if (res.data?.emailSent) {
        setEmailStatus('Đã gửi thông tin đăng nhập đến hòm thư học sinh thành công!');
      } else {
        setEmailStatus('Đã xuất thông tin qua Console Mailer (chưa gắn SMTP).');
      }
    } catch {
      setEmailStatus('Không thể gửi email lúc này. Vui lòng sao chép tin nhắn gửi qua Zalo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-bgPink border border-[#F8A5C2]/50 text-brand-btnPink text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
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

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs font-nunito text-brand-textMuted font-medium">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Link đăng nhập:</span>
              </div>
              <a
                href={loginUrl}
                target="_blank"
                rel="noreferrer"
                className="font-nunito font-bold text-xs text-brand-focusBlue hover:underline flex items-center gap-1"
              >
                <span>{loginUrl}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Thông báo trạng thái gửi email */}
        {emailStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* ==========================================
            CÁC HÀNH ĐỘNG GỬI ĐẾN CHO HỌC SINH
            ========================================== */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-nunito font-bold text-brand-textDark">
            Gửi thông tin cho học sinh qua:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Nút 1: Sao chép tin nhắn Zalo / SMS */}
            <Button
              type="button"
              variant="outline"
              onClick={() => copyToClipboard(messageTemplate, 'message')}
              className="h-10 text-xs font-nunito font-bold border-brand-border hover:bg-[#FFF6F9] hover:text-brand-btnPink flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedField === 'message' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Đã sao chép tin nhắn!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 text-[#2F6FA8]" />
                  <span>Sao chép mẫu gửi Zalo/SMS</span>
                </>
              )}
            </Button>

            {/* Nút 2: Gửi Email trực tiếp */}
            <Button
              type="button"
              disabled={isSendingEmail || !account.email}
              title={!account.email ? 'Học sinh chưa có email (sao chép mẫu để gửi Zalo)' : undefined}
              onClick={handleSendEmail}
              className="h-10 text-xs font-nunito font-bold bg-brand-btnPink hover:bg-brand-btnPinkHover text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Đang gửi email...' : 'Gửi Email ngay cho học sinh'}</span>
            </Button>
          </div>
        </div>

        {/* Hướng dẫn ngắn */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] font-nunito text-brand-textMuted">
            💡 Học sinh có thể dùng <strong>Mã học sinh ({account.studentCode})</strong> hoặc <strong>Email</strong> kết hợp cùng mật khẩu trên để đăng nhập.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
