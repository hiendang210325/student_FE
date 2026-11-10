/**
 * Định dạng phản hồi API dùng chung
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

/**
 * Dữ liệu phản hồi phân trang chuẩn
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

/**
 * Các tham số truy vấn cơ bản cho danh sách
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Lựa chọn chuẩn cho Select/Dropdown
 */
export interface Option<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Thực thể cơ sở trong cơ sở dữ liệu
 */
export interface BaseEntity {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

