export type StudentStatus = 'Đang học' | 'Bảo lưu' | 'Nghỉ học';
export type StudentGender = 'Nữ' | 'Nam';

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  gender: StudentGender;
  classes: string[];
  className: string;
  parentPhone: string;
  dateOfBirth?: string;
  address?: string;
  academicYear: string;
  status: StudentStatus;
  isDeleted: boolean;
  deletedDate?: string;
  gpa?: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentStats {
  activeCount: number;
  trashCount: number;
  studyingCount: number;
  reservedCount: number;
  leaveCount: number;
  classes: string[];
}

export interface StudentListResponseData {
  items: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  className?: string;
  status?: string;
  isDeleted?: 'true' | 'false' | boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStudentPayload {
  studentCode?: string;
  fullName: string;
  email?: string;
  gender: StudentGender;
  classes: string[];
  parentPhone: string;
  dateOfBirth?: string;
  address?: string;
  academicYear?: string;
  status: StudentStatus;
  gpa?: number;
  note?: string;
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>;
