import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Eye,
  Pencil,
  Check,
  Pause,
  Minus,
  Search,
  RotateCcw,
  CheckCircle2,
  X,
  Info,
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

export interface StudentRecord {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  classes: string[];
  gender: 'Nữ' | 'Nam';
  parentPhone: string;
  status: 'Đang học' | 'Bảo lưu' | 'Nghỉ học';
  isDeleted?: boolean;
  deletedDate?: string;
}

const initialStudents: StudentRecord[] = [
  {
    id: 1,
    studentCode: 'HS0001',
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh.nguyen@gmail.com',
    classes: ['Văn 9A'],
    gender: 'Nữ',
    parentPhone: '0900 111 201',
    status: 'Đang học',
  },
  {
    id: 2,
    studentCode: 'HS0002',
    fullName: 'Trần Gia Bảo',
    email: 'giabao.tran@gmail.com',
    classes: ['Văn 8B'],
    gender: 'Nam',
    parentPhone: '0900 111 202',
    status: 'Đang học',
  },
  {
    id: 3,
    studentCode: 'HS0003',
    fullName: 'Lê Khánh Linh',
    email: 'khanhlinh.le@gmail.com',
    classes: ['Văn 7C'],
    gender: 'Nữ',
    parentPhone: '0900 111 203',
    status: 'Đang học',
  },
  {
    id: 4,
    studentCode: 'HS0004',
    fullName: 'Đỗ Gia Hân',
    email: 'giahan.do@gmail.com',
    classes: ['Văn 9A', 'Luyện thi vào 10'],
    gender: 'Nữ',
    parentPhone: '0900 111 204',
    status: 'Đang học',
  },
  {
    id: 5,
    studentCode: 'HS0005',
    fullName: 'Vũ Quang Huy',
    email: 'quanghuy.vu@gmail.com',
    classes: ['Văn 8B'],
    gender: 'Nam',
    parentPhone: '0900 111 205',
    status: 'Đang học',
  },
  {
    id: 6,
    studentCode: 'HS0006',
    fullName: 'Bùi Thảo Vy',
    email: 'thaovy.bui@gmail.com',
    classes: ['Văn 7C'],
    gender: 'Nữ',
    parentPhone: '0900 111 206',
    status: 'Bảo lưu',
  },
  {
    id: 7,
    studentCode: 'HS0007',
    fullName: 'Phạm Hoàng Nam',
    email: 'hoangnam.pham@gmail.com',
    classes: ['Văn 10 nâng cao'],
    gender: 'Nam',
    parentPhone: '0900 111 207',
    status: 'Đang học',
  },
  {
    id: 8,
    studentCode: 'HS0008',
    fullName: 'Ngô Bảo Châu',
    email: 'baochau.ngo@gmail.com',
    classes: ['Luyện thi vào 10'],
    gender: 'Nữ',
    parentPhone: '0900 111 208',
    status: 'Đang học',
  },
  {
    id: 9,
    studentCode: 'HS0009',
    fullName: 'Hoàng Minh Khôi',
    email: 'minhkhoi.hoang@gmail.com',
    classes: ['Văn 10 nâng cao'],
    gender: 'Nam',
    parentPhone: '0900 111 209',
    status: 'Đang học',
  },
  {
    id: 10,
    studentCode: 'HS0010',
    fullName: 'Đặng Ngọc Diệp',
    email: 'ngocdiep.dang@gmail.com',
    classes: ['Văn 9A'],
    gender: 'Nữ',
    parentPhone: '0900 111 210',
    status: 'Nghỉ học',
  },
];

