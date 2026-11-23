import { Student } from '@/features/students/types/student.types';

// Cấu hình chủ đề màu sắc của ô vuông lớp học
export interface ClassColorTheme {
  bg: string;
  border: string;
  text: string;
  name?: string;
}

// Thực thể lớp học lưu trữ trong cơ sở dữ liệu
export interface ClassRoom {
  id: string;
  name: string;
  grade: number; // 1 đến 12
  academicYear: string;
  homeroomTeacher: string;
  roomNumber: string;
  schedule?: string;
  maxCapacity?: number;
  description?: string;
  totalStudents: number;
  colorTheme?: ClassColorTheme;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassDetailData extends ClassRoom {
  students: Student[];
}

export interface ClassPayload {
  name: string;
  grade: number;
  academicYear?: string;
  homeroomTeacher?: string;
  roomNumber?: string;
  schedule?: string;
  maxCapacity?: number;
  description?: string;
  colorTheme?: ClassColorTheme;
}

export interface AttendanceRecord {
  classId: string;
  date: string; // YYYY-MM-DD
  presentStudentIds: string[];
}
