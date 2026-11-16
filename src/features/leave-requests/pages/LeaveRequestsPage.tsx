import React, { useState } from 'react';
import {
  Clock,
  Check,
  X,
  ChevronRight,
  FileText,
  Lock,
  Calendar,
  Info,
  Send,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { TileGrid } from '@/components/common/TileGrid/TileGrid';

// Trạng thái của đơn xin nghỉ
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Bộ lọc trên thanh điều khiển phân đoạn (Segmented Control) của Admin
type FilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface LeaveRequestTile {
  id: number;
  studentName: string;
  className: string;
  leaveDate: string;
  submittedAt: string;
  reason: string;
  status: LeaveStatus;
}

interface StudentSentLeaveItem {
  id: number;
  leaveDate: string;
  className: string;
  reason: string;
  status: LeaveStatus;
}

// Danh sách đúng 12 ô đơn xin nghỉ cho màn hình Admin (Chờ duyệt đứng đầu)
const INITIAL_LEAVE_REQUEST_TILES: LeaveRequestTile[] = [
  {
    id: 1,
    studentName: 'Nguyễn Minh Anh',
    className: 'Lớp 9',
    leaveDate: '10/11/2026',
    submittedAt: 'Gửi lúc 18:42, 09/11/2026',
    reason:
      'Em bị sốt và đã đi khám bác sĩ. Bác sĩ dặn em nghỉ ngơi ở nhà. Em xin phép cô cho em nghỉ buổi học ngày 10/11 và em sẽ làm bài tập bù ạ.',
    status: 'PENDING',
  },
  {
    id: 2,
    studentName: 'Trần Gia Bảo',
    className: 'Lớp 8',
    leaveDate: '11/11/2026',
    submittedAt: 'Gửi lúc 19:15, 09/11/2026',
    reason:
      'Gia đình em có việc bận đột xuất phải về quê nội trong ngày 11/11. Em xin phép cô cho em nghỉ một buổi và em sẽ mượn vở bạn chép bài đầy đủ ạ.',
    status: 'PENDING',
  },
  {
    id: 3,
    studentName: 'Lê Khánh Linh',
    className: 'Lớp 7',
    leaveDate: '12/11/2026',
    submittedAt: 'Gửi lúc 20:05, 09/11/2026',
    reason:
      'Em có lịch hẹn tái khám răng tại bệnh viện vào chiều ngày 12/11 trùng với giờ học. Em xin phép cô cho em nghỉ buổi học hôm đó và nộp bài tập đúng hạn ạ.',
    status: 'PENDING',
  },
  {
    id: 4,
    studentName: 'Đỗ Gia Hân',
    className: 'Lớp 9',
    leaveDate: '06/11/2026',
    submittedAt: 'Gửi lúc 17:20, 05/11/2026',
    reason:
      'Em bị cảm lạnh và đau họng nhiều nên không thể đến lớp ngày 06/11. Em xin phép cô cho em nghỉ ở nhà uống thuốc và em sẽ hoàn thành bài viết văn gửi cô chấm ạ.',
    status: 'APPROVED',
  },
  {
    id: 5,
    studentName: 'Vũ Quang Huy',
    className: 'Lớp 8',
    leaveDate: '04/11/2026',
    submittedAt: 'Gửi lúc 16:45, 03/11/2026',
    reason:
      'Trường em tổ chức thi đấu thể thao cấp quận vào chiều ngày 04/11. Em xin phép cô cho em nghỉ một buổi học và hứa sẽ xem lại tài liệu cô gửi trên web ạ.',
    status: 'APPROVED',
  },
  {
    id: 6,
    studentName: 'Phạm Hoàng Nam',
    className: 'Lớp 10',
    leaveDate: '03/11/2026',
    submittedAt: 'Gửi lúc 18:10, 02/11/2026',
    reason:
      'Em bị đau dạ dày cần đi kiểm tra sức khỏe cùng mẹ vào chiều 03/11. Em xin phép cô cho em nghỉ buổi học này và em sẽ làm bù bài nghị luận xã hội ạ.',
    status: 'APPROVED',
  },
  {
    id: 7,
    studentName: 'Hoàng Minh Khôi',
    className: 'Lớp 10',
    leaveDate: '30/10/2026',
    submittedAt: 'Gửi lúc 19:00, 29/10/2026',
    reason:
      'Nhà em có giỗ ông nội ở quê nên bố mẹ xin phép cho em nghỉ buổi học ngày 30/10. Em sẽ đọc kỹ đề bài trên hệ thống và nộp bài đúng thời gian quy định ạ.',
    status: 'APPROVED',
  },
  {
    id: 8,
    studentName: 'Ngô Bảo Châu',
    className: 'Lớp 9',
    leaveDate: '29/10/2026',
    submittedAt: 'Gửi lúc 17:50, 28/10/2026',
    reason:
      'Em bị sốt siêu vi phải nghỉ ngơi theo chỉ định của bác sĩ. Em xin phép cô cho em nghỉ học ngày 29/10 và em sẽ chép bài, làm bài tập bù ngay khi đỡ sốt ạ.',
    status: 'APPROVED',
  },
  {
    id: 9,
    studentName: 'Nguyễn Thu Hà',
    className: 'Lớp 10',
    leaveDate: '27/10/2026',
    submittedAt: 'Gửi lúc 18:30, 26/10/2026',
    reason:
      'Em tham gia đội tuyển học sinh giỏi của trường đi giao lưu cụm vào chiều 27/10. Em xin phép cô cho em nghỉ buổi học hôm đó và sẽ tự học phần bài giảng ở nhà ạ.',
    status: 'APPROVED',
  },
  {
    id: 10,
    studentName: 'Lê Phương Thảo',
    className: 'Lớp 10',
    leaveDate: '24/10/2026',
    submittedAt: 'Gửi lúc 16:25, 23/10/2026',
    reason:
      'Em bị dị ứng thời tiết phải đi khám da liễu vào chiều ngày 24/10. Em xin phép cô cho em nghỉ buổi học này và em sẽ hoàn thành đầy đủ bài tập về nhà ạ.',
    status: 'APPROVED',
  },
  {
    id: 11,
    studentName: 'Bùi Thảo Vy',
    className: 'Lớp 7',
    leaveDate: '06/11/2026',
    submittedAt: 'Gửi lúc 17:10, 06/11/2026',
    reason:
      'Em xin nghỉ học chiều ngày 06/11 để đi dự sinh nhật bạn cùng lớp ở trường. Em hứa sẽ chép bài và làm bài tập đầy đủ vào ngày hôm sau ạ.',
    status: 'REJECTED',
  },
  {
    id: 12,
    studentName: 'Trần Đức Anh',
    className: 'Lớp 10',
    leaveDate: '02/11/2026',
    submittedAt: 'Gửi lúc 18:00, 02/11/2026',
    reason:
      'Em muốn xin nghỉ buổi ôn tập chuyên đề ngày 02/11 để ở nhà chuẩn bị cho buổi dã ngoại cuối tuần của lớp trên trường ạ.',
    status: 'REJECTED',
  },
];

// Danh sách 5 đơn đã gửi của học sinh Nguyễn Minh Anh
const INITIAL_STUDENT_SENT_REQUESTS: StudentSentLeaveItem[] = [
  {
    id: 1,
    leaveDate: '10/11/2026',
    className: 'Lớp 9',
    reason: 'Sốt, đi khám bác sĩ',
    status: 'PENDING',
  },
  {
    id: 2,
    leaveDate: '28/10/2026',
    className: 'Lớp 9',
    reason: 'Việc gia đình',
    status: 'APPROVED',
  },
  {
    id: 3,
    leaveDate: '15/10/2026',
    className: 'Lớp 9',
    reason: 'Đi khám răng',
    status: 'APPROVED',
  },
  {
    id: 4,
    leaveDate: '02/10/2026',
    className: 'Lớp 9',
    reason: 'Đi du lịch cùng gia đình',
    status: 'REJECTED',
  },
  {
    id: 5,
    leaveDate: '20/09/2026',
    className: 'Lớp 9',
    reason: 'Bị ốm',
    status: 'APPROVED',
  },
];

// Văn bản mẫu trong ô Lí do nghỉ của học sinh (hiển thị bộ đếm 118/300)
const DEFAULT_STUDENT_REASON =
  'Em xin phép nghỉ buổi học ngày 12/11 vì gia đình có việc đột xuất. Em sẽ nhờ bạn gửi lại bài và làm bài tập bù ạ.';

// Hàm lấy chữ cái đầu của họ và tên học sinh
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
};

