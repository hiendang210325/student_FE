import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { tokenService } from '@/services/storage/tokenService';
import { ApiError } from './apiError';

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Transform & Error Handling
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    const errors = error.response?.data?.errors;

    // Handle Unauthorized (401)
    if (status === 401) {
      tokenService.clearAll();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new ApiError(message, status, errors));
  }
);

export default apiClient;

