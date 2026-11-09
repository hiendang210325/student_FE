import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button/Button';
import { Badge } from '@/components/common/Badge/Badge';
import { ArrowLeft, Mail, Phone, User, School, BookOpen } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock detail data
  const student = {
    id: id || '1',
    studentCode: 'HS1001',
    fullName: 'Nguyễn Văn An',
    gender: 'Nam',
    dateOfBirth: '2008-05-14',
    email: 'an.nguyen@edu.vn',
    phoneNumber: '0901234567',
    address: 'Số 12, Đường Giải Phóng, Q. Đống Đa, Hà Nội',
    className: '10A1',
    homeroomTeacher: 'ThS. Trần Thị Lan',
    academicYear: '2025-2026',
    status: 'STUDYING',
    gpa: 8.6,
    conduct: 'Tốt',
    subjects: [
      { name: 'Toán học', midterm: 8.5, final: 9.0, avg: 8.8 },
      { name: 'Ngữ văn', midterm: 7.5, final: 8.0, avg: 7.8 },
      { name: 'Tiếng Anh', midterm: 9.5, final: 9.5, avg: 9.5 },
      { name: 'Vật lý', midterm: 8.0, final: 8.5, avg: 8.3 },
      { name: 'Hóa học', midterm: 8.5, final: 8.0, avg: 8.2 },
      { name: 'Sinh học', midterm: 8.0, final: 8.5, avg: 8.3 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Quay lại danh sách
        </Button>
      </div>

      {/* Profile Card Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-2xl shadow-inner">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{student.fullName}</h1>
                <Badge variant="success">Đang học</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mã học sinh: <strong className="text-slate-800">{student.studentCode}</strong> • Lớp:{' '}
                <strong className="text-slate-800">{student.className}</strong> ({student.academicYear})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">Điểm TB tích lũy</p>
              <p className="text-3xl font-black text-emerald-600">{student.gpa}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info detail */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" /> Thông tin cá nhân
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Giới tính:</span>
                <span className="font-semibold text-slate-800">{student.gender}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(student.dateOfBirth)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Điện thoại phụ huynh:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.phoneNumber}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Địa chỉ thường trú:</span>
                <span className="font-medium text-slate-800">{student.address}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <School className="w-4 h-4 text-brand-600" /> Thông tin học vụ
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Giáo viên chủ nhiệm:</span>
                <span className="font-semibold text-slate-800">{student.homeroomTeacher}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Hạnh kiểm:</span>
                <span className="font-semibold text-emerald-600">{student.conduct}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Kỳ hiện tại:</span>
                <span className="font-semibold text-slate-800">Học kỳ 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600" /> Bảng điểm chi tiết
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Môn học</th>
                  <th className="px-4 py-3 text-center">Giữa kỳ</th>
                  <th className="px-4 py-3 text-center">Cuối kỳ</th>
                  <th className="px-4 py-3 text-center">Điểm TB môn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-800">{sub.name}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{sub.midterm}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{sub.final}</td>
                    <td className="px-4 py-3 text-center font-bold text-brand-600">{sub.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

