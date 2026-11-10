import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { ClassTileItem, ClassColorTheme } from '../types/class.types';
import { ClassFormModal } from '../components/ClassFormModal';
import { DeleteClassDialog } from '../components/DeleteClassDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Danh sách ban đầu 12 lớp học với bảng màu chuẩn thẩm mỹ
const INITIAL_CLASS_TILES: ClassTileItem[] = [
  // Hàng 1 (hồng, xanh, hồng, xanh)
  {
    id: 1,
    name: 'Lớp 1',
    grade: 1,
    studentCount: 2,
    colorTheme: { bg: '#FFE0EB', border: '#F8A5C2', text: '#A61E4D', name: 'Hồng phấn' },
  },
  {
    id: 2,
    name: 'Lớp 2',
    grade: 2,
    studentCount: 2,
    colorTheme: { bg: '#DCEBFA', border: '#8EC5FC', text: '#1F4E79', name: 'Xanh biển' },
  },
  {
    id: 3,
    name: 'Lớp 3',
    grade: 3,
    studentCount: 2,
    colorTheme: { bg: '#FFE0EB', border: '#F8A5C2', text: '#A61E4D', name: 'Hồng phấn' },
  },
  {
    id: 4,
    name: 'Lớp 4',
    grade: 4,
    studentCount: 3,
    colorTheme: { bg: '#DCEBFA', border: '#8EC5FC', text: '#1F4E79', name: 'Xanh biển' },
  },

  // Hàng 2 (xanh, hồng, xanh, hồng)
  {
    id: 5,
    name: 'Lớp 5',
    grade: 5,
    studentCount: 3,
    colorTheme: { bg: '#DCEBFA', border: '#8EC5FC', text: '#1F4E79', name: 'Xanh biển' },
  },
  {
    id: 6,
    name: 'Lớp 6',
    grade: 6,
    studentCount: 3,
    colorTheme: { bg: '#FFE0EB', border: '#F8A5C2', text: '#A61E4D', name: 'Hồng phấn' },
  },
  {
    id: 7,
    name: 'Lớp 7',
    grade: 7,
    studentCount: 4,
    colorTheme: { bg: '#DCEBFA', border: '#8EC5FC', text: '#1F4E79', name: 'Xanh biển' },
  },
  {
    id: 8,
    name: 'Lớp 8',
    grade: 8,
    studentCount: 4,
    colorTheme: { bg: '#FFE0EB', border: '#F8A5C2', text: '#A61E4D', name: 'Hồng phấn' },
  },

  // Hàng 3 (hồng, xanh, hồng, xanh)
  {
    id: 9,
    name: 'Lớp 9',
    grade: 9,
    studentCount: 5,
    colorTheme: { bg: '#FFE0EB', border: '#F8A5C2', text: '#A61E4D', name: 'Hồng phấn' },
  },
  {
    id: 10,
    name: 'Lớp 10',
    grade: 10,
    studentCount: 10,
    colorTheme: { bg: '#DCEBFA', border: '#8EC5FC', text: '#1F4E79', name: 'Xanh biển' },
  },
  {
    id: 11,
    name: 'Lớp 11',
    grade: 11,
    studentCount: 2,
    colorTheme: { bg: '#FFE0EB', border: '#F8A5C2', text: '#A61E4D', name: 'Hồng phấn' },
  },
  {
    id: 12,
    name: 'Lớp 12',
    grade: 12,
    studentCount: 2,
    colorTheme: { bg: '#DCEBFA', border: '#8EC5FC', text: '#1F4E79', name: 'Xanh biển' },
  },
];

