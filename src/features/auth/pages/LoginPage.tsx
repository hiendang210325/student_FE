import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/routes/paths';
import { APP_ROLES } from '@/config/constants';
import logoImage from '@/assets/logo/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const REMOTE_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5XV2DZhNznkwE3mOSYkuOE891bMae4iGN-rXsw38OrmD8yYr8yTbYHFjWqKQr9pcZ3J3bSWdLzRAJJFBmkmEqfzKm3dWce_XeesHzsRIE-PpUyv2dXqTY-lJ9n6MHu8aNyYo7bL65XhmaA5s4rpVe5mV9920DKVBDq_Lo9Mug5cW0yU3EyNzZr8ViOjcc8-HcD5uCyjf1SwQWP9CqKoaWzj8RWz-iRpsBiiuhJQ1hVaKsei8REwj';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState('nguyenvana@email.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState(logoImage || REMOTE_LOGO_URL);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate authentication request
      setTimeout(() => {
        login(
          {
            id: 1,
            username: username,
            fullName: 'Nguyễn Văn A',
            email: username,
            role: APP_ROLES.ADMIN,
            isActive: true,
          },
          'demo_access_token_token'
        );
        setIsLoading(false);
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 500);
    } catch (err: unknown) {
      setIsLoading(false);
      setError(
        err instanceof Error ? err.message : 'Tài khoản hoặc mật khẩu không chính xác'
      );
    }
  };

  return (
    <div className="font-nunito text-brand-textDark bg-brand-bgPink antialiased selection:bg-brand-marginPink selection:text-brand-textDark m-0 p-0 overflow-x-hidden min-h-screen flex flex-col justify-center">
      {/* Desktop Screen Container (1440x900 base aspect) */}
      <main className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* ==========================================
             LEFT PANEL (~58% width): Ruled notebook page
             ========================================== */}
        <section className="w-full lg:w-[58%] min-h-[560px] lg:min-h-screen notebook-paper flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Vector Sticker 1: Tiny Pastel Blue Star in Top-Right Left Panel */}
          <div
            className="absolute top-10 right-14 pointer-events-none select-none"
            aria-hidden="true"
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="#8EC5FC"
              className="drop-shadow-sm opacity-90 transform rotate-12"
            >
              <path d="M12 2L14.8 8.6L22 9.3L16.6 14.1L18.2 21.2L12 17.5L5.8 21.2L7.4 14.1L2 9.3L9.2 8.6L12 2Z" />
            </svg>
          </div>

          {/* Vector Sticker 2: Small Pastel Pink Heart in Bottom-Left Left Panel */}
          <div
            className="absolute bottom-12 left-20 pointer-events-none select-none"
            aria-hidden="true"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#F8A5C2"
              className="drop-shadow-sm opacity-85 transform -rotate-12"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Upper Branding & Headings */}
          <div className="z-10 pl-6 sm:pl-10 max-w-xl">
            {/* Logo */}
            <div className="mb-6">
              <img
                src={logoSrc}
                onError={() => setLogoSrc(REMOTE_LOGO_URL)}
                alt="Logo Lớp Văn chị Vân"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain select-none pointer-events-none drop-shadow-sm"
              />
            </div>

            {/* Heading */}
            <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-brand-textDark tracking-tight mb-3">
              Lớp Văn chị Vân
            </h1>

            {/* One-line description */}
            <p className="font-nunito font-semibold text-lg sm:text-xl text-brand-textMuted leading-relaxed">
              Quản lý lịch học, điểm danh, bài tập và học phí cho lớp dạy thêm.
            </p>
          </div>

          {/* Signature Element: Handwritten-style teacher's margin note */}
          <div className="z-10 pl-6 sm:pl-10 my-10 lg:my-14 max-w-md">
            <div className="inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-[#FFF9EC]/90 px-4 py-2.5 rounded-lg border border-[#F8A5C2]/40 shadow-xs">
                <span className="font-playfair italic font-medium text-2xl sm:text-[26px] text-brand-btnPink squiggle-underline tracking-wide">
                  &ldquo;Em nhớ nộp bài đúng hạn nhé!&rdquo;
                </span>
                <div className="text-right mt-2 text-xs font-nunito font-semibold text-brand-textPink tracking-wide">
                  — Lời nhắn từ Chị Vân ✍️
                </div>
              </div>
            </div>
          </div>

          {/* Notebook Bottom Note / Tag */}
          <div className="z-10 pl-6 sm:pl-10 text-xs text-brand-textMuted font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-focusBlue"></span>
            <span>
              Hệ thống phân quyền thông minh: Tự động điều hướng Học sinh, Giáo viên &amp; Quản trị viên
            </span>
          </div>
        </section>

        {/* ==========================================
             RIGHT PANEL (~42% width): Soft pink background & Login Card
             ========================================== */}
        <section className="w-full lg:w-[42%] bg-brand-bgPink flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Vector Sticker 3: Small Pastel Blue Tiny Open Book / Quill outside card edges */}
          <div
            className="absolute top-8 right-8 pointer-events-none select-none hidden sm:block"
            aria-hidden="true"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2F6FA8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-75 transform rotate-6"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="#CFE8FF" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="#CFE8FF" />
            </svg>
          </div>

          {/* White Login Card: 24px radius, soft flat shadow, no glass effect */}
          <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(214,51,108,0.08)] border border-[#F8A5C2]/30 relative z-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-playfair font-bold text-3xl sm:text-[34px] text-brand-textDark leading-tight mb-2">
                Chào mừng trở lại
              </h2>
              <p className="font-nunito font-semibold text-base text-brand-textMuted">
                Đăng nhập để vào Lớp Văn chị Vân
              </p>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Field 1: Tên đăng nhập hoặc email */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="font-nunito font-bold text-sm text-brand-textDark"
                >
                  Tên đăng nhập hoặc email
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nguyenvana@email.com"
                    className="h-[48px] px-4 rounded-xl font-nunito font-medium text-brand-textDark bg-white text-base transition-all duration-150 border-2 border-brand-focusBlue focus-visible:ring-2 focus-visible:ring-brand-focusBlue/20"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Mật khẩu (with show/hide eye icon at the right) */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-nunito font-bold text-sm text-brand-textDark"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="h-[48px] pl-4 pr-12 rounded-xl font-nunito font-medium text-brand-textDark bg-white text-base transition-all duration-150 border border-brand-inputBorder focus-visible:border-brand-focusBlue focus-visible:ring-2 focus-visible:ring-brand-focusBlue/20 placeholder:text-brand-textMuted/70"
                    required
                  />
                  {/* Show/Hide Password Eye Button */}
                  <button
                    type="button"
                    id="togglePasswordBtn"
                    aria-label="Hiện hoặc ẩn mật khẩu"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textMuted hover:text-brand-textDark p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-focusBlue transition-colors cursor-pointer"
                  >
                    {!showPassword ? (
                      /* Eye Open Icon */
                      <Eye className="w-5 h-5" strokeWidth={1.8} />
                    ) : (
                      /* Eye Closed Icon */
                      <EyeOff className="w-5 h-5" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Auxiliary options: Ghi nhớ & Quên mật khẩu */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-nunito font-medium select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-brand-btnPink focus:ring-brand-focusBlue h-4 w-4"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="font-nunito font-bold text-xs text-brand-focusBlue hover:text-brand-btnPink transition-colors cursor-pointer hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Primary Button: full width, 48px high, #D6336C, white text */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[48px] rounded-xl font-nunito font-bold text-base text-white bg-brand-btnPink hover:bg-brand-btnPinkHover active:scale-[0.99] transition-all shadow-[0_4px_12px_rgba(214,51,108,0.25)] flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5 text-white" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </div>

              {/* Footnote under button: Phụ huynh không cần đăng nhập */}
              <div className="pt-1 text-center">
                <p className="font-nunito font-semibold text-xs sm:text-[13px] text-brand-textMuted leading-relaxed">
                  Phụ huynh không cần đăng nhập — mở link hoá đơn do lớp gửi.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal (shadcn UI Dialog with Email -> OTP -> New Password with strength validation) */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={username}
      />
    </div>
  );
};
