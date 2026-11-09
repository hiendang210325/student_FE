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
    <div className="w-full min-h-[976px] p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-6 overflow-x-hidden box-border max-w-[1440px] mx-auto select-none bg-brand-page text-brand-text">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-text text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ==================== ROW 1: HEADER (88px) ==================== */}
      <header className="min-h-[88px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative flex-shrink-0">
        {/* Left side: Greeting + Date Chip + Margin note */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif-title text-[24px] sm:text-[28px] font-bold text-brand-text leading-tight">
              Chào buổi sáng, chị Vân
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold bg-brand-blueChip text-brand-blueText tracking-wide shadow-2xs">
              Thứ Hai, 09/11/2026
            </span>
          </div>

          {/* Signature handwritten-style teacher note with hand-drawn squiggle underline */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
            <div className="inline-block transform -rotate-1 origin-left">
              <span className="font-serif-title italic text-[14px] sm:text-[15px] font-semibold text-brand-pinkText squiggle-underline-note">
                “Hôm nay có 5 buổi học, nhớ điểm danh nhé!”
              </span>
            </div>

            {/* STICKERS: exactly 2 small flat pastel vector stickers placed here */}
            <div className="flex items-center gap-2 pl-1 sm:pl-3">
              {/* Sticker 1: pastel pink star */}
              <svg
                className="w-6 h-6 text-brand-pinkAccent animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2l2.75 6.63L22 9.24l-5.45 4.73L18.18 21 12 17.27 5.82 21l1.63-7.03L2 9.24l7.25-.61L12 2z" />
              </svg>
              {/* Sticker 2: pastel blue quill */}
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

        {/* Right side: Two action buttons */}
        <div className="flex items-center gap-3">
          {/* Secondary Button: Bell icon, #CFE8FF background, #1F4E79 text */}
          <button
            onClick={() => showNotice('Đã mở hộp thoại gửi thông báo cho phụ huynh & học sinh')}
            className="h-[44px] px-4 rounded-xl bg-brand-blueBtn text-brand-blueText hover:bg-[#b8ddff] font-bold text-[14px] flex items-center gap-2 transition-colors active:scale-95 shadow-sm cursor-pointer"
          >
            <Bell className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
            <span>Gửi thông báo</span>
          </button>

          {/* Primary Button: Check icon, #D6336C background, white text */}
          <button
            onClick={() => showNotice('Đã mở giao diện điểm danh nhanh hôm nay')}
            className="h-[44px] px-5 rounded-xl bg-brand-raspberry text-white hover:bg-[#be265d] font-bold text-[14px] flex items-center gap-2 shadow-sm transition-colors active:scale-95 cursor-pointer"
          >
            <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            <span>Điểm danh</span>
          </button>
        </div>
      </header>

      {/* ==================== ROW 2: FOUR EQUAL KPI TILES ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 flex-shrink-0">
        {/* KPI 1: 3 cols, #DCEBFA icon chip with #1F4E79 icon */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
              <Users className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-title text-[30px] font-bold text-brand-text leading-none">
                  42
                </span>
                <span className="text-[14px] font-bold text-brand-subtext leading-none">
                  Học sinh
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1">trong 5 lớp</span>
            </div>
          </div>
        </div>

        {/* KPI 2: 3 cols, #FFE0EB icon chip with #A61E4D icon */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-pinkChip flex items-center justify-center text-brand-pinkText flex-shrink-0">
              <Clock className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-title text-[30px] font-bold text-brand-text leading-none">
                  5
                </span>
                <span className="text-[14px] font-bold text-brand-subtext leading-none">
                  Buổi học hôm nay
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1">
                2 đã điểm danh
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: 3 cols, #DCEBFA icon chip with #1F4E79 icon */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blueChip flex items-center justify-center text-brand-blueText flex-shrink-0">
              <FileText className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-title text-[30px] font-bold text-brand-text leading-none">
                  3
                </span>
                <span className="text-[14px] font-bold text-brand-subtext leading-none">
                  Đơn chờ duyệt
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1">cần xử lý</span>
            </div>
          </div>
        </div>

        {/* KPI 4: 3 cols, #FFE0EB icon chip with #A61E4D icon */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-pinkChip flex items-center justify-center text-brand-pinkText flex-shrink-0">
              <DollarSign className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-title text-[28px] font-bold text-brand-text leading-none">
                  73,8%
                </span>
                <span className="text-[14px] font-bold text-brand-subtext leading-none">
                  Học phí
                </span>
              </div>
              <span className="text-[12px] font-medium text-brand-subtext mt-1">
                7 hoá đơn chưa đóng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ROW 3: TWO CARDS (7 cols & 5 cols) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-shrink-0">
        {/* CARD 1 (7 columns): "Lịch học hôm nay" */}
        <section className="lg:col-span-7 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          {/* Header */}
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

          {/* 5 equal rows */}
          <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] py-0.5">
            {/* Row 1 */}
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

            {/* Row 2 */}
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

            {/* Row 3 (4px pink accent bar on left edge) */}
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

            {/* Row 4 */}
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

            {/* Row 5 */}
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

        {/* CARD 2 (5 columns): "Đơn xin nghỉ chờ duyệt" */}
        <section className="lg:col-span-5 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          {/* Header */}
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

          {/* 3 rows */}
          <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] py-1">
            {leaveRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-2.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
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

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleApprove(req.id, req.studentName)}
                        className="px-3 py-1.5 rounded-lg bg-brand-blueAction text-white text-[12px] font-bold hover:bg-[#255b8b] transition-colors shadow-xs active:scale-95 cursor-pointer"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.studentName)}
                        className="px-2 py-1.5 text-[12px] font-semibold text-brand-subtext hover:text-brand-text transition-colors cursor-pointer"
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

      {/* ==================== ROW 4: THREE EQUAL CARDS (4 cols each) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 flex-shrink-0">
        {/* CARD 1 (4 columns): "Học phí tháng 11" */}
        <section className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-brand-border">
              <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
                Học phí tháng 11
              </h2>
              <span className="text-[12px] font-bold text-brand-subtext">Đợt 1</span>
            </div>

            {/* Big percentage & Progress Bar */}
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="font-serif-title text-[28px] font-bold text-brand-pinkText leading-none">
                73,8%
              </span>
              <div className="text-[12px] text-right space-x-2">
                <span className="font-semibold text-brand-text">Đã thu: 18.600.000 đ</span>
                <span className="text-brand-subtext">| Còn: 6.600.000 đ</span>
              </div>
            </div>

            {/* Progress Bar (track #FFE4EE, fill #F8A5C2, 12px high) */}
            <div className="w-full h-3 bg-[#FFE4EE] rounded-full overflow-hidden mt-2 border border-[#F3D9E3]">
              <div
                className="h-full bg-brand-pinkAccent rounded-full transition-all duration-500"
                style={{ width: '73.8%' }}
              />
            </div>
          </div>

          {/* Short list: Chưa đóng with 3 rows */}
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

          {/* Footer link */}
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

        {/* CARD 2 (4 columns): "Tháng 11/2026" calendar */}
        <section className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-brand-border">
            <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
              Tháng 11/2026
            </h2>
            <div className="flex items-center gap-1.5 text-brand-subtext text-[12px]">
              <span className="w-2 h-2 rounded-full bg-brand-pinkAccent inline-block"></span>
              <span>Ngày có lớp</span>
            </div>
          </div>

          {/* Calendar Container: 6 full week rows */}
          <div className="flex-1 flex flex-col justify-between py-1">
            {/* Weekday Header T2-CN */}
            <div className="grid grid-cols-7 text-center text-[12px] font-bold text-brand-subtext pb-1">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            {/* Week 1: 26 Oct -> 01 Nov */}
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

            {/* Week 2: 02 Nov -> 08 Nov */}
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

            {/* Week 3: 09 Nov (TODAY) -> 15 Nov */}
            <div className="grid grid-cols-7 text-center text-[12px] h-[28px] items-center font-semibold text-brand-text">
              {/* 09: Today in #D6336C circle */}
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

            {/* Week 4: 16 Nov -> 22 Nov */}
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

            {/* Week 5: 23 Nov -> 29 Nov */}
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

            {/* Week 6: 30 Nov -> 06 Dec */}
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

        {/* CARD 3 (4 columns): "Thông báo gần đây" */}
        <section className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-brand-border">
            <h2 className="font-serif-title text-[18px] font-bold text-brand-text">
              Thông báo gần đây
            </h2>
            <span className="text-[12px] font-semibold text-brand-subtext">Tự động</span>
          </div>

          {/* 4 equal rows */}
          <div className="flex-1 flex flex-col justify-between divide-y divide-[#F3D9E3] py-0.5">
            {/* Row 1 */}
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

            {/* Row 2 */}
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

            {/* Row 3 */}
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

            {/* Row 4 */}
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
