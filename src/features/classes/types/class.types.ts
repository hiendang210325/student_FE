import { BaseEntity } from '@/types/common.types';

// Cấu hình chủ đề màu sắc của ô vuông lớp học
export interface ClassColorTheme {
  bg: string;
  border: string;
  text: string;
  name?: string;
}

// Thực thể lớp học lưu trữ trong cơ sở dữ liệu
export interface ClassRoom extends BaseEntity {
  name: string;
  grade: number; // 1 đến 12
  academicYear: string;
  homeroomTeacher: string;
  totalStudents: number;
  roomNumber: string;
  colorTheme?: ClassColorTheme;
}

// Kiểu dữ liệu hiển thị cho từng ô vuông lớp học trên lưới
export interface ClassTileItem {
  id: number | string;
  name: string;
  grade?: number;
  studentCount: number;
  colorTheme: ClassColorTheme;
}
