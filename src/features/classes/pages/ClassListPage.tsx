import React from 'react';
import { Table, Column } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { Plus, Users, School } from 'lucide-react';
import { ClassRoom } from '../types/class.types';

const mockClasses: ClassRoom[] = [
  {
    id: 1,
    name: '10A1',
    grade: 10,
    academicYear: '2025-2026',
    homeroomTeacher: 'ThS. Trần Thị Lan',
    totalStudents: 35,
    roomNumber: 'A1-201',
  },
  {
    id: 2,
    name: '10A2',
    grade: 10,
    academicYear: '2025-2026',
    homeroomTeacher: 'Thầy Lê Văn Hùng',
    totalStudents: 36,
    roomNumber: 'A1-202',
  },
  {
    id: 3,
    name: '11A1',
    grade: 11,
    academicYear: '2025-2026',
    homeroomTeacher: 'Cô Hoàng Minh Nguyệt',
    totalStudents: 34,
    roomNumber: 'B2-301',
  },
  {
    id: 4,
    name: '12A1',
    grade: 12,
    academicYear: '2025-2026',
    homeroomTeacher: 'Thầy Đỗ Quốc Tuấn',
    totalStudents: 38,
    roomNumber: 'C3-102',
  },
];

export const ClassListPage: React.FC = () => {
  const columns: Column<ClassRoom>[] = [
    {
      key: 'name',
      header: 'Tên Lớp',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <School className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">{row.name}</span>
            <p className="text-xs text-slate-400">Phòng: {row.roomNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Khối',
      align: 'center',
      render: (row) => <span className="font-medium text-slate-700">Khối {row.grade}</span>,
    },
    {
      key: 'homeroomTeacher',
      header: 'Giáo viên chủ nhiệm',
      render: (row) => <span className="font-medium text-slate-800">{row.homeroomTeacher}</span>,
    },
    {
      key: 'totalStudents',
      header: 'Sĩ số',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
          <Users className="w-3.5 h-3.5" /> {row.totalStudents} HS
        </span>
      ),
    },
    {
      key: 'academicYear',
      header: 'Niên khóa',
      align: 'center',
      render: (row) => <span className="text-slate-600">{row.academicYear}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Lớp Học</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách các lớp học chính khóa của trường</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Thêm lớp học mới</Button>
      </div>

      <Table<ClassRoom> columns={columns} data={mockClasses} />
    </div>
  );
};

