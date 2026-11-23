import React from 'react';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { Search } from 'lucide-react';
import { StudentFilterParams, StudentStatus } from '../types/student.types';

interface StudentFilterProps {
  filter: StudentFilterParams;
  onChange: (newFilter: Partial<StudentFilterParams>) => void;
  classList?: string[];
}

const statusOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Đang học', value: 'Đang học' },
  { label: 'Bảo lưu', value: 'Bảo lưu' },
  { label: 'Nghỉ học', value: 'Nghỉ học' },
];

export const StudentFilter: React.FC<StudentFilterProps> = ({
  filter,
  onChange,
  classList = ['Văn 7C', 'Văn 8B', 'Văn 9A', 'Luyện thi vào 10', 'Văn 10 nâng cao'],
}) => {
  const classOptions = [
    { label: 'Tất cả các lớp', value: '' },
    ...classList.map((c) => ({ label: c, value: c })),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="lg:col-span-2">
        <Input
          placeholder="Tìm theo tên học sinh, mã số học sinh, email..."
          value={filter.search || ''}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <div>
        <Select
          options={classOptions}
          value={filter.className || ''}
          onChange={(e) => onChange({ className: e.target.value || undefined, page: 1 })}
        />
      </div>

      <div>
        <Select
          options={statusOptions}
          value={filter.status || ''}
          onChange={(e) =>
            onChange({ status: (e.target.value as StudentStatus) || undefined, page: 1 })
          }
        />
      </div>
    </div>
  );
};
