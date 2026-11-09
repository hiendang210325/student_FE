import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-page flex font-nunito text-brand-text">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[240px] flex flex-col min-h-screen overflow-x-hidden pt-14 lg:pt-0">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
