import { ClassColorTheme } from '@/features/classes/types/class.types';

export type TuitionPaymentStatus = 'UNPAID' | 'PAID';
export type TuitionRowStatus = 'UNSET' | 'UNPAID' | 'PAID';
export type TuitionPaymentMethod = 'TRANSFER' | 'CASH';

export interface TuitionClassOverviewItem {
  id: string;
  name: string;
  grade: number;
  roomNumber: string;
  schedule: string;
  colorTheme: ClassColorTheme | null;
  studentCount: number;
  paidCount: number;
  unpaidCount: number;
  unsetCount: number;
  expectedAmount: number;
  collectedAmount: number;
}

export interface TuitionClassesOverviewResponse {
  month: number;
  year: number;
  summary: {
    totalClasses: number;
    totalStudents: number;
    paidCount: number;
    unpaidCount: number;
    unsetCount: number;
    expectedAmount: number;
    collectedAmount: number;
    remainingAmount: number;
  };
  items: TuitionClassOverviewItem[];
}

export interface TuitionRecordDetail {
  id: string;
  amount: number;
  attendedCountSnapshot: number | null;
  unitPriceSnapshot: number | null;
  teacherComment: string;
  status: TuitionPaymentStatus;
  paymentMethod: TuitionPaymentMethod | null;
  paidAt: string | null;
  emailSentAt: string | null;
  updatedAt: string;
}

export interface TuitionClassStudentRow {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  parentPhone: string;
  attendedCount: number;
  excusedLeaveCount: number;
  tuitionStatus: TuitionRowStatus;
  record: TuitionRecordDetail | null;
}

export interface TuitionClassDetailResponse {
  classInfo: {
    id: string;
    name: string;
    grade: number;
    roomNumber: string;
    schedule: string;
  };
  month: number;
  year: number;
  totalClassSessionsInMonth: number;
  summary: {
    totalStudents: number;
    paidCount: number;
    unpaidCount: number;
    unsetCount: number;
    expectedAmount: number;
    collectedAmount: number;
    remainingAmount: number;
  };
  students: TuitionClassStudentRow[];
}

export interface StudentTuitionSlipItem {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  month: number;
  year: number;
  amount: number;
  attendedCountSnapshot: number | null;
  unitPriceSnapshot: number | null;
  teacherComment: string;
  status: TuitionPaymentStatus;
  paymentMethod: TuitionPaymentMethod | null;
  paidAt: string | null;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyTuitionSlipsResponse {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
    classes: string[];
  } | null;
  unpaidCount: number;
  items: StudentTuitionSlipItem[];
}
