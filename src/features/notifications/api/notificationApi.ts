import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  AdminNotificationDetailResponse,
  AdminNotificationItem,
  AdminNotificationsResponse,
  ComposeType,
  MyNotificationsResponse,
  NotificationReminderSettings,
} from '../types/notification.types';

export const notificationApi = {
  /**
   * 1. Học sinh lấy danh sách thông báo của mình
   */
  getMyNotifications: async (): Promise<ApiResponse<MyNotificationsResponse>> => {
    return apiClient.get('/notifications/my');
  },

  /**
   * 2. Học sinh đánh dấu đã đọc tất cả thông báo
   */
  markAllRead: async (): Promise<ApiResponse<null>> => {
    return apiClient.patch('/notifications/read-all');
  },

  /**
   * 3. Học sinh đánh dấu Đã đọc / Chưa đọc cho 1 thông báo
   */
  setReadState: async (id: string, read: boolean): Promise<ApiResponse<null>> => {
    return apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`, {
      read,
    });
  },

  /**
   * 4. Admin lấy lịch sử thông báo & cấu hình Nhắc tự động
   */
  getAdminNotifications: async (params?: {
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminNotificationsResponse>> => {
    return apiClient.get('/notifications', { params });
  },

  /**
   * 5. Admin xem chi tiết thông báo kèm danh sách học sinh Đã đọc / Chưa đọc
   */
  getAdminNotificationDetail: async (
    id: string
  ): Promise<ApiResponse<AdminNotificationDetailResponse>> => {
    return apiClient.get(`/notifications/${encodeURIComponent(id)}`);
  },

  /**
   * 6. Admin soạn & gửi thông báo thủ công
   */
  createManualNotification: async (payload: {
    composeType: ComposeType;
    targetMode: 'CLASSES' | 'STUDENTS';
    classNames?: string[];
    studentIds?: string[];
    title: string;
    body: string;
    sendEmail?: boolean;
  }): Promise<ApiResponse<AdminNotificationItem>> => {
    return apiClient.post('/notifications', payload);
  },

  /**
   * 7. Admin xóa 1 thông báo khỏi lịch sử
   */
  deleteNotification: async (
    id: string
  ): Promise<ApiResponse<{ title: string }>> => {
    return apiClient.delete(`/notifications/${encodeURIComponent(id)}`);
  },

  /**
   * 8. Admin cập nhật cấu hình Nhắc tự động
   */
  updateReminderSettings: async (payload: {
    scheduleReminderOn?: boolean;
    scheduleSendTime?: string;
    tuitionReminderOn?: boolean;
    tuitionSendTime?: string;
    tuitionMonthlyDay?: number;
    tuitionRepeatDays?: number;
  }): Promise<ApiResponse<NotificationReminderSettings>> => {
    return apiClient.put('/notifications/settings', payload);
  },

  /**
   * 9. Admin bấm "Gửi nhắc ngay" (Lịch học hôm nay hoặc Học phí chưa đóng)
   */
  triggerReminderNow: async (
    type: 'SCHEDULE' | 'TUITION'
  ): Promise<ApiResponse<{ totalRecipients: number }>> => {
    return apiClient.post('/notifications/trigger-reminder', { type });
  },
};

export default notificationApi;
