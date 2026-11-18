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
  UserPlus,
  Mail,
  Lock,
  User,
  GraduationCap,
  Phone,
  BookOpen,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountData: {
    id: string;
    fullName: string;
    studentCode: string;
    email?: string;
    className?: string;
    temporaryPassword?: string;
  }) => void;
}

const CLASS_OPTIONS = ['Văn 9A', 'Văn 8B', 'Văn 7C', 'Văn 6D', 'Ôn thi vào 10', 'Văn 10'];

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [className, setClassName] = useState('Văn 9A');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !studentCode.trim()) {
      setError('Vui lòng điền đầy đủ Họ và tên và Mã học sinh.');
      return;
    }

    if (!password.trim() || password.trim().length < 6) {
      setError('Vui lòng tự nhập mật khẩu cho học sinh (tối thiểu 6 ký tự).');
      return;
    }

    if (email.trim()) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Định dạng email không hợp lệ.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await accountApi.createAccount({
        fullName: fullName.trim(),
        studentCode: studentCode.trim().toUpperCase(),
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        password: password.trim(),
        phoneNumber: phoneNumber.trim(),
        className,
        sendEmail: email.trim() ? sendEmail : false,
      });

      const createdUser = response.data.user;
      const tempPass = response.data.temporaryPassword || password.trim();

      // Đóng modal tạo và mở thẻ đăng nhập
      onClose();
      onSuccess({
        id: createdUser.id,
        fullName: createdUser.fullName,
        studentCode: createdUser.studentCode || studentCode.trim().toUpperCase(),
        email: createdUser.email || '',
        className,
        temporaryPassword: tempPass,
      });

      // Đặt lại biểu mẫu
      setFullName('');
      setStudentCode('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bgPink text-brand-btnPink mb-1">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle className="text-2xl font-bold font-playfair text-brand-textDark">
            Tạo tài khoản học sinh
          </DialogTitle>
          <DialogDescription className="text-xs font-nunito text-brand-textMuted leading-relaxed">
            Khởi tạo tài khoản học tập trực tuyến mới cho học sinh. Sau khi tạo, bạn có thể gửi trực tiếp thông tin thẻ đăng nhập đến học sinh.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Trường 1: Họ và tên học sinh */}
          <div className="space-y-1.5">
            <Label htmlFor="create-fullname" className="text-xs font-nunito font-bold text-brand-textDark">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="create-fullname"
                placeholder="VD: Nguyễn Mai Trang"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 h-10 text-sm font-nunito"
                required
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Trường 2: Mã học sinh & Lớp học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-studentcode" className="text-xs font-nunito font-bold text-brand-textDark">
                Mã học sinh <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="create-studentcode"
                  placeholder="VD: HS0043"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  className="pl-9 h-10 text-sm font-mono font-bold text-[#2F6FA8]"
                  required
                />
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-class" className="text-xs font-nunito font-bold text-brand-textDark">
                Lớp theo học
              </Label>
              <div className="relative">
                <select
                  id="create-class"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-inputBorder bg-white font-nunito text-sm font-medium text-brand-textDark focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Trường 3: Email tài khoản (Không bắt buộc) & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-email" className="text-xs font-nunito font-bold text-brand-textDark">
                Email tài khoản <span className="text-[11px] font-normal text-slate-400">(Không bắt buộc)</span>
              </Label>
              <div className="relative">
                <Input
                  id="create-email"
                  type="email"
                  placeholder="hocsinh@gmail.com (hoặc để trống)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-sm font-nunito"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-phone" className="text-xs font-nunito font-bold text-brand-textDark">
                Số điện thoại phụ huynh
              </Label>
              <div className="relative">
                <Input
                  id="create-phone"
                  placeholder="0900 123 456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9 h-10 text-sm font-nunito"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Trường 4: Mật khẩu do Admin tự nhập */}
          <div className="space-y-1.5">
            <Label htmlFor="create-password" className="text-xs font-nunito font-bold text-brand-textDark">
              Mật khẩu đăng nhập <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tự nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 h-10 text-sm font-mono"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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

          {/* Tùy chọn gửi email (chỉ kích hoạt nếu admin có nhập email) */}
          {email.trim() && (
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-nunito font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-slate-300 text-brand-btnPink focus:ring-brand-focusBlue h-4 w-4"
                />
                <span>Gửi email thông tin đăng nhập tự động đến hòm thư học sinh</span>
              </label>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs font-nunito font-bold h-10"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="text-xs font-nunito font-bold h-10 bg-brand-btnPink hover:bg-brand-btnPinkHover text-white shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>{isLoading ? 'Đang tạo...' : 'Tạo tài khoản & Mở thẻ'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
