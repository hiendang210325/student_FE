import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import { ClassRoom } from '../types/class.types';

export const classApi = {
  getClasses: async (): Promise<ApiResponse<ClassRoom[]>> => {
    return apiClient.get('/classes');
  },

  getClassById: async (id: string | number): Promise<ApiResponse<ClassRoom>> => {
    return apiClient.get(`/classes/${id}`);
  },
};

