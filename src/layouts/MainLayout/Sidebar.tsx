import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useAuthStore, AppViewRole } from '@/store/useAuthStore';
import logoImage from '@/assets/logo/logo.png';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  UserCheck,
  CalendarOff,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const REMOTE_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBxtYI7OlRagEKJlEuXPBrDwpaGcOkDuTT9Oak3WgiucJV73j5kXgDOaO-nXzPKKms5Cq1r8mDkr8fhjC4_3rzjwlQEeaRGIhOccROp3gsu6wkFieqRetn1J2FE9ome7fD8KM9-MRdcDXZJk3xDb9pr_KPaAmx6wRXZs5EH5GvQzXn4xzZpDlngmYcl5jeAKwdZmWOBVcz9IzH6cP327JPfrgtQf0-8FcmKsmQXYF4PE1OKf9VFJ74w';

// Ánh xạ đường dẫn sang tiêu đề trang hiển thị trên thanh đầu trang di động
const getMobilePageTitle = (pathname: string): string => {
  if (pathname === ROUTES.DASHBOARD) return 'Tổng quan';
  if (pathname.startsWith(ROUTES.STUDENTS)) return 'Học sinh';
  if (pathname.startsWith(ROUTES.CLASSES)) return 'Lớp học';
  if (pathname.startsWith(ROUTES.SCHEDULE)) return 'Lịch học';
  if (pathname.startsWith(ROUTES.HOMEWORK)) return 'Bài tập';
  if (pathname.startsWith(ROUTES.LEAVE_REQUESTS)) return 'Đơn xin nghỉ';
  if (pathname.startsWith(ROUTES.TUITION)) return 'Học phí';
  if (pathname.startsWith(ROUTES.NOTIFICATIONS)) return 'Thông báo';
  return 'Lớp Văn chị Vân';
};