export const ClassListPage: React.FC = () => {
  const navigate = useNavigate();

  // Danh sách các lớp học hiện tại
  const [classes, setClasses] = useState<ClassTileItem[]>(INITIAL_CLASS_TILES);

  // Trạng thái hover mẫu: Mặc định Lớp 10 có hiệu ứng nổi bật nhẹ
  const [hoveredTileId, setHoveredTileId] = useState<number | string | null>(10);

  // Trạng thái thông báo Toast phản hồi người dùng
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trạng thái Modal Thêm/Sửa lớp học
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassTileItem | null>(null);

  // Trạng thái Dialog Xác nhận xóa lớp học
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<ClassTileItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tổng số học sinh trong toàn bộ các lớp
  const totalStudents = classes.reduce((sum, item) => sum + (item.studentCount || 0), 0);

  // Xử lý chọn lớp học để xem chi tiết
  const handleSelectClass = (item: ClassTileItem) => {
    navigate(ROUTES.CLASS_DETAIL.replace(':id', String(item.id)));
  };

  // Mở modal thêm lớp học mới
  const handleOpenCreate = () => {
    setEditingClass(null);
    setIsFormModalOpen(true);
  };

  // Mở modal sửa thông tin lớp học và đổi màu sắc
  const handleOpenEdit = (item: ClassTileItem) => {
    setEditingClass(item);
    setIsFormModalOpen(true);
  };

  // Mở hộp thoại xác nhận xóa lớp học
  const handleOpenDelete = (item: ClassTileItem) => {
    setDeletingClass(item);
    setIsDeleteDialogOpen(true);
  };

  // Lưu lớp học (Thêm mới hoặc Cập nhật)
  const handleFormSubmit = (data: {
    name: string;
    grade: number;
    studentCount: number;
    colorTheme: ClassColorTheme;
  }) => {
    if (editingClass) {
      // Cập nhật lớp học hiện có
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingClass.id
            ? {
                ...c,
                name: data.name,
                grade: data.grade,
                studentCount: data.studentCount,
                colorTheme: data.colorTheme,
              }
            : c
        )
      );
      showToast(`Đã cập nhật lớp "${data.name}" và áp dụng màu sắc mới!`);
    } else {
      // Thêm mới một lớp học
      const newClass: ClassTileItem = {
        id: Date.now(),
        name: data.name,
        grade: data.grade,
        studentCount: data.studentCount,
        colorTheme: data.colorTheme,
      };
      setClasses((prev) => [...prev, newClass]);
      showToast(`Đã thêm thành công lớp học "${data.name}"!`);
    }
  };

  // Xóa lớp học khỏi danh sách
  const handleConfirmDelete = () => {
    if (!deletingClass) return;
    const name = deletingClass.name;
    setClasses((prev) => prev.filter((c) => c.id !== deletingClass.id));
    setDeletingClass(null);
    showToast(`Đã xóa lớp học "${name}" thành công.`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[1024px]">
        {/* Khung chứa chuẩn 1200px với padding 32px (chiều rộng nội dung đúng 1136px) */}
        <div className="w-[1200px] min-h-[1024px] p-8 flex flex-col justify-between box-border select-none relative">
          {/* Thông báo dạng Toast hiển thị phản hồi tức thì */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG (88px) ==================== */}
          <header className="h-[88px] flex items-center justify-between flex-shrink-0">
            <div className="flex flex-col justify-center">
              {/* Tiêu đề trang và huy hiệu sĩ số */}
              <div className="flex items-center gap-3">
                <h1 className="font-playfair text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Lớp học
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                  {classes.length} lớp · {totalStudents} học sinh
                </span>
              </div>

              {/* Dòng ghi chú viết tay đặc trưng của giáo viên và 2 hình dán pastel */}
              <div className="flex items-center gap-3 mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Bấm vào một lớp để xem học sinh và điểm danh nhé!
                  </span>
                </div>

                {/* 2 hình dán vector phẳng pastel (ngôi sao và ngòi bút nhỏ) */}
                <div className="flex items-center gap-2 pl-3">
                  {/* Hình dán 1: Ngôi sao pastel phẳng #F8A5C2 */}
                  <svg
                    className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                  </svg>

                  {/* Hình dán 2: Ngòi bút viết nhỏ pastel phẳng #2F6FA8 */}
                  <svg
                    className="w-6 h-6 text-[#2F6FA8] flex-shrink-0"
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

            {/* Phía bên phải: Nút Thêm lớp học cho Admin */}
            <div className="flex items-center">
              <button
                onClick={handleOpenCreate}
                className="h-[44px] px-4 rounded-[10px] bg-[#CFE8FF] hover:bg-[#BDE0FF] text-[#1F4E79] font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#1F4E79]" strokeWidth={2} />
                <span>Thêm lớp học</span>
              </button>
            </div>
          </header>

          {/* ==================== HÀNG 2: LƯỚI CÁC Ô VUÔNG LỚP HỌC (1136px) ==================== */}
          {/* Lưới 4 cột, mỗi ô vuông đúng 266×266px với khoảng cách 24px */}
          <div className="w-[1136px] grid grid-cols-4 gap-[24px] flex-shrink-0 py-2">
            {classes.map((item) => {
              const isHovered = hoveredTileId === item.id;
              const { bg, border, text } = item.colorTheme;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectClass(item)}
                  onMouseEnter={() => setHoveredTileId(item.id)}
                  onMouseLeave={() => setHoveredTileId(10)} // Khi rời chuột thì Lớp 10 giữ trạng thái hover mẫu
                  style={{
                    backgroundColor: bg,
                    borderColor: isHovered ? text : border,
                  }}
                  className={`group w-[266px] h-[266px] rounded-[20px] p-6 box-border flex flex-col justify-between cursor-pointer transition-all duration-200 relative select-none ${
                    isHovered
                      ? 'border-2 -translate-y-1 shadow-[0_8px_16px_rgba(59,42,53,0.12)]'
                      : 'border shadow-[0_1px_2px_rgba(59,42,53,0.06)]'
                  }`}
                >
                  {/* Hàng trên cùng: Biểu tượng cuốn sách và các nút thao tác CRUD (Sửa / Xóa) */}
                  <div className="flex items-center justify-between w-full">
                    {/* Góc trên bên trái: Vòng tròn trắng đặc 44px chứa biểu tượng cuốn sách mở viền nét */}
                    <div className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <BookOpen
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: text }}
                        strokeWidth={1.75}
                      />
                    </div>

                    {/* Góc trên bên phải: Các nút Sửa & Xóa ô vuông (Hiển thị mượt mà khi rê chuột) */}
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {/* Nút Sửa lớp & Đổi màu */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="w-8 h-8 rounded-[10px] bg-white/85 hover:bg-white text-[#6B5560] hover:text-[#2F6FA8] flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                            aria-label={`Sửa lớp ${item.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span>Sửa &amp; Đổi màu</span>
                        </TooltipContent>
                      </Tooltip>

                      {/* Nút Xóa lớp học */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDelete(item);
                            }}
                            className="w-8 h-8 rounded-[10px] bg-white/85 hover:bg-white text-[#6B5560] hover:text-[#A61E4D] flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                            aria-label={`Xóa lớp ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span>Xóa lớp học</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Khu vực chân ô: Tên lớp học bên trái và vòng tròn mũi tên bên phải */}
                  <div className="flex items-end justify-between w-full">
                    {/* Neo góc dưới bên trái: Tên lớp bằng Playfair Display 40px và số lượng học sinh */}
                    <div className="flex flex-col">
                      <span
                        className="font-playfair text-[40px] font-bold leading-none tracking-tight"
                        style={{ color: text }}
                      >
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 mt-2 font-nunito text-[16px] text-[#3B2A35] font-semibold leading-none">
                        <Users className="w-4 h-4 text-[#3B2A35] flex-shrink-0" strokeWidth={1.75} />
                        <span>{item.studentCount} học sinh</span>
                      </div>
                    </div>

                    {/* Góc dưới bên phải: Vòng tròn trắng 36px với biểu tượng chevron-right */}
                    <div className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center shadow-xs text-[#3B2A35] flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hộp thoại Modal Thêm/Sửa Lớp học & Đổi màu sắc */}
          <ClassFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editingClass}
          />

          {/* Hộp thoại Xác nhận Xóa lớp học */}
          <DeleteClassDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleConfirmDelete}
            targetClass={deletingClass}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
