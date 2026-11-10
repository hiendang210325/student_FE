import React, { useState } from 'react';
import { Search, X, Check } from 'lucide-react';

// Dữ liệu ứng viên học sinh có thể thêm vào lớp học
export interface CandidateStudent {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  currentClassStatus: string;
  isUnassigned?: boolean;
  isDisabled?: boolean;
}

// Danh sách chuẩn xác 5 học sinh trong kết quả tìm kiếm theo yêu cầu thiết kế
export const DEFAULT_CANDIDATES: CandidateStudent[] = [
  {
    id: 1,
    studentCode: 'HS0001',
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh.nguyen@gmail.com',
    currentClassStatus: 'Đang học: Lớp 9',
  },
  {
    id: 2,
    studentCode: 'HS0029',
    fullName: 'Đỗ Minh Quân',
    email: 'minhquan.do@gmail.com',
    currentClassStatus: 'Đang học: Lớp 8',
  },
  {
    id: 3,
    studentCode: 'HS0030',
    fullName: 'Lê Minh Châu',
    email: 'minhchau.le@gmail.com',
    currentClassStatus: 'Đang học: Lớp 11',
  },
  {
    id: 4,
    studentCode: 'HS0009',
    fullName: 'Hoàng Minh Khôi',
    email: 'minhkhoi.hoang@gmail.com',
    currentClassStatus: 'Đã trong lớp',
    isDisabled: true,
  },
  {
    id: 5,
    studentCode: 'HS0031',
    fullName: 'Vũ Minh Tuấn',
    email: 'minhtuan.vu@gmail.com',
    currentClassStatus: 'Chưa xếp lớp',
    isUnassigned: true,
  },
];

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdd: (addedStudents: CandidateStudent[]) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onConfirmAdd,
}) => {
  // Trạng thái ô tìm kiếm: Mặc định đã nhập "Minh" và hiển thị trạng thái focus
  const [searchQuery, setSearchQuery] = useState<string>('Minh');
  // Trạng thái chọn: Mặc định chọn học sinh hàng 1 và hàng 5 theo đặc tả
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 5]);

  if (!isOpen) return null;

  // Lấy các chữ cái đầu tiên của họ và tên để hiển thị trên avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Đổi trạng thái chọn/bỏ chọn học sinh
  const handleToggleStudent = (candidate: CandidateStudent) => {
    if (candidate.isDisabled) return; // Hàng bị vô hiệu hóa không thể chọn
    setSelectedIds((prev) =>
      prev.includes(candidate.id)
        ? prev.filter((id) => id !== candidate.id)
        : [...prev, candidate.id]
    );
  };

  // Xác nhận thêm học sinh đã chọn vào lớp
  const handleConfirm = () => {
    const toAdd = DEFAULT_CANDIDATES.filter((c) => selectedIds.includes(c.id));
    onConfirmAdd(toAdd);
    onClose();
  };

  // Hàm tô sáng từ khóa "Minh" trên nền #FFE0EB, giữ nguyên màu chữ gốc
  const renderHighlightedName = (name: string, query: string, isDisabled?: boolean) => {
    if (!query) {
      return <span>{name}</span>;
    }
    const parts = name.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
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
      className="fixed inset-0 z-50 bg-[rgba(59,42,53,0.35)] flex items-center justify-center p-4 backdrop-blur-[0.5px] select-none"
      onClick={onClose}
    >
      {/* Khung Hộp thoại Modal: Rộng 720px, Cao 640px, Bo góc 20px, Nền trắng, Đổ bóng mềm */}
      <div
        className="w-[720px] h-[640px] bg-white rounded-[20px] shadow-2xl flex flex-col justify-between overflow-hidden border border-[#F3D9E3] relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== PHẦN 1: ĐẦU TRANG MODAL (88px) ==================== */}
        <div className="h-[88px] px-8 flex items-center justify-between border-b border-[#F3D9E3] flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
              Thêm học sinh vào Lớp 10
            </h2>
            <p className="font-nunito text-[14px] text-[#6B5560] mt-1">
              Chọn học sinh đã tạo ở mục Học sinh
            </p>
          </div>
          {/* Nút đóng (×) ở góc phải */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFE0EB]/60 transition-colors cursor-pointer"
            title="Đóng hộp thoại"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* ==================== PHẦN 2: THANH TÌM KIẾM (72px) ==================== */}
        <div className="h-[72px] px-8 flex flex-col justify-center flex-shrink-0">
          <div className="relative flex items-center">
            {/* Biểu tượng tìm kiếm */}
            <Search
              className="w-4 h-4 text-[#6B5560] absolute left-3.5 pointer-events-none"
              strokeWidth={1.75}
            />
            {/* Ô nhập liệu tìm kiếm cao 48px, bo góc 12px, viền #9C6B84, viền ngoài focus 2px #2F6FA8 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã học sinh hoặc tên học sinh"
              className="w-full h-[48px] pl-10 pr-10 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] text-[#3B2A35] font-nunito outline-none ring-2 ring-[#2F6FA8] transition-all"
            />
            {/* Nút xóa từ khóa tìm kiếm (×) */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-[#6B5560] hover:text-[#3B2A35] hover:bg-black/5 transition-colors cursor-pointer"
                title="Xóa từ khóa tìm kiếm"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
          {/* Dòng thông báo số lượng học sinh tìm thấy */}
          <div className="text-[12px] text-[#6B5560] font-nunito font-medium mt-1">
            Tìm thấy 5 học sinh
          </div>
        </div>

        {/* ==================== PHẦN 3: DANH SÁCH 5 HÀNG HỌC SINH (5 × 64px = 320px) ==================== */}
        <div className="px-8 flex-1 flex flex-col justify-center">
          {DEFAULT_CANDIDATES.map((candidate, index) => {
            const isChecked = selectedIds.includes(candidate.id) || candidate.isDisabled;
            const isPinkAvatar = index % 2 === 0;

            return (
              <div
                key={candidate.id}
                onClick={() => handleToggleStudent(candidate)}
                className={`h-[64px] flex items-center justify-between border-b border-[#F3D9E3] px-2 transition-colors ${
                  candidate.isDisabled
                    ? 'cursor-not-allowed bg-white/50'
                    : 'cursor-pointer hover:bg-[#FFF6F9]'
                }`}
              >
                {/* Khu vực bên trái: Hộp kiểm 24px, Avatar 36px và Tên/Email */}
                <div className="flex items-center gap-3">
                  {/* Hộp kiểm Checkbox 24px */}
                  {candidate.isDisabled ? (
                    // Hàng bị vô hiệu hóa: Hộp kiểm xám và có dấu tích
                    <div className="w-6 h-6 rounded-[6px] bg-[#CBD5E1] border border-[#CBD5E1] flex items-center justify-center text-white flex-shrink-0 cursor-not-allowed">
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  ) : isChecked ? (
                    // Hộp kiểm được chọn: Nền màu xanh #2F6FA8 với dấu tích màu trắng
                    <div className="w-6 h-6 rounded-[6px] bg-[#2F6FA8] flex items-center justify-center text-white flex-shrink-0">
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    // Hộp kiểm chưa chọn: Nền trắng với viền #9C6B84
                    <div className="w-6 h-6 rounded-[6px] border-[1.5px] border-[#9C6B84] bg-white flex-shrink-0" />
                  )}

                  {/* Avatar chữ cái đầu 36px xen kẽ màu hồng và xanh */}
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                      candidate.isDisabled
                        ? 'bg-[#EFE9ED] text-[#6B5560]'
                        : isPinkAvatar
                          ? 'bg-[#FFE0EB] text-[#A61E4D]'
                          : 'bg-[#DCEBFA] text-[#1F4E79]'
                    }`}
                  >
                    {getInitials(candidate.fullName)}
                  </div>

                  {/* Họ tên và Email học sinh */}
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-[14px] leading-tight ${
                        candidate.isDisabled ? 'text-[#6B5560]' : 'text-[#3B2A35]'
                      }`}
                    >
                      {renderHighlightedName(candidate.fullName, searchQuery, candidate.isDisabled)}
                    </span>
                    <span className="text-[12px] text-[#6B5560] leading-none mt-1">
                      {candidate.email}
                    </span>
                  </div>
                </div>

                {/* Khu vực bên phải: Mã học sinh và Chip lớp học hiện tại */}
                <div className="flex flex-col items-end">
                  <span
                    className={`text-[13px] font-semibold leading-tight ${
                      candidate.isDisabled ? 'text-[#6B5560]' : 'text-[#3B2A35]'
                    }`}
                  >
                    {candidate.studentCode}
                  </span>
                  <div className="mt-1">
                    {candidate.isDisabled ? (
                      // Huy hiệu học sinh đã trong lớp: có biểu tượng Check, nền #DCEBFA, chữ #1F4E79
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] bg-[#DCEBFA] text-[#1F4E79] text-[11px] font-bold">
                        <Check className="w-3 h-3 text-[#1F4E79]" strokeWidth={2.2} />
                        <span>Đã trong lớp</span>
                      </span>
                    ) : candidate.isUnassigned ? (
                      // Huy hiệu học sinh chưa xếp lớp: nền #FFE0EB, chữ #A61E4D
                      <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[11px] font-bold">
                        Chưa xếp lớp
                      </span>
                    ) : (
                      // Huy hiệu lớp học hiện tại: nền #E9F3FF, chữ #1F4E79
                      <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[11px] font-bold">
                        {candidate.currentClassStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== PHẦN 4: CHÂN MODAL CỐ ĐỊNH (80px) ==================== */}
        <div className="h-[80px] px-8 flex items-center justify-between border-t border-[#F3D9E3] bg-[#FCF8FA] flex-shrink-0">
          {/* Bên trái: Chip đếm số lượng học sinh được chọn */}
          <span className="px-3.5 py-1.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold">
            Đã chọn {selectedIds.length} học sinh
          </span>

          {/* Bên phải: Nút Hủy và Nút Thêm học sinh chính */}
          <div className="flex items-center gap-4">
            {/* Nút chữ Hủy */}
            <button
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-semibold text-[#6B5560] hover:text-[#3B2A35] transition-colors cursor-pointer"
            >
              Hủy
            </button>

            {/* Nút chính: Thêm vào Lớp 10 (nền quả mâm xôi #D6336C, chữ trắng, cao 48px) */}
            <button
              onClick={handleConfirm}
              className="h-[48px] px-6 rounded-[10px] bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold text-[14px] transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
            >
              Thêm {selectedIds.length} học sinh vào Lớp 10
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

