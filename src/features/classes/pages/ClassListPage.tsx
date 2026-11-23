import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCw,
  Search,
  X,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { ClassRoom, ClassPayload } from '../types/class.types';
import { classApi } from '../api/classApi';
import { ClassFormModal, PRESET_COLOR_THEMES } from '../components/ClassFormModal';
import { DeleteClassDialog } from '../components/DeleteClassDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TileGrid } from '@/components/common/TileGrid/TileGrid';
import { ApiError } from '@/services/api/apiError';

export const ClassListPage: React.FC = () => {
  const navigate = useNavigate();

  // Dữ liệu lớp học thật từ MongoDB (không dùng dữ liệu mẫu tĩnh)
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tìm kiếm & lọc theo khối
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

  // Trạng thái hover & thông báo
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trạng thái Modal Thêm/Sửa & Xóa lớp học
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<ClassRoom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await classApi.getClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách lớp học:', err);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể kết nối máy chủ để tải danh sách lớp học.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchClasses();
      showToast('Đã làm mới danh sách lớp học!');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Tổng số lượt học sinh đang theo học trên toàn bộ các lớp
  const totalStudents = useMemo(
    () => classes.reduce((sum, item) => sum + (item.totalStudents || 0), 0),
    [classes]
  );

  // Danh sách các khối lớp đang tồn tại để hiển thị trong bộ lọc
  const availableGrades = useMemo(() => {
    const grades = Array.from(new Set(classes.map((c) => c.grade))).sort((a, b) => a - b);
    return grades;
  }, [classes]);

  // Danh sách lớp học sau khi tìm kiếm & lọc
  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classes.filter((item) => {
      const matchGrade = selectedGrade === 'ALL' || String(item.grade) === selectedGrade;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.homeroomTeacher || '').toLowerCase().includes(q) ||
        (item.roomNumber || '').toLowerCase().includes(q) ||
        (item.schedule || '').toLowerCase().includes(q);
      return matchGrade && matchSearch;
    });
  }, [classes, searchQuery, selectedGrade]);

  const handleSelectClass = (item: ClassRoom) => {
    navigate(ROUTES.CLASS_DETAIL.replace(':id', String(item.id)));
  };

  const handleOpenCreate = () => {
    setEditingClass(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: ClassRoom) => {
    setEditingClass(item);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (item: ClassRoom) => {
    setDeletingClass(item);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ClassPayload) => {
    if (editingClass) {
      await classApi.updateClass(editingClass.id, data);
      await fetchClasses();
      showToast(`Đã cập nhật lớp "${data.name}" thành công!`);
    } else {
      await classApi.createClass(data);
      await fetchClasses();
      showToast(`Đã tạo thành công lớp học "${data.name}"!`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingClass) return;
    setIsDeleting(true);
    try {
      const name = deletingClass.name;
      await classApi.deleteClass(deletingClass.id);
      setIsDeleteDialogOpen(false);
      setDeletingClass(null);
      await fetchClasses();
      showToast(`Đã xóa lớp học "${name}" thành công.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Không thể xóa lớp học lúc này.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh]">
        <div className="w-full lg:w-[1200px] p-0 lg:p-8 flex flex-col gap-5 md:gap-6 box-border select-none relative">
          {/* Thông báo nổi */}
          {toastMessage && (
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
          <header className="min-h-[72px] lg:h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Lớp học
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                  {classes.length} lớp · {totalStudents} lượt học sinh
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Bấm vào một lớp để xem học sinh và điểm danh nhé!
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-2 pl-3">
                  <svg
                    className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                  </svg>
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

            {/* Phía bên phải: Nút Làm mới & Thêm lớp học */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-[44px] px-4 rounded-[10px] border border-[#9C6B84] bg-white hover:bg-[#FFE0EB]/40 text-[#3B2A35] font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <RotateCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  strokeWidth={1.75}
                />
                <span className="hidden sm:inline">Làm mới</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex-1 md:flex-none min-h-[44px] h-[44px] px-4 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4 text-white" strokeWidth={2.2} />
                <span>Thêm lớp học</span>
              </button>
            </div>
          </header>

          {/* ==================== THANH TÌM KIẾM & LỌC KHỐI ==================== */}
          {classes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-[14px] border border-[#F3D9E3] shadow-2xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9C6B84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên lớp, phòng học, giáo viên hoặc lịch học..."
                  className="w-full h-[42px] pl-10 pr-9 rounded-[10px] border border-[#F3D9E3] bg-[#FFF6F9]/40 focus:bg-white text-[14px] text-[#3B2A35] placeholder:text-[#6B5560]/70 focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 focus:border-[#2F6FA8] transition-all"
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

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="h-[42px] px-3.5 rounded-[10px] border border-[#9C6B84] bg-white text-[13px] font-bold text-[#3B2A35] focus:outline-none focus:ring-2 focus:ring-[#2F6FA8]/20 cursor-pointer sm:w-[170px]"
              >
                <option value="ALL">Tất cả các khối</option>
                {availableGrades.map((g) => (
                  <option key={g} value={String(g)}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Thông báo lỗi kết nối */}
          {error && (
            <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchClasses}
                className="underline font-bold hover:text-amber-900 cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* ==================== HÀNG 2: LƯỚI CÁC Ô VUÔNG LỚP HỌC ==================== */}
          {isLoading ? (
            <div className="min-h-[380px] rounded-[16px] bg-white border border-[#F3D9E3] flex flex-col items-center justify-center gap-3 text-[#6B5560]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2F6FA8]" />
              <span className="text-sm font-semibold">Đang tải danh sách lớp học...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="min-h-[420px] rounded-[16px] bg-white border border-dashed border-[#F3D9E3] p-8 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center">
                <BookOpen className="w-8 h-8" strokeWidth={1.75} />
              </div>
              <div className="space-y-1 max-w-md">
                <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                  Chưa có lớp học nào
                </h2>
                <p className="font-nunito text-[14px] text-[#6B5560]">
                  Hãy tự tạo các ô vuông lớp học đầu tiên theo nhu cầu giảng dạy của bạn (ví dụ: Văn 9A, Ôn thi vào 10...) và chọn màu sắc hiển thị yêu thích.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="h-[46px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2.2} />
                <span>Tạo lớp học đầu tiên</span>
              </button>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="min-h-[300px] rounded-[16px] bg-white border border-[#F3D9E3] p-8 flex flex-col items-center justify-center text-center gap-2 text-[#6B5560]">
              <BookOpen className="w-8 h-8 text-[#9C6B84]/50" />
              <span className="font-bold text-[15px] text-[#3B2A35]">
                Không tìm thấy lớp học phù hợp
              </span>
              <span className="text-[13px]">Thử thay đổi từ khóa tìm kiếm hoặc chọn khối khác.</span>
            </div>
          ) : (
            <TileGrid className="lg:w-[1136px] flex-shrink-0 py-1 lg:py-2">
              {filteredClasses.map((item, idx) => {
                const isHovered = hoveredTileId === item.id;
                const fallbackTheme = PRESET_COLOR_THEMES[idx % PRESET_COLOR_THEMES.length];
                const bg = item.colorTheme?.bg || fallbackTheme.bg;
                const border = item.colorTheme?.border || fallbackTheme.border;
                const text = item.colorTheme?.text || fallbackTheme.text;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectClass(item)}
                    onMouseEnter={() => setHoveredTileId(item.id)}
                    onMouseLeave={() => setHoveredTileId(null)}
                    style={{
                      backgroundColor: bg,
                      borderColor: isHovered ? text : border,
                    }}
                    className={`group aspect-square w-full lg:w-[266px] lg:h-[266px] rounded-[16px] lg:rounded-[20px] p-4 md:p-5 lg:p-6 box-border flex flex-col justify-between cursor-pointer transition-all duration-200 relative select-none ${
                      isHovered
                        ? 'border-2 -translate-y-1 shadow-[0_8px_16px_rgba(59,42,53,0.12)]'
                        : 'border shadow-[0_1px_2px_rgba(59,42,53,0.06)]'
                    }`}
                  >
                    {/* Hàng trên cùng */}
                    <div className="flex items-center justify-between w-full">
                      <div className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0">
                        <BookOpen
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: text }}
                          strokeWidth={1.75}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
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

                    {/* Khu vực chân ô */}
                    <div className="flex items-end justify-between w-full gap-2">
                      <div className="flex flex-col min-w-0">
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1"
                          style={{ color: text }}
                        >
                          Khối {item.grade} {item.roomNumber ? `· ${item.roomNumber}` : ''}
                        </span>
                        <span
                          className="font-playfair text-[24px] md:text-[28px] lg:text-[32px] font-bold leading-tight tracking-tight truncate"
                          style={{ color: text }}
                          title={item.name}
                        >
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5 font-nunito text-[14px] text-[#3B2A35] font-semibold leading-none">
                          <Users className="w-4 h-4 text-[#3B2A35] flex-shrink-0" strokeWidth={1.75} />
                          <span className="truncate">
                            {item.totalStudents}
                            {item.maxCapacity ? `/${item.maxCapacity}` : ''} học sinh
                          </span>
                        </div>
                        {item.schedule && (
                          <div className="flex items-center gap-1 mt-1.5 font-nunito text-[11px] text-[#6B5560] font-medium truncate">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{item.schedule}</span>
                          </div>
                        )}
                      </div>

                      <div className="w-8 h-8 lg:w-[36px] lg:h-[36px] rounded-full bg-white flex items-center justify-center shadow-xs text-[#3B2A35] flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </TileGrid>
          )}

          {/* Hộp thoại Thêm/Sửa Lớp học & Đổi màu sắc */}
          <ClassFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editingClass}
          />

          {/* Hộp thoại Xác nhận Xóa lớp học */}
          <DeleteClassDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
            onConfirm={handleConfirmDelete}
            targetClass={deletingClass}
            isLoading={isDeleting}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
