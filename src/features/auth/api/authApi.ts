import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import { User } from '@/types/user.types';
import {
  LoginPayload,
  LoginResponseData,
  UserSession,
  ForgotPasswordResponseData,
  VerifyResetOtpResponseData,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '../types/auth.types';

export const authApi = {
  /**
   * 1. Đăng nhập hệ thống (Email, Username hoặc Mã học sinh HSxxxx)
   */
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient.post('/auth/login', payload);
  },

  /**
   * 2. Lấy thông tin tài khoản hiện tại (Xác thực lại phiên khi tải lại trang)
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get('/auth/me');
  },

  /**
   * 3. Tự làm mới Access Token bằng Refresh Token
   */
  refreshToken: async (refreshToken?: string): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  },

  /**
   * 4. Đăng xuất khỏi thiết bị hiện tại
   */
  logout: async (refreshToken?: string): Promise<ApiResponse<null>> => {
    return apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * 5. Đăng xuất khỏi toàn bộ các thiết bị
   */
  logoutAllDevices: async (): Promise<ApiResponse<{ revokedCount: number }>> => {
    return apiClient.post('/auth/logout-all');
  },

  /**
   * 6. Lấy danh sách các thiết bị/phiên đang hoạt động
   */
  getActiveSessions: async (): Promise<ApiResponse<UserSession[]>> => {
    return apiClient.get('/auth/sessions');
  },

  /**
   * 7. Thu hồi phiên đăng nhập trên thiết bị cụ thể
   */
  revokeSession: async (sessionId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * 8. Yêu cầu đặt lại mật khẩu (Gửi mã OTP 6 số qua Email)
   */
  forgotPassword: async (email: string): Promise<ApiResponse<ForgotPasswordResponseData>> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * 9. Xác thực mã OTP 6 số để nhận Reset Token
   */
  verifyResetOtp: async (
    email: string,
    otp: string
  ): Promise<ApiResponse<VerifyResetOtpResponseData>> => {
    return apiClient.post('/auth/verify-reset-otp', { email, otp });
  },

  /**
   * 10. Đặt lại mật khẩu mới
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<null>> => {
    return apiClient.post('/auth/reset-password', payload);
  },

  /**
   * 11. Đổi mật khẩu tài khoản
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
    return apiClient.post('/auth/change-password', payload);
  },
};

export default authApi;