export const Sidebar: React.FC = () => {
  const { logout, activeRole, setActiveRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoSrc, setLogoSrc] = useState(logoImage || REMOTE_LOGO_URL);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Đồng bộ tham số ?role= trên URL với trạng thái activeRole toàn cục nếu có
  useEffect(() => {
    if (location.search.includes('role=student') && activeRole !== 'student') {
      setActiveRole('student');
    } else if (location.search.includes('role=admin') && activeRole !== 'admin') {
      setActiveRole('admin');
    }
  }, [location.search, activeRole, setActiveRole]);

  // Tự động đóng ngăn kéo điều hướng trên di động khi chuyển trang
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isNotificationsPage = location.pathname.startsWith(ROUTES.NOTIFICATIONS);
  const isStudentView = activeRole === 'student';
  const mobileTitle = getMobilePageTitle(location.pathname);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Chuyển đổi trực tiếp giữa 2 vai trò Admin và Học sinh
  const handleSelectRole = (role: AppViewRole) => {
    setActiveRole(role);
    if (location.search.includes('role=')) {
      navigate(location.pathname, { replace: true });
    }
  };

  // Nội dung thanh bên đầy đủ (dùng cho Desktop 240px và Mobile Drawer)
  const navContent = (
    <div className="h-full flex flex-col justify-between p-4 box-border">
      <div>
        {/* Logo trên nền kem #FBF6EA bo góc, giữ nguyên 100% độ hiển thị */}
        <div className="bg-brand-cream rounded-[12px] p-2.5 flex items-center justify-center border border-brand-border/60 shadow-sm mb-4">
          <img
            src={logoSrc}
            onError={() => setLogoSrc(REMOTE_LOGO_URL)}
            alt="Logo Lớp Văn chị Vân"
            className="w-[160px] h-auto object-contain block opacity-100"
          />
        </div>

        {/* Menu điều hướng theo vai trò (Học sinh hoặc Admin) */}
        {isStudentView ? (
          <nav className="space-y-3">
            {/* Tổng quan */}
            <NavLink
              to={ROUTES.DASHBOARD}
              end
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] transition-all',
                  isActive
                    ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                    : 'text-brand-text hover:bg-white/40 font-semibold'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                    )}
                    strokeWidth={1.75}
                  />
                  <span>Tổng quan</span>
                </>
              )}
            </NavLink>

            {/* Nhóm: HẰNG NGÀY */}
            <div className="pt-1">
              <div className="px-3.5 pb-1.5 text-[12px] font-bold tracking-wider text-brand-subtext uppercase">
                HẰNG NGÀY
              </div>
              <div className="space-y-1">
                {/* Lịch học */}
                <NavLink
                  to={ROUTES.SCHEDULE}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Calendar
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Lịch học</span>
                    </>
                  )}
                </NavLink>

                {/* Bài tập */}
                <NavLink
                  to={ROUTES.HOMEWORK}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 rounded-[10px] flex items-center justify-between text-[14px] transition-all',
                      isActive
                        ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <FileText
                          className={cn(
                            'w-5 h-5 flex-shrink-0',
                            isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                          )}
                          strokeWidth={1.75}
                        />
                        <span>Bài tập</span>
                      </div>
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full text-[12px] font-bold flex items-center justify-center leading-none',
                          isNotificationsPage
                            ? 'bg-[#DCEBFA] text-[#1F4E79]'
                            : 'bg-[#D6336C] text-white'
                        )}
                      >
                        2
                      </span>
                    </>
                  )}
                </NavLink>

                {/* Điểm danh của tôi */}
                <a
                  href="#my-attendance"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileOpen(false);
                  }}
                  className="h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-brand-text hover:bg-white/40 text-[14px] font-semibold transition-colors cursor-pointer"
                >
                  <UserCheck className="w-5 h-5 text-brand-subtext flex-shrink-0" strokeWidth={1.75} />
                  <span>Điểm danh của tôi</span>
                </a>

                {/* Đơn xin nghỉ */}
                <NavLink
                  to={ROUTES.LEAVE_REQUESTS}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <CalendarOff
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Đơn xin nghỉ</span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>

            {/* Thông báo */}
            <div className="pt-1">
              <NavLink
                to={ROUTES.NOTIFICATIONS}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'h-[44px] px-3.5 rounded-[10px] flex items-center justify-between text-[14px] transition-all',
                    isActive
                      ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                      : 'text-brand-text hover:bg-white/40 font-semibold'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Bell
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Thông báo</span>
                    </div>
                    {isNotificationsPage && (
                      <span className="w-5 h-5 rounded-full bg-[#D6336C] text-white text-[12px] font-bold flex items-center justify-center leading-none">
                        3
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          </nav>
        ) : (
          <nav className="space-y-3">
            {/* Tổng quan */}
            <NavLink
              to={ROUTES.DASHBOARD}
              end
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] font-bold transition-all',
                  isActive
                    ? 'bg-white shadow-sm text-brand-pinkText'
                    : 'text-brand-text hover:bg-white/40'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-brand-pinkText' : 'text-brand-subtext'
                    )}
                    strokeWidth={1.75}
                  />
                  <span>Tổng quan</span>
                </>
              )}
            </NavLink>

            {/* Nhóm: QUẢN LÝ */}
            <div className="pt-0.5">
              <div className="px-3.5 pb-1 text-[12px] font-bold tracking-wider text-brand-subtext uppercase">
                QUẢN LÝ
              </div>
              <div className="space-y-0.5">
                <NavLink
                  to={ROUTES.STUDENTS}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'rounded-[10px] bg-white shadow-sm text-brand-pinkText font-bold'
                        : 'rounded-[10px] text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Users
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-brand-pinkText' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Học sinh</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to={ROUTES.CLASSES}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'rounded-[10px] bg-white shadow-sm text-brand-pinkText font-bold'
                        : 'rounded-[10px] text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <BookOpen
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-brand-pinkText' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Lớp học</span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>

            {/* Nhóm: HẰNG NGÀY */}
            <div className="pt-0.5">
              <div className="px-3.5 pb-1 text-[12px] font-bold tracking-wider text-brand-subtext uppercase">
                HẰNG NGÀY
              </div>
              <div className="space-y-0.5">
                <NavLink
                  to={ROUTES.SCHEDULE}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'rounded-[10px] bg-white shadow-sm text-brand-pinkText font-bold'
                        : 'rounded-[10px] text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Calendar
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-brand-pinkText' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Lịch học</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to={ROUTES.HOMEWORK}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'rounded-[10px] bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'rounded-[10px] text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <FileText
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Bài tập</span>
                    </>
                  )}
                </NavLink>

                {/* Đơn xin nghỉ kèm huy hiệu số 3 màu #D6336C */}
                <NavLink
                  to={ROUTES.LEAVE_REQUESTS}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 rounded-[10px] flex items-center justify-between text-[14px] transition-all',
                      isActive
                        ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <CalendarOff
                          className={cn(
                            'w-5 h-5 flex-shrink-0',
                            isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                          )}
                          strokeWidth={1.75}
                        />
                        <span>Đơn xin nghỉ</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-[#D6336C] text-white text-[12px] font-bold flex items-center justify-center leading-none">
                        3
                      </span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>

            {/* Nhóm: TÀI CHÍNH & BÁO CÁO */}
            <div className="pt-0.5">
              <div className="px-3.5 pb-1 text-[12px] font-bold tracking-wider text-brand-subtext uppercase">
                TÀI CHÍNH &amp; BÁO CÁO
              </div>
              <div className="space-y-0.5">
                <NavLink
                  to={ROUTES.TUITION}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <CreditCard
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Học phí</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to={ROUTES.NOTIFICATIONS}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-[14px] transition-all',
                      isActive
                        ? 'bg-white shadow-sm text-[#A61E4D] font-bold'
                        : 'text-brand-text hover:bg-white/40 font-semibold'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Bell
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-[#A61E4D]' : 'text-brand-subtext'
                        )}
                        strokeWidth={1.75}
                      />
                      <span>Thông báo</span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Khu vực chân trang: Thanh chuyển vai trò tạm thời + Thẻ người dùng cố định ở đáy */}
      <div className="pt-2 border-t border-brand-border/80 space-y-2">
        {/* Thanh chuyển vai trò tạm thời để xem giao diện Admin / Học sinh (ẩn khi nối backend) */}
        <div
          className="p-1 rounded-[10px] bg-white/90 border border-brand-border/80 grid grid-cols-2 gap-1"
          role="group"
          aria-label="Chuyển vai trò xem tạm thời"
        >
          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`h-8 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
              !isStudentView
                ? 'bg-[#D6336C] text-white shadow-2xs'
                : 'text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9]'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            className={`h-8 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
              isStudentView
                ? 'bg-[#2F6FA8] text-white shadow-2xs'
                : 'text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#E9F3FF]'
            }`}
          >
            Học sinh
          </button>
        </div>

        {isStudentView ? (
          <div className="bg-white/95 border border-brand-border/80 shadow-sm rounded-[12px] p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={() => handleSelectRole('admin')}
                title="Bấm để chuyển sang góc nhìn Admin"
                className="w-9 h-9 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center font-bold text-[12px] flex-shrink-0 cursor-pointer"
              >
                {isNotificationsPage ? 'GH' : 'MA'}
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  onClick={() => handleSelectRole('admin')}
                  title="Bấm để chuyển sang góc nhìn Admin"
                  className="text-[13px] font-bold text-[#3B2A35] leading-tight truncate cursor-pointer"
                >
                  {isNotificationsPage
                    ? 'Đỗ Gia Hân · Học sinh'
                    : 'Nguyễn Minh Anh · Học sinh'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[12px] font-bold text-[#A61E4D] hover:underline text-left mt-0.5 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 border border-brand-border/80 shadow-sm rounded-[12px] p-2.5 flex items-center justify-between transition-all hover:border-brand-pinkAccent/60">
            <div
              onClick={() => handleSelectRole('student')}
              title="Bấm để chuyển sang góc nhìn Học sinh"
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#FFE4EE] border border-brand-pinkAccent/60 flex items-center justify-center font-bold text-brand-pinkText text-[13px] shadow-sm flex-shrink-0">
                V
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-brand-text leading-tight">
                    Chị Vân · Admin
                  </span>
                </div>
                <span className="text-[12px] font-medium text-brand-subtext leading-none mt-0.5">
                  Giáo viên chính
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-brand-subtext hover:text-brand-pinkText hover:bg-[#FFE4EE] transition-all flex-shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Danh sách mục cho thanh rail thu gọn trên Tablet (768–1023px)
  const tabletRailItems = isStudentView
    ? [
        { to: ROUTES.DASHBOARD, end: true, label: 'Tổng quan', icon: LayoutDashboard },
        { to: ROUTES.SCHEDULE, label: 'Lịch học', icon: Calendar },
        { to: ROUTES.HOMEWORK, label: 'Bài tập', icon: FileText, badge: 2 },
        { to: ROUTES.LEAVE_REQUESTS, label: 'Đơn xin nghỉ', icon: CalendarOff },
        { to: ROUTES.NOTIFICATIONS, label: 'Thông báo', icon: Bell, badge: isNotificationsPage ? 3 : undefined },
      ]
    : [
        { to: ROUTES.DASHBOARD, end: true, label: 'Tổng quan', icon: LayoutDashboard },
        { to: ROUTES.STUDENTS, label: 'Học sinh', icon: Users },
        { to: ROUTES.CLASSES, label: 'Lớp học', icon: BookOpen },
        { to: ROUTES.SCHEDULE, label: 'Lịch học', icon: Calendar },
        { to: ROUTES.HOMEWORK, label: 'Bài tập', icon: FileText },
        { to: ROUTES.LEAVE_REQUESTS, label: 'Đơn xin nghỉ', icon: CalendarOff, badge: 3 },
        { to: ROUTES.TUITION, label: 'Học phí', icon: CreditCard },
        { to: ROUTES.NOTIFICATIONS, label: 'Thông báo', icon: Bell },
      ];

  return (
    <TooltipProvider delayDuration={120}>
      {/* 1. MOBILE STICKY TOP BAR (< 768px, cao 56px) */}
      <header className="md:hidden sticky top-0 z-30 h-14 w-full bg-brand-sidebar border-b border-brand-border px-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-brand-cream border border-brand-border/60 flex items-center justify-center p-1 flex-shrink-0">
            <img
              src={logoSrc}
              onError={() => setLogoSrc(REMOTE_LOGO_URL)}
              alt="Logo Lớp Văn chị Vân"
              className="w-full h-full object-contain opacity-100"
            />
          </div>
          <span className="font-playfair font-bold text-[18px] text-brand-text truncate">
            {mobileTitle}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="min-w-[44px] min-h-[44px] rounded-[10px] bg-white/80 text-brand-text hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Mở bảng điều hướng"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </header>

      {/* 2. TABLET ICON-ONLY RAIL (768px–1023px, rộng 72px) */}
      <aside className="hidden md:flex lg:hidden fixed inset-y-0 left-0 w-[72px] h-[100dvh] bg-brand-sidebar border-r border-brand-border flex-col items-center justify-between py-3 px-2 z-20 overflow-y-auto">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Huy hiệu logo nhỏ */}
          <div className="w-12 h-12 rounded-[12px] bg-brand-cream border border-brand-border/60 shadow-sm p-1.5 flex items-center justify-center flex-shrink-0">
            <img
              src={logoSrc}
              onError={() => setLogoSrc(REMOTE_LOGO_URL)}
              alt="Logo Lớp Văn chị Vân"
              className="w-full h-full object-contain opacity-100"
            />
          </div>

          <nav className="flex flex-col items-center gap-1.5 w-full">
            {tabletRailItems.map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        cn(
                          'relative w-11 h-11 rounded-[10px] flex items-center justify-center transition-all',
                          isActive
                            ? 'bg-white shadow-sm text-[#A61E4D]'
                            : 'text-brand-subtext hover:bg-white/40 hover:text-brand-text'
                        )
                      }
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                      {item.badge !== undefined && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D6336C] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span>{item.label}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Ảnh đại diện người dùng cố định ở đáy rail */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-brand-border/80 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelectRole(isStudentView ? 'admin' : 'student')}
                aria-label={isStudentView ? 'Chuyển sang Admin' : 'Chuyển sang Học sinh'}
                className={cn(
                  'w-11 h-11 rounded-[10px] flex items-center justify-center font-bold text-[13px] shadow-sm cursor-pointer transition-colors',
                  isStudentView
                    ? 'bg-[#DCEBFA] text-[#1F4E79]'
                    : 'bg-[#FFE4EE] border border-brand-pinkAccent/60 text-brand-pinkText'
                )}
              >
                {isStudentView ? (isNotificationsPage ? 'GH' : 'MA') : 'V'}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>
                {isStudentView
                  ? 'Học sinh (Bấm để đổi sang Admin)'
                  : 'Chị Vân · Admin (Bấm để đổi sang Học sinh)'}
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* 3. DESKTOP SIDEBAR (1024px+, rộng 240px — giữ nguyên hoàn toàn) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[240px] h-[100dvh] bg-brand-sidebar border-r border-brand-border flex-col justify-between flex-shrink-0 z-20 overflow-y-auto">
        {navContent}
      </aside>

      {/* 4. MOBILE LEFT DRAWER (< 768px, rộng min(300px, 85vw)) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[rgba(59,42,53,0.35)]"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-[min(300px,85vw)] h-[100dvh] bg-brand-sidebar border-r border-brand-border shadow-xl z-10 overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] rounded-[10px] bg-white/80 text-brand-text flex items-center justify-center cursor-pointer"
              aria-label="Đóng bảng điều hướng"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      {/* 5. MOBILE FIXED BOTTOM TAB BAR (< 768px, cao 64px + safe-area) */}
      <nav
        aria-label="Điều hướng nhanh"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-brand-border px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(59,42,53,0.06)]"
      >
        <div className="grid grid-cols-5 items-center min-h-[56px]">
          {isStudentView ? (
            <>
              <NavLink
                to={ROUTES.DASHBOARD}
                end
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <LayoutDashboard className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Tổng quan</span>
              </NavLink>

              <NavLink
                to={ROUTES.SCHEDULE}
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <Calendar className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Lịch học</span>
              </NavLink>

              <NavLink
                to={ROUTES.HOMEWORK}
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <FileText className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Bài tập</span>
              </NavLink>

              <a
                href="#my-attendance"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.DASHBOARD);
                }}
                className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold text-brand-subtext"
              >
                <UserCheck className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Điểm danh</span>
              </a>

              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold text-brand-subtext cursor-pointer"
              >
                <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Thêm</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to={ROUTES.DASHBOARD}
                end
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <LayoutDashboard className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Tổng quan</span>
              </NavLink>

              <NavLink
                to={ROUTES.SCHEDULE}
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <Calendar className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Lịch học</span>
              </NavLink>

              <NavLink
                to={ROUTES.CLASSES}
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <UserCheck className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Điểm danh</span>
              </NavLink>

              <NavLink
                to={ROUTES.TUITION}
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold transition-colors',
                    isActive ? 'text-[#A61E4D] bg-[#FFE0EB]/60' : 'text-brand-subtext'
                  )
                }
              >
                <CreditCard className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Học phí</span>
              </NavLink>

              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 text-[11px] font-bold text-brand-subtext cursor-pointer"
              >
                <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
                <span className="truncate">Thêm</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
};