// Exact 14 students in trash
const initialTrashStudents: StudentRecord[] = [
  {
    id: 20,
    studentCode: 'HS0020',
    fullName: 'Trịnh Anh Thư',
    email: 'anhthu.trinh@gmail.com',
    classes: ['Văn 7C'],
    gender: 'Nữ',
    parentPhone: '0900 111 231',
    status: 'Nghỉ học',
    deletedDate: '03/11/2026',
    isDeleted: true,
  },
  {
    id: 19,
    studentCode: 'HS0019',
    fullName: 'Lý Bảo Ngọc',
    email: 'baongoc.ly@gmail.com',
    classes: ['Văn 8B'],
    gender: 'Nữ',
    parentPhone: '0900 111 232',
    status: 'Nghỉ học',
    deletedDate: '01/11/2026',
    isDeleted: true,
  },
  {
    id: 18,
    studentCode: 'HS0018',
    fullName: 'Mai Đức Anh',
    email: 'ducanh.mai@gmail.com',
    classes: ['Luyện thi vào 10'],
    gender: 'Nam',
    parentPhone: '0900 111 233',
    status: 'Nghỉ học',
    deletedDate: '28/10/2026',
    isDeleted: true,
  },
  {
    id: 17,
    studentCode: 'HS0017',
    fullName: 'Cao Thanh Hà',
    email: 'thanhha.cao@gmail.com',
    classes: ['Văn 9A'],
    gender: 'Nữ',
    parentPhone: '0900 111 234',
    status: 'Nghỉ học',
    deletedDate: '25/10/2026',
    isDeleted: true,
  },
  {
    id: 16,
    studentCode: 'HS0016',
    fullName: 'Đinh Quốc Khánh',
    email: 'quockhanh.dinh@gmail.com',
    classes: ['Văn 10 nâng cao'],
    gender: 'Nam',
    parentPhone: '0900 111 235',
    status: 'Nghỉ học',
    deletedDate: '20/10/2026',
    isDeleted: true,
  },
  {
    id: 15,
    studentCode: 'HS0015',
    fullName: 'Tạ Phương Anh',
    email: 'phuonganh.ta@gmail.com',
    classes: ['Văn 7C'],
    gender: 'Nữ',
    parentPhone: '0900 111 236',
    status: 'Nghỉ học',
    deletedDate: '18/10/2026',
    isDeleted: true,
  },
  {
    id: 14,
    studentCode: 'HS0014',
    fullName: 'Hồ Gia Huy',
    email: 'giahuy.ho@gmail.com',
    classes: ['Văn 8B'],
    gender: 'Nam',
    parentPhone: '0900 111 237',
    status: 'Nghỉ học',
    deletedDate: '12/10/2026',
    isDeleted: true,
  },
  {
    id: 13,
    studentCode: 'HS0013',
    fullName: 'Lâm Thu Trang',
    email: 'thutrang.lam@gmail.com',
    classes: ['Văn 9A'],
    gender: 'Nữ',
    parentPhone: '0900 111 238',
    status: 'Nghỉ học',
    deletedDate: '05/10/2026',
    isDeleted: true,
  },
  {
    id: 12,
    studentCode: 'HS0012',
    fullName: 'Phan Nhật Minh',
    email: 'nhatminh.phan@gmail.com',
    classes: ['Luyện thi vào 10'],
    gender: 'Nam',
    parentPhone: '0900 111 239',
    status: 'Nghỉ học',
    deletedDate: '29/09/2026',
    isDeleted: true,
  },
  {
    id: 11,
    studentCode: 'HS0011',
    fullName: 'Quách Mỹ Linh',
    email: 'mylinh.quach@gmail.com',
    classes: ['Văn 7C'],
    gender: 'Nữ',
    parentPhone: '0900 111 240',
    status: 'Nghỉ học',
    deletedDate: '22/09/2026',
    isDeleted: true,
  },
  {
    id: 10,
    studentCode: 'HS0010',
    fullName: 'Dương Thùy Chi',
    email: 'thuychi.duong@gmail.com',
    classes: ['Văn 8B'],
    gender: 'Nữ',
    parentPhone: '0900 111 241',
    status: 'Nghỉ học',
    deletedDate: '15/09/2026',
    isDeleted: true,
  },
  {
    id: 9,
    studentCode: 'HS0009',
    fullName: 'Phạm Tuấn Kiệt',
    email: 'tuankiet.pham@gmail.com',
    classes: ['Văn 9A'],
    gender: 'Nam',
    parentPhone: '0900 111 242',
    status: 'Nghỉ học',
    deletedDate: '10/09/2026',
    isDeleted: true,
  },
  {
    id: 8,
    studentCode: 'HS0008',
    fullName: 'Vũ Hải Đăng',
    email: 'haidang.vu@gmail.com',
    classes: ['Văn 10 nâng cao'],
    gender: 'Nam',
    parentPhone: '0900 111 243',
    status: 'Nghỉ học',
    deletedDate: '04/09/2026',
    isDeleted: true,
  },
  {
    id: 7,
    studentCode: 'HS0007',
    fullName: 'Bùi Thục Quyên',
    email: 'thucquyen.bui@gmail.com',
    classes: ['Văn 7C'],
    gender: 'Nữ',
    parentPhone: '0900 111 244',
    status: 'Nghỉ học',
    deletedDate: '28/08/2026',
    isDeleted: true,
  },
];

