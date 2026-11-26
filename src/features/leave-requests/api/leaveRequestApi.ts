import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  AdminLeaveRequestsResponse,
  LeaveRequestItem,
  MyLeaveRequestsResponse,
} from '../types/leaveRequest.types';

export const leaveRequestApi = {
  /**
   * 1. Học sinh lấy thông tin hồ sơ, gợi ý buổi học sắp tới và danh sách đơn đã gửi
   */
  getMyLeaveRequests: async (): Promise<ApiResponse<MyLeaveRequestsResponse>> => {
    return apiClient.get('/leave-requests/my');
  },

  /**
   * 2. Học sinh gửi đơn xin nghỉ mới
   */
  createLeaveRequest: async (payload: {
    className: string;
    leaveDate: string;
    reason: string;
  }): Promise<ApiResponse<LeaveRequestItem>> => {
    return apiClient.post('/leave-requests', payload);
  },

  /**
   * 3. Học sinh rút lại đơn xin nghỉ khi đang Chờ duyệt
   */
  cancelMyLeaveRequest: async (
    id: string
  ): Promise<ApiResponse<{ leaveDate: string; className: string }>> => {
    return apiClient.delete(`/leave-requests/${encodeURIComponent(id)}/cancel`);
  },

  /**
   * 4. Admin lấy danh sách đơn xin nghỉ theo bộ lọc trạng thái, lớp học & phân trang
   */
  getAdminLeaveRequests: async (params?: {
    status?: string;
    className?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminLeaveRequestsResponse>> => {
    return apiClient.get('/leave-requests', { params });
  },

  /**
   * 5. Admin duyệt hoặc từ chối đơn (hoặc cập nhật lại quyết định & lời nhắn)
   */
  reviewLeaveRequest: async (
    id: string,
    payload: {
      status: 'APPROVED' | 'REJECTED';
      teacherNote?: string;
    }
  ): Promise<ApiResponse<LeaveRequestItem>> => {
    return apiClient.patch(
      `/leave-requests/${encodeURIComponent(id)}/review`,
      payload
    );
  },

  /**
   * 6. Admin xóa đơn xin nghỉ cũ
   */
  deleteLeaveRequest: async (
    id: string
  ): Promise<ApiResponse<{ studentName: string; leaveDate: string }>> => {
    return apiClient.delete(`/leave-requests/${encodeURIComponent(id)}`);
  },
};

export default leaveRequestApi;
