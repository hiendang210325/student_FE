import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { classApi } from '@/features/classes/api/classApi';
import { ClassRoom } from '@/features/classes/types/class.types';
import {
  homeworkApi,
  getFileViewUrl,
  getFileDownloadUrl,
} from '../api/homeworkApi';
import {
  AssignmentStatus,
  HomeworkAdminItem,
  HomeworkAttachment,
  HomeworkFileType,
  HomeworkGradingDetail,
  StudentHomeworkItem,
  SubmissionPhoto,
} from '../types/homework.types';
import {
  Check,
  Clock,
  Hourglass,
  FileText,
  FileCode2,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  Maximize2,
  Download,
  ZoomIn,
  CheckCircle2,
  AlertCircle,
  Camera,
  X,
  Pencil,
  Trash2,
  Upload,
  Calendar as CalendarIcon,
  ArrowLeft,
  RotateCw,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LocalDraftPhoto {
  tempId: string;
  file: File;
  previewUrl: string;
}

const formatScoreVN = (score: number | null | undefined): string => {
  if (score === null || score === undefined || Number.isNaN(score)) return '';
  const rounded = Math.round(score * 100) / 100;
  return String(rounded).replace('.', ',');
};

const formatDateDMY = (ymd?: string): string => {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateTimeVN = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${hh}:${mm}, ${dd}/${mo}/${yyyy}`;
};

const formatDateOnlyFromIso = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mo}/${yyyy}`;
};

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
};

const getDefaultDueDateYMD = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const detectLocalFileType = (filename: string): HomeworkFileType => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return 'XLSX';
  return 'IMAGE';
};

