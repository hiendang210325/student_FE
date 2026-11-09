import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import { LoginPayload, LoginResponse } from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', payload);
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },
};

