import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/routes/paths';
import { ApiError } from '@/services/api/apiError';
import logoImage from '@/assets/logo/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const REMOTE_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5XV2DZhNznkwE3mOSYkuOE891bMae4iGN-rXsw38OrmD8yYr8yTbYHFjWqKQr9pcZ3J3bSWdLzRAJJFBmkmEqfzKm3dWce_XeesHzsRIE-PpUyv2dXqTY-lJ9n6MHu8aNyYo7bL65XhmaA5s4rpVe5mV9920DKVBDq_Lo9Mug5cW0yU3EyNzZr8ViOjcc8-HcD5uCyjf1SwQWP9CqKoaWzj8RWz-iRpsBiiuhJQ1hVaKsei8REwj';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithCredentials, isAuthenticated } = useAuthStore();

  // Ngăn chặn người dùng đã đăng nhập truy cập lại trang /login
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      const result = await loginWithCredentials({
        identifier: username.trim(),
        password,
        rememberMe,
      });

      // Điều hướng người dùng tới Dashboard theo cấu hình
      const targetPath = result.redirectTo || ROUTES.DASHBOARD;
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-nunito text-brand-textDark bg-brand-bgPink antialiased selection:bg-brand-marginPink selection:text-brand-textDark m-0 p-0 overflow-x-hidden min-h-[100dvh] flex flex-col justify-center">
      {/* Khung màn hình máy tính bàn (tỉ lệ chuẩn 1440x900) */}
      <main className="w-full min-h-[100dvh] flex flex-col lg:flex-row">
        {/* ==========================================
             BẢNG BÊN TRÁI (~58% chiều rộng): Trang vở kẻ ô li (ẩn trên di động/máy tính bảng nhỏ, giữ nguyên từ lg)
             ========================================== */}
        <section className="hidden lg:flex w-full lg:w-[58%] lg:min-h-[100dvh] notebook-paper flex-col justify-between p-16 relative overflow-hidden">
          {/* Hình dán Vector 1: Ngôi sao xanh pastel nhỏ ở góc trên bên phải bảng trái */}
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

          {/* Hình dán Vector 2: Trái tim hồng pastel nhỏ ở góc dưới bên trái bảng trái */}
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

          {/* Nhận diện thương hiệu & Tiêu đề phía trên */}
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

            {/* Tiêu đề chính */}
            <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-brand-textDark tracking-tight mb-3">
              Lớp Văn chị Vân
            </h1>

            {/* Mô tả ngắn một dòng */}
            <p className="font-nunito font-semibold text-lg sm:text-xl text-brand-textMuted leading-relaxed">
              Quản lý lịch học, điểm danh, bài tập và học phí cho lớp dạy thêm.
            </p>
          </div>

          {/* Điểm nhấn thương hiệu: Ghi chú lề viết tay đặc trưng của giáo viên */}
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
        </section>

        {/* ==========================================
             BẢNG BÊN PHẢI (~42% chiều rộng): Nền hồng phấn mềm mại & Thẻ đăng nhập
             ========================================== */}
        <section className="w-full flex-1 lg:flex-initial lg:w-[42%] bg-brand-bgPink flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
          {/* Logo thu gọn trên di động và máy tính bảng (ẩn từ lg vì đã có bảng trái) */}
          <div className="lg:hidden flex flex-col items-center mb-5 text-center">
            <img
              src={logoSrc}
              onError={() => setLogoSrc(REMOTE_LOGO_URL)}
              alt="Logo Lớp Văn chị Vân"
              className="w-20 h-20 object-contain select-none pointer-events-none drop-shadow-sm mb-2"
            />
            <span className="font-playfair font-bold text-2xl text-brand-textDark">
              Lớp Văn chị Vân
            </span>
          </div>

          {/* Hình dán Vector 3: Cuốn sách mở / Ngòi bút xanh pastel nhỏ bên ngoài mép thẻ */}
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

          {/* Thẻ đăng nhập màu trắng: Bo góc 24px, bóng phẳng nhẹ */}
          <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(214,51,108,0.08)] border border-[#F8A5C2]/30 relative z-10">
            {/* Phần đầu thẻ đăng nhập */}
            <div className="mb-6">
              <h2 className="font-playfair font-bold text-3xl sm:text-[34px] text-brand-textDark leading-tight mb-2">
                Chào mừng trở lại
              </h2>
              <p className="font-nunito font-semibold text-base text-brand-textMuted">
                Đăng nhập để vào Lớp Văn chị Vân
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
              <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Biểu mẫu đăng nhập */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Trường 1: Email hoặc mã học sinh */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="font-nunito font-bold text-sm text-brand-textDark"
                >
                  Email hoặc mã học sinh
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Email hoặc mã HS (VD: HS0001)"
                    className="h-[48px] px-4 rounded-xl font-nunito font-medium text-brand-textDark bg-white text-base transition-all duration-150 border-2 border-brand-focusBlue focus-visible:ring-2 focus-visible:ring-brand-focusBlue/20"
                    required
                  />
                </div>
              </div>

              {/* Trường 2: Mật khẩu */}
              <div className="space-y-1.5">
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
                  {/* Nút biểu tượng mắt ẩn/hiện mật khẩu */}
                  <button
                    type="button"
                    id="togglePasswordBtn"
                    aria-label="Hiện hoặc ẩn mật khẩu"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textMuted hover:text-brand-textDark p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-focusBlue transition-colors cursor-pointer"
                  >
                    {!showPassword ? (
                      <Eye className="w-5 h-5" strokeWidth={1.8} />
                    ) : (
                      <EyeOff className="w-5 h-5" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Tùy chọn phụ: Ghi nhớ đăng nhập & Quên mật khẩu */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-nunito font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-btnPink focus:ring-brand-focusBlue h-4 w-4"
                  />
                  <span>Ghi nhớ đăng nhập (30 ngày)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="font-nunito font-bold text-xs text-brand-focusBlue hover:text-brand-btnPink transition-colors cursor-pointer hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Nút đăng nhập */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[48px] rounded-xl font-nunito font-bold text-base text-white bg-brand-btnPink hover:bg-brand-btnPinkHover active:scale-[0.99] transition-all shadow-[0_4px_12px_rgba(214,51,108,0.25)] flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5 text-white" />
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </div>

              {/* Ghi chú */}
              <div className="pt-1 text-center">
                <p className="font-nunito font-semibold text-xs sm:text-[13px] text-brand-textMuted leading-relaxed">
                  Phụ huynh không cần đăng nhập — mở link hoá đơn do lớp gửi.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Hộp thoại Quên mật khẩu */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={username}
      />
    </div>
  );
};

export default LoginPage;
