import React, { useState } from 'react';
import { CreateAccountModal } from '../components/CreateAccountModal';
import { CredentialCardModal } from '../components/CredentialCardModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { TrashConfirmModal, TrashConfirmStudent } from '../components/TrashConfirmModal';
import {
  PermanentDeleteModal,
  PermanentDeleteStudent,
} from '../components/PermanentDeleteModal';
import {
  Search,
  Plus,
  Users,
  Check,
  Lock,
  Unlock,
  KeyRound,
  Mail,
  Trash2,
  Clock,
  RotateCw,
  RotateCcw,
  Phone,
  Info,
  Calendar,
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

const INITIAL_ACCOUNTS: StudentAccountRow[] = [
  {
    id: '1',
    name: 'Phan Đình Khôi',
    code: 'HS0034',
    email: 'dinhkhoi.phan@gmail.com',
    phone: '0900 111 234',
    className: 'Văn 6D',
    status: 'Hoạt động',
    lastLogin: 'Chưa đăng nhập',
    avatarBg: '#FFE0EB',
    avatarText: '#A61E4D',
  },
  {
    id: '2',
    name: 'Vũ Như Quỳnh',
    code: 'HS0035',
    email: 'nhuquynh.vu@gmail.com',
    phone: '0900 111 235',
    className: 'Văn 9A',
    status: 'Hoạt động',
    lastLogin: 'Hôm nay 08:12',
    avatarBg: '#DCEBFA',
    avatarText: '#1F4E79',
  },
  {
    id: '3',
    name: 'Hoàng Minh Châu',
    code: 'HS0036',
    email: 'minhchau.hoang@gmail.com',
    phone: '0900 111 236',
    className: 'Văn 8B',
    status: 'Hoạt động',
    lastLogin: 'Hôm qua 19:40',
    avatarBg: '#FFE0EB',
    avatarText: '#A61E4D',
  },
  {
    id: '4',
    name: 'Đặng Tuấn Vũ',
    code: 'HS0037',
    email: 'tuanvu.dang@gmail.com',
    phone: '0900 111 237',
    className: 'Văn 7C',
    status: 'Hoạt động',
    lastLogin: 'Chưa đăng nhập',
    avatarBg: '#DCEBFA',
    avatarText: '#1F4E79',
  },
  {
    id: '5',
    name: 'Lâm Thu Trang',
    code: 'HS0038',
    email: 'thutrang.lam@gmail.com',
    phone: '0900 111 238',
    className: 'Văn 9A',
    status: 'Hoạt động',
    lastLogin: 'Hôm nay 07:55',
    avatarBg: '#FFE0EB',
    avatarText: '#A61E4D',
  },
  {
    id: '6',
    name: 'Dương Việt Hoàng',
    code: 'HS0039',
    email: 'viethoang.duong@gmail.com',
    phone: '0900 111 239',
    className: 'Văn 6D',
    status: 'Hoạt động',
    lastLogin: '2 ngày trước',
    avatarBg: '#DCEBFA',
    avatarText: '#1F4E79',
  },
  {
    id: '7',
    name: 'Mai Ánh Tuyết',
    code: 'HS0040',
    email: 'anhtuyet.mai@gmail.com',
    phone: '0900 111 240',
    className: 'Văn 8B',
    status: 'Hoạt động',
    lastLogin: 'Hôm qua 21:03',
    avatarBg: '#FFE0EB',
    avatarText: '#A61E4D',
  },
  {
    id: '8',
    name: 'Nguyễn Hải Yến',
    code: 'HS0041',
    email: 'haiyen.nguyen@gmail.com',
    phone: '0900 111 241',
    className: 'Văn 9A',
    status: 'Hoạt động',
    lastLogin: 'Hôm nay 08:30',
    avatarBg: '#DCEBFA',
    avatarText: '#1F4E79',
  },
  {
    id: '9',
    name: 'Trần Quốc Bảo',
    code: 'HS0031',
    email: 'quocbao.tran@gmail.com',
    phone: '0900 111 231',
    className: 'Văn 7C',
    status: 'Tạm khóa',
    lastLogin: '3 ngày trước',
    avatarBg: '#FFE0EB',
    avatarText: '#A61E4D',
  },
  {
    id: '10',
    name: 'Lê Bảo Ngọc',
    code: 'HS0042',
    email: 'baongoc.le@gmail.com',
    phone: '0900 111 242',
    className: 'Chưa xếp lớp',
    status: 'Chưa kích hoạt',
    lastLogin: 'Chưa đăng nhập',
    avatarBg: '#DCEBFA',
    avatarText: '#1F4E79',
  },
];

const INITIAL_TRASH_ROWS: TrashStudentRow[] = [
  {
    id: 't1',
    name: 'Trịnh Anh Thư',
    code: 'HS0020',
    email: 'anhthu.trinh@gmail.com',
    phone: '0900 111 231',
    className: 'Văn 7C',
    deletedDate: '12/11/2026',
  },
  {
    id: 't2',
    name: 'Lý Bảo Ngọc',
    code: 'HS0019',
    email: 'baongoc.ly@gmail.com',
    phone: '0900 111 232',
    className: 'Văn 8B',
    deletedDate: '11/11/2026',
  },
  {
    id: 't3',
    name: 'Mai Đức Anh',
    code: 'HS0018',
    email: 'ducanh.mai@gmail.com',
    phone: '0900 111 233',
    className: 'Văn 9A',
    deletedDate: '09/11/2026',
  },
  {
    id: 't4',
    name: 'Cao Thanh Hà',
    code: 'HS0017',
    email: 'thanhha.cao@gmail.com',
    phone: '0900 111 234',
    className: 'Văn 9A',
    deletedDate: '07/11/2026',
  },
  {
    id: 't5',
    name: 'Đinh Quốc Khánh',
    code: 'HS0016',
    email: 'quockhanh.dinh@gmail.com',
    phone: '0900 111 235',
    className: 'Văn 10',
    deletedDate: '05/11/2026',
  },
  {
    id: 't6',
    name: 'Tạ Phương Anh',
    code: 'HS0015',
    email: 'phuonganh.ta@gmail.com',
    phone: '0900 111 236',
    className: 'Văn 7C',
    deletedDate: '03/11/2026',
  },
  {
    id: 't7',
    name: 'Hồ Gia Huy',
    code: 'HS0014',
    email: 'giahuy.ho@gmail.com',
    phone: '0900 111 237',
    className: 'Văn 8B',
    deletedDate: '01/11/2026',
  },
  {
    id: 't8',
    name: 'Lâm Thu Trang',
    code: 'HS0013',
    email: 'thutrang.lam2@gmail.com',
    phone: '0900 111 238',
    className: 'Văn 9A',
    deletedDate: '28/10/2026',
  },
  {
    id: 't9',
    name: 'Phan Nhật Minh',
    code: 'HS0012',
    email: 'nhatminh.phan@gmail.com',
    phone: '0900 111 239',
    className: 'Văn 9A',
    deletedDate: '25/10/2026',
  },
  {
    id: 't10',
    name: 'Quách Mỹ Linh',
    code: 'HS0011',
    email: 'mylinh.quach@gmail.com',
    phone: '0900 111 240',
    className: 'Văn 7C',
    deletedDate: '22/10/2026',
  },
];

export const AccountListPage: React.FC = () => {
  // Trạng thái tab: Mặc định hiển thị tab "Tài khoản"
  const [activeTab, setActiveTab] = useState<'accounts' | 'trash'>('accounts');

  // Trạng thái tìm kiếm & lọc của tab Tài khoản
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [accounts, setAccounts] = useState<StudentAccountRow[]>(INITIAL_ACCOUNTS);

  // Trạng thái tìm kiếm của tab Thùng rác
  const [trashSearch, setTrashSearch] = useState('');
  const [trashRows, setTrashRows] = useState<TrashStudentRow[]>(INITIAL_TRASH_ROWS);
  const [trashCount, setTrashCount] = useState(12);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCredentialCard, setActiveCredentialCard] = useState<{
    id: string;
    fullName: string;
    studentCode: string;
    email?: string;
    className?: string;
    temporaryPassword?: string;
  } | null>(null);
  const [activeResetModal, setActiveResetModal] = useState<{
    id: string;
    fullName: string;
    studentCode: string;
    email: string;
  } | null>(null);

  // Modal xác nhận chuyển vào thùng rác (xóa mềm): Mặc định đóng (null)
  const [trashConfirmStudent, setTrashConfirmStudent] = useState<TrashConfirmStudent | null>(null);

  // Modal xác nhận xóa vĩnh viễn: Mặc định đóng (null)
  const [permanentDeleteStudent, setPermanentDeleteStudent] = useState<PermanentDeleteStudent | null>(null);

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

  // Xác nhận xóa vĩnh viễn khỏi hệ thống
  const handleConfirmPermanentDelete = () => {
    if (!permanentDeleteStudent) return;
    const { id } = permanentDeleteStudent;

    setTrashRows((prev) => prev.filter((r) => r.id !== id));
    setTrashCount((prev) => Math.max(0, prev - 1));
    setPermanentDeleteStudent(null);
  };

  // Xác nhận chuyển tài khoản vào thùng rác
  const handleConfirmMoveToTrash = () => {
    if (!trashConfirmStudent) return;
    const { id } = trashConfirmStudent;
    const target = accounts.find((a) => a.id === id);

    setAccounts((prev) => prev.filter((r) => r.id !== id));
    setTrashCount((prev) => prev + 1);

    if (target) {
      setTrashRows((prev) => [
        {
          id: `t_${Date.now()}`,
          name: target.name,
          code: target.code,
          email: target.email,
          phone: target.phone,
          className: target.className,
          deletedDate: '17/11/2026',
        },
        ...prev,
      ]);
    }

    setTrashConfirmStudent(null);
  };

  // Thao tác Khôi phục tài khoản từ thùng rác
  const handleRestore = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Khôi phục tài khoản học sinh "${name}" để học sinh có thể tiếp tục đăng nhập?`
    );
    if (!confirmed) return;

    setTrashRows((prev) => prev.filter((r) => r.id !== id));
    setTrashCount((prev) => Math.max(0, prev - 1));
  };

  // Thao tác Khóa / Mở khóa
  const handleToggleLock = (id: string) => {
    setAccounts((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: r.status === 'Tạm khóa' ? 'Hoạt động' : 'Tạm khóa',
          };
        }
        return r;
      })
    );
  };

  // Lọc dữ liệu tài khoản
  const filteredAccounts = accounts.filter((r) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedClass !== 'all' && r.className !== selectedClass) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    return true;
  });

  // Lọc dữ liệu thùng rác
  const filteredTrashRows = trashRows.filter((r) => {
    if (trashSearch.trim()) {
      const q = trashSearch.trim().toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
              onClick={() => {
                setAccounts(INITIAL_ACCOUNTS);
                setTrashRows(INITIAL_TRASH_ROWS);
                setSearch('');
                setTrashSearch('');
                setSelectedClass('all');
                setSelectedStatus('all');
              }}
              className="h-10 px-4 rounded-xl border border-[#9C6B84] text-[#3B2A35] font-nunito font-bold text-[14px] flex items-center gap-2 hover:bg-[#FFE0EB]/40 active:scale-[0.99] transition-all cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
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
                  44
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
                  41
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
                  2
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
                  1
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
              {/* Tab 1: Tài khoản (44) */}
              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className={`h-9 px-4 rounded-[12px] font-nunito font-bold text-[14px] transition-all cursor-pointer ${
                  activeTab === 'accounts'
                    ? 'bg-[#2F6FA8] text-white shadow-2xs'
                    : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                }`}
              >
                Tài khoản (44)
              </button>

              {/* Tab 2: Thùng rác (12) - ĐANG CHỌN (ACTIVE) */}
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
                <span>Thùng rác ({trashCount})</span>
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

              {/* TOOLBAR THÙNG RÁC: Chỉ duy nhất ô tìm kiếm (48px, border #9C6B84) */}
              <div className="h-[72px] px-6 border-b border-[#F3D9E3] flex items-center box-border">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Tìm trong thùng rác…"
                    value={trashSearch}
                    onChange={(e) => setTrashSearch(e.target.value)}
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

              {/* 10 HÀNG DỮ LIỆU THÙNG RÁC (60px mỗi hàng, avatar trung tính #EFE9ED text #6B5560, tên #3B2A35) */}
              <div className="divide-y divide-[#F3D9E3] bg-white">
                {filteredTrashRows.slice(0, 10).map((row) => {
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
                      {/* Cột 1: Học sinh (Avatar neutral #EFE9ED text #6B5560 + Tên #3B2A35 + Mã HS #E9F3FF chip 12px) */}
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

                      {/* Cột 2: Liên hệ (Email và số điện thoại, 13px #3B2A35) */}
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

                      {/* Cột 3: Lớp lúc xóa (Chip #FFE0EB text #A61E4D) */}
                      <div className="col-span-2 flex items-center pr-2">
                        <span className="inline-block bg-[#FFE0EB] text-[#A61E4D] font-bold text-[12px] px-2.5 py-1 rounded-md">
                          {row.className}
                        </span>
                      </div>

                      {/* Cột 4: Ngày xóa (Clock icon và text 13px #6B5560) */}
                      <div className="col-span-2 flex items-center gap-1.5 text-[13px] text-[#6B5560]">
                        <Calendar className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                        <span>{row.deletedDate}</span>
                      </div>

                      {/* Cột 5: Thao tác (Khôi phục & Xóa vĩnh viễn kèm icon VÀ chữ) */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {/* Nút 1: Khôi phục (outline 36px, border and text #2F6FA8) */}
                        <button
                          type="button"
                          onClick={() => handleRestore(row.id, row.name)}
                          className="h-9 px-3 rounded-lg border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#E9F3FF] font-nunito font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#2F6FA8]" strokeWidth={2} />
                          <span>Khôi phục</span>
                        </button>

                        {/* Nút 2: Xóa vĩnh viễn (trash icon, plain text button, #B02525, hover #FFE3E3) */}
                        <button
                          type="button"
                          onClick={() => handleOpenPermanentDelete(row)}
                          className="h-9 px-3 rounded-lg text-[#B02525] hover:bg-[#FFE3E3] font-nunito font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#B02525]" strokeWidth={2} />
                          <span>Xóa vĩnh viễn</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FOOTER THÙNG RÁC (56px, PINNED: "Hiển thị 1–10 trên 12 tài khoản" and pagination "‹ 1 2 ›") */}
              <footer className="h-[56px] px-6 border-t border-[#F3D9E3] bg-white rounded-b-[16px] flex items-center justify-between box-border">
                {/* Góc trái: Bộ đếm số lượng */}
                <div className="text-[13px] font-nunito font-semibold text-[#6B5560]">
                  Hiển thị 1–10 trên 12 tài khoản
                </div>

                {/* Góc phải: Bộ chọn số dòng + Phân trang ‹ 1 2 › */}
                <div className="flex items-center gap-3">
                  <select
                    defaultValue="10"
                    aria-label="Số bản ghi trên trang"
                    className="h-9 px-2.5 rounded-lg border border-[#9C6B84] bg-white font-nunito font-semibold text-[13px] text-[#3B2A35] focus:outline-none focus:ring-1 focus:ring-[#2F6FA8] cursor-pointer"
                  >
                    <option value="10">10 / trang</option>
                    <option value="20">20 / trang</option>
                  </select>

                  <nav aria-label="Phân trang thùng rác" className="flex items-center gap-1.5">
                    {/* Nút Trước (‹) bị vô hiệu hóa */}
                    <button
                      type="button"
                      disabled
                      aria-label="Trang trước"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-slate-300 font-bold text-[15px] flex items-center justify-center cursor-not-allowed select-none"
                    >
                      ‹
                    </button>

                    {/* Trang 1 đang chọn: Nút hình tròn #2F6FA8 chữ trắng */}
                    <button
                      type="button"
                      aria-current="page"
                      className="w-10 h-10 rounded-full bg-[#2F6FA8] text-white font-bold text-[14px] flex items-center justify-center shadow-xs select-none"
                    >
                      1
                    </button>

                    {/* Trang 2 */}
                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-semibold text-[14px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
                    >
                      2
                    </button>

                    {/* Nút Sau (›) */}
                    <button
                      type="button"
                      aria-label="Trang tiếp theo"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-bold text-[15px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
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
                    onChange={(e) => setSearch(e.target.value)}
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
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-[12px] border border-[#9C6B84] bg-white font-nunito font-semibold text-[14px] text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] cursor-pointer"
                  >
                    <option value="all">Tất cả các lớp</option>
                    <option value="Văn 9A">Lớp Văn 9A</option>
                    <option value="Văn 8B">Lớp Văn 8B</option>
                    <option value="Văn 7C">Lớp Văn 7C</option>
                    <option value="Văn 6D">Lớp Văn 6D</option>
                  </select>
                </div>

                <div className="w-[180px] flex-shrink-0">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-[12px] border border-[#9C6B84] bg-white font-nunito font-semibold text-[14px] text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                    <option value="Chưa kích hoạt">Chưa kích hoạt</option>
                  </select>
                </div>
              </div>

              {/* TIÊU ĐỀ BẢNG TÀI KHOẢN (48px) - Phân bổ cột sát vừa khít, không để khoảng trống thừa giữa Đăng nhập cuối & Thao tác */}
              <div className="h-[48px] bg-[#DCEBFA] px-6 grid grid-cols-[300px_270px_110px_130px_140px_138px] items-center text-[13px] font-semibold text-[#1F4E79] select-none box-border">
                <div>Học sinh</div>
                <div>Liên hệ</div>
                <div>Lớp</div>
                <div>Trạng thái</div>
                <div>Đăng nhập cuối</div>
                <div className="text-right">Thao tác</div>
              </div>

              {/* 10 HÀNG DỮ LIỆU TÀI KHOẢN (60px) */}
              <div className="divide-y divide-[#F3D9E3] bg-white">
                {filteredAccounts.slice(0, 10).map((row) => {
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
                      className="h-[60px] px-6 grid grid-cols-[300px_270px_110px_130px_140px_138px] items-center text-[14px] font-nunito text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors box-border"
                    >
                      {/* Cột 1: Học sinh */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          style={{ backgroundColor: row.avatarBg, color: row.avatarText }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] flex-shrink-0 select-none shadow-2xs"
                        >
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

                      {/* Cột 5: Đăng nhập cuối (Thu nhỏ vừa vặn 140px, text hiển thị trọn vẹn, không dư thừa khoảng trống) */}
                      <div className="flex items-center gap-1.5 text-[13px] text-[#6B5560] whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                        <span className="font-medium text-[#6B5560]">{row.lastLogin}</span>
                      </div>

                      {/* Cột 6: Thao tác (Căn vừa khít 138px, nằm liền kề Đăng nhập cuối) */}
                      <div className="flex items-center justify-end gap-1 relative">
                        <button
                          type="button"
                          title="Đặt lại mật khẩu"
                          aria-label="Đặt lại mật khẩu"
                          onClick={() =>
                            setActiveResetModal({
                              id: row.id,
                              fullName: row.name,
                              studentCode: row.code,
                              email: row.email,
                            })
                          }
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                        </button>

                        <button
                          type="button"
                          title={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                          aria-label={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                          onClick={() => handleToggleLock(row.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] transition-colors cursor-pointer"
                        >
                          {isLocked ? (
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
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#A61E4D] hover:bg-[#FFE0EB] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-[#A61E4D]" strokeWidth={1.75} />
                          </button>

                          {/* Tooltip xuất hiện chuẩn xác ngay tâm nút Trash, mũi tên chỉ đúng tâm icon, không bị cắt text */}
                          <div
                            role="tooltip"
                            className="absolute -top-9.5 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 rounded-md bg-[#3B2A35] text-white text-[11px] font-nunito font-semibold shadow-md whitespace-nowrap pointer-events-none opacity-0 group-hover/trash:opacity-100 transition-opacity duration-150 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#3B2A35]"
                          >
                            Chuyển vào thùng rác
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FOOTER TÀI KHOẢN (56px) */}
              <footer className="h-[56px] px-6 border-t border-[#F3D9E3] bg-white rounded-b-[16px] flex items-center justify-between box-border">
                <div className="text-[13px] font-nunito font-semibold text-[#6B5560]">
                  Hiển thị 1–10 trên 44 tài khoản
                </div>

                <div className="flex items-center gap-3">
                  <select
                    defaultValue="10"
                    aria-label="Số bản ghi trên trang"
                    className="h-9 px-2.5 rounded-lg border border-[#9C6B84] bg-white font-nunito font-semibold text-[13px] text-[#3B2A35] focus:outline-none focus:ring-1 focus:ring-[#2F6FA8] cursor-pointer"
                  >
                    <option value="10">10 / trang</option>
                    <option value="20">20 / trang</option>
                    <option value="50">50 / trang</option>
                  </select>

                  <nav aria-label="Phân trang" className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      aria-label="Trang trước"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-slate-300 font-bold text-[15px] flex items-center justify-center cursor-not-allowed select-none"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      aria-current="page"
                      className="w-10 h-10 rounded-full bg-[#2F6FA8] text-white font-bold text-[14px] flex items-center justify-center shadow-xs select-none"
                    >
                      1
                    </button>

                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-semibold text-[14px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
                    >
                      2
                    </button>

                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-semibold text-[14px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
                    >
                      3
                    </button>

                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-semibold text-[14px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
                    >
                      4
                    </button>

                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-semibold text-[14px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
                    >
                      5
                    </button>

                    <button
                      type="button"
                      aria-label="Trang tiếp theo"
                      className="w-10 h-10 rounded-lg border border-[#F3D9E3] text-[#3B2A35] font-bold text-[15px] flex items-center justify-center hover:bg-[#E9F3FF] transition-colors cursor-pointer select-none"
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
        }}
      />

      {/* Modal Thẻ thông tin tài khoản & Gửi học sinh */}
      <CredentialCardModal
        isOpen={!!activeCredentialCard}
        onClose={() => setActiveCredentialCard(null)}
        account={activeCredentialCard}
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
          }
        }}
      />

      {/* Modal Xác nhận chuyển tài khoản vào thùng rác */}
      <TrashConfirmModal
        isOpen={!!trashConfirmStudent}
        onClose={() => setTrashConfirmStudent(null)}
        onConfirm={handleConfirmMoveToTrash}
        student={trashConfirmStudent}
      />

      {/* Modal Xác nhận xóa vĩnh viễn khỏi hệ thống */}
      <PermanentDeleteModal
        isOpen={!!permanentDeleteStudent}
        onClose={() => setPermanentDeleteStudent(null)}
        onConfirm={handleConfirmPermanentDelete}
        student={permanentDeleteStudent}
      />
    </div>
  );
};

export default AccountListPage;
