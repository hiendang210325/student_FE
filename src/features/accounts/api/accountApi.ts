import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  AccountListResponseData,
  CreateAccountPayload,
  CreateAccountResponseData,
  ResetPasswordPayload,
  ResetPasswordResponseData,
} from '../types/account.types';

export const accountApi = {
  /**
   * 1. Lấy danh sách tài khoản học sinh + Thống kê KPI
   */
  getAccounts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    className?: string;
  }): Promise<ApiResponse<AccountListResponseData>> => {
    return apiClient.get('/accounts', { params });
  },

  /**
   * 2. Tạo tài khoản đăng nhập cho học sinh mới
   */
  createAccount: async (
    payload: CreateAccountPayload
  ): Promise<ApiResponse<CreateAccountResponseData>> => {
    return apiClient.post('/accounts', payload);
  },

  /**
   * 3. Gửi lại thông tin tài khoản qua email
   */
  sendCredentials: async (
    id: string,
    customPassword?: string
  ): Promise<ApiResponse<{ emailSent: boolean }>> => {
    return apiClient.post(`/accounts/${id}/send-credentials`, { customPassword });
  },

  /**
   * 4. Đặt lại mật khẩu tài khoản học sinh
   */
  resetPassword: async (
    id: string,
    payload: ResetPasswordPayload
  ): Promise<ApiResponse<ResetPasswordResponseData>> => {
    return apiClient.post(`/accounts/${id}/reset-password`, payload);
  },

  /**
   * 5. Khóa hoặc Mở khóa tài khoản học sinh
   */
  toggleStatus: async (
    id: string,
    status: 'active' | 'locked'
  ): Promise<ApiResponse<{ id: string; status: string }>> => {
    return apiClient.patch(`/accounts/${id}/status`, { status });
  },

  /**
   * 6. XÓA MỀM (Soft delete): Chuyển tài khoản học sinh vào thùng rác
   */
  softDeleteAccount: async (
    id: string
  ): Promise<ApiResponse<{ id: string; isDeleted: boolean; deletedAt: string }>> => {
    return apiClient.delete(`/accounts/${id}`);
  },

  /**
   * Alias xóa mềm để tương thích ngược
   */
  deleteAccount: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/accounts/${id}`);
  },

  /**
   * 7. KHÔI PHỤC: Khôi phục tài khoản học sinh từ thùng rác về hoạt động
   */
  restoreAccount: async (
    id: string
  ): Promise<ApiResponse<{ id: string; isDeleted: boolean; status: string }>> => {
    return apiClient.patch(`/accounts/${id}/restore`);
  },

  /**
   * 8. XÓA VĨNH VIỄN: Xóa hẳn tài khoản khỏi hệ thống dữ liệu
   */
  permanentDeleteAccount: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/accounts/${id}/permanent`);
  },

  /**
   * 9. Lấy danh sách tài khoản học sinh trong thùng rác
   */
  getTrashAccounts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<
    ApiResponse<{
      items: Array<{
        id: string;
        name: string;
        code: string;
        email: string;
        phone: string;
        className: string;
        deletedDate: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > => {
    return apiClient.get('/accounts/trash', { params });
  },
};

export default accountApi;
