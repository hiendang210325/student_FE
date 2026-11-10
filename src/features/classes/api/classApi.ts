import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import { ClassRoom } from '../types/class.types';

export const classApi = {
  // Lấy danh sách tất cả các lớp học
  getClasses: async (): Promise<ApiResponse<ClassRoom[]>> => {
    return apiClient.get('/classes');
  },

  // Lấy chi tiết lớp học theo ID
  getClassById: async (id: string | number): Promise<ApiResponse<ClassRoom>> => {
    return apiClient.get(`/classes/${id}`);
  },

  // Tạo mới một lớp học
  createClass: async (data: Partial<ClassRoom>): Promise<ApiResponse<ClassRoom>> => {
    return apiClient.post('/classes', data);
  },

  // Cập nhật thông tin lớp học (tên, khối, màu sắc ô vuông)
  updateClass: async (id: string | number, data: Partial<ClassRoom>): Promise<ApiResponse<ClassRoom>> => {
    return apiClient.put(`/classes/${id}`, data);
  },

  // Xóa một lớp học khỏi hệ thống
  deleteClass: async (id: string | number): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.delete(`/classes/${id}`);
  },
};
