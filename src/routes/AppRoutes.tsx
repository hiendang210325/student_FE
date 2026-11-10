import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './paths';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Spinner } from '@/components/common/Spinner/Spinner';

// Nhập trực tiếp các trang để tải tức thì và đảm bảo an toàn kiểu dữ liệu (Type Safety)
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { StudentListPage } from '@/features/students/pages/StudentListPage';
import { StudentDetailPage } from '@/features/students/pages/StudentDetailPage';
import { ClassListPage } from '@/features/classes/pages/ClassListPage';

const PageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Spinner size="lg" label="Đang tải trang..." />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        {/* Protected Routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.STUDENTS} element={<StudentListPage />} />
          <Route path={ROUTES.STUDENT_DETAIL} element={<StudentDetailPage />} />
          <Route path={ROUTES.CLASSES} element={<ClassListPage />} />
          <Route
            path={ROUTES.GRADES}
            element={
              <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
                <h2 className="text-base font-bold text-slate-800">Mô-đun Quản lý Điểm & Học lực</h2>
                <p className="text-xs text-slate-500 mt-1">Đang sẵn sàng để tích hợp API điểm thi.</p>
              </div>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
                <h2 className="text-base font-bold text-slate-800">Cài đặt hệ thống đào tạo</h2>
                <p className="text-xs text-slate-500 mt-1">Cấu hình tham số niên khóa, tiêu chuẩn xếp loại.</p>
              </div>
            }
          />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
};

