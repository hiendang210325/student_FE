import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Trash2,
  Eye,
  Pencil,
  Check,
  Pause,
  Minus,
  Search,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  X,
  Info,
  Loader2,
  AlertCircle,
  Users,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { studentApi } from '../api/studentApi';
import { Student, StudentGender, StudentStats, StudentStatus } from '../types/student.types';
import { ApiError } from '@/services/api/apiError';

const DEFAULT_CLASSES = [
  'Văn 7C',
  'Văn 8B',
  'Văn 9A',
  'Luyện thi vào 10',
  'Văn 10 nâng cao',
];

export const StudentListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'LIST' | 'TRASH'>(
    tabParam === 'trash' ? 'TRASH' : 'LIST'
  );

  // ==================== DỮ LIỆU TỪ API ====================
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  const [trashList, setTrashList] = useState<Student[]>([]);
  const [trashTotal, setTrashTotal] = useState<number>(0);
  const [trashPage, setTrashPage] = useState<number>(1);
  const [trashTotalPages, setTrashTotalPages] = useState<number>(1);
  const [isLoadingTrash, setIsLoadingTrash] = useState<boolean>(false);
  const [trashError, setTrashError] = useState<string | null>(null);

  const [stats, setStats] = useState<StudentStats>({
    activeCount: 0,
    trashCount: 0,
    studyingCount: 0,
    reservedCount: 0,
    leaveCount: 0,
    classes: DEFAULT_CLASSES,
  });

  // ==================== TÌM KIẾM & BỘ LỌC ====================
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [trashSearchQuery, setTrashSearchQuery] = useState('');
  const [debouncedTrashSearch, setDebouncedTrashSearch] = useState('');

  // ==================== TRẠNG THÁI MODALS & HÀNH ĐỘNG ====================
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [softDeleteTarget, setSoftDeleteTarget] = useState<Student | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Student | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isSubmittingSoftDelete, setIsSubmittingSoftDelete] = useState(false);
  const [isSubmittingPermDelete, setIsSubmittingPermDelete] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ==================== FORM SỬA HỌC SINH ====================
  const [editStudentId, setEditStudentId] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editGender, setEditGender] = useState<StudentGender>('Nữ');
  const [editClasses, setEditClasses] = useState<string[]>(['Văn 9A']);
  const [editClassInput, setEditClassInput] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editStatus, setEditStatus] = useState<StudentStatus>('Đang học');
  const [editDob, setEditDob] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');

  const pageSize = 10;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce từ khóa tìm kiếm danh sách chính
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce từ khóa tìm kiếm thùng rác
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTrashSearch(trashSearchQuery.trim());
      setTrashPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [trashSearchQuery]);

  // ==================== GỌI API ====================
  const fetchStats = useCallback(async () => {
    try {
      const res = await studentApi.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê học sinh:', err);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const res = await studentApi.getStudents({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        className: selectedClass !== 'ALL' ? selectedClass : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        isDeleted: 'false',
      });
      const data = res.data;
      const resolvedTotalPages = Math.max(1, data?.totalPages ?? 1);
      const resolvedPage = data?.page ?? Math.min(page, resolvedTotalPages);
      setStudents(data?.items || []);
      setTotalStudents(data?.total ?? 0);
      setTotalPages(resolvedTotalPages);
      if (resolvedPage !== page) {
        setPage(resolvedPage);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách học sinh:', err);
      setListError(
        err instanceof ApiError ? err.message : 'Không thể kết nối máy chủ để tải danh sách học sinh.'
      );
    } finally {
      setIsLoadingList(false);
    }
  }, [page, debouncedSearch, selectedClass, selectedStatus]);

  const fetchTrash = useCallback(async () => {
    setIsLoadingTrash(true);
    setTrashError(null);
    try {
      const res = await studentApi.getStudents({
        page: trashPage,
        limit: pageSize,
        search: debouncedTrashSearch || undefined,
        isDeleted: 'true',
      });
      const data = res.data;
      const resolvedTotalPages = Math.max(1, data?.totalPages ?? 1);
      const resolvedPage = data?.page ?? Math.min(trashPage, resolvedTotalPages);
      setTrashList(data?.items || []);
      setTrashTotal(data?.total ?? 0);
      setTrashTotalPages(resolvedTotalPages);
      if (resolvedPage !== trashPage) {
        setTrashPage(resolvedPage);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách thùng rác:', err);
      setTrashError(
        err instanceof ApiError ? err.message : 'Không thể kết nối máy chủ để tải danh sách thùng rác.'
      );
    } finally {
      setIsLoadingTrash(false);
    }
  }, [trashPage, debouncedTrashSearch]);

  // Tải dữ liệu ban đầu & khi thay đổi bộ lọc
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (activeTab === 'TRASH') {
      fetchTrash();
    }
  }, [activeTab, fetchTrash]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStats(),
        activeTab === 'LIST' ? fetchStudents() : fetchTrash(),
      ]);
      showToast('Đã cập nhật dữ liệu mới nhất!');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTabChange = (tab: 'LIST' | 'TRASH') => {
    setActiveTab(tab);
    setSearchParams(tab === 'LIST' ? { tab: 'list' } : { tab: 'trash' });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Danh sách lớp động cho bộ lọc (hợp nhất lớp từ DB + mặc định)
  const availableClasses = Array.from(
    new Set([...(stats.classes || []), ...DEFAULT_CLASSES])
  ).sort((a, b) => a.localeCompare(b, 'vi'));

  // ==================== XỬ LÝ SỬA HỌC SINH ====================
  const handleOpenEditDialog = (student: Student) => {
    setEditStudentId(student.id);
    setEditCode(student.studentCode);
    setEditName(student.fullName);
    setEditEmail(student.email || '');
    setEditGender(student.gender);
    setEditClasses(
      student.classes && student.classes.length > 0
        ? student.classes
        : [student.className || 'Văn 9A']
    );
    setEditClassInput('');
    setEditPhone(student.parentPhone || '');
    setEditStatus(student.status);
    setEditDob(student.dateOfBirth || '');
    setEditAddress(student.address || '');
    setEditNote(student.note || '');
    setEditError(null);
    setIsEditDialogOpen(true);
  };

  const handleRemoveEditClass = (clsToRemove: string) => {
    if (editClasses.length > 1) {
      setEditClasses((prev) => prev.filter((c) => c !== clsToRemove));
    } else {
      showToast('Học sinh phải theo học ít nhất một lớp.');
    }
  };

  const handleAddEditClass = () => {
    const val = editClassInput.trim();
    if (!val) return;
    if (editClasses.includes(val)) {
      showToast(`Lớp "${val}" đã có trong danh sách.`);
      return;
    }
    setEditClasses((prev) => [...prev, val]);
    setEditClassInput('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editName.trim()) {
      setEditError('Họ và tên không được để trống.');
      return;
    }
    if (editPhone.trim() && editPhone.trim().length < 9) {
      setEditError('Số điện thoại phụ huynh phải có tối thiểu 9 ký tự.');
      return;
    }

    const finalClasses = [...editClasses];
    if (editClassInput.trim() && !finalClasses.includes(editClassInput.trim())) {
      finalClasses.push(editClassInput.trim());
    }

    setIsSubmittingEdit(true);
    try {
      await studentApi.updateStudent(editStudentId, {
        fullName: editName.trim(),
        email: editEmail.trim(),
        gender: editGender,
        classes: finalClasses,
        parentPhone: editPhone.trim(),
        status: editStatus,
        dateOfBirth: editDob,
        address: editAddress.trim(),
        note: editNote.trim(),
      });

      setIsEditDialogOpen(false);
      await Promise.all([fetchStudents(), fetchStats()]);
      showToast(`Đã lưu thay đổi cho học sinh ${editName}!`);
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : 'Không thể cập nhật thông tin học sinh.'
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // ==================== XỬ LÝ XÓA MỀM / KHÔI PHỤC / XÓA VĨNH VIỄN ====================
  const handleConfirmSoftDelete = async () => {
    if (!softDeleteTarget) return;
    setIsSubmittingSoftDelete(true);
    try {
      await studentApi.softDeleteStudent(softDeleteTarget.id);
      const name = softDeleteTarget.fullName;
      const shouldStepBack = students.length === 1 && page > 1;
      setSoftDeleteTarget(null);
      if (shouldStepBack) {
        setPage((p) => Math.max(1, p - 1));
        await fetchStats();
      } else {
        await Promise.all([fetchStudents(), fetchStats()]);
      }
      showToast(`Đã chuyển học sinh ${name} vào thùng rác.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể chuyển học sinh vào thùng rác.'
      );
    } finally {
      setIsSubmittingSoftDelete(false);
    }
  };

  const handleRestore = async (student: Student) => {
    setRestoringId(student.id);
    try {
      await studentApi.restoreStudent(student.id);
      const shouldStepBackTrash = trashList.length === 1 && trashPage > 1;
      if (shouldStepBackTrash) {
        setTrashPage((p) => Math.max(1, p - 1));
        await Promise.all([fetchStudents(), fetchStats()]);
      } else {
        await Promise.all([fetchTrash(), fetchStudents(), fetchStats()]);
      }
      showToast(`Đã khôi phục học sinh ${student.fullName} vào danh sách.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể khôi phục học sinh lúc này.'
      );
    } finally {
      setRestoringId(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    setIsSubmittingPermDelete(true);
    try {
      const name = permanentDeleteTarget.fullName;
      const shouldStepBackTrash = trashList.length === 1 && trashPage > 1;
      await studentApi.permanentDeleteStudent(permanentDeleteTarget.id);
      setPermanentDeleteTarget(null);
      if (shouldStepBackTrash) {
        setTrashPage((p) => Math.max(1, p - 1));
        await fetchStats();
      } else {
        await Promise.all([fetchTrash(), fetchStats()]);
      }
      showToast(`Đã xóa vĩnh viễn học sinh ${name} khỏi cơ sở dữ liệu.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể xóa vĩnh viễn học sinh.'
      );
    } finally {
      setIsSubmittingPermDelete(false);
    }
  };

  // Tạo danh sách số trang hiển thị gọn gàng
  const buildPageNumbers = (current: number, total: number): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full lg:max-w-[1136px] lg:min-h-[976px] p-0 lg:p-8 mx-auto flex flex-col gap-4 lg:gap-6 box-border select-none bg-brand-page text-brand-text font-nunito relative">
        {/* Thông báo nổi */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
        <header className="min-h-[72px] lg:h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-3 relative flex-shrink-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="font-serif-title text-[24px] lg:text-[28px] font-bold text-brand-text leading-tight">
                Học sinh
              </h1>
              {activeTab === 'TRASH' ? (
                <Badge variant="studying" className="px-3 py-1 text-[13px] tracking-wide">
                  {stats.trashCount} trong thùng rác
                </Badge>
              ) : (
                <Badge variant="studying" className="px-3 py-1 text-[13px] tracking-wide">
                  {stats.activeCount} học sinh
                </Badge>
              )}
            </div>

            {/* Ghi chú lề viết tay đặc trưng kèm gạch chân lượn sóng */}
            <div className="flex items-center gap-4 mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-serif-title italic text-[14px] lg:text-[15px] font-semibold text-brand-pinkText squiggle-underline-note">
                  {activeTab === 'TRASH'
                    ? '“Thùng rác giữ học sinh đã xóa, khôi phục được bất cứ lúc nào.”'
                    : '“Nhập đủ số điện thoại phụ huynh để gửi nhắc học phí nhé!”'}
                </span>
              </div>

              {/* HÌNH DÁN (ẩn trên di động) */}
              <div className="hidden md:flex items-center gap-2 pl-6">
                <svg
                  className="w-6 h-6 text-brand-pinkAccent animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                </svg>
                <svg
                  className="w-6 h-6 text-brand-blueAction"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Bên phải: Nút "Làm mới" & phím tắt điều hướng sang trang Tài khoản */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-[44px] px-4 rounded-[12px] border-[#9C6B84] text-[#3B2A35] font-bold gap-2 hover:bg-[#FFE0EB]/40 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              <span>Làm mới</span>
            </Button>

            <Button
              type="button"
              variant="outlineBlue"
              onClick={() => navigate('/accounts')}
              className="flex-1 md:flex-none h-[44px] px-4 rounded-[12px] gap-2 text-[14px] font-bold justify-center cursor-pointer"
            >
              <span>Cấp tài khoản mới</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
            </Button>
          </div>
        </header>

        {/* ==================== HÀNG 2: THANH CHUYỂN TAB ==================== */}
        <div className="min-h-[44px] flex flex-wrap items-center justify-between gap-2 lg:gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <Button
              variant={activeTab === 'LIST' ? 'blueAction' : 'secondary'}
              onClick={() => handleTabChange('LIST')}
              className={`h-[40px] px-4 rounded-[12px] text-[14px] font-bold gap-2 cursor-pointer ${
                activeTab === 'LIST' ? 'shadow-xs' : 'hover:bg-[#dbeafe]'
              }`}
            >
              <span>Danh sách</span>
              <span
                className={`text-[12px] px-2 py-0.5 rounded-[10px] font-bold ${
                  activeTab === 'LIST' ? 'bg-white/20 text-white' : 'bg-white text-[#1F4E79]'
                }`}
              >
                {stats.activeCount}
              </span>
            </Button>

            <Button
              variant={activeTab === 'TRASH' ? 'blueAction' : 'secondary'}
              onClick={() => handleTabChange('TRASH')}
              className={`h-[40px] px-4 rounded-[12px] text-[14px] font-bold gap-2 cursor-pointer ${
                activeTab === 'TRASH' ? 'shadow-xs' : 'hover:bg-[#dbeafe]'
              }`}
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              <span>Thùng rác</span>
              <span
                className={`text-[12px] px-2 py-0.5 rounded-[10px] font-bold ${
                  activeTab === 'TRASH'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FFE0EB] text-brand-pinkText'
                }`}
              >
                {stats.trashCount}
              </span>
            </Button>
          </div>

          {/* Thống kê nhanh theo trạng thái */}
          {activeTab === 'LIST' && (
            <div className="hidden md:flex items-center gap-3 text-[12px] font-semibold text-brand-subtext">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2F6FA8]" />
                Đang học: <strong className="text-brand-text">{stats.studyingCount}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D6336C]" />
                Bảo lưu: <strong className="text-brand-text">{stats.reservedCount}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#9C6B84]" />
                Nghỉ học: <strong className="text-brand-text">{stats.leaveCount}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ==================== HÀNG 3: MỘT THẺ BẢNG DỮ LIỆU DUY NHẤT ==================== */}
        <section className="min-h-[600px] lg:min-h-[700px] bg-white border border-[#F3D9E3] rounded-[12px] shadow-card flex flex-col justify-between overflow-hidden flex-shrink-0">
          {activeTab === 'TRASH' ? (
            /* ========================= TRASH STATE VIEW ========================= */
            <>
              <div>
                {/* HÀNG TRÊN CÙNG */}
                <div className="lg:h-[80px] p-4 lg:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 border-b border-[#F3D9E3] flex-shrink-0 bg-white">
                  <div className="flex-1 lg:h-[52px] px-3.5 py-2.5 lg:py-0 lg:px-4 rounded-[12px] bg-[#E9F3FF] border border-[#CFE8FF] flex items-center gap-3">
                    <Info className="w-5 h-5 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                    <p className="text-[13px] font-medium text-[#1F4E79] leading-snug">
                      Học sinh trong thùng rác chỉ bị ẩn khỏi hệ thống. Khôi phục để dùng lại, hoặc xóa vĩnh viễn để xóa hẳn khỏi dữ liệu (không thể hoàn tác).
                    </p>
                  </div>

                  <div className="relative w-full md:w-[280px] lg:w-[340px] flex-shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C6B84] pointer-events-none" />
                    <Input
                      placeholder="Tìm trong thùng rác…"
                      value={trashSearchQuery}
                      onChange={(e) => setTrashSearchQuery(e.target.value)}
                      className="h-[48px] pl-10 pr-9 rounded-[12px] text-[14px]"
                    />
                    {trashSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTrashSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {trashError && (
                  <div className="mx-6 my-3 p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{trashError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchTrash()}
                      className="underline font-bold hover:text-amber-900 cursor-pointer"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* KHUNG BẢNG THÙNG RÁC (Desktop/Tablet) */}
                <div className="hidden md:flex flex-col">
                  <div className="h-[48px] bg-[#DCEBFA] text-[#1F4E79] px-4 lg:px-6 grid md:grid-cols-[95px_1.2fr_115px_100px_210px] lg:grid-cols-[110px_1.2fr_130px_90px_160px_110px_230px] items-center text-[13px] font-semibold select-none flex-shrink-0">
                    <div>Mã học sinh</div>
                    <div>Họ và tên</div>
                    <div>Lớp</div>
                    <div className="hidden lg:block text-center">Giới tính</div>
                    <div className="hidden lg:block">Số điện thoại phụ huynh</div>
                    <div>Ngày xóa</div>
                    <div className="text-right pr-2">Thao tác</div>
                  </div>

                  <div className="divide-y divide-[#F3D9E3]">
                    {isLoadingTrash ? (
                      <div className="h-[320px] flex flex-col items-center justify-center gap-2 text-brand-subtext">
                        <Loader2 className="w-7 h-7 animate-spin text-[#2F6FA8]" />
                        <span className="text-[14px]">Đang tải danh sách thùng rác...</span>
                      </div>
                    ) : trashList.length === 0 ? (
                      <div className="h-[320px] flex flex-col items-center justify-center gap-2 text-brand-subtext">
                        <Trash2 className="w-9 h-9 text-[#9C6B84]/50" />
                        <span className="font-semibold text-[15px] text-brand-text">
                          Thùng rác đang trống
                        </span>
                        <span className="text-[13px]">
                          Không có học sinh nào đã xóa hoặc khớp với từ khóa tìm kiếm.
                        </span>
                      </div>
                    ) : (
                      trashList.map((student) => (
                        <div
                          key={student.id}
                          className="h-[58px] px-4 lg:px-6 grid md:grid-cols-[95px_1.2fr_115px_100px_210px] lg:grid-cols-[110px_1.2fr_130px_90px_160px_110px_230px] items-center text-[14px] bg-white hover:bg-[#FFF6F9] transition-colors"
                        >
                          <div className="font-mono text-[13px] font-bold text-brand-text">
                            {student.studentCode}
                          </div>

                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <div className="w-9 h-9 rounded-[10px] bg-[#EFE9ED] text-[#6B5560] font-bold text-[13px] flex items-center justify-center flex-shrink-0">
                              {getInitials(student.fullName)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-brand-text leading-tight truncate" title={student.fullName}>
                                {student.fullName}
                              </span>
                              <span className="text-[12px] text-brand-subtext leading-none mt-0.5 truncate" title={student.email}>
                                {student.email || 'Chưa có email'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {(student.classes?.length ? student.classes : [student.className]).map((cls, cIdx) => (
                              <Badge key={cIdx} variant="classChip">
                                {cls}
                              </Badge>
                            ))}
                          </div>

                          <div className="hidden lg:block text-center font-semibold text-brand-text text-[13px]">
                            {student.gender}
                          </div>

                          <div className="hidden lg:block font-mono text-[13px] font-semibold text-brand-text">
                            {student.parentPhone}
                          </div>

                          <div className="text-[13px] font-medium text-brand-subtext font-mono">
                            {student.deletedDate || '—'}
                          </div>

                          <div className="flex items-center justify-end gap-2 pr-1">
                            <Button
                              variant="outlineBlue"
                              size="sm"
                              disabled={restoringId === student.id}
                              onClick={() => handleRestore(student)}
                              className="gap-1.5 h-8 px-3 rounded-[10px] cursor-pointer"
                            >
                              {restoringId === student.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                              )}
                              <span>Khôi phục</span>
                            </Button>

                            <Button
                              variant="deletePermanent"
                              size="sm"
                              disabled={restoringId === student.id}
                              onClick={() => setPermanentDeleteTarget(student)}
                              className="gap-1.5 h-8 px-2.5 rounded-[10px] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                              <span>Xóa vĩnh viễn</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* DANH SÁCH THẺ THÙNG RÁC TRÊN DI ĐỘNG */}
                <div className="md:hidden divide-y divide-[#F3D9E3]">
                  {isLoadingTrash ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-brand-subtext">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2F6FA8]" />
                      <span className="text-[13px]">Đang tải thùng rác...</span>
                    </div>
                  ) : trashList.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-brand-subtext px-4 text-center">
                      <Trash2 className="w-8 h-8 text-[#9C6B84]/50" />
                      <span className="font-semibold text-[14px] text-brand-text">
                        Thùng rác đang trống
                      </span>
                    </div>
                  ) : (
                    trashList.map((student) => (
                      <div key={student.id} className="p-4 flex flex-col gap-3 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-[10px] bg-[#EFE9ED] text-[#6B5560] font-bold text-[13px] flex items-center justify-center flex-shrink-0">
                              {getInitials(student.fullName)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[15px] text-brand-text leading-tight truncate">
                                {student.fullName}
                              </div>
                              <div className="text-[12px] text-brand-subtext truncate mt-0.5">
                                {student.email || 'Chưa có email'}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-[12px] font-bold text-brand-text bg-[#FFF6F9] border border-[#F3D9E3] px-2 py-0.5 rounded-[8px] flex-shrink-0">
                            {student.studentCode}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(student.classes?.length ? student.classes : [student.className]).map((cls, cIdx) => (
                              <Badge key={cIdx} variant="classChip">
                                {cls}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-[12px] font-medium text-brand-subtext font-mono">
                            Xóa: {student.deletedDate || '—'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <Button
                            variant="outlineBlue"
                            disabled={restoringId === student.id}
                            onClick={() => handleRestore(student)}
                            className="w-full h-[44px] rounded-[10px] gap-2 text-[14px]"
                          >
                            {restoringId === student.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                            )}
                            <span>Khôi phục</span>
                          </Button>

                          <Button
                            variant="deletePermanent"
                            disabled={restoringId === student.id}
                            onClick={() => setPermanentDeleteTarget(student)}
                            className="w-full h-[44px] rounded-[10px] gap-2 text-[14px]"
                          >
                            <Trash2 className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                            <span>Xóa vĩnh viễn</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CHÂN BẢNG THÙNG RÁC */}
              <div className="min-h-[52px] px-4 lg:px-6 py-3 lg:py-0 border-t border-[#F3D9E3] flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0 bg-white">
                <span className="text-[13px] font-semibold text-brand-subtext">
                  {trashTotal > 0
                    ? `Hiển thị ${(trashPage - 1) * pageSize + 1}–${Math.min(
                        trashPage * pageSize,
                        trashTotal
                      )} trên ${trashTotal} học sinh`
                    : 'Không tìm thấy học sinh nào trong thùng rác'}
                </span>

                <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-subtext">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTrashPage((p) => Math.max(1, p - 1))}
                    disabled={trashPage <= 1}
                    className="w-8 h-8 rounded-[10px] cursor-pointer"
                  >
                    ‹
                  </Button>

                  {buildPageNumbers(trashPage, trashTotalPages).map((num) => (
                    <Button
                      key={num}
                      variant={trashPage === num ? 'blueAction' : 'ghost'}
                      size="icon"
                      onClick={() => setTrashPage(num)}
                      className="w-8 h-8 rounded-[10px] text-[13px] cursor-pointer"
                    >
                      {num}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTrashPage((p) => Math.min(trashTotalPages, p + 1))}
                    disabled={trashPage >= trashTotalPages}
                    className="w-8 h-8 rounded-[10px] cursor-pointer"
                  >
                    ›
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* ========================= LIST STATE VIEW ========================= */
            <>
              <div>
                {/* THANH CÔNG CỤ */}
                <div className="lg:h-[72px] p-4 lg:px-6 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 border-b border-[#F3D9E3] flex-shrink-0">
                  <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C6B84] pointer-events-none" />
                    <Input
                      placeholder="Tìm theo tên, mã học sinh, email, số điện thoại phụ huynh…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-[48px] pl-10 pr-9 rounded-[12px] text-[14px]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setPage(1);
                      }}
                      className="w-full lg:w-[190px] h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 cursor-pointer"
                    >
                      <option value="ALL">Tất cả các lớp</option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPage(1);
                      }}
                      className="w-full lg:w-[180px] h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 cursor-pointer"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="Đang học">Đang học</option>
                      <option value="Bảo lưu">Bảo lưu</option>
                      <option value="Nghỉ học">Nghỉ học</option>
                    </select>
                  </div>
                </div>

                {listError && (
                  <div className="mx-6 my-3 p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{listError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchStudents()}
                      className="underline font-bold hover:text-amber-900 cursor-pointer"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* KHUNG BẢNG (Máy tính bảng & Máy tính bàn) */}
                <div className="hidden md:flex flex-col">
                  <div className="h-[48px] bg-[#DCEBFA] text-[#1F4E79] px-4 lg:px-6 grid md:grid-cols-[95px_1.3fr_120px_125px_115px] lg:grid-cols-[105px_1.2fr_145px_80px_150px_130px_120px] items-center text-[13px] font-semibold select-none flex-shrink-0">
                    <div>Mã học sinh</div>
                    <div>Họ và tên</div>
                    <div>Lớp</div>
                    <div className="hidden lg:block text-center">Giới tính</div>
                    <div className="hidden lg:block">SĐT phụ huynh</div>
                    <div>Trạng thái</div>
                    <div className="text-right pr-2">Thao tác</div>
                  </div>

                  <div className="divide-y divide-[#F3D9E3]">
                    {isLoadingList ? (
                      <div className="h-[340px] flex flex-col items-center justify-center gap-2 text-brand-subtext">
                        <Loader2 className="w-7 h-7 animate-spin text-[#2F6FA8]" />
                        <span className="text-[14px]">Đang tải danh sách học sinh...</span>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="h-[340px] flex flex-col items-center justify-center gap-2 text-brand-subtext">
                        <Users className="w-9 h-9 text-[#9C6B84]/50" />
                        <span className="font-semibold text-[15px] text-brand-text">
                          Không tìm thấy học sinh nào
                        </span>
                        <span className="text-[13px]">
                          Thử thay đổi bộ lọc, từ khóa tìm kiếm hoặc cấp tài khoản học sinh mới ở mục Tài khoản.
                        </span>
                      </div>
                    ) : (
                      students.map((student, idx) => {
                        const isEven = idx % 2 === 1;
                        const avatarBgClass = isEven
                          ? 'bg-[#DCEBFA] text-[#1F4E79]'
                          : 'bg-[#FFE0EB] text-brand-pinkText';

                        return (
                          <div
                            key={student.id}
                            className="min-h-[58px] py-2 px-4 lg:px-6 grid md:grid-cols-[95px_1.3fr_120px_125px_115px] lg:grid-cols-[105px_1.2fr_145px_80px_150px_130px_120px] items-center text-[14px] bg-white hover:bg-[#FFF6F9] transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => navigate(`/students/${student.studentCode}`)}
                              className="text-left font-mono text-[13px] font-bold text-[#1F4E79] hover:underline cursor-pointer"
                            >
                              {student.studentCode}
                            </button>

                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <button
                                type="button"
                                onClick={() => setViewingStudent(student)}
                                className={`w-9 h-9 rounded-[10px] ${avatarBgClass} font-bold text-[13px] flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-90`}
                              >
                                {getInitials(student.fullName)}
                              </button>
                              <div className="flex flex-col min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setViewingStudent(student)}
                                  className="text-left font-bold text-brand-text hover:text-[#2F6FA8] hover:underline leading-tight truncate cursor-pointer"
                                  title={student.fullName}
                                >
                                  {student.fullName}
                                </button>
                                <span
                                  className="text-[12px] text-brand-subtext leading-none mt-0.5 truncate"
                                  title={student.email}
                                >
                                  {student.email || 'Chưa cập nhật email'}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1 pr-2">
                              {(student.classes?.length ? student.classes : [student.className]).map((cls, cIdx) => (
                                <Badge key={cIdx} variant="classChip">
                                  {cls}
                                </Badge>
                              ))}
                            </div>

                            <div className="hidden lg:block text-center font-semibold text-brand-text text-[13px]">
                              {student.gender}
                            </div>

                            <div className="hidden lg:block font-mono text-[13px] font-semibold text-brand-text">
                              {student.parentPhone}
                            </div>

                            <div className="flex items-center min-w-0">
                              {student.status === 'Đang học' && (
                                <Badge
                                  variant="studying"
                                  className="px-3 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Đang học</span>
                                </Badge>
                              )}
                              {student.status === 'Bảo lưu' && (
                                <Badge
                                  variant="reserved"
                                  className="px-3 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap"
                                >
                                  <Pause className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Bảo lưu</span>
                                </Badge>
                              )}
                              {student.status === 'Nghỉ học' && (
                                <Badge
                                  variant="leave"
                                  className="px-3 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap"
                                >
                                  <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Nghỉ học</span>
                                </Badge>
                              )}
                            </div>

                            {/* Các nút thao tác */}
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewingStudent(student)}
                                    className="w-9 h-9 text-[#1F4E79] hover:bg-[#E9F3FF] cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <span>Xem thông tin</span>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEditDialog(student)}
                                    className="w-9 h-9 text-[#1F4E79] hover:bg-[#E9F3FF] cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4" strokeWidth={1.75} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <span>Sửa học sinh</span>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSoftDeleteTarget(student)}
                                    className="w-9 h-9 text-brand-pinkText hover:bg-[#FFE0EB] cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <span>Chuyển vào thùng rác</span>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* DANH SÁCH THẺ HỌC SINH TRÊN DI ĐỘNG */}
                <div className="md:hidden divide-y divide-[#F3D9E3]">
                  {isLoadingList ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-brand-subtext">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2F6FA8]" />
                      <span className="text-[13px]">Đang tải học sinh...</span>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-brand-subtext px-4 text-center">
                      <Users className="w-8 h-8 text-[#9C6B84]/50" />
                      <span className="font-semibold text-[14px] text-brand-text">
                        Không tìm thấy học sinh nào
                      </span>
                    </div>
                  ) : (
                    students.map((student, idx) => {
                      const isEven = idx % 2 === 1;
                      const avatarBgClass = isEven
                        ? 'bg-[#DCEBFA] text-[#1F4E79]'
                        : 'bg-[#FFE0EB] text-brand-pinkText';

                      return (
                        <div key={student.id} className="p-4 flex flex-col gap-3 bg-white">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-[10px] ${avatarBgClass} font-bold text-[13px] flex items-center justify-center flex-shrink-0`}
                              >
                                {getInitials(student.fullName)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[15px] text-brand-text leading-tight truncate">
                                  {student.fullName}
                                </div>
                                <div className="text-[12px] text-brand-subtext truncate mt-0.5">
                                  {student.email || 'Chưa cập nhật email'}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[12px] font-bold text-brand-text bg-[#FFF6F9] border border-[#F3D9E3] px-2 py-0.5 rounded-[8px] flex-shrink-0">
                              {student.studentCode}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(student.classes?.length ? student.classes : [student.className]).map((cls, cIdx) => (
                                <Badge key={cIdx} variant="classChip">
                                  {cls}
                                </Badge>
                              ))}
                            </div>
                            <div>
                              {student.status === 'Đang học' && (
                                <Badge
                                  variant="studying"
                                  className="px-2.5 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Đang học</span>
                                </Badge>
                              )}
                              {student.status === 'Bảo lưu' && (
                                <Badge
                                  variant="reserved"
                                  className="px-2.5 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap"
                                >
                                  <Pause className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Bảo lưu</span>
                                </Badge>
                              )}
                              {student.status === 'Nghỉ học' && (
                                <Badge
                                  variant="leave"
                                  className="px-2.5 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap"
                                >
                                  <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Nghỉ học</span>
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F3D9E3]/60">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingStudent(student)}
                              className="w-11 h-11 text-[#1F4E79] hover:bg-[#E9F3FF]"
                              aria-label="Xem thông tin"
                            >
                              <Eye className="w-4 h-4" strokeWidth={1.75} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(student)}
                              className="w-11 h-11 text-[#1F4E79] hover:bg-[#E9F3FF]"
                              aria-label="Sửa học sinh"
                            >
                              <Pencil className="w-4 h-4" strokeWidth={1.75} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSoftDeleteTarget(student)}
                              className="w-11 h-11 text-brand-pinkText hover:bg-[#FFE0EB]"
                              aria-label="Chuyển vào thùng rác"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CHÂN BẢNG DANH SÁCH CHÍNH */}
              <div className="min-h-[52px] px-4 lg:px-6 py-3 lg:py-0 border-t border-[#F3D9E3] flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0 bg-white">
                <span className="text-[13px] font-semibold text-brand-subtext">
                  {totalStudents > 0
                    ? `Hiển thị ${(page - 1) * pageSize + 1}–${Math.min(
                        page * pageSize,
                        totalStudents
                      )} trên ${totalStudents} học sinh`
                    : 'Hiển thị 0 học sinh'}
                </span>

                <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-subtext">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-8 h-8 rounded-[10px] cursor-pointer"
                  >
                    ‹
                  </Button>

                  {buildPageNumbers(page, totalPages).map((num) => (
                    <Button
                      key={num}
                      variant={page === num ? 'blueAction' : 'ghost'}
                      size="icon"
                      onClick={() => setPage(num)}
                      className="w-8 h-8 rounded-[10px] text-[13px] font-bold cursor-pointer"
                    >
                      {num}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="w-8 h-8 rounded-[10px] cursor-pointer"
                  >
                    ›
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ========================================================================= */}
        {/* ======= HỘP THOẠI XÁC NHẬN: CHUYỂN VÀO THÙNG RÁC ======= */}
        {/* ========================================================================= */}
        <Dialog
          open={!!softDeleteTarget}
          onOpenChange={(open) => !open && !isSubmittingSoftDelete && setSoftDeleteTarget(null)}
        >
          <DialogContent className="sm:max-w-[440px] w-full p-6 bg-white border border-[#F3D9E3] rounded-[12px] shadow-[0_16px_40px_rgba(59,42,53,0.16)] text-left space-y-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#DCEBFA] flex items-center justify-center text-[#1F4E79] mb-4">
              <Trash2 className="w-6 h-6 text-[#1F4E79]" strokeWidth={1.75} />
            </div>

            <DialogHeader className="text-left space-y-2 p-0">
              <DialogTitle className="font-serif-title text-[22px] font-bold text-brand-text leading-snug">
                Chuyển {softDeleteTarget?.fullName} vào thùng rác?
              </DialogTitle>

              <DialogDescription className="font-nunito text-[14px] text-[#3B2A35] leading-relaxed">
                Học sinh sẽ bị ẩn khỏi danh sách, lịch học, điểm danh và tạm khóa tài khoản đăng nhập. Bạn có thể khôi phục trong mục Thùng rác bất cứ lúc nào.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 pt-2 flex sm:justify-end items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmittingSoftDelete}
                onClick={() => setSoftDeleteTarget(null)}
                className="h-[44px] px-5 rounded-[12px] text-[14px] font-bold text-[#6B5560] hover:text-brand-text hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="blueAction"
                disabled={isSubmittingSoftDelete}
                onClick={handleConfirmSoftDelete}
                className="h-[44px] px-5 rounded-[12px] text-[14px] font-bold text-white bg-[#2F6FA8] hover:bg-[#255784] shadow-sm gap-2 cursor-pointer"
              >
                {isSubmittingSoftDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Chuyển vào thùng rác</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* ============ HỘP THOẠI: SỬA THÔNG TIN HỌC SINH ============ */}
        {/* ========================================================================= */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => !isSubmittingEdit && setIsEditDialogOpen(open)}
        >
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] p-5 sm:p-6 bg-white border border-[#F3D9E3] rounded-[12px] shadow-2xl flex flex-col justify-between overflow-hidden">
            <DialogHeader className="text-left space-y-0.5 flex-shrink-0">
              <DialogTitle className="font-serif-title text-[20px] font-bold text-brand-text">
                Sửa học sinh
              </DialogTitle>
              <DialogDescription className="text-[13px] font-semibold text-[#6B5560]">
                {editCode} · {editName}
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form
              onSubmit={handleEditSubmit}
              className="flex-1 overflow-y-auto pr-1 py-1 space-y-3.5 my-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {/* Mã học sinh (chỉ đọc) */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Mã học sinh</Label>
                  <Input
                    value={editCode}
                    readOnly
                    className="h-10 rounded-[10px] bg-[#FFF6F9] font-mono font-bold text-[#6B5560] cursor-not-allowed select-none text-xs"
                  />
                </div>

                {/* Giới tính */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Giới tính</Label>
                  <div className="w-full h-10 p-1 rounded-[10px] border border-[#9C6B84] bg-white flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditGender('Nam')}
                      className={`flex-1 h-full rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                        editGender === 'Nam'
                          ? 'bg-[#2F6FA8] text-white shadow-2xs'
                          : 'text-[#6B5560] hover:text-brand-text hover:bg-slate-50'
                      }`}
                    >
                      Nam
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGender('Nữ')}
                      className={`flex-1 h-full rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                        editGender === 'Nữ'
                          ? 'bg-[#2F6FA8] text-white shadow-2xs'
                          : 'text-[#6B5560] hover:text-brand-text hover:bg-slate-50'
                      }`}
                    >
                      Nữ
                    </button>
                  </div>
                </div>

                {/* Họ và tên */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Họ và tên *</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="h-10 rounded-[10px] font-bold text-brand-text text-xs"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Email (tùy chọn)</Label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="hocsinh@gmail.com"
                    className="h-10 rounded-[10px] text-xs"
                  />
                </div>

                {/* SĐT phụ huynh */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">SĐT phụ huynh</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0900 111 xxx"
                    className="h-10 rounded-[10px] font-mono font-semibold text-xs"
                  />
                </div>

                {/* Trạng thái */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Trạng thái</Label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as StudentStatus)}
                    className="w-full h-10 px-3 rounded-[10px] border border-[#9C6B84] bg-white text-xs font-semibold text-brand-text focus:outline-none focus:border-[#2F6FA8] focus:ring-2 focus:ring-[#2F6FA8]/20 transition-all cursor-pointer"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Bảo lưu">Bảo lưu</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>

                {/* Ngày sinh */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Ngày sinh</Label>
                  <Input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="h-10 rounded-[10px] text-xs"
                  />
                </div>

                {/* Địa chỉ */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Địa chỉ</Label>
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Quận/Huyện, Tỉnh/TP..."
                    className="h-10 rounded-[10px] text-xs"
                  />
                </div>

                {/* Lớp học (chip input) */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-bold text-brand-text">Lớp học *</Label>
                    <span className="text-[11px] font-medium text-[#6B5560]">
                      Nhập tên lớp rồi nhấn{' '}
                      <kbd className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-slate-700">
                        Enter
                      </kbd>
                    </span>
                  </div>
                  <div className="w-full min-h-[42px] px-2.5 py-1.5 rounded-[10px] border border-[#9C6B84] bg-white flex flex-wrap items-center gap-1.5 focus-within:border-[#2F6FA8] focus-within:ring-2 focus-within:ring-[#2F6FA8]/20 transition-all">
                    {editClasses.map((cls) => (
                      <Badge
                        key={cls}
                        variant="studying"
                        className="gap-1 px-2.5 py-0.5 text-xs rounded-[10px]"
                      >
                        <span>{cls}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditClass(cls)}
                          className="w-3.5 h-3.5 rounded-[8px] flex items-center justify-center hover:bg-[#1F4E79]/20 transition-colors cursor-pointer"
                          title="Xóa lớp"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}

                    <div className="flex-1 min-w-[160px] flex items-center gap-1">
                      <input
                        type="text"
                        value={editClassInput}
                        onChange={(e) => setEditClassInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEditClass();
                          }
                        }}
                        placeholder="+ Thêm lớp (VD: Văn 9B...) rồi Enter"
                        className="flex-1 h-7 bg-transparent px-1 text-xs text-brand-text placeholder:text-[#6B5560]/60 focus:outline-none"
                      />
                      {editClassInput.trim() && (
                        <Button
                          type="button"
                          variant="blueAction"
                          size="sm"
                          onClick={handleAddEditClass}
                          className="h-6 px-2 text-[11px] rounded-[8px]"
                        >
                          Thêm
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Ghi chú</Label>
                  <Input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Ghi chú thêm về học lực, lịch học..."
                    className="h-10 rounded-[10px] text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-[#F3D9E3] flex sm:justify-between items-center w-full gap-3 flex-shrink-0 mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmittingEdit}
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-[#6B5560] font-bold text-[13px] h-10 px-4 cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="raspberry"
                  disabled={isSubmittingEdit}
                  className="h-10 px-5 rounded-[10px] text-[13px] font-bold gap-2 cursor-pointer"
                >
                  {isSubmittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Lưu thay đổi</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ==================== HỘP THOẠI: XÁC NHẬN XÓA VĨNH VIỄN ==================== */}
        <Dialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && !isSubmittingPermDelete && setPermanentDeleteTarget(null)}
        >
          <DialogContent className="sm:max-w-[440px] p-6 bg-white border border-[#F3D9E3] rounded-[12px] shadow-lg">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="font-serif-title text-xl font-bold text-brand-text">
                Xác nhận xóa vĩnh viễn
              </DialogTitle>
              <DialogDescription className="font-nunito text-sm text-brand-subtext leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn học sinh{' '}
                <span className="font-bold text-brand-text">
                  {permanentDeleteTarget?.fullName}
                </span>{' '}
                ({permanentDeleteTarget?.studentCode}) khỏi cơ sở dữ liệu? Hành động này sẽ xóa cả tài khoản đăng nhập liên kết và{' '}
                <span className="font-bold text-[#B02525]">không thể hoàn tác</span>.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                disabled={isSubmittingPermDelete}
                onClick={() => setPermanentDeleteTarget(null)}
                className="h-10 px-4 rounded-[12px] cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                disabled={isSubmittingPermDelete}
                onClick={handleConfirmPermanentDelete}
                className="h-10 px-4 rounded-[12px] gap-1.5 cursor-pointer"
              >
                {isSubmittingPermDelete ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Xóa vĩnh viễn</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ==================== HỘP THOẠI: XEM THÔNG TIN HỌC SINH ==================== */}
        <Dialog open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)}>
          <DialogContent className="sm:max-w-[480px] p-6 sm:p-7 bg-white border border-[#F3D9E3] rounded-[12px] shadow-lg">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="font-serif-title text-2xl font-bold text-brand-text">
                Hồ sơ học sinh
              </DialogTitle>
              <DialogDescription className="font-nunito text-sm text-brand-subtext">
                Thông tin chi tiết của học sinh trong hệ thống Lớp Văn chị Vân.
              </DialogDescription>
            </DialogHeader>

            {viewingStudent && (
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-4 p-4 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]">
                  <div className="w-12 h-12 rounded-[10px] bg-[#FFE0EB] text-brand-pinkText font-bold text-base flex items-center justify-center flex-shrink-0">
                    {getInitials(viewingStudent.fullName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-brand-text text-base leading-tight truncate">
                      {viewingStudent.fullName}
                    </h3>
                    <p className="text-xs text-brand-subtext mt-0.5 truncate">
                      {viewingStudent.email || 'Chưa cập nhật email'}
                    </p>
                    <Badge variant="studying" className="mt-1.5 font-mono">
                      {viewingStudent.studentCode}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200">
                    <span className="font-bold text-brand-subtext block mb-1">Giới tính</span>
                    <span className="font-bold text-brand-text text-sm">{viewingStudent.gender}</span>
                  </div>
                  <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200">
                    <span className="font-bold text-brand-subtext block mb-1">Trạng thái</span>
                    <span className="font-bold text-brand-text text-sm">{viewingStudent.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200">
                    <span className="font-bold text-brand-subtext block mb-1">SĐT phụ huynh</span>
                    <span className="font-mono font-bold text-brand-text text-sm">
                      {viewingStudent.parentPhone}
                    </span>
                  </div>
                  <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200">
                    <span className="font-bold text-brand-subtext block mb-1">Ngày sinh</span>
                    <span className="font-bold text-brand-text text-sm">
                      {viewingStudent.dateOfBirth || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-brand-subtext block mb-1.5">Lớp đang theo học</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(viewingStudent.classes?.length
                      ? viewingStudent.classes
                      : [viewingStudent.className]
                    ).map((cls, idx) => (
                      <Badge key={idx} variant="classChip">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>

                {(viewingStudent.address || viewingStudent.note) && (
                  <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    {viewingStudent.address && (
                      <div>
                        <span className="font-bold text-brand-subtext">Địa chỉ: </span>
                        <span className="text-brand-text font-medium">{viewingStudent.address}</span>
                      </div>
                    )}
                    {viewingStudent.note && (
                      <div>
                        <span className="font-bold text-brand-subtext">Ghi chú: </span>
                        <span className="text-brand-text font-medium">{viewingStudent.note}</span>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter className="pt-2 flex flex-row items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const target = viewingStudent;
                      setViewingStudent(null);
                      handleOpenEditDialog(target);
                    }}
                    className="h-10 px-3.5 rounded-[10px] gap-1.5 border-[#9C6B84] text-brand-text cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setViewingStudent(null)}
                      className="h-10 px-3.5 rounded-[10px] text-brand-subtext cursor-pointer"
                    >
                      Đóng
                    </Button>
                    <Button
                      type="button"
                      variant="blueAction"
                      onClick={() => {
                        const code = viewingStudent.studentCode;
                        setViewingStudent(null);
                        navigate(`/students/${code}`);
                      }}
                      className="h-10 px-4 rounded-[10px] gap-1.5 cursor-pointer"
                    >
                      <span>Xem trang chi tiết</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
