import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Wallet,
  FileText,
  Megaphone,
  RefreshCw,
  Pencil,
  Check,
  ChevronRight,
  CalendarX,
  CalendarClock,
  X,
  Users,
  Info,
  Send,
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// Phân loại biểu tượng của từng dòng thông báo
type NotificationCategory = 'SCHEDULE' | 'TUITION' | 'DOCUMENT' | 'GENERAL';

// Nguồn gửi: Tự động hoặc Thủ công
type NotificationSource = 'AUTO' | 'MANUAL';

// Bộ lọc trên thanh điều khiển phân đoạn của Admin
type HistoryFilter = 'ALL' | 'MANUAL' | 'AUTO';

// Bộ lọc trên thẻ danh sách thông báo của Học sinh
type StudentNotifFilter = 'ALL' | 'UNREAD' | 'SCHEDULE' | 'TUITION' | 'OTHER';

// Loại thông báo trong ngăn kéo "Soạn thông báo"
type ComposeType = 'GENERAL' | 'SCHEDULE' | 'TUITION';

interface NotificationHistoryRow {
  id: number;
  category: NotificationCategory;
  title: string;
  recipients: string;
  source: NotificationSource;
  timeText: string;
  readCount: number;
  totalCount: number;
}

interface StudentNotificationItem {
  id: number;
  category: NotificationCategory;
  typeChipLabel: string;
  source: NotificationSource;
  title: string;
  preview: string;
  timeText: string;
  fullTimeMeta: string;
  unread: boolean;
  body: string;
  relatedBoxTitle: string;
  relatedItems: {
    label: string;
    value: string;
    isStatusBadge?: boolean;
    statusText?: string;
    statusTone?: 'pink' | 'blue';
  }[];
  primaryCtaLabel: string;
}

// Danh sách đúng 8 dòng lịch sử thông báo của Admin theo đúng thứ tự yêu cầu
const INITIAL_HISTORY_ROWS: NotificationHistoryRow[] = [
  {
    id: 1,
    category: 'SCHEDULE',
    title: 'Nhắc lịch học hôm nay',
    recipients: 'Lớp 9, Lớp 6 · 8 học sinh',
    source: 'AUTO',
    timeText: 'Hôm nay 08:00',
    readCount: 5,
    totalCount: 8,
  },
  {
    id: 2,
    category: 'GENERAL',
    title: 'Thông báo nghỉ buổi Thứ Hai 16/11',
    recipients: 'Lớp 8, Lớp 9 · 9 học sinh',
    source: 'MANUAL',
    timeText: 'Hôm qua 20:15',
    readCount: 7,
    totalCount: 9,
  },
  {
    id: 3,
    category: 'SCHEDULE',
    title: 'Nhắc lịch học hôm nay',
    recipients: 'Lớp 7, Lớp 10 · 15 học sinh',
    source: 'AUTO',
    timeText: 'Hôm qua 08:00',
    readCount: 14,
    totalCount: 15,
  },
  {
    id: 4,
    category: 'TUITION',
    title: 'Nhắc học phí tháng 11 (nhắc lại)',
    recipients: '7 học sinh chưa đóng',
    source: 'AUTO',
    timeText: 'Hôm qua 08:00',
    readCount: 5,
    totalCount: 7,
  },
  {
    id: 5,
    category: 'DOCUMENT',
    title: 'Bài tập Lớp 9 đã giao',
    recipients: 'Lớp 9 · 5 học sinh',
    source: 'AUTO',
    timeText: '11/11 20:00',
    readCount: 5,
    totalCount: 5,
  },
  {
    id: 6,
    category: 'GENERAL',
    title: 'Lịch thi thử Lớp 9, Thứ Bảy 21/11',
    recipients: 'Lớp 9 · 5 học sinh',
    source: 'MANUAL',
    timeText: '10/11 19:00',
    readCount: 5,
    totalCount: 5,
  },
  {
    id: 7,
    category: 'DOCUMENT',
    title: 'Đơn xin nghỉ của Đỗ Gia Hân đã được duyệt',
    recipients: '1 học sinh',
    source: 'AUTO',
    timeText: '06/11 08:15',
    readCount: 1,
    totalCount: 1,
  },
  {
    id: 8,
    category: 'TUITION',
    title: 'Nhắc học phí tháng 11',
    recipients: '7 học sinh chưa đóng',
    source: 'AUTO',
    timeText: '05/11 08:00',
    readCount: 6,
    totalCount: 7,
  },
];

