export const ROUTES = {
  // Public
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Protected / App
  DASHBOARD: '/',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:id',
  CLASSES: '/classes',
  GRADES: '/grades',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

