import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { Button } from '@/components/common/Button/Button';
import { Student, CreateStudentPayload } from '../types/student.types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentPayload) => Promise<void>;
  student?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
}) => {
  const [formData, setFormData] = useState<CreateStudentPayload>({
    studentCode: '',
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    className: '10A1',
    academicYear: '2025-2026',
    status: 'STUDYING',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        studentCode: student.studentCode,
        fullName: student.fullName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        email: student.email,
        phoneNumber: student.phoneNumber || '',
        className: student.className,
        academicYear: student.academicYear,
        status: student.status,
      });
    } else {
      setFormData({
        studentCode: `HS${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: '',
        gender: 'MALE',
        dateOfBirth: '2008-01-01',
        email: '',
        phoneNumber: '',
        className: '10A1',
        academicYear: '2025-2026',
        status: 'STUDYING',
      });
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Chỉnh sửa thông tin học sinh' : 'Thêm mới học sinh'}
      description="Điền đầy đủ các thông tin cá nhân và học vụ theo quy định."
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            type="submit"
          >
            {student ? 'Cập nhật' : 'Lưu học sinh'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã học sinh"
            value={formData.studentCode}
            onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
            required
          />
          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Giới tính"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })
            }
            options={[
              { label: 'Nam', value: 'MALE' },
              { label: 'Nữ', value: 'FEMALE' },
              { label: 'Khác', value: 'OTHER' },
            ]}
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="hocsinh@edu.vn"
            required
          />
          <Input
            label="Số điện thoại phụ huynh"
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="0912 345 678"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Lớp học"
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            options={[
              { label: '10A1', value: '10A1' },
              { label: '10A2', value: '10A2' },
              { label: '11A1', value: '11A1' },
              { label: '12A1', value: '12A1' },
            ]}
          />
          <Input
            label="Niên khóa"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            required
          />
          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as CreateStudentPayload['status'] })
            }
            options={[
              { label: 'Đang học', value: 'STUDYING' },
              { label: 'Bảo lưu', value: 'RESERVED' },
              { label: 'Tốt nghiệp', value: 'GRADUATED' },
              { label: 'Thôi học', value: 'DROPOUT' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
};