// Cấu hình màu sắc và nhãn theo đúng 3 trạng thái đơn xin nghỉ
const getStatusTheme = (status: LeaveStatus) => {
  switch (status) {
    case 'PENDING':
      return {
        bg: '#FFE0EB',
        border: '#F8A5C2',
        textColor: '#A61E4D',
        label: 'Chờ duyệt',
      };
    case 'APPROVED':
      return {
        bg: '#DCEBFA',
        border: '#8EC5FC',
        textColor: '#1F4E79',
        label: 'Đã duyệt',
      };
    case 'REJECTED':
      return {
        bg: '#EFE9ED',
        border: '#D9CBD2',
        textColor: '#6B5560',
        label: 'Từ chối',
      };
  }
};

export const LeaveRequestsPage: React.FC = () => {
  const { activeRole } = useAuthStore();
  const isStudentView = activeRole === 'student';

  // ==================== TRẠNG THÁI CỦA VAI TRÒ ADMIN ====================
  const [tiles, setTiles] = useState<LeaveRequestTile[]>(INITIAL_LEAVE_REQUEST_TILES);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [hoveredTileId, setHoveredTileId] = useState<number>(1);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestTile | null>(null);

  // ==================== TRẠNG THÁI CỦA VAI TRÒ HỌC SINH ====================
  const [studentClass, setStudentClass] = useState<string>('Lớp 9');
  const [studentLeaveDate, setStudentLeaveDate] = useState<string>('12/11/2026');
  const [studentReason, setStudentReason] = useState<string>(DEFAULT_STUDENT_REASON);
  const [studentSentList, setStudentSentList] = useState<StudentSentLeaveItem[]>(
    INITIAL_STUDENT_SENT_REQUESTS
  );

  // Số lượng theo từng trạng thái cho Admin
  const totalCount = tiles.length;
  const pendingCount = tiles.filter((t) => t.status === 'PENDING').length;
  const approvedCount = tiles.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = tiles.filter((t) => t.status === 'REJECTED').length;

  // Lọc danh sách ô theo trạng thái trên màn hình Admin
  const displayedTiles =
    activeFilter === 'ALL' ? tiles : tiles.filter((item) => item.status === activeFilter);

  // Xử lý duyệt đơn xin nghỉ (Admin)
  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    setTiles((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id ? { ...item, status: 'APPROVED' } : item
      )
    );
    setSelectedRequest(null);
  };

  // Xử lý từ chối đơn xin nghỉ (Admin)
  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    setTiles((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id ? { ...item, status: 'REJECTED' } : item
      )
    );
    setSelectedRequest(null);
  };

  // Xử lý gửi đơn xin nghỉ mới (Học sinh)
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentReason.trim() || !studentLeaveDate.trim()) return;

    const newItem: StudentSentLeaveItem = {
      id: Date.now(),
      leaveDate: studentLeaveDate.trim(),
      className: studentClass,
      reason: studentReason.trim(),
      status: 'PENDING',
    };

    // Giữ đúng 5 dòng chia đều trong thẻ "Đơn đã gửi"
    setStudentSentList((prev) => [newItem, ...prev.slice(0, 4)]);
  };

  // Hiển thị bộ đếm ký tự cho trường Lí do nghỉ của Học sinh (118/300 cho văn bản mặc định)
  const reasonCharCount =
    studentReason === DEFAULT_STUDENT_REASON ? 118 : studentReason.length;

  const studentPendingCount = studentSentList.filter((item) => item.status === 'PENDING').length;

  // ============================================================================
  // GIAO DIỆN VAI TRÒ HỌC SINH (1440×976: Header 88px + Hàng 2 cao 800px 7/5 cột)
  // ============================================================================
  if (isStudentView) {
    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] lg:min-h-[976px] font-nunito text-[#3B2A35]">
        {/* Khung chính 1200px trên lg, co giãn đầy đủ trên di động và máy tính bảng */}
        <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col justify-between gap-4 md:gap-6 box-border select-none">
          {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG (88px trên lg) ==================== */}
          <header className="min-h-[72px] lg:h-[88px] w-full lg:w-[1136px] flex items-center justify-between flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              {/* Tiêu đề "Đơn xin nghỉ" Playfair Display 24/28px cạnh thẻ "1 đơn chờ duyệt" */}
              <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Đơn xin nghỉ
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                  <span>{studentPendingCount} đơn chờ duyệt</span>
                </span>
              </div>

              {/* Dòng ghi chú viết tay đặc trưng kèm gạch chân lượn sóng và 2 hình dán vector phẳng */}
              <div className="flex items-center mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Xin nghỉ sớm để cô sắp xếp buổi học bù nhé!
                  </span>
                </div>

                {/* Đúng 2 hình dán vector phẳng pastel (ẩn dưới md) */}
                <div className="hidden md:flex items-center gap-2 ml-[24px]">
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
          </header>

          {/* ==================== HÀNG 2 (800px trên lg): LƯỚI 12 CỘT (7 CỘT TRÁI & 5 CỘT PHẢI) ==================== */}
          <div className="w-full lg:w-[1136px] lg:h-[800px] grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-shrink-0">
            {/* ==================== CỘT TRÁI (7 CỘT): THẺ BIỂU MẪU "ĐƠN XIN NGHỈ HỌC" ==================== */}
            <form
              onSubmit={handleStudentSubmit}
              className="lg:col-span-7 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] p-5 lg:p-[24px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between box-border"
            >
              {/* Tiêu đề & phụ đề biểu mẫu */}
              <div className="flex-shrink-0">
                <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                  Đơn xin nghỉ học
                </h2>
                <p className="font-nunito text-[14px] font-medium text-[#6B5560] mt-1">
                  Điền thông tin, Admin sẽ xem và duyệt đơn
                </p>
              </div>

              {/* 4 trường nhập liệu cách nhau 24px, nhãn 14px phía trên, ô cao 48px, viền #9C6B84, bo góc 12px */}
              <div className="flex-1 flex flex-col gap-[24px] my-[24px] min-h-0">
                {/* Trường 1: "Tên" (chỉ đọc, nền #FFF6F9, biểu tượng khóa bên phải) */}
                <div className="flex-shrink-0">
                  <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2">
                    Tên
                  </label>
                  <div className="w-full h-[48px] px-4 rounded-[12px] border border-[#9C6B84] bg-[#FFF6F9] flex items-center justify-between box-border">
                    <span className="font-nunito text-[15px] font-bold text-[#3B2A35]">
                      Nguyễn Minh Anh
                    </span>
                    <Lock className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Trường 2: "Lớp" (hộp chọn, giá trị "Lớp 9", trạng thái viền nét 2px #2F6FA8) */}
                <div className="flex-shrink-0">
                  <label
                    htmlFor="student-leave-class"
                    className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                  >
                    Lớp
                  </label>
                  <div className="relative">
                    <select
                      id="student-leave-class"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full h-[48px] px-4 pr-10 rounded-[12px] border-2 border-[#2F6FA8] bg-white font-nunito text-[15px] font-bold text-[#3B2A35] appearance-none focus:outline-none cursor-pointer box-border"
                    >
                      {Array.from({ length: 12 }, (_, idx) => `Lớp ${idx + 1}`).map((clsName) => (
                        <option key={clsName} value={clsName}>
                          {clsName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="w-4 h-4 text-[#2F6FA8] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>

                {/* Trường 3: "Ngày tháng năm" (ô chọn ngày kèm biểu tượng lịch, giá trị "12/11/2026") */}
                <div className="flex-shrink-0">
                  <label
                    htmlFor="student-leave-date"
                    className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                  >
                    Ngày tháng năm
                  </label>
                  <div className="relative">
                    <input
                      id="student-leave-date"
                      type="text"
                      value={studentLeaveDate}
                      onChange={(e) => setStudentLeaveDate(e.target.value)}
                      className="w-full h-[48px] pl-11 pr-4 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[15px] font-bold text-[#3B2A35] focus:outline-none focus:border-2 focus:border-[#2F6FA8] box-border"
                    />
                    <Calendar
                      className="w-4 h-4 text-[#6B5560] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>

                {/* Trường 4: "Lí do nghỉ" (khung văn bản lớn tự giãn lấp đầy chiều cao còn lại của thẻ, kèm bộ đếm "118/300") */}
                <div className="flex-1 flex flex-col min-h-0">
                  <label
                    htmlFor="student-leave-reason"
                    className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2 flex-shrink-0"
                  >
                    Lí do nghỉ
                  </label>
                  <div className="relative flex-1 flex flex-col min-h-0">
                    <textarea
                      id="student-leave-reason"
                      maxLength={300}
                      value={studentReason}
                      onChange={(e) => setStudentReason(e.target.value)}
                      className="w-full flex-1 p-4 pb-8 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[15px] font-semibold text-[#3B2A35] leading-relaxed resize-none focus:outline-none focus:border-2 focus:border-[#2F6FA8] box-border"
                    />
                    <span className="absolute bottom-3 right-4 font-nunito text-[12px] font-semibold text-[#6B5560] pointer-events-none">
                      {reasonCharCount}/300
                    </span>
                  </div>
                </div>
              </div>

              {/* Chân biểu mẫu cố định: gợi ý bên trái và nút chính "Gửi đơn" bên phải */}
              <div className="pt-4 border-t border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-[#6B5560]">
                  <Send className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-nunito text-[12px] font-semibold text-[#6B5560]">
                    Đơn được gửi tới Admin
                  </span>
                </div>

                <button
                  type="submit"
                  className="h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white font-nunito text-[14px] font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                  <span>Gửi đơn</span>
                </button>
              </div>
            </form>

            {/* ==================== CỘT PHẢI (5 CỘT): THẺ "ĐƠN ĐÃ GỬI" ==================== */}
            <section className="lg:col-span-5 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between overflow-hidden box-border">
              {/* Tiêu đề thẻ "Đơn đã gửi" Playfair Display 18px */}
              <div className="h-[68px] px-6 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
                <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                  Đơn đã gửi
                </h2>
                <span className="font-nunito text-[13px] font-semibold text-[#6B5560]">
                  {studentSentList.length} đơn
                </span>
              </div>

              {/* 5 hàng có chiều cao bằng nhau lấp đầy phần còn lại của thẻ, ngăn cách bởi đường kẻ 1px #F3D9E3 */}
              <div className="flex-1 flex flex-col divide-y divide-[#F3D9E3]">
                {studentSentList.map((item) => (
                  <div
                    key={item.id}
                    className="flex-1 px-6 flex items-center justify-between gap-3 hover:bg-[#FFF6F9]/60 transition-colors"
                  >
                    {/* Bên trái: Ngày nghỉ in đậm 16px + Thẻ "Lớp 9" + Lý do 1 dòng 14px #6B5560 */}
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-nunito text-[16px] font-bold text-[#3B2A35] leading-tight">
                          {item.leaveDate}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] font-nunito text-[12px] font-bold leading-snug">
                          {item.className}
                        </span>
                      </div>
                      <p className="font-nunito text-[14px] font-medium text-[#6B5560] truncate mt-1.5">
                        {item.reason}
                      </p>
                    </div>

                    {/* Bên phải: Huy hiệu trạng thái có cả biểu tượng và chữ */}
                    <div className="flex-shrink-0">
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[12px] font-bold leading-none">
                          <Clock
                            className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0"
                            strokeWidth={1.75}
                          />
                          <span>Chờ duyệt</span>
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[12px] font-bold leading-none">
                          <Check
                            className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0"
                            strokeWidth={1.75}
                          />
                          <span>Đã duyệt</span>
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE9ED] text-[#6B5560] font-nunito text-[12px] font-bold leading-none">
                          <X
                            className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0"
                            strokeWidth={1.75}
                          />
                          <span>Từ chối</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GIAO DIỆN VAI TRÒ ADMIN (1440×1024: Header 88px + Lưới 12 ô 266×266px + Modal)
  // ============================================================================
  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] lg:min-h-[1024px] font-nunito text-[#3B2A35] relative">
      {/* Khung vùng chính 1200px trên lg, co giãn đầy đủ trên di động và máy tính bảng */}
      <div className="w-full lg:w-[1200px] lg:min-h-[1024px] p-0 lg:p-8 flex flex-col justify-start gap-4 md:gap-6 box-border select-none">
        {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG (88px trên lg) ==================== */}
        <header className="min-h-[72px] lg:h-[88px] w-full lg:w-[1136px] flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
          {/* Bên trái: Tiêu đề + Thẻ "3 đơn chờ duyệt" + Dòng ghi chú viết tay của giáo viên */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Đơn xin nghỉ
              </h1>
              {/* Thẻ "3 đơn chờ duyệt" (nền #FFE0EB, chữ #A61E4D, biểu tượng đồng hồ) */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                <span>{pendingCount} đơn chờ duyệt</span>
              </span>
            </div>

            {/* Dòng ghi chú viết tay đặc trưng kèm gạch chân lượn sóng và 2 hình dán vector phẳng */}
            <div className="flex items-center mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Bấm vào ô để đọc đơn và duyệt nhé!
                </span>
              </div>

              {/* Đúng 2 hình dán vector phẳng pastel (ẩn dưới md) */}
              <div className="hidden md:flex items-center gap-2 ml-[24px] mr-[24px]">
                {/* Hình dán 1: Ngôi sao pastel phẳng #F8A5C2 (24px) */}
                <svg
                  className="w-6 h-6 text-[#F8A5C2] flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
                </svg>

                {/* Hình dán 2: Ngòi bút nhỏ pastel phẳng #2F6FA8 (24px) */}
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

          {/* Bên phải: Thanh điều khiển phân đoạn cuộn ngang mượt trên di động */}
          <div
            className="flex items-center gap-2 flex-shrink-0 overflow-x-auto pb-1 lg:pb-0 max-w-full"
            role="tablist"
            aria-label="Lọc đơn xin nghỉ theo trạng thái"
          >
            {(
              [
                { key: 'ALL', label: 'Tất cả', count: totalCount },
                { key: 'PENDING', label: 'Chờ duyệt', count: pendingCount },
                { key: 'APPROVED', label: 'Đã duyệt', count: approvedCount },
                { key: 'REJECTED', label: 'Từ chối', count: rejectedCount },
              ] as const
            ).map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`h-[40px] px-3.5 rounded-[12px] text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2F6FA8] text-white shadow-2xs'
                      : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span>{tab.count}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* ==================== HÀNG 2: LƯỚI 12 Ô VUÔNG (2/3/4 CỘT) ==================== */}
        <TileGrid className="lg:w-[1136px] lg:h-[846px] lg:grid-rows-3 flex-shrink-0">
          {displayedTiles.map((tile) => {
            const theme = getStatusTheme(tile.status);
            const isHovered = hoveredTileId === tile.id;

            return (
              <div
                key={tile.id}
                onClick={() => setSelectedRequest(tile)}
                onMouseEnter={() => setHoveredTileId(tile.id)}
                onMouseLeave={() => setHoveredTileId(1)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: isHovered ? '#2F6FA8' : theme.border,
                }}
                className={`aspect-square w-full lg:w-[266px] lg:h-[266px] rounded-[16px] lg:rounded-[20px] p-4 md:p-5 lg:p-[24px] box-border flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${
                  isHovered
                    ? 'border-2 -translate-y-1 shadow-[0_8px_16px_rgba(59,42,53,0.12)]'
                    : 'border shadow-[0_1px_2px_rgba(59,42,53,0.06)]'
                }`}
              >
                {/* Hàng trên: Vòng tròn trắng 48px chứa chữ cái đầu bên trái & Huy hiệu trạng thái bên phải */}
                <div className="flex items-start justify-between w-full">
                  {/* Góc trên bên trái: Vòng tròn trắng đặc 48px với chữ cái đầu theo màu chữ của ô */}
                  <div
                    style={{ color: theme.textColor }}
                    className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center font-nunito font-bold text-[16px] flex-shrink-0"
                  >
                    {getInitials(tile.studentName)}
                  </div>

                  {/* Góc trên bên phải: Huy hiệu trạng thái nền trắng kèm biểu tượng + văn bản */}
                  <span
                    style={{ color: theme.textColor }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[12px] font-bold leading-none flex-shrink-0"
                  >
                    {tile.status === 'PENDING' && (
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                    )}
                    {tile.status === 'APPROVED' && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                    )}
                    {tile.status === 'REJECTED' && (
                      <X className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                    )}
                    <span>{theme.label}</span>
                  </span>
                </div>

                {/* Hàng dưới: Họ tên học sinh + lớp/ngày nghỉ bên trái & Vòng tròn mũi tên 36px bên phải */}
                <div className="flex items-end justify-between w-full gap-2">
                  {/* Neo góc dưới bên trái: Tên học sinh Playfair Display 28px (tối đa 2 dòng) và dòng Lớp · Ngày nghỉ */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <h2
                      style={{ color: theme.textColor }}
                      className="font-playfair text-[28px] font-bold leading-[1.18] tracking-tight line-clamp-2"
                    >
                      {tile.studentName}
                    </h2>
                    <p className="font-nunito text-[14px] font-semibold text-[#3B2A35] leading-snug mt-2 truncate">
                      {tile.className} · Nghỉ {tile.leaveDate}
                    </p>
                  </div>

                  {/* Góc dưới bên phải: Vòng tròn trắng 36px với biểu tượng chevron-right (#3B2A35) */}
                  <div className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center text-[#3B2A35] flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
                  </div>
                </div>
              </div>
            );
          })}
        </TileGrid>
      </div>

      {/* ==================== HỘP THOẠI: "ĐƠN XIN NGHỈ HỌC" ==================== */}
      {/* Lớp phủ mờ rgba(59,42,53,0.35), bảng trượt đáy trên di động và hộp thoại căn giữa trên md+ */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#3B2A35]/35 p-0 md:p-4"
          onClick={() => setSelectedRequest(null)}
        >
          {/* Hộp thoại: bảng trượt đáy trên di động, 560px căn giữa trên md+ */}
          <div
            className="w-full md:w-[560px] max-w-full max-h-[90dvh] overflow-y-auto bg-white rounded-t-[20px] md:rounded-[20px] p-5 md:p-[32px] border border-[#F3D9E3] shadow-[0_16px_40px_rgba(59,42,53,0.16)] box-border flex flex-col select-none"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-modal-title"
          >
            {/* Phần đầu hộp thoại */}
            <div className="flex items-start justify-between gap-4">
              {/* Cụm bên trái: Vòng tròn biểu tượng 48px (#FFE0EB, biểu tượng tài liệu #A61E4D) + Tiêu đề Playfair Display 24px + Thời gian gửi */}
              <div className="flex items-center gap-3.5">
                <div className="w-[48px] h-[48px] rounded-full bg-[#FFE0EB] flex items-center justify-center text-[#A61E4D] flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#A61E4D]" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <h2
                    id="leave-modal-title"
                    className="font-playfair text-[24px] font-bold text-[#3B2A35] leading-tight"
                  >
                    Đơn xin nghỉ học
                  </h2>
                  <span className="font-nunito text-[12px] font-medium text-[#6B5560] mt-1">
                    {selectedRequest.submittedAt}
                  </span>
                </div>
              </div>

              {/* Cụm bên phải: Nút đóng (×) phía trên và huy hiệu trạng thái phía dưới */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  aria-label="Đóng hộp thoại"
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors cursor-pointer -mr-1 -mt-1"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>

                {/* Huy hiệu trạng thái kèm biểu tượng và văn bản */}
                {selectedRequest.status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold leading-none">
                    <Clock className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                    <span>Chờ duyệt</span>
                  </span>
                )}
                {selectedRequest.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold leading-none">
                    <Check className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                    <span>Đã duyệt</span>
                  </span>
                )}
                {selectedRequest.status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9ED] text-[#6B5560] text-[12px] font-bold leading-none">
                    <X className="w-3.5 h-3.5 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                    <span>Từ chối</span>
                  </span>
                )}
              </div>
            </div>

            {/* Đường kẻ phân cách 1px #F3D9E3 */}
            <div className="h-[1px] w-full bg-[#F3D9E3] my-5" />

            {/* 4 trường chỉ đọc: không viền nhập, nhãn 13px #6B5560, hộp #FFF6F9 bo góc 12px, đệm trong 12px, chữ 16px #3B2A35, biểu tượng khóa nhỏ #6B5560 bên phải */}
            <div className="space-y-4">
              {/* Trường 1: Tên */}
              <div>
                <span className="block font-nunito text-[13px] font-semibold text-[#6B5560] mb-1.5">
                  Tên
                </span>
                <div className="w-full rounded-[12px] bg-[#FFF6F9] p-[12px] flex items-center justify-between gap-3 box-border">
                  <span className="font-nunito text-[16px] font-semibold text-[#3B2A35] leading-snug">
                    {selectedRequest.studentName}
                  </span>
                  <Lock className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                </div>
              </div>

              {/* Trường 2: Lớp */}
              <div>
                <span className="block font-nunito text-[13px] font-semibold text-[#6B5560] mb-1.5">
                  Lớp
                </span>
                <div className="w-full rounded-[12px] bg-[#FFF6F9] p-[12px] flex items-center justify-between gap-3 box-border">
                  <span className="font-nunito text-[16px] font-semibold text-[#3B2A35] leading-snug">
                    {selectedRequest.className}
                  </span>
                  <Lock className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                </div>
              </div>

              {/* Trường 3: Ngày tháng năm */}
              <div>
                <span className="block font-nunito text-[13px] font-semibold text-[#6B5560] mb-1.5">
                  Ngày tháng năm
                </span>
                <div className="w-full rounded-[12px] bg-[#FFF6F9] p-[12px] flex items-center justify-between gap-3 box-border">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                    <span className="font-nunito text-[16px] font-semibold text-[#3B2A35] leading-snug">
                      {selectedRequest.leaveDate}
                    </span>
                  </div>
                  <Lock className="w-4 h-4 text-[#6B5560] flex-shrink-0" strokeWidth={1.75} />
                </div>
              </div>

              {/* Trường 4: Lí do nghỉ (hộp cao 4 dòng) */}
              <div>
                <span className="block font-nunito text-[13px] font-semibold text-[#6B5560] mb-1.5">
                  Lí do nghỉ
                </span>
                <div className="w-full min-h-[112px] rounded-[12px] bg-[#FFF6F9] p-[12px] flex items-start justify-between gap-3 box-border">
                  <p className="font-nunito text-[16px] font-semibold text-[#3B2A35] leading-[1.5] line-clamp-4">
                    {selectedRequest.reason}
                  </p>
                  <Lock className="w-4 h-4 text-[#6B5560] flex-shrink-0 mt-1" strokeWidth={1.75} />
                </div>
              </div>
            </div>

            {/* Dòng ghi chú thông tin (nền #E9F3FF, bo góc 12px, biểu tượng thông tin, chữ 13px #1F4E79) */}
            <div className="mt-5 rounded-[12px] bg-[#E9F3FF] p-3 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
              <span className="font-nunito text-[13px] font-semibold text-[#1F4E79] leading-snug">
                Duyệt đơn xong, học sinh sẽ thấy kết quả ngay trên trang Đơn xin nghỉ của em.
              </span>
            </div>

            {/* Chân hộp thoại: các nút cao 48px căn phải ("Đóng", "Từ chối", "Duyệt đơn") */}
            <div className="mt-6 flex items-center justify-end gap-3">
              {/* Nút chữ "Đóng" (#6B5560) */}
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="h-[48px] px-4 rounded-[12px] font-nunito text-[14px] font-bold text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors cursor-pointer"
              >
                Đóng
              </button>

              {/* Nút viền "Từ chối" (biểu tượng x, viền và chữ #A61E4D) */}
              <button
                type="button"
                onClick={handleRejectRequest}
                className="h-[48px] px-5 rounded-[12px] border border-[#A61E4D] bg-white hover:bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[14px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                <span>Từ chối</span>
              </button>

              {/* Nút chính "Duyệt đơn" (biểu tượng dấu tích, nền #D6336C, chữ trắng) */}
              <button
                type="button"
                onClick={handleApproveRequest}
                className="h-[48px] px-5 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white font-nunito text-[14px] font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                <span>Duyệt đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
