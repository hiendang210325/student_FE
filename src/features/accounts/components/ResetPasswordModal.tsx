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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '../api/accountApi';
import { ApiError } from '@/services/api/apiError';
import {
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    fullName: string;
    studentCode: string;
    email: string;
  } | null;
  onSuccess: (newPassword: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) return null;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim() || password.trim().length < 6) {
      setError('Vui lòng tự nhập mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }

    const finalPassword = password.trim();

    setIsLoading(true);
    try {
      const response = await accountApi.resetPassword(account.id, {
        newPassword: finalPassword,
        sendEmail,
      });

      const tempPass = response.data.temporaryPassword || finalPassword;
      onSuccess(tempPass);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-6">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold font-playfair text-brand-textDark">
            Đặt lại mật khẩu học sinh
          </DialogTitle>
          <DialogDescription className="text-xs font-nunito text-brand-textMuted leading-relaxed">
            Cấp mật khẩu mới cho học sinh <strong>{account.fullName}</strong> ({account.studentCode}).
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-nunito space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã học sinh:</span>
              <span className="font-bold font-mono text-[#2F6FA8]">{account.studentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium text-slate-800">{account.email}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-nunito font-bold text-brand-textDark">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Tự nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-10 text-sm font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Hiện mật khẩu"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-nunito font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-slate-300 text-brand-btnPink focus:ring-brand-focusBlue h-4 w-4"
              />
              <span>Gửi thông báo mật khẩu mới đến email học sinh</span>
            </label>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs font-nunito font-bold h-9"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="text-xs font-nunito font-bold h-9 bg-brand-btnPink hover:bg-brand-btnPinkHover text-white"
            >
              {isLoading ? 'Đang cập nhật...' : 'Xác nhận đặt lại'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
