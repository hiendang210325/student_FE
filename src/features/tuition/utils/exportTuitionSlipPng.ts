import logoImage from '@/assets/logo/logo.png';
import bankQrImage from '@/assets/images/mã_qr_ngân_hàng.jpg';

export interface TuitionSlipExportData {
  studentName: string;
  classNameLabel: string;
  studentCode: string;
  monthLabel: string;
  formattedAmount: string;
  transferContent: string;
  teacherComment: string;
  fileName: string;
  status?: 'UNPAID' | 'PAID';
}

// Tải ảnh bất đồng bộ để vẽ lên Canvas
const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Tách đoạn văn bản thành các dòng theo chiều rộng tối đa trên Canvas
const wrapTextLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
};

// Xuất ảnh Phiếu học phí chân dung 1080×1350 px để giáo viên gửi phụ huynh qua điện thoại
export const exportTuitionSlipPng = async (
  data: TuitionSlipExportData
): Promise<void> => {
  const [logoImg, qrImg] = await Promise.all([
    loadImage(logoImage),
    loadImage(bankQrImage),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Nền kem #FBF6EA toàn ảnh và viền trong 2px #F8A5C2 bo góc 32px
  ctx.fillStyle = '#FBF6EA';
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.strokeStyle = '#F8A5C2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(24, 24, 1032, 1302, 32);
  ctx.stroke();

  const contentX = 64;
  const contentW = 1080 - 128; // 952px
  let cursorY = 46;

  // 2. Phần đầu: Logo tròn (~144px), Tiêu đề "Phiếu học phí tháng ...", và "Lớp Văn chị Vân"
  const logoSize = 144;
  if (logoImg) {
    const logoX = (1080 - logoSize) / 2;
    ctx.drawImage(logoImg, logoX, cursorY, logoSize, logoSize);
  }
  cursorY += logoSize + 14;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#A61E4D';
  ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
  ctx.fillText(`Phiếu học phí tháng ${data.monthLabel}`, 540, cursorY + 34);
  cursorY += 48;

  ctx.fillStyle = '#6B5560';
  ctx.font = '600 20px "Nunito", sans-serif';
  ctx.fillText('Lớp Văn chị Vân', 540, cursorY + 18);
  cursorY += 28 + 20;

  // 3. Thẻ thông tin học sinh (trắng, viền 1px #F3D9E3, bo góc 24px)
  const infoCardH = 180;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#F3D9E3';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(contentX, cursorY, contentW, infoCardH, 24);
  ctx.fill();
  ctx.stroke();

  const infoRows: [string, string][] = [
    ['Họ và tên', data.studentName],
    ['Lớp', data.classNameLabel],
    ['Mã học sinh', data.studentCode],
    ['Tháng', data.monthLabel],
  ];

  const rowH = 38;
  const infoStartY = cursorY + 14;
  infoRows.forEach(([label, value], idx) => {
    const rowY = infoStartY + idx * rowH;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B5560';
    ctx.font = '600 20px "Nunito", sans-serif';
    ctx.fillText(label, contentX + 32, rowY + 24);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#3B2A35';
    ctx.font = 'bold 24px "Nunito", sans-serif';
    ctx.fillText(value, contentX + contentW - 32, rowY + 25);

    if (idx < infoRows.length - 1) {
      ctx.strokeStyle = '#F3D9E3';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(contentX + 32, rowY + rowH);
      ctx.lineTo(contentX + contentW - 32, rowY + rowH);
      ctx.stroke();
    }
  });
  cursorY += infoCardH + 20;

  // 4. Khối số tiền học phí (nền #FFE0EB, bo góc 24px, căn giữa)
  const amountBlockH = 128;
  ctx.fillStyle = '#FFE0EB';
  ctx.beginPath();
  ctx.roundRect(contentX, cursorY, contentW, amountBlockH, 24);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#A61E4D';
  ctx.font = 'bold 20px "Nunito", sans-serif';
  ctx.fillText(
    data.status === 'PAID' ? 'Học phí 1 tháng (Đã thanh toán)' : 'Học phí 1 tháng',
    540,
    cursorY + 38
  );

  ctx.font = 'bold 64px "Playfair Display", Georgia, serif';
  ctx.fillText(data.formattedAmount, 540, cursorY + 104);
  cursorY += amountBlockH + 20;

  // 5. Khối mã QR (trắng, viền 1px #F3D9E3, bo góc 24px, QR 340×340)
  const qrBlockH = 446;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#F3D9E3';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(contentX, cursorY, contentW, qrBlockH, 24);
  ctx.fill();
  ctx.stroke();

  const qrSize = 340;
  const qrX = (1080 - qrSize) / 2;
  const qrY = cursorY + 24;
  if (qrImg) {
    // Cắt đúng vùng mã QR vuông (378×378 tại tọa độ 225, 523) từ ảnh gốc 828×1608
    ctx.drawImage(qrImg, 225, 523, 378, 378, qrX, qrY, qrSize, qrSize);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3B2A35';
  ctx.font = '600 20px "Nunito", sans-serif';
  ctx.fillText(
    'Quét mã QR bằng ứng dụng ngân hàng để thanh toán',
    540,
    qrY + qrSize + 30
  );

  ctx.fillStyle = '#6B5560';
  ctx.font = '600 18px "Nunito", sans-serif';
  ctx.fillText(
    `Nội dung chuyển khoản: ${data.transferContent}`,
    540,
    qrY + qrSize + 60
  );
  cursorY += qrBlockH + 20;

  // 6. Khối nhận xét của giáo viên (nền #DCEBFA, bo góc 24px)
  const commentBlockH = 164;
  ctx.fillStyle = '#DCEBFA';
  ctx.beginPath();
  ctx.roundRect(contentX, cursorY, contentW, commentBlockH, 24);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#1F4E79';
  ctx.font = 'bold 26px "Playfair Display", Georgia, serif';
  ctx.fillText('Nhận xét của giáo viên', contentX + 32, cursorY + 42);

  ctx.fillStyle = '#3B2A35';
  ctx.font = '500 22px "Nunito", sans-serif';
  const effectiveComment =
    data.teacherComment?.trim() ||
    'Chúc em luôn giữ tinh thần chăm chỉ, rèn luyện tốt kỹ năng cảm thụ và viết văn trong tháng học mới.';
  const commentLines = wrapTextLines(ctx, effectiveComment, contentW - 64).slice(0, 3);
  commentLines.forEach((line, idx) => {
    ctx.fillText(line, contentX + 32, cursorY + 80 + idx * 34);
  });
  cursorY += commentBlockH + 22;

  // 7. Chân trang: Ghi chú viết tay nghiêng #A61E4D kèm gạch chân lượn sóng
  const footerText = 'Cảm ơn phụ huynh đã đồng hành cùng lớp! — Chị Vân';
  ctx.save();
  ctx.translate(540, cursorY + 20);
  ctx.rotate((-1 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#A61E4D';
  ctx.font = 'italic bold 26px "Playfair Display", Georgia, serif';
  ctx.fillText(footerText, 0, 0);

  // Vẽ đường gạch chân lượn sóng dưới ghi chú
  const textW = ctx.measureText(footerText).width;
  const startX = -textW / 2;
  ctx.strokeStyle = '#A61E4D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= textW; x += 12) {
    const waveY = 8 + Math.sin((x / 12) * Math.PI) * 2.5;
    if (x === 0) ctx.moveTo(startX + x, waveY);
    else ctx.lineTo(startX + x, waveY);
  }
  ctx.stroke();
  ctx.restore();

  // Tải xuống ảnh PNG
  const link = document.createElement('a');
  link.download = data.fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

