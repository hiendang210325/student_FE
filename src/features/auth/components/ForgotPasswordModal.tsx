import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  RotateCw,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type ForgotStep = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<ForgotStep>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Trạng thái mã OTP (gồm 6 chữ số)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Trạng thái mật khẩu mới
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động đồng bộ email ban đầu khi hộp thoại mở ra
  useEffect(() => {
    if (isOpen) {
      if (initialEmail) setEmail(initialEmail);
      setStep('EMAIL');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setEmailError(null);
      setOtpError(null);
    }
  }, [isOpen, initialEmail]);

  // Bộ đếm ngược thời gian hết hạn mã OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  // Tự động chuyển tiêu điểm vào ô nhập OTP đầu tiên khi chuyển sang bước xác thực OTP
  useEffect(() => {
    if (step === 'OTP') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Thuật toán tính độ mạnh của mật khẩu
  const calculatePasswordStrength = (pass: string): {
    score: number; // Điểm số từ 0 đến 4
    label: string;
    colorClass: string;
    barColor: string;
    textColor: string;
  } => {
    if (!pass) {
      return {
        score: 0,
        label: 'Chưa nhập',
        colorClass: 'bg-slate-200',
        barColor: 'bg-slate-200',
        textColor: 'text-slate-400',
      };
    }

    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    // Ngưỡng tối thiểu cho các mật khẩu quá ngắn
    if (pass.length > 0 && pass.length < 6) {
      score = 1;
    }

    switch (score) {
      case 1:
        return {
          score: 1,
          label: 'Rất yếu',
          colorClass: 'bg-red-800', // Đỏ đậm
          barColor: 'bg-red-800',
          textColor: 'text-red-800 font-bold',
        };
      case 2:
        return {
          score: 2,
          label: 'Yếu',
          colorClass: 'bg-red-500', // Đỏ
          barColor: 'bg-red-500',
          textColor: 'text-red-500 font-bold',
        };
      case 3:
        return {
          score: 3,
          label: 'Trung bình',
          colorClass: 'bg-amber-400', // Vàng
          barColor: 'bg-amber-400',
          textColor: 'text-amber-600 font-bold',
        };
      case 4:
      default:
        return {
          score: 4,
          label: 'Mạnh',
          colorClass: 'bg-emerald-500', // Xanh
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-600 font-bold',
        };
    }
  };

  const strength = calculatePasswordStrength(newPassword);

  // Kiểm tra xem mật khẩu nhập lại có khớp với mật khẩu mới hay không
  const isPasswordMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const isPasswordMatch =
    confirmPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword === newPassword;

  // Bước 1: Gửi yêu cầu xác nhận địa chỉ Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setEmailError('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: student@email.com)');
      return;
    }

    setIsSubmitting(true);
    // Giả lập cuộc gọi API gửi mã OTP về hòm thư
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('OTP');
      setCountdown(60);
      setIsCounting(true);
    }, 600);
  };

  // Bước 2: Xử lý sự kiện khi người dùng nhập từng ký tự mã OTP
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Lấy ký tự số cuối cùng vừa được nhập vào ô
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError(null);

    // Tự động chuyển con trỏ sang ô nhập tiếp theo
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  const handleResendOtp = () => {
    if (isCounting) return;
    setOtp(['', '', '', '', '', '']);
    setCountdown(60);
    setIsCounting(true);
    setOtpError(null);
    otpInputRefs.current[0]?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOtpError('Vui lòng nhập đầy đủ 6 chữ số mã OTP');
      return;
    }

    setIsSubmitting(true);
    // Giả lập kiểm tra và xác thực mã OTP qua API
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('NEW_PASSWORD');
    }, 600);
  };

  // Bước 3: Gửi và lưu mật khẩu mới
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    // Giả lập cuộc gọi API cập nhật mật khẩu mới vào cơ sở dữ liệu
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('SUCCESS');
    }, 700);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 sm:p-8 overflow-hidden">
        {/* Subtle Step Dots Header */}
        {step !== 'SUCCESS' && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === 'EMAIL'
                    ? 'bg-brand-btnPink text-white'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                1
              </span>
              <span className="h-0.5 w-6 bg-slate-200"></span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === 'OTP'
                    ? 'bg-brand-btnPink text-white'
                    : step === 'NEW_PASSWORD'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </span>
              <span className="h-0.5 w-6 bg-slate-200"></span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === 'NEW_PASSWORD'
                    ? 'bg-brand-btnPink text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </span>
            </div>

            {step !== 'EMAIL' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (step === 'OTP') setStep('EMAIL');
                  if (step === 'NEW_PASSWORD') setStep('OTP');
                }}
                className="text-xs text-slate-500 hover:text-brand-textDark gap-1 px-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Quay lại</span>
              </Button>
            )}
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 'EMAIL' && (
          <form onSubmit={handleEmailSubmit} className="space-y-5 pt-2">
            <DialogHeader className="text-left space-y-1">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bgPink text-brand-btnPink mb-1">
                <KeyRound className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold font-playfair text-brand-textDark">
                Quên mật khẩu?
              </DialogTitle>
              <DialogDescription className="text-sm font-nunito text-brand-textMuted leading-relaxed">
                Nhập địa chỉ email tài khoản học sinh hoặc giáo viên để nhận mã xác thực OTP khôi phục mật khẩu.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="font-nunito font-bold text-sm text-brand-textDark">
                Email tài khoản <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="nguyenvana@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  error={!!emailError}
                  className="pl-10 h-11 text-sm font-nunito"
                  required
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {emailError && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium font-nunito mt-1">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-nunito font-bold"
              >
                {isSubmitting ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: ENTER OTP CODE */}
        {step === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5 pt-2">
            <DialogHeader className="text-left space-y-1">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-brand-focusBlue mb-1">
                <Mail className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold font-playfair text-brand-textDark">
                Nhập mã xác thực OTP
              </DialogTitle>
              <DialogDescription className="text-sm font-nunito text-brand-textMuted leading-relaxed">
                Mã xác thực gồm 6 chữ số đã được gửi đến hộp thư{' '}
                <strong className="text-brand-textDark font-semibold">{email}</strong>. Vui lòng kiểm tra và nhập mã bên dưới.
              </DialogDescription>
            </DialogHeader>

            {/* 6 Digit Inputs */}
            <div className="space-y-2">
              <Label className="font-nunito font-bold text-sm text-brand-textDark block text-center sm:text-left">
                Mã xác thực 6 số
              </Label>
              <div className="flex justify-between gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <Input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    error={!!otpError}
                    className="h-12 sm:h-13 w-11 sm:w-12 text-center text-xl font-bold text-brand-textDark rounded-xl border-slate-200 focus-visible:border-brand-focusBlue focus-visible:ring-2 focus-visible:ring-brand-focusBlue/20"
                  />
                ))}
              </div>
              {otpError && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium font-nunito mt-1 justify-center sm:justify-start">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{otpError}</span>
                </p>
              )}
            </div>

            {/* Resend OTP timer */}
            <div className="text-center text-xs font-nunito text-slate-500 py-1">
              {isCounting ? (
                <span>
                  Gửi lại mã xác thực sau{' '}
                  <strong className="text-brand-focusBlue font-semibold">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 text-brand-btnPink font-bold hover:underline cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Gửi lại mã OTP</span>
                </button>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-nunito font-bold"
              >
                {isSubmitting ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: ENTER NEW PASSWORD & CONFIRMATION */}
        {step === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
            <DialogHeader className="text-left space-y-1">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bgPink text-brand-btnPink mb-1">
                <Lock className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold font-playfair text-brand-textDark">
                Tạo mật khẩu mới
              </DialogTitle>
              <DialogDescription className="text-sm font-nunito text-brand-textMuted leading-relaxed">
                Vui lòng đặt mật khẩu mới an toàn có ít nhất 8 ký tự, kết hợp chữ hoa, chữ số và ký tự đặc biệt.
              </DialogDescription>
            </DialogHeader>

            {/* Input 1: Mật khẩu mới */}
            <div className="space-y-1.5">
              <Label
                htmlFor="new-password"
                className="font-nunito font-bold text-sm text-brand-textDark flex items-center justify-between"
              >
                <span>Mật khẩu mới</span>
                {newPassword && (
                  <span className={`text-xs ${strength.textColor}`}>
                    Độ mạnh: {strength.label}
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10 h-11 text-sm font-nunito"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label="Hiện hoặc ẩn mật khẩu"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter: Đỏ đậm -> Đỏ -> Vàng -> Xanh */}
              <div className="pt-1.5">
                <div className="grid grid-cols-4 gap-1.5 h-2 w-full">
                  {/* Segment 1: Rất yếu (Đỏ đậm) */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 1 ? strength.barColor : 'bg-slate-200'
                    }`}
                  />
                  {/* Segment 2: Yếu (Đỏ) */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 2 ? strength.barColor : 'bg-slate-200'
                    }`}
                  />
                  {/* Segment 3: Trung bình (Vàng) */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 3 ? strength.barColor : 'bg-slate-200'
                    }`}
                  />
                  {/* Segment 4: Mạnh (Xanh) */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 4 ? strength.barColor : 'bg-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Input 2: Xác nhận mật khẩu mới (với viền đỏ nếu không khớp) */}
            <div className="space-y-1.5 pt-1">
              <Label
                htmlFor="confirm-password"
                className="font-nunito font-bold text-sm text-brand-textDark flex items-center justify-between"
              >
                <span>Xác nhận mật khẩu mới</span>
                {isPasswordMatch && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mật khẩu đã khớp
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={isPasswordMismatch}
                  className={`pr-10 h-11 text-sm font-nunito transition-colors ${
                    isPasswordMismatch
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 bg-red-50/20'
                      : isPasswordMatch
                      ? 'border-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20'
                      : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label="Hiện hoặc ẩn mật khẩu"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Error warning in red if mismatch */}
              {isPasswordMismatch && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-semibold font-nunito mt-1">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Mật khẩu xác nhận không khớp, vui lòng kiểm tra lại.</span>
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || isPasswordMismatch || !newPassword || !confirmPassword}
                className="w-full h-11 text-base font-nunito font-bold"
              >
                {isSubmitting ? 'Đang lưu mật khẩu...' : 'Xác nhận đặt lại mật khẩu'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold font-playfair text-brand-textDark">
                Đổi mật khẩu thành công!
              </DialogTitle>
              <DialogDescription className="text-sm font-nunito text-brand-textMuted max-w-sm mx-auto leading-relaxed">
                Mật khẩu cho tài khoản <strong className="text-brand-textDark">{email}</strong> đã được cập nhật an toàn. Bây giờ bạn có thể đăng nhập ngay với mật khẩu mới.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-3">
              <Button
                type="button"
                onClick={onClose}
                className="w-full h-11 text-base font-nunito font-bold"
              >
                Đăng nhập ngay
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