// Danh sách đúng 8 dòng thông báo của Học sinh (Đỗ Gia Hân) theo đúng thứ tự yêu cầu
const INITIAL_STUDENT_NOTIFICATIONS: StudentNotificationItem[] = [
  {
    id: 1,
    category: 'SCHEDULE',
    typeChipLabel: 'Lịch học',
    source: 'AUTO',
    title: 'Nhắc lịch học hôm nay',
    preview: 'Hôm nay em có buổi học Lớp 9 từ 17:30 đến 19:00.',
    timeText: 'Hôm nay 08:00',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · Hôm nay, 08:00 (13/11/2026)',
    unread: true,
    body: 'Chào Gia Hân, hôm nay em có buổi học Lớp 9 từ 17:30 đến 19:00 cùng chị Vân. Em nhớ chuẩn bị vở ghi và bài tập đầy đủ trước khi đến lớp nhé.',
    relatedBoxTitle: 'Buổi học liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Ngày học', value: '13/11/2026' },
      { label: 'Khung giờ', value: '17:30 – 19:00' },
      {
        label: 'Trạng thái',
        value: 'Sắp diễn ra',
        isStatusBadge: true,
        statusText: 'Sắp diễn ra',
        statusTone: 'blue',
      },
    ],
    primaryCtaLabel: 'Mở lịch học',
  },
  {
    id: 2,
    category: 'TUITION',
    typeChipLabel: 'Học phí',
    source: 'AUTO',
    title: 'Nhắc học phí tháng 11',
    preview: 'Học phí tháng 11 của em là 1.200.000 đ, chưa đóng.',
    timeText: 'Hôm qua 08:00',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · Hôm qua, 08:00 (12/11/2026)',
    unread: true,
    body: 'Chào Gia Hân, học phí tháng 11 của em là 1.200.000 đ và hiện chưa được đóng. Em nhờ phụ huynh quét mã QR trong hoá đơn để thanh toán. Nếu đã đóng rồi, em bỏ qua thông báo này nhé.',
    relatedBoxTitle: 'Hoá đơn liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Kỳ', value: 'Tháng 11/2026' },
      { label: 'Số tiền', value: '1.200.000 đ' },
      {
        label: 'Trạng thái',
        value: 'Chưa đóng',
        isStatusBadge: true,
        statusText: 'Chưa đóng',
        statusTone: 'pink',
      },
    ],
    primaryCtaLabel: 'Mở hoá đơn',
  },
  {
    id: 3,
    category: 'GENERAL',
    typeChipLabel: 'Thông báo chung',
    source: 'MANUAL',
    title: 'Thông báo nghỉ buổi Thứ Hai 16/11',
    preview: 'Lớp 9 nghỉ buổi học Thứ Hai vì chị Vân đi dự hội thảo.',
    timeText: 'Hôm qua 20:15',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · Hôm qua, 20:15 (12/11/2026)',
    unread: true,
    body: 'Lớp 8 và Lớp 9 nghỉ buổi học Thứ Hai, 16/11 vì chị Vân đi dự hội thảo. Lịch học bù chị sẽ báo sau. Các em nhớ làm bài tập đầy đủ nhé!',
    relatedBoxTitle: 'Buổi học liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Ngày nghỉ', value: 'Thứ Hai, 16/11/2026' },
      { label: 'Lịch bù', value: 'Thông báo sau' },
      {
        label: 'Trạng thái',
        value: 'Nghỉ buổi học',
        isStatusBadge: true,
        statusText: 'Nghỉ buổi học',
        statusTone: 'pink',
      },
    ],
    primaryCtaLabel: 'Xem lịch học',
  },
  {
    id: 4,
    category: 'DOCUMENT',
    typeChipLabel: 'Bài tập',
    source: 'AUTO',
    title: 'Bài tập mới: Nghị luận về tinh thần tự học',
    preview: 'Hạn nộp 23:59, 17/11/2026.',
    timeText: '11/11 20:00',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · 11/11/2026, 20:00',
    unread: false,
    body: 'Chị Vân vừa giao bài tập mới cho Lớp 9: "Nghị luận về tinh thần tự học". Em mở trang Bài tập để đọc đề trực tiếp trên web và chụp ảnh bài làm nộp trước hạn nhé.',
    relatedBoxTitle: 'Bài tập liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Đề bài', value: 'Nghị luận về tinh thần tự học' },
      { label: 'Hạn nộp', value: '23:59, 17/11/2026' },
      {
        label: 'Trạng thái',
        value: 'Chưa nộp',
        isStatusBadge: true,
        statusText: 'Chưa nộp',
        statusTone: 'pink',
      },
    ],
    primaryCtaLabel: 'Mở bài tập',
  },
  {
    id: 5,
    category: 'GENERAL',
    typeChipLabel: 'Thông báo chung',
    source: 'MANUAL',
    title: 'Lịch thi thử Lớp 9, Thứ Bảy 21/11',
    preview: 'Em nhớ mang bút và thẻ học sinh.',
    timeText: '10/11 19:00',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · 10/11/2026, 19:00',
    unread: false,
    body: 'Thứ Bảy ngày 21/11 Lớp 9 sẽ có buổi thi thử tổng hợp 90 phút. Các em đến sớm 15 phút, mang theo bút viết và thẻ học sinh đầy đủ nhé.',
    relatedBoxTitle: 'Lịch thi liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Ngày thi', value: 'Thứ Bảy, 21/11/2026' },
      { label: 'Thời lượng', value: '90 phút' },
      {
        label: 'Trạng thái',
        value: 'Đã lên lịch',
        isStatusBadge: true,
        statusText: 'Đã lên lịch',
        statusTone: 'blue',
      },
    ],
    primaryCtaLabel: 'Xem lịch thi',
  },
  {
    id: 6,
    category: 'DOCUMENT',
    typeChipLabel: 'Đơn xin nghỉ',
    source: 'AUTO',
    title: 'Đơn xin nghỉ của em đã được duyệt',
    preview: 'Đơn nghỉ ngày 06/11 đã được chị Vân duyệt.',
    timeText: '06/11 08:15',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · 06/11/2026, 08:15',
    unread: false,
    body: 'Đơn xin nghỉ buổi học ngày 06/11/2026 của em đã được chị Vân duyệt. Em nhớ xem lại tài liệu và hoàn thành bài tập bù trên web nhé.',
    relatedBoxTitle: 'Đơn xin nghỉ liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Ngày nghỉ', value: '06/11/2026' },
      { label: 'Người duyệt', value: 'Chị Vân' },
      {
        label: 'Trạng thái',
        value: 'Đã duyệt',
        isStatusBadge: true,
        statusText: 'Đã duyệt',
        statusTone: 'blue',
      },
    ],
    primaryCtaLabel: 'Mở đơn xin nghỉ',
  },
  {
    id: 7,
    category: 'SCHEDULE',
    typeChipLabel: 'Lịch học',
    source: 'AUTO',
    title: 'Nhắc lịch học hôm nay',
    preview: 'Hôm nay em có buổi học Lớp 9 từ 17:30 đến 19:00.',
    timeText: '11/11 08:00',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · 11/11/2026, 08:00',
    unread: false,
    body: 'Chào Gia Hân, hôm nay em có buổi học Lớp 9 từ 17:30 đến 19:00. Em nhớ mang vở ghi và bài viết văn để chị Vân sửa bài trên lớp nhé.',
    relatedBoxTitle: 'Buổi học liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Ngày học', value: '11/11/2026' },
      { label: 'Khung giờ', value: '17:30 – 19:00' },
      {
        label: 'Trạng thái',
        value: 'Đã hoàn thành',
        isStatusBadge: true,
        statusText: 'Đã hoàn thành',
        statusTone: 'blue',
      },
    ],
    primaryCtaLabel: 'Mở lịch học',
  },
  {
    id: 8,
    category: 'TUITION',
    typeChipLabel: 'Học phí',
    source: 'AUTO',
    title: 'Nhắc học phí tháng 11',
    preview: 'Học phí tháng 11 của em là 1.200.000 đ.',
    timeText: '05/11 08:00',
    fullTimeMeta: 'Từ Lớp Văn chị Vân · 05/11/2026, 08:00',
    unread: false,
    body: 'Chào Gia Hân, hoá đơn học phí tháng 11/2026 của Lớp 9 đã được tạo với số tiền 1.200.000 đ. Em nhắc phụ huynh xem chi tiết trong mục Học phí nhé.',
    relatedBoxTitle: 'Hoá đơn liên quan',
    relatedItems: [
      { label: 'Học sinh', value: 'Đỗ Gia Hân' },
      { label: 'Lớp', value: 'Lớp 9' },
      { label: 'Kỳ', value: 'Tháng 11/2026' },
      { label: 'Số tiền', value: '1.200.000 đ' },
      {
        label: 'Trạng thái',
        value: 'Chưa đóng',
        isStatusBadge: true,
        statusText: 'Chưa đóng',
        statusTone: 'pink',
      },
    ],
    primaryCtaLabel: 'Mở hoá đơn',
  },
];