const getInitialsFromName = (name?: string | null): string => {
  const parts = String(name || 'Chị Vân')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'CV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const QUICK_SCORES = ['7', '7,5', '8', '8,5', '9', '9,5', '10'];

export const HomeworkPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  // Bảo vệ phân quyền: tài khoản học sinh thật luôn ở chế độ Học sinh
  const isActualStudent = user?.role === 'user';
  const isAdminMode =
    !isActualStudent &&
    activeRole === 'admin' &&
    !location.search.includes('role=student');

  // ==================== THÔNG BÁO TOAST ====================
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, 3200);
    },
    []
  );

  // ==================== STATE CHẾ ĐỘ ADMIN ====================
  const [adminSubView, setAdminSubView] = useState<'list' | 'grading'>('list');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [adminHomeworks, setAdminHomeworks] = useState<HomeworkAdminItem[]>([]);
  const [totalAllHomeworks, setTotalAllHomeworks] = useState<number>(0);
  const [adminPage, setAdminPage] = useState<number>(1);
  const [adminPagination, setAdminPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [isLoadingAdminList, setIsLoadingAdminList] = useState<boolean>(false);

  // State Ngăn kéo Giao / Sửa bài tập
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingHomeworkId, setEditingHomeworkId] = useState<string | null>(null);
  const [drawerTitle, setDrawerTitle] = useState<string>('');
  const [drawerSelectedClassIds, setDrawerSelectedClassIds] = useState<string[]>([]);
  const [drawerSingleClassId, setDrawerSingleClassId] = useState<string>('');
  const [drawerDueDate, setDrawerDueDate] = useState<string>(getDefaultDueDateYMD());
  const [drawerDueTime, setDrawerDueTime] = useState<string>('23:59');
  const [drawerInstructions, setDrawerInstructions] = useState<string>('');
  const [drawerKeptAttachments, setDrawerKeptAttachments] = useState<HomeworkAttachment[]>([]);
  const [drawerNewFiles, setDrawerNewFiles] = useState<File[]>([]);
  const [isSubmittingDrawer, setIsSubmittingDrawer] = useState<boolean>(false);
  const drawerFileInputRef = useRef<HTMLInputElement | null>(null);

  // State Xóa bài tập
  const [deleteTarget, setDeleteTarget] = useState<HomeworkAdminItem | null>(null);
  const [isDeletingHomework, setIsDeletingHomework] = useState<boolean>(false);

  // State Không gian Chấm bài (Admin Grading)
  const [gradingDetail, setGradingDetail] = useState<HomeworkGradingDetail | null>(null);
  const [isLoadingGrading, setIsLoadingGrading] = useState<boolean>(false);
  const [gradingStatusFilter, setGradingStatusFilter] = useState<
    'all' | 'pending' | 'not_submitted' | 'graded'
  >('all');
  const [selectedGradingStudentId, setSelectedGradingStudentId] = useState<string>('');
  const [mobileAdminGradingDetail, setMobileAdminGradingDetail] = useState<boolean>(false);
  const [activeGradingPhotoIdx, setActiveGradingPhotoIdx] = useState<number>(0);
  const [gradingZoom, setGradingZoom] = useState<number>(100);
  const [gradingRotation, setGradingRotation] = useState<number>(0);
  const [isAdminPhotoFullscreen, setIsAdminPhotoFullscreen] = useState<boolean>(false);
  const [isAdminPromptDialogOpen, setIsAdminPromptDialogOpen] = useState<boolean>(false);
  const [gradingScoreInput, setGradingScoreInput] = useState<string>('');
  const [gradingCommentInput, setGradingCommentInput] = useState<string>('');
  const [isSavingGrade, setIsSavingGrade] = useState<boolean>(false);

  // ==================== STATE CHẾ ĐỘ HỌC SINH ====================
  const [myHomeworks, setMyHomeworks] = useState<StudentHomeworkItem[]>([]);
  const [studentInfo, setStudentInfo] = useState<{
    id: string;
    studentCode: string;
    fullName: string;
    classes: string[];
  } | null>(null);
  const [isLoadingStudentView, setIsLoadingStudentView] = useState<boolean>(false);
  const [selectedStudentHwId, setSelectedStudentHwId] = useState<string>('');
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(false);
  const [activeAttachmentIdx, setActiveAttachmentIdx] = useState<number>(0);
  const [promptZoomLevel, setPromptZoomLevel] = useState<number>(100);
  const [isFullscreenPrompt, setIsFullscreenPrompt] = useState<boolean>(false);

  // State Nộp bài / Sửa bài nộp của Học sinh
  const [isEditingSubmission, setIsEditingSubmission] = useState<boolean>(false);
  const [keptSubmissionPhotos, setKeptSubmissionPhotos] = useState<SubmissionPhoto[]>([]);
  const [draftNewPhotos, setDraftNewPhotos] = useState<LocalDraftPhoto[]>([]);
  const [isSubmittingWork, setIsSubmittingWork] = useState<boolean>(false);
  const [previewPhotoModalIndex, setPreviewPhotoModalIndex] = useState<number | null>(null);
  const studentFileInputRef = useRef<HTMLInputElement | null>(null);

  // ==================== TẢI DỮ LIỆU ADMIN ====================
  const fetchClasses = useCallback(async () => {
    try {
      const res = await classApi.getClasses();
      setClasses(res.data || []);
    } catch {
      // Bỏ qua nếu chưa có lớp
    }
  }, []);

  const fetchAdminHomeworks = useCallback(
    async (pageToLoad = adminPage, classFilter = selectedClassFilter) => {
      setIsLoadingAdminList(true);
      try {
        const res = await homeworkApi.getAdminHomeworks({
          className: classFilter === 'all' ? undefined : classFilter,
          page: pageToLoad,
          limit: 9,
        });
        if (res.data) {
          setAdminHomeworks(res.data.items || []);
          setTotalAllHomeworks(res.data.totalAllHomeworks || 0);
          setAdminPagination(res.data.pagination);
          if (res.data.pagination.page !== pageToLoad) {
            setAdminPage(res.data.pagination.page);
          }
        }
      } catch (err: any) {
        showToast(err?.message || 'Không thể tải danh sách bài tập.', 'error');
      } finally {
        setIsLoadingAdminList(false);
      }
    },
    [adminPage, selectedClassFilter, showToast]
  );

  useEffect(() => {
    if (isAdminMode) {
      fetchClasses();
    }
  }, [isAdminMode, fetchClasses]);

  useEffect(() => {
    if (isAdminMode) {
      fetchAdminHomeworks(adminPage, selectedClassFilter);
    }
  }, [isAdminMode, adminPage, selectedClassFilter, fetchAdminHomeworks]);

  // ==================== TẢI DỮ LIỆU HỌC SINH ====================
  const fetchStudentHomeworks = useCallback(async () => {
    setIsLoadingStudentView(true);
    try {
      const res = await homeworkApi.getMyHomeworks();
      if (res.data) {
        const list = res.data.items || [];
        setMyHomeworks(list);
        setStudentInfo(res.data.student || null);
        setSelectedStudentHwId((prev) => {
          if (prev && list.some((i) => i.id === prev)) return prev;
          return list[0]?.id || '';
        });
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải danh sách bài tập của em.', 'error');
    } finally {
      setIsLoadingStudentView(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAdminMode) {
      fetchStudentHomeworks();
    }
  }, [isAdminMode, fetchStudentHomeworks]);

  // Thu hồi ObjectURL khi đổi bài tập hoặc unmount
  useEffect(() => {
    return () => {
      draftNewPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [draftNewPhotos]);

  // ==================== XỬ LÝ NGĂN KÉO GIAO / SỬA BÀI TẬP (ADMIN) ====================
  const handleOpenCreateDrawer = () => {
    if (classes.length === 0) {
      showToast('Vui lòng tạo ít nhất 1 lớp học ở mục Lớp học trước khi giao bài tập.', 'error');
      return;
    }
    setDrawerMode('create');
    setEditingHomeworkId(null);
    setDrawerTitle('');
    const preselectedClass =
      selectedClassFilter !== 'all'
        ? classes.find((c) => c.name === selectedClassFilter)
        : classes[0];
    setDrawerSelectedClassIds(preselectedClass ? [preselectedClass.id] : []);
    setDrawerSingleClassId(preselectedClass?.id || classes[0]?.id || '');
    setDrawerDueDate(getDefaultDueDateYMD());
    setDrawerDueTime('23:59');
    setDrawerInstructions('');
    setDrawerKeptAttachments([]);
    setDrawerNewFiles([]);
    setIsAssignDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: HomeworkAdminItem) => {
    setDrawerMode('edit');
    setEditingHomeworkId(item.id);
    setDrawerTitle(item.title);
    const matchedClass =
      classes.find((c) => c.id === item.classId) ||
      classes.find((c) => c.name === item.className);
    setDrawerSingleClassId(matchedClass?.id || item.classId);
    setDrawerSelectedClassIds(matchedClass ? [matchedClass.id] : []);
    setDrawerDueDate(item.dueDate || getDefaultDueDateYMD());
    setDrawerDueTime(item.dueTime || '23:59');
    setDrawerInstructions(item.instructions || '');
    setDrawerKeptAttachments(item.attachments || []);
    setDrawerNewFiles([]);
    setIsAssignDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    if (isSubmittingDrawer) return;
    setIsAssignDrawerOpen(false);
  };

  const toggleClassInCreateDrawer = (classId: string) => {
    setDrawerSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSelectDrawerFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const totalCount =
      drawerKeptAttachments.length + drawerNewFiles.length + incoming.length;
    if (totalCount > 10) {
      showToast('Tối đa 10 tệp đề bài cho mỗi bài tập.', 'error');
      return;
    }
    for (const f of incoming) {
      if (f.size > 20 * 1024 * 1024) {
        showToast(`Tệp "${f.name}" vượt quá giới hạn 20 MB.`, 'error');
        return;
      }
    }
    setDrawerNewFiles((prev) => [...prev, ...incoming]);
  };

  const handleSubmitDrawer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = drawerTitle.trim();
    if (!cleanTitle) {
      showToast('Vui lòng nhập tiêu đề bài tập.', 'error');
      return;
    }
    if (!drawerDueDate) {
      showToast('Vui lòng chọn ngày hạn nộp.', 'error');
      return;
    }

    setIsSubmittingDrawer(true);
    try {
      if (drawerMode === 'create') {
        if (drawerSelectedClassIds.length === 0) {
          showToast('Vui lòng chọn ít nhất một lớp học.', 'error');
          setIsSubmittingDrawer(false);
          return;
        }
        const res = await homeworkApi.createHomeworks({
          title: cleanTitle,
          classIds: drawerSelectedClassIds,
          dueDate: drawerDueDate,
          dueTime: drawerDueTime || '23:59',
          instructions: drawerInstructions.trim(),
          files: drawerNewFiles,
        });
        showToast(res.message || 'Đã giao bài tập thành công!');
        setIsAssignDrawerOpen(false);
        setAdminPage(1);
        await fetchAdminHomeworks(1, selectedClassFilter);
      } else if (editingHomeworkId) {
        await homeworkApi.updateHomework(editingHomeworkId, {
          title: cleanTitle,
          classId: drawerSingleClassId,
          dueDate: drawerDueDate,
          dueTime: drawerDueTime || '23:59',
          instructions: drawerInstructions.trim(),
          keptAttachmentIds: drawerKeptAttachments.map((a) => a.id),
          newFiles: drawerNewFiles,
        });
        showToast(`Đã cập nhật bài tập "${cleanTitle}"!`);
        setIsAssignDrawerOpen(false);
        await fetchAdminHomeworks(adminPage, selectedClassFilter);
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu bài tập.', 'error');
    } finally {
      setIsSubmittingDrawer(false);
    }
  };

  const handleConfirmDeleteHomework = async () => {
    if (!deleteTarget) return;
    setIsDeletingHomework(true);
    try {
      const res = await homeworkApi.deleteHomework(deleteTarget.id);
      showToast(res.message || `Đã xóa bài tập "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await fetchAdminHomeworks(adminPage, selectedClassFilter);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa bài tập.', 'error');
    } finally {
      setIsDeletingHomework(false);
    }
  };

  // ==================== XỬ LÝ CHẤM BÀI (ADMIN GRADING) ====================
  const syncSelectedGradingStudentForm = useCallback(
    (detail: HomeworkGradingDetail, studentIdToSelect?: string) => {
      const list = detail.students || [];
      if (list.length === 0) {
        setSelectedGradingStudentId('');
        setGradingScoreInput('');
        setGradingCommentInput('');
        return;
      }

      let chosen =
        (studentIdToSelect && list.find((s) => s.studentId === studentIdToSelect)) ||
        list.find((s) => s.status === 'pending') ||
        list.find((s) => s.status === 'graded') ||
        list[0];

      setSelectedGradingStudentId(chosen.studentId);
      setActiveGradingPhotoIdx(0);
      setGradingZoom(100);
      setGradingRotation(0);
      setGradingScoreInput(chosen.score !== null ? formatScoreVN(chosen.score) : '');
      setGradingCommentInput(chosen.comment || '');
    },
    []
  );

  const openGradingWorkspace = async (homeworkId: string) => {
    setAdminSubView('grading');
    setGradingStatusFilter('all');
    setMobileAdminGradingDetail(false);
    setIsLoadingGrading(true);
    try {
      const res = await homeworkApi.getGradingDetail(homeworkId);
      if (res.data) {
        setGradingDetail(res.data);
        syncSelectedGradingStudentForm(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể mở không gian chấm bài.', 'error');
      setAdminSubView('list');
    } finally {
      setIsLoadingGrading(false);
    }
  };

  const filteredGradingStudents = useMemo(() => {
    if (!gradingDetail) return [];
    if (gradingStatusFilter === 'all') return gradingDetail.students;
    return gradingDetail.students.filter((s) => s.status === gradingStatusFilter);
  }, [gradingDetail, gradingStatusFilter]);

  const selectedGradingStudent = useMemo(() => {
    if (!gradingDetail || gradingDetail.students.length === 0) return null;
    return (
      gradingDetail.students.find((s) => s.studentId === selectedGradingStudentId) ||
      gradingDetail.students[0]
    );
  }, [gradingDetail, selectedGradingStudentId]);

  const handleSelectStudentForGrading = (studentId: string) => {
    if (!gradingDetail) return;
    const found = gradingDetail.students.find((s) => s.studentId === studentId);
    if (!found) return;
    setSelectedGradingStudentId(studentId);
    setActiveGradingPhotoIdx(0);
    setGradingZoom(100);
    setGradingRotation(0);
    setGradingScoreInput(found.score !== null ? formatScoreVN(found.score) : '');
    setGradingCommentInput(found.comment || '');
    setMobileAdminGradingDetail(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingDetail || !selectedGradingStudent) return;
    if (selectedGradingStudent.status === 'not_submitted') return;

    const cleanScore = gradingScoreInput.trim();
    if (!cleanScore) {
      showToast('Vui lòng nhập điểm số từ 0 đến 10.', 'error');
      return;
    }

    setIsSavingGrade(true);
    try {
      const res = await homeworkApi.gradeSubmission(
        gradingDetail.homework.id,
        selectedGradingStudent.studentId,
        {
          score: cleanScore,
          comment: gradingCommentInput.trim(),
        }
      );

      // Tải lại dữ liệu chấm bài để đồng bộ chính xác tiến độ & điểm số
      const refreshed = await homeworkApi.getGradingDetail(gradingDetail.homework.id);
      if (refreshed.data) {
        setGradingDetail(refreshed.data);
        const updatedSelf = refreshed.data.students.find(
          (s) => s.studentId === selectedGradingStudent.studentId
        );
        if (updatedSelf) {
          setGradingScoreInput(
            updatedSelf.score !== null ? formatScoreVN(updatedSelf.score) : ''
          );
          setGradingCommentInput(updatedSelf.comment || '');
        }
      }

      fetchAdminHomeworks(adminPage, selectedClassFilter);

      const gpaNote =
        res.data?.updatedStudentGpa !== null && res.data?.updatedStudentGpa !== undefined
          ? ` · Điểm TB mới: ${formatScoreVN(res.data.updatedStudentGpa)}`
          : '';
      showToast(
        `Đã lưu điểm ${cleanScore}/10 cho ${selectedGradingStudent.fullName}${gpaNote}`
      );
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu điểm chấm.', 'error');
    } finally {
      setIsSavingGrade(false);
    }
  };

  // ==================== XỬ LÝ PHÍA HỌC SINH ====================
  const currentStudentAssignment = useMemo(() => {
    if (myHomeworks.length === 0) return null;
    return myHomeworks.find((h) => h.id === selectedStudentHwId) || myHomeworks[0];
  }, [myHomeworks, selectedStudentHwId]);

  const resetStudentDraft = useCallback(() => {
    setDraftNewPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setKeptSubmissionPhotos([]);
    setIsEditingSubmission(false);
    setPreviewPhotoModalIndex(null);
  }, []);

  const handleSelectStudentHomework = (hw: StudentHomeworkItem) => {
    resetStudentDraft();
    setSelectedStudentHwId(hw.id);
    setActiveAttachmentIdx(0);
    setPromptZoomLevel(100);
    setMobileShowDetail(true);
  };

  const handleStartEditPendingSubmission = () => {
    if (!currentStudentAssignment?.submission) return;
    setKeptSubmissionPhotos(currentStudentAssignment.submission.photos || []);
    setDraftNewPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setIsEditingSubmission(true);
  };

  const handleCancelEditPendingSubmission = () => {
    resetStudentDraft();
  };

  const handleStudentPickPhotos = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);

    const currentTotal =
      keptSubmissionPhotos.length + draftNewPhotos.length + incoming.length;
    if (currentTotal > 10) {
      showToast('Chỉ được tải lên tối đa 10 ảnh trang vở cho mỗi bài làm.', 'error');
      return;
    }

    for (const file of incoming) {
      if (!file.type.startsWith('image/')) {
        showToast(`Tệp "${file.name}" không phải là hình ảnh hợp lệ.`, 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`Ảnh "${file.name}" vượt quá giới hạn 10 MB.`, 'error');
        return;
      }
    }

    const mapped: LocalDraftPhoto[] = incoming.map((file) => ({
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setDraftNewPhotos((prev) => [...prev, ...mapped]);
  };

  const handleRemoveKeptPhoto = (photoId: string) => {
    setKeptSubmissionPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleRemoveDraftNewPhoto = (tempId: string) => {
    setDraftNewPhotos((prev) => {
      const target = prev.find((p) => p.tempId === tempId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.tempId !== tempId);
    });
  };

  const handleStudentSubmitWork = async () => {
    if (!currentStudentAssignment) return;
    const totalCount = keptSubmissionPhotos.length + draftNewPhotos.length;
    if (totalCount === 0) {
      showToast('Em hãy chọn hoặc chụp ít nhất 1 ảnh bài làm trước khi bấm Nộp bài nhé!', 'error');
      return;
    }

    setIsSubmittingWork(true);
    try {
      const res = await homeworkApi.submitHomework(currentStudentAssignment.id, {
        keptPhotoIds: keptSubmissionPhotos.map((p) => p.id),
        newPhotos: draftNewPhotos.map((p) => p.file),
      });

      const lateSuffix = res.data?.isLate ? ' (Ghi nhận Nộp muộn)' : '';
      showToast(
        `Đã nộp thành công ${totalCount} ảnh trang vở${lateSuffix}!`
      );
      resetStudentDraft();
      await fetchStudentHomeworks();
      window.dispatchEvent(new Event('sidebar-badges-refresh'));
    } catch (err: any) {
      showToast(err?.message || 'Không thể nộp bài làm.', 'error');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // ==================== HELPER HIỂN THỊ HUY HIỆU & ICON ====================
  const renderStatusBadge = (
    status: AssignmentStatus,
    score?: number | null,
    isLate?: boolean
  ) => {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
        {isLate && status !== 'not_submitted' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] bg-[#FFF0F6] border border-[#FCC2D7] text-[#A61E4D] text-[11px] font-bold">
            Nộp muộn
          </span>
        )}
        {status === 'graded' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
            <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2.2} />
            <span>
              Đã chấm{score !== null && score !== undefined ? ` ${formatScoreVN(score)}` : ''}
            </span>
          </span>
        ) : status === 'pending' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#EFE9ED] text-[#3B2A35] text-[12px] font-bold">
            <Hourglass className="w-3.5 h-3.5 text-[#6B5560]" strokeWidth={1.75} />
            <span>Chờ chấm</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
            <Clock className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={1.75} />
            <span>Chưa nộp</span>
          </span>
        )}
      </div>
    );
  };

  const renderFileTypeIcon = (type: HomeworkFileType) => {
    switch (type) {
      case 'PDF':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#2F6FA8] flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" strokeWidth={1.75} />
          </div>
        );
      case 'DOCX':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
            <FileCode2 className="w-4 h-4" strokeWidth={1.75} />
          </div>
        );
      case 'XLSX':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-4 h-4" strokeWidth={1.75} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#2F6FA8] flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        );
    }
  };

  const renderToastBanner = () => {
    if (!toast) return null;
    return (
      <div
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
          toast.type === 'error'
            ? 'bg-[#B02525] text-white'
            : 'bg-[#3B2A35] text-white'
        }`}
      >
        {toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-[#FFE3E3] flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#CFE8FF] flex-shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    );
  };

  // ==================== GIAO DIỆN ADMIN: MÀN HÌNH 1B — CHẤM BÀI ====================
  if (isAdminMode && adminSubView === 'grading') {
    const hw = gradingDetail?.homework;
    const summary = gradingDetail?.summary;
    const isSelectedNotSubmitted =
      !selectedGradingStudent || selectedGradingStudent.status === 'not_submitted';
    const currentPhotos = selectedGradingStudent?.photos || [];
    const activePhoto = currentPhotos[activeGradingPhotoIdx] || currentPhotos[0] || null;

    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh]">
        <div className="w-full max-w-[1200px] p-0 lg:p-6 flex flex-col gap-4 box-border select-none relative font-nunito">
          {renderToastBanner()}

          {/* HEADER BREADCRUMB CHẤM BÀI */}
          <header className="min-h-[60px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setAdminSubView('list');
                  setMobileAdminGradingDetail(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white border border-[#F3D9E3] text-[#1F4E79] hover:bg-[#E9F3FF] text-[13px] font-bold cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span>Danh sách bài tập</span>
              </button>
              <span className="text-[#9C8B95] font-bold">›</span>
              <h1 className="font-playfair text-[20px] lg:text-[24px] font-bold text-[#3B2A35] leading-tight truncate">
                {hw ? hw.title : 'Đang tải bài tập...'}
              </h1>
              {hw && (
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                  {hw.className}
                </span>
              )}
            </div>

            {hw && summary && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-[8px] bg-white border border-[#F3D9E3] text-[#3B2A35] text-[12px] font-bold">
                  Hạn nộp: {formatDateDMY(hw.dueDate)} · {hw.dueTime}
                </span>
                <span className="px-2.5 py-1 rounded-[8px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                  Đã nộp {summary.submittedCount}/{summary.totalStudents} · Đã chấm{' '}
                  {summary.gradedCount}/{summary.submittedCount}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdminPromptDialogOpen(true)}
                  className="h-[34px] px-3 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#E9F3FF] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Xem đề bài ({hw.attachments.length} tệp)</span>
                </button>
              </div>
            )}
          </header>

          {isLoadingGrading ? (
            <div className="flex-1 min-h-[520px] bg-white border border-[#F3D9E3] rounded-[16px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
              <p className="text-[14px] font-semibold text-[#6B5560]">
                Đang tải danh sách học sinh và ảnh bài làm...
              </p>
            </div>
          ) : !gradingDetail || gradingDetail.students.length === 0 ? (
            <div className="flex-1 min-h-[480px] bg-white border border-[#F3D9E3] rounded-[16px] p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#E9F3FF] text-[#2F6FA8] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                Lớp {hw?.className} hiện chưa có học sinh nào
              </h2>
              <p className="text-[14px] text-[#6B5560] max-w-[440px]">
                Hãy thêm học sinh vào lớp tại mục Quản lý lớp học để theo dõi tình hình nộp bài và chấm điểm.
              </p>
              <button
                type="button"
                onClick={() => navigate('/classes')}
                className="mt-2 h-[42px] px-5 rounded-[12px] bg-[#2F6FA8] text-white text-[13px] font-bold cursor-pointer"
              >
                Đi tới Quản lý lớp học
              </button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[20px] items-start">
              {/* CỘT TRÁI: DANH SÁCH HỌC SINH CỦA LỚP */}
              <div
                className={`${
                  mobileAdminGradingDetail ? 'hidden md:flex' : 'flex'
                } md:col-span-5 lg:col-span-4 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex-col overflow-hidden max-h-[820px]`}
              >
                <div className="p-3.5 border-b border-[#F3D9E3] space-y-2.5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                      Học sinh ({gradingDetail.students.length})
                    </h2>
                    <span className="text-[12px] font-bold text-[#1F4E79]">
                      Chờ chấm: {summary?.pendingCount || 0}
                    </span>
                  </div>

                  {/* Bộ lọc nhanh trạng thái nộp */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: 'all', label: `Tất cả (${gradingDetail.students.length})` },
                      { key: 'pending', label: `Chờ chấm (${summary?.pendingCount || 0})` },
                      {
                        key: 'not_submitted',
                        label: `Chưa nộp (${summary?.notSubmittedCount || 0})`,
                      },
                      { key: 'graded', label: `Đã chấm (${summary?.gradedCount || 0})` },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setGradingStatusFilter(tab.key as any)}
                        className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-colors cursor-pointer ${
                          gradingStatusFilter === tab.key
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#FFF6F9] text-[#6B5560] hover:bg-[#E9F3FF] hover:text-[#1F4E79]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 divide-y divide-[#F3D9E3] overflow-y-auto">
                  {filteredGradingStudents.length === 0 ? (
                    <div className="p-6 text-center text-[13px] font-semibold text-[#6B5560]">
                      Không có học sinh nào trong bộ lọc này.
                    </div>
                  ) : (
                    filteredGradingStudents.map((st) => {
                      const isSelected =
                        selectedGradingStudent?.studentId === st.studentId;
                      return (
                        <div
                          key={st.studentId}
                          onClick={() => handleSelectStudentForGrading(st.studentId)}
                          className={`min-h-[68px] px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#E9F3FF] border-l-4 border-l-[#2F6FA8]'
                              : 'bg-white hover:bg-[#FFF6F9] border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#FFE0EB] text-[#A61E4D] font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                              {st.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-nunito text-[13px] font-bold text-[#3B2A35] truncate">
                                {st.fullName}
                              </div>
                              <div className="text-[11px] font-semibold text-[#6B5560] truncate">
                                {st.studentCode}
                                {st.photos.length > 0 ? ` · ${st.photos.length} ảnh` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {renderStatusBadge(st.status, st.score, st.isLate)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CỘT PHẢI: XEM ẢNH VỞ & FORM CHẤM ĐIỂM */}
              <div
                className={`${
                  mobileAdminGradingDetail ? 'flex' : 'hidden md:flex'
                } md:col-span-7 lg:col-span-8 flex-col gap-4`}
              >
                <button
                  type="button"
                  onClick={() => setMobileAdminGradingDetail(false)}
                  className="md:hidden h-[42px] px-3.5 rounded-[12px] bg-white border border-[#F3D9E3] text-[#1F4E79] font-bold text-[13px] flex items-center gap-2 w-fit cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  <span>Danh sách học sinh</span>
                </button>

                {selectedGradingStudent && (
                  <>
                    {/* Thanh thông tin học sinh */}
                    <div className="bg-white border border-[#F3D9E3] rounded-[16px] shadow-card px-4 lg:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                        <span className="font-playfair text-[19px] font-bold text-[#3B2A35]">
                          {selectedGradingStudent.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#FFF6F9] border border-[#F3D9E3] text-[#6B5560] text-[12px] font-bold">
                          {selectedGradingStudent.studentCode}
                        </span>
                        <span className="text-[13px] font-medium text-[#6B5560]">
                          {selectedGradingStudent.submittedAt
                            ? `Nộp lúc ${formatDateTimeVN(selectedGradingStudent.submittedAt)}`
                            : 'Chưa nộp bài'}
                        </span>
                        {currentPhotos.length > 0 && (
                          <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                            {currentPhotos.length} ảnh
                          </span>
                        )}
                      </div>

                      {renderStatusBadge(
                        selectedGradingStudent.status,
                        selectedGradingStudent.score,
                        selectedGradingStudent.isLate
                      )}
                    </div>

                    {/* Khung xem ảnh trang vở học sinh nộp */}
                    <div className="bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col overflow-hidden">
                      <div className="min-h-[46px] px-4 py-2 bg-[#E9F3FF] border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {currentPhotos.length > 0 && (
                            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-[10px] border border-[#CFE8FF] text-[#1F4E79] text-[12px] font-bold">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveGradingPhotoIdx((i) => Math.max(0, i - 1))
                                }
                                disabled={activeGradingPhotoIdx === 0}
                                className="p-0.5 hover:bg-[#E9F3FF] rounded disabled:opacity-40 cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="px-1">
                                Ảnh {activeGradingPhotoIdx + 1} / {currentPhotos.length}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveGradingPhotoIdx((i) =>
                                    Math.min(currentPhotos.length - 1, i + 1)
                                  )
                                }
                                disabled={activeGradingPhotoIdx >= currentPhotos.length - 1}
                                className="p-0.5 hover:bg-[#E9F3FF] rounded disabled:opacity-40 cursor-pointer"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[10px] border border-[#CFE8FF] text-[#1F4E79] text-[12px] font-bold">
                            <button
                              type="button"
                              disabled={isSelectedNotSubmitted}
                              onClick={() => setGradingZoom((z) => Math.max(50, z - 20))}
                              className="p-0.5 hover:bg-[#E9F3FF] rounded disabled:opacity-40 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-1 min-w-[42px] text-center">
                              {gradingZoom}%
                            </span>
                            <button
                              type="button"
                              disabled={isSelectedNotSubmitted}
                              onClick={() => setGradingZoom((z) => Math.min(200, z + 20))}
                              className="p-0.5 hover:bg-[#E9F3FF] rounded disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isSelectedNotSubmitted}
                            onClick={() => setGradingRotation((r) => (r + 90) % 360)}
                            title="Xoay ảnh 90°"
                            className="h-8 px-2.5 rounded-[10px] bg-white border border-[#CFE8FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center gap-1 text-[12px] font-bold disabled:opacity-40 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Xoay</span>
                          </button>

                          <button
                            type="button"
                            disabled={!activePhoto}
                            onClick={() => setIsAdminPhotoFullscreen(true)}
                            title="Xem toàn màn hình"
                            className="w-8 h-8 rounded-[10px] bg-white border border-[#CFE8FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>

                        {activePhoto && (
                          <a
                            href={getFileDownloadUrl(
                              activePhoto.url,
                              activePhoto.originalName
                            )}
                            download={activePhoto.originalName}
                            className="h-[32px] px-3 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#DCEBFA] text-[12px] font-bold inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải ảnh về</span>
                          </a>
                        )}
                      </div>

                      <div className="h-[360px] bg-[#F7FBFF] overflow-auto p-4 flex items-center justify-center">
                        {!activePhoto ? (
                          <div className="text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center mx-auto mb-2.5">
                              <Clock className="w-5 h-5" />
                            </div>
                            <p className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                              Học sinh chưa nộp bài
                            </p>
                            <p className="text-[13px] text-[#6B5560] mt-1">
                              Khi học sinh chụp và tải ảnh bài làm lên, ảnh sẽ hiển thị tại đây để thầy cô chấm điểm.
                            </p>
                          </div>
                        ) : (
                          <img
                            src={getFileViewUrl(activePhoto.url)}
                            alt={activePhoto.originalName}
                            style={{
                              transform: `scale(${gradingZoom / 100}) rotate(${gradingRotation}deg)`,
                              transformOrigin: 'center center',
                            }}
                            className="max-h-full max-w-full object-contain rounded-[8px] shadow-sm transition-transform duration-150"
                          />
                        )}
                      </div>

                      {currentPhotos.length > 0 && (
                        <div className="px-4 py-2.5 bg-white border-t border-[#F3D9E3] flex items-center gap-2.5 overflow-x-auto">
                          {currentPhotos.map((photo, idx) => {
                            const isSelectedThumb = idx === activeGradingPhotoIdx;
                            return (
                              <button
                                key={photo.id}
                                type="button"
                                onClick={() => setActiveGradingPhotoIdx(idx)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] border transition-all cursor-pointer flex-shrink-0 ${
                                  isSelectedThumb
                                    ? 'border-[#2F6FA8] bg-[#E9F3FF] text-[#1F4E79]'
                                    : 'border-[#F3D9E3] bg-white text-[#6B5560] hover:border-[#8EC5FC]'
                                }`}
                              >
                                <img
                                  src={getFileViewUrl(photo.url)}
                                  alt={`Trang ${idx + 1}`}
                                  className="w-8 h-10 object-cover rounded-[4px] border border-[#F3D9E3]"
                                />
                                <span className="text-[12px] font-bold">
                                  Trang {idx + 1}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Khung nhập Điểm & Nhận xét */}
                    <form
                      onSubmit={handleSaveGrade}
                      className="bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 lg:p-5 space-y-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                          Chấm điểm & nhận xét
                        </h3>
                        {selectedGradingStudent.gradedAt && (
                          <span className="text-[12px] font-semibold text-[#1F4E79]">
                            Đã chấm lần cuối lúc{' '}
                            {formatDateTimeVN(selectedGradingStudent.gradedAt)} bởi{' '}
                            {selectedGradingStudent.gradedByName || 'Chị Vân'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-4 space-y-2">
                          <label className="block text-[13px] font-bold text-[#3B2A35]">
                            Điểm số (thang 10)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              disabled={isSelectedNotSubmitted || isSavingGrade}
                              value={gradingScoreInput}
                              onChange={(e) => setGradingScoreInput(e.target.value)}
                              placeholder="VD: 8,5"
                              className="w-[104px] h-[46px] px-3 rounded-[12px] border border-[#9C6B84] bg-white text-center font-playfair text-[24px] font-bold text-[#1F4E79] outline-none focus:ring-2 focus:ring-[#2F6FA8] disabled:bg-[#F5F2F4] disabled:opacity-60"
                            />
                            <span className="font-nunito text-[16px] font-bold text-[#6B5560]">
                              / 10
                            </span>
                          </div>

                          {/* Chọn điểm nhanh */}
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {QUICK_SCORES.map((qs) => (
                              <button
                                key={qs}
                                type="button"
                                disabled={isSelectedNotSubmitted || isSavingGrade}
                                onClick={() => setGradingScoreInput(qs)}
                                className={`px-2 py-1 rounded-[7px] text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-40 ${
                                  gradingScoreInput.trim() === qs
                                    ? 'bg-[#2F6FA8] text-white border-[#2F6FA8]'
                                    : 'bg-[#FFF6F9] text-[#3B2A35] border-[#F3D9E3] hover:bg-[#E9F3FF]'
                                }`}
                              >
                                {qs}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col">
                          <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                            Lời phê / Nhận xét cho học sinh
                          </label>
                          <textarea
                            rows={3}
                            maxLength={500}
                            disabled={isSelectedNotSubmitted || isSavingGrade}
                            value={gradingCommentInput}
                            onChange={(e) => setGradingCommentInput(e.target.value)}
                            placeholder={
                              isSelectedNotSubmitted
                                ? 'Học sinh chưa nộp bài nên chưa thể nhập nhận xét...'
                                : 'Nhập nhận xét chi tiết về ưu điểm, diễn đạt và phần cần lưu ý...'
                            }
                            className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#9C6B84] bg-white text-[13px] font-medium text-[#3B2A35] outline-none focus:ring-2 focus:ring-[#2F6FA8] resize-none disabled:bg-[#F5F2F4] disabled:opacity-60"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
                            <span className="text-[11px] font-semibold text-[#6B5560]">
                              {gradingCommentInput.length}/500 ký tự · Điểm chấm sẽ tự động cập nhật vào Điểm TB học sinh
                            </span>

                            <button
                              type="submit"
                              disabled={isSelectedNotSubmitted || isSavingGrade}
                              className="h-[44px] px-5 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white text-[13px] font-bold shadow-xs inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                              {isSavingGrade && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                              <span>
                                {selectedGradingStudent.status === 'graded'
                                  ? 'Cập nhật điểm và nhận xét'
                                  : 'Gửi điểm và nhận xét'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Hộp thoại phóng to ảnh bài làm cho Giáo viên */}
          <Dialog
            open={isAdminPhotoFullscreen}
            onOpenChange={setIsAdminPhotoFullscreen}
          >
            <DialogContent className="sm:max-w-[860px] p-5 rounded-[14px] bg-white border border-[#F3D9E3]">
              <DialogHeader>
                <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                  Bài làm của {selectedGradingStudent?.fullName} – Ảnh{' '}
                  {activeGradingPhotoIdx + 1}/{currentPhotos.length}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#6B5560]">
                  {hw?.title}
                </DialogDescription>
              </DialogHeader>
              {activePhoto && (
                <div className="bg-[#F7FBFF] p-3 rounded-[10px] border border-[#F3D9E3] max-h-[75dvh] overflow-auto flex justify-center">
                  <img
                    src={getFileViewUrl(activePhoto.url)}
                    alt={activePhoto.originalName}
                    style={{ transform: `rotate(${gradingRotation}deg)` }}
                    className="max-w-full max-h-[68dvh] object-contain rounded-[8px]"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Hộp thoại xem lại đề bài cho Giáo viên ngay tại màn hình chấm */}
          <Dialog
            open={isAdminPromptDialogOpen}
            onOpenChange={setIsAdminPromptDialogOpen}
          >
            <DialogContent className="sm:max-w-[680px] p-5 rounded-[14px] bg-white border border-[#F3D9E3]">
              <DialogHeader>
                <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                  {hw?.title}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#6B5560]">
                  {hw?.className} · Hạn nộp {formatDateDMY(hw?.dueDate)} {hw?.dueTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-[70dvh] overflow-y-auto">
                {hw?.instructions ? (
                  <div className="p-3.5 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3] text-[13px] text-[#3B2A35] whitespace-pre-line">
                    <div className="font-bold mb-1 text-[#A61E4D]">
                      Hướng dẫn cho học sinh:
                    </div>
                    {hw.instructions}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#6B5560] italic">
                    Không có ghi chú hướng dẫn thêm.
                  </p>
                )}

                {hw && hw.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[13px] font-bold text-[#3B2A35]">
                      Tệp đề bài đính kèm ({hw.attachments.length}):
                    </div>
                    {hw.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-[12px] border border-[#F3D9E3] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {renderFileTypeIcon(att.fileType)}
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[#3B2A35] truncate">
                              {att.originalName}
                            </div>
                            <div className="text-[12px] text-[#6B5560]">
                              {att.fileType} · {formatBytes(att.sizeBytes)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={getFileViewUrl(att.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold"
                          >
                            Mở xem
                          </a>
                          <a
                            href={getFileDownloadUrl(att.url, att.originalName)}
                            download={att.originalName}
                            className="px-3 py-1.5 rounded-[8px] bg-[#2F6FA8] text-white text-[12px] font-bold"
                          >
                            Tải về
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // ==================== GIAO DIỆN ADMIN: MÀN HÌNH 1A — DANH SÁCH BÀI TẬP ====================
  if (isAdminMode) {
    const startIdx =
      adminPagination.total === 0
        ? 0
        : (adminPagination.page - 1) * adminPagination.limit + 1;
    const endIdx = Math.min(
      adminPagination.total,
      adminPagination.page * adminPagination.limit
    );

    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh]">
        <div className="w-full max-w-[1200px] p-0 lg:p-6 flex flex-col gap-4 box-border select-none relative font-nunito">
          {renderToastBanner()}

          {/* HEADER DANH SÁCH BÀI TẬP */}
          <header className="min-h-[72px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Bài tập
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold">
                  {totalAllHomeworks} bài tập đã giao
                </span>
              </div>
              <div className="mt-1">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D]">
                  Giao rõ hạn nộp để các em chủ động làm bài và chụp vở gửi đúng giờ nhé!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateDrawer}
              className="h-[46px] px-5 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white text-[14px] font-bold shadow-xs inline-flex items-center gap-2 cursor-pointer transition-opacity"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              <span>Giao bài tập</span>
            </button>
          </header>

          {/* DÃY CHIP LỌC THEO LỚP THẬT */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedClassFilter('all');
                setAdminPage(1);
              }}
              className={`h-[34px] px-3.5 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedClassFilter === 'all'
                  ? 'bg-[#2F6FA8] text-white shadow-2xs'
                  : 'bg-white border border-[#F3D9E3] text-[#3B2A35] hover:bg-[#E9F3FF]'
              }`}
            >
              Tất cả lớp
            </button>
            {classes.map((cls) => {
              const active = selectedClassFilter === cls.name;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => {
                    setSelectedClassFilter(cls.name);
                    setAdminPage(1);
                  }}
                  className={`h-[34px] px-3.5 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2F6FA8] text-white shadow-2xs'
                      : 'bg-white border border-[#F3D9E3] text-[#3B2A35] hover:bg-[#E9F3FF]'
                  }`}
                >
                  {cls.name} ({cls.totalStudents ?? 0})
                </button>
              );
            })}
          </div>

          {/* BẢNG BÀI TẬP */}
          <div className="w-full bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col overflow-hidden min-h-[480px]">
            {isLoadingAdminList ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
                <p className="text-[14px] font-semibold text-[#6B5560]">
                  Đang tải danh sách bài tập...
                </p>
              </div>
            ) : adminHomeworks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
                <div className="w-14 h-14 rounded-full bg-[#FFF0F6] text-[#D6336C] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                  {classes.length === 0
                    ? 'Chưa có lớp học nào trên hệ thống'
                    : selectedClassFilter === 'all'
                    ? 'Chưa có bài tập nào được giao'
                    : `Lớp ${selectedClassFilter} chưa có bài tập nào`}
                </h2>
                <p className="text-[14px] text-[#6B5560] max-w-[440px]">
                  {classes.length === 0
                    ? 'Hãy tạo lớp học trước tại mục Lớp học, sau đó quay lại giao bài tập kèm tệp đề bài cho học sinh.'
                    : 'Bấm nút "Giao bài tập" ở góc trên bên phải để tải đề bài (PDF, Word, Excel, Ảnh) và giao cho một hoặc nhiều lớp cùng lúc.'}
                </p>
                {classes.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => navigate('/classes')}
                    className="mt-2 h-[42px] px-5 rounded-[12px] bg-[#2F6FA8] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Tạo lớp học ngay
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCreateDrawer}
                    className="mt-2 h-[42px] px-5 rounded-[12px] bg-[#D6336C] text-white text-[13px] font-bold cursor-pointer"
                  >
                    + Giao bài tập đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hidden lg:grid grid-cols-12 items-center h-[44px] px-5 bg-[#FFF9FB] border-b border-[#F3D9E3] text-[12px] font-bold text-[#6B5560] uppercase tracking-wider">
                  <div className="col-span-4">Bài tập</div>
                  <div className="col-span-2">Lớp</div>
                  <div className="col-span-2">Hạn nộp</div>
                  <div className="col-span-1 pr-2">Đã nộp</div>
                  <div className="col-span-1 pr-2">Đã chấm</div>
                  <div className="col-span-2 text-right">Thao tác</div>
                </div>

                {/* Dòng máy tính */}
                <div className="hidden lg:flex flex-1 flex-col divide-y divide-[#F3D9E3]">
                  {adminHomeworks.map((row) => {
                    const submitPercent =
                      row.totalStudents > 0
                        ? Math.round((row.submittedCount / row.totalStudents) * 100)
                        : 0;
                    const gradePercent =
                      row.submittedCount > 0
                        ? Math.round((row.gradedCount / row.submittedCount) * 100)
                        : 0;
                    const isAllGraded =
                      row.submittedCount > 0 && row.gradedCount === row.submittedCount;
                    const uniqueFileTypes = Array.from(
                      new Set((row.attachments || []).map((a) => a.fileType))
                    );
                    const isPastDue = new Date(row.dueAt).getTime() < Date.now();

                    return (
                      <div
                        key={row.id}
                        className="min-h-[72px] px-5 py-2.5 grid grid-cols-12 items-center hover:bg-[#FFF6F9]/60 transition-colors"
                      >
                        <div className="col-span-4 pr-3 min-w-0">
                          <div className="font-nunito text-[14px] font-bold text-[#3B2A35] truncate">
                            {row.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {uniqueFileTypes.length > 0 ? (
                              uniqueFileTypes.map((ft) => (
                                <span
                                  key={ft}
                                  className="px-1.5 py-0.5 rounded-[6px] bg-[#E9F3FF] text-[#1F4E79] text-[10px] font-bold leading-none"
                                >
                                  {ft === 'IMAGE' ? 'ẢNH' : ft}
                                </span>
                              ))
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-[6px] bg-[#FFF0F6] text-[#A61E4D] text-[10px] font-bold leading-none">
                                HƯỚNG DẪN CHỮ
                              </span>
                            )}
                            {row.attachments.length > 0 && (
                              <span className="text-[11px] font-semibold text-[#6B5560]">
                                · {row.attachments.length} tệp
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-2 pr-2">
                          <span className="px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                            {row.className}
                          </span>
                        </div>

                        <div className="col-span-2 pr-2">
                          <div className="text-[13px] font-bold text-[#3B2A35]">
                            {formatDateDMY(row.dueDate)}
                          </div>
                          <div className="text-[11px] font-semibold text-[#6B5560]">
                            {row.dueTime}{' '}
                            {isPastDue && (
                              <span className="text-[#A61E4D] font-bold">· Đã qua hạn</span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-1 pr-3">
                          <div className="text-[12px] font-bold text-[#1F4E79] mb-1">
                            {row.submittedCount}/{row.totalStudents}
                          </div>
                          <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                            <div
                              className="h-full bg-[#2F6FA8] rounded-full"
                              style={{ width: `${submitPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="col-span-1 pr-3">
                          {isAllGraded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-[#DCEBFA] text-[#1F4E79] text-[11px] font-bold">
                              <Check className="w-3 h-3" strokeWidth={2.5} />
                              <span>Xong</span>
                            </span>
                          ) : (
                            <>
                              <div className="text-[12px] font-bold text-[#3B2A35] mb-1">
                                {row.gradedCount}/{row.submittedCount}
                              </div>
                              <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                                <div
                                  className="h-full bg-[#8EC5FC] rounded-full"
                                  style={{ width: `${gradePercent}%` }}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openGradingWorkspace(row.id)}
                            className="h-[34px] px-3 rounded-[9px] bg-[#2F6FA8] hover:opacity-95 text-white text-[12px] font-bold cursor-pointer"
                          >
                            Chấm bài
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditDrawer(row)}
                            title="Chỉnh sửa bài tập"
                            className="w-8 h-8 rounded-[8px] text-[#1F4E79] hover:bg-[#E9F3FF] flex items-center justify-center cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            title="Xóa bài tập"
                            className="w-8 h-8 rounded-[8px] text-[#B02525] hover:bg-[#FFE3E3] flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dạng thẻ trên di động / tablet */}
                <div className="flex lg:hidden flex-1 flex-col divide-y divide-[#F3D9E3]">
                  {adminHomeworks.map((row) => {
                    const submitPercent =
                      row.totalStudents > 0
                        ? Math.round((row.submittedCount / row.totalStudents) * 100)
                        : 0;
                    const gradePercent =
                      row.submittedCount > 0
                        ? Math.round((row.gradedCount / row.submittedCount) * 100)
                        : 0;

                    return (
                      <div key={row.id} className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-[15px] text-[#3B2A35]">
                            {row.title}
                          </div>
                          <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold flex-shrink-0">
                            {row.className}
                          </span>
                        </div>

                        <div className="text-[12px] font-semibold text-[#6B5560]">
                          Hạn nộp: {formatDateDMY(row.dueDate)} · {row.dueTime}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[12px] font-bold text-[#1F4E79] mb-1">
                              Đã nộp: {row.submittedCount}/{row.totalStudents}
                            </div>
                            <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                              <div
                                className="h-full bg-[#2F6FA8] rounded-full"
                                style={{ width: `${submitPercent}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-[12px] font-bold text-[#3B2A35] mb-1">
                              Đã chấm: {row.gradedCount}/{row.submittedCount}
                            </div>
                            <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                              <div
                                className="h-full bg-[#8EC5FC] rounded-full"
                                style={{ width: `${gradePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openGradingWorkspace(row.id)}
                            className="flex-1 h-[40px] rounded-[10px] bg-[#2F6FA8] text-white text-[13px] font-bold cursor-pointer"
                          >
                            Chấm bài
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditDrawer(row)}
                            className="w-[40px] h-[40px] rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] flex items-center justify-center cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            className="w-[40px] h-[40px] rounded-[10px] bg-[#FFE3E3] text-[#B02525] flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* THANH PHÂN TRANG THẬT */}
                <div className="min-h-[44px] px-5 py-2 border-t border-[#F3D9E3] bg-white flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-[#6B5560]">
                  <span>
                    Hiển thị {startIdx}–{endIdx} trên {adminPagination.total} bài tập
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={adminPagination.page <= 1}
                      onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] disabled:opacity-40 cursor-pointer"
                    >
                      ‹
                    </button>
                    {Array.from(
                      { length: adminPagination.totalPages },
                      (_, idx) => idx + 1
                    ).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAdminPage(p)}
                        className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center cursor-pointer ${
                          adminPagination.page === p
                            ? 'bg-[#2F6FA8] text-white'
                            : 'text-[#1F4E79] hover:bg-[#E9F3FF]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={adminPagination.page >= adminPagination.totalPages}
                      onClick={() =>
                        setAdminPage((p) =>
                          Math.min(adminPagination.totalPages, p + 1)
                        )
                      }
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] disabled:opacity-40 cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* NGĂN KÉO GIAO / CHỈNH SỬA BÀI TẬP */}
          {isAssignDrawerOpen && (
            <div
              className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center md:justify-end"
              style={{ backgroundColor: 'rgba(59, 42, 53, 0.35)' }}
              onClick={handleCloseDrawer}
            >
              <div
                className="w-full md:w-[min(540px,92vw)] max-h-[92dvh] md:max-h-none md:h-full bg-white rounded-t-[20px] md:rounded-t-none md:rounded-l-[16px] shadow-[-12px_0_36px_rgba(59,42,53,0.16)] flex flex-col justify-between overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-[#F3D9E3] flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                      {drawerMode === 'create' ? 'Giao bài tập mới' : 'Chỉnh sửa bài tập'}
                    </h2>
                    <p className="text-[13px] font-medium text-[#6B5560] mt-0.5">
                      Học sinh sẽ xem trực tiếp đề bài ngay trên web và tải tệp gốc về máy
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="w-9 h-9 rounded-[10px] text-[#6B5560] hover:bg-[#FFF6F9] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitDrawer}
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                >
                  <div>
                    <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                      Tiêu đề bài tập <span className="text-[#D6336C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={drawerTitle}
                      onChange={(e) => setDrawerTitle(e.target.value)}
                      placeholder='VD: Phân tích đoạn trích "Kiều ở lầu Ngưng Bích"'
                      className="w-full h-[46px] px-4 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                    />
                  </div>

                  {/* Chọn Lớp: hỗ trợ chọn 1 hoặc nhiều lớp khi tạo mới */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[13px] font-bold text-[#3B2A35]">
                        {drawerMode === 'create'
                          ? `Chọn lớp giao bài (${drawerSelectedClassIds.length} lớp đã chọn)`
                          : 'Lớp nhận bài tập'}{' '}
                        <span className="text-[#D6336C]">*</span>
                      </label>
                      {drawerMode === 'create' && classes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (drawerSelectedClassIds.length === classes.length) {
                              setDrawerSelectedClassIds([]);
                            } else {
                              setDrawerSelectedClassIds(classes.map((c) => c.id));
                            }
                          }}
                          className="text-[12px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                        >
                          {drawerSelectedClassIds.length === classes.length
                            ? 'Bỏ chọn tất cả'
                            : 'Chọn tất cả lớp'}
                        </button>
                      )}
                    </div>

                    {drawerMode === 'create' ? (
                      <div className="flex flex-wrap gap-2 p-3 rounded-[12px] border border-[#F3D9E3] bg-[#FFF9FB] max-h-[140px] overflow-y-auto">
                        {classes.map((cls) => {
                          const checked = drawerSelectedClassIds.includes(cls.id);
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => toggleClassInCreateDrawer(cls.id)}
                              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-bold border inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                                checked
                                  ? 'bg-[#2F6FA8] text-white border-[#2F6FA8]'
                                  : 'bg-white text-[#3B2A35] border-[#E5D3DC] hover:border-[#2F6FA8]'
                              }`}
                            >
                              {checked && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>
                                {cls.name} ({cls.totalStudents ?? 0} HS)
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={drawerSingleClassId}
                          onChange={(e) => setDrawerSingleClassId(e.target.value)}
                          className="w-full h-[46px] px-4 pr-10 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8] appearance-none cursor-pointer"
                        >
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} ({cls.totalStudents ?? 0} học sinh)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#6B5560] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                  </div>

                  {/* Ngày & Giờ hạn nộp */}
                  <div>
                    <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                      Hạn nộp bài <span className="text-[#D6336C]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <CalendarIcon className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          value={drawerDueDate}
                          onChange={(e) => setDrawerDueDate(e.target.value)}
                          className="w-full h-[46px] pl-10 pr-3 rounded-[12px] border border-[#9C6B84] text-[13px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="time"
                          value={drawerDueTime}
                          onChange={(e) => setDrawerDueTime(e.target.value)}
                          className="w-full h-[46px] pl-10 pr-3 rounded-[12px] border border-[#9C6B84] text-[13px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                      Hướng dẫn làm bài cho học sinh
                    </label>
                    <textarea
                      rows={3}
                      value={drawerInstructions}
                      onChange={(e) => setDrawerInstructions(e.target.value)}
                      placeholder="VD: Các em viết tay ra giấy đôi, trình bày rõ mở bài - thân bài - kết bài rồi chụp rõ nét nộp lên nhé..."
                      className="w-full px-4 py-2.5 rounded-[12px] border border-[#9C6B84] text-[13px] font-medium text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8] resize-none"
                    />
                  </div>

                  {/* Khu vực đính kèm Tệp đề bài */}
                  <div>
                    <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                      Tệp đề bài đính kèm (PDF, Word, Excel, Ảnh — tối đa 20 MB/tệp)
                    </label>

                    <input
                      ref={drawerFileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      onChange={(e) => {
                        handleSelectDrawerFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />

                    <div
                      onClick={() => drawerFileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleSelectDrawerFiles(e.dataTransfer.files);
                      }}
                      className="rounded-[16px] border-2 border-dashed border-[#8EC5FC] bg-[#F7FBFF] hover:bg-[#E9F3FF]/60 p-4 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#2F6FA8]" />
                        <span className="text-[13px] font-bold text-[#3B2A35]">
                          Kéo thả tệp đề bài vào đây hoặc bấm để chọn tệp từ máy
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#E9F3FF] text-[#1F4E79] text-[11px] font-bold">
                          PDF (Xem trực tiếp)
                        </span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#E9F3FF] text-[#1F4E79] text-[11px] font-bold">
                          Ảnh JPG/PNG (Xem trực tiếp)
                        </span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#E9F3FF] text-[#1F4E79] text-[11px] font-bold">
                          Word / Excel
                        </span>
                      </div>
                    </div>

                    {(drawerKeptAttachments.length > 0 || drawerNewFiles.length > 0) && (
                      <div className="mt-3 space-y-2">
                        {drawerKeptAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="h-[56px] px-3 rounded-[12px] border border-[#F3D9E3] bg-white flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderFileTypeIcon(att.fileType)}
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-[#3B2A35] truncate">
                                  {att.originalName}
                                </div>
                                <div className="text-[11px] font-semibold text-[#1F4E79]">
                                  Đã lưu trên máy chủ · {formatBytes(att.sizeBytes)}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setDrawerKeptAttachments((prev) =>
                                  prev.filter((x) => x.id !== att.id)
                                )
                              }
                              className="w-7 h-7 rounded-[8px] text-[#6B5560] hover:bg-[#FFE3E3] hover:text-[#B02525] flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {drawerNewFiles.map((file, idx) => (
                          <div
                            key={`${file.name}-${idx}`}
                            className="h-[56px] px-3 rounded-[12px] border border-[#CFE8FF] bg-[#F7FBFF] flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderFileTypeIcon(detectLocalFileType(file.name))}
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-[#3B2A35] truncate">
                                  {file.name}
                                </div>
                                <div className="text-[11px] font-semibold text-[#2F6FA8]">
                                  Tệp mới · {formatBytes(file.size)}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setDrawerNewFiles((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="w-7 h-7 rounded-[8px] text-[#6B5560] hover:bg-[#FFE3E3] hover:text-[#B02525] flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>

                <div className="px-6 py-3.5 border-t border-[#F3D9E3] bg-white flex items-center justify-between">
                  <button
                    type="button"
                    disabled={isSubmittingDrawer}
                    onClick={handleCloseDrawer}
                    className="h-[46px] px-4 rounded-[12px] text-[#6B5560] hover:text-[#3B2A35] text-[14px] font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingDrawer}
                    onClick={() => handleSubmitDrawer()}
                    className="h-[46px] px-6 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white text-[14px] font-bold shadow-xs inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmittingDrawer && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>
                      {drawerMode === 'create' ? 'Giao bài tập' : 'Lưu thay đổi'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HỘP THOẠI XÁC NHẬN XÓA BÀI TẬP */}
          <Dialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && !isDeletingHomework && setDeleteTarget(null)}
          >
            <DialogContent className="sm:max-w-[440px] p-6 rounded-[16px] bg-white border border-[#F3D9E3]">
              <DialogHeader>
                <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                  Xác nhận xóa bài tập
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#6B5560] pt-1">
                  Bạn có chắc chắn muốn xóa bài tập{' '}
                  <strong className="text-[#3B2A35]">"{deleteTarget?.title}"</strong> của lớp{' '}
                  <strong className="text-[#1F4E79]">{deleteTarget?.className}</strong>? Toàn bộ
                  bài nộp của bài tập này sẽ bị xóa và Điểm TB của học sinh sẽ được tự động tính
                  lại.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  disabled={isDeletingHomework}
                  onClick={() => setDeleteTarget(null)}
                  className="h-[40px] px-4 rounded-[10px] bg-[#EFE9ED] text-[#3B2A35] text-[13px] font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isDeletingHomework}
                  onClick={handleConfirmDeleteHomework}
                  className="h-[40px] px-4 rounded-[10px] bg-[#B02525] text-white text-[13px] font-bold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isDeletingHomework && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Xóa bài tập</span>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // ==================== GIAO DIỆN HỌC SINH ====================
  const notSubmittedCount = myHomeworks.filter(
    (h) => h.status === 'not_submitted'
  ).length;
  const activeAttachments = currentStudentAssignment?.attachments || [];
  const activeAttachment =
    activeAttachments[activeAttachmentIdx] || activeAttachments[0] || null;

  const isUploadFormVisible =
    currentStudentAssignment?.status === 'not_submitted' ||
    (currentStudentAssignment?.status === 'pending' && isEditingSubmission);

  const isDeadlinePassed = currentStudentAssignment
    ? Date.now() > new Date(currentStudentAssignment.dueAt).getTime()
    : false;

  const getStudentRemainingBadge = (hw: StudentHomeworkItem) => {
    if (hw.status !== 'not_submitted') return null;
    const diffMs = new Date(hw.dueAt).getTime() - Date.now();
    if (diffMs < 0) {
      return {
        text: 'Đã quá hạn · Nộp bây giờ sẽ tính Nộp muộn',
        overdue: true,
      };
    }
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) {
      return {
        text: `Còn ${Math.max(1, Math.ceil(diffHours))} giờ`,
        overdue: false,
      };
    }
    return {
      text: `Còn ${Math.ceil(diffHours / 24)} ngày`,
      overdue: false,
    };
  };

  // Danh sách ảnh xem phóng to trong Modal phía Học sinh
  const modalPreviewUrls: Array<{ label: string; url: string; downloadName?: string }> =
    isUploadFormVisible
      ? [
          ...keptSubmissionPhotos.map((p, i) => ({
            label: `Trang ${i + 1}`,
            url: getFileViewUrl(p.url),
            downloadName: p.originalName,
          })),
          ...draftNewPhotos.map((p, i) => ({
            label: `Trang ${keptSubmissionPhotos.length + i + 1}`,
            url: p.previewUrl,
            downloadName: p.file.name,
          })),
        ]
      : (currentStudentAssignment?.submission?.photos || []).map((p, i) => ({
          label: `Trang ${i + 1}`,
          url: getFileViewUrl(p.url),
          downloadName: p.originalName,
        }));

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh]">
      <div className="w-full max-w-[1200px] p-0 lg:p-6 flex flex-col gap-4 box-border select-none relative font-nunito">
        {renderToastBanner()}

        {/* HEADER HỌC SINH */}
        <header className="min-h-[68px] flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Bài tập
              </h1>
              <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold">
                {myHomeworks.length} bài · {notSubmittedCount} chưa nộp
              </span>
            </div>
            <div className="mt-1">
              <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D]">
                Chụp rõ chữ, đủ sáng rồi bấm Nộp bài nhé!
              </span>
            </div>
          </div>
        </header>

        {isLoadingStudentView ? (
          <div className="min-h-[480px] bg-white border border-[#F3D9E3] rounded-[16px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
            <p className="text-[14px] font-semibold text-[#6B5560]">
              Đang tải bài tập của em...
            </p>
          </div>
        ) : myHomeworks.length === 0 ? (
          <div className="min-h-[460px] bg-white border border-[#F3D9E3] rounded-[16px] p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
              Hiện chưa có bài tập nào được giao
            </h2>
            <p className="text-[14px] text-[#6B5560] max-w-[440px]">
              {!studentInfo
                ? 'Tài khoản hiện tại chưa được liên kết với hồ sơ học sinh nào.'
                : studentInfo.classes.length === 0
                ? 'Hồ sơ của em hiện chưa được xếp vào lớp học nào.'
                : `Khi thầy cô giao bài tập mới cho lớp (${studentInfo.classes.join(', ')}), đề bài sẽ xuất hiện tại đây.`}
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[20px] items-start">
            {/* CỘT TRÁI: DANH SÁCH BÀI TẬP CỦA EM */}
            <div
              className={`${
                mobileShowDetail ? 'hidden md:flex' : 'flex'
              } md:col-span-5 lg:col-span-4 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex-col overflow-hidden max-h-[820px]`}
            >
              <div className="h-[52px] px-4 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
                <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                  Bài tập của em
                </h2>
                <span className="text-[12px] font-bold text-[#6B5560]">
                  {myHomeworks.length} bài
                </span>
              </div>

              <div className="flex-1 divide-y divide-[#F3D9E3] overflow-y-auto">
                {myHomeworks.map((hw) => {
                  const isSelected = currentStudentAssignment?.id === hw.id;
                  return (
                    <div
                      key={hw.id}
                      onClick={() => handleSelectStudentHomework(hw)}
                      className={`p-4 flex flex-col gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#E9F3FF] border-l-4 border-l-[#2F6FA8]'
                          : 'bg-white hover:bg-[#FFF6F9] border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-nunito text-[14px] font-bold text-[#3B2A35] leading-snug line-clamp-2">
                          {hw.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                        <span className="text-[12px] font-medium text-[#6B5560]">
                          {hw.className} · Hạn {formatDateDMY(hw.dueDate)}
                        </span>
                        {renderStatusBadge(
                          hw.status,
                          hw.submission?.score,
                          hw.submission?.isLate
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT ĐỀ BÀI & NỘP BÀI / ĐIỂM SỐ */}
            {currentStudentAssignment && (
              <div
                className={`${
                  mobileShowDetail ? 'flex' : 'hidden md:flex'
                } md:col-span-7 lg:col-span-8 flex-col gap-4`}
              >
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="md:hidden h-[42px] px-3.5 rounded-[12px] bg-white border border-[#F3D9E3] text-[#1F4E79] font-bold text-[13px] flex items-center gap-2 w-fit cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  <span>Danh sách bài tập</span>
                </button>

                {/* Thẻ tiêu đề & hạn nộp */}
                <div className="bg-white border border-[#F3D9E3] rounded-[16px] shadow-card px-4 lg:px-5 py-3.5 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-playfair text-[20px] lg:text-[22px] font-bold text-[#3B2A35] leading-tight">
                      {currentStudentAssignment.title}
                    </h2>
                    {renderStatusBadge(
                      currentStudentAssignment.status,
                      currentStudentAssignment.submission?.score,
                      currentStudentAssignment.submission?.isLate
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                      {currentStudentAssignment.className}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[8px] bg-[#EFE9ED] text-[#3B2A35] text-[12px] font-semibold">
                      Hạn nộp {currentStudentAssignment.dueTime},{' '}
                      {formatDateDMY(currentStudentAssignment.dueDate)}
                    </span>
                    {(() => {
                      const rem = getStudentRemainingBadge(currentStudentAssignment);
                      if (!rem) return null;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] text-[12px] font-bold ${
                            rem.overdue
                              ? 'bg-[#FFE3E3] text-[#B02525]'
                              : 'bg-[#FFE0EB] text-[#A61E4D]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>{rem.text}</span>
                        </span>
                      );
                    })()}
                    <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-semibold">
                      Giao bởi {currentStudentAssignment.assignedByName} ·{' '}
                      {formatDateOnlyFromIso(currentStudentAssignment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Khung xem Đề bài & Tệp đính kèm thực tế */}
                <div className="bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col overflow-hidden">
                  {currentStudentAssignment.instructions && (
                    <div className="px-4 lg:px-5 py-3 bg-[#FFF9FB] border-b border-[#F3D9E3] text-[13px] text-[#3B2A35] whitespace-pre-line">
                      <span className="font-bold text-[#A61E4D]">
                        Hướng dẫn của giáo viên:{' '}
                      </span>
                      {currentStudentAssignment.instructions}
                    </div>
                  )}

                  {activeAttachments.length > 0 ? (
                    <>
                      {/* Thanh tab chọn tệp đề bài */}
                      <div className="min-h-[42px] px-4 border-b border-[#F3D9E3] flex items-center gap-4 overflow-x-auto bg-white">
                        {activeAttachments.map((att, idx) => {
                          const isTabActive = idx === activeAttachmentIdx;
                          return (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() => {
                                setActiveAttachmentIdx(idx);
                                setPromptZoomLevel(100);
                              }}
                              className={`h-[42px] flex items-center gap-1.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                                isTabActive
                                  ? 'border-[#2F6FA8] text-[#1F4E79]'
                                  : 'border-transparent text-[#6B5560] hover:text-[#3B2A35]'
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                              <span>{att.originalName}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Thanh công cụ xem / tải đề bài */}
                      {activeAttachment && (
                        <div className="min-h-[46px] px-4 py-1.5 bg-[#E9F3FF] border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {activeAttachment.fileType === 'IMAGE' && (
                              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-[10px] border border-[#CFE8FF] text-[#1F4E79] text-[12px] font-bold">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPromptZoomLevel((z) => Math.max(60, z - 15))
                                  }
                                  className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-1 min-w-[42px] text-center">
                                  {promptZoomLevel}%
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPromptZoomLevel((z) => Math.min(180, z + 15))
                                  }
                                  className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {(activeAttachment.fileType === 'PDF' ||
                              activeAttachment.fileType === 'IMAGE') && (
                              <button
                                type="button"
                                onClick={() => setIsFullscreenPrompt(true)}
                                className="h-8 px-2.5 rounded-[10px] bg-white border border-[#CFE8FF] text-[#1F4E79] hover:bg-[#DCEBFA] inline-flex items-center gap-1.5 text-[12px] font-bold cursor-pointer"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Xem rộng</span>
                              </button>
                            )}
                          </div>

                          <a
                            href={getFileDownloadUrl(
                              activeAttachment.url,
                              activeAttachment.originalName
                            )}
                            download={activeAttachment.originalName}
                            className="h-[34px] px-3.5 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#DCEBFA] text-[12px] font-bold inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải về ({formatBytes(activeAttachment.sizeBytes)})</span>
                          </a>
                        </div>
                      )}

                      {/* Nội dung xem trực tiếp Đề bài */}
                      {activeAttachment && (
                        <div className="h-[320px] bg-[#F7FBFF] overflow-auto p-3 flex items-center justify-center">
                          {activeAttachment.fileType === 'PDF' ? (
                            <iframe
                              src={getFileViewUrl(activeAttachment.url)}
                              title={activeAttachment.originalName}
                              className="w-full h-full rounded-[8px] border border-[#F3D9E3] bg-white"
                            />
                          ) : activeAttachment.fileType === 'IMAGE' ? (
                            <img
                              src={getFileViewUrl(activeAttachment.url)}
                              alt={activeAttachment.originalName}
                              style={{
                                transform: `scale(${promptZoomLevel / 100})`,
                                transformOrigin: 'top center',
                              }}
                              className="max-w-full max-h-full object-contain rounded-[8px] shadow-xs transition-transform"
                            />
                          ) : (
                            <div className="bg-white border border-[#F3D9E3] rounded-[14px] p-6 max-w-[420px] text-center space-y-3 shadow-2xs">
                              <div className="flex justify-center">
                                {renderFileTypeIcon(activeAttachment.fileType)}
                              </div>
                              <div>
                                <div className="font-bold text-[15px] text-[#3B2A35] break-words">
                                  {activeAttachment.originalName}
                                </div>
                                <div className="text-[12px] text-[#6B5560] mt-0.5">
                                  Tệp {activeAttachment.fileType} ·{' '}
                                  {formatBytes(activeAttachment.sizeBytes)}
                                </div>
                              </div>
                              <a
                                href={getFileDownloadUrl(
                                  activeAttachment.url,
                                  activeAttachment.originalName
                                )}
                                download={activeAttachment.originalName}
                                className="inline-flex items-center gap-2 h-[40px] px-5 rounded-[10px] bg-[#2F6FA8] text-white text-[13px] font-bold"
                              >
                                <Download className="w-4 h-4" />
                                <span>Tải tệp đề bài về máy</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    !currentStudentAssignment.instructions && (
                      <div className="p-6 text-center text-[13px] text-[#6B5560]">
                        Bài tập này không đính kèm tệp đề bài. Em hãy đọc tiêu đề và nộp ảnh vở bài làm bên dưới nhé!
                      </div>
                    )
                  )}
                </div>

                {/* KHU VỰC NỘP BÀI / SỬA BÀI LÀM HOẶC XEM ĐIỂM */}
                {isUploadFormVisible ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                          {isEditingSubmission
                            ? 'Chỉnh sửa ảnh bài làm'
                            : 'Bài làm của em'}
                        </h3>
                        <span className="text-[12px] font-bold text-[#1F4E79]">
                          {keptSubmissionPhotos.length + draftNewPhotos.length}/10 ảnh
                        </span>
                      </div>

                      <input
                        ref={studentFileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleStudentPickPhotos(e.target.files);
                          e.target.value = '';
                        }}
                      />

                      <div
                        onClick={() => studentFileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleStudentPickPhotos(e.dataTransfer.files);
                        }}
                        className="border-2 border-dashed border-[#8EC5FC] rounded-[14px] bg-[#F7FBFF] hover:bg-[#E9F3FF]/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#2F6FA8] flex items-center justify-center flex-shrink-0">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-[#3B2A35]">
                              Chụp ảnh hoặc chọn ảnh vở bài làm
                            </div>
                            <div className="text-[12px] text-[#6B5560]">
                              JPG, PNG, WEBP · Tối đa 10 ảnh · Mỗi ảnh dưới 10 MB
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            studentFileInputRef.current?.click();
                          }}
                          className="h-[34px] px-3 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] text-[12px] font-bold cursor-pointer"
                        >
                          Chọn từ máy
                        </button>
                      </div>

                      {/* Dải thumbnail ảnh thật */}
                      <div className="flex items-start gap-3 overflow-x-auto py-1">
                        {keptSubmissionPhotos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="flex flex-col items-center flex-shrink-0"
                          >
                            <div className="relative">
                              <img
                                src={getFileViewUrl(photo.url)}
                                alt={`Trang ${idx + 1}`}
                                onClick={() => setPreviewPhotoModalIndex(idx)}
                                className="w-[92px] h-[122px] object-cover rounded-[10px] border border-[#F3D9E3] cursor-pointer shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveKeptPhoto(photo.id)}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-[#F3D9E3] text-[#B02525] hover:bg-[#FFE3E3] flex items-center justify-center shadow-2xs cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" strokeWidth={2} />
                              </button>
                            </div>
                            <span className="text-[11px] font-bold text-[#3B2A35] mt-1">
                              Trang {idx + 1}
                            </span>
                          </div>
                        ))}

                        {draftNewPhotos.map((draft, idx) => {
                          const displayIdx = keptSubmissionPhotos.length + idx;
                          return (
                            <div
                              key={draft.tempId}
                              className="flex flex-col items-center flex-shrink-0"
                            >
                              <div className="relative">
                                <img
                                  src={draft.previewUrl}
                                  alt={`Trang ${displayIdx + 1}`}
                                  onClick={() => setPreviewPhotoModalIndex(displayIdx)}
                                  className="w-[92px] h-[122px] object-cover rounded-[10px] border-2 border-[#8EC5FC] cursor-pointer shadow-2xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftNewPhoto(draft.tempId)}
                                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-[#F3D9E3] text-[#B02525] hover:bg-[#FFE3E3] flex items-center justify-center shadow-2xs cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                              </div>
                              <span className="text-[11px] font-bold text-[#2F6FA8] mt-1">
                                Trang {displayIdx + 1} (Mới)
                              </span>
                            </div>
                          );
                        })}

                        {keptSubmissionPhotos.length + draftNewPhotos.length < 10 && (
                          <button
                            type="button"
                            onClick={() => studentFileInputRef.current?.click()}
                            className="w-[92px] h-[122px] rounded-[10px] border-2 border-dashed border-[#8EC5FC] bg-[#F7FBFF] hover:bg-[#E9F3FF] text-[#2F6FA8] flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-[11px] font-bold">Thêm ảnh</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span
                          className={`text-[12px] font-semibold ${
                            isDeadlinePassed ? 'text-[#A61E4D]' : 'text-[#6B5560]'
                          }`}
                        >
                          {isDeadlinePassed
                            ? 'Đã qua hạn nộp — bài gửi sẽ được gắn nhãn Nộp muộn'
                            : 'Em có thể sửa lại ảnh bài nộp khi thầy cô chưa chấm'}
                        </span>

                        <div className="flex items-center gap-2">
                          {isEditingSubmission && (
                            <button
                              type="button"
                              disabled={isSubmittingWork}
                              onClick={handleCancelEditPendingSubmission}
                              className="h-[42px] px-4 rounded-[12px] bg-[#EFE9ED] text-[#3B2A35] text-[13px] font-bold cursor-pointer"
                            >
                              Hủy sửa
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isSubmittingWork}
                            onClick={handleStudentSubmitWork}
                            className="h-[44px] px-6 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white text-[13px] font-bold shadow-xs inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                          >
                            {isSubmittingWork && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            <span>
                              {isEditingSubmission ? 'Lưu cập nhật bài nộp' : 'Nộp bài'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col justify-between">
                      <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                        Nhận xét và điểm
                      </h3>
                      <div className="my-auto py-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#EFE9ED] flex items-center justify-center mb-2.5">
                          <Hourglass className="w-5 h-5 text-[#6B5560]" />
                        </div>
                        <div className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                          Chưa có điểm
                        </div>
                        <p className="text-[13px] text-[#6B5560] mt-1">
                          Thầy cô sẽ chấm điểm và gửi nhận xét sau khi em nộp bài.
                        </p>
                      </div>
                      <div />
                    </div>
                  </div>
                ) : (
                  /* TRẠNG THÁI ĐÃ NỘP (CHỜ CHẤM HOẶC ĐÃ CHẤM) */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-6 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col justify-between gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                          Bài làm của em
                        </h3>
                        {currentStudentAssignment.submission && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                            <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                            <span>
                              Đã nộp{' '}
                              {formatDateTimeVN(
                                currentStudentAssignment.submission.submittedAt
                              )}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {(currentStudentAssignment.submission?.photos || []).map(
                          (photo, idx) => (
                            <div
                              key={photo.id}
                              onClick={() => setPreviewPhotoModalIndex(idx)}
                              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                            >
                              <img
                                src={getFileViewUrl(photo.url)}
                                alt={`Trang ${idx + 1}`}
                                className="w-[92px] h-[122px] object-cover rounded-[10px] border border-[#F3D9E3] group-hover:border-[#2F6FA8] transition-colors shadow-2xs"
                              />
                              <span className="text-[11px] font-bold text-[#3B2A35] mt-1">
                                Trang {idx + 1}
                              </span>
                            </div>
                          )
                        )}

                        {modalPreviewUrls.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModalIndex(0)}
                            className="px-3 py-2 rounded-[10px] bg-[#E9F3FF] text-[#2F6FA8] text-[12px] font-bold inline-flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                            <span>Xem lớn</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        {currentStudentAssignment.status === 'pending' ? (
                          <>
                            <span className="text-[12px] font-medium text-[#6B5560]">
                              Bài đang chờ chấm, em vẫn có thể cập nhật lại ảnh.
                            </span>
                            <button
                              type="button"
                              onClick={handleStartEditPendingSubmission}
                              className="h-[36px] px-3.5 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Sửa bài nộp</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[12px] font-medium text-[#6B5560]">
                            Bài đã được giáo viên chấm điểm nên không thể chỉnh sửa.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-6 bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col justify-between gap-3">
                      {currentStudentAssignment.status === 'graded' &&
                      currentStudentAssignment.submission ? (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                                Nhận xét và điểm
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-8 h-8 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] font-bold text-[12px] flex items-center justify-center">
                                  {getInitialsFromName(
                                    currentStudentAssignment.submission.gradedByName
                                  )}
                                </div>
                                <span className="text-[12px] font-semibold text-[#6B5560]">
                                  <strong className="text-[#3B2A35]">
                                    {currentStudentAssignment.submission.gradedByName ||
                                      'Chị Vân'}
                                  </strong>{' '}
                                  · chấm{' '}
                                  {formatDateTimeVN(
                                    currentStudentAssignment.submission.gradedAt
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-baseline flex-shrink-0">
                              <span className="font-playfair text-[44px] lg:text-[52px] font-bold text-[#1F4E79] leading-none">
                                {formatScoreVN(currentStudentAssignment.submission.score)}
                              </span>
                              <span className="text-[18px] font-bold text-[#6B5560] ml-0.5">
                                /10
                              </span>
                            </div>
                          </div>

                          <div className="text-[13px] text-[#3B2A35] leading-relaxed bg-[#FFF6F9] p-3.5 rounded-[12px] border border-[#F3D9E3]">
                            {currentStudentAssignment.submission.comment ? (
                              <>&ldquo;{currentStudentAssignment.submission.comment}&rdquo;</>
                            ) : (
                              <span className="italic text-[#6B5560]">
                                Giáo viên đã chấm điểm (không có lời phê đính kèm).
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                            Nhận xét và điểm
                          </h3>
                          <div className="my-auto py-5 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-[#EFE9ED] flex items-center justify-center mb-2.5">
                              <Hourglass className="w-5 h-5 text-[#6B5560]" />
                            </div>
                            <div className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                              Đang chờ thầy cô chấm bài
                            </div>
                            <p className="text-[13px] text-[#6B5560] mt-1">
                              Điểm và lời phê chi tiết sẽ xuất hiện ngay khi thầy cô chấm xong nhé!
                            </p>
                          </div>
                          <div />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hộp thoại xem lớn ảnh trang vở của Học sinh */}
        <Dialog
          open={previewPhotoModalIndex !== null}
          onOpenChange={(open) => !open && setPreviewPhotoModalIndex(null)}
        >
          <DialogContent className="sm:max-w-[720px] p-5 rounded-[14px] bg-white border border-[#F3D9E3]">
            <DialogHeader>
              <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                Bài làm của em –{' '}
                {previewPhotoModalIndex !== null
                  ? modalPreviewUrls[previewPhotoModalIndex]?.label
                  : ''}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#6B5560]">
                {currentStudentAssignment?.title}
              </DialogDescription>
            </DialogHeader>

            {previewPhotoModalIndex !== null &&
              modalPreviewUrls[previewPhotoModalIndex] && (
                <div className="space-y-3">
                  <div className="bg-[#F7FBFF] p-3 rounded-[10px] border border-[#F3D9E3] max-h-[68dvh] overflow-auto flex justify-center">
                    <img
                      src={modalPreviewUrls[previewPhotoModalIndex].url}
                      alt={modalPreviewUrls[previewPhotoModalIndex].label}
                      className="max-w-full max-h-[62dvh] object-contain rounded-[8px]"
                    />
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {modalPreviewUrls.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewPhotoModalIndex(idx)}
                          className={`px-3 py-1.5 rounded-[9px] text-[12px] font-bold cursor-pointer ${
                            previewPhotoModalIndex === idx
                              ? 'bg-[#2F6FA8] text-white'
                              : 'bg-[#E9F3FF] text-[#1F4E79]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewPhotoModalIndex(null)}
                      className="px-4 py-1.5 rounded-[9px] bg-[#EFE9ED] text-[#3B2A35] text-[12px] font-bold cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
          </DialogContent>
        </Dialog>

        {/* Hộp thoại xem rộng Tệp đề bài (PDF / Ảnh) của Học sinh */}
        <Dialog open={isFullscreenPrompt} onOpenChange={setIsFullscreenPrompt}>
          <DialogContent className="sm:max-w-[880px] p-5 rounded-[14px] bg-white border border-[#F3D9E3]">
            <DialogHeader>
              <DialogTitle className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                {activeAttachment?.originalName || 'Đề bài'}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#6B5560]">
                {currentStudentAssignment?.title}
              </DialogDescription>
            </DialogHeader>
            {activeAttachment && (
              <div className="h-[72dvh] bg-[#F7FBFF] rounded-[10px] border border-[#F3D9E3] overflow-auto flex items-center justify-center p-2">
                {activeAttachment.fileType === 'PDF' ? (
                  <iframe
                    src={getFileViewUrl(activeAttachment.url)}
                    title={activeAttachment.originalName}
                    className="w-full h-full rounded-[8px] border-0 bg-white"
                  />
                ) : (
                  <img
                    src={getFileViewUrl(activeAttachment.url)}
                    alt={activeAttachment.originalName}
                    className="max-w-full max-h-full object-contain rounded-[8px]"
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
