import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Pause,
  Minus,
  UserMinus,
  UserCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  X,
  Pencil,
  Calendar,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { AddStudentModal } from '../components/AddStudentModal';
import { ClassFormModal } from '../components/ClassFormModal';
import { classApi } from '../api/classApi';
import { ClassDetailData, ClassPayload } from '../types/class.types';
import { Student } from '@/features/students/types/student.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ApiError } from '@/services/api/apiError';

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classDetail, setClassDetail] = useState<ClassDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tìm kiếm học sinh trong lớp
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal thêm học sinh & sửa lớp
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Trạng thái điểm danh theo ngày (lưu DB)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [attendedStudentIds, setAttendedStudentIds] = useState<string[]>([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchClassDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await classApi.getClassById(id);
      setClassDetail(res.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không tìm thấy lớp học hoặc không thể kết nối máy chủ.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchAttendance = useCallback(async () => {
    if (!id) return;
    try {
      const res = await classApi.getAttendance(id, attendanceDate);
      setAttendedStudentIds(res.data?.presentStudentIds || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu điểm danh:', err);
    }
  }, [id, attendanceDate]);

  useEffect(() => {
    fetchClassDetail();
  }, [fetchClassDetail]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const students = classDetail?.students || [];

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.parentPhone || '').includes(q)
    );
  }, [students, searchQuery]);

  // Gỡ học sinh khỏi lớp
  const handleRemoveFromClass = async (student: Student) => {
    if (!id || !classDetail) return;
    setRemovingStudentId(student.id);
    try {
      await classApi.removeStudentFromClass(id, student.id);
      setAttendedStudentIds((prev) => prev.filter((sid) => sid !== student.id));
      await fetchClassDetail();
      showToast(`Đã gỡ học sinh ${student.fullName} khỏi lớp ${classDetail.name}.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể gỡ học sinh khỏi lớp.'
      );
    } finally {
      setRemovingStudentId(null);
    }
  };

  // Điểm danh từng học sinh và lưu ngay lên MongoDB
  const handleToggleAttendance = async (student: Student) => {
    if (!id) return;
    const isCurrentlyAttended = attendedStudentIds.includes(student.id);
    const nextIds = isCurrentlyAttended
      ? attendedStudentIds.filter((sid) => sid !== student.id)
      : [...attendedStudentIds, student.id];

    setAttendedStudentIds(nextIds);
    setIsSavingAttendance(true);
    try {
      await classApi.saveAttendance(id, attendanceDate, nextIds);
      showToast(
        isCurrentlyAttended
          ? `Đã hủy điểm danh cho ${student.fullName}.`
          : `Đã điểm danh cho ${student.fullName} thành công!`
      );
    } catch (err) {
      // Hoàn tác nếu lỗi
      setAttendedStudentIds(attendedStudentIds);
      showToast(
        err instanceof ApiError ? err.message : 'Không thể lưu trạng thái điểm danh.'
      );
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Điểm danh tất cả học sinh trong lớp cho ngày đang chọn
  const handleMarkAllAttendance = async () => {
    if (!id || students.length === 0) return;
    const allIds = students.map((s) => s.id);
    const allMarked = allIds.every((sid) => attendedStudentIds.includes(sid));
    const nextIds = allMarked ? [] : allIds;

    setAttendedStudentIds(nextIds);
    setIsSavingAttendance(true);
    try {
      await classApi.saveAttendance(id, attendanceDate, nextIds);
      showToast(
        allMarked
          ? `Đã bỏ chọn điểm danh tất cả ngày ${attendanceDate}.`
          : `Đã điểm danh đủ ${allIds.length} học sinh ngày ${attendanceDate}!`
      );
    } catch (err) {
      setAttendedStudentIds(attendedStudentIds);
      showToast(err instanceof ApiError ? err.message : 'Không thể lưu điểm danh.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Xác nhận thêm học sinh thật từ Modal vào lớp
  const handleConfirmAddStudents = async (studentIds: string[]) => {
    if (!id || !classDetail) return;
    const res = await classApi.addStudentsToClass(id, studentIds);
    await fetchClassDetail();
    showToast(
      `Đã thêm ${res.data?.addedCount ?? studentIds.length} học sinh vào lớp ${classDetail.name} thành công!`
    );
  };

  // Cập nhật thông tin lớp học ngay từ trang chi tiết
  const handleUpdateClass = async (payload: ClassPayload) => {
    if (!id) return;
    await classApi.updateClass(id, payload);
    await fetchClassDetail();
    showToast(`Đã cập nhật thông tin lớp "${payload.name}"!`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[420px] flex flex-col items-center justify-center gap-3 text-[#6B5560] bg-[#FFF6F9] font-nunito">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F6FA8]" />
        <span className="text-sm font-semibold">Đang tải thông tin lớp học...</span>
      </div>
    );
  }

  if (error || !classDetail) {
    return (
      <div className="w-full lg:max-w-[1136px] mx-auto p-6 lg:p-8 font-nunito">
        <div className="rounded-[16px] border border-[#F3D9E3] bg-white p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-[#3B2A35]">
            Không tìm thấy lớp học
          </h2>
          <p className="text-sm text-[#6B5560] max-w-md mx-auto">
            {error || 'Lớp học này không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLASSES)}
            className="h-10 px-5 rounded-[10px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách lớp học</span>
          </button>
        </div>
      </div>
    );
  }

  const allMarked =
    students.length > 0 && students.every((s) => attendedStudentIds.includes(s.id));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh]">
        <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-5 box-border select-none relative">
          {/* Thông báo nổi */}
          {toastMessage && (
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 mb-1 text-[14px] text-[#6B5560]">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLASSES)}
                  className="p-1 -ml-1 rounded-[6px] hover:bg-white/60 text-[#6B5560] hover:text-[#2F6FA8] transition-colors flex items-center justify-center cursor-pointer"
                  title="Quay lại danh sách lớp học"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <Link
                  to={ROUTES.CLASSES}
                  className="text-[#2F6FA8] hover:underline cursor-pointer font-semibold"
                >
                  Lớp học
                </Link>
                <span className="text-[#6B5560]">›</span>
                <span className="text-[#6B5560] font-semibold truncate">{classDetail.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  {classDetail.name}
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                  {students.length}
                  {classDetail.maxCapacity ? ` / ${classDetail.maxCapacity}` : ''} học sinh
                </span>
                <span className="px-2.5 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[12px] font-bold">
                  Khối {classDetail.grade}
                </span>
              </div>

              {/* Thông tin nhanh phòng học & lịch học */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[13px] text-[#6B5560] font-medium">
                {classDetail.homeroomTeacher && (
                  <span>
                    GV: <strong className="text-[#3B2A35]">{classDetail.homeroomTeacher}</strong>
                  </span>
                )}
                {classDetail.roomNumber && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D6336C]" />
                    <span>{classDetail.roomNumber}</span>
                  </span>
                )}
                {classDetail.schedule && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#2F6FA8]" />
                    <span>{classDetail.schedule}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Phía bên phải: Nút Sửa lớp & Thêm học sinh */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="h-[44px] px-4 rounded-[10px] border border-[#9C6B84] bg-white hover:bg-[#FFE0EB]/40 text-[#3B2A35] font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Pencil className="w-4 h-4" strokeWidth={1.75} />
                <span>Sửa lớp</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 md:flex-none h-[44px] px-4 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-white" strokeWidth={1.75} />
                <span>Thêm học sinh</span>
              </button>
            </div>
          </header>

          {/* ==================== HÀNG 2: THẺ DANH SÁCH & ĐIỂM DANH ==================== */}
          <div className="w-full lg:w-[1136px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col justify-between overflow-hidden flex-shrink-0">
            {/* Thanh công cụ trong thẻ: Tìm kiếm + Chọn ngày điểm danh + Điểm danh tất cả */}
            <div className="p-4 lg:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#F3D9E3] flex-shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#9C6B84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học sinh trong lớp..."
                  className="w-full h-[42px] pl-10 pr-9 rounded-[10px] border border-[#F3D9E3] bg-[#FFF6F9]/40 focus:bg-white text-[14px] text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 h-[42px] rounded-[10px] border border-[#9C6B84] bg-white">
                  <Calendar className="w-4 h-4 text-[#2F6FA8] flex-shrink-0" />
                  <span className="text-xs font-bold text-[#6B5560] hidden sm:inline">
                    Điểm danh ngày:
                  </span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="text-[13px] font-bold text-[#3B2A35] bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  disabled={students.length === 0 || isSavingAttendance}
                  onClick={handleMarkAllAttendance}
                  className={`h-[42px] px-3.5 rounded-[10px] font-bold text-[13px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                    allMarked
                      ? 'bg-[#DCEBFA] text-[#1F4E79] hover:bg-[#CFE8FF]'
                      : 'bg-[#2F6FA8] text-white hover:bg-[#1F4E79]'
                  }`}
                >
                  {isSavingAttendance ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  <span>
                    {allMarked
                      ? `Đã có mặt ${attendedStudentIds.length}/${students.length}`
                      : `Điểm danh tất cả (${attendedStudentIds.length}/${students.length})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Tiêu đề bảng */}
            <div className="hidden md:grid md:grid-cols-[110px_1.5fr_140px_120px] lg:flex h-[48px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-semibold items-center border-b border-[#F3D9E3] flex-shrink-0">
              <div className="lg:w-[130px] pl-4 lg:pl-6 flex-shrink-0">Mã học sinh</div>
              <div className="lg:w-[330px] flex-shrink-0">Họ và tên</div>
              <div className="hidden lg:block lg:w-[120px] text-center flex-shrink-0">Giới tính</div>
              <div className="hidden lg:block lg:w-[220px] flex-shrink-0">SĐT phụ huynh</div>
              <div className="lg:w-[170px] flex-shrink-0">Trạng thái</div>
              <div className="lg:w-[164px] pr-4 lg:pr-6 text-center flex-shrink-0">Thao tác</div>
            </div>

            {/* Nội dung bảng (Desktop/Tablet) */}
            <div className="hidden md:flex flex-1 flex-col min-h-[320px]">
              {filteredStudents.length === 0 ? (
                <div className="flex-1 py-16 flex flex-col items-center justify-center gap-3 text-[#6B5560]">
                  <Users className="w-9 h-9 text-[#9C6B84]/50" />
                  <span className="font-bold text-[15px] text-[#3B2A35]">
                    {students.length === 0
                      ? `Lớp ${classDetail.name} chưa có học sinh nào`
                      : 'Không tìm thấy học sinh phù hợp'}
                  </span>
                  {students.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="h-10 px-4 rounded-[10px] bg-[#CFE8FF] hover:bg-[#BDE0FF] text-[#1F4E79] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Thêm học sinh vào lớp ngay</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredStudents.map((student, index) => {
                  const isPinkAvatar = index % 2 === 0;
                  const isAttended = attendedStudentIds.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      className="md:grid md:grid-cols-[110px_1.5fr_140px_120px] lg:flex h-[64px] bg-white hover:bg-[#FFF6F9] border-b border-[#F3D9E3] items-center transition-colors select-none text-[14px]"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/students/${student.studentCode}`)}
                        className="lg:w-[130px] pl-4 lg:pl-6 text-left font-mono font-bold text-[#1F4E79] hover:underline flex-shrink-0 cursor-pointer"
                      >
                        {student.studentCode}
                      </button>

                      <div className="lg:w-[330px] flex items-center gap-3 flex-shrink-0 pr-4 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                            isPinkAvatar
                              ? 'bg-[#FFE0EB] text-[#A61E4D]'
                              : 'bg-[#DCEBFA] text-[#1F4E79]'
                          }`}
                        >
                          {getInitials(student.fullName)}
                        </div>
                        <div className="flex flex-col truncate min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/students/${student.studentCode}`)}
                            className="text-left font-bold text-[#3B2A35] hover:text-[#2F6FA8] hover:underline leading-tight truncate cursor-pointer"
                            title={student.fullName}
                          >
                            {student.fullName}
                          </button>
                          <span
                            className="text-[12px] text-[#6B5560] leading-none mt-1 truncate"
                            title={student.email}
                          >
                            {student.email || 'Chưa cập nhật email'}
                          </span>
                        </div>
                      </div>

                      <div className="hidden lg:block lg:w-[120px] text-center font-medium text-[#3B2A35] flex-shrink-0">
                        {student.gender}
                      </div>

                      <div className="hidden lg:block lg:w-[220px] font-mono font-medium text-[#3B2A35] tracking-tight flex-shrink-0">
                        {student.parentPhone || '—'}
                      </div>

                      <div className="lg:w-[170px] flex-shrink-0">
                        {student.status === 'Đang học' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                            <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2.2} />
                            <span>Đang học</span>
                          </span>
                        )}
                        {student.status === 'Bảo lưu' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                            <Pause className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={2} />
                            <span>Bảo lưu</span>
                          </span>
                        )}
                        {student.status === 'Nghỉ học' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#EFE9ED] text-[#6B5560] text-[12px] font-bold">
                            <Minus className="w-3.5 h-3.5 text-[#6B5560]" strokeWidth={2} />
                            <span>Nghỉ học</span>
                          </span>
                        )}
                      </div>

                      <div className="lg:w-[164px] pr-4 lg:pr-6 flex justify-center items-center gap-1.5 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={isSavingAttendance}
                              onClick={() => handleToggleAttendance(student)}
                              className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all cursor-pointer ${
                                isAttended
                                  ? 'bg-[#2F6FA8] text-white hover:bg-[#1F4E79] shadow-xs'
                                  : 'text-[#6B5560] hover:text-[#1F4E79] hover:bg-[#DCEBFA]'
                              }`}
                              aria-label={`Điểm danh cho ${student.fullName}`}
                            >
                              <UserCheck className="w-[18px] h-[18px]" strokeWidth={1.75} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span>{isAttended ? 'Đã điểm danh (Bấm để hủy)' : 'Điểm danh'}</span>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={removingStudentId === student.id}
                              onClick={() => handleRemoveFromClass(student)}
                              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#A61E4D] hover:bg-[#FFE0EB] transition-colors cursor-pointer disabled:opacity-50"
                              aria-label={`Xóa ${student.fullName} khỏi lớp`}
                            >
                              {removingStudentId === student.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserMinus className="w-[18px] h-[18px]" strokeWidth={1.75} />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span>Gỡ khỏi lớp</span>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DANH SÁCH THẺ TRÊN DI ĐỘNG */}
            <div className="md:hidden divide-y divide-[#F3D9E3]">
              {filteredStudents.length === 0 ? (
                <div className="py-12 px-4 text-center text-sm text-[#6B5560]">
                  {students.length === 0
                    ? `Lớp ${classDetail.name} chưa có học sinh nào.`
                    : 'Không tìm thấy học sinh phù hợp.'}
                </div>
              ) : (
                filteredStudents.map((student, index) => {
                  const isPinkAvatar = index % 2 === 0;
                  const isAttended = attendedStudentIds.includes(student.id);

                  return (
                    <div key={student.id} className="p-4 flex flex-col gap-3 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                              isPinkAvatar
                                ? 'bg-[#FFE0EB] text-[#A61E4D]'
                                : 'bg-[#DCEBFA] text-[#1F4E79]'
                            }`}
                          >
                            {getInitials(student.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[15px] text-[#3B2A35] leading-tight truncate">
                              {student.fullName}
                            </div>
                            <div className="text-[12px] text-[#6B5560] truncate mt-0.5">
                              {student.email || 'Chưa cập nhật email'}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-[12px] font-bold text-[#3B2A35] bg-[#FFF6F9] border border-[#F3D9E3] px-2 py-0.5 rounded-[8px] flex-shrink-0">
                          {student.studentCode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F3D9E3]/60">
                        <span className="text-xs font-bold text-[#1F4E79] bg-[#DCEBFA] px-2.5 py-1 rounded-[8px]">
                          {student.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student)}
                            className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition-all cursor-pointer ${
                              isAttended
                                ? 'bg-[#2F6FA8] text-white shadow-xs'
                                : 'text-[#6B5560] bg-[#FFF6F9] hover:text-[#1F4E79] hover:bg-[#DCEBFA]'
                            }`}
                            aria-label={`Điểm danh cho ${student.fullName}`}
                          >
                            <UserCheck className="w-5 h-5" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            disabled={removingStudentId === student.id}
                            onClick={() => handleRemoveFromClass(student)}
                            className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[#A61E4D] bg-[#FFF6F9] hover:bg-[#FFE0EB] transition-colors cursor-pointer"
                            aria-label={`Gỡ ${student.fullName} khỏi lớp`}
                          >
                            <UserMinus className="w-5 h-5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chân thẻ */}
            <div className="min-h-[44px] px-4 lg:px-6 border-t border-[#F3D9E3] bg-[#FCF8FA] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
              <span className="font-nunito text-[13px] text-[#6B5560] font-medium">
                {classDetail.name} có <strong className="text-[#3B2A35]">{students.length}</strong> học sinh
              </span>
              <span className="font-nunito text-[13px] text-[#1F4E79] font-semibold">
                Có mặt ngày {attendanceDate}: {attendedStudentIds.length}/{students.length}
              </span>
            </div>
          </div>

          {/* Modal Thêm học sinh thật vào lớp */}
          <AddStudentModal
            isOpen={isAddModalOpen}
            className={classDetail.name}
            existingStudentIds={students.map((s) => s.id)}
            onClose={() => setIsAddModalOpen(false)}
            onConfirmAdd={handleConfirmAddStudents}
          />

          {/* Modal Chỉnh sửa thông tin lớp học */}
          <ClassFormModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdateClass}
            initialData={classDetail}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