// Danh sách 3 mẫu soạn nhanh bên cột phải dưới (Admin)
const QUICK_TEMPLATES = [
  {
    id: 'class-off',
    name: 'Nghỉ buổi học',
    description: 'Báo lớp nghỉ một buổi',
    chipBg: '#FFE0EB',
    iconColor: '#A61E4D',
    type: 'GENERAL' as ComposeType,
    defaultClasses: ['Lớp 8', 'Lớp 9'],
    defaultTitle: 'Thông báo nghỉ buổi Thứ Hai 16/11',
    defaultBody:
      'Lớp 8 và Lớp 9 nghỉ buổi học Thứ Hai, 16/11 vì chị Vân đi dự hội thảo. Lịch học bù chị sẽ báo sau. Các em nhớ làm bài tập đầy đủ nhé!',
  },
  {
    id: 'reschedule',
    name: 'Đổi lịch học',
    description: 'Báo đổi giờ hoặc ngày học',
    chipBg: '#DCEBFA',
    iconColor: '#1F4E79',
    type: 'SCHEDULE' as ComposeType,
    defaultClasses: ['Lớp 9'],
    defaultTitle: 'Thông báo đổi giờ học Lớp 9 tuần này',
    defaultBody:
      'Buổi học Lớp 9 chiều Thứ Tư tuần này chuyển sang 18:00–19:30 cùng ngày. Các em chú ý đi học đúng giờ nhé!',
  },
  {
    id: 'general',
    name: 'Thông báo chung',
    description: 'Gửi tin cho lớp hoặc học sinh',
    chipBg: '#EFE9ED',
    iconColor: '#6B5560',
    type: 'GENERAL' as ComposeType,
    defaultClasses: ['Lớp 8', 'Lớp 9'],
    defaultTitle: 'Thông báo nghỉ buổi Thứ Hai 16/11',
    defaultBody:
      'Lớp 8 và Lớp 9 nghỉ buổi học Thứ Hai, 16/11 vì chị Vân đi dự hội thảo. Lịch học bù chị sẽ báo sau. Các em nhớ làm bài tập đầy đủ nhé!',
  },
] as const;

