import { BaseEntity, PaginationParams } from '@/types/common.types';

export type StudentStatus = 'STUDYING' | 'RESERVED' | 'GRADUATED' | 'DROPOUT';
export type StudentGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student extends BaseEntity {
  studentCode: string;
  fullName: string;
  gender: StudentGender;
  dateOfBirth: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  className: string;
  academicYear: string;
  status: StudentStatus;
  gpa?: number;
}

export interface StudentFilterParams extends PaginationParams {
  className?: string;
  status?: StudentStatus;
  academicYear?: string;
  gender?: StudentGender;
}

export interface CreateStudentPayload {
  studentCode: string;
  fullName: string;
  gender: StudentGender;
  dateOfBirth: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  className: string;
  academicYear: string;
  status: StudentStatus;
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>;

