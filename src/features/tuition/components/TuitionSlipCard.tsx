import React from 'react';
import logoImage from '@/assets/logo/logo.png';
import bankQrImage from '@/assets/images/mã_qr_ngân_hàng.jpg';

export interface TuitionSlipCardProps {
  studentName?: string;
  classNameLabel?: string;
  studentCode?: string;
  monthLabel?: string;
  formattedAmount?: string;
  transferContent?: string;
  teacherComment?: string;
}

// Thẻ ảnh Phiếu học phí chân dung 1080×1350 px dành cho phụ huynh xem trên điện thoại
export const TuitionSlipCard: React.FC<TuitionSlipCardProps> = ({
  studentName = 'Phạm Hoàng Nam',
  classNameLabel = 'Lớp 10',
  studentCode = 'HS0007',
  monthLabel = '11/2026',
  formattedAmount = '1.200.000 đ',
  transferContent = 'HS0007 - Lop 10 - T11',
  teacherComment = 'Nam học rất chăm chỉ, tiến bộ rõ ở kỹ năng phân tích văn bản. Em cần luyện thêm cách mở bài và dẫn chứng trong bài nghị luận.',
}) => {
  return (
    <div className="w-[1080px] h-[1350px] bg-[#FBF6EA] p-[24px] box-border font-nunito text-[#3B2A35] select-none">
      {/* Viền trong 2px #F8A5C2 bo góc 32px */}
      <div className="w-full h-full border-2 border-[#F8A5C2] rounded-[32px] px-[40px] py-[22px] box-border flex flex-col justify-between items-center">
        {/* 1. Phần đầu: Logo tròn (~144px), tiêu đề và tên lớp */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logoImage}
            alt="Logo Lớp Văn chị Vân"
            className="w-[144px] h-auto object-contain block opacity-100"
          />
          <h1 className="font-playfair text-[44px] font-bold text-[#A61E4D] leading-tight mt-2">
            Phiếu học phí tháng {monthLabel}
          </h1>
          <p className="font-nunito text-[20px] font-semibold text-[#6B5560] mt-1">
            Lớp Văn chị Vân
          </p>
        </div>

        {/* 2. Thẻ thông tin học sinh */}
        <div className="w-full bg-white border border-[#F3D9E3] rounded-[24px] px-[32px] py-[14px] box-border divide-y divide-[#F3D9E3]">
          <div className="py-2 flex items-center justify-between">
            <span className="text-[20px] font-semibold text-[#6B5560]">Họ và tên</span>
            <span className="text-[24px] font-bold text-[#3B2A35]">{studentName}</span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-[20px] font-semibold text-[#6B5560]">Lớp</span>
            <span className="text-[24px] font-bold text-[#3B2A35]">{classNameLabel}</span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-[20px] font-semibold text-[#6B5560]">Mã học sinh</span>
            <span className="text-[24px] font-bold text-[#3B2A35]">{studentCode}</span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-[20px] font-semibold text-[#6B5560]">Tháng</span>
            <span className="text-[24px] font-bold text-[#3B2A35]">{monthLabel}</span>
          </div>
        </div>

        {/* 3. Khối số tiền học phí */}
        <div className="w-full bg-[#FFE0EB] rounded-[24px] px-[32px] py-[18px] box-border flex flex-col items-center text-center">
          <span className="font-nunito text-[20px] font-bold text-[#A61E4D]">
            Học phí 1 tháng
          </span>
          <span className="font-playfair text-[64px] font-bold text-[#A61E4D] leading-none mt-2">
            {formattedAmount}
          </span>
        </div>

        {/* 4. Khối mã QR 340×340 */}
        <div className="w-full bg-white border border-[#F3D9E3] rounded-[24px] px-[32px] py-[20px] box-border flex flex-col items-center text-center">
          <div className="w-[340px] h-[340px] flex items-center justify-center overflow-hidden">
            <svg
              viewBox="225 523 378 378"
              className="w-full h-full"
              role="img"
              aria-label="Mã QR thanh toán học phí"
            >
              <image href={bankQrImage} x="0" y="0" width="828" height="1608" />
            </svg>
          </div>
          <p className="font-nunito text-[20px] font-semibold text-[#3B2A35] mt-3">
            Quét mã QR bằng ứng dụng ngân hàng để thanh toán
          </p>
          <p className="font-nunito text-[18px] font-medium text-[#6B5560] mt-1">
            Nội dung chuyển khoản: {transferContent}
          </p>
        </div>

        {/* 5. Khối nhận xét của giáo viên */}
        <div className="w-full bg-[#DCEBFA] rounded-[24px] px-[32px] py-[20px] box-border">
          <h2 className="font-playfair text-[26px] font-bold text-[#1F4E79] leading-snug">
            Nhận xét của giáo viên
          </h2>
          <p className="font-nunito text-[22px] font-medium text-[#3B2A35] leading-[1.55] mt-2">
            {teacherComment}
          </p>
        </div>

        {/* 6. Chân trang: Ghi chú viết tay kèm gạch chân lượn sóng */}
        <div className="py-1 flex justify-center">
          <div className="inline-block transform -rotate-1">
            <span className="font-playfair italic text-[26px] font-bold text-[#A61E4D] squiggle-underline-note">
              Cảm ơn phụ huynh đã đồng hành cùng lớp! — Chị Vân
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

