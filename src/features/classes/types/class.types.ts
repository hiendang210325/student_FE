import { BaseEntity } from '@/types/common.types';

export interface ClassRoom extends BaseEntity {
  name: string;
  grade: number; // 10, 11, 12
  academicYear: string;
  homeroomTeacher: string;
  totalStudents: number;
  roomNumber: string;
}

