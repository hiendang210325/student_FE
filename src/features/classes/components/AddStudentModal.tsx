import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Check, Loader2, Users } from 'lucide-react';
import { studentApi } from '@/features/students/api/studentApi';
import { Student } from '@/features/students/types/student.types';

interface AddStudentModalProps {
  isOpen: boolean;
  className: string;
  existingStudentIds: string[];
  onClose: () => void;
  onConfirmAdd: (studentIds: string[]) => Promise<void>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  className,
  existingStudentIds,
  onClose,
  onConfirmAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Đặt lại bộ lọc & lựa chọn mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedSearch('');
      setSelectedIds([]);
    }
  }, [isOpen]);

  // Debounce từ khóa tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCandidates = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const res = await studentApi.getStudents({
        page: 1,
        limit: 100,
        search: debouncedSearch || undefined,
        isDeleted: 'false',
      });
      setCandidates(res.data?.items || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách học sinh ứng viên:', err);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, debouncedSearch]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAlreadyInClass = (student: Student) =>
    existingStudentIds.includes(student.id) ||
    (Array.isArray(student.classes) && student.classes.includes(className));

  const handleToggleStudent = (student: Student) => {
    if (isAlreadyInClass(student)) return;
    setSelectedIds((prev) =>
      prev.includes(student.id)
        ? prev.filter((id) => id !== student.id)
        : [...prev, student.id]
    );
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmAdd(selectedIds);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHighlightedName = (name: string, query: string, isDisabled?: boolean) => {
    if (!query.trim()) {
      return <span>{name}</span>;
    }
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = name.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <span
              key={index}
              className={`bg-[#FFE0EB] px-0.5 rounded-[2px] ${
                isDisabled ? 'text-[#6B5560]' : 'text-[#3B2A35]'
              }`}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(59,42,53,0.35)] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-[0.5px] select-none"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full md:w-[min(720px,92vw)] lg:w-[720px] max-h-[90dvh] lg:h-[640px] bg-white rounded-t-[20px] md:rounded-[20px] shadow-2xl flex flex-col justify-between overflow-hidden border border-[#F3D9E3] relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#E5D3DC]" />
        </div>

        {/* PHẦN 1: ĐẦU HỘP THOẠI */}
        <div className="min-h-[72px] lg:h-[88px] px-5 md:px-8 py-3 lg:py-0 flex items-center justify-between border-b border-[#F3D9E3] flex-shrink-0">
          <div className="flex flex-col min-w-0 pr-2">
            <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight truncate">
              Thêm học sinh vào {className}
            </h2>
            <p className="font-nunito text-[14px] text-[#6B5560] mt-1">
              Chọn học sinh từ danh sách Học sinh hiện có trong hệ thống
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFE0EB]/60 transition-colors cursor-pointer flex-shrink-0"
            title="Đóng hộp thoại"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* PHẦN 2: THANH TÌM KIẾM */}
        <div className="px-5 md:px-8 py-3 flex flex-col justify-center flex-shrink-0 border-b border-[#F3D9E3]/60">
          <div className="relative flex items-center">
            <Search
              className="w-4 h-4 text-[#6B5560] absolute left-3.5 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã học sinh, họ tên hoặc email..."
              className="w-full h-[46px] pl-10 pr-10 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] text-[#3B2A35] font-nunito outline-none focus:ring-2 focus:ring-[#2F6FA8]/30 focus:border-[#2F6FA8] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-[#6B5560] hover:text-[#3B2A35] hover:bg-black/5 transition-colors cursor-pointer"
                title="Xóa từ khóa tìm kiếm"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
          <div className="text-[12px] text-[#6B5560] font-nunito font-medium mt-1.5">
            {isLoading ? 'Đang tìm kiếm học sinh...' : `Tìm thấy ${candidates.length} học sinh`}
          </div>
        </div>

        {/* PHẦN 3: DANH SÁCH HỌC SINH THẬT TỪ DB */}
        <div className="px-5 md:px-8 flex-1 overflow-y-auto divide-y divide-[#F3D9E3]">
          {isLoading ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center gap-2 text-[#6B5560]">
              <Loader2 className="w-6 h-6 animate-spin text-[#2F6FA8]" />
              <span className="text-sm font-nunito">Đang tải danh sách học sinh...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center gap-2 text-[#6B5560] text-center">
              <Users className="w-8 h-8 text-[#9C6B84]/50" />
              <span className="text-sm font-bold text-[#3B2A35]">
                Không tìm thấy học sinh phù hợp
              </span>
              <span className="text-xs">
                Hãy tạo tài khoản học sinh ở mục Tài khoản hoặc thử từ khóa khác.
              </span>
            </div>
          ) : (
            candidates.map((candidate, index) => {
              const disabled = isAlreadyInClass(candidate);
              const isChecked = selectedIds.includes(candidate.id) || disabled;
              const isPinkAvatar = index % 2 === 0;
              const activeClasses = (candidate.classes || []).filter(
                (c) => c && c !== 'Chưa xếp lớp'
              );
              const isUnassigned = activeClasses.length === 0;

              return (
                <div
                  key={candidate.id}
                  onClick={() => handleToggleStudent(candidate)}
                  className={`min-h-[64px] py-2 flex items-center justify-between px-2 transition-colors ${
                    disabled
                      ? 'cursor-not-allowed bg-white/50'
                      : 'cursor-pointer hover:bg-[#FFF6F9]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    {disabled ? (
                      <div className="w-6 h-6 rounded-[6px] bg-[#CBD5E1] border border-[#CBD5E1] flex items-center justify-center text-white flex-shrink-0 cursor-not-allowed">
                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    ) : isChecked ? (
                      <div className="w-6 h-6 rounded-[6px] bg-[#2F6FA8] flex items-center justify-center text-white flex-shrink-0">
                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-[6px] border-[1.5px] border-[#9C6B84] bg-white flex-shrink-0" />
                    )}

                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                        disabled
                          ? 'bg-[#EFE9ED] text-[#6B5560]'
                          : isPinkAvatar
                          ? 'bg-[#FFE0EB] text-[#A61E4D]'
                          : 'bg-[#DCEBFA] text-[#1F4E79]'
                      }`}
                    >
                      {getInitials(candidate.fullName)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-bold text-[14px] leading-tight truncate ${
                          disabled ? 'text-[#6B5560]' : 'text-[#3B2A35]'
                        }`}
                      >
                        {renderHighlightedName(candidate.fullName, searchQuery, disabled)}
                      </span>
                      <span className="text-[12px] text-[#6B5560] leading-none mt-1 truncate">
                        {candidate.email || 'Chưa cập nhật email'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={`text-[13px] font-mono font-semibold leading-tight ${
                        disabled ? 'text-[#6B5560]' : 'text-[#3B2A35]'
                      }`}
                    >
                      {candidate.studentCode}
                    </span>
                    <div className="mt-1">
                      {disabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] bg-[#DCEBFA] text-[#1F4E79] text-[11px] font-bold">
                          <Check className="w-3 h-3 text-[#1F4E79]" strokeWidth={2.2} />
                          <span>Đã trong lớp</span>
                        </span>
                      ) : isUnassigned ? (
                        <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[11px] font-bold">
                          Chưa xếp lớp
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[11px] font-bold">
                          {activeClasses.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PHẦN 4: CHÂN HỘP THOẠI */}
        <div className="min-h-[72px] lg:h-[80px] px-5 md:px-8 py-3 lg:py-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-[#F3D9E3] bg-[#FCF8FA] flex-shrink-0">
          <span className="px-3.5 py-1.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold text-center sm:text-left">
            Đã chọn {selectedIds.length} học sinh
          </span>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-full sm:w-auto h-[44px] sm:h-auto px-4 py-2 text-[14px] font-semibold text-[#6B5560] hover:text-[#3B2A35] transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={selectedIds.length === 0 || isSubmitting}
              onClick={handleConfirm}
              className="w-full sm:w-auto h-[46px] px-6 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                Thêm {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}học sinh vào {className}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
