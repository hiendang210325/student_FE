import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/useAuthStore';
import logoImage from '@/assets/logo/logo.png';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REMOTE_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBxtYI7OlRagEKJlEuXPBrDwpaGcOkDuTT9Oak3WgiucJV73j5kXgDOaO-nXzPKKms5Cq1r8mDkr8fhjC4_3rzjwlQEeaRGIhOccROp3gsu6wkFieqRetn1J2FE9ome7fD8KM9-MRdcDXZJk3xDb9pr_KPaAmx6wRXZs5EH5GvQzXn4xzZpDlngmYcl5jeAKwdZmWOBVcz9IzH6cP327JPfrgtQf0-8FcmKsmQXYF4PE1OKf9VFJ74w';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState(logoImage || REMOTE_LOGO_URL);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const navContent = (
    <div className="h-full flex flex-col justify-between p-4 box-border">
      <div>
        {/* Logo trên nền kem #FBF6EA bo góc */}
        <div className="bg-brand-cream rounded-[12px] p-2.5 flex items-center justify-center border border-brand-border/60 shadow-sm mb-4">
          <img
            src={logoSrc}
            onError={() => setLogoSrc(REMOTE_LOGO_URL)}
            alt="Logo Lớp Văn chị Vân"
            className="w-[160px] h-auto object-contain block opacity-100"
          />
        </div>

        {/* Menu điều hướng */}
        <nav className="space-y-3.5">
          {/* Tổng quan (mặc định kích hoạt ở Dashboard) */}
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
          <div className="pt-1">
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

              <a
                href="#homework"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileOpen(false);
                }}
                className="h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-brand-text hover:bg-white/40 text-[14px] font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5 text-brand-subtext flex-shrink-0" strokeWidth={1.75} />
                <span>Bài tập</span>
              </a>
            </div>
          </div>

          {/* Nhóm: TÀI CHÍNH & BÁO CÁO */}
          <div className="pt-0.5">
            <div className="px-3.5 pb-1 text-[12px] font-bold tracking-wider text-brand-subtext uppercase">
              TÀI CHÍNH &amp; BÁO CÁO
            </div>
            <div className="space-y-0.5">
              <a
                href="#tuition"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileOpen(false);
                }}
                className="h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-brand-text hover:bg-white/40 text-[14px] font-semibold transition-colors cursor-pointer"
              >
                <CreditCard className="w-5 h-5 text-brand-subtext flex-shrink-0" strokeWidth={1.75} />
                <span>Học phí</span>
              </a>

              <a
                href="#announcements"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileOpen(false);
                }}
                className="h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-brand-text hover:bg-white/40 text-[14px] font-semibold transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 text-brand-subtext flex-shrink-0" strokeWidth={1.75} />
                <span>Thông báo</span>
              </a>

              <a
                href="#reports"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileOpen(false);
                }}
                className="h-[44px] px-3.5 rounded-[10px] flex items-center gap-3 text-brand-text hover:bg-white/40 text-[14px] font-semibold transition-colors cursor-pointer"
              >
                <BarChart3 className="w-5 h-5 text-brand-subtext flex-shrink-0" strokeWidth={1.75} />
                <span>Báo cáo</span>
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Thẻ người dùng cố định ở chân trang */}
      <div className="pt-2 border-t border-brand-border/80">
        <div className="bg-white/90 border border-brand-border/80 shadow-sm rounded-[12px] p-2.5 flex items-center justify-between transition-all hover:border-brand-pinkAccent/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#FFE4EE] border border-brand-pinkAccent/60 flex items-center justify-center font-bold text-brand-pinkText text-[13px] shadow-sm flex-shrink-0">
              V
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-brand-text leading-tight">
                  {user?.fullName || 'Chị Vân'}
                </span>
                <span className="px-1.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-[#FFE0EB] text-brand-pinkText border border-brand-pinkAccent/40 leading-none">
                  Admin
                </span>
              </div>
              <span className="text-[11px] font-medium text-brand-subtext leading-none mt-0.5">
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
      </div>
    </div>
  );

  return (
    <>
      {/* Thanh đầu trang trên thiết bị di động */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-brand-sidebar border-b border-brand-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-[10px] bg-white/70 text-brand-text hover:bg-white"
            aria-label="Mở bảng điều hướng"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-playfair font-bold text-base text-brand-text">Lớp Văn chị Vân</span>
        </div>
        <div className="w-8 h-8 rounded-[10px] bg-[#FFE4EE] border border-brand-pinkAccent/60 flex items-center justify-center font-bold text-brand-pinkText text-xs">
          V
        </div>
      </div>

      {/* Thanh bên cố định trên máy tính (rộng 240px) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[240px] h-screen bg-brand-sidebar border-r border-brand-border flex-col justify-between flex-shrink-0 z-20 overflow-y-auto">
        {navContent}
      </aside>

      {/* Thanh bên dạng ngăn kéo trên thiết bị di động */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-[260px] max-w-[80vw] h-full bg-brand-sidebar border-r border-brand-border shadow-xl z-50 overflow-y-auto">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
