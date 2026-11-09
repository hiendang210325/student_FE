import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import { DashboardStats } from '../types/dashboard.types';

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiClient.get('/dashboard/stats');
  },
};