export const StudentListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'LIST' | 'TRASH'>(
    tabParam === 'trash' ? 'TRASH' : 'LIST'
  );

  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [trashList, setTrashList] = useState<StudentRecord[]>(initialTrashStudents);

  // Search & Filter state for List
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Search & Pagination state for Trash
  const [trashSearchQuery, setTrashSearchQuery] = useState('');
  const [trashPage, setTrashPage] = useState<number>(1);

  // Modals state using shadcn UI
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<StudentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ==================== SHADCN UI CONFIRMATION DIALOG: CHUYỂN VÀO THÙNG RÁC ====================
  // Open by default for HS0001 Nguyễn Minh Anh as requested
  const [softDeleteTarget, setSoftDeleteTarget] = useState<StudentRecord | null>(initialStudents[0]);

  // ==================== SHADCN UI POP-UP: SỬA HỌC SINH ====================
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editStudentId, setEditStudentId] = useState<number>(1);
  const [editCode, setEditCode] = useState<string>('HS0001');
  const [editName, setEditName] = useState<string>('Nguyễn Minh Anh');
  const [editEmail, setEditEmail] = useState<string>('minhanh.nguyen@gmail.com');
  const [editGender, setEditGender] = useState<'Nữ' | 'Nam'>('Nữ');
  const [editClasses, setEditClasses] = useState<string[]>(['Văn 9A']);
  const [newClassInput, setNewClassInput] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('0900 111 201');
  const [editStatus, setEditStatus] = useState<'Đang học' | 'Bảo lưu' | 'Nghỉ học'>('Đang học');

  // New Student Form state
  const [newCode, setNewCode] = useState('HS0011');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClass, setNewClass] = useState('Văn 9A');
  const [newGender, setNewGender] = useState<'Nữ' | 'Nam'>('Nữ');
  const [newPhone, setNewPhone] = useState('');
  const [newStatus, setNewStatus] = useState<'Đang học' | 'Bảo lưu' | 'Nghỉ học'>('Đang học');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTabChange = (tab: 'LIST' | 'TRASH') => {
    setActiveTab(tab);
    setSearchParams(tab === 'LIST' ? { tab: 'list' } : { tab: 'trash' });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Open Edit Pop-up for a student
  const handleOpenEditDialog = (student: StudentRecord) => {
    setEditStudentId(student.id);
    setEditCode(student.studentCode);
    setEditName(student.fullName);
    setEditEmail(student.email);
    setEditGender(student.gender);
    setEditClasses(student.classes);
    setEditPhone(student.parentPhone);
    setEditStatus(student.status);
    setIsEditDialogOpen(true);
  };

  // Submit Edit Form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudents((prev) =>
      prev.map((s) =>
        s.id === editStudentId
          ? {
              ...s,
              fullName: editName,
              email: editEmail,
              gender: editGender,
              classes: editClasses,
              parentPhone: editPhone,
              status: editStatus,
            }
          : s
      )
    );
    setIsEditDialogOpen(false);
    showToast(`Đã lưu thay đổi cho học sinh ${editName}!`);
  };

  // Remove class chip
  const handleRemoveClass = (clsToRemove: string) => {
    if (editClasses.length > 1) {
      setEditClasses((prev) => prev.filter((c) => c !== clsToRemove));
    } else {
      showToast('Học sinh phải theo học ít nhất một lớp.');
    }
  };

  // Add class by typing and pressing Enter or clicking Add
  const handleAddNewClass = () => {
    const val = newClassInput.trim();
    if (!val) return;
    if (editClasses.includes(val)) {
      showToast(`Lớp "${val}" đã có trong danh sách.`);
      return;
    }
    setEditClasses((prev) => [...prev, val]);
    setNewClassInput('');
  };

  const handleClassInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop form submission
      handleAddNewClass();
    }
  };

  // Soft Delete confirmation action
  const handleConfirmSoftDelete = () => {
    if (!softDeleteTarget) return;
    const student = softDeleteTarget;
    const today = '09/11/2026';
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    setTrashList((prev) => [
      { ...student, isDeleted: true, deletedDate: today },
      ...prev,
    ]);
    setSoftDeleteTarget(null);
    showToast(`Đã chuyển học sinh ${student.fullName} vào thùng rác.`);
  };

  // Restore
  const handleRestore = (student: StudentRecord) => {
    setTrashList((prev) => prev.filter((s) => s.id !== student.id));
    setStudents((prev) => [
      { ...student, isDeleted: false, status: 'Đang học' },
      ...prev,
    ]);
    showToast(`Đã khôi phục học sinh ${student.fullName} vào danh sách.`);
  };

  // Permanent Delete
  const handleConfirmPermanentDelete = () => {
    if (!permanentDeleteTarget) return;
    const name = permanentDeleteTarget.fullName;
    setTrashList((prev) => prev.filter((s) => s.id !== permanentDeleteTarget.id));
    setPermanentDeleteTarget(null);
    showToast(`Đã xóa vĩnh viễn học sinh ${name} khỏi cơ sở dữ liệu.`);
  };

  // Add Student Submit
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: StudentRecord = {
      id: Date.now(),
      studentCode: newCode,
      fullName: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      classes: [newClass],
      gender: newGender,
      parentPhone: newPhone || '0900 111 000',
      status: newStatus,
    };

    setStudents((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    showToast(`Đã thêm học sinh ${created.fullName} thành công!`);
  };

  // Filtered List
  const displayStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentPhone.includes(searchQuery);

      const matchClass =
        selectedClass === 'ALL' || s.classes.includes(selectedClass);

      const matchStatus =
        selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  // Trash Filtered
  const filteredTrashList = useMemo(() => {
    return trashList.filter((s) => {
      const q = trashSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.parentPhone.includes(q) ||
        (s.deletedDate && s.deletedDate.includes(q)) ||
        s.classes.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [trashList, trashSearchQuery]);

  const trashTotal = filteredTrashList.length;
  const trashPageSize = 10;
  const trashTotalPages = Math.max(1, Math.ceil(trashTotal / trashPageSize));
  const displayedTrashRows = useMemo(() => {
    const startIndex = (trashPage - 1) * trashPageSize;
    return filteredTrashList.slice(startIndex, startIndex + trashPageSize);
  }, [filteredTrashList, trashPage]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full max-w-[1136px] min-h-[976px] p-8 mx-auto flex flex-col justify-between gap-6 box-border select-none bg-brand-page text-brand-text font-nunito relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ==================== ROW 1: HEADER (88px) ==================== */}
        <header className="h-[88px] flex items-center justify-between relative flex-shrink-0">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <h1 className="font-serif-title text-[28px] font-bold text-brand-text leading-tight">
                Học sinh
              </h1>
              {activeTab === 'TRASH' ? (
                <Badge variant="studying" className="px-3 py-1 text-[13px] tracking-wide">
                  {trashList.length} trong thùng rác
                </Badge>
              ) : (
                <Badge variant="studying" className="px-3 py-1 text-[13px] tracking-wide">
                  42 học sinh
                </Badge>
              )}
            </div>

            {/* Signature margin note with hand-drawn squiggle underline */}
            <div className="flex items-center gap-4 mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-serif-title italic text-[15px] font-semibold text-brand-pinkText squiggle-underline-note">
                  {activeTab === 'TRASH'
                    ? '“Thùng rác giữ học sinh đã xóa, khôi phục được bất cứ lúc nào.”'
                    : '“Nhập đủ số điện thoại phụ huynh để gửi nhắc học phí nhé!”'}
                </span>
              </div>

              {/* STICKERS */}
              <div className="flex items-center gap-2 pl-6">
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

          {/* Right: Primary Button "Thêm học sinh" using shadcn Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="raspberry"
              onClick={() => setIsAddModalOpen(true)}
              className="h-[44px] px-5 rounded-[12px] gap-2 shadow-sm active:scale-95 text-[14px]"
            >
              <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span>Thêm học sinh</span>
            </Button>
          </div>
        </header>

        {/* ==================== ROW 2: TAB BAR (44px) ==================== */}
        <div className="h-[44px] flex items-center gap-3 flex-shrink-0">
          <Button
            variant={activeTab === 'LIST' ? 'blueAction' : 'secondary'}
            onClick={() => handleTabChange('LIST')}
            className={`h-[40px] px-4 rounded-[12px] text-[14px] font-bold gap-2 ${
              activeTab === 'LIST' ? 'shadow-xs' : 'hover:bg-[#dbeafe]'
            }`}
          >
            <span>Danh sách</span>
            <span
              className={`text-[12px] px-2 py-0.5 rounded-[10px] font-bold ${
                activeTab === 'LIST' ? 'bg-white/20 text-white' : 'bg-white text-[#1F4E79]'
              }`}
            >
              42
            </span>
          </Button>

          <Button
            variant={activeTab === 'TRASH' ? 'blueAction' : 'secondary'}
            onClick={() => handleTabChange('TRASH')}
            className={`h-[40px] px-4 rounded-[12px] text-[14px] font-bold gap-2 ${
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
              {trashList.length}
            </span>
          </Button>
        </div>

        {/* ==================== ROW 3: ONE TABLE CARD (732px) ==================== */}
        <section className="h-[732px] bg-white border border-[#F3D9E3] rounded-[12px] shadow-card flex flex-col justify-between overflow-hidden flex-shrink-0">
          {activeTab === 'TRASH' ? (
            /* ========================= TRASH STATE VIEW ========================= */
            <>
              {/* TOP ROW (80px) */}
              <div className="h-[80px] px-6 flex items-center justify-between gap-6 border-b border-[#F3D9E3] flex-shrink-0 bg-white">
                <div className="flex-1 h-[52px] px-4 rounded-[12px] bg-[#E9F3FF] border border-[#CFE8FF] flex items-center gap-3">
                  <Info className="w-5 h-5 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                  <p className="text-[13px] font-medium text-[#1F4E79] leading-snug">
                    Học sinh trong thùng rác chỉ bị ẩn khỏi hệ thống. Khôi phục để dùng lại, hoặc xóa vĩnh viễn để xóa hẳn khỏi dữ liệu (không thể hoàn tác).
                  </p>
                </div>

                <div className="relative w-[340px] flex-shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C6B84] pointer-events-none" />
                  <Input
                    placeholder="Tìm trong thùng rác…"
                    value={trashSearchQuery}
                    onChange={(e) => {
                      setTrashSearchQuery(e.target.value);
                      setTrashPage(1);
                    }}
                    className="h-[48px] pl-10 pr-9 rounded-[12px] text-[14px]"
                  />
                  {trashSearchQuery && (
                    <button
                      onClick={() => {
                        setTrashSearchQuery('');
                        setTrashPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="flex-1 flex flex-col justify-start overflow-hidden">
                <div className="h-[48px] bg-[#DCEBFA] text-[#1F4E79] px-6 grid grid-cols-[110px_1.2fr_130px_90px_160px_110px_230px] items-center text-[13px] font-semibold select-none flex-shrink-0">
                  <div>Mã học sinh</div>
                  <div>Họ và tên</div>
                  <div>Lớp</div>
                  <div className="text-center">Giới tính</div>
                  <div>Số điện thoại phụ huynh</div>
                  <div>Ngày xóa</div>
                  <div className="text-right pr-2">Thao tác</div>
                </div>

                <div className="flex-1 flex flex-col justify-between overflow-hidden divide-y divide-[#F3D9E3]">
                  {displayedTrashRows.map((student) => (
                    <div
                      key={student.id}
                      className="flex-1 px-6 grid grid-cols-[110px_1.2fr_130px_90px_160px_110px_230px] items-center text-[14px] bg-white hover:bg-[#FFF6F9] transition-colors"
                    >
                      <div className="font-mono text-[13px] font-bold text-brand-text">
                        {student.studentCode}
                      </div>

                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-9 h-9 rounded-[10px] bg-[#EFE9ED] text-[#6B5560] font-bold text-[13px] flex items-center justify-center flex-shrink-0">
                          {getInitials(student.fullName)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-brand-text leading-tight truncate">
                            {student.fullName}
                          </span>
                          <span className="text-[12px] text-brand-subtext leading-none mt-0.5 truncate">
                            {student.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {student.classes.map((cls, cIdx) => (
                          <Badge key={cIdx} variant="classChip">
                            {cls}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-center font-semibold text-brand-text text-[13px]">
                        {student.gender}
                      </div>

                      <div className="font-mono text-[13px] font-semibold text-brand-text">
                        {student.parentPhone}
                      </div>

                      <div className="text-[13px] font-medium text-brand-subtext font-mono">
                        {student.deletedDate || '03/11/2026'}
                      </div>

                      <div className="flex items-center justify-end gap-2 pr-1">
                        <Button
                          variant="outlineBlue"
                          size="sm"
                          onClick={() => handleRestore(student)}
                          className="gap-1.5 h-8 px-3 rounded-[10px]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                          <span>Khôi phục</span>
                        </Button>

                        <Button
                          variant="deletePermanent"
                          size="sm"
                          onClick={() => setPermanentDeleteTarget(student)}
                          className="gap-1.5 h-8 px-2.5 rounded-[10px]"
                        >
                          <Trash2 className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                          <span>Xóa vĩnh viễn</span>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {displayedTrashRows.length < 10 &&
                    Array.from({ length: 10 - displayedTrashRows.length }).map((_, pIdx) => (
                      <div
                        key={`empty-${pIdx}`}
                        className="flex-1 px-6 grid grid-cols-[110px_1.2fr_130px_90px_160px_110px_230px] items-center text-[14px] bg-white opacity-0 pointer-events-none select-none"
                      >
                        <div>-</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* FOOTER */}
              <div className="h-[52px] px-6 border-t border-[#F3D9E3] flex items-center justify-between flex-shrink-0 bg-white">
                <span className="text-[13px] font-semibold text-brand-subtext">
                  {trashTotal > 0
                    ? `Hiển thị ${(trashPage - 1) * trashPageSize + 1}–${Math.min(
                        trashPage * trashPageSize,
                        trashTotal
                      )} trên ${trashTotal} học sinh`
                    : 'Không tìm thấy học sinh nào trong thùng rác'}
                </span>

                <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-subtext">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTrashPage((p) => Math.max(1, p - 1))}
                    disabled={trashPage === 1}
                    className="w-8 h-8 rounded-[10px]"
                  >
                    ‹
                  </Button>

                  <Button
                    variant={trashPage === 1 ? 'blueAction' : 'ghost'}
                    size="icon"
                    onClick={() => setTrashPage(1)}
                    className="w-8 h-8 rounded-[10px] text-[13px]"
                  >
                    1
                  </Button>

                  {trashTotalPages >= 2 && (
                    <Button
                      variant={trashPage === 2 ? 'blueAction' : 'ghost'}
                      size="icon"
                      onClick={() => setTrashPage(2)}
                      className="w-8 h-8 rounded-[10px] text-[13px]"
                    >
                      2
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTrashPage((p) => Math.min(trashTotalPages, p + 1))}
                    disabled={trashPage >= trashTotalPages}
                    className="w-8 h-8 rounded-[10px]"
                  >
                    ›
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* ========================= LIST STATE VIEW ========================= */
            <>
              {/* TOOLBAR */}
              <div className="h-[72px] px-6 flex items-center gap-4 border-b border-[#F3D9E3] flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C6B84] pointer-events-none" />
                  <Input
                    placeholder="Tìm theo tên, mã học sinh, email, số điện thoại phụ huynh…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-[48px] pl-10 pr-4 rounded-[12px] text-[14px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-[180px] h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 cursor-pointer"
                >
                  <option value="ALL">Tất cả các lớp</option>
                  <option value="Văn 7C">Văn 7C</option>
                  <option value="Văn 8B">Văn 8B</option>
                  <option value="Văn 9A">Văn 9A</option>
                  <option value="Luyện thi vào 10">Luyện thi vào 10</option>
                  <option value="Văn 10 nâng cao">Văn 10 nâng cao</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-[180px] h-[48px] px-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="Đang học">Đang học</option>
                  <option value="Bảo lưu">Bảo lưu</option>
                  <option value="Nghỉ học">Nghỉ học</option>
                </select>
              </div>

              {/* TABLE CONTAINER */}
              <div className="flex-1 flex flex-col justify-start overflow-hidden">
                <div className="h-[48px] bg-[#DCEBFA] text-[#1F4E79] px-6 grid grid-cols-[105px_1.2fr_135px_80px_155px_130px_120px] items-center text-[13px] font-semibold select-none flex-shrink-0">
                  <div>Mã học sinh</div>
                  <div>Họ và tên</div>
                  <div>Lớp</div>
                  <div className="text-center">Giới tính</div>
                  <div>Số điện thoại phụ huynh</div>
                  <div>Trạng thái</div>
                  <div className="text-right pr-2">Thao tác</div>
                </div>

                <div className="divide-y divide-[#F3D9E3] overflow-hidden">
                  {displayStudents.slice(0, 10).map((student, idx) => {
                    const isEven = idx % 2 === 1;
                    const avatarBgClass = isEven
                      ? 'bg-[#DCEBFA] text-[#1F4E79]'
                      : 'bg-[#FFE0EB] text-brand-pinkText';

                    return (
                      <div
                        key={student.id}
                        className="h-[56px] px-6 grid grid-cols-[105px_1.2fr_135px_80px_155px_130px_120px] items-center text-[14px] bg-white hover:bg-[#FFF6F9] transition-colors"
                      >
                        <div className="font-mono text-[13px] font-bold text-brand-text">
                          {student.studentCode}
                        </div>

                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`w-9 h-9 rounded-[10px] ${avatarBgClass} font-bold text-[13px] flex items-center justify-center flex-shrink-0`}
                          >
                            {getInitials(student.fullName)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-brand-text leading-tight truncate">
                              {student.fullName}
                            </span>
                            <span className="text-[12px] text-brand-subtext leading-none mt-0.5 truncate">
                              {student.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {student.classes.map((cls, cIdx) => (
                            <Badge key={cIdx} variant="classChip">
                              {cls}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-center font-semibold text-brand-text text-[13px]">
                          {student.gender}
                        </div>

                        <div className="font-mono text-[13px] font-semibold text-brand-text">
                          {student.parentPhone}
                        </div>

                        {/* Status badge with strictly 10-12px radius, NEVER WRAPS */}
                        <div className="flex items-center min-w-0">
                          {student.status === 'Đang học' && (
                            <Badge variant="studying" className="px-3 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Đang học</span>
                            </Badge>
                          )}
                          {student.status === 'Bảo lưu' && (
                            <Badge variant="reserved" className="px-3 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap">
                              <Pause className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Bảo lưu</span>
                            </Badge>
                          )}
                          {student.status === 'Nghỉ học' && (
                            <Badge variant="leave" className="px-3 py-1 font-bold text-[12px] rounded-[10px] whitespace-nowrap">
                              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Nghỉ học</span>
                            </Badge>
                          )}
                        </div>

                        {/* Actions with shadcn Buttons and Tooltip */}
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingStudent(student)}
                            title="Xem thông tin"
                            className="w-9 h-9 text-[#1F4E79] hover:bg-[#E9F3FF]"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.75} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(student)}
                            title="Sửa học sinh"
                            className="w-9 h-9 text-[#1F4E79] hover:bg-[#E9F3FF]"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={1.75} />
                          </Button>

                          {/* Tooltip on row 4 using shadcn Tooltip */}
                          {student.studentCode === 'HS0004' ? (
                            <Tooltip defaultOpen>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSoftDeleteTarget(student)}
                                  className="w-9 h-9 text-brand-pinkText hover:bg-[#FFE0EB]"
                                >
                                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <span>Chuyển vào thùng rác</span>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSoftDeleteTarget(student)}
                              title="Xóa vào thùng rác"
                              className="w-9 h-9 text-brand-pinkText hover:bg-[#FFE0EB]"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER */}
              <div className="h-[52px] px-6 border-t border-[#F3D9E3] flex items-center justify-between flex-shrink-0 bg-white">
                <span className="text-[13px] font-semibold text-brand-subtext">
                  Hiển thị 1–10 trên 42 học sinh
                </span>

                <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-subtext">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[10px]">
                    ‹
                  </Button>
                  <Button variant="blueAction" size="icon" className="w-8 h-8 rounded-[10px] text-[13px] font-bold">
                    1
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[10px] text-[13px] font-semibold">
                    2
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[10px] text-[13px] font-semibold">
                    3
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[10px] text-[13px] font-semibold">
                    4
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[10px] text-[13px] font-semibold">
                    5
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[10px]">
                    ›
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ========================================================================= */}
        {/* ======= SHADCN UI CONFIRMATION DIALOG: CHUYỂN VÀO THÙNG RÁC (EXACT) ======= */}
        {/* ========================================================================= */}
        <Dialog
          open={!!softDeleteTarget}
          onOpenChange={(open) => !open && setSoftDeleteTarget(null)}
        >
          <DialogContent className="sm:max-w-[440px] w-full p-6 bg-white border border-[#F3D9E3] rounded-[12px] shadow-[0_16px_40px_rgba(59,42,53,0.16)] text-left space-y-0">
            {/* Top: 48px round icon chip with 12px radius (#DCEBFA background, trash icon #1F4E79) */}
            <div className="w-12 h-12 rounded-[12px] bg-[#DCEBFA] flex items-center justify-center text-[#1F4E79] mb-4">
              <Trash2 className="w-6 h-6 text-[#1F4E79]" strokeWidth={1.75} />
            </div>

            <DialogHeader className="text-left space-y-2 p-0">
              {/* Title in Playfair Display 22px */}
              <DialogTitle className="font-serif-title text-[22px] font-bold text-brand-text leading-snug">
                Chuyển {softDeleteTarget?.fullName || 'Nguyễn Minh Anh'} vào thùng rác?
              </DialogTitle>

              {/* Body in Nunito 14px #3B2A35 */}
              <DialogDescription className="font-nunito text-[14px] text-[#3B2A35] leading-relaxed">
                Học sinh sẽ bị ẩn khỏi danh sách, lịch học và điểm danh. Bạn có thể khôi phục trong mục Thùng rác bất cứ lúc nào.
              </DialogDescription>
            </DialogHeader>

            {/* Buttons, right-aligned, 48px high: "Hủy" (#6B5560) and "Chuyển vào thùng rác" (filled #2F6FA8, white text) */}
            <DialogFooter className="mt-6 pt-2 flex sm:justify-end items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSoftDeleteTarget(null)}
                className="h-[48px] px-5 rounded-[12px] text-[14px] font-bold text-[#6B5560] hover:text-brand-text hover:bg-slate-50"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="blueAction"
                onClick={handleConfirmSoftDelete}
                className="h-[48px] px-5 rounded-[12px] text-[14px] font-bold text-white bg-[#2F6FA8] hover:bg-[#255784] shadow-sm"
              >
                Chuyển vào thùng rác
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* ============ SHADCN UI POP-UP (MODAL): SỬA HỌC SINH (GỌN GÀNG) ============ */}
        {/* ========================================================================= */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[540px] max-h-[88vh] p-5 sm:p-6 bg-white border border-[#F3D9E3] rounded-[12px] shadow-2xl flex flex-col justify-between overflow-hidden">
            <DialogHeader className="text-left space-y-0.5 flex-shrink-0">
              <DialogTitle className="font-serif-title text-[20px] font-bold text-brand-text">
                Sửa học sinh
              </DialogTitle>
              <DialogDescription className="text-[13px] font-semibold text-[#6B5560]">
                {editCode} · {editName}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleEditSubmit}
              className="flex-1 overflow-y-auto pr-1 py-1 space-y-3.5 my-1"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Field 1: Mã học sinh (read-only) */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Mã học sinh</Label>
                  <Input
                    value={editCode}
                    readOnly
                    className="h-10 rounded-[10px] bg-[#FFF6F9] font-mono font-bold text-[#6B5560] cursor-not-allowed select-none text-xs"
                  />
                </div>

                {/* Field 2: Giới tính (segmented control) */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Giới tính</Label>
                  <div className="w-full h-10 p-1 rounded-[10px] border border-[#9C6B84] bg-white flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditGender('Nam')}
                      className={`flex-1 h-full rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
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
                      className={`flex-1 h-full rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                        editGender === 'Nữ'
                          ? 'bg-[#2F6FA8] text-white shadow-2xs'
                          : 'text-[#6B5560] hover:text-brand-text hover:bg-slate-50'
                      }`}
                    >
                      Nữ
                    </button>
                  </div>
                </div>

                {/* Field 3: Họ và tên (focused outline 2px #2F6FA8) */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Họ và tên</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    autoFocus
                    className="h-10 rounded-[10px] border-[#2F6FA8] font-bold text-brand-text ring-2 ring-[#2F6FA8]/20 focus-visible:ring-[#2F6FA8] text-xs"
                  />
                </div>

                {/* Field 4: Email */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Email</Label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="h-10 rounded-[10px] text-xs"
                  />
                </div>

                {/* Field 5: Số điện thoại phụ huynh */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Số điện thoại phụ huynh</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="h-10 rounded-[10px] font-mono font-semibold text-xs"
                  />
                </div>

                {/* Field 6: Trạng thái */}
                <div className="space-y-1">
                  <Label className="text-[12px] font-bold text-brand-text">Trạng thái</Label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as 'Đang học' | 'Bảo lưu' | 'Nghỉ học')
                    }
                    className="w-full h-10 px-3 rounded-[10px] border border-[#9C6B84] bg-white text-xs font-semibold text-brand-text focus:outline-none focus:border-[#2F6FA8] focus:ring-2 focus:ring-[#2F6FA8]/20 transition-all cursor-pointer"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Bảo lưu">Bảo lưu</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>

                {/* Field 7: Lớp (full width col-span-2) với input tự nhập rồi nhấn Enter */}
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-bold text-brand-text">Lớp học</Label>
                    <span className="text-[11px] font-medium text-[#6B5560]">
                      Nhập tên lớp rồi nhấn <kbd className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-slate-700">Enter</kbd>
                    </span>
                  </div>
                  <div className="w-full min-h-[42px] px-2.5 py-1.5 rounded-[10px] border border-[#9C6B84] bg-white flex flex-wrap items-center gap-1.5 focus-within:border-[#2F6FA8] focus-within:ring-2 focus-within:ring-[#2F6FA8]/20 transition-all">
                    {editClasses.map((cls) => (
                      <Badge
                        key={cls}
                        variant="studying"
                        className="gap-1 px-2.5 py-0.5 text-xs rounded-[10px] animate-in fade-in zoom-in-95"
                      >
                        <span>{cls}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(cls)}
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
                        value={newClassInput}
                        onChange={(e) => setNewClassInput(e.target.value)}
                        onKeyDown={handleClassInputKeyDown}
                        placeholder="+ Thêm lớp (ví dụ: Văn 9B, Ôn thi...) rồi nhấn Enter"
                        className="flex-1 h-7 bg-transparent px-1 text-xs text-brand-text placeholder:text-[#6B5560]/60 focus:outline-none"
                      />
                      {newClassInput.trim() && (
                        <Button
                          type="button"
                          variant="blueAction"
                          size="sm"
                          onClick={handleAddNewClass}
                          className="h-6 px-2 text-[11px] rounded-[10px]"
                        >
                          Thêm
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer inside form to submit easily */}
              <DialogFooter className="pt-3 border-t border-[#F3D9E3] flex sm:justify-between items-center w-full gap-3 flex-shrink-0 mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-[#6B5560] font-bold text-[13px] h-10 px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="raspberry"
                  className="h-10 px-5 rounded-[10px] text-[13px] font-bold"
                >
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ==================== SHADCN UI POP-UP: THÊM HỌC SINH ==================== */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[480px] p-6 sm:p-7 bg-white border border-[#F3D9E3] rounded-[12px] shadow-lg">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="font-serif-title text-2xl font-bold text-brand-text">
                Thêm học sinh mới
              </DialogTitle>
              <DialogDescription className="font-nunito text-sm text-brand-subtext">
                Điền thông tin học sinh để ghi danh vào các lớp của cô Vân.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-brand-subtext">Mã học sinh</Label>
                  <Input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="h-10 rounded-[12px] font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-brand-subtext">Giới tính</Label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'Nữ' | 'Nam')}
                    className="w-full h-10 px-3 rounded-[12px] border border-[#9C6B84] bg-white text-sm font-semibold text-brand-text focus:outline-none"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-subtext">Họ và tên học sinh *</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  required
                  className="h-10 rounded-[12px] font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-subtext">Email học sinh</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="minhanh@gmail.com"
                  className="h-10 rounded-[12px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-brand-subtext">Lớp học ban đầu *</Label>
                  <Input
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="Ví dụ: Văn 9A, Ôn thi vào 10..."
                    required
                    className="h-10 rounded-[12px] font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-brand-subtext">SĐT phụ huynh *</Label>
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0900 111 xxx"
                    required
                    className="h-10 rounded-[12px] font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-brand-subtext">Trạng thái ban đầu</Label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as 'Đang học' | 'Bảo lưu' | 'Nghỉ học')
                  }
                  className="w-full h-10 px-3 rounded-[12px] border border-[#9C6B84] bg-white text-sm font-semibold text-brand-text focus:outline-none"
                >
                  <option value="Đang học">Đang học</option>
                  <option value="Bảo lưu">Bảo lưu</option>
                  <option value="Nghỉ học">Nghỉ học</option>
                </select>
              </div>

              <DialogFooter className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4 rounded-[12px]"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="raspberry"
                  className="h-10 px-5 rounded-[12px]"
                >
                  Thêm học sinh
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ==================== SHADCN UI POP-UP: XÁC NHẬN XÓA VĨNH VIỄN ==================== */}
        <Dialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
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
                ({permanentDeleteTarget?.studentCode}) khỏi cơ sở dữ liệu? Hành động này{' '}
                <span className="font-bold text-[#B02525]">không thể hoàn tác</span>.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPermanentDeleteTarget(null)}
                className="h-10 px-4 rounded-[12px]"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmPermanentDelete}
                className="h-10 px-4 rounded-[12px] gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa vĩnh viễn</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ==================== SHADCN UI POP-UP: XEM THÔNG TIN ==================== */}
        <Dialog open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)}>
          <DialogContent className="sm:max-w-[460px] p-6 sm:p-7 bg-white border border-[#F3D9E3] rounded-[12px] shadow-lg">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="font-serif-title text-2xl font-bold text-brand-text">
                Hồ sơ học sinh
              </DialogTitle>
              <DialogDescription className="font-nunito text-sm text-brand-subtext">
                Thông tin chi tiết của học sinh trong hệ thống Lớp Văn chị Vân.
              </DialogDescription>
            </DialogHeader>

            {viewingStudent && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 p-4 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3]">
                  <div className="w-12 h-12 rounded-[10px] bg-[#FFE0EB] text-brand-pinkText font-bold text-base flex items-center justify-center flex-shrink-0">
                    {getInitials(viewingStudent.fullName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-base leading-tight">
                      {viewingStudent.fullName}
                    </h3>
                    <p className="text-xs text-brand-subtext mt-0.5">{viewingStudent.email}</p>
                    <Badge variant="studying" className="mt-1.5">
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

                <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-brand-subtext block mb-1">SĐT phụ huynh</span>
                  <span className="font-mono font-bold text-brand-text text-sm">
                    {viewingStudent.parentPhone}
                  </span>
                </div>

                <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-brand-subtext block mb-1.5">Lớp đang theo học</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingStudent.classes.map((cls, idx) => (
                      <Badge key={idx} variant="classChip">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    variant="blueAction"
                    onClick={() => setViewingStudent(null)}
                    className="w-full h-10 rounded-[10px]"
                  >
                    Đóng hồ sơ
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
