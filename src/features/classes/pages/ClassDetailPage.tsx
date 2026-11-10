import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Pause,
  UserMinus,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { AddStudentModal, CandidateStudent } from '../components/AddStudentModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Kiểu dữ liệu học sinh trong lớp học
interface StudentInClass {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  gender: 'Nam' | 'Nữ';
  parentPhone: string;
  status: 'Đang học' | 'Bảo lưu';
}

// Danh sách đúng 10 học sinh của Lớp 10 theo đặc tả thiết kế
const INITIAL_CLASS_10_STUDENTS: StudentInClass[] = [
  {
    id: 1,
    studentCode: 'HS0007',
    fullName: 'Phạm Hoàng Nam',
    email: 'hoangnam.pham@gmail.com',
    gender: 'Nam',
    parentPhone: '0900 111 207',
    status: 'Đang học',
  },
  {
    id: 2,
    studentCode: 'HS0009',
    fullName: 'Hoàng Minh Khôi',
    email: 'minhkhoi.hoang@gmail.com',
    gender: 'Nam',
    parentPhone: '0900 111 209',
    status: 'Đang học',
  },
  {
    id: 3,
    studentCode: 'HS0021',
    fullName: 'Nguyễn Thu Hà',
    email: 'thuha.nguyen@gmail.com',
    gender: 'Nữ',
    parentPhone: '0900 111 221',
    status: 'Đang học',
  },
  {
    id: 4,
    studentCode: 'HS0022',
    fullName: 'Trần Đức Anh',
    email: 'ducanh.tran@gmail.com',
    gender: 'Nam',
    parentPhone: '0900 111 222',
    status: 'Đang học',
  },
  {
    id: 5,
    studentCode: 'HS0023',
    fullName: 'Lê Phương Thảo',
    email: 'phuongthao.le@gmail.com',
    gender: 'Nữ',
    parentPhone: '0900 111 223',
    status: 'Đang học',
  },
  {
    id: 6,
    studentCode: 'HS0024',
    fullName: 'Võ Thành Đạt',
    email: 'thanhdat.vo@gmail.com',
    gender: 'Nam',
    parentPhone: '0900 111 224',
    status: 'Bảo lưu',
  },
  {
    id: 7,
    studentCode: 'HS0025',
    fullName: 'Đặng Khánh Vy',
    email: 'khanhvy.dang@gmail.com',
    gender: 'Nữ',
    parentPhone: '0900 111 225',
    status: 'Đang học',
  },
  {
    id: 8,
    studentCode: 'HS0026',
    fullName: 'Bùi Quốc Bảo',
    email: 'quocbao.bui@gmail.com',
    gender: 'Nam',
    parentPhone: '0900 111 226',
    status: 'Đang học',
  },
  {
    id: 9,
    studentCode: 'HS0027',
    fullName: 'Phan Ngọc Mai',
    email: 'ngocmai.phan@gmail.com',
    gender: 'Nữ',
    parentPhone: '0900 111 227',
    status: 'Đang học',
  },
  {
    id: 10,
    studentCode: 'HS0028',
    fullName: 'Dương Hải Đăng',
    email: 'haidang.duong@gmail.com',
    gender: 'Nam',
    parentPhone: '0900 111 228',
    status: 'Đang học',
  },
];

