export const ROUTES = {
  // Các tuyến đường công khai (không cần đăng nhập)
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Các tuyến đường nội bộ ứng dụng (yêu cầu đăng nhập)
  DASHBOARD: '/',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:id',
  CLASSES: '/classes',
  GRADES: '/grades',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