// Danh sách các chip lớp học từ Lớp 1 đến Lớp 12 trong ngăn kéo "Soạn thông báo"
const CLASS_CHIP_OPTIONS = [
  'Tất cả lớp',
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

// Nội dung mặc định trong ngăn kéo "Soạn thông báo" (hiển thị bộ đếm 112/500)
const DEFAULT_COMPOSE_TITLE = 'Thông báo nghỉ buổi Thứ Hai 16/11';
const DEFAULT_COMPOSE_BODY =
  'Lớp 8 và Lớp 9 nghỉ buổi học Thứ Hai, 16/11 vì chị Vân đi dự hội thảo. Lịch học bù chị sẽ báo sau. Các em nhớ làm bài tập đầy đủ nhé!';

// Sĩ số mẫu của từng lớp để tính tổng số học sinh nhận thông báo ("Lớp 8" + "Lớp 9" = 9 học sinh)
const CLASS_STUDENT_COUNTS: Record<string, number> = {
  'Lớp 1': 2,
  'Lớp 2': 2,
  'Lớp 3': 2,
  'Lớp 4': 3,
  'Lớp 5': 3,
  'Lớp 6': 4,
  'Lớp 7': 4,
  'Lớp 8': 4,
  'Lớp 9': 5,
  'Lớp 10': 9,
  'Lớp 11': 2,
  'Lớp 12': 2,
};

export const NotificationsPage: React.FC = () => {
  const { activeRole } = useAuthStore();
  const isStudentView = activeRole === 'student';

  // ==================== TRẠNG THÁI CỦA VAI TRÒ HỌC SINH ====================
  const [studentNotifs, setStudentNotifs] = useState<StudentNotificationItem[]>(
    INITIAL_STUDENT_NOTIFICATIONS
  );
  const [studentFilter, setStudentFilter] = useState<StudentNotifFilter>('ALL');
  // Mặc định dòng #2 ("Nhắc học phí tháng 11") được chọn
  const [selectedStudentNotifId, setSelectedStudentNotifId] = useState<number>(2);
  const [mobileShowStudentDetail, setMobileShowStudentDetail] = useState<boolean>(false);

  // ==================== TRẠNG THÁI CỦA VAI TRÒ ADMIN ====================
  const [historyRows, setHistoryRows] = useState<NotificationHistoryRow[]>(INITIAL_HISTORY_ROWS);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scheduleReminderOn, setScheduleReminderOn] = useState<boolean>(true);
  const [tuitionReminderOn, setTuitionReminderOn] = useState<boolean>(true);

  // ==================== TRẠNG THÁI NGĂN KÉO "SOẠN THÔNG BÁO" (ADMIN) ====================
  const [isComposeDrawerOpen, setIsComposeDrawerOpen] = useState<boolean>(false);
  const [composeType, setComposeType] = useState<ComposeType>('GENERAL');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['Lớp 8', 'Lớp 9']);
  const [composeTitle, setComposeTitle] = useState<string>(DEFAULT_COMPOSE_TITLE);
  const [composeBody, setComposeBody] = useState<string>(DEFAULT_COMPOSE_BODY);

  // Mở ngăn kéo "Soạn thông báo" với dữ liệu chuẩn theo thiết kế
  const handleOpenComposeDefault = () => {
    setComposeType('GENERAL');
    setSelectedClasses(['Lớp 8', 'Lớp 9']);
    setComposeTitle(DEFAULT_COMPOSE_TITLE);
    setComposeBody(DEFAULT_COMPOSE_BODY);
    setIsComposeDrawerOpen(true);
  };

  // Mở ngăn kéo "Soạn thông báo" từ thẻ "Soạn nhanh theo mẫu"
  const handleOpenQuickTemplate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    setComposeType(tpl.type);
    setSelectedClasses([...tpl.defaultClasses]);
    setComposeTitle(tpl.defaultTitle);
    setComposeBody(tpl.defaultBody);
    setIsComposeDrawerOpen(true);
  };

  // Chọn / bỏ chọn chip lớp trong mục "Gửi tới"
  const handleToggleClassChip = (cls: string) => {
    if (cls === 'Tất cả lớp') {
      const allClasses = CLASS_CHIP_OPTIONS.filter((c) => c !== 'Tất cả lớp');
      if (selectedClasses.length === allClasses.length) {
        setSelectedClasses(['Lớp 8', 'Lớp 9']);
      } else {
        setSelectedClasses(allClasses);
      }
      return;
    }

    setSelectedClasses((prev) => {
      if (prev.includes(cls)) {
        const next = prev.filter((item) => item !== cls);
        return next.length > 0 ? next : [cls];
      }
      return [...prev, cls];
    });
  };

  // Tính số học sinh nhận thông báo (mặc định Lớp 8 + Lớp 9 = 9 học sinh)
  const recipientStudentCount = selectedClasses.reduce(
    (sum, cls) => sum + (CLASS_STUDENT_COUNTS[cls] || 4),
    0
  );

  // Bộ đếm ký tự của ô Nội dung (hiển thị 112/500 khi ở văn bản mặc định)
  const bodyCharCount =
    composeBody === DEFAULT_COMPOSE_BODY ? 112 : composeBody.length;

  // Xử lý gửi thông báo mới từ ngăn kéo
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim()) return;

    const categoryMap: Record<ComposeType, NotificationCategory> = {
      GENERAL: 'GENERAL',
      SCHEDULE: 'SCHEDULE',
      TUITION: 'TUITION',
    };

    const newRow: NotificationHistoryRow = {
      id: Date.now(),
      category: categoryMap[composeType],
      title: composeTitle.trim(),
      recipients: `${selectedClasses.join(', ')} · ${recipientStudentCount} học sinh`,
      source: 'MANUAL',
      timeText: 'Vừa xong',
      readCount: 0,
      totalCount: recipientStudentCount,
    };

    setHistoryRows((prev) => [newRow, ...prev.slice(0, 7)]);
    setIsComposeDrawerOpen(false);
  };

  // Render chip biểu tượng bên trái mỗi dòng thông báo theo đúng quy ước màu sắc
  const renderCategoryIconChip = (
    category: NotificationCategory,
    sizeClass: 'w-[44px] h-[44px]' | 'w-[40px] h-[40px]' = 'w-[44px] h-[44px]'
  ) => {
    switch (category) {
      case 'SCHEDULE':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0`}
          >
            <Calendar className="w-5 h-5 text-[#1F4E79]" strokeWidth={1.75} />
          </div>
        );
      case 'TUITION':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center flex-shrink-0`}
          >
            <Wallet className="w-5 h-5 text-[#A61E4D]" strokeWidth={1.75} />
          </div>
        );
      case 'DOCUMENT':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0`}
          >
            <FileText className="w-5 h-5 text-[#1F4E79]" strokeWidth={1.75} />
          </div>
        );
      case 'GENERAL':
        return (
          <div
            className={`${sizeClass} rounded-[12px] bg-[#EFE9ED] text-[#6B5560] flex items-center justify-center flex-shrink-0`}
          >
            <Megaphone className="w-5 h-5 text-[#6B5560]" strokeWidth={1.75} />
          </div>
        );
    }
  };

  // ============================================================================
  // GIAO DIỆN VAI TRÒ HỌC SINH (1440×976: Header 88px + Hàng 2 cao 800px 5/7 cột)
  // ============================================================================
  if (isStudentView) {
    const unreadCount = studentNotifs.filter((n) => n.unread).length;
    const selectedNotif =
      studentNotifs.find((n) => n.id === selectedStudentNotifId) || studentNotifs[1];

    // Đánh dấu tất cả là đã đọc
    const handleMarkAllRead = () => {
      setStudentNotifs((prev) => prev.map((item) => ({ ...item, unread: false })));
    };

    // Đảo trạng thái chưa đọc / đã đọc của thông báo đang chọn
    const handleToggleSelectedUnread = () => {
      setStudentNotifs((prev) =>
        prev.map((item) =>
          item.id === selectedNotif.id ? { ...item, unread: !item.unread } : item
        )
      );
    };

    return (
      <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px] font-nunito text-[#3B2A35]">
        {/* Khung chính 1200px trên máy tính bàn, co giãn theo khung nhìn trên di động/máy tính bảng */}
        <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-[24px] lg:justify-between box-border select-none">
          {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
          <header className="min-h-[72px] lg:h-[88px] w-full lg:w-[1136px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            {/* Bên trái: Tiêu đề "Thông báo" + Thẻ đếm + Dòng ghi chú viết tay */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                  Thông báo
                </h1>
                {/* Thẻ "3 chưa đọc" */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] text-[13px] font-bold tracking-wide">
                  <Bell className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0" strokeWidth={1.75} />
                  <span>{unreadCount} chưa đọc</span>
                </span>
              </div>

              {/* Dòng ghi chú viết tay đặc trưng kèm gạch chân lượn sóng và 2 hình dán */}
              <div className="flex items-center mt-1.5">
                <div className="inline-block transform -rotate-1 origin-left">
                  <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                    Xem thông báo mỗi ngày để không lỡ buổi học nhé!
                  </span>
                </div>

                {/* Đúng 2 hình dán vector phẳng pastel (ẩn trên di động) */}
                <div className="hidden md:flex items-center gap-2 ml-[24px] mr-[24px]">
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

            {/* Bên phải: Nút viền "Đánh dấu đã đọc tất cả" */}
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="w-full md:w-auto h-[44px] px-4 rounded-[12px] border border-[#2F6FA8] bg-white hover:bg-[#E9F3FF] text-[#2F6FA8] font-nunito text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer flex-shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-[#2F6FA8] flex-shrink-0" strokeWidth={1.75} />
              <span>Đánh dấu đã đọc tất cả</span>
            </button>
          </header>

          {/* ==================== HÀNG 2: LƯỚI 12 CỘT (40/60 máy tính bảng & máy tính bàn, danh sách - chi tiết trên di động) ==================== */}
          <div className="w-full lg:w-[1136px] lg:h-[800px] grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-[24px] flex-shrink-0">
            {/* ==================== CỘT TRÁI (5 CỘT): THẺ DANH SÁCH THÔNG BÁO ==================== */}
            <section
              className={`${
                mobileShowStudentDetail ? 'hidden md:flex' : 'flex'
              } md:col-span-5 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex-col justify-between overflow-hidden box-border`}
            >
              {/* Thanh thẻ lọc trên cùng */}
              <div className="min-h-[56px] px-3 lg:px-4 py-2 lg:py-0 border-b border-[#F3D9E3] flex items-center lg:justify-between gap-1.5 overflow-x-auto flex-shrink-0 box-border">
                {(
                  [
                    { key: 'ALL', label: 'Tất cả 8' },
                    { key: 'UNREAD', label: `Chưa đọc ${unreadCount}` },
                    { key: 'SCHEDULE', label: 'Lịch học 2' },
                    { key: 'TUITION', label: 'Học phí 2' },
                    { key: 'OTHER', label: 'Khác 4' },
                  ] as const
                ).map((chip) => {
                  const isSelected = studentFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => setStudentFilter(chip.key)}
                      className={`h-[32px] px-2.5 rounded-[10px] font-nunito text-[12px] font-bold flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* 8 hàng có chiều cao bằng nhau lấp đầy thẻ (744px / 8 = 93px), ngăn cách bởi đường kẻ 1px #F3D9E3 */}
              <div className="flex-1 flex flex-col divide-y divide-[#F3D9E3] overflow-hidden">
                {studentNotifs.map((item) => {
                  const isSelected = item.id === selectedNotif.id;
                  const isUnread = item.unread;

                  // Thanh viền trái 4px: hàng đang chọn dùng #2F6FA8, hàng chưa đọc dùng #F8A5C2
                  const leftBorderClass = isSelected
                    ? 'border-l-4 border-l-[#2F6FA8] bg-[#E9F3FF]'
                    : isUnread
                      ? 'border-l-4 border-l-[#F8A5C2] bg-white hover:bg-[#FFF6F9]'
                      : 'border-l-4 border-l-transparent bg-white hover:bg-[#FFF6F9]';

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedStudentNotifId(item.id);
                        setMobileShowStudentDetail(true);
                      }}
                      className={`flex-1 min-h-[76px] py-3 lg:py-0 px-4 flex items-center justify-between gap-3 transition-colors cursor-pointer box-border ${leftBorderClass}`}
                    >
                      {/* Bên trái: Ô biểu tượng 40px + Tiêu đề 14px (đậm nếu chưa đọc, thường nếu đã đọc) + Dòng xem trước 13px #6B5560 */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {renderCategoryIconChip(item.category, 'w-[40px] h-[40px]')}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <span
                            className={`font-nunito text-[14px] text-[#3B2A35] leading-snug truncate ${
                              isUnread ? 'font-bold' : 'font-normal'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="font-nunito text-[13px] font-medium text-[#6B5560] leading-snug mt-0.5 truncate">
                            {item.preview}
                          </span>
                        </div>
                      </div>

                      {/* Bên phải: Thời gian 12px #6B5560 + Chấm tròn 10px #A61E4D nếu chưa đọc */}
                      <div className="flex flex-col items-end justify-center gap-1.5 flex-shrink-0">
                        <span className="font-nunito text-[12px] font-semibold text-[#6B5560] whitespace-nowrap">
                          {item.timeText}
                        </span>
                        {isUnread ? (
                          <span
                            className="w-[10px] h-[10px] rounded-full bg-[#A61E4D] block"
                            aria-label="Chưa đọc"
                          />
                        ) : (
                          <span className="w-[10px] h-[10px] block opacity-0" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ==================== CỘT PHẢI (7 CỘT): THẺ CHI TIẾT THÔNG BÁO ĐANG CHỌN ==================== */}
            <section
              className={`${
                mobileShowStudentDetail ? 'flex' : 'hidden md:flex'
              } md:col-span-7 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] p-4 lg:p-[32px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex-col justify-between box-border`}
            >
              {/* Nút quay lại danh sách trên di động */}
              <button
                type="button"
                onClick={() => setMobileShowStudentDetail(false)}
                className="md:hidden h-[44px] px-3.5 mb-3 rounded-[12px] bg-[#FFF6F9] border border-[#F3D9E3] text-[#1F4E79] font-bold text-[14px] flex items-center gap-2 w-fit cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span>Danh sách thông báo</span>
              </button>
              {/* Khối nội dung phía trên */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Hàng trên cùng: Thẻ loại thông báo + Nhãn "Tự động" / "Thủ công" bên trái; nút "Đánh dấu chưa đọc" bên phải */}
                <div className="flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Thẻ loại thông báo: Học phí (#FFE0EB / #A61E4D, biểu tượng ví), Lịch học / Bài tập (#DCEBFA / #1F4E79), Thông báo chung (#EFE9ED / #6B5560) */}
                    {selectedNotif.category === 'TUITION' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[13px] font-bold leading-none">
                        <Wallet
                          className="w-4 h-4 text-[#A61E4D] flex-shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>{selectedNotif.typeChipLabel}</span>
                      </span>
                    )}
                    {selectedNotif.category === 'SCHEDULE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold leading-none">
                        <Calendar
                          className="w-4 h-4 text-[#1F4E79] flex-shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>{selectedNotif.typeChipLabel}</span>
                      </span>
                    )}
                    {selectedNotif.category === 'DOCUMENT' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[13px] font-bold leading-none">
                        <FileText
                          className="w-4 h-4 text-[#1F4E79] flex-shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>{selectedNotif.typeChipLabel}</span>
                      </span>
                    )}
                    {selectedNotif.category === 'GENERAL' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#EFE9ED] text-[#6B5560] font-nunito text-[13px] font-bold leading-none">
                        <Megaphone
                          className="w-4 h-4 text-[#6B5560] flex-shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>{selectedNotif.typeChipLabel}</span>
                      </span>
                    )}

                    {/* Thẻ "Tự động" (biểu tượng làm mới, #E9F3FF / #1F4E79) hoặc "Thủ công" */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] font-nunito text-[13px] font-bold leading-none">
                      {selectedNotif.source === 'AUTO' ? (
                        <>
                          <RefreshCw
                            className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0"
                            strokeWidth={1.75}
                          />
                          <span>Tự động</span>
                        </>
                      ) : (
                        <>
                          <Pencil
                            className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0"
                            strokeWidth={1.75}
                          />
                          <span>Thủ công</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Nút chữ "Đánh dấu chưa đọc" (#2F6FA8) */}
                  <button
                    type="button"
                    onClick={handleToggleSelectedUnread}
                    className="font-nunito text-[13px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                  >
                    Đánh dấu chưa đọc
                  </button>
                </div>

                {/* Tiêu đề thông báo Playfair Display 28px & thông tin người gửi 13px #6B5560 */}
                <div className="mt-4 flex-shrink-0">
                  <h2 className="font-playfair text-[28px] font-bold text-[#3B2A35] leading-tight">
                    {selectedNotif.title}
                  </h2>
                  <p className="font-nunito text-[13px] font-semibold text-[#6B5560] mt-1.5">
                    {selectedNotif.fullTimeMeta}
                  </p>
                </div>

                {/* Đường kẻ phân cách 1px #F3D9E3 */}
                <div className="h-[1px] w-full bg-[#F3D9E3] my-5 flex-shrink-0" />

                {/* Nội dung thông báo Nunito 16px #3B2A35, line-height 1.6 */}
                <p className="font-nunito text-[16px] font-semibold text-[#3B2A35] leading-[1.6] flex-shrink-0">
                  {selectedNotif.body}
                </p>

                {/* Hộp thông tin liên quan ("Hoá đơn liên quan", nền #FFF6F9, viền 1px #F3D9E3, bo góc 16px, padding 20px, lấp đầy phần dưới của thẻ) */}
                <div className="mt-6 flex-1 rounded-[16px] bg-[#FFF6F9] border border-[#F3D9E3] p-[20px] flex flex-col justify-between box-border min-h-0">
                  <h3 className="font-playfair text-[18px] font-bold text-[#3B2A35] leading-tight flex-shrink-0">
                    {selectedNotif.relatedBoxTitle}
                  </h3>

                  {/* 5 dòng Nhãn – Giá trị ngăn cách bởi đường kẻ 1px #F3D9E3 */}
                  <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] mt-2">
                    {selectedNotif.relatedItems.map((row, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex items-center justify-between gap-4 text-[14px]"
                      >
                        <span className="font-nunito text-[14px] font-semibold text-[#6B5560]">
                          {row.label}
                        </span>

                        {row.isStatusBadge ? (
                          row.statusTone === 'pink' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE0EB] text-[#A61E4D] font-nunito text-[12px] font-bold leading-none">
                              <Clock
                                className="w-3.5 h-3.5 text-[#A61E4D] flex-shrink-0"
                                strokeWidth={1.75}
                              />
                              <span>{row.statusText}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[12px] font-bold leading-none">
                              <Check
                                className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0"
                                strokeWidth={1.75}
                              />
                              <span>{row.statusText}</span>
                            </span>
                          )
                        ) : (
                          <span className="font-nunito text-[14px] font-bold text-[#3B2A35]">
                            {row.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chân thẻ cố định: nút chính "Mở hoá đơn" */}
              <div className="pt-5 flex items-center justify-end flex-shrink-0">
                <button
                  type="button"
                  className="w-full sm:w-auto h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white font-nunito text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                  <span>{selectedNotif.primaryCtaLabel}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GIAO DIỆN VAI TRÒ ADMIN (1440×976: Header 88px + Hàng 2 cao 800px 8/4 cột)
  // ============================================================================
  const isAllClassesSelected =
    selectedClasses.length === CLASS_CHIP_OPTIONS.length - 1;

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] lg:min-h-[976px] font-nunito text-[#3B2A35] relative">
      {/* Khung chính 1200px trên máy tính bàn, co giãn theo khung nhìn trên di động/máy tính bảng */}
      <div className="w-full lg:w-[1200px] lg:h-[976px] p-0 lg:p-8 flex flex-col gap-4 lg:gap-[24px] lg:justify-between box-border select-none">
        {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG ==================== */}
        <header className="min-h-[72px] lg:h-[88px] w-full lg:w-[1136px] flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
          {/* Bên trái: Tiêu đề "Thông báo" + Thẻ đếm + Ghi chú viết tay */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Thông báo
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold tracking-wide">
                24 thông báo đã gửi
              </span>
            </div>

            {/* Dòng ghi chú viết tay đặc trưng kèm gạch chân lượn sóng và 2 hình dán */}
            <div className="flex items-center mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Học sinh thấy thông báo ngay khi chị gửi nhé!
                </span>
              </div>

              {/* Đúng 2 hình dán vector phẳng pastel (ẩn trên di động) */}
              <div className="hidden md:flex items-center gap-2 ml-[24px] mr-[24px]">
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

          {/* Bên phải: Nút chính "Soạn thông báo" */}
          <button
            type="button"
            onClick={handleOpenComposeDefault}
            className="w-full md:w-auto h-[44px] px-5 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white font-nunito text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer flex-shrink-0"
          >
            <Plus className="w-5 h-5 text-white flex-shrink-0" strokeWidth={1.75} />
            <span>Soạn thông báo</span>
          </button>
        </header>

        {/* ==================== HÀNG 2: LƯỚI 12 CỘT (8/4 trên máy tính bàn, xếp chồng dưới lg) ==================== */}
        <div className="w-full lg:w-[1136px] lg:h-[800px] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-[24px] flex-shrink-0">
          {/* ==================== CỘT TRÁI (8 CỘT): THẺ "LỊCH SỬ THÔNG BÁO" ==================== */}
          <section className="lg:col-span-8 lg:h-[800px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between overflow-hidden box-border">
            {/* Thanh tiêu đề */}
            <div className="min-h-[64px] px-4 lg:px-5 py-3 lg:py-0 border-b border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0 box-border">
              <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35] leading-tight">
                Lịch sử thông báo
              </h2>

              {/* Thanh điều khiển phân đoạn */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto"
                role="tablist"
                aria-label="Lọc lịch sử thông báo"
              >
                {(
                  [
                    { key: 'ALL', label: 'Tất cả', count: 8 },
                    { key: 'MANUAL', label: 'Thủ công', count: 2 },
                    { key: 'AUTO', label: 'Tự động', count: 6 },
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
                      className={`h-[36px] px-3 rounded-[10px] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#2F6FA8] text-white'
                          : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span>{tab.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Danh sách 8 hàng */}
            <div className="lg:h-[672px] flex flex-col divide-y divide-[#F3D9E3] overflow-hidden flex-shrink-0">
              {historyRows.map((row) => {
                const progressPct = Math.round((row.readCount / row.totalCount) * 100);

                return (
                  <div
                    key={row.id}
                    className="min-h-[84px] lg:h-[84px] px-4 lg:px-5 py-3 lg:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 lg:gap-3 bg-white hover:bg-[#FFF6F9] transition-colors box-border flex-shrink-0"
                  >
                    {/* Bên trái: Thẻ biểu tượng 44px + Tiêu đề + Dòng người nhận */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {renderCategoryIconChip(row.category, 'w-[44px] h-[44px]')}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="font-nunito text-[15px] font-bold text-[#3B2A35] leading-snug truncate">
                          {row.title}
                        </span>
                        <span className="font-nunito text-[13px] font-semibold text-[#6B5560] leading-snug mt-0.5 truncate">
                          {row.recipients}
                        </span>
                      </div>
                    </div>

                    {/* Bên phải: Nhãn loại + Thời gian + Tiến độ + Huy hiệu */}
                    <div className="flex flex-wrap items-center gap-2.5 lg:gap-3.5 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] font-nunito text-[12px] font-bold leading-none whitespace-nowrap">
                        {row.source === 'AUTO' ? (
                          <>
                            <RefreshCw
                              className="w-3 h-3 text-[#1F4E79] flex-shrink-0"
                              strokeWidth={1.75}
                            />
                            <span>Tự động</span>
                          </>
                        ) : (
                          <>
                            <Pencil
                              className="w-3 h-3 text-[#1F4E79] flex-shrink-0"
                              strokeWidth={1.75}
                            />
                            <span>Thủ công</span>
                          </>
                        )}
                      </span>

                      <span className="lg:w-[92px] lg:text-right font-nunito text-[13px] font-semibold text-[#6B5560] whitespace-nowrap">
                        {row.timeText}
                      </span>

                      <div className="w-[86px] flex flex-col items-end justify-center">
                        <span className="font-nunito text-[12px] font-bold text-[#3B2A35] leading-none whitespace-nowrap">
                          Đã đọc {row.readCount}/{row.totalCount}
                        </span>
                        <div className="w-full h-[6px] rounded-full bg-[#E9F3FF] overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full bg-[#8EC5FC]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCEBFA] text-[#1F4E79] font-nunito text-[12px] font-bold leading-none whitespace-nowrap">
                        <Check
                          className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>Đã gửi</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chân thẻ cố định */}
            <div className="min-h-[56px] lg:h-[64px] px-4 lg:px-5 py-3 lg:py-0 border-t border-[#F3D9E3] flex flex-wrap items-center justify-between gap-2 flex-shrink-0 bg-white box-border">
              <span className="font-nunito text-[13px] font-semibold text-[#6B5560]">
                Hiển thị 1–8 trên 24 thông báo
              </span>

              <div className="flex items-center gap-1.5 font-nunito text-[13px] font-bold">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#E9F3FF] hover:text-[#1F4E79] transition-colors cursor-pointer"
                  aria-label="Trang trước"
                >
                  ‹
                </button>
                {[1, 2, 3].map((page) => {
                  const isCurrent = currentPage === page;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#2F6FA8] text-white'
                          : 'text-[#6B5560] hover:bg-[#E9F3FF] hover:text-[#1F4E79]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B5560] hover:bg-[#E9F3FF] hover:text-[#1F4E79] transition-colors cursor-pointer"
                  aria-label="Trang sau"
                >
                  ›
                </button>
              </div>
            </div>
          </section>

          {/* ==================== CỘT PHẢI (4 CỘT trên máy tính bàn): 2 THẺ XẾP CHỒNG ==================== */}
          <div className="lg:col-span-4 lg:h-[800px] flex flex-col justify-between gap-4 lg:gap-[24px] flex-shrink-0">
            {/* ==================== THẺ TRÊN: "NHẮC TỰ ĐỘNG" ==================== */}
            <section className="lg:h-[440px] bg-white border border-[#F3D9E3] rounded-[16px] p-4 lg:p-5 shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between box-border flex-shrink-0">
              <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35] leading-tight">
                  Nhắc tự động
                </h2>
              </div>

              <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] mt-3 min-h-0">
                {/* Khối 1: "Nhắc lịch học" */}
                <div className="flex-1 pb-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-[44px] h-[44px] rounded-[12px] bg-[#DCEBFA] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[#1F4E79]" strokeWidth={1.75} />
                      </div>
                      <span className="font-nunito text-[15px] font-bold text-[#3B2A35]">
                        Nhắc lịch học
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={scheduleReminderOn}
                      onClick={() => setScheduleReminderOn(!scheduleReminderOn)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-nunito text-[13px] font-bold text-[#3B2A35]">
                        {scheduleReminderOn ? 'Bật' : 'Tắt'}
                      </span>
                      <span
                        className={`w-[40px] h-[22px] rounded-full p-0.5 flex items-center transition-colors ${
                          scheduleReminderOn
                            ? 'bg-[#2F6FA8] justify-end'
                            : 'bg-[#EFE9ED] justify-start'
                        }`}
                      >
                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                      </span>
                    </button>
                  </div>

                  <p className="font-nunito text-[13px] font-medium text-[#6B5560] leading-snug">
                    Gửi lúc 08:00 sáng của ngày có buổi học, tới học sinh của lớp đó.
                  </p>

                  <div className="space-y-1.5">
                    <div className="w-full rounded-[12px] bg-[#E9F3FF] px-3 py-2 flex items-start gap-2 box-border">
                      <Calendar
                        className="w-4 h-4 text-[#1F4E79] flex-shrink-0 mt-0.5"
                        strokeWidth={1.75}
                      />
                      <span className="font-nunito text-[12px] font-bold text-[#1F4E79] leading-snug">
                        Lần gửi tiếp theo: Thứ Bảy, 14/11/2026 · 08:00 · Lớp 10, Lớp 12
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleOpenComposeDefault}
                        className="font-nunito text-[13px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                      >
                        Sửa giờ gửi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Khối 2: "Nhắc học phí" */}
                <div className="flex-1 pt-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-[44px] h-[44px] rounded-[12px] bg-[#FFE0EB] text-[#A61E4D] flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-5 h-5 text-[#A61E4D]" strokeWidth={1.75} />
                      </div>
                      <span className="font-nunito text-[15px] font-bold text-[#3B2A35]">
                        Nhắc học phí
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={tuitionReminderOn}
                      onClick={() => setTuitionReminderOn(!tuitionReminderOn)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-nunito text-[13px] font-bold text-[#3B2A35]">
                        {tuitionReminderOn ? 'Bật' : 'Tắt'}
                      </span>
                      <span
                        className={`w-[40px] h-[22px] rounded-full p-0.5 flex items-center transition-colors ${
                          tuitionReminderOn
                            ? 'bg-[#2F6FA8] justify-end'
                            : 'bg-[#EFE9ED] justify-start'
                        }`}
                      >
                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                      </span>
                    </button>
                  </div>

                  <p className="font-nunito text-[13px] font-medium text-[#6B5560] leading-snug">
                    Gửi ngày 5 hàng tháng và nhắc lại sau 7 ngày nếu hoá đơn chưa đóng.
                  </p>

                  <div className="space-y-1.5">
                    <div className="w-full rounded-[12px] bg-[#E9F3FF] px-3 py-2 flex items-start gap-2 box-border">
                      <Calendar
                        className="w-4 h-4 text-[#1F4E79] flex-shrink-0 mt-0.5"
                        strokeWidth={1.75}
                      />
                      <span className="font-nunito text-[12px] font-bold text-[#1F4E79] leading-snug">
                        Lần gửi tiếp theo: Thứ Năm, 19/11/2026 · 08:00 · 7 hoá đơn chưa đóng
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleOpenComposeDefault}
                        className="font-nunito text-[13px] font-bold text-[#2F6FA8] hover:underline cursor-pointer"
                      >
                        Sửa giờ gửi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== THẺ DƯỚI (336px): "SOẠN NHANH THEO MẪU" ==================== */}
            <section className="h-[336px] bg-white border border-[#F3D9E3] rounded-[16px] shadow-[0_1px_2px_rgba(59,42,53,0.06)] flex flex-col justify-between overflow-hidden box-border flex-shrink-0">
              <div className="h-[60px] px-5 border-b border-[#F3D9E3] flex items-center justify-between flex-shrink-0 box-border">
                <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35] leading-tight">
                  Soạn nhanh theo mẫu
                </h2>
              </div>

              <div className="flex-1 flex flex-col divide-y divide-[#F3D9E3]">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleOpenQuickTemplate(tpl)}
                    className="flex-1 px-5 flex items-center justify-between gap-3 bg-white hover:bg-[#FFF6F9] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        style={{ backgroundColor: tpl.chipBg, color: tpl.iconColor }}
                        className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                      >
                        {tpl.id === 'class-off' && (
                          <CalendarX className="w-5 h-5" strokeWidth={1.75} />
                        )}
                        {tpl.id === 'reschedule' && (
                          <CalendarClock className="w-5 h-5" strokeWidth={1.75} />
                        )}
                        {tpl.id === 'general' && (
                          <Megaphone className="w-5 h-5" strokeWidth={1.75} />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-nunito text-[15px] font-bold text-[#3B2A35] leading-snug truncate">
                          {tpl.name}
                        </span>
                        <span className="font-nunito text-[13px] font-semibold text-[#6B5560] leading-snug mt-0.5 truncate">
                          {tpl.description}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className="w-4 h-4 text-[#3B2A35] flex-shrink-0"
                      strokeWidth={1.75}
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ==================== NGĂN KÉO BÊN PHẢI: "SOẠN THÔNG BÁO" ==================== */}
      {isComposeDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center md:justify-end bg-[#3B2A35]/35"
          onClick={() => setIsComposeDrawerOpen(false)}
        >
          <aside
            className="w-full md:w-[min(520px,90vw)] lg:w-[520px] max-h-[90dvh] md:max-h-none md:h-full bg-white rounded-t-[20px] md:rounded-t-none md:rounded-l-[16px] shadow-[-16px_0_40px_rgba(59,42,53,0.16)] flex flex-col justify-between box-border select-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-drawer-title"
          >
            {/* Thanh kéo nhỏ trên di động */}
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-10 h-1 rounded-full bg-[#E5D3DC]" />
            </div>
            <div className="px-5 md:px-7 pt-4 md:pt-7 pb-4 md:pb-5 border-b border-[#F3D9E3] flex items-start justify-between gap-4 flex-shrink-0">
              <div className="flex flex-col">
                <h2
                  id="compose-drawer-title"
                  className="font-playfair text-[22px] font-bold text-[#3B2A35] leading-tight"
                >
                  Soạn thông báo
                </h2>
                <p className="font-nunito text-[14px] font-medium text-[#6B5560] mt-1">
                  Học sinh sẽ thấy ngay trên trang Thông báo
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsComposeDrawerOpen(false)}
                aria-label="Đóng ngăn kéo Soạn thông báo"
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors cursor-pointer flex-shrink-0 -mr-1 -mt-1"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <form
              id="compose-notification-form"
              onSubmit={handleSendNotification}
              className="flex-1 px-7 py-5 overflow-y-auto space-y-[20px]"
            >
              <div>
                <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2">
                  Loại thông báo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'GENERAL', label: 'Thông báo chung' },
                      { key: 'SCHEDULE', label: 'Nhắc lịch học' },
                      { key: 'TUITION', label: 'Nhắc học phí' },
                    ] as const
                  ).map((item) => {
                    const isSelected = composeType === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setComposeType(item.key)}
                        className={`h-[44px] px-3 rounded-[12px] font-nunito text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2">
                  Gửi tới
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_CHIP_OPTIONS.map((cls) => {
                    const isSelected =
                      cls === 'Tất cả lớp'
                        ? isAllClassesSelected
                        : selectedClasses.includes(cls);

                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleToggleClassChip(cls)}
                        className={`h-[36px] px-3 rounded-[10px] font-nunito text-[13px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2F6FA8] text-white'
                            : 'bg-[#E9F3FF] text-[#1F4E79] hover:bg-[#DCEBFA]'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
                        )}
                        <span>{cls}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-2.5 text-[#1F4E79]">
                  <Users className="w-4 h-4 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-nunito text-[13px] font-bold text-[#1F4E79]">
                    Sẽ gửi cho {recipientStudentCount} học sinh
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="compose-title-input"
                  className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                >
                  Tiêu đề
                </label>
                <input
                  id="compose-title-input"
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  className="w-full h-[48px] px-4 rounded-[12px] border-2 border-[#2F6FA8] bg-white font-nunito text-[15px] font-bold text-[#3B2A35] focus:outline-none box-border"
                />
              </div>

              <div>
                <label
                  htmlFor="compose-body-textarea"
                  className="block font-nunito text-[14px] font-bold text-[#3B2A35] mb-2"
                >
                  Nội dung
                </label>
                <div className="relative">
                  <textarea
                    id="compose-body-textarea"
                    rows={6}
                    maxLength={500}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full p-4 pb-8 rounded-[12px] border border-[#9C6B84] bg-white font-nunito text-[15px] font-semibold text-[#3B2A35] leading-relaxed resize-none focus:outline-none focus:border-2 focus:border-[#2F6FA8] box-border"
                  />
                  <span className="absolute bottom-3 right-4 font-nunito text-[12px] font-semibold text-[#6B5560] pointer-events-none">
                    {bodyCharCount}/500
                  </span>
                </div>
              </div>

              <div className="rounded-[12px] bg-[#E9F3FF] p-3.5 flex items-start gap-2.5">
                <Info
                  className="w-4 h-4 text-[#1F4E79] flex-shrink-0 mt-0.5"
                  strokeWidth={1.75}
                />
                <span className="font-nunito text-[13px] font-semibold text-[#1F4E79] leading-snug">
                  Thông báo được gửi trên web. Gửi qua email, Zalo hoặc SMS sẽ có ở giai đoạn sau.
                </span>
              </div>
            </form>

            <div className="px-7 py-4 border-t border-[#F3D9E3] bg-white flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsComposeDrawerOpen(false)}
                className="h-[48px] px-4 rounded-[12px] font-nunito text-[14px] font-bold text-[#6B5560] hover:text-[#3B2A35] hover:bg-[#FFF6F9] transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                form="compose-notification-form"
                className="h-[48px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white font-nunito text-[14px] font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 text-white flex-shrink-0" strokeWidth={1.75} />
                <span>Gửi thông báo</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
