import { apiClient } from '@/services/api/apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  MyTuitionSlipsResponse,
  StudentTuitionSlipItem,
  TuitionClassDetailResponse,
  TuitionClassesOverviewResponse,
  TuitionPaymentMethod,
  TuitionPaymentStatus,
} from '../types/tuition.types';

export const tuitionApi = {
  /**
   * 1. Học sinh / Phụ huynh lấy danh sách phiếu học phí của mình
   */
  getMyTuitionSlips: async (): Promise<ApiResponse<MyTuitionSlipsResponse>> => {
    return apiClient.get('/tuition/my');
  },

  /**
   * 2. Admin lấy tổng quan học phí các lớp theo tháng/năm
   */
  getClassesOverview: async (params: {
    month: number;
    year: number;
  }): Promise<ApiResponse<TuitionClassesOverviewResponse>> => {
    return apiClient.get('/tuition/classes', { params });
  },

  /**
   * 3. Admin lấy chi tiết học phí 1 lớp theo tháng/năm
   */
  getClassDetail: async (
    classId: string,
    params: { month: number; year: number }
  ): Promise<ApiResponse<TuitionClassDetailResponse>> => {
    return apiClient.get(`/tuition/classes/${encodeURIComponent(classId)}`, {
      params,
    });
  },

  /**
   * 4. Admin lưu / cập nhật học phí cho 1 học sinh
   */
  upsertStudentTuition: async (
    classId: string,
    studentId: string,
    payload: {
      month: number;
      year: number;
      amount: number;
      teacherComment: string;
      status?: TuitionPaymentStatus;
      paymentMethod?: TuitionPaymentMethod | null;
      attendedCountSnapshot?: number | null;
      unitPriceSnapshot?: number | null;
    }
  ): Promise<ApiResponse<StudentTuitionSlipItem>> => {
    return apiClient.put(
      `/tuition/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(
        studentId
      )}`,
      payload
    );
  },

  /**
   * 5. Admin áp mức học phí nhanh cho cả lớp
   */
  bulkApplyTuition: async (
    classId: string,
    payload: {
      month: number;
      year: number;
      mode: 'FIXED' | 'PER_SESSION';
      fixedAmount?: number;
      unitPrice?: number;
      overwriteExisting?: boolean;
      defaultComment?: string;
    }
  ): Promise<ApiResponse<{ appliedCount: number; skippedCount: number }>> => {
    return apiClient.post(
      `/tuition/classes/${encodeURIComponent(classId)}/bulk-apply`,
      payload
    );
  },

  /**
   * 6. Admin chuyển nhanh trạng thái Đã đóng / Chờ đóng
   */
  updatePaymentStatus: async (
    recordId: string,
    payload: {
      status: TuitionPaymentStatus;
      paymentMethod?: TuitionPaymentMethod;
    }
  ): Promise<ApiResponse<StudentTuitionSlipItem>> => {
    return apiClient.patch(
      `/tuition/records/${encodeURIComponent(recordId)}/status`,
      payload
    );
  },

  /**
   * 7. Admin gửi thông báo Phiếu học phí qua Email
   */
  sendTuitionEmail: async (
    recordId: string
  ): Promise<ApiResponse<{ email: string; record: StudentTuitionSlipItem }>> => {
    return apiClient.post(
      `/tuition/records/${encodeURIComponent(recordId)}/send-email`
    );
  },
};

export default tuitionApi;
