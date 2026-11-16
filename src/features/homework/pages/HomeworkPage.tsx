import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
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
  Camera,
  X,
  Pencil,
  Trash2,
  Upload,
  Calendar as CalendarIcon,
  ArrowLeft,
  RotateCw,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Kiểu trạng thái của bài tập học sinh (chỉ dùng xanh dương đã chấm, hồng chưa nộp, xám chờ chấm)
type AssignmentStatus = 'graded' | 'not_submitted' | 'pending';

// Cấu trúc dữ liệu một bài tập trong danh sách của học sinh
interface StudentAssignment {
  id: number;
  title: string;
  fullTitle: string;
  dueDate: string;
  dueDateTime: string;
  remainingText?: string;
  assignedBy: string;
  className: string;
  status: AssignmentStatus;
}

// Danh sách 5 bài tập cố định hiển thị ở cột bên trái màn hình Học sinh
const STUDENT_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: 1,
    title: 'Phân tích "Kiều ở lầu Ngưng Bích"',
    fullTitle: 'Phân tích đoạn trích "Kiều ở lầu Ngưng Bích"',
    dueDate: 'Hạn nộp 14/11/2026',
    dueDateTime: 'Hạn nộp 23:59, 14/11/2026',
    assignedBy: 'Giao bởi Chị Vân · 09/11/2026',
    className: 'Lớp 9',
    status: 'graded',
  },
  {
    id: 2,
    title: 'Nghị luận về tinh thần tự học',
    fullTitle: 'Nghị luận về tinh thần tự học',
    dueDate: 'Hạn nộp 17/11/2026',
    dueDateTime: 'Hạn nộp 23:59, 17/11/2026',
    remainingText: 'Còn 5 ngày',
    assignedBy: 'Giao bởi Chị Vân · 11/11/2026',
    className: 'Lớp 9',
    status: 'not_submitted',
  },
  {
    id: 3,
    title: 'Đọc hiểu "Làng" – Kim Lân',
    fullTitle: 'Đọc hiểu "Làng" – Kim Lân',
    dueDate: 'Hạn nộp 21/11/2026',
    dueDateTime: 'Hạn nộp 23:59, 21/11/2026',
    remainingText: 'Còn 9 ngày',
    assignedBy: 'Giao bởi Chị Vân · 11/11/2026',
    className: 'Lớp 9',
    status: 'not_submitted',
  },
  {
    id: 4,
    title: 'Viết bài thuyết minh về một danh lam',
    fullTitle: 'Viết bài thuyết minh về một danh lam',
    dueDate: 'Hạn nộp 07/11/2026',
    dueDateTime: 'Hạn nộp 23:59, 07/11/2026',
    assignedBy: 'Giao bởi Chị Vân · 01/11/2026',
    className: 'Lớp 9',
    status: 'pending',
  },
  {
    id: 5,
    title: 'Soạn bài "Chuyện người con gái Nam Xương"',
    fullTitle: 'Soạn bài "Chuyện người con gái Nam Xương"',
    dueDate: 'Hạn nộp 02/11/2026',
    dueDateTime: 'Hạn nộp 23:59, 02/11/2026',
    assignedBy: 'Giao bởi Chị Vân · 26/10/2026',
    className: 'Lớp 9',
    status: 'graded',
  },
];

// Cấu trúc dữ liệu học sinh trong màn hình "Chấm bài" của Admin
interface GradingStudentRow {
  id: number;
  initials: string;
  fullName: string;
  status: AssignmentStatus;
  badgeText: string;
  submittedAt: string;
  photoCount: number;
  score: string;
  comment: string;
}

const GRADING_STUDENTS: GradingStudentRow[] = [
  {
    id: 1,
    initials: 'MA',
    fullName: 'Nguyễn Minh Anh',
    status: 'graded',
    badgeText: 'Đã chấm 8,5',
    submittedAt: 'Nộp lúc 20:14, 11/11/2026',
    photoCount: 2,
    score: '8,5',
    comment:
      'Em hiểu đúng tâm trạng cô đơn và nỗi nhớ của Kiều. Phần phân tích hình ảnh "cửa bể chiều hôm" rất tốt, cần thêm dẫn chứng ở câu 1. Chữ viết đẹp, trình bày sạch sẽ.',
  },
  {
    id: 2,
    initials: 'GH',
    fullName: 'Đỗ Gia Hân',
    status: 'pending',
    badgeText: 'Chờ chấm',
    submittedAt: 'Nộp lúc 20:41, 11/11/2026',
    photoCount: 2,
    score: '8',
    comment:
      'Bài viết có bố cục rõ ràng, đúng tâm trạng của Kiều. Cần bổ sung dẫn chứng ở câu 1 và sửa lỗi chính tả ở đoạn kết.',
  },
  {
    id: 3,
    initials: 'ND',
    fullName: 'Đặng Ngọc Diệp',
    status: 'graded',
    badgeText: 'Đã chấm 7,5',
    submittedAt: 'Nộp lúc 21:05, 11/11/2026',
    photoCount: 2,
    score: '7,5',
    comment:
      'Bài làm nắm được ý chính của đoạn trích, diễn đạt mạch lạc. Em lưu ý phân tích kỹ hơn điệp ngữ "Buồn trông" ở 8 câu thơ cuối.',
  },
  {
    id: 4,
    initials: 'TK',
    fullName: 'Phạm Tuấn Kiệt',
    status: 'pending',
    badgeText: 'Chờ chấm',
    submittedAt: 'Nộp lúc 21:32, 11/11/2026',
    photoCount: 2,
    score: '8',
    comment:
      'Bài viết có bố cục rõ ràng, đúng tâm trạng của Kiều. Cần bổ sung dẫn chứng ở câu 1 và sửa lỗi chính tả ở đoạn kết.',
  },
  {
    id: 5,
    initials: 'HM',
    fullName: 'Lương Hà My',
    status: 'not_submitted',
    badgeText: 'Chưa nộp',
    submittedAt: 'Chưa nộp bài',
    photoCount: 0,
    score: '',
    comment: '',
  },
];

// Cấu trúc dữ liệu bài tập dành cho màn hình Admin (9 dòng hiển thị trên bảng)
interface AdminAssignmentRow {
  id: number;
  title: string;
  files: Array<'PDF' | 'DOCX' | 'XLSX' | 'JPG'>;
  className: string;
  dueDate: string;
  submittedCount: number;
  totalStudents: number;
  gradedCount: number;
  isAllGraded?: boolean;
}

const ADMIN_ASSIGNMENTS: AdminAssignmentRow[] = [
  {
    id: 1,
    title: 'Phân tích "Kiều ở lầu Ngưng Bích"',
    files: ['PDF', 'DOCX'],
    className: 'Lớp 9',
    dueDate: '14/11/2026',
    submittedCount: 4,
    totalStudents: 5,
    gradedCount: 2,
  },
  {
    id: 2,
    title: 'Nghị luận về tinh thần tự học',
    files: ['PDF'],
    className: 'Lớp 9',
    dueDate: '17/11/2026',
    submittedCount: 0,
    totalStudents: 5,
    gradedCount: 0,
  },
  {
    id: 3,
    title: 'Đọc hiểu "Làng" – Kim Lân',
    files: ['PDF', 'JPG'],
    className: 'Lớp 9',
    dueDate: '21/11/2026',
    submittedCount: 0,
    totalStudents: 5,
    gradedCount: 0,
  },
  {
    id: 4,
    title: 'Viết bài thuyết minh về một danh lam',
    files: ['DOCX'],
    className: 'Lớp 9',
    dueDate: '07/11/2026',
    submittedCount: 5,
    totalStudents: 5,
    gradedCount: 3,
  },
  {
    id: 5,
    title: 'Viết đoạn văn về lòng biết ơn',
    files: ['PDF'],
    className: 'Lớp 10',
    dueDate: '14/11/2026',
    submittedCount: 7,
    totalStudents: 10,
    gradedCount: 3,
  },
  {
    id: 6,
    title: 'Đọc hiểu "Lão Hạc"',
    files: ['PDF', 'JPG'],
    className: 'Lớp 8',
    dueDate: '15/11/2026',
    submittedCount: 4,
    totalStudents: 4,
    gradedCount: 4,
    isAllGraded: true,
  },
  {
    id: 7,
    title: 'Tả người thân trong gia đình',
    files: ['DOCX'],
    className: 'Lớp 6',
    dueDate: '13/11/2026',
    submittedCount: 3,
    totalStudents: 3,
    gradedCount: 3,
    isAllGraded: true,
  },
  {
    id: 8,
    title: 'Bảng thống kê lỗi chính tả',
    files: ['XLSX'],
    className: 'Lớp 5',
    dueDate: '17/11/2026',
    submittedCount: 1,
    totalStudents: 3,
    gradedCount: 0,
  },
  {
    id: 9,
    title: 'Luyện đề nghị luận văn học',
    files: ['PDF'],
    className: 'Lớp 11',
    dueDate: '12/11/2026',
    submittedCount: 2,
    totalStudents: 2,
    gradedCount: 1,
  },
];

const ADMIN_CLASS_FILTERS = [
  'Tất cả 14',
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
];

// Cấu trúc dữ liệu tệp đính kèm trong ngăn kéo "Giao bài tập"
interface DrawerUploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'JPG';
  status: 'uploaded' | 'uploading';
  progress?: number;
}

