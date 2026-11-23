import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  ClassRoom,
  ClassDetailData,
  ClassPayload,
  AttendanceRecord,
} from '../types/class.types';

export const classApi = {
  // 1. Lấy danh sách tất cả các lớp học kèm sĩ số thực tế
  getClasses: async (): Promise<ApiResponse<ClassRoom[]>> => {
    return apiClient.get('/classes');
  },

  // 2. Lấy chi tiết lớp học theo ID kèm danh sách học sinh thực tế
  getClassById: async (id: string): Promise<ApiResponse<ClassDetailData>> => {
    return apiClient.get(`/classes/${encodeURIComponent(id)}`);
  },

  // 3. Tạo mới một lớp học
  createClass: async (data: ClassPayload): Promise<ApiResponse<ClassRoom>> => {
    return apiClient.post('/classes', data);
  },

  // 4. Cập nhật thông tin lớp học (tên, khối, lịch học, màu sắc...)
  updateClass: async (
    id: string,
    data: Partial<ClassPayload>
  ): Promise<ApiResponse<ClassRoom>> => {
    return apiClient.put(`/classes/${encodeURIComponent(id)}`, data);
  },

  // 5. Xóa một lớp học khỏi hệ thống
  deleteClass: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.delete(`/classes/${encodeURIComponent(id)}`);
  },

  // 6. Thêm nhiều học sinh vào lớp học
  addStudentsToClass: async (
    classId: string,
    studentIds: string[]
  ): Promise<ApiResponse<{ addedCount: number; className: string }>> => {
    return apiClient.post(`/classes/${encodeURIComponent(classId)}/students`, { studentIds });
  },

  // 7. Gỡ một học sinh khỏi lớp học
  removeStudentFromClass: async (
    classId: string,
    studentId: string
  ): Promise<ApiResponse<{ studentName: string; className: string }>> => {
    return apiClient.delete(
      `/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`
    );
  },

  // 8. Lấy dữ liệu điểm danh theo ngày (YYYY-MM-DD)
  getAttendance: async (
    classId: string,
    date: string
  ): Promise<ApiResponse<AttendanceRecord>> => {
    return apiClient.get(`/classes/${encodeURIComponent(classId)}/attendance`, {
      params: { date },
    });
  },

  // 9. Lưu điểm danh theo ngày (YYYY-MM-DD)
  saveAttendance: async (
    classId: string,
    date: string,
    presentStudentIds: string[]
  ): Promise<ApiResponse<AttendanceRecord>> => {
    return apiClient.put(`/classes/${encodeURIComponent(classId)}/attendance`, {
      date,
      presentStudentIds,
    });
  },
};

export default classApi;
