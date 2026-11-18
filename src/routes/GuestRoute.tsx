import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from './paths';

interface GuestRouteProps {
  children: React.ReactElement;
}

/**
 * Tuyến đường chỉ dành cho khách (người dùng chưa đăng nhập).
 * Nếu người dùng đã xác thực (đăng nhập thành công), tự động chuyển hướng
 * tới Dashboard (hoặc trang trước đó), ngăn chặn truy cập lại vào /login.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return children;
};
