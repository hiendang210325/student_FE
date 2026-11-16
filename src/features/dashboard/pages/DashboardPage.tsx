import React, { useState } from 'react';
import {
  Users,
  Clock,
  FileText,
  DollarSign,
  Check,
  Bell,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface LeaveRequest {
  id: number;
  studentName: string;
  className: string;
  leaveDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    studentName: 'Nguyễn Minh Anh',
    className: 'Văn 9A',
    leaveDate: '10/11',
    reason: 'Ốm',
    status: 'PENDING',
  },
  {
    id: 2,
    studentName: 'Trần Gia Bảo',
    className: 'Văn 8B',
    leaveDate: '11/11',
    reason: 'Việc gia đình',
    status: 'PENDING',
  },
  {
    id: 3,
    studentName: 'Lê Khánh Linh',
    className: 'Văn 7C',
    leaveDate: '12/11',
    reason: 'Đi khám',
    status: 'PENDING',
  },
];

export const DashboardPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (id: number, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'APPROVED' } : req))
    );
    showNotice(`Đã duyệt đơn xin nghỉ của học sinh ${name}`);
  };

  const handleReject = (id: number, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'REJECTED' } : req))
    );
    showNotice(`Đã từ chối đơn của học sinh ${name}`);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="w-full lg:min-h-[976px] p-0 lg:p-8 flex flex-col justify-between gap-4 md:gap-5 lg:gap-6 overflow-x-hidden box-border max-w-[1440px] mx-auto select-none bg-brand-page text-brand-text">
      {/* Thông báo nổi */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-text text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG (88px) ==================== */}
      <header className="min-h-[88px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative flex-shrink-0">
        {/* Bên trái: Lời chào + Thẻ ngày tháng + Ghi chú lề */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif-title text-[24px] sm:text-[28px] font-bold text-brand-text leading-tight">
              Chào buổi sáng, chị Vân
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold bg-brand-blueChip text-brand-blueText tracking-wide shadow-2xs">
              Thứ Hai, 09/11/2026
            </span>
          </div>

          {/* Ghi chú viết tay đặc trưng của giáo viên kèm đường gạch chân lượn sóng */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
            <div className="inline-block transform -rotate-1 origin-left">
              <span className="font-serif-title italic text-[14px] sm:text-[15px] font-semibold text-brand-pinkText squiggle-underline-note">
                “Hôm nay có 5 buổi học, nhớ điểm danh nhé!”
              </span>
            </div>

            {/* NHÃN DÁN: Đúng 2 hình dán vector phẳng pastel đặt tại đây (ẩn dưới md) */}
            <div className="hidden md:flex items-center gap-2 pl-1 sm:pl-3">
              {/* Hình dán 1: Ngôi sao hồng pastel */}
              <svg
                className="w-6 h-6 text-brand-pinkAccent animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
              </svg>
              {/* Hình dán 2: Ngòi bút xanh pastel */}
              <svg
                className="w-6 h-6 text-brand-blueAction"
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

      {/* ==================== HÀNG 2: BỐN Ô THỐNG KÊ ĐỀU NHAU (2x2 trên di động & md, 4 cột trên lg) ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6 flex-shrink-0">
        {/* Thống kê 1: 3 cột, ô biểu tượng #DCEBFA với biểu tượng #1F4E79 */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-3.5 md:p-5 shadow-card flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
              <Users className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif-title text-[24px] md:text-[30px] font-bold text-brand-text leading-none">
                  42
                </span>
                <span className="text-[13px] md:text-[14px] font-bold text-brand-subtext leading-none">
                  Học sinh
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1 truncate">trong 5 lớp</span>
            </div>
          </div>
        </div>

        {/* Thống kê 2: 3 cột, ô biểu tượng #FFE0EB với biểu tượng #A61E4D */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-3.5 md:p-5 shadow-card flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-pinkChip flex items-center justify-center text-brand-pinkText flex-shrink-0">
              <Clock className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif-title text-[24px] md:text-[30px] font-bold text-brand-text leading-none">
                  5
                </span>
                <span className="text-[13px] md:text-[14px] font-bold text-brand-subtext leading-none">
                  Buổi học hôm nay
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1 truncate">
                2 đã điểm danh
              </span>
            </div>
          </div>
        </div>

        {/* Thống kê 3: 3 cột, ô biểu tượng #DCEBFA với biểu tượng #1F4E79 */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-3.5 md:p-5 shadow-card flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
              <FileText className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif-title text-[24px] md:text-[30px] font-bold text-brand-text leading-none">
                  3
                </span>
                <span className="text-[13px] md:text-[14px] font-bold text-brand-subtext leading-none">
                  Đơn chờ duyệt
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1 truncate">cần xử lý</span>
            </div>
          </div>
        </div>

        {/* Thống kê 4: 3 cột, ô biểu tượng #FFE0EB với biểu tượng #A61E4D */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-3.5 md:p-5 shadow-card flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-pinkChip flex items-center justify-center text-brand-pinkText flex-shrink-0">
              <DollarSign className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif-title text-[22px] md:text-[28px] font-bold text-brand-text leading-none">
                  73,8%
                </span>
                <span className="text-[13px] md:text-[14px] font-bold text-brand-subtext leading-none">
                  Học phí
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1 truncate">
                7 hoá đơn chưa đóng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== HÀNG 3: HAI THẺ NỘI DUNG (7 cột & 5 cột) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-shrink-0">
        {/* THẺ 1 (7 cột): "Lịch học hôm nay" */}
        <section className="lg:col-span-7 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          {/* Tiêu đề thẻ */}
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
                Lịch học hôm nay
              </h2>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-brand-blueSoft text-brand-blueText">
                5 lớp
              </span>
            </div>
            <span className="text-[13px] font-semibold text-brand-subtext">09/11/2026</span>
          </div>

          {/* 5 hàng đều nhau */}
          <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] py-0.5">
            {/* Hàng 1 */}
            <div className="flex flex-wrap items-center justify-between py-2 px-1 gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-[#E9F3FF] text-[#1F4E79]">
                  15:30–17:00
                </span>
                <span className="text-[14px] font-bold text-brand-text">Văn 7C</span>
                <span className="text-[13px] text-brand-subtext">· Cô Hương · 12 học sinh</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-brand-blueChip text-brand-blueText">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Đã điểm danh 12/12</span>
              </span>
            </div>

            {/* Hàng 2 */}
            <div className="flex flex-wrap items-center justify-between py-2 px-1 gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-[#E9F3FF] text-[#1F4E79]">
                  17:00–18:30
                </span>
                <span className="text-[14px] font-bold text-brand-text">Văn 8B</span>
                <span className="text-[13px] text-brand-subtext">· Cô Lan · 15 học sinh</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-brand-blueChip text-brand-blueText">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Đã điểm danh 14/15</span>
              </span>
            </div>

            {/* Hàng 3 (vạch nhấn màu hồng 4px ở mép trái) */}
            <div className="flex flex-wrap items-center justify-between py-2 pl-2 pr-1 border-l-4 border-brand-pinkAccent gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-[#E9F3FF] text-[#1F4E79]">
                  17:30–19:00
                </span>
                <span className="text-[14px] font-bold text-brand-text">Văn 9A</span>
                <span className="text-[13px] text-brand-subtext">· Chị Vân · 18 học sinh</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-brand-pinkChip text-brand-pinkText">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Chưa điểm danh</span>
              </span>
            </div>

            {/* Hàng 4 */}
            <div className="flex flex-wrap items-center justify-between py-2 px-1 gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-[#E9F3FF] text-[#1F4E79]">
                  18:30–20:00
                </span>
                <span className="text-[14px] font-bold text-brand-text">Luyện thi vào 10</span>
                <span className="text-[13px] text-brand-subtext">· Cô Lan · 20 học sinh</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-brand-pinkChip text-brand-pinkText">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Chưa điểm danh</span>
              </span>
            </div>

            {/* Hàng 5 */}
            <div className="flex flex-wrap items-center justify-between py-2 px-1 gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-[#E9F3FF] text-[#1F4E79]">
                  19:00–20:30
                </span>
                <span className="text-[14px] font-bold text-brand-text">Văn 10 nâng cao</span>
                <span className="text-[13px] text-brand-subtext">· Thầy Minh · 10 học sinh</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-brand-pinkChip text-brand-pinkText">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Chưa điểm danh</span>
              </span>
            </div>
          </div>
        </section>

        {/* THẺ 2 (5 cột): "Đơn xin nghỉ chờ duyệt" */}
        <section className="lg:col-span-5 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          {/* Tiêu đề thẻ */}
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
                Đơn xin nghỉ chờ duyệt
              </h2>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-brand-pinkChip text-brand-pinkText">
                {leaveRequests.filter((r) => r.status === 'PENDING').length} đơn
              </span>
            </div>
            <span className="text-[13px] font-semibold text-brand-subtext">Ưu tiên xử lý</span>
          </div>

          {/* 3 hàng */}
          <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] py-1">
            {leaveRequests.map((req) => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 py-2.5">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-brand-text">
                      {req.studentName}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-brand-blueChip text-brand-blueText">
                      {req.className}
                    </span>
                  </div>
                  <div className="text-[12px] text-brand-subtext">
                    Nghỉ{' '}
                    <strong className="text-brand-text font-semibold">{req.leaveDate}</strong> ·
                    Lý do: <span className="italic">{req.reason}</span>
                  </div>
                </div>

                {/* Các nút thao tác: Chiều rộng 100% dưới chữ trên di động */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleApprove(req.id, req.studentName)}
                        className="flex-1 md:flex-initial min-h-[44px] md:min-h-0 px-3 py-1.5 rounded-lg bg-brand-blueAction text-white text-[13px] md:text-[12px] font-bold hover:bg-[#255b8b] transition-colors shadow-xs active:scale-95 cursor-pointer"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.studentName)}
                        className="flex-1 md:flex-initial min-h-[44px] md:min-h-0 px-2 py-1.5 rounded-lg border border-brand-border md:border-0 text-[13px] md:text-[12px] font-semibold text-brand-subtext hover:text-brand-text transition-colors cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </>
                  ) : req.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> Đã duyệt
                    </span>
                  ) : (
                    <span className="text-[12px] font-semibold text-slate-400">Đã từ chối</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ==================== HÀNG 4: BA THẺ NỘI DUNG ĐỀU NHAU (mỗi thẻ 4 cột) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 flex-shrink-0">
        {/* THẺ 1 (4 cột): "Học phí tháng 11" */}
        <section className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-brand-border">
              <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
                Học phí tháng 11
              </h2>
              <span className="text-[12px] font-bold text-brand-subtext">Đợt 1</span>
            </div>

            {/* Tỉ lệ phần trăm lớn & Thanh tiến độ */}
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="font-serif-title text-[28px] font-bold text-brand-pinkText leading-none">
                73,8%
              </span>
              <div className="text-[12px] text-right space-x-2">
                <span className="font-semibold text-brand-text">Đã thu: 18.600.000 đ</span>
                <span className="text-brand-subtext">| Còn: 6.600.000 đ</span>
              </div>
            </div>

            {/* Thanh tiến độ (rãnh #FFE4EE, màu điền #F8A5C2, cao 12px) */}
            <div className="w-full h-3 bg-[#FFE4EE] rounded-full overflow-hidden mt-2 border border-[#F3D9E3]">
              <div
                className="h-full bg-brand-pinkAccent rounded-full transition-all duration-500"
                style={{ width: '73.8%' }}
              />
            </div>
          </div>

          {/* Danh sách ngắn: Chưa đóng gồm 3 hàng */}
          <div className="divide-y divide-[#F3D9E3] text-[13px] my-1">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-brand-text">Đỗ Gia Hân</span>
                <span className="text-[11px] text-brand-subtext font-semibold">· Văn 9A</span>
              </div>
              <span className="font-bold text-brand-pinkText text-[12px]">1.200.000 đ</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-brand-text">Vũ Quang Huy</span>
                <span className="text-[11px] text-brand-subtext font-semibold">· Văn 8B</span>
              </div>
              <span className="font-bold text-brand-pinkText text-[12px]">900.000 đ</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-brand-text">Bùi Thảo Vy</span>
                <span className="text-[11px] text-brand-subtext font-semibold">· Văn 7C</span>
              </div>
              <span className="font-bold text-brand-pinkText text-[12px]">900.000 đ</span>
            </div>
          </div>

          {/* Liên kết chân thẻ */}
          <div className="pt-1.5 border-t border-brand-border flex items-center justify-between">
            <a
              href="#tuition-all"
              onClick={(e) => {
                e.preventDefault();
                showNotice('Đang tải danh sách 4 hoá đơn còn lại...');
              }}
              className="text-[13px] font-bold text-brand-blueAction hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem 4 hoá đơn khác</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
            <span className="text-[11px] text-brand-subtext font-medium">Hạn nộp: 15/11</span>
          </div>
        </section>

        {/* THẺ 2 (4 cột): Lịch "Tháng 11/2026" */}
        <section className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          {/* Tiêu đề thẻ */}
          <div className="flex items-center justify-between pb-1 border-b border-brand-border">
            <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
              Tháng 11/2026
            </h2>
            <div className="flex items-center gap-1.5 text-brand-subtext text-[12px]">
              <span className="w-2 h-2 rounded-full bg-brand-pinkAccent inline-block"></span>
              <span>Ngày có lớp</span>
            </div>
          </div>

          {/* Khung lịch: 6 hàng tuần đầy đủ */}
          <div className="flex-1 flex flex-col justify-between py-1">
            {/* Tiêu đề thứ trong tuần T2-CN */}
            <div className="grid grid-cols-7 text-center text-[12px] font-bold text-brand-subtext pb-1">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            {/* Tuần 1: 26 Thg 10 -> 01 Thg 11 */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center">
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>26</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="opacity-40 text-brand-subtext">27</span>
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>28</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="opacity-40 text-brand-subtext">29</span>
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>30</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>31</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="text-brand-subtext opacity-40">01</span>
            </div>

            {/* Tuần 2: 02 Thg 11 -> 08 Thg 11 */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center font-semibold text-brand-text">
              <div className="flex flex-col items-center justify-center">
                <span>02</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>03</span>
              <div className="flex flex-col items-center justify-center">
                <span>04</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>05</span>
              <div className="flex flex-col items-center justify-center">
                <span>06</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span>07</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="text-brand-subtext font-normal">08</span>
            </div>

            {/* Tuần 3: 09 Thg 11 (HÔM NAY) -> 15 Thg 11 */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center font-semibold text-brand-text">
              {/* Ngày 09: Hôm nay trong vòng tròn #D6336C */}
              <div className="flex flex-col items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-brand-raspberry text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  09
                </span>
              </div>
              <span>10</span>
              <div className="flex flex-col items-center justify-center">
                <span>11</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>12</span>
              <div className="flex flex-col items-center justify-center">
                <span>13</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span>14</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="text-brand-subtext font-normal">15</span>
            </div>

            {/* Tuần 4: 16 Thg 11 -> 22 Thg 11 */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center font-semibold text-brand-text">
              <div className="flex flex-col items-center justify-center">
                <span>16</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>17</span>
              <div className="flex flex-col items-center justify-center">
                <span>18</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>19</span>
              <div className="flex flex-col items-center justify-center">
                <span>20</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span>21</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="text-brand-subtext font-normal">22</span>
            </div>

            {/* Tuần 5: 23 Thg 11 -> 29 Thg 11 */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center font-semibold text-brand-text">
              <div className="flex flex-col items-center justify-center">
                <span>23</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>24</span>
              <div className="flex flex-col items-center justify-center">
                <span>25</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span>26</span>
              <div className="flex flex-col items-center justify-center">
                <span>27</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span>28</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="text-brand-subtext font-normal">29</span>
            </div>

            {/* Tuần 6: 30 Thg 11 -> 06 Thg 12 */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center font-semibold">
              <div className="flex flex-col items-center justify-center text-brand-text">
                <span>30</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="opacity-40 text-brand-subtext font-normal">01</span>
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>02</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="opacity-40 text-brand-subtext font-normal">03</span>
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>04</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <div className="flex flex-col items-center justify-center opacity-40 text-brand-subtext">
                <span>05</span>
                <span className="w-1 h-1 rounded-full bg-brand-pinkAccent"></span>
              </div>
              <span className="opacity-40 text-brand-subtext font-normal">06</span>
            </div>
          </div>
        </section>

        {/* THẺ 3 (4 cột trên lg, chiều rộng 100% hàng 2 trên md): "Thông báo gần đây" */}
        <section className="md:col-span-2 lg:col-span-4 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-1.5 border-b border-brand-border">
            <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
              Thông báo gần đây
            </h2>
            <span className="text-[12px] font-semibold text-brand-subtext">Tự động</span>
          </div>

          {/* 4 hàng đều nhau */}
          <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] py-0.5">
            {/* Hàng 1 */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
                  <Bell className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-brand-text leading-tight line-clamp-1">
                    Nhắc lịch học thứ Tư
                  </span>
                  <span className="text-[11px] text-brand-subtext">gửi 45 học sinh · 08:15</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-blueChip text-brand-blueText flex-shrink-0">
                <Check className="w-3 h-3" strokeWidth={2} />
                <span>Đã gửi</span>
              </span>
            </div>

            {/* Hàng 2 */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
                  <DollarSign className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-brand-text leading-tight line-clamp-1">
                    Nhắc học phí tháng 11
                  </span>
                  <span className="text-[11px] text-brand-subtext">gửi 7 phụ huynh · 16:40</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-blueChip text-brand-blueText flex-shrink-0">
                <Check className="w-3 h-3" strokeWidth={2} />
                <span>Đã gửi</span>
              </span>
            </div>

            {/* Hàng 3 */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-brand-text leading-tight line-clamp-1">
                    Bài tập Văn 9A đã giao
                  </span>
                  <span className="text-[11px] text-brand-subtext">07/11 · 20:00</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-blueChip text-brand-blueText flex-shrink-0">
                <Check className="w-3 h-3" strokeWidth={2} />
                <span>Hoàn tất</span>
              </span>
            </div>

            {/* Hàng 4 */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-pinkChip flex items-center justify-center text-brand-pinkText flex-shrink-0">
                  <Clock className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-brand-text leading-tight line-clamp-1">
                    Đơn xin nghỉ mới (Linh)
                  </span>
                  <span className="text-[11px] text-brand-subtext">07/11 · 18:05</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-pinkChip text-brand-pinkText flex-shrink-0">
                <Clock className="w-3 h-3" strokeWidth={2} />
                <span>Chờ duyệt</span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
