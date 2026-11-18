import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { tokenService } from '@/services/storage/tokenService';
import { ApiError } from './apiError';

// Hàm đọc giá trị Cookie theo tên một cách an toàn
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  withCredentials: true, // Cho phép truyền và nhận Cookie HttpOnly (accessToken, refreshToken, csrf_token)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Bộ chặn yêu cầu (Request Interceptor): Tự động gắn Token xác thực JWT và mã CSRF
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Gắn JWT Access Token nếu có trong storage
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Gắn CSRF Token từ Cookie vào Header x-csrf-token (cơ chế Double-Submit Cookie)
    const csrfToken = getCookie('csrf_token');
    if (csrfToken && config.headers) {
      config.headers['x-csrf-token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Trạng thái xử lý làm mới phiên tự động khi hết hạn (Silent Refresh Token Queue)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Bộ chặn phản hồi (Response Interceptor): Chuyển đổi dữ liệu và xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    const errors = error.response?.data?.errors;

    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    // Xử lý tự động làm mới Token khi gặp lỗi 401 Unauthorized (ngoại trừ các endpoint đăng nhập/làm mới)
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      const storedRefreshToken = tokenService.getRefreshToken();

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gửi yêu cầu làm mới phiên tới Backend
        const refreshResponse = await axios.post<{
          success: boolean;
          data?: { tokens?: { accessToken?: string; refreshToken?: string } };
        }>(
          `${ENV.API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken || undefined },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.tokens?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.tokens?.refreshToken;

        if (newAccessToken) {
          tokenService.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            tokenService.setRefreshToken(newRefreshToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error('Không nhận được Access Token mới');
        }
      } catch (refreshErr) {
        processQueue(refreshErr instanceof Error ? refreshErr : new Error('Refresh failed'));
        tokenService.clearAll();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new ApiError(message, status, errors));
  }
);

export default apiClient;
