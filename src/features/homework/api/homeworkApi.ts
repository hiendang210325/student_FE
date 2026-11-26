import { apiClient } from '@/services/api/apiClient';
import { ENV } from '@/config/env';
import { ApiResponse } from '@/types/common.types';
import {
  AdminHomeworkListResponse,
  HomeworkAdminItem,
  HomeworkGradingDetail,
  MyHomeworksResponse,
  StudentSubmissionDetail,
} from '../types/homework.types';

export const SERVER_ORIGIN = ENV.API_BASE_URL.replace(/\/api\/?$/, '');

export const getFileViewUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  const normalized = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  return `${SERVER_ORIGIN}${normalized}`;
};

export const getFileDownloadUrl = (relativeUrl: string, originalName?: string): string => {
  const base = getFileViewUrl(relativeUrl);
  if (!base) return '';
  const params = new URLSearchParams({ download: '1' });
  if (originalName) {
    params.set('name', originalName);
  }
  return `${base}?${params.toString()}`;
};

export const homeworkApi = {
  /**
   * 1. Admin lấy danh sách bài tập (có lọc lớp & phân trang)
   */
  getAdminHomeworks: async (params?: {
    className?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminHomeworkListResponse>> => {
    return apiClient.get('/homeworks', { params });
  },

  /**
   * 2. Admin giao bài tập mới (1 hoặc nhiều lớp + file đính kèm)
   */
  createHomeworks: async (payload: {
    title: string;
    classIds: string[];
    dueDate: string;
    dueTime: string;
    instructions: string;
    files: File[];
  }): Promise<ApiResponse<HomeworkAdminItem[]>> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('classIds', JSON.stringify(payload.classIds));
    formData.append('dueDate', payload.dueDate);
    formData.append('dueTime', payload.dueTime);
    formData.append('instructions', payload.instructions);
    for (const file of payload.files) {
      formData.append('files', file);
    }
    return apiClient.post('/homeworks', formData);
  },

  /**
   * 3. Admin cập nhật bài tập đã giao
   */
  updateHomework: async (
    id: string,
    payload: {
      title: string;
      classId: string;
      dueDate: string;
      dueTime: string;
      instructions: string;
      keptAttachmentIds: string[];
      newFiles: File[];
    }
  ): Promise<ApiResponse<HomeworkAdminItem>> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('classId', payload.classId);
    formData.append('dueDate', payload.dueDate);
    formData.append('dueTime', payload.dueTime);
    formData.append('instructions', payload.instructions);
    formData.append('keptAttachmentIds', JSON.stringify(payload.keptAttachmentIds));
    for (const file of payload.newFiles) {
      formData.append('files', file);
    }
    return apiClient.put(`/homeworks/${encodeURIComponent(id)}`, formData);
  },

  /**
   * 4. Admin xóa bài tập
   */
  deleteHomework: async (
    id: string
  ): Promise<ApiResponse<{ title: string; className: string }>> => {
    return apiClient.delete(`/homeworks/${encodeURIComponent(id)}`);
  },

  /**
   * 5. Admin lấy không gian Chấm bài của 1 bài tập
   */
  getGradingDetail: async (id: string): Promise<ApiResponse<HomeworkGradingDetail>> => {
    return apiClient.get(`/homeworks/${encodeURIComponent(id)}/grading`);
  },

  /**
   * 6. Admin gửi hoặc cập nhật điểm & nhận xét cho học sinh
   */
  gradeSubmission: async (
    homeworkId: string,
    studentId: string,
    payload: { score: string | number; comment: string }
  ): Promise<
    ApiResponse<{
      submission: StudentSubmissionDetail;
      updatedStudentGpa: number | null;
    }>
  > => {
    return apiClient.patch(
      `/homeworks/${encodeURIComponent(homeworkId)}/submissions/${encodeURIComponent(
        studentId
      )}/grade`,
      payload
    );
  },

  /**
   * 7. Học sinh lấy danh sách bài tập của mình
   */
  getMyHomeworks: async (): Promise<ApiResponse<MyHomeworksResponse>> => {
    return apiClient.get('/homeworks/my');
  },

  /**
   * 8. Học sinh nộp bài hoặc sửa bài nộp (ảnh trang vở)
   */
  submitHomework: async (
    homeworkId: string,
    payload: {
      keptPhotoIds: string[];
      newPhotos: File[];
    }
  ): Promise<ApiResponse<StudentSubmissionDetail>> => {
    const formData = new FormData();
    formData.append('keptPhotoIds', JSON.stringify(payload.keptPhotoIds));
    for (const photo of payload.newPhotos) {
      formData.append('photos', photo);
    }
    return apiClient.post(`/homeworks/${encodeURIComponent(homeworkId)}/submit`, formData);
  },
};

export default homeworkApi;
