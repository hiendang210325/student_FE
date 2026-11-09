import { apiClient } from '@/services/api/apiClient';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';
import {
  Student,
  StudentFilterParams,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '../types/student.types';

export const studentApi = {
  getStudents: async (params?: StudentFilterParams): Promise<PaginatedResponse<Student>> => {
    return apiClient.get('/students', { params });
  },

  getStudentById: async (id: string | number): Promise<ApiResponse<Student>> => {
    return apiClient.get(`/students/${id}`);
  },

  createStudent: async (payload: CreateStudentPayload): Promise<ApiResponse<Student>> => {
    return apiClient.post('/students', payload);
  },

  updateStudent: async (
    id: string | number,
    payload: UpdateStudentPayload
  ): Promise<ApiResponse<Student>> => {
    return apiClient.put(`/students/${id}`, payload);
  },

  deleteStudent: async (id: string | number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/students/${id}`);
  },
};