const INITIAL_DRAWER_FILES: DrawerUploadedFile[] = [
  {
    id: 'file-1',
    name: 'De-bai-tinh-than-tu-hoc.pdf',
    size: '1,2 MB',
    type: 'PDF',
    status: 'uploaded',
  },
  {
    id: 'file-2',
    name: 'Goi-y-lam-bai.docx',
    size: '340 KB',
    type: 'DOCX',
    status: 'uploaded',
  },
  {
    id: 'file-3',
    name: 'Bang-diem-mau.xlsx',
    size: '820 KB',
    type: 'XLSX',
    status: 'uploading',
    progress: 70,
  },
];

// Thành phần minh họa phẳng trang vở kẻ ngang viết tay bằng nét bút chì mềm (không dùng ảnh stock, không lorem ipsum)
const GradingNotebookIllustration: React.FC<{
  pageNumber: 1 | 2;
  variant?: 'canvas' | 'thumb';
}> = ({ pageNumber, variant = 'canvas' }) => {
  if (variant === 'thumb') {
    return (
      <div className="w-[46px] h-[58px] rounded-[6px] bg-[#FBF6EA] border border-[#F3D9E3] relative overflow-hidden p-1.5 flex-shrink-0">
        {/* Kẻ ngang vở học sinh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 6px, #CFE8FF 6px, #CFE8FF 7px)',
            backgroundSize: '100% 7px',
            backgroundPosition: '0 3px',
          }}
        />
        {/* Kẻ lề dọc màu hồng */}
        <div className="absolute top-0 bottom-0 left-[9px] w-[1px] bg-[#F8A5C2]/80 pointer-events-none" />
        {/* Các nét bút chì mềm mô phỏng chữ viết tay */}
        <div className="relative z-10 pl-2 pt-0.5 space-y-[3.5px]">
          <div className="h-[2px] w-5 bg-[#A61E4D]/65 rounded-full" />
          <div className="h-[1.5px] w-7 bg-[#6B5560]/65 rounded-full" />
          <div className="h-[1.5px] w-6 bg-[#6B5560]/55 rounded-full" />
          <div className="h-[1.5px] w-7 bg-[#6B5560]/65 rounded-full" />
          <div className="h-[1.5px] w-5 bg-[#6B5560]/50 rounded-full" />
          <div className="h-[1.5px] w-6 bg-[#6B5560]/60 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[540px] h-[270px] rounded-[12px] bg-[#FBF6EA] border border-[#F3D9E3] shadow-[0_4px_14px_rgba(59,42,53,0.08)] relative overflow-hidden px-6 py-4 select-none">
      {/* Dòng kẻ ngang trang vở (#CFE8FF) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 21px, #CFE8FF 21px, #CFE8FF 22px)',
          backgroundSize: '100% 22px',
          backgroundPosition: '0 12px',
        }}
      />

      {/* Đường lề dọc màu hồng (#F8A5C2) */}
      <div className="absolute top-0 bottom-0 left-[54px] w-[1.5px] bg-[#F8A5C2]/85 pointer-events-none" />

      {/* Nội dung trang vở kết hợp tiêu đề bài làm tiếng Việt và các đường nét bút chì mềm */}
      <div className="relative z-10 pl-11 space-y-[10px]">
        <div className="flex items-center justify-between text-[12px] font-bold text-[#A61E4D]">
          <span>Họ và tên: Đỗ Gia Hân · Lớp 9</span>
          <span>Trang {pageNumber} / 2</span>
        </div>

        {pageNumber === 1 ? (
          <>
            <div className="font-playfair italic font-bold text-[14px] text-[#1F4E79] leading-none">
              Bài làm: Phân tích đoạn trích &ldquo;Kiều ở lầu Ngưng Bích&rdquo; (Nguyễn Du)
            </div>

            {/* Các dòng nét bút chì mềm mô phỏng bài viết tay trên giấy kẻ ngang */}
            <svg
              className="w-full h-[180px] text-[#6B5560]"
              viewBox="0 0 430 180"
              fill="none"
              aria-label="Minh họa trang vở viết tay Trang 1"
            >
              {/* Đoạn 1: Câu 1 chép thơ */}
              <path
                d="M4 12 C 42 10, 85 14, 132 11 C 180 9, 230 13, 286 11"
                stroke="#1F4E79"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.78"
              />
              <path
                d="M18 34 C 70 32, 130 35, 195 33 C 245 31, 300 35, 348 33"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                d="M18 56 C 68 55, 128 57, 190 55 C 250 53, 315 57, 372 55"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.68"
              />
              <path
                d="M18 78 C 64 76, 124 79, 184 77 C 240 75, 295 79, 336 77"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.72"
              />
              {/* Đoạn 2: Câu 2 phân tích */}
              <path
                d="M4 100 C 56 98, 118 102, 178 99 C 242 97, 310 101, 392 99"
                stroke="#1F4E79"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.78"
              />
              <path
                d="M16 122 C 78 120, 148 124, 218 121 C 288 119, 352 123, 412 121"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M4 144 C 72 142, 144 146, 214 143 C 284 141, 348 145, 404 143"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.65"
              />
              <path
                d="M4 166 C 62 164, 132 168, 198 165 C 248 164, 292 167, 330 165"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </>
        ) : (
          <>
            <div className="font-playfair italic font-bold text-[14px] text-[#1F4E79] leading-none">
              Phần tiếp theo: Nghệ thuật tả cảnh ngụ tình qua điệp ngữ &ldquo;Buồn trông&rdquo;
            </div>

            <svg
              className="w-full h-[180px] text-[#6B5560]"
              viewBox="0 0 430 180"
              fill="none"
              aria-label="Minh họa trang vở viết tay Trang 2"
            >
              <path
                d="M16 12 C 74 10, 142 14, 212 11 C 282 9, 348 13, 408 11"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                d="M4 34 C 68 32, 138 35, 208 33 C 276 31, 342 35, 396 33"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.68"
              />
              <path
                d="M4 56 C 64 55, 132 57, 198 55 C 264 53, 330 57, 384 55"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                d="M16 78 C 72 76, 140 79, 210 77 C 274 75, 336 79, 402 77"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.66"
              />
              <path
                d="M4 100 C 66 98, 134 102, 202 99 C 268 97, 328 101, 378 99"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M16 122 C 68 120, 132 124, 196 121 C 260 119, 322 123, 390 121"
                stroke="#1F4E79"
                strokeWidth="2.1"
                strokeLinecap="round"
                opacity="0.76"
              />
              <path
                d="M4 144 C 58 142, 118 146, 182 143 C 232 141, 276 145, 312 143"
                stroke="#6B5560"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.68"
              />
            </svg>
          </>
        )}
      </div>
    </div>
  );
};

// Thành phần minh họa trang vở kẻ ngang viết tay phẳng cho màn hình Học sinh
const NotebookThumbnailSvg: React.FC<{
  pageNumber: number;
  size?: '96x128' | '104x140' | 'large';
}> = ({ pageNumber, size = '96x128' }) => {
  const isLarge = size === 'large';
  const sizeClasses =
    size === 'large'
      ? 'w-full h-[460px] rounded-[12px] p-6'
      : size === '104x140'
      ? 'w-[104px] h-[140px] rounded-[10px] p-2'
      : 'w-[96px] h-[128px] rounded-[10px] p-2';

  return (
    <div
      className={`relative bg-[#FBF6EA] overflow-hidden select-none border border-[#F3D9E3] ${sizeClasses}`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent ${
            isLarge ? '27px' : '10px'
          }, #CFE8FF ${isLarge ? '27px' : '10px'}, #CFE8FF ${isLarge ? '28px' : '11px'})`,
          backgroundSize: `100% ${isLarge ? '28px' : '11px'}`,
          backgroundPosition: `0 ${isLarge ? '16px' : '5px'}`,
        }}
      />

      <div
        className="absolute top-0 bottom-0 bg-[#F8A5C2]/80 pointer-events-none"
        style={{
          left: isLarge ? '52px' : '16px',
          width: isLarge ? '1.5px' : '1px',
        }}
      />

      {isLarge ? (
        <div className="relative z-10 pl-12 pt-1 font-playfair italic text-[#1F4E79] space-y-[9px] text-[15px] leading-[19px]">
          <div className="font-bold text-[#A61E4D] not-italic text-[14px]">
            Nguyễn Minh Anh – Lớp 9 · Bài làm (Trang {pageNumber})
          </div>
          {pageNumber === 1 && (
            <>
              <div className="font-semibold">
                Đề bài: Nghị luận về tinh thần tự học của học sinh hiện nay
              </div>
              <div>
                Mở bài: Trong hành trình chinh phục tri thức của mỗi con người, tự học luôn là chiếc chìa khóa vàng mở ra cánh cửa thành công...
              </div>
              <div>
                Luận điểm 1: Tự học là sự chủ động tìm tòi, suy ngẫm và lĩnh hội kiến thức bằng chính nỗ lực tự thân mà không đợi ai nhắc nhở...
              </div>
            </>
          )}
          {pageNumber >= 2 && (
            <>
              <div>
                Luận điểm 2: Tinh thần tự học giúp học sinh hiểu sâu, nhớ lâu và rèn luyện tư duy độc lập trước mọi vấn đề trong cuộc sống...
              </div>
              <div className="font-semibold pt-1">
                Kết bài: Mỗi học sinh chúng em cần xây dựng kế hoạch tự học khoa học ngay từ hôm nay.
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative z-10 pl-3 pt-0.5 space-y-[4.5px]">
          <div className="h-[3px] w-11 bg-[#A61E4D]/60 rounded-full mb-1" />
          <div className="h-[2px] w-14 bg-[#1F4E79]/75 rounded-full" />
          <div className="h-[2px] w-12 bg-[#1F4E79]/65 rounded-full" />
          <div className="h-[2px] w-14 bg-[#1F4E79]/75 rounded-full" />
          <div className="h-[2px] w-10 bg-[#1F4E79]/60 rounded-full" />
          <div className="h-[2px] w-13 bg-[#1F4E79]/70 rounded-full mt-1" />
          <div className="h-[2px] w-14 bg-[#1F4E79]/75 rounded-full" />
          <div className="h-[2px] w-11 bg-[#1F4E79]/65 rounded-full" />
        </div>
      )}
    </div>
  );
};

export const HomeworkPage: React.FC = () => {
  const location = useLocation();
  const { activeRole } = useAuthStore();
  // Hiển thị theo vai trò đang chọn (Admin hoặc Học sinh) từ thanh chuyển đổi Role trên Sidebar
  const isAdminMode = activeRole === 'admin' && !location.search.includes('role=student');

  // Chế độ con của Admin: 'grading' (Màn hình Chấm bài mặc định theo yêu cầu mới nhất) hoặc 'list' (Danh sách 14 bài tập)
  const [adminSubView, setAdminSubView] = useState<'grading' | 'list'>('grading');
  // Tên bài tập đang chấm trên thanh breadcrumb
  const [gradingAssignmentTitle, setGradingAssignmentTitle] = useState<string>(
    'Phân tích "Kiều ở lầu Ngưng Bích"'
  );

  // Danh sách học sinh và học sinh đang được chọn trên màn hình "Chấm bài" (mặc định chọn #2 Đỗ Gia Hân)
  const [gradingStudents, setGradingStudents] =
    useState<GradingStudentRow[]>(GRADING_STUDENTS);
  const [selectedGradingStudentId, setSelectedGradingStudentId] = useState<number>(2);
  // Trang ảnh bài làm đang chọn ở màn hình "Chấm bài" (1 hoặc 2)
  const [gradingSelectedPage, setGradingSelectedPage] = useState<1 | 2>(1);
  // Mức thu phóng và góc xoay ảnh bài làm trên màn hình "Chấm bài"
  const [gradingZoom, setGradingZoom] = useState<number>(100);
  const [gradingRotation, setGradingRotation] = useState<number>(0);
  // Điểm số và nhận xét đang nhập trên màn hình "Chấm bài"
  const [gradingScore, setGradingScore] = useState<string>('8');
  const [gradingComment, setGradingComment] = useState<string>(
    'Bài viết có bố cục rõ ràng, đúng tâm trạng của Kiều. Cần bổ sung dẫn chứng ở câu 1 và sửa lỗi chính tả ở đoạn kết.'
  );
  // Trạng thái phóng to toàn màn hình bài làm trên màn hình "Chấm bài" (mặc định đóng)
  const [isGradingFullscreen, setIsGradingFullscreen] = useState<boolean>(false);

  // Trạng thái mở Side Drawer "Giao bài tập" ở màn hình danh sách (mặc định đóng, mở khi bấm "Giao bài tập" hoặc "Sửa")
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState<boolean>(false);

  // Các trường dữ liệu trong Side Drawer "Giao bài tập"
  const [drawerTitle, setDrawerTitle] = useState<string>('Nghị luận về tinh thần tự học');
  const [drawerClass, setDrawerClass] = useState<string>('Lớp 9');
  const [drawerDueDate, setDrawerDueDate] = useState<string>('17/11/2026');
  const [drawerDueTime, setDrawerDueTime] = useState<string>('23:59');
  const [drawerInstructions, setDrawerInstructions] = useState<string>(
    'Viết khoảng 400 chữ, có mở bài, 3 luận điểm và kết bài. Chụp ảnh bài làm rõ chữ rồi nộp trên web.'
  );
  const [drawerFiles, setDrawerFiles] = useState<DrawerUploadedFile[]>(INITIAL_DRAWER_FILES);

  // Bài tập đang được chọn ở màn hình Học sinh (mặc định là bài #2 "Nghị luận về tinh thần tự học" – trạng thái "Chưa nộp")
  const [selectedId, setSelectedId] = useState<number>(2);
  const [activeFileTab, setActiveFileTab] = useState<'pdf' | 'docx'>('pdf');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [uploadedPages, setUploadedPages] = useState<number[]>([1, 2, 3]);
  const [previewNotebookPage, setPreviewNotebookPage] = useState<number | null>(null);
  const [isFullscreenViewer, setIsFullscreenViewer] = useState<boolean>(false);
  const [selectedAdminClass, setSelectedAdminClass] = useState<string>('Tất cả 14');
  const [adminPage, setAdminPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(false);

  // Tham chiếu đến thẻ input chọn file thật từ thư mục máy tính
  const drawerFileInputRef = useRef<HTMLInputElement | null>(null);
  const studentFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chọn một học sinh khác trong danh sách "Học sinh lớp 9" ở màn hình Chấm bài
  const handleSelectGradingStudent = (student: GradingStudentRow) => {
    setSelectedGradingStudentId(student.id);
    setGradingSelectedPage(1);
    setGradingRotation(0);
    setGradingScore(student.score || '8');
    setGradingComment(
      student.comment ||
        'Bài viết có bố cục rõ ràng, đúng tâm trạng của Kiều. Cần bổ sung dẫn chứng ở câu 1 và sửa lỗi chính tả ở đoạn kết.'
    );
    setMobileShowDetail(true);
  };

  // Gửi điểm và nhận xét cho học sinh đang chọn
  const handleSubmitGrade = () => {
    const currentStudent =
      gradingStudents.find((s) => s.id === selectedGradingStudentId) || gradingStudents[1];
    setGradingStudents((prev) =>
      prev.map((s) =>
        s.id === currentStudent.id
          ? {
              ...s,
              status: 'graded',
              badgeText: `Đã chấm ${gradingScore}`,
              score: gradingScore,
              comment: gradingComment,
            }
          : s
      )
    );
    showToast(
      `Đã gửi điểm ${gradingScore}/10 và nhận xét cho học sinh ${currentStudent.fullName}!`
    );
  };

  // Định dạng dung lượng tệp từ byte sang KB hoặc MB
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  // Nhận diện loại tệp từ tên tệp được chọn trong thư mục
  const detectDrawerFileType = (fileName: string): 'PDF' | 'DOCX' | 'XLSX' | 'JPG' => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'PDF';
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'DOCX';
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) return 'XLSX';
    return 'JPG';
  };

  // Xử lý danh sách file được chọn từ thư mục máy tính hoặc kéo thả vào khung File đề bài
  const handleSelectDrawerFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const addedFiles: DrawerUploadedFile[] = Array.from(fileList).map((file, idx) => ({
      id: `local-${Date.now()}-${idx}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: detectDrawerFileType(file.name),
      status: 'uploaded',
    }));

    setDrawerFiles((prev) => [...prev, ...addedFiles]);
    showToast(
      `Đã tải lên ${addedFiles.length} tệp: ${addedFiles.map((f) => f.name).join(', ')}`
    );
  };

  // Đóng ngăn kéo "Giao bài tập"
  const handleCloseAssignDrawer = () => {
    setIsAssignDrawerOpen(false);
  };

  // Mở ngăn kéo "Giao bài tập" với dữ liệu mặc định
  const handleOpenNewAssignDrawer = () => {
    setDrawerTitle('Nghị luận về tinh thần tự học');
    setDrawerClass('Lớp 9');
    setDrawerDueDate('17/11/2026');
    setDrawerDueTime('23:59');
    setDrawerInstructions(
      'Viết khoảng 400 chữ, có mở bài, 3 luận điểm và kết bài. Chụp ảnh bài làm rõ chữ rồi nộp trên web.'
    );
    setDrawerFiles(INITIAL_DRAWER_FILES);
    setIsAssignDrawerOpen(true);
  };

  // Mở ngăn kéo để chỉnh sửa một dòng bài tập có sẵn
  const handleOpenEditAssignDrawer = (row: AdminAssignmentRow) => {
    setDrawerTitle(row.title);
    setDrawerClass(row.className);
    setDrawerDueDate(row.dueDate);
    setDrawerDueTime('23:59');
    setDrawerFiles(INITIAL_DRAWER_FILES);
    setIsAssignDrawerOpen(true);
  };

  // Xử lý lưu biểu mẫu "Giao bài tập"
  const handleSubmitAssignDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    handleCloseAssignDrawer();
    showToast(`Đã giao bài tập "${drawerTitle}" cho ${drawerClass} thành công!`);
  };

  // Xóa một tệp trong danh sách đính kèm của ngăn kéo
  const handleRemoveDrawerFile = (id: string, name: string) => {
    setDrawerFiles((prev) => prev.filter((f) => f.id !== id));
    showToast(`Đã gỡ tệp ${name}.`);
  };

  // Xóa một ảnh thu nhỏ trong danh sách tải lên của học sinh
  const handleRemovePage = (pageNum: number) => {
    setUploadedPages((prev) => prev.filter((p) => p !== pageNum));
    showToast(`Đã xóa Trang ${pageNum} khỏi danh sách ảnh bài làm.`);
  };

  // Thêm một ảnh mới vào danh sách tải lên của học sinh
  const handleAddPage = () => {
    if (uploadedPages.length >= 10) {
      showToast('Đã đạt tối đa 10 ảnh cho một lần nộp bài.');
      return;
    }
    const nextNum = uploadedPages.length > 0 ? Math.max(...uploadedPages) + 1 : 1;
    setUploadedPages((prev) => [...prev, nextNum]);
    showToast(`Đã thêm Trang ${nextNum} vào bài làm.`);
  };

  // Lấy thông tin bài tập đang chọn của học sinh
  const currentAssignment =
    STUDENT_ASSIGNMENTS.find((item) => item.id === selectedId) || STUDENT_ASSIGNMENTS[1];

  // Hàm hiển thị huy hiệu trạng thái (luôn có cả biểu tượng VÀ văn bản)
  const renderStatusBadge = (status: AssignmentStatus, customText?: string) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2.2} />
            <span>{customText || 'Đã chấm'}</span>
          </span>
        );
      case 'not_submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={1.75} />
            <span>{customText || 'Chưa nộp'}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-[#EFE9ED] text-[#6B5560] text-[12px] font-bold flex-shrink-0">
            <Hourglass className="w-3.5 h-3.5 text-[#6B5560]" strokeWidth={1.75} />
            <span>{customText || 'Chờ chấm'}</span>
          </span>
        );
    }
  };

  // Nội dung trang giấy A4 hiển thị trực tiếp trong trình xem tài liệu
  const renderDocumentContent = () => {
    if (currentAssignment.id === 2 || currentAssignment.status === 'not_submitted') {
      return (
        <div className="space-y-2.5 text-[#3B2A35]">
          <div className="border-b border-[#F3D9E3] pb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#A61E4D] uppercase tracking-wider">
              Lớp Văn chị Vân · Đề bài chính thức
            </span>
            <span className="text-[12px] text-[#6B5560]">Trang {currentPage} / 2</span>
          </div>

          <h3 className="font-playfair text-[20px] font-bold text-[#3B2A35] text-center pt-0.5">
            BÀI TẬP VĂN – TUẦN 3
          </h3>

          <div className="space-y-2 text-[14px] leading-relaxed pt-1">
            <p className="font-bold text-[#3B2A35]">
              Viết một bài văn nghị luận (khoảng 400 chữ) về tinh thần tự học của học sinh hiện nay.
            </p>
            <p className="font-semibold text-[#1F4E79]">
              Yêu cầu: có mở bài, 3 luận điểm có dẫn chứng, kết bài.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-[#3B2A35]">
        <div className="border-b border-[#F3D9E3] pb-2 flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#A61E4D] uppercase tracking-wider">
            Lớp Văn chị Vân · Đề bài chính thức
          </span>
          <span className="text-[12px] text-[#6B5560]">Trang {currentPage} / 2</span>
        </div>

        <h3 className="font-playfair text-[20px] font-bold text-[#3B2A35] text-center pt-0.5">
          BÀI TẬP VĂN – TUẦN 2
        </h3>
        <p className="text-[14px] font-bold text-[#1F4E79] text-center">
          Đoạn trích: Kiều ở lầu Ngưng Bích (Truyện Kiều – Nguyễn Du)
        </p>

        <div className="space-y-2.5 text-[14px] leading-relaxed pt-1">
          <p className="font-semibold text-[#3B2A35]">
            <span className="text-[#A61E4D] font-bold">Câu 1 (3 điểm).</span> Chép thuộc lòng 8 câu thơ cuối của đoạn trích.
          </p>
          <p className="font-semibold text-[#3B2A35]">
            <span className="text-[#A61E4D] font-bold">Câu 2 (7 điểm).</span> Phân tích nỗi nhớ và nỗi buồn của Thúy Kiều trong 8 câu thơ cuối.
          </p>
        </div>
      </div>
    );
  };

  // Hàm vẽ huy hiệu loại tệp đính kèm cho bảng Admin
  const renderFileTypePill = (fileType: 'PDF' | 'DOCX' | 'XLSX' | 'JPG') => {
    const getIcon = () => {
      switch (fileType) {
        case 'PDF':
          return <FileText className="w-3 h-3 text-[#1F4E79]" strokeWidth={1.75} />;
        case 'DOCX':
          return <FileCode2 className="w-3 h-3 text-[#1F4E79]" strokeWidth={1.75} />;
        case 'XLSX':
          return <FileSpreadsheet className="w-3 h-3 text-[#1F4E79]" strokeWidth={1.75} />;
        case 'JPG':
          return <ImageIcon className="w-3 h-3 text-[#1F4E79]" strokeWidth={1.75} />;
      }
    };

    return (
      <span
        key={fileType}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold leading-none"
      >
        {getIcon()}
        <span>{fileType}</span>
      </span>
    );
  };

  // Hàm vẽ biểu tượng loại tệp trong danh sách đã tải lên của Side Drawer
  const renderDrawerFileIcon = (fileType: 'PDF' | 'DOCX' | 'XLSX' | 'JPG') => {
    switch (fileType) {
      case 'PDF':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-[#A61E4D]" strokeWidth={1.75} />
          </div>
        );
      case 'DOCX':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
            <FileCode2 className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
          </div>
        );
      case 'XLSX':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
          </div>
        );
      case 'JPG':
        return (
          <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
          </div>
        );
    }
  };

  // ==================== GIAO DIỆN ADMIN: MÀN HÌNH "CHẤM BÀI" & DANH SÁCH "BÀI TẬP" ====================
  if (isAdminMode) {
    // 1. MÀN HÌNH "CHẤM BÀI" (MẶC ĐỊNH)
    if (adminSubView === 'grading') {
      const activeStudent =
        gradingStudents.find((s) => s.id === selectedGradingStudentId) || gradingStudents[1];

      // Tính bộ đếm ký tự (hiển thị đúng 112/500 cho đoạn văn bản mẫu mặc định)
      const defaultSampleComment =
        'Bài viết có bố cục rõ ràng, đúng tâm trạng của Kiều. Cần bổ sung dẫn chứng ở câu 1 và sửa lỗi chính tả ở đoạn kết.';
      const commentCharCount =
        gradingComment === defaultSampleComment ? 112 : gradingComment.length;

      return (
        <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px]">
          {/* Khung chuẩn 1200px trên máy tính bàn, co giãn theo khung nhìn trên di động/máy tính bảng */}
          <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-0 lg:justify-between box-border select-none relative font-nunito">
            {toastMessage && (
              <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-4 h-4 text-[#CFE8FF]" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* ==================== HÀNG 1: TIÊU ĐỀ "CHẤM BÀI" ==================== */}
            <header className="min-h-[72px] lg:h-[88px] flex flex-col justify-between gap-2 lg:gap-0 flex-shrink-0">
              {/* Dòng Breadcrumb: nút mũi tên quay lại + "Bài tập › Phân tích "Kiều ở lầu Ngưng Bích"" */}
              <div className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-[#6B5560] leading-none">
                <button
                  type="button"
                  onClick={() => setAdminSubView('list')}
                  aria-label="Quay lại danh sách Bài tập"
                  className="w-8 h-8 lg:w-7 lg:h-7 rounded-[8px] bg-white border border-[#F3D9E3] text-[#1F4E79] hover:bg-[#E9F3FF] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSubView('list')}
                  className="font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                >
                  Bài tập
                </button>
                <span className="text-[#6B5560]">›</span>
                <span className="text-[#6B5560] font-semibold truncate">
                  {gradingAssignmentTitle}
                </span>
              </div>

              {/* Dòng Tiêu đề "Chấm bài" + thẻ trạng thái */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-none">
                  Chấm bài
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold leading-none">
                  Lớp 9 · 2/4 đã chấm
                </span>
              </div>

              {/* Điểm nhấn đặc trưng: Ghi chú viết tay của giáo viên dưới tiêu đề + 2 hình dán (ẩn trên di động) */}
              <div className="flex items-center gap-6">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Học sinh thấy điểm và nhận xét ngay khi em bấm Gửi!
                  </span>
                </div>

                {/* 2 hình dán vector phẳng pastel (ẩn trên di động) */}
                <div className="hidden md:flex items-center gap-2 pl-2">
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
            </header>

            {/* ==================== HÀNG 2: LƯỚI 12 CỘT (40/60 máy tính bảng, 3/9 máy tính bàn, danh sách - chi tiết trên di động) ==================== */}
            <div className="w-full lg:w-[1136px] lg:h-[800px] grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[24px] flex-shrink-0">
              {/* ========== CỘT TRÁI: THẺ "HỌC SINH LỚP 9" ========== */}
              <div
                className={`${
                  mobileShowDetail ? 'hidden md:flex' : 'flex'
                } md:col-span-5 lg:col-span-3 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex-col overflow-hidden`}
              >
                <div className="h-[56px] px-4 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
                  <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                    Học sinh lớp 9
                  </h2>
                  <span className="text-[12px] font-bold text-[#6B5560]">5 học sinh</span>
                </div>

                {/* 5 hàng học sinh */}
                <div className="flex-1 flex flex-col divide-y divide-[#F3D9E3] overflow-hidden">
                  {gradingStudents.map((student) => {
                    const isSelected = student.id === selectedGradingStudentId;
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleSelectGradingStudent(student)}
                        className={`flex-1 min-h-[60px] px-3.5 py-3 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E9F3FF] border-l-4 border-l-[#2F6FA8]'
                            : 'bg-white hover:bg-[#FFF6F9] border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Ảnh đại diện chữ viết tắt 36px + Họ và tên */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-[36px] h-[36px] rounded-[10px] font-bold text-[12px] flex items-center justify-center flex-shrink-0 ${
                              student.status === 'not_submitted'
                                ? 'bg-[#FFE0EB] text-[#A61E4D]'
                                : 'bg-[#DCEBFA] text-[#1F4E79]'
                            }`}
                          >
                            {student.initials}
                          </div>
                          <span className="text-[14px] font-bold text-[#3B2A35] leading-tight truncate" title={student.fullName}>
                            {student.fullName}
                          </span>
                        </div>

                        {/* Huy hiệu trạng thái có cả biểu tượng VÀ chữ */}
                        {renderStatusBadge(student.status, student.badgeText)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========== VÙNG CHI TIẾT BÊN PHẢI ========== */}
              <div
                className={`${
                  mobileShowDetail ? 'flex' : 'hidden md:flex'
                } md:col-span-7 lg:col-span-9 lg:h-[800px] flex-col gap-4 lg:gap-[24px] lg:justify-between overflow-hidden`}
              >
                {/* Nút quay lại danh sách trên di động */}
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="md:hidden h-[44px] px-3.5 rounded-[12px] bg-white border border-[#F3D9E3] text-[#1F4E79] font-bold text-[14px] flex items-center gap-2 w-fit cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  <span>Danh sách học sinh</span>
                </button>

                {/* 1. THẺ THANH THÔNG TIN HỌC SINH Ở TRÊN CÙNG */}
                <div className="min-h-[64px] lg:h-[72px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card px-4 lg:px-5 py-3 lg:py-0 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2 lg:gap-3 flex-wrap min-w-0">
                    <h2 className="font-playfair text-[20px] lg:text-[22px] font-bold text-[#3B2A35] leading-tight">
                      {activeStudent.fullName}
                    </h2>
                    <span className="px-3 py-1 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                      {activeStudent.submittedAt}
                    </span>
                    <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                      {activeStudent.photoCount} ảnh
                    </span>
                  </div>

                  {renderStatusBadge(activeStudent.status, activeStudent.badgeText)}
                </div>

                {/* 2. THẺ TRÌNH XEM BÀI NỘP Ở GIỮA */}
                <div className="min-h-[340px] max-h-[70dvh] lg:max-h-none lg:h-[430px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col overflow-hidden flex-shrink-0">
                  {/* Thanh công cụ: cho phép xuống dòng trên di động */}
                  <div className="min-h-[48px] px-3 lg:px-5 py-2 lg:py-0 bg-[#E9F3FF] border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 lg:gap-3">
                      {/* Điều khiển thu phóng: − 100% + */}
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[10px] border border-[#CFE8FF] text-[#1F4E79] text-[13px] font-bold">
                        <button
                          type="button"
                          onClick={() => setGradingZoom((z) => Math.max(80, z - 10))}
                          className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                          title="Thu nhỏ"
                        >
                          <Minus className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                        </button>
                        <span className="px-1 min-w-[44px] text-center">{gradingZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setGradingZoom((z) => Math.min(130, z + 10))}
                          className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                          title="Phóng to"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                        </button>
                      </div>

                      {/* Nút xoay trang ảnh */}
                      <button
                        type="button"
                        onClick={() => setGradingRotation((r) => (r + 90) % 360)}
                        className="w-8 h-8 rounded-[10px] bg-white border border-[#CFE8FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer"
                        title="Xoay ảnh 90°"
                      >
                        <RotateCw className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                      </button>

                      {/* Nút toàn màn hình */}
                      <button
                        type="button"
                        onClick={() => setIsGradingFullscreen(true)}
                        className="w-8 h-8 rounded-[10px] bg-white border border-[#CFE8FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer"
                        title="Toàn màn hình"
                      >
                        <Maximize2 className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                      </button>
                    </div>

                    {/* Nút viền "Tải về" (#2F6FA8) */}
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          `Đang tải về ảnh bài làm Trang ${gradingSelectedPage} của ${activeStudent.fullName}...`
                        )
                      }
                      className="h-[34px] px-3.5 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#DCEBFA] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#2F6FA8]" strokeWidth={1.75} />
                      <span>Tải về</span>
                    </button>
                  </div>

                  {/* Vùng hiển thị trang vở kẻ ngang viết tay lớn ở giữa */}
                  <div className="flex-1 bg-[#F7FBFF] flex items-center justify-center overflow-auto p-3">
                    <div
                      style={{
                        transform: `scale(${gradingZoom / 100}) rotate(${gradingRotation}deg)`,
                      }}
                      className="transition-transform duration-200"
                    >
                      <GradingNotebookIllustration
                        pageNumber={gradingSelectedPage}
                        variant="canvas"
                      />
                    </div>
                  </div>

                  {/* Dải ảnh thu nhỏ ở dưới đáy */}
                  <div className="h-[82px] px-4 lg:px-5 bg-white border-t border-[#F3D9E3] flex items-center justify-center gap-3 lg:gap-4 overflow-x-auto flex-shrink-0">
                    {([1, 2] as const).map((pageNum) => {
                      const isPageSelected = gradingSelectedPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setGradingSelectedPage(pageNum)}
                          className={`h-[66px] px-3 rounded-[10px] flex items-center gap-2.5 transition-all cursor-pointer flex-shrink-0 ${
                            isPageSelected
                              ? 'border-2 border-[#2F6FA8] bg-[#E9F3FF]'
                              : 'border border-[#F3D9E3] bg-white hover:bg-[#FFF6F9]'
                          }`}
                        >
                          <GradingNotebookIllustration pageNumber={pageNum} variant="thumb" />
                          <span
                            className={`text-[13px] font-bold ${
                              isPageSelected ? 'text-[#1F4E79]' : 'text-[#3B2A35]'
                            }`}
                          >
                            Trang {pageNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. THẺ CHẤM ĐIỂM VÀ NHẬN XÉT Ở DƯỚI CÙNG */}
                <div className="lg:h-[250px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 lg:px-5 lg:py-3.5 flex flex-col justify-between gap-3 lg:gap-0 flex-shrink-0 overflow-hidden">
                  <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-tight">
                    Điểm và nhận xét
                  </h3>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 lg:gap-6">
                    {/* Cụm bên trái: Điểm */}
                    <div className="flex-shrink-0">
                      <label className="block text-[13px] font-bold text-[#3B2A35] mb-1.5">
                        Điểm
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={gradingScore}
                          onChange={(e) => setGradingScore(e.target.value)}
                          aria-label="Điểm số"
                          className="w-[88px] h-[56px] rounded-[12px] border border-[#9C6B84] ring-2 ring-[#2F6FA8] bg-white text-center font-playfair text-[32px] font-bold text-[#1F4E79] outline-none"
                        />
                        <span className="font-nunito text-[18px] font-bold text-[#6B5560]">
                          / 10
                        </span>
                      </div>
                    </div>

                    {/* Cụm bên phải: Nhận xét + bộ đếm */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[13px] font-bold text-[#3B2A35]">
                          Nhận xét
                        </label>
                        <span className="text-[12px] font-semibold text-[#6B5560]">
                          {commentCharCount}/500
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={gradingComment}
                        onChange={(e) => setGradingComment(e.target.value)}
                        className="w-full h-[84px] px-3.5 py-2 rounded-[12px] border border-[#9C6B84] focus:ring-2 focus:ring-[#2F6FA8] bg-white font-nunito text-[14px] font-semibold text-[#3B2A35] leading-snug resize-none outline-none"
                      />
                    </div>
                  </div>

                  {/* Hàng chân thẻ */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
                    <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1F4E79]">
                      <Info className="w-4 h-4 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                      <span>Học sinh sẽ thấy điểm và nhận xét ngay sau khi gửi.</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitGrade}
                      className="w-full sm:w-auto h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white font-nunito text-[14px] font-bold shadow-xs transition-opacity cursor-pointer"
                    >
                      Gửi điểm và nhận xét
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* HỘP THOẠI XEM TOÀN MÀN HÌNH ẢNH BÀI LÀM TRÊN MÀN HÌNH CHẤM BÀI */}
            <Dialog open={isGradingFullscreen} onOpenChange={setIsGradingFullscreen}>
              <DialogContent className="sm:max-w-[680px] p-6 rounded-[12px] bg-white border border-[#F3D9E3]">
                <DialogHeader>
                  <DialogTitle className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                    Bài làm của {activeStudent.fullName} – Trang {gradingSelectedPage}
                  </DialogTitle>
                  <DialogDescription className="font-nunito text-[13px] text-[#6B5560]">
                    {activeStudent.submittedAt} · {gradingAssignmentTitle}
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-[#F7FBFF] p-5 rounded-[12px] border border-[#F3D9E3] flex justify-center">
                  <GradingNotebookIllustration
                    pageNumber={gradingSelectedPage}
                    variant="canvas"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      );
    }

    // 2. MÀN HÌNH DANH SÁCH 14 BÀI TẬP CỦA ADMIN (KHI BẤM QUAY LẠI TỪ BREADCRUMB "BÀI TẬP")
    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px]">
        <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-0 lg:justify-between box-border select-none relative font-nunito">
          {toastMessage && (
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-[#CFE8FF]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* HÀNG 1: TIÊU ĐỀ QUẢN TRỊ VIÊN */}
          <header className="min-h-[72px] lg:h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Bài tập
                </h1>
                <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                  14 bài tập
                </span>
              </div>

              <div className="flex items-center gap-6 mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Giao bài một lần, học sinh xem ngay trên web nhé!
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-2 pl-2">
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

            <button
              type="button"
              onClick={handleOpenNewAssignDrawer}
              className="w-full md:w-auto h-[44px] px-5 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white font-nunito text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2} />
              <span>Giao bài tập</span>
            </button>
          </header>

          {/* HÀNG 2: BỘ LỌC LỚP HỌC – Cuộn ngang trên di động/máy tính bảng */}
          <div className="min-h-[44px] lg:h-[44px] flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 flex-shrink-0">
            {ADMIN_CLASS_FILTERS.map((chip) => {
              const isSelected = selectedAdminClass === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedAdminClass(chip)}
                  className={`h-[44px] px-3 rounded-[10px] text-[13px] font-bold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#2F6FA8] text-white'
                      : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* HÀNG 3: THẺ BẢNG BÀI TẬP */}
          <div className="w-full lg:w-[1136px] lg:h-[732px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col overflow-hidden flex-shrink-0">
            <div className="hidden md:grid h-[48px] px-4 lg:px-5 bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-semibold md:grid-cols-10 lg:grid-cols-12 items-center flex-shrink-0">
              <div className="col-span-4">Bài tập</div>
              <div className="col-span-1">Lớp</div>
              <div className="hidden lg:block lg:col-span-2">Hạn nộp</div>
              <div className="col-span-1">Đã nộp</div>
              <div className="col-span-2">Đã chấm</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {/* Bảng cho Máy tính bảng / Máy tính bàn */}
            <div className="hidden md:block divide-y divide-[#F3D9E3] flex-1">
              {ADMIN_ASSIGNMENTS.map((row) => {
                const submitPercent =
                  row.totalStudents > 0
                    ? Math.round((row.submittedCount / row.totalStudents) * 100)
                    : 0;
                const gradePercent =
                  row.submittedCount > 0
                    ? Math.round((row.gradedCount / row.submittedCount) * 100)
                    : 0;

                return (
                  <div
                    key={row.id}
                    className="h-[72px] px-4 lg:px-5 bg-white hover:bg-[#FFF6F9] grid md:grid-cols-10 lg:grid-cols-12 items-center transition-colors"
                  >
                    <div className="col-span-4 pr-3 flex flex-col justify-center gap-1.5 min-w-0">
                      <span className="text-[14px] font-bold text-[#3B2A35] leading-tight truncate" title={row.title}>
                        {row.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {row.files.map((f) => renderFileTypePill(f))}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold whitespace-nowrap">
                        {row.className}
                      </span>
                    </div>

                    <div className="hidden lg:block lg:col-span-2 text-[14px] font-semibold text-[#3B2A35]">
                      {row.dueDate}
                    </div>

                    <div className="col-span-1 pr-3 lg:pr-4">
                      <div className="text-[13px] font-bold text-[#3B2A35] mb-1">
                        {row.submittedCount}/{row.totalStudents}
                      </div>
                      <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                        <div
                          className="h-full bg-[#8EC5FC] rounded-full"
                          style={{ width: `${submitPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 pr-4 lg:pr-6">
                      {row.isAllGraded ? (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1F4E79]">
                          <Check className="w-4 h-4 text-[#1F4E79]" strokeWidth={2.2} />
                          <span>Đã chấm hết</span>
                        </span>
                      ) : (
                        <div>
                          <div className="text-[13px] font-bold text-[#3B2A35] mb-1">
                            {row.gradedCount}/{row.submittedCount}
                          </div>
                          <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                            <div
                              className="h-full bg-[#8EC5FC] rounded-full"
                              style={{ width: `${gradePercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setGradingAssignmentTitle(row.title);
                          setAdminSubView('grading');
                        }}
                        className="h-[36px] px-3 lg:px-3.5 rounded-[10px] bg-[#2F6FA8] hover:opacity-95 text-white text-[13px] font-bold transition-opacity cursor-pointer whitespace-nowrap"
                      >
                        Chấm bài
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditAssignDrawer(row)}
                        title="Sửa"
                        className="w-[36px] lg:w-[40px] h-[36px] lg:h-[40px] rounded-[10px] text-[#1F4E79] hover:bg-[#E9F3FF] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Xóa bài tập: ${row.title}`)}
                        title="Xóa"
                        className="w-[36px] lg:w-[40px] h-[36px] lg:h-[40px] rounded-[10px] text-[#B02525] hover:bg-[#FFE3E3] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DANH SÁCH THẺ TRÊN DI ĐỘNG */}
            <div className="md:hidden divide-y divide-[#F3D9E3]">
              {ADMIN_ASSIGNMENTS.map((row) => {
                const submitPercent =
                  row.totalStudents > 0
                    ? Math.round((row.submittedCount / row.totalStudents) * 100)
                    : 0;
                const gradePercent =
                  row.submittedCount > 0
                    ? Math.round((row.gradedCount / row.submittedCount) * 100)
                    : 0;

                return (
                  <div key={row.id} className="p-4 flex flex-col gap-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-[#3B2A35] leading-snug">
                          {row.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {row.files.map((f) => renderFileTypePill(f))}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold whitespace-nowrap flex-shrink-0">
                        {row.className}
                      </span>
                    </div>

                    <div className="text-[13px] font-semibold text-[#6B5560]">
                      Hạn nộp: <span className="text-[#3B2A35]">{row.dueDate}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[12px] font-bold text-[#3B2A35] mb-1">
                          Đã nộp: {row.submittedCount}/{row.totalStudents}
                        </div>
                        <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                          <div
                            className="h-full bg-[#8EC5FC] rounded-full"
                            style={{ width: `${submitPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        {row.isAllGraded ? (
                          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#1F4E79] pt-1">
                            <Check className="w-4 h-4 text-[#1F4E79]" strokeWidth={2.2} />
                            <span>Đã chấm hết</span>
                          </span>
                        ) : (
                          <>
                            <div className="text-[12px] font-bold text-[#3B2A35] mb-1">
                              Đã chấm: {row.gradedCount}/{row.submittedCount}
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
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F3D9E3]/60">
                      <button
                        type="button"
                        onClick={() => {
                          setGradingAssignmentTitle(row.title);
                          setAdminSubView('grading');
                        }}
                        className="flex-1 h-[44px] px-4 rounded-[10px] bg-[#2F6FA8] text-white text-[14px] font-bold cursor-pointer"
                      >
                        Chấm bài
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditAssignDrawer(row)}
                        title="Sửa"
                        className="w-[44px] h-[44px] rounded-[10px] text-[#1F4E79] bg-[#E9F3FF] flex items-center justify-center cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Xóa bài tập: ${row.title}`)}
                        title="Xóa"
                        className="w-[44px] h-[44px] rounded-[10px] text-[#B02525] bg-[#FFE3E3] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="min-h-[44px] lg:h-[36px] px-4 lg:px-5 py-2 lg:py-0 border-t border-[#F3D9E3] bg-white flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-[#6B5560] flex-shrink-0">
              <span>Hiển thị 1–9 trên 14 bài tập</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAdminPage(1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] cursor-pointer"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setAdminPage(1)}
                  className={`w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center cursor-pointer ${
                    adminPage === 1
                      ? 'bg-[#2F6FA8] text-white'
                      : 'text-[#1F4E79] hover:bg-[#E9F3FF]'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setAdminPage(2)}
                  className={`w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center cursor-pointer ${
                    adminPage === 2
                      ? 'bg-[#2F6FA8] text-white'
                      : 'text-[#1F4E79] hover:bg-[#E9F3FF]'
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setAdminPage(2)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#1F4E79] hover:bg-[#E9F3FF] cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* NGĂN KÉO BÊN PHẢI: "GIAO BÀI TẬP" */}
          {isAssignDrawerOpen && (
            <div
              className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center md:justify-end"
              style={{ backgroundColor: 'rgba(59, 42, 53, 0.35)' }}
              onClick={handleCloseAssignDrawer}
            >
              <div
                className="w-full md:w-[min(520px,90vw)] lg:w-[520px] max-h-[90dvh] md:max-h-none md:h-full bg-white rounded-t-[20px] md:rounded-t-none md:rounded-l-[16px] shadow-[-12px_0_36px_rgba(59,42,53,0.16)] flex flex-col justify-between overflow-hidden select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Thanh kéo nhỏ trên di động */}
                <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
                  <span className="w-10 h-1 rounded-full bg-[#E5D3DC]" />
                </div>
                <div className="px-5 md:px-6 py-4 border-b border-[#F3D9E3] flex items-start justify-between gap-4 flex-shrink-0">
                  <div>
                    <h2 className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight">
                      Giao bài tập
                    </h2>
                    <p className="font-nunito text-[14px] font-medium text-[#6B5560] mt-1 leading-snug">
                      Học sinh sẽ xem file ngay trên web và vẫn có thể tải về
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseAssignDrawer}
                    aria-label="Đóng ngăn kéo Giao bài tập"
                    className="w-9 h-9 rounded-[10px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-5 h-5" strokeWidth={1.75} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitAssignDrawer}
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-[20px]"
                >
                  <div>
                    <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-1.5">
                      Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={drawerTitle}
                      onChange={(e) => setDrawerTitle(e.target.value)}
                      className="w-full h-[48px] px-4 rounded-[12px] border border-[#9C6B84] ring-2 ring-[#2F6FA8] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-1.5">
                      Lớp
                    </label>
                    <div className="relative">
                      <select
                        value={drawerClass}
                        onChange={(e) => setDrawerClass(e.target.value)}
                        className="w-full h-[48px] px-4 pr-10 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8] appearance-none cursor-pointer"
                      >
                        <option value="Lớp 1">Lớp 1</option>
                        <option value="Lớp 2">Lớp 2</option>
                        <option value="Lớp 3">Lớp 3</option>
                        <option value="Lớp 4">Lớp 4</option>
                        <option value="Lớp 5">Lớp 5</option>
                        <option value="Lớp 6">Lớp 6</option>
                        <option value="Lớp 7">Lớp 7</option>
                        <option value="Lớp 8">Lớp 8</option>
                        <option value="Lớp 9">Lớp 9</option>
                        <option value="Lớp 10">Lớp 10</option>
                        <option value="Lớp 11">Lớp 11</option>
                        <option value="Lớp 12">Lớp 12</option>
                      </select>
                      <ChevronDown
                        className="w-4 h-4 text-[#6B5560] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-1.5">
                      Hạn nộp
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <CalendarIcon
                          className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          strokeWidth={1.75}
                        />
                        <input
                          type="text"
                          value={drawerDueDate}
                          onChange={(e) => setDrawerDueDate(e.target.value)}
                          className="w-full h-[48px] pl-10 pr-3 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                        />
                      </div>

                      <div className="relative">
                        <Clock
                          className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          strokeWidth={1.75}
                        />
                        <input
                          type="text"
                          value={drawerDueTime}
                          onChange={(e) => setDrawerDueTime(e.target.value)}
                          className="w-full h-[48px] pl-10 pr-3 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-1.5">
                      Hướng dẫn cho học sinh
                    </label>
                    <textarea
                      rows={3}
                      value={drawerInstructions}
                      onChange={(e) => setDrawerInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-[12px] border border-[#9C6B84] text-[14px] font-semibold text-[#3B2A35] bg-white outline-none focus:ring-2 focus:ring-[#2F6FA8] resize-none leading-snug"
                    />
                  </div>

                  <div>
                    <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-1.5">
                      File đề bài
                    </label>

                    <input
                      ref={drawerFileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
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
                      className="h-[120px] rounded-[16px] border-2 border-dashed border-[#8EC5FC] bg-[#F7FBFF] hover:bg-[#E9F3FF]/60 px-4 py-2.5 flex flex-col items-center justify-between text-center transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#2F6FA8]" strokeWidth={1.75} />
                        <span className="text-[13px] font-bold text-[#3B2A35]">
                          Kéo thả file vào đây hoặc bấm để chọn
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold leading-none">
                          <ImageIcon className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                          <span>Ảnh JPG, PNG</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold leading-none">
                          <FileText className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                          <span>PDF</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold leading-none">
                          <FileCode2 className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                          <span>Word DOCX</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold leading-none">
                          <FileSpreadsheet
                            className="w-3.5 h-3.5 text-[#1F4E79]"
                            strokeWidth={1.75}
                          />
                          <span>Excel XLSX</span>
                        </span>
                      </div>

                      <span className="text-[12px] font-medium text-[#6B5560] leading-none">
                        Tối đa 20 MB mỗi file
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      {drawerFiles.map((file) => (
                        <div
                          key={file.id}
                          className="h-[64px] px-3.5 rounded-[12px] border border-[#F3D9E3] bg-white flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {renderDrawerFileIcon(file.type)}
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-bold text-[#3B2A35] truncate">
                                {file.name} ·{' '}
                                <span className="font-semibold text-[#6B5560]">{file.size}</span>
                              </div>

                              {file.status === 'uploading' && (
                                <div className="mt-1.5 flex items-center gap-2.5">
                                  <div className="flex-1 h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden">
                                    <div
                                      className="h-full bg-[#2F6FA8] rounded-full"
                                      style={{ width: `${file.progress || 70}%` }}
                                    />
                                  </div>
                                  <span className="text-[12px] font-bold text-[#1F4E79] flex-shrink-0 leading-none">
                                    Đang tải lên {file.progress || 70}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {file.status === 'uploaded' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold leading-none">
                                <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2} />
                                <span>Đã tải lên</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveDrawerFile(file.id, file.name)}
                              aria-label={`Xóa tệp ${file.name}`}
                              className="w-7 h-7 rounded-[8px] text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>

                <div className="px-6 py-3.5 border-t border-[#F3D9E3] bg-white flex items-center justify-between flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseAssignDrawer}
                    className="h-[48px] px-4 rounded-[12px] text-[#6B5560] hover:text-[#3B2A35] text-[14px] font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitAssignDrawer}
                    className="h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white text-[14px] font-bold shadow-xs transition-opacity cursor-pointer"
                  >
                    Giao bài tập
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== GIAO DIỆN HỌC SINH (KHI TRUY CẬP ?role=student) ====================
  const isNotSubmittedState = currentAssignment.status === 'not_submitted';

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px]">
      <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-0 lg:justify-between box-border select-none relative font-nunito">
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#3B2A35] text-white px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-[#CFE8FF]" />
            <span>{toastMessage}</span>
          </div>
        )}

        <header className="min-h-[72px] lg:h-[88px] flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Bài tập
              </h1>
              <span className="px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold tracking-wide">
                5 bài · 2 chưa nộp
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Chụp rõ chữ, đủ sáng rồi bấm Nộp bài nhé!
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
        </header>

        <div className="w-full lg:w-[1136px] lg:h-[800px] grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[24px] flex-shrink-0">
          <div
            className={`${
              mobileShowDetail ? 'hidden md:flex' : 'flex'
            } md:col-span-5 lg:col-span-3 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex-col overflow-hidden`}
          >
            <div className="h-[56px] px-4 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0">
              <h2 className="font-playfair text-[18px] font-bold text-[#3B2A35]">
                Bài tập của em
              </h2>
              <span className="text-[12px] font-bold text-[#6B5560]">5 bài</span>
            </div>

            <div className="flex-1 flex flex-col divide-y divide-[#F3D9E3] overflow-hidden">
              {STUDENT_ASSIGNMENTS.map((assignment) => {
                const isSelected = assignment.id === selectedId;
                return (
                  <div
                    key={assignment.id}
                    onClick={() => {
                      setSelectedId(assignment.id);
                      setActiveFileTab('pdf');
                      setCurrentPage(1);
                      setMobileShowDetail(true);
                    }}
                    className={`flex-1 min-h-[76px] p-4 flex flex-col justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#E9F3FF] border-l-4 border-l-[#2F6FA8]'
                        : 'bg-white hover:bg-[#FFF6F9] border-l-4 border-l-transparent'
                    }`}
                  >
                    <h3 className="font-nunito text-[14px] font-bold text-[#3B2A35] leading-snug line-clamp-2">
                      {assignment.title}
                    </h3>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[12px] font-medium text-[#6B5560] truncate">
                        {assignment.dueDate}
                      </span>
                      {renderStatusBadge(assignment.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`${
              mobileShowDetail ? 'flex' : 'hidden md:flex'
            } md:col-span-7 lg:col-span-9 lg:h-[800px] flex-col gap-4 lg:gap-[24px] lg:justify-between overflow-hidden`}
          >
            {/* Nút quay lại danh sách bài tập trên di động */}
            <button
              type="button"
              onClick={() => setMobileShowDetail(false)}
              className="md:hidden h-[44px] px-3.5 rounded-[12px] bg-white border border-[#F3D9E3] text-[#1F4E79] font-bold text-[14px] flex items-center gap-2 w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              <span>Danh sách bài tập</span>
            </button>

            <div className="lg:h-[84px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card px-4 lg:px-5 py-3 flex flex-col justify-between gap-2 lg:gap-0 flex-shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2 lg:gap-4">
                <h2 className="font-playfair text-[19px] lg:text-[22px] font-bold text-[#3B2A35] leading-tight">
                  {currentAssignment.fullTitle}
                </h2>
                {renderStatusBadge(currentAssignment.status)}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                  {currentAssignment.className}
                </span>
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#EFE9ED] text-[#3B2A35] text-[12px] font-semibold">
                  {currentAssignment.dueDateTime}
                </span>
                {currentAssignment.remainingText && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] bg-[#FFE0EB] text-[#A61E4D] text-[12px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#A61E4D]" strokeWidth={1.75} />
                    <span>{currentAssignment.remainingText}</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-semibold">
                  {currentAssignment.assignedBy}
                </span>
              </div>
            </div>

            <div
              className={`max-h-[70dvh] lg:max-h-none ${
                isNotSubmittedState ? 'lg:h-[316px]' : 'lg:h-[418px]'
              } bg-white border border-[#F3D9E3] rounded-[16px] shadow-card flex flex-col overflow-hidden flex-shrink-0`}
            >
              <div className="h-[42px] px-4 lg:px-5 border-b border-[#F3D9E3] flex items-center gap-6 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFileTab('pdf');
                    setCurrentPage(1);
                  }}
                  className={`h-full flex items-center gap-2 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                    activeFileTab === 'pdf'
                      ? 'border-[#2F6FA8] text-[#1F4E79]'
                      : 'border-transparent text-[#6B5560] hover:text-[#3B2A35]'
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 ${
                      activeFileTab === 'pdf' ? 'text-[#2F6FA8]' : 'text-[#6B5560]'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>Đề bài.pdf</span>
                </button>
              </div>

              <div className="min-h-[48px] px-3 lg:px-5 py-2 lg:py-0 bg-[#E9F3FF] border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[10px] border border-[#CFE8FF] text-[#1F4E79] text-[13px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                    </button>
                    <span className="px-1">{currentPage} / 2</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
                      className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-[#1F4E79]" strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[10px] border border-[#CFE8FF] text-[#1F4E79] text-[13px] font-bold">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                      className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                    </button>
                    <span className="px-1 min-w-[44px] text-center">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                      className="p-0.5 hover:bg-[#E9F3FF] rounded cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={1.75} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenViewer(true)}
                    className="w-8 h-8 rounded-[10px] bg-white border border-[#CFE8FF] text-[#1F4E79] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Đang tải xuống tệp Đề bài.pdf...')}
                  className="h-[34px] px-3.5 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#DCEBFA] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#2F6FA8]" strokeWidth={1.75} />
                  <span>Tải về</span>
                </button>
              </div>

              <div className="flex-1 bg-[#F7FBFF] overflow-y-auto p-3.5 flex justify-center">
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                  className="w-full max-w-[680px] bg-white border border-[#F3D9E3] shadow-[0_2px_10px_rgba(59,42,53,0.08)] rounded-[10px] p-4 transition-transform"
                >
                  {renderDocumentContent()}
                </div>
              </div>
            </div>

            {isNotSubmittedState ? (
              <div className="lg:h-[352px] grid grid-cols-1 lg:grid-cols-9 gap-4 lg:gap-[24px] flex-shrink-0">
                <div className="lg:col-span-6 lg:h-[352px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 lg:px-4 lg:py-3 flex flex-col justify-between gap-3 lg:gap-0 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35] leading-tight">
                      Bài làm của em
                    </h3>
                  </div>

                  <input
                    ref={studentFileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        for (let i = 0; i < files.length; i++) {
                          handleAddPage();
                        }
                      }
                      e.target.value = '';
                    }}
                  />

                  <div
                    onClick={() => studentFileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        for (let i = 0; i < e.dataTransfer.files.length; i++) {
                          handleAddPage();
                        }
                      }
                    }}
                    className="border-2 border-dashed border-[#8EC5FC] rounded-[16px] bg-[#F7FBFF] px-3 lg:px-4 py-2.5 lg:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] bg-[#E9F3FF] text-[#2F6FA8] flex items-center justify-center flex-shrink-0">
                        <Camera className="w-4 h-4 text-[#2F6FA8]" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#3B2A35] leading-tight truncate">
                          Chụp ảnh hoặc chọn ảnh bài làm
                        </div>
                        <div className="text-[12px] font-medium text-[#6B5560] leading-tight mt-0.5">
                          JPG, PNG · tối đa 10 ảnh · mỗi ảnh dưới 10 MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          studentFileInputRef.current?.click();
                        }}
                        className="w-full sm:w-auto h-[36px] lg:h-[34px] px-3 rounded-[10px] bg-white border border-[#2F6FA8] text-[#2F6FA8] hover:bg-[#E9F3FF] text-[12px] font-bold transition-colors cursor-pointer"
                      >
                        Chọn từ thư viện
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 overflow-x-auto pb-1">
                    {uploadedPages.map((pageNum, idx) => (
                      <div key={pageNum} className="flex flex-col items-center flex-shrink-0">
                        <div className="relative group">
                          <div
                            onClick={() => setPreviewNotebookPage(idx + 1)}
                            className="cursor-pointer"
                          >
                            <NotebookThumbnailSvg pageNumber={idx + 1} size="96x128" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePage(pageNum)}
                            aria-label={`Xóa Trang ${idx + 1}`}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 lg:w-5 lg:h-5 rounded-full bg-white border border-[#F3D9E3] text-[#3B2A35] hover:bg-[#FFE0EB] hover:text-[#A61E4D] shadow-2xs flex items-center justify-center transition-colors cursor-pointer z-20"
                          >
                            <X className="w-3 h-3" strokeWidth={2} />
                          </button>
                        </div>
                        <span className="text-[12px] font-bold text-[#3B2A35] mt-1 leading-none">
                          Trang {idx + 1}
                        </span>
                      </div>
                    ))}

                    <div className="flex flex-col items-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => studentFileInputRef.current?.click()}
                        className="w-[96px] h-[128px] rounded-[10px] border-2 border-dashed border-[#8EC5FC] bg-[#F7FBFF] hover:bg-[#E9F3FF] text-[#2F6FA8] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-5 h-5 text-[#2F6FA8]" strokeWidth={1.75} />
                        <span className="text-[12px] font-bold text-[#2F6FA8]">+ Thêm ảnh</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                    <span className="text-[12px] font-semibold text-[#6B5560]">
                      Có thể sửa bài nộp trước hạn
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          `Đã nộp thành công ${uploadedPages.length} trang ảnh bài làm cho Chị Vân!`
                        )
                      }
                      className="w-full sm:w-auto h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:opacity-95 text-white text-[14px] font-bold shadow-xs transition-opacity cursor-pointer"
                    >
                      Nộp bài
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-3 lg:h-[352px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col justify-between gap-3 lg:gap-0 overflow-hidden">
                  <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35] leading-tight">
                    Nhận xét và điểm
                  </h3>

                  <div className="my-auto flex flex-col items-center text-center px-2 py-2">
                    <div className="w-[48px] h-[48px] rounded-full bg-[#EFE9ED] flex items-center justify-center mb-3">
                      <Hourglass className="w-5 h-5 text-[#6B5560]" strokeWidth={1.75} />
                    </div>
                    <div className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-snug">
                      Chưa có điểm
                    </div>
                    <p className="font-nunito text-[14px] font-medium text-[#6B5560] mt-1 leading-relaxed">
                      Thầy cô sẽ chấm sau khi em nộp bài.
                    </p>
                  </div>

                  <div className="h-2" />
                </div>
              </div>
            ) : (
              <div className="lg:h-[250px] grid grid-cols-1 lg:grid-cols-9 gap-4 lg:gap-[24px] flex-shrink-0">
                <div className="lg:col-span-5 lg:h-[250px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col justify-between gap-3 lg:gap-0 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                      Bài làm của em
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                      <Check className="w-3.5 h-3.5 text-[#1F4E79]" strokeWidth={2.2} />
                      <span>Đã nộp 20:14, 11/11/2026</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:gap-5 my-auto">
                    <div
                      onClick={() => setPreviewNotebookPage(1)}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      <div className="relative transition-transform group-hover:-translate-y-0.5 shadow-2xs rounded-[10px]">
                        <NotebookThumbnailSvg pageNumber={1} size="104x140" />
                      </div>
                      <span className="text-[12px] font-bold text-[#3B2A35] mt-1">
                        Trang 1
                      </span>
                    </div>

                    <div
                      onClick={() => setPreviewNotebookPage(2)}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      <div className="relative transition-transform group-hover:-translate-y-0.5 shadow-2xs rounded-[10px]">
                        <NotebookThumbnailSvg pageNumber={2} size="104x140" />
                      </div>
                      <span className="text-[12px] font-bold text-[#3B2A35] mt-1">
                        Trang 2
                      </span>
                    </div>

                    <div className="flex flex-col justify-center gap-1.5 pl-1">
                      <button
                        type="button"
                        onClick={() => setPreviewNotebookPage(1)}
                        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                      >
                        <ZoomIn className="w-4 h-4 text-[#2F6FA8]" strokeWidth={1.75} />
                        <span>Xem lớn</span>
                      </button>
                      <span className="text-[12px] text-[#6B5560]">
                        2 ảnh trang vở đã nộp
                      </span>
                    </div>
                  </div>

                  <div className="text-[12px] font-medium text-[#6B5560] leading-none">
                    Bài đã chấm nên không thể sửa.
                  </div>
                </div>

                <div className="lg:col-span-4 lg:h-[250px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-card p-4 flex flex-col justify-between gap-3 lg:gap-0 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-playfair text-[17px] font-bold text-[#3B2A35]">
                        Nhận xét và điểm
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-9 h-9 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] font-bold text-[13px] flex items-center justify-center flex-shrink-0">
                          CV
                        </div>
                        <span className="text-[12px] font-semibold text-[#6B5560] leading-tight">
                          <strong className="text-[#3B2A35]">Chị Vân</strong> · chấm 08:30, 12/11/2026
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline flex-shrink-0">
                      <span className="font-playfair text-[44px] lg:text-[56px] font-bold text-[#1F4E79] leading-none">
                        8,5
                      </span>
                      <span className="font-nunito text-[18px] lg:text-[20px] font-bold text-[#6B5560] ml-0.5">
                        /10
                      </span>
                    </div>
                  </div>

                  <p className="font-nunito text-[14px] text-[#3B2A35] leading-snug bg-[#FFF6F9] p-3 rounded-[12px] border border-[#F3D9E3]">
                    &ldquo;Em hiểu đúng tâm trạng cô đơn và nỗi nhớ của Kiều. Phần phân tích hình ảnh &ldquo;cửa bể chiều hôm&rdquo; rất tốt, cần thêm dẫn chứng ở câu 1. Chữ viết đẹp, trình bày sạch sẽ.&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={previewNotebookPage !== null}
          onOpenChange={(open) => !open && setPreviewNotebookPage(null)}
        >
          <DialogContent className="sm:max-w-[680px] p-6 rounded-[12px] bg-white border border-[#F3D9E3]">
            <DialogHeader>
              <DialogTitle className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                Bài làm của em – Trang {previewNotebookPage}
              </DialogTitle>
              <DialogDescription className="font-nunito text-[13px] text-[#6B5560]">
                {currentAssignment.fullTitle}
              </DialogDescription>
            </DialogHeader>

            {previewNotebookPage && (
              <div className="space-y-4">
                <NotebookThumbnailSvg pageNumber={previewNotebookPage} size="large" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPreviewNotebookPage(p)}
                        className={`px-3 py-1.5 rounded-[10px] text-[13px] font-bold cursor-pointer ${
                          previewNotebookPage === p
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#E9F3FF] text-[#1F4E79]'
                        }`}
                      >
                        Trang {p}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewNotebookPage(null)}
                    className="px-4 py-1.5 rounded-[10px] bg-[#EFE9ED] text-[#3B2A35] text-[13px] font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isFullscreenViewer} onOpenChange={setIsFullscreenViewer}>
          <DialogContent className="sm:max-w-[760px] p-6 rounded-[12px] bg-white border border-[#F3D9E3]">
            <DialogHeader>
              <DialogTitle className="font-playfair text-[22px] font-bold text-[#3B2A35]">
                Đề bài.pdf
              </DialogTitle>
              <DialogDescription className="font-nunito text-[13px] text-[#6B5560]">
                {currentAssignment.fullTitle} · Trang {currentPage} / 2
              </DialogDescription>
            </DialogHeader>
            <div className="bg-[#F7FBFF] p-5 rounded-[10px] border border-[#F3D9E3]">
              <div className="bg-white p-6 rounded-[10px] border border-[#F3D9E3] shadow-xs">
                {renderDocumentContent()}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
