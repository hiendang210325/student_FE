export const APP_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'qlhs_access_token',
  REFRESH_TOKEN: 'qlhs_refresh_token',
  USER_INFO: 'qlhs_user_info',
  THEME: 'qlhs_theme',
} as const;

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
} as const;

