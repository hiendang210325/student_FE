import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  Student,
  StudentStats,
  StudentListResponseData,
  StudentFilterParams,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '../types/student.types';

export const studentApi = {
  /**
   * Lấy danh sách học sinh (hoạt động hoặc thùng rác) có phân trang, tìm kiếm và lọc
   */
  getStudents: async (
    params?: StudentFilterParams
  ): Promise<ApiResponse<StudentListResponseData>> => {
    return apiClient.get('/students', { params });
  },

  /**
   * Lấy thống kê số lượng học sinh & danh sách lớp hiện có
   */
  getStats: async (): Promise<ApiResponse<StudentStats>> => {
    return apiClient.get('/students/stats');
  },

  /**
   * Lấy thông tin chi tiết một học sinh theo ID hoặc mã học sinh
   */
  getStudentById: async (idOrCode: string): Promise<ApiResponse<Student>> => {
    return apiClient.get(`/students/${encodeURIComponent(idOrCode)}`);
  },

  /**
   * Thêm mới học sinh (tự động cấp tài khoản đăng nhập cho học sinh)
   */
  createStudent: async (payload: CreateStudentPayload): Promise<ApiResponse<Student>> => {
    return apiClient.post('/students', payload);
  },

  /**
   * Cập nhật thông tin học sinh (đồng bộ sang tài khoản liên kết)
   */
  updateStudent: async (
    idOrCode: string,
    payload: UpdateStudentPayload
  ): Promise<ApiResponse<Student>> => {
    return apiClient.put(`/students/${encodeURIComponent(idOrCode)}`, payload);
  },

  /**
   * Xóa mềm: Chuyển học sinh vào thùng rác
   */
  softDeleteStudent: async (idOrCode: string): Promise<ApiResponse<Student>> => {
    return apiClient.delete(`/students/${encodeURIComponent(idOrCode)}`);
  },

  /**
   * Khôi phục học sinh từ thùng rác
   */
  restoreStudent: async (idOrCode: string): Promise<ApiResponse<Student>> => {
    return apiClient.post(`/students/${encodeURIComponent(idOrCode)}/restore`);
  },

  /**
   * Xóa vĩnh viễn học sinh khỏi cơ sở dữ liệu
   */
  permanentDeleteStudent: async (idOrCode: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/students/${encodeURIComponent(idOrCode)}/permanent`);
  },
};

export default studentApi;
