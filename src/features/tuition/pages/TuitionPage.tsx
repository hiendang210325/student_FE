import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Wallet, Users, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { TileGrid } from '@/components/common/TileGrid/TileGrid';

// Kiểu màu sắc của từng ô lớp học trên bàn cờ (Hồng phấn hoặc Xanh biển)
type TileColorTone = 'PINK' | 'BLUE';

interface TuitionClassTile {
  id: number;
  className: string;
  studentCount: number;
  tone: TileColorTone;
}
 
// Danh sách đúng 12 ô lớp học xếp theo bàn cờ:
// Hàng 1: hồng, xanh, hồng, xanh
// Hàng 2: xanh, hồng, xanh, hồng
// Hàng 3: hồng, xanh, hồng, xanh
const TUITION_CLASS_TILES: TuitionClassTile[] = [
  // Hàng 1: pink, blue, pink, blue
  { id: 1, className: 'Lớp 1', studentCount: 2, tone: 'PINK' },
  { id: 2, className: 'Lớp 2', studentCount: 2, tone: 'BLUE' },
  { id: 3, className: 'Lớp 3', studentCount: 2, tone: 'PINK' },
  { id: 4, className: 'Lớp 4', studentCount: 3, tone: 'BLUE' },
  // Hàng 2: blue, pink, blue, pink
  { id: 5, className: 'Lớp 5', studentCount: 3, tone: 'BLUE' },
  { id: 6, className: 'Lớp 6', studentCount: 3, tone: 'PINK' },
  { id: 7, className: 'Lớp 7', studentCount: 4, tone: 'BLUE' },
  { id: 8, className: 'Lớp 8', studentCount: 4, tone: 'PINK' },
  // Hàng 3: pink, blue, pink, blue
  { id: 9, className: 'Lớp 9', studentCount: 5, tone: 'PINK' },
  { id: 10, className: 'Lớp 10', studentCount: 10, tone: 'BLUE' },
  { id: 11, className: 'Lớp 11', studentCount: 2, tone: 'PINK' },
  { id: 12, className: 'Lớp 12', studentCount: 2, tone: 'BLUE' },
];

// Cấu hình màu sắc chuẩn cho hai loại ô Hồng và Xanh
const getTileTheme = (tone: TileColorTone) => {
  if (tone === 'PINK') {
    return {
      bg: '#FFE0EB',
      border: '#F8A5C2',
      textColor: '#A61E4D',
    };
  }
  return {
    bg: '#DCEBFA',
    border: '#8EC5FC',
    textColor: '#1F4E79',
  };
};

export const TuitionPage: React.FC = () => {
  const navigate = useNavigate();
  // Ô "Lớp 10" (id = 10) mặc định hiển thị trạng thái hover mẫu: nâng 4px, viền 2px #2F6FA8 và bóng đổ đậm hơn
  const [hoveredTileId, setHoveredTileId] = useState<number>(10);

  // Mở màn hình học phí chi tiết của lớp được chọn
  const handleSelectClassTile = (tileId: number) => {
    navigate(ROUTES.TUITION_CLASS_DETAIL.replace(':id', String(tileId)));
  };

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] lg:min-h-[1024px] font-nunito text-[#3B2A35]">
      {/* Khung vùng chính 1200px trên lg, co giãn đầy đủ trên di động và máy tính bảng */}
      <div className="w-full lg:w-[1200px] lg:min-h-[1024px] p-0 lg:p-8 flex flex-col justify-start gap-4 md:gap-6 box-border select-none">
        {/* ==================== HÀNG 1: TIÊU ĐỀ ĐẦU TRANG (88px trên lg) ==================== */}
        <header className="min-h-[72px] lg:h-[88px] w-full lg:w-[1136px] flex items-center justify-between flex-shrink-0">
          {/* Bên trái: Tiêu đề "Học phí" + Thẻ "Tháng 11/2026" + Dòng ghi chú viết tay của giáo viên */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <h1 className="font-playfair text-[24px] lg:text-[28px] font-bold text-[#3B2A35] leading-tight">
                Học phí
              </h1>
              {/* Thẻ "Tháng 11/2026" (biểu tượng lịch, nền #DCEBFA, chữ #1F4E79) */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-[#1F4E79] flex-shrink-0" strokeWidth={1.75} />
                <span>Tháng 11/2026</span>
              </span>
            </div>

            {/* Dòng ghi chú viết tay đặc trưng kèm gạch chân lượn sóng và 2 hình dán vector phẳng */}
            <div className="flex items-center mt-1.5">
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] lg:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  Chọn lớp, nhập học phí và gửi mã QR cho phụ huynh nhé!
                </span>
              </div>

              {/* Đúng 2 hình dán vector phẳng pastel (ẩn dưới md) */}
              <div className="hidden md:flex items-center gap-2 ml-[24px]">
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
        </header>

        {/* ==================== HÀNG 2: LƯỚI 12 Ô VUÔNG LỚP HỌC (2/3/4 CỘT) ==================== */}
        <TileGrid className="lg:w-[1136px] lg:h-[846px] lg:grid-rows-3 flex-shrink-0">
          {TUITION_CLASS_TILES.map((tile) => {
            const theme = getTileTheme(tile.tone);
            const isHovered = hoveredTileId === tile.id;

            return (
              <div
                key={tile.id}
                onClick={() => handleSelectClassTile(tile.id)}
                onMouseEnter={() => setHoveredTileId(tile.id)}
                onMouseLeave={() => setHoveredTileId(10)}
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
                {/* Hàng trên: Vòng tròn trắng đặc 44px ở góc trên bên trái chứa biểu tượng ví viền nét */}
                <div className="flex items-start justify-between w-full">
                  <div className="w-10 h-10 lg:w-[44px] lg:h-[44px] rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Wallet
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: theme.textColor }}
                      strokeWidth={1.75}
                    />
                  </div>
                </div>

                {/* Hàng dưới: Tên lớp (28px di động -> 40px màn hình lớn) + sĩ số bên trái & Vòng tròn mũi tên bên phải */}
                <div className="flex items-end justify-between w-full gap-2">
                  {/* Neo góc dưới bên trái */}
                  <div className="flex flex-col min-w-0">
                    <h2
                      style={{ color: theme.textColor }}
                      className="font-playfair text-[28px] md:text-[34px] lg:text-[40px] font-bold leading-none tracking-tight truncate"
                    >
                      {tile.className}
                    </h2>
                    <div className="flex items-center gap-1.5 lg:gap-2 mt-1.5 lg:mt-2.5 font-nunito text-[14px] lg:text-[16px] font-semibold text-[#3B2A35] leading-none">
                      <Users
                        className="w-4 h-4 text-[#3B2A35] flex-shrink-0"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{tile.studentCount} học sinh</span>
                    </div>
                  </div>

                  {/* Góc dưới bên phải: Vòng tròn trắng 36px với biểu tượng mũi tên phải (#3B2A35) */}
                  <div className="w-8 h-8 lg:w-[36px] lg:h-[36px] rounded-full bg-white flex items-center justify-center text-[#3B2A35] flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#3B2A35]" strokeWidth={1.75} />
                  </div>
                </div>
              </div>
            );
          })}
        </TileGrid>
      </div>
    </div>
  );
};

