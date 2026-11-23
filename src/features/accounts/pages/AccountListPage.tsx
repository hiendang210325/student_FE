import React, { useState, useEffect, useCallback } from 'react';
import { CreateAccountModal } from '../components/CreateAccountModal';
import { CredentialCardModal } from '../components/CredentialCardModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { TrashConfirmModal, TrashConfirmStudent } from '../components/TrashConfirmModal';
import {
  PermanentDeleteModal,
  PermanentDeleteStudent,
} from '../components/PermanentDeleteModal';
import { AccountDetailModal, AccountDetailInfo } from '../components/AccountDetailModal';
import { accountApi } from '../api/accountApi';
import { AccountStats } from '../types/account.types';
import {
  Search,
  Plus,
  Users,
  Check,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  Mail,
  Trash2,
  Clock,
  RotateCw,
  RotateCcw,
  Phone,
  Info,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface StudentAccountRow {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  className: string;
  status: 'Hoạt động' | 'Tạm khóa' | 'Chưa kích hoạt';
  lastLogin: string;
  avatarBg: string;
  avatarText: string;
}

interface TrashStudentRow {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  className: string;
  deletedDate: string;
}

/**
 * Định dạng thời gian đăng nhập cuối thân thiện, tự nhiên
 */
const formatLastLogin = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Chưa đăng nhập';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Chưa đăng nhập';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  // Hôm nay
  if (d.toDateString() === now.toDateString()) {
    return `Hôm nay ${hours}:${minutes}`;
  }

  // Hôm qua
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Hôm qua ${hours}:${minutes}`;
  }

  // Trong 7 ngày
  if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays} ngày trước`;
  }

  // Khác: DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const AccountListPage: React.FC = () => {
  // Trạng thái tab: 'accounts' (Tài khoản) | 'trash' (Thùng rác)
  const [activeTab, setActiveTab] = useState<'accounts' | 'trash'>('accounts');

  // 1. DỮ LIỆU & BỘ LỌC TAB TÀI KHOẢN
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [accounts, setAccounts] = useState<StudentAccountRow[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  // Thống kê KPI
  const [stats, setStats] = useState<AccountStats>({
    total: 0,
    active: 0,
    locked: 0,
    unverified: 0,
    trash: 0,
  });

  // 2. DỮ LIỆU & BỘ LỌC TAB THÙNG RÁC
  const [trashSearch, setTrashSearch] = useState('');
  const [trashPage, setTrashPage] = useState(1);
  const [trashPageSize, setTrashPageSize] = useState(10);
  const [totalTrash, setTotalTrash] = useState(0);
  const [totalTrashPages, setTotalTrashPages] = useState(1);
  const [trashRows, setTrashRows] = useState<TrashStudentRow[]>([]);
  const [isLoadingTrash, setIsLoadingTrash] = useState(false);
  const [trashError, setTrashError] = useState<string | null>(null);

  // 3. TRẠNG THÁI MODALS
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCredentialCard, setActiveCredentialCard] = useState<{
    id: string;
    fullName: string;
    studentCode: string;
    email?: string;
    className?: string;
    temporaryPassword?: string;
  } | null>(null);
  const [viewingAccountDetail, setViewingAccountDetail] = useState<AccountDetailInfo | null>(null);
  const [activeResetModal, setActiveResetModal] = useState<{
    id: string;
    fullName: string;
    studentCode: string;
    email: string;
  } | null>(null);
  const [trashConfirmStudent, setTrashConfirmStudent] = useState<TrashConfirmStudent | null>(null);
  const [permanentDeleteStudent, setPermanentDeleteStudent] = useState<PermanentDeleteStudent | null>(null);

  // 4. TRẠNG THÁI HÀNH ĐỘNG & THÔNG BÁO
  const [isSubmittingTrash, setIsSubmittingTrash] = useState(false);
  const [isSubmittingPermDelete, setIsSubmittingPermDelete] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleViewAccountDetail = (row: StudentAccountRow) => {
    setViewingAccountDetail({
      id: row.id,
      name: row.name,
      code: row.code,
      email: row.email,
      phone: row.phone,
      className: row.className,
      status: row.status,
      lastLogin: row.lastLogin,
      avatarBg: row.avatarBg,
      avatarText: row.avatarText,
    });
  };

  /**
   * Gọi API lấy danh sách tài khoản học sinh + Thống kê KPI
   */
  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    setAccountsError(null);
    try {
      const res = await accountApi.getAccounts({
        page: currentPage,
        limit: pageSize,
        search: search.trim() || undefined,
        className: selectedClass !== 'all' ? selectedClass : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });

      const data = res.data;
      const rawItems = data?.items || [];
      const mapped: StudentAccountRow[] = rawItems.map((item, index) => {
        const isLocked = item.status === 'locked';
        const isUnverified = !item.isEmailVerified;
        const status: 'Hoạt động' | 'Tạm khóa' | 'Chưa kích hoạt' = isLocked
          ? 'Tạm khóa'
          : isUnverified
          ? 'Chưa kích hoạt'
          : 'Hoạt động';

        return {
          id: item.id,
          name: item.fullName,
          code: item.studentCode || item.username.toUpperCase(),
          email: item.email || 'Chưa cập nhật email',
          phone: item.phoneNumber || '—',
          className:
            item.className ||
            (item.classes && item.classes.length > 0 ? item.classes[0] : 'Chưa xếp lớp'),
          status,
          lastLogin: formatLastLogin(item.lastLoginAt),
          avatarBg: index % 2 === 0 ? '#FFE0EB' : '#DCEBFA',
          avatarText: index % 2 === 0 ? '#A61E4D' : '#1F4E79',
        };
      });

      const resolvedTotalPages = Math.max(
        1,
        data?.totalPages ?? Math.ceil((data?.total || mapped.length) / pageSize)
      );
      const resolvedPage = data?.page ?? Math.min(currentPage, resolvedTotalPages);
      setAccounts(mapped);
      setTotalAccounts(data?.total ?? mapped.length);
      setTotalPages(resolvedTotalPages);
      if (resolvedPage !== currentPage) {
        setCurrentPage(resolvedPage);
      }
      if (data?.stats) {
        setStats({
          total: data.stats.total ?? mapped.length,
          active: data.stats.active ?? 0,
          locked: data.stats.locked ?? 0,
          unverified: data.stats.unverified ?? 0,
          trash: data.stats.trash ?? 0,
          classes: data.stats.classes ?? [],
        });
      }
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách tài khoản:', err);
      setAccountsError('Không thể kết nối đến máy chủ API.');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [currentPage, pageSize, search, selectedClass, selectedStatus]);

  /**
   * Gọi API lấy danh sách tài khoản trong thùng rác
   */
  const fetchTrash = useCallback(async () => {
    setIsLoadingTrash(true);
    setTrashError(null);
    try {
      const res = await accountApi.getTrashAccounts({
        page: trashPage,
        limit: trashPageSize,
        search: trashSearch.trim() || undefined,
      });

      const data = res.data;
      const rawItems = data?.items || [];
      const mapped: TrashStudentRow[] = rawItems.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        email: item.email || 'Chưa cập nhật email',
        phone: item.phone || '—',
        className: item.className || 'Chưa xếp lớp',
        deletedDate: item.deletedDate || '—',
      }));

      const resolvedTrashPages = Math.max(
        1,
        data?.totalPages ?? Math.ceil((data?.total || mapped.length) / trashPageSize)
      );
      const resolvedTrashPage = data?.page ?? Math.min(trashPage, resolvedTrashPages);
      setTrashRows(mapped);
      setTotalTrash(data?.total ?? mapped.length);
      setTotalTrashPages(resolvedTrashPages);
      if (resolvedTrashPage !== trashPage) {
        setTrashPage(resolvedTrashPage);
      }
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách thùng rác:', err);
      setTrashError('Không thể kết nối máy chủ để lấy danh sách thùng rác.');
    } finally {
      setIsLoadingTrash(false);
    }
  }, [trashPage, trashPageSize, trashSearch]);

  // Tải dữ liệu khi mở trang hoặc thay đổi bộ lọc
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrash();
    }
  }, [activeTab, fetchTrash]);

  // Đổi trang hoặc bộ lọc -> reset về trang 1
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleTrashSearchChange = (val: string) => {
    setTrashSearch(val);
    setTrashPage(1);
  };

  // Mở hộp thoại xác nhận chuyển vào thùng rác
  const handleOpenTrashConfirm = (row: StudentAccountRow) => {
    setTrashConfirmStudent({
      id: row.id,
      name: row.name,
      code: row.code,
      className: row.className,
      email: row.email,
    });
  };

  // Mở hộp thoại xác nhận xóa vĩnh viễn
  const handleOpenPermanentDelete = (row: TrashStudentRow) => {
    setPermanentDeleteStudent({
      id: row.id,
      name: row.name,
      code: row.code,
      className: row.className,
      email: row.email,
    });
  };

  // Thao tác 1: Khóa / Mở khóa tài khoản học sinh
  const handleToggleLock = async (row: StudentAccountRow) => {
    const isCurrentlyLocked = row.status === 'Tạm khóa';
    const targetStatus = isCurrentlyLocked ? 'active' : 'locked';
    setActionLoadingId(row.id);
    try {
      await accountApi.toggleStatus(row.id, targetStatus);
      showToast(`Đã ${isCurrentlyLocked ? 'mở khóa' : 'tạm khóa'} tài khoản học sinh "${row.name}"`);
      await fetchAccounts();
    } catch (err: unknown) {
      console.error('Lỗi khi đổi trạng thái khóa:', err);
      showToast('Không thể cập nhật trạng thái khóa tài khoản lúc này.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Thao tác 2: Chuyển tài khoản vào thùng rác (Xóa mềm)
  const handleConfirmMoveToTrash = async () => {
    if (!trashConfirmStudent) return;
    setIsSubmittingTrash(true);
    try {
      await accountApi.softDeleteAccount(trashConfirmStudent.id);
      const shouldStepBack = accounts.length === 1 && currentPage > 1;
      showToast(`Đã chuyển tài khoản "${trashConfirmStudent.name}" vào thùng rác`);
      setTrashConfirmStudent(null);
      if (shouldStepBack) {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else {
        await fetchAccounts();
      }
      if (activeTab === 'trash') {
        await fetchTrash();
      }
    } catch (err: unknown) {
      console.error('Lỗi khi chuyển tài khoản vào thùng rác:', err);
      showToast('Lỗi khi chuyển tài khoản vào thùng rác. Vui lòng thử lại.');
    } finally {
      setIsSubmittingTrash(false);
    }
  };

  // Thao tác 3: Khôi phục tài khoản từ thùng rác
  const handleRestore = async (row: TrashStudentRow) => {
    setActionLoadingId(row.id);
    try {
      await accountApi.restoreAccount(row.id);
      const shouldStepBackTrash = trashRows.length === 1 && trashPage > 1;
      showToast(`Đã khôi phục tài khoản "${row.name}" thành công!`);
      if (shouldStepBackTrash) {
        setTrashPage((p) => Math.max(1, p - 1));
      } else {
        await fetchTrash();
      }
      await fetchAccounts();
    } catch (err: unknown) {
      console.error('Lỗi khi khôi phục tài khoản:', err);
      showToast('Không thể khôi phục tài khoản lúc này.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Thao tác 4: Xóa vĩnh viễn khỏi hệ thống
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteStudent) return;
    setIsSubmittingPermDelete(true);
    try {
      await accountApi.permanentDeleteAccount(permanentDeleteStudent.id);
      const shouldStepBackTrash = trashRows.length === 1 && trashPage > 1;
      showToast(`Đã xóa vĩnh viễn tài khoản "${permanentDeleteStudent.name}" khỏi cơ sở dữ liệu`);
      setPermanentDeleteStudent(null);
      if (shouldStepBackTrash) {
        setTrashPage((p) => Math.max(1, p - 1));
      } else {
        await fetchTrash();
      }
      await fetchAccounts();
    } catch (err: unknown) {
      console.error('Lỗi khi xóa vĩnh viễn tài khoản:', err);
      showToast('Không thể xóa vĩnh viễn tài khoản lúc này.');
    } finally {
      setIsSubmittingPermDelete(false);
    }
  };

  // Thao tác 5: Làm mới toàn bộ dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSearch('');
    setTrashSearch('');
    setSelectedClass('all');
    setSelectedStatus('all');
    setCurrentPage(1);
    setTrashPage(1);
    try {
      await Promise.all([fetchAccounts(), fetchTrash()]);
      showToast('Đã đồng bộ và làm mới dữ liệu từ cơ sở dữ liệu');
    } catch {
      showToast('Đã làm mới dữ liệu.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full min-h-[1072px] bg-[#FFF6F9] font-nunito text-[#3B2A35] antialiased p-8 box-border selection:bg-[#FFE0EB] selection:text-[#A61E4D]">
      {/* Vùng chứa nội dung chuẩn 1136px */}
      <div className="w-[1136px] max-w-full mx-auto space-y-6">
        {/* ==========================================
            ROW 1: HEADER (88px)
            ========================================== */}
        <header className="h-[88px] flex items-center justify-between relative">
          {/* Nhãn tiêu đề và phụ đề */}
          <div className="space-y-1">
            <h1 className="font-playfair text-[28px] font-bold text-[#3B2A35] tracking-tight leading-tight">
              Tài khoản học sinh
            </h1>
            <p className="font-nunito text-[14px] text-[#6B5560] leading-none">
              Cấp tài khoản đăng nhập và quản lý phiên học trực tuyến của học sinh.
            </p>
          </div>

          {/* Điểm nhấn thương hiệu duy nhất: Ghi chú lề viết tay đặc trưng của giáo viên */}
          <div className="hidden xl:flex items-center mx-4">
            <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="bg-[#FBF6EA] px-3.5 py-1.5 rounded-lg border border-[#F8A5C2]/40 shadow-2xs">
                <span className="font-playfair italic font-medium text-[15px] text-[#A61E4D] squiggle-underline">
                  &ldquo;Xóa nhầm cũng không sao, thùng rác giữ lại cho chị nhé!&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Hình dán sticker pastel phẳng nhỏ 1: Ngôi sao xanh pastel */}
          <div
            className="absolute top-1 right-[268px] pointer-events-none select-none hidden lg:block"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#DCEBFA"
              className="opacity-90 transform rotate-12"
            >
              <path d="M12 2L14.8 8.6L22 9.3L16.6 14.1L18.2 21.2L12 17.5L5.8 21.2L7.4 14.1L2 9.3L9.2 8.6L12 2Z" />
            </svg>
          </div>

          {/* Hình dán sticker pastel phẳng nhỏ 2: Ngòi bút hồng pastel */}
          <div
            className="absolute bottom-1 right-[248px] pointer-events-none select-none hidden lg:block"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A61E4D"
              strokeWidth="1.75"
              className="opacity-75 transform -rotate-12"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" fill="#FFE0EB" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
            </svg>
          </div>

          {/* Các nút hành động góc phải */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Nút outline "Làm mới" */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 px-4 rounded-xl border border-[#9C6B84] text-[#3B2A35] font-nunito font-bold text-[14px] flex items-center gap-2 hover:bg-[#FFE0EB]/40 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              <RotateCw className={`w-4 h-4 text-[#3B2A35] ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              <span>Làm mới</span>
            </button>

            {/* Nút chính "Cấp tài khoản mới" */}
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#D6336C] hover:bg-[#C2255C] text-white font-nunito font-bold text-[14px] flex items-center gap-2 shadow-[0_4px_12px_rgba(214,51,108,0.25)] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2} />
              <span>Cấp tài khoản mới</span>
            </button>
          </div>
        </header>

        {/* ==========================================
            ROW 2: FOUR KPI TILES (96px, 4 TILES)
            ========================================== */}
        <section
          aria-label="Thống kê tài khoản"
          className="grid grid-cols-4 gap-6 h-[96px]"
        >
          {/* Ô 1: Tổng tài khoản */}
          <div className="h-[96px] bg-white rounded-[16px] border border-[#F3D9E3] p-4 flex items-center gap-3.5 box-border shadow-[0_2px_8px_rgba(214,51,108,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-[#DCEBFA] flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[#1F4E79]" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-[32px] font-bold text-[#3B2A35] leading-none">
                  {isLoadingAccounts && accounts.length === 0 ? '—' : stats.total}
                </span>
                <span className="font-nunito font-bold text-[14px] text-[#6B5560] leading-tight truncate">
                  Tổng tài khoản
                </span>
              </div>
              <span className="font-nunito text-[12px] text-[#6B5560] mt-1 truncate">
                Đã đồng bộ cơ sở dữ liệu
              </span>
            </div>
          </div>

          {/* Ô 2: Đang hoạt động */}
          <div className="h-[96px] bg-white rounded-[16px] border border-[#F3D9E3] p-4 flex items-center gap-3.5 box-border shadow-[0_2px_8px_rgba(214,51,108,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-[#FFE0EB] flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-[#A61E4D]" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-[32px] font-bold text-[#3B2A35] leading-none">
                  {isLoadingAccounts && accounts.length === 0 ? '—' : stats.active}
                </span>
                <span className="font-nunito font-bold text-[14px] text-[#6B5560] leading-tight truncate">
                  Đang hoạt động
                </span>
              </div>
              <span className="font-nunito text-[12px] text-[#6B5560] mt-1 truncate">
                Sẵn sàng đăng nhập vào lớp
              </span>
            </div>
          </div>

          {/* Ô 3: Đang tạm khóa */}
          <div className="h-[96px] bg-white rounded-[16px] border border-[#F3D9E3] p-4 flex items-center gap-3.5 box-border shadow-[0_2px_8px_rgba(214,51,108,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-[#DCEBFA] flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-[#1F4E79]" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-[32px] font-bold text-[#3B2A35] leading-none">
                  {isLoadingAccounts && accounts.length === 0 ? '—' : stats.locked}
                </span>
                <span className="font-nunito font-bold text-[14px] text-[#6B5560] leading-tight truncate">
                  Đang tạm khóa
                </span>
              </div>
              <span className="font-nunito text-[12px] text-[#6B5560] mt-1 truncate">
                Khóa thủ công hoặc nhập sai
              </span>
            </div>
          </div>

          {/* Ô 4: Chưa kích hoạt */}
          <div className="h-[96px] bg-white rounded-[16px] border border-[#F3D9E3] p-4 flex items-center gap-3.5 box-border shadow-[0_2px_8px_rgba(214,51,108,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-[#FFE0EB] flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#A61E4D]" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-[32px] font-bold text-[#3B2A35] leading-none">
                  {isLoadingAccounts && accounts.length === 0 ? '—' : stats.unverified}
                </span>
                <span className="font-nunito font-bold text-[14px] text-[#6B5560] leading-tight truncate">
                  Chưa kích hoạt
                </span>
              </div>
              <span className="font-nunito text-[12px] text-[#6B5560] mt-1 truncate">
                Chưa xác nhận hòm thư
              </span>
            </div>
          </div>
        </section>

        {/* ==========================================
            ROW 3: ONE TABLE CARD
            ========================================== */}
        <section
          aria-label="Danh sách tài khoản học sinh"
          className="bg-white rounded-[16px] border border-[#F3D9E3] shadow-[0_4px_16px_rgba(214,51,108,0.04)] flex flex-col"
        >
          {/* 1. THANH TAB ĐẦU CARD (56px) */}
          <div className="h-[56px] px-6 border-b border-[#F3D9E3] rounded-t-[16px] flex items-center justify-between box-border">
            <div className="flex items-center gap-2">
              {/* Tab 1: Tài khoản */}
              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className={`h-9 px-4 rounded-[12px] font-nunito font-bold text-[14px] transition-all cursor-pointer ${
                  activeTab === 'accounts'
                    ? 'bg-[#2F6FA8] text-white shadow-2xs'
                    : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                }`}
              >
                Tài khoản ({stats.total})
              </button>

              {/* Tab 2: Thùng rác */}
              <button
                type="button"
                onClick={() => setActiveTab('trash')}
                className={`h-9 px-4 rounded-[12px] font-nunito font-bold text-[14px] flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'trash'
                    ? 'bg-[#2F6FA8] text-white shadow-2xs'
                    : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                }`}
              >
                <Trash2
                  className={`w-4 h-4 ${activeTab === 'trash' ? 'text-white' : 'text-[#1F4E79]'}`}
                  strokeWidth={1.75}
                />
                <span>Thùng rác ({stats.trash ?? totalTrash})</span>
              </button>
            </div>

            <div className="text-[12px] font-nunito font-semibold text-[#6B5560]">
              {activeTab === 'trash' ? 'Tự động dọn dẹp sau 30 ngày' : 'Cập nhật mới nhất lúc 15:30'}
            </div>
          </div>

          {/* ========================================================
              NỘI DUNG KHI TAB "THÙNG RÁC" ĐANG HOẠT ĐỘNG (ACTIVE)
              ======================================================== */}
          {activeTab === 'trash' ? (
            <>
              {/* BANNER THÔNG TIN (56px, background #E9F3FF, radius 12px, info icon, 13px #1F4E79) */}
              <div className="px-6 pt-4 pb-2">
                <div className="h-[56px] px-4 bg-[#E9F3FF] rounded-[12px] border border-[#DCEBFA] flex items-center gap-3 text-[13px] text-[#1F4E79] font-medium box-border">
                  <Info className="w-5 h-5 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                  <span>
                    Tài khoản trong thùng rác không đăng nhập được. Khôi phục để dùng lại, hoặc xóa vĩnh viễn để xóa hẳn khỏi dữ liệu (không thể hoàn tác).
                  </span>
                </div>
              </div>

              {trashError && (
                <div className="mx-6 my-2 p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{trashError}</span>
                  </div>
                  <button type="button" onClick={() => fetchTrash()} className="underline font-bold hover:text-amber-900 cursor-pointer">
                    Thử lại
                  </button>
                </div>
              )}

              {/* TOOLBAR THÙNG RÁC: Chỉ duy nhất ô tìm kiếm (48px, border #9C6B84) */}
              <div className="h-[72px] px-6 border-b border-[#F3D9E3] flex items-center box-border">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Tìm trong thùng rác theo tên, mã học sinh hoặc email…"
                    value={trashSearch}
                    onChange={(e) => handleTrashSearchChange(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[14px] text-[#3B2A35] placeholder:text-[#6B5560]/70 focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] transition-all"
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5560] pointer-events-none"
                    strokeWidth={1.75}
                  />
                </div>
              </div>

              {/* TABLE HEADER THÙNG RÁC (#DCEBFA, text #1F4E79): "Học sinh" | "Liên hệ" | "Lớp lúc xóa" | "Ngày xóa" | "Thao tác" */}
              <div className="h-[48px] bg-[#DCEBFA] px-6 grid grid-cols-12 items-center text-[13px] font-semibold text-[#1F4E79] select-none box-border">
                <div className="col-span-3">Học sinh</div>
                <div className="col-span-3">Liên hệ</div>
                <div className="col-span-2">Lớp lúc xóa</div>
                <div className="col-span-2">Ngày xóa</div>
                <div className="col-span-2 text-right">Thao tác</div>
              </div>

              {/* HÀNG DỮ LIỆU THÙNG RÁC */}
              <div className="divide-y divide-[#F3D9E3] bg-white">
                {isLoadingTrash ? (
                  <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-[#6B5560]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#2F6FA8]" />
                    <span className="font-nunito text-[14px]">Đang tải danh sách thùng rác...</span>
                  </div>
                ) : trashRows.length === 0 ? (
                  <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-[#6B5560]">
                    <Trash2 className="w-8 h-8 text-[#9C6B84]/50" />
                    <span className="font-nunito font-semibold text-[14px] text-[#3B2A35]">
                      Thùng rác hiện đang trống
                    </span>
                    <span className="font-nunito text-[12px] text-[#6B5560]">
                      Không có tài khoản nào bị xóa hoặc khớp với từ khóa tìm kiếm.
                    </span>
                  </div>
                ) : (
                  trashRows.map((row) => {
                    const initials = row.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={row.id}
                        className="h-[60px] px-6 grid grid-cols-12 items-center text-[14px] font-nunito text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors box-border"
                      >
                        {/* Cột 1: Học sinh */}
                        <div className="col-span-3 flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-9 h-9 rounded-xl bg-[#EFE9ED] text-[#6B5560] flex items-center justify-center font-bold text-[13px] flex-shrink-0 select-none shadow-2xs">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[15px] text-[#3B2A35] leading-tight truncate">
                              {row.name}
                            </span>
                            <div className="mt-0.5">
                              <span className="inline-block bg-[#E9F3FF] text-[#1F4E79] font-mono font-bold text-[12px] px-1.5 py-0.2 rounded-md leading-none">
                                {row.code}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cột 2: Liên hệ */}
                        <div className="col-span-3 flex flex-col justify-center gap-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                            <span className="text-[13px] text-[#3B2A35] font-medium truncate">
                              {row.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                            <span className="text-[13px] text-[#3B2A35] font-medium">
                              {row.phone}
                            </span>
                          </div>
                        </div>

                        {/* Cột 3: Lớp lúc xóa */}
                        <div className="col-span-2 flex items-center pr-2">
                          <span className="inline-block bg-[#FFE0EB] text-[#A61E4D] font-bold text-[12px] px-2.5 py-1 rounded-md">
                            {row.className}
                          </span>
                        </div>

                        {/* Cột 4: Ngày xóa */}
                        <div className="col-span-2 flex items-center gap-1.5 text-[13px] text-[#6B5560]">
                          <Calendar className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                          <span>{row.deletedDate}</span>
                        </div>

                        {/* Cột 5: Thao tác */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          {/* Nút 1: Khôi phục */}
                          <button
                            type="button"
                            disabled={actionLoadingId === row.id}
                            onClick={() => handleRestore(row)}
                            className="h-9 px-3 rounded-lg border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#E9F3FF] disabled:opacity-50 font-nunito font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {actionLoadingId === row.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5 text-[#2F6FA8]" strokeWidth={2} />
                            )}
                            <span>Khôi phục</span>
                          </button>

                          {/* Nút 2: Xóa vĩnh viễn */}
                          <button
                            type="button"
                            disabled={actionLoadingId === row.id}
                            onClick={() => handleOpenPermanentDelete(row)}
                            className="h-9 px-3 rounded-lg text-[#B02525] hover:bg-[#FFE3E3] font-nunito font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#B02525]" strokeWidth={2} />
                            <span>Xóa vĩnh viễn</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* FOOTER THÙNG RÁC */}
              <footer className="h-[56px] px-6 border-t border-[#F3D9E3] bg-white rounded-b-[16px] flex items-center justify-between box-border">
                {/* Góc trái: Bộ đếm số lượng */}
                <div className="text-[13px] font-nunito font-semibold text-[#6B5560]">
                  Hiển thị {totalTrash === 0 ? 0 : (trashPage - 1) * trashPageSize + 1}–{Math.min(trashPage * trashPageSize, totalTrash)} trên {totalTrash} tài khoản
                </div>

                {/* Góc phải: Bộ chọn số dòng + Phân trang */}
                <div className="flex items-center gap-3">
                  <select
                    value={trashPageSize}
                    onChange={(e) => {
                      setTrashPageSize(Number(e.target.value));
                      setTrashPage(1);
                    }}
                    aria-label="Số bản ghi trên trang"
                    className="h-9 px-2.5 rounded-lg border border-[#9C6B84] bg-white font-nunito font-semibold text-[13px] text-[#3B2A35] focus:outline-none focus:ring-1 focus:ring-[#2F6FA8] cursor-pointer"
                  >
                    <option value="10">10 / trang</option>
                    <option value="20">20 / trang</option>
                  </select>

                  <nav aria-label="Phân trang thùng rác" className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={trashPage <= 1}
                      onClick={() => setTrashPage((p) => Math.max(1, p - 1))}
                      aria-label="Trang trước"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] disabled:text-slate-300 font-bold text-[15px] flex items-center justify-center hover:bg-[#E9F3FF] disabled:hover:bg-transparent disabled:cursor-not-allowed select-none transition-colors"
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalTrashPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setTrashPage(pageNum)}
                        aria-current={trashPage === pageNum ? 'page' : undefined}
                        className={`w-10 h-10 rounded-full font-bold text-[14px] flex items-center justify-center transition-colors select-none ${
                          trashPage === pageNum
                            ? 'bg-[#2F6FA8] text-white shadow-xs'
                            : 'border border-[#F3D9E3] text-[#3B2A35] hover:bg-[#E9F3FF] cursor-pointer'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={trashPage >= totalTrashPages}
                      onClick={() => setTrashPage((p) => Math.min(totalTrashPages, p + 1))}
                      aria-label="Trang tiếp theo"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] disabled:text-slate-300 font-bold text-[15px] flex items-center justify-center hover:bg-[#E9F3FF] disabled:hover:bg-transparent disabled:cursor-not-allowed select-none transition-colors"
                    >
                      ›
                    </button>
                  </nav>
                </div>
              </footer>
            </>
          ) : (
            /* ========================================================
               NỘI DUNG KHI TAB "TÀI KHOẢN" ĐANG HOẠT ĐỘNG
               ======================================================== */
            <>
              {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC (72px) */}
              <div className="h-[72px] px-6 border-b border-[#F3D9E3] flex items-center gap-4 box-border">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, mã học sinh (VD: HS0001) hoặc email…"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[14px] text-[#3B2A35] placeholder:text-[#6B5560]/70 focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] transition-all"
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5560] pointer-events-none"
                    strokeWidth={1.75}
                  />
                </div>

                <div className="w-[200px] flex-shrink-0">
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-[12px] border border-[#9C6B84] bg-white font-nunito font-semibold text-[14px] text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] cursor-pointer"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {(stats.classes && stats.classes.length > 0
                      ? stats.classes
                      : ['Văn 7C', 'Văn 8B', 'Văn 9A', 'Ôn thi vào 10', 'Văn 10']
                    ).map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-[180px] flex-shrink-0">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-[12px] border border-[#9C6B84] bg-white font-nunito font-semibold text-[14px] text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                    <option value="Chưa kích hoạt">Chưa kích hoạt</option>
                  </select>
                </div>
              </div>

              {accountsError && (
                <div className="mx-6 my-2 p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{accountsError}</span>
                  </div>
                  <button type="button" onClick={() => fetchAccounts()} className="underline font-bold hover:text-amber-900 cursor-pointer">
                    Thử lại
                  </button>
                </div>
              )}

              {/* TIÊU ĐỀ BẢNG TÀI KHOẢN (48px) */}
              <div className="h-[48px] bg-[#DCEBFA] px-6 grid grid-cols-[280px_260px_110px_130px_140px_168px] items-center text-[13px] font-semibold text-[#1F4E79] select-none box-border">
                <div>Học sinh</div>
                <div>Liên hệ</div>
                <div>Lớp</div>
                <div>Trạng thái</div>
                <div>Đăng nhập cuối</div>
                <div className="text-right">Thao tác</div>
              </div>

              {/* HÀNG DỮ LIỆU TÀI KHOẢN */}
              <div className="divide-y divide-[#F3D9E3] bg-white">
                {isLoadingAccounts ? (
                  <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-[#6B5560]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#2F6FA8]" />
                    <span className="font-nunito text-[14px]">Đang tải dữ liệu tài khoản từ máy chủ...</span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-[#6B5560]">
                    <Users className="w-8 h-8 text-[#9C6B84]/50" />
                    <span className="font-nunito font-semibold text-[14px] text-[#3B2A35]">
                      Không tìm thấy tài khoản học sinh nào
                    </span>
                    <span className="font-nunito text-[12px] text-[#6B5560]">
                      Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
                    </span>
                  </div>
                ) : (
                  accounts.map((row) => {
                    const isLocked = row.status === 'Tạm khóa';
                    const initials = row.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={row.id}
                        className="h-[60px] px-6 grid grid-cols-[280px_260px_110px_130px_140px_168px] items-center text-[14px] font-nunito text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors box-border"
                      >
                        {/* Cột 1: Học sinh */}
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={() => handleViewAccountDetail(row)}
                            style={{ backgroundColor: row.avatarBg, color: row.avatarText }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] flex-shrink-0 select-none shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                            title={`Xem chi tiết hồ sơ ${row.name}`}
                          >
                            {initials}
                          </button>
                          <div className="flex flex-col min-w-0">
                            <button
                              type="button"
                              onClick={() => handleViewAccountDetail(row)}
                              className="text-left font-bold text-[15px] text-[#3B2A35] hover:text-[#2F6FA8] hover:underline leading-tight truncate transition-colors cursor-pointer"
                              title={`Xem chi tiết hồ sơ ${row.name}`}
                            >
                              {row.name}
                            </button>
                            <div className="mt-0.5">
                              <button
                                type="button"
                                onClick={() => handleViewAccountDetail(row)}
                                className="inline-block bg-[#E9F3FF] hover:bg-[#DCEBFA] text-[#1F4E79] font-mono font-bold text-[12px] px-1.5 py-0.2 rounded-md leading-none transition-colors cursor-pointer"
                                title={`Mã học sinh: ${row.code}`}
                              >
                                {row.code}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Cột 2: Liên hệ */}
                        <div className="flex flex-col justify-center gap-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                            <span className="text-[13px] text-[#3B2A35] font-medium truncate">
                              {row.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                            <span className="text-[13px] text-[#3B2A35] font-medium">
                              {row.phone}
                            </span>
                          </div>
                        </div>

                        {/* Cột 3: Lớp */}
                        <div className="flex items-center pr-2">
                          {row.className === 'Chưa xếp lớp' ? (
                            <span className="inline-block bg-[#EFE9ED] text-[#6B5560] font-semibold text-[12px] px-2.5 py-1 rounded-md">
                              Chưa xếp lớp
                            </span>
                          ) : (
                            <span className="inline-block bg-[#FFE0EB] text-[#A61E4D] font-bold text-[12px] px-2.5 py-1 rounded-md">
                              {row.className}
                            </span>
                          )}
                        </div>

                        {/* Cột 4: Trạng thái */}
                        <div className="flex items-center pr-2">
                          {row.status === 'Hoạt động' && (
                            <span className="inline-flex items-center gap-1.5 bg-[#DCEBFA] text-[#1F4E79] font-bold text-[12px] px-2.5 py-1 rounded-full whitespace-nowrap">
                              <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2.2} />
                              <span>Hoạt động</span>
                            </span>
                          )}
                          {row.status === 'Tạm khóa' && (
                            <span className="inline-flex items-center gap-1.5 bg-[#FFE0EB] text-[#A61E4D] font-bold text-[12px] px-2.5 py-1 rounded-full whitespace-nowrap">
                              <Lock className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={2} />
                              <span>Tạm khóa</span>
                            </span>
                          )}
                          {row.status === 'Chưa kích hoạt' && (
                            <span className="inline-flex items-center gap-1.5 bg-[#EFE9ED] text-[#6B5560] font-bold text-[12px] px-2.5 py-1 rounded-full whitespace-nowrap">
                              <Mail className="w-3.5 h-3.5 text-[#6B5560]" strokeWidth={2} />
                              <span>Chưa kích hoạt</span>
                            </span>
                          )}
                        </div>

                        {/* Cột 5: Đăng nhập cuối */}
                        <div className="flex items-center gap-1.5 text-[13px] text-[#6B5560] whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                          <span className="font-medium text-[#6B5560]">{row.lastLogin}</span>
                        </div>

                        {/* Cột 6: Thao tác */}
                        <div className="flex items-center justify-end gap-1 relative">
                          <button
                            type="button"
                            title="Xem chi tiết hồ sơ"
                            aria-label="Xem chi tiết hồ sơ"
                            onClick={() => handleViewAccountDetail(row)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            title="Đặt lại mật khẩu"
                            aria-label="Đặt lại mật khẩu"
                            onClick={() =>
                              setActiveResetModal({
                                id: row.id,
                                fullName: row.name,
                                studentCode: row.code,
                                email: row.email === 'Chưa cập nhật email' ? '' : row.email,
                              })
                            }
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            title={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                            aria-label={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                            disabled={actionLoadingId === row.id}
                            onClick={() => handleToggleLock(row)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {actionLoadingId === row.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#1F4E79]" />
                            ) : isLocked ? (
                              <Unlock className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                            ) : (
                              <Lock className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                            )}
                          </button>

                          <div className="relative group/trash flex items-center justify-center">
                            <button
                              type="button"
                              aria-label="Chuyển vào thùng rác"
                              onClick={() => handleOpenTrashConfirm(row)}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#A61E4D] hover:bg-[#FFE0EB] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-[#A61E4D]" strokeWidth={1.75} />
                            </button>

                            {/* Tooltip hiển thị đầy đủ "Chuyển vào thùng rác", căn phải (right-0) không bị cắt lề */}
                            <div
                              role="tooltip"
                              className="absolute -top-9.5 right-0 z-50 px-2.5 py-1 rounded-md bg-[#3B2A35] text-white text-[11px] font-nunito font-semibold shadow-md whitespace-nowrap pointer-events-none opacity-0 group-hover/trash:opacity-100 transition-opacity duration-150 after:content-[''] after:absolute after:top-full after:right-[14px] after:border-4 after:border-transparent after:border-t-[#3B2A35]"
                            >
                              Chuyển vào thùng rác
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* FOOTER TÀI KHOẢN (56px) */}
              <footer className="h-[56px] px-6 border-t border-[#F3D9E3] bg-white rounded-b-[16px] flex items-center justify-between box-border">
                <div className="text-[13px] font-nunito font-semibold text-[#6B5560]">
                  Hiển thị {totalAccounts === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalAccounts)} trên {totalAccounts} tài khoản
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    aria-label="Số bản ghi trên trang"
                    className="h-9 px-2.5 rounded-lg border border-[#9C6B84] bg-white font-nunito font-semibold text-[13px] text-[#3B2A35] focus:outline-none focus:ring-1 focus:ring-[#2F6FA8] cursor-pointer"
                  >
                    <option value="10">10 / trang</option>
                    <option value="20">20 / trang</option>
                    <option value="50">50 / trang</option>
                  </select>

                  <nav aria-label="Phân trang tài khoản" className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="Trang trước"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] disabled:text-slate-300 font-bold text-[15px] flex items-center justify-center hover:bg-[#E9F3FF] disabled:hover:bg-transparent disabled:cursor-not-allowed select-none transition-colors"
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                        className={`w-10 h-10 rounded-full font-bold text-[14px] flex items-center justify-center transition-colors select-none ${
                          currentPage === pageNum
                            ? 'bg-[#2F6FA8] text-white shadow-xs'
                            : 'border border-[#F3D9E3] text-[#3B2A35] hover:bg-[#E9F3FF] cursor-pointer'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Trang tiếp theo"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] disabled:text-slate-300 font-bold text-[15px] flex items-center justify-center hover:bg-[#E9F3FF] disabled:hover:bg-transparent disabled:cursor-not-allowed select-none transition-colors"
                    >
                      ›
                    </button>
                  </nav>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>

      {/* Modal Cấp tài khoản mới */}
      <CreateAccountModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(created) => {
          setActiveCredentialCard(created);
          fetchAccounts();
          showToast(`Cấp tài khoản mới cho ${created.fullName} thành công!`);
        }}
      />

      {/* Modal Thẻ thông tin tài khoản & Gửi học sinh */}
      <CredentialCardModal
        isOpen={!!activeCredentialCard}
        onClose={() => setActiveCredentialCard(null)}
        onViewDetail={(createdAcc) => {
          setViewingAccountDetail({
            id: createdAcc.id,
            name: createdAcc.fullName,
            code: createdAcc.studentCode,
            email: createdAcc.email || 'Chưa cập nhật email',
            phone: '—',
            className: createdAcc.className || 'Chưa xếp lớp',
            status: 'Hoạt động',
            lastLogin: 'Chưa đăng nhập lần nào',
            avatarBg: '#DCEBFA',
            avatarText: '#1F4E79',
          });
        }}
        account={activeCredentialCard}
      />

      {/* Modal Xem chi tiết hồ sơ tài khoản học sinh */}
      <AccountDetailModal
        isOpen={!!viewingAccountDetail}
        onClose={() => setViewingAccountDetail(null)}
        account={viewingAccountDetail}
        onResetPassword={(acc) => setActiveResetModal(acc)}
      />

      {/* Modal Đặt lại mật khẩu */}
      <ResetPasswordModal
        isOpen={!!activeResetModal}
        onClose={() => setActiveResetModal(null)}
        account={activeResetModal}
        onSuccess={(newPassword) => {
          if (activeResetModal) {
            setActiveCredentialCard({
              ...activeResetModal,
              temporaryPassword: newPassword,
            });
            fetchAccounts();
            showToast(`Đã đặt lại mật khẩu cho ${activeResetModal.fullName}`);
          }
        }}
      />

      {/* Modal Xác nhận chuyển tài khoản vào thùng rác */}
      <TrashConfirmModal
        isOpen={!!trashConfirmStudent}
        onClose={() => setTrashConfirmStudent(null)}
        onConfirm={handleConfirmMoveToTrash}
        student={trashConfirmStudent}
        isLoading={isSubmittingTrash}
      />

      {/* Modal Xác nhận xóa vĩnh viễn khỏi hệ thống */}
      <PermanentDeleteModal
        isOpen={!!permanentDeleteStudent}
        onClose={() => setPermanentDeleteStudent(null)}
        onConfirm={handleConfirmPermanentDelete}
        student={permanentDeleteStudent}
        isLoading={isSubmittingPermDelete}
      />

      {/* Thông báo nổi (Toast Feedback) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B2A35] text-white px-4 py-3 rounded-[14px] shadow-xl text-[13px] font-nunito font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 border border-[#F3D9E3]/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AccountListPage;
