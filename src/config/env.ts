/**
 * Cấu hình biến môi trường với kiểm tra kiểu dữ liệu và giá trị mặc định dự phòng
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Quản Lý Học Sinh',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

