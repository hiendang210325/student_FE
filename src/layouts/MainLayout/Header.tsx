import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Bell, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-slate-800">Cổng Quản Trị Đào Tạo</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification button */}
        <button className="relative rounded-[10px] p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-[4px] bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User profile dropdown/info */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-100 text-brand-700 font-bold text-sm">
            {user?.fullName?.charAt(0) || <UserIcon className="w-5 h-5" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800">{user?.fullName || 'Quản trị viên'}</p>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role?.toLowerCase() || 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            title="Đăng xuất"
            className="ml-2 rounded-[10px] p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

