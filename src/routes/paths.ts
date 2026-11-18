export const ROUTES = {
  // Các tuyến đường công khai (không cần đăng nhập)
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Các tuyến đường nội bộ ứng dụng (yêu cầu đăng nhập)
  DASHBOARD: '/',
  ACCOUNTS: '/accounts',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:id',
  CLASSES: '/classes',
  CLASS_DETAIL: '/classes/:id',
  SCHEDULE: '/schedule',
  HOMEWORK: '/homework',
  LEAVE_REQUESTS: '/leave-requests',
  TUITION: '/tuition',
  TUITION_CLASS_DETAIL: '/tuition/:id',
  NOTIFICATIONS: '/notifications',
  GRADES: '/grades',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