export const ClassDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentInClass[]>(INITIAL_CLASS_10_STUDENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Trạng thái mở Modal Thêm học sinh: Mặc định là false để hiển thị trọn vẹn giao diện chi tiết lớp học trước
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  // Danh sách ID học sinh đã được điểm danh trong lớp học
  const [attendedStudentIds, setAttendedStudentIds] = useState<number[]>([1, 2, 4]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Hàm tạo ký tự đại diện (Avatar Initials) từ họ và tên tiếng Việt
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Xử lý thao tác xóa học sinh khỏi lớp học
  const handleRemoveFromClass = (student: StudentInClass) => {
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    showToast(`Đã xóa học sinh ${student.fullName} khỏi Lớp 10.`);
  };

  // Xử lý nút Thêm học sinh: Mở lại Modal
  const handleAddStudentAction = () => {
    setIsAddModalOpen(true);
  };

  // Xử lý điểm danh cho từng học sinh trong lớp
  const handleToggleAttendance = (student: StudentInClass) => {
    setAttendedStudentIds((prev) => {
      const isAttended = prev.includes(student.id);
      if (isAttended) {
        showToast(`Đã hủy điểm danh cho ${student.fullName}.`);
        return prev.filter((id) => id !== student.id);
      } else {
        showToast(`Đã điểm danh cho ${student.fullName} thành công!`);
        return [...prev, student.id];
      }
    });
  };

  // Xử lý xác nhận thêm học sinh từ Modal vào Lớp 10
  const handleConfirmAddStudents = (candidatesToAdd: CandidateStudent[]) => {
    const newStudents: StudentInClass[] = candidatesToAdd.map((c, index) => ({
      id: Date.now() + index,
      studentCode: c.studentCode,
      fullName: c.fullName,
      email: c.email,
      gender: c.fullName.includes('Anh') || c.fullName.includes('Châu') || c.fullName.includes('Mai') ? 'Nữ' : 'Nam',
      parentPhone: '0900 111 888',
      status: 'Đang học',
    }));

    setStudents((prev) => [...prev, ...newStudents]);
    showToast(`Đã thêm ${candidatesToAdd.length} học sinh vào Lớp 10 thành công!`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[976px]">
        {/* Khung nội dung chuẩn 1200px với padding 32px (chiều rộng nội dung đúng 1136px) */}
        <div className="w-[1200px] h-[976px] p-8 flex flex-col justify-between box-border select-none relative">
        {/* Thông báo dạng Toast hiển thị phản hồi tức thì */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ==================== HÀNG 1: HEADER (88px) ==================== */}
        <header className="h-[88px] flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col justify-center">
            {/* Dòng Breadcrumb trên tiêu đề: nút mũi tên quay lại và đường dẫn */}
            <div className="flex items-center gap-1.5 mb-1 text-[14px] text-[#6B5560]">
              <button
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
              <span className="text-[#6B5560] font-semibold">Lớp 10</span>
            </div>

            {/* Tiêu đề trang và huy hiệu sĩ số */}
            <div className="flex items-center gap-3">
              <h1 className="font-playfair text-[28px] font-bold text-[#3B2A35] leading-tight">
                Lớp 10
              </h1>
              <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                {students.length} học sinh
              </span>
            </div>

            {/* Dòng ghi chú viết tay của giáo viên và 2 hình dán pastel */}
            <div className="flex items-center gap-3 mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Thêm học sinh đã tạo ở mục Học sinh vào lớp này nhé!
                </span>
              </div>

              {/* 2 hình dán vector phẳng pastel cách các phần tử 24px */}
              <div className="flex items-center gap-2 ml-6">
                {/* Hình dán 1: Ngôi sao pastel #F8A5C2 */}
                <svg
                  className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                </svg>

                {/* Hình dán 2: Ngòi bút viết nhỏ pastel #2F6FA8 */}
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

          {/* Phía bên phải: Nút Thêm học sinh */}
          <div className="flex items-center">
            {/* Nút: Thêm học sinh (nền #CFE8FF, chữ #1F4E79) */}
            <button
              onClick={handleAddStudentAction}
              className="h-[44px] px-4 rounded-[10px] bg-[#CFE8FF] hover:bg-[#BDE0FF] text-[#1F4E79] font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
              <span>Thêm học sinh</span>
            </button>
          </div>
        </header>

        {/* ==================== HÀNG 2: THẺ TRẮNG DUY NHẤT (800px) ==================== */}
        {/* Thẻ trắng bo góc 16px, viền 1px #F3D9E3, chiếm trọn chiều cao còn lại 800px */}
        <div className="w-[1136px] h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col justify-between overflow-hidden flex-shrink-0">
          {/* Thanh tiêu đề thẻ (72px) */}
          <div className="h-[72px] px-6 flex items-center justify-between border-b border-[#F3D9E3] flex-shrink-0">
            <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
              Danh sách học sinh lớp 10
            </h2>
            <span className="font-nunito text-[14px] font-semibold text-[#6B5560]">
              {students.length} học sinh
            </span>
          </div>

          {/* Tiêu đề bảng (48px): Nền #DCEBFA, chữ #1F4E79, 13px semibold */}
          <div className="h-[48px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-semibold flex items-center border-b border-[#F3D9E3] flex-shrink-0">
            <div className="w-[130px] pl-6 flex-shrink-0">Mã học sinh</div>
            <div className="w-[330px] flex-shrink-0">Họ và tên</div>
            <div className="w-[120px] text-center flex-shrink-0">Giới tính</div>
            <div className="w-[220px] flex-shrink-0">Số điện thoại phụ huynh</div>
            <div className="w-[170px] flex-shrink-0">Trạng thái</div>
            <div className="w-[164px] pr-6 text-center flex-shrink-0">Thao tác</div>
          </div>

          {/* Đúng 10 hàng học sinh (mỗi hàng cao 64px, tổng 640px) */}
          <div className="flex-1 flex flex-col">
            {students.map((student, index) => {
              const isPinkAvatar = index % 2 === 0;
              const isStudying = student.status === 'Đang học';
              const isAttended = attendedStudentIds.includes(student.id);

              return (
                <div
                  key={student.id}
                  className="h-[64px] bg-white hover:bg-[#FFF6F9] border-b border-[#F3D9E3] flex items-center transition-colors select-none text-[14px]"
                >
                  {/* Cột 1: Mã học sinh (130px) */}
                  <div className="w-[130px] pl-6 font-semibold text-[#3B2A35] flex-shrink-0">
                    {student.studentCode}
                  </div>

                  {/* Cột 2: Họ và tên kèm Avatar và Email (330px) */}
                  <div className="w-[330px] flex items-center gap-3 flex-shrink-0 pr-4">
                    {/* Avatar chữ cái đầu 36px xen kẽ hồng và xanh */}
                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${
                        isPinkAvatar
                          ? 'bg-[#FFE0EB] text-[#A61E4D]'
                          : 'bg-[#DCEBFA] text-[#1F4E79]'
                      }`}
                    >
                      {getInitials(student.fullName)}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-[#3B2A35] leading-tight truncate">
                        {student.fullName}
                      </span>
                      <span className="text-[12px] text-[#6B5560] leading-none mt-1 truncate">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  {/* Cột 3: Giới tính (120px) */}
                  <div className="w-[120px] text-center font-medium text-[#3B2A35] flex-shrink-0">
                    {student.gender}
                  </div>

                  {/* Cột 4: Số điện thoại phụ huynh (220px) */}
                  <div className="w-[220px] font-medium text-[#3B2A35] tracking-tight flex-shrink-0">
                    {student.parentPhone}
                  </div>

                  {/* Cột 5: Trạng thái (170px) có cả biểu tượng và văn bản */}
                  <div className="w-[170px] flex-shrink-0">
                    {isStudying ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                        <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2.2} />
                        <span>Đang học</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                        <Pause className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={2} />
                        <span>Bảo lưu</span>
                      </span>
                    )}
                  </div>

                  {/* Cột 6: Thao tác - Nút Điểm danh và Nút Xóa khỏi lớp cho từng học sinh */}
                  <div className="w-[164px] pr-6 flex justify-center items-center gap-1.5 flex-shrink-0">
                    {/* Nút Điểm danh từng học sinh */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleToggleAttendance(student)}
                          className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all cursor-pointer ${
                            isAttended
                              ? 'bg-[#DCEBFA] text-[#1F4E79] hover:bg-[#CFE8FF] shadow-xs'
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

                    {/* Nút Xóa khỏi lớp */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleRemoveFromClass(student)}
                          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#A61E4D] hover:bg-[#FFE0EB] transition-colors cursor-pointer"
                          aria-label={`Xóa ${student.fullName} khỏi lớp`}
                        >
                          <UserMinus className="w-[18px] h-[18px]" strokeWidth={1.75} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <span>Xóa khỏi lớp</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chân thẻ cố định (40px): Hiển thị tổng số học sinh của Lớp 10 */}
          <div className="h-[40px] px-6 border-t border-[#F3D9E3] bg-[#FCF8FA] flex items-center justify-between flex-shrink-0">
            <span className="font-nunito text-[13px] text-[#6B5560] font-medium">
              Lớp 10 có {students.length} học sinh
            </span>
          </div>
        </div>

        {/* Hộp thoại Modal: Thêm học sinh vào Lớp 10 hiển thị trên lớp phủ mờ rgba(59,42,53,0.35) */}
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onConfirmAdd={handleConfirmAddStudents}
        />
      </div>
    </div>
  </TooltipProvider>
);
};

