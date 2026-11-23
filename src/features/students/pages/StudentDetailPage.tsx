import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  School,
  BookOpen,
  Calendar,
  MapPin,
  FileText,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  Pause,
  Minus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { studentApi } from '../api/studentApi';
import { Student, StudentGender, StudentStatus } from '../types/student.types';
import { ApiError } from '@/services/api/apiError';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trạng thái sửa nhanh ngay tại trang chi tiết
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGender, setEditGender] = useState<StudentGender>('Nữ');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<StudentStatus>('Đang học');
  const [editDob, setEditDob] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('2025-2026');
  const [editGpa, setEditGpa] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editClasses, setEditClasses] = useState<string[]>([]);
  const [editClassInput, setEditClassInput] = useState('');

  // Trạng thái xóa mềm / khôi phục
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchStudent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await studentApi.getStudentById(id);
      setStudent(res.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không tìm thấy thông tin học sinh hoặc không thể kết nối máy chủ.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const openEditModal = () => {
    if (!student) return;
    setEditName(student.fullName);
    setEditEmail(student.email || '');
    setEditGender(student.gender);
    setEditPhone(student.parentPhone || '');
    setEditStatus(student.status);
    setEditDob(student.dateOfBirth || '');
    setEditAddress(student.address || '');
    setEditAcademicYear(student.academicYear || '2025-2026');
    setEditGpa(student.gpa !== undefined && student.gpa !== null ? String(student.gpa) : '');
    setEditNote(student.note || '');
    setEditClasses(
      student.classes && student.classes.length > 0
        ? student.classes
        : [student.className || 'Văn 9A']
    );
    setEditClassInput('');
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleAddClassChip = () => {
    const val = editClassInput.trim();
    if (!val) return;
    if (editClasses.includes(val)) return;
    setEditClasses((prev) => [...prev, val]);
    setEditClassInput('');
  };

  const handleRemoveClassChip = (cls: string) => {
    if (editClasses.length > 1) {
      setEditClasses((prev) => prev.filter((c) => c !== cls));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setEditError(null);

    const finalClasses = [...editClasses];
    if (editClassInput.trim() && !finalClasses.includes(editClassInput.trim())) {
      finalClasses.push(editClassInput.trim());
    }

    const parsedGpa = editGpa.trim() !== '' ? Number(editGpa) : undefined;
    if (parsedGpa !== undefined && (Number.isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 10)) {
      setEditError('Điểm trung bình phải nằm trong khoảng từ 0 đến 10.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await studentApi.updateStudent(student.id, {
        fullName: editName.trim(),
        email: editEmail.trim(),
        gender: editGender,
        parentPhone: editPhone.trim(),
        status: editStatus,
        dateOfBirth: editDob,
        address: editAddress.trim(),
        academicYear: editAcademicYear.trim(),
        gpa: parsedGpa,
        note: editNote.trim(),
        classes: finalClasses,
      });
      setStudent(res.data);
      setIsEditOpen(false);
      showToast('Đã cập nhật hồ sơ học sinh thành công!');
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Không thể cập nhật thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!student) return;
    setIsActionLoading(true);
    try {
      const res = await studentApi.softDeleteStudent(student.id);
      setStudent(res.data);
      setIsDeleteConfirmOpen(false);
      showToast(`Đã chuyển học sinh ${student.fullName} vào thùng rác.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Không thể chuyển vào thùng rác.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!student) return;
    setIsActionLoading(true);
    try {
      const res = await studentApi.restoreStudent(student.id);
      setStudent(res.data);
      showToast(`Đã khôi phục học sinh ${student.fullName}!`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Không thể khôi phục học sinh.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full lg:max-w-[1136px] mx-auto p-6 lg:p-8 flex flex-col items-center justify-center min-h-[420px] gap-3 text-brand-subtext font-nunito">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F6FA8]" />
        <p className="text-sm font-semibold">Đang tải hồ sơ học sinh...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="w-full lg:max-w-[1136px] mx-auto p-6 lg:p-8 font-nunito">
        <div className="rounded-[16px] border border-[#F3D9E3] bg-white p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-brand-text">
            Không tìm thấy hồ sơ học sinh
          </h2>
          <p className="text-sm text-brand-subtext max-w-md mx-auto">
            {error || 'Học sinh này có thể đã bị xóa hoặc mã học sinh không tồn tại trong hệ thống.'}
          </p>
          <div className="pt-2">
            <Button
              variant="blueAction"
              onClick={() => navigate('/students')}
              className="h-10 px-5 rounded-[12px] gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách học sinh</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const studentClasses =
    student.classes && student.classes.length > 0 ? student.classes : [student.className];

  return (
    <div className="w-full lg:max-w-[1136px] mx-auto p-0 lg:p-8 space-y-6 font-nunito text-brand-text bg-brand-page">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Thanh điều hướng trên cùng */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate('/students')}
          className="h-10 px-3 rounded-[10px] text-brand-subtext hover:text-brand-text hover:bg-white gap-2 font-bold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách học sinh</span>
        </Button>

        <div className="flex items-center gap-2.5">
          {student.isDeleted ? (
            <Button
              variant="outlineBlue"
              disabled={isActionLoading}
              onClick={handleRestore}
              className="h-10 px-4 rounded-[12px] gap-2 font-bold cursor-pointer"
            >
              {isActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>Khôi phục học sinh</span>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={openEditModal}
                className="h-10 px-4 rounded-[12px] border-[#9C6B84] text-brand-text font-bold gap-2 hover:bg-[#FFE0EB]/40 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </Button>
              <Button
                variant="deletePermanent"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="h-10 px-4 rounded-[12px] font-bold gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Chuyển vào thùng rác</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Cảnh báo nếu học sinh đang trong thùng rác */}
      {student.isDeleted && (
        <div className="p-4 rounded-[12px] bg-[#FFE0EB] border border-[#F8A5C2] text-[#A61E4D] text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>
            Học sinh này hiện đang nằm trong thùng rác (ngày xóa: {student.deletedDate || '—'}). Bấm “Khôi phục học sinh” để đưa trở lại danh sách lớp.
          </span>
        </div>
      )}

      {/* Phần đầu thẻ thông tin học sinh */}
      <div className="rounded-[16px] border border-[#F3D9E3] bg-white p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFE0EB] text-[#A61E4D] font-bold text-2xl shadow-2xs flex-shrink-0">
              {getInitials(student.fullName)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif-title text-2xl lg:text-[28px] font-bold text-brand-text">
                  {student.fullName}
                </h1>
                {student.status === 'Đang học' && (
                  <Badge variant="studying" className="px-3 py-1 font-bold text-xs rounded-[10px]">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                    <span>Đang học</span>
                  </Badge>
                )}
                {student.status === 'Bảo lưu' && (
                  <Badge variant="reserved" className="px-3 py-1 font-bold text-xs rounded-[10px]">
                    <Pause className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Bảo lưu</span>
                  </Badge>
                )}
                {student.status === 'Nghỉ học' && (
                  <Badge variant="leave" className="px-3 py-1 font-bold text-xs rounded-[10px]">
                    <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Nghỉ học</span>
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-brand-subtext">
                <span>Mã học sinh:</span>
                <span className="font-mono font-bold text-[#1F4E79] bg-[#E9F3FF] px-2 py-0.5 rounded-md">
                  {student.studentCode}
                </span>
                <span>•</span>
                <span>Niên khóa:</span>
                <strong className="text-brand-text">{student.academicYear || '2025-2026'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:border-l sm:border-[#F3D9E3] sm:pl-6">
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-brand-subtext">Điểm trung bình</p>
              <p className="font-serif-title text-3xl font-bold text-[#2F6FA8]">
                {student.gpa !== undefined && student.gpa !== null ? student.gpa.toFixed(1) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bố cục 2 cột chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin cá nhân */}
        <div className="lg:col-span-2 rounded-[16px] border border-[#F3D9E3] bg-white p-6 shadow-card space-y-5">
          <h3 className="font-serif-title text-lg font-bold text-brand-text flex items-center gap-2 border-b border-[#F3D9E3] pb-3">
            <User className="w-5 h-5 text-[#D6336C]" />
            <span>Thông tin cá nhân & Liên hệ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]/70">
              <span className="text-xs font-bold text-brand-subtext block mb-1">Giới tính</span>
              <span className="font-bold text-brand-text">{student.gender}</span>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]/70">
              <span className="text-xs font-bold text-brand-subtext flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#2F6FA8]" /> Ngày sinh
              </span>
              <span className="font-bold text-brand-text">
                {student.dateOfBirth || 'Chưa cập nhật'}
              </span>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]/70">
              <span className="text-xs font-bold text-brand-subtext flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#D6336C]" /> Email học sinh
              </span>
              <span className="font-bold text-brand-text break-all">
                {student.email || 'Chưa cập nhật email'}
              </span>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]/70">
              <span className="text-xs font-bold text-brand-subtext flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#2F6FA8]" /> SĐT phụ huynh
              </span>
              <span className="font-mono font-bold text-brand-text">
                {student.parentPhone || '—'}
              </span>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]/70">
              <span className="text-xs font-bold text-brand-subtext flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#D6336C]" /> Địa chỉ
              </span>
              <span className="font-semibold text-brand-text">
                {student.address || 'Chưa cập nhật địa chỉ'}
              </span>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]/70">
              <span className="text-xs font-bold text-brand-subtext flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#2F6FA8]" /> Ghi chú của giáo viên
              </span>
              <span className="font-medium text-brand-text">
                {student.note || 'Chưa có ghi chú nào cho học sinh này.'}
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin học vụ & Lớp học */}
        <div className="space-y-6">
          <div className="rounded-[16px] border border-[#F3D9E3] bg-white p-6 shadow-card space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-brand-text flex items-center gap-2 border-b border-[#F3D9E3] pb-3">
              <School className="w-5 h-5 text-[#2F6FA8]" />
              <span>Lớp đang theo học</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {studentClasses.map((cls, idx) => (
                <Badge key={idx} variant="classChip" className="px-3 py-1 text-xs font-bold">
                  {cls}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[16px] border border-[#F3D9E3] bg-white p-6 shadow-card space-y-3">
            <h3 className="font-serif-title text-lg font-bold text-brand-text flex items-center gap-2 border-b border-[#F3D9E3] pb-3">
              <BookOpen className="w-5 h-5 text-[#D6336C]" />
              <span>Thông tin học vụ</span>
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-[#F3D9E3]/50">
                <span className="text-brand-subtext">Niên khóa:</span>
                <span className="font-bold text-brand-text">{student.academicYear || '2025-2026'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F3D9E3]/50">
                <span className="text-brand-subtext">Trạng thái:</span>
                <span className="font-bold text-brand-text">{student.status}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-brand-subtext">Tài khoản đăng nhập:</span>
                <span className="font-mono font-bold text-[#2F6FA8]">{student.studentCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Chỉnh sửa học sinh ngay tại trang chi tiết */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !isSaving && setIsEditOpen(open)}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] p-6 bg-white border border-[#F3D9E3] rounded-[12px] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="font-serif-title text-xl font-bold text-brand-text">
              Chỉnh sửa hồ sơ học sinh
            </DialogTitle>
            <DialogDescription className="text-xs text-brand-subtext">
              {student.studentCode} · {student.fullName}
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Họ và tên *</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="h-10 rounded-[10px] text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Giới tính</Label>
                <div className="w-full h-10 p-1 rounded-[10px] border border-[#9C6B84] bg-white flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditGender('Nam')}
                    className={`flex-1 h-full rounded-[8px] text-xs font-bold cursor-pointer ${
                      editGender === 'Nam' ? 'bg-[#2F6FA8] text-white' : 'text-[#6B5560]'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender('Nữ')}
                    className={`flex-1 h-full rounded-[8px] text-xs font-bold cursor-pointer ${
                      editGender === 'Nữ' ? 'bg-[#2F6FA8] text-white' : 'text-[#6B5560]'
                    }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Email</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-10 rounded-[10px] text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">SĐT phụ huynh</Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0900 111 xxx"
                  className="h-10 rounded-[10px] font-mono text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Ngày sinh</Label>
                <Input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="h-10 rounded-[10px] text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Trạng thái</Label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as StudentStatus)}
                  className="w-full h-10 px-3 rounded-[10px] border border-[#9C6B84] bg-white text-xs font-semibold cursor-pointer"
                >
                  <option value="Đang học">Đang học</option>
                  <option value="Bảo lưu">Bảo lưu</option>
                  <option value="Nghỉ học">Nghỉ học</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Niên khóa</Label>
                <Input
                  value={editAcademicYear}
                  onChange={(e) => setEditAcademicYear(e.target.value)}
                  className="h-10 rounded-[10px] text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Điểm TB (0 - 10)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editGpa}
                  onChange={(e) => setEditGpa(e.target.value)}
                  placeholder="VD: 8.5"
                  className="h-10 rounded-[10px] text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold">Lớp đang học *</Label>
                <div className="w-full min-h-[42px] px-2.5 py-1.5 rounded-[10px] border border-[#9C6B84] bg-white flex flex-wrap items-center gap-1.5">
                  {editClasses.map((cls) => (
                    <Badge key={cls} variant="studying" className="gap-1 px-2.5 py-0.5 text-xs">
                      <span>{cls}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClassChip(cls)}
                        className="cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    value={editClassInput}
                    onChange={(e) => setEditClassInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddClassChip();
                      }
                    }}
                    placeholder="+ Thêm lớp rồi Enter"
                    className="flex-1 min-w-[140px] h-7 bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold">Địa chỉ</Label>
                <Input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="h-10 rounded-[10px] text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold">Ghi chú</Label>
                <Input
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="h-10 rounded-[10px] text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-[#F3D9E3] flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setIsEditOpen(false)}
                className="h-10 px-4 rounded-[10px] cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="raspberry"
                disabled={isSaving}
                className="h-10 px-5 rounded-[10px] gap-2 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Lưu thay đổi</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal xác nhận chuyển vào thùng rác */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !isActionLoading && setIsDeleteConfirmOpen(open)}
      >
        <DialogContent className="sm:max-w-[420px] p-6 bg-white border border-[#F3D9E3] rounded-[12px]">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="font-serif-title text-xl font-bold text-brand-text">
              Chuyển {student.fullName} vào thùng rác?
            </DialogTitle>
            <DialogDescription className="text-sm text-brand-subtext">
              Học sinh sẽ bị ẩn khỏi danh sách lớp và tạm khóa tài khoản đăng nhập. Bạn có thể khôi phục bất cứ lúc nào.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button
              variant="ghost"
              disabled={isActionLoading}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="h-10 px-4 rounded-[10px] cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              variant="blueAction"
              disabled={isActionLoading}
              onClick={handleSoftDelete}
              className="h-10 px-4 rounded-[10px] gap-2 cursor-pointer"
            >
              {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Chuyển vào thùng rác</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
