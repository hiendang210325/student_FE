import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-brand-page flex flex-col md:flex-row font-nunito text-brand-text overflow-x-hidden">
      {/* Thanh điều hướng bên trái (Desktop 240px, Tablet rail 72px, Mobile topbar + drawer + bottom tab bar) */}
      <Sidebar />

      {/* Vùng nội dung chính */}
      <div className="flex-1 w-full md:pl-[72px] lg:pl-[240px] flex flex-col min-h-[100dvh] overflow-x-hidden">
        <main className="flex-1 p-4 pb-[calc(64px+env(safe-area-inset-bottom)+16px)] md:p-6 md:pb-6 lg:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
