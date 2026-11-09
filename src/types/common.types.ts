/**
 * Common API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

/**
 * Standard Paginated Response
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
 * Base query params for listings
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard Select/Dropdown Option
 */
export interface Option<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Base database entity
 */
export interface BaseEntity {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

