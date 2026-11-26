import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  ScheduleItem,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '../types/schedule.types';

export const scheduleApi = {
  /**
   * 1. Lấy danh sách lịch học (Admin lấy tất cả, Học sinh chỉ lấy lịch của lớp mình học)
   */
  getSchedules: async (): Promise<ApiResponse<ScheduleItem[]>> => {
    return apiClient.get('/schedules');
  },

  /**
   * 2. Thêm lịch dạy cố định hàng tuần
   */
  createSchedule: async (
    payload: CreateSchedulePayload
  ): Promise<ApiResponse<ScheduleItem>> => {
    return apiClient.post('/schedules', payload);
  },

  /**
   * 3. Cập nhật lịch dạy cố định
   */
  updateSchedule: async (
    id: string,
    payload: UpdateSchedulePayload
  ): Promise<ApiResponse<ScheduleItem>> => {
    return apiClient.put(`/schedules/${encodeURIComponent(id)}`, payload);
  },

  /**
   * 4. Kết thúc / Xóa lịch dạy từ hôm nay trở đi (giữ lại lịch sử quá khứ)
   */
  deleteSchedule: async (
    id: string
  ): Promise<ApiResponse<{ archived: boolean; className: string }>> => {
    return apiClient.delete(`/schedules/${encodeURIComponent(id)}`);
  },

  /**
   * 5. Báo nghỉ hoặc mở lại riêng 1 buổi học lẻ theo ngày (YYYY-MM-DD)
   */
  toggleCancelDate: async (
    id: string,
    date: string,
    cancelled: boolean
  ): Promise<ApiResponse<ScheduleItem>> => {
    return apiClient.patch(`/schedules/${encodeURIComponent(id)}/cancel-date`, {
      date,
      cancelled,
    });
  },
};

export default scheduleApi;
