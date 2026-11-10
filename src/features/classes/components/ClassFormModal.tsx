import React, { useState, useEffect } from 'react';
import { BookOpen, Users, ChevronRight, Palette, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClassColorTheme, ClassTileItem } from '../types/class.types';

// Danh sách các bảng màu Pastel có sẵn chuẩn thẩm mỹ Lớp Văn chị Vân
export const PRESET_COLOR_THEMES: ClassColorTheme[] = [
  {
    name: 'Hồng phấn',
    bg: '#FFE0EB',
    border: '#F8A5C2',
    text: '#A61E4D',
  },
  {
    name: 'Xanh biển',
    bg: '#DCEBFA',
    border: '#8EC5FC',
    text: '#1F4E79',
  },
  {
    name: 'Kem bơ',
    bg: '#FBF6EA',
    border: '#F3D9E3',
    text: '#8C5874',
  },
  {
    name: 'Xanh xô thơm',
    bg: '#E6F4EA',
    border: '#A8DAB5',
    text: '#137333',
  },
  {
    name: 'Cam đào',
    bg: '#FFEDD5',
    border: '#FDBA74',
    text: '#C2410C',
  },
  {
    name: 'Tím mận',
    bg: '#F3E8FF',
    border: '#D8B4FE',
    text: '#6B21A8',
  },
];

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    grade: number;
    studentCount: number;
    colorTheme: ClassColorTheme;
  }) => void;
  initialData?: ClassTileItem | null;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  // Trạng thái các trường trong biểu mẫu
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(10);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<ClassColorTheme>(PRESET_COLOR_THEMES[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customBg, setCustomBg] = useState('#FFE0EB');
  const [customText, setCustomText] = useState('#A61E4D');
  const [customBorder, setCustomBorder] = useState('#F8A5C2');

  // Khởi tạo hoặc đặt lại dữ liệu form khi mở modal
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setGrade(initialData.grade || 10);
      setStudentCount(initialData.studentCount || 0);
      setSelectedTheme(initialData.colorTheme);

      // Kiểm tra xem màu hiện tại có phải là màu tùy chỉnh không
      const matchedPreset = PRESET_COLOR_THEMES.find(
        (p) => p.bg.toLowerCase() === initialData.colorTheme.bg.toLowerCase()
      );
      if (!matchedPreset) {
        setIsCustomColor(true);
        setCustomBg(initialData.colorTheme.bg);
        setCustomText(initialData.colorTheme.text);
        setCustomBorder(initialData.colorTheme.border);
      } else {
        setIsCustomColor(false);
      }
    } else {
      setName('');
      setGrade(10);
      setStudentCount(0);
      setSelectedTheme(PRESET_COLOR_THEMES[0]);
      setIsCustomColor(false);
      setCustomBg('#FFE0EB');
      setCustomText('#A61E4D');
      setCustomBorder('#F8A5C2');
    }
  }, [initialData, isOpen]);

  // Màu sắc hiện tại đang áp dụng (Preset hoặc Custom)
  const currentTheme: ClassColorTheme = isCustomColor
    ? {
        name: 'Tùy chỉnh',
        bg: customBg,
        border: customBorder,
        text: customText,
      }
    : selectedTheme;

  // Xử lý gửi biểu mẫu
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      grade: Number(grade) || 10,
      studentCount: Number(studentCount) || 0,
      colorTheme: currentTheme,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-[12px] bg-white border border-[#F3D9E3] shadow-[0_20px_50px_rgba(59,42,53,0.18)]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-playfair text-[22px] font-bold text-[#3B2A35]">
            {isEditing ? 'Sửa thông tin lớp học' : 'Thêm lớp học mới'}
          </DialogTitle>
          <DialogDescription className="font-nunito text-[13px] text-[#6B5560]">
            {isEditing
              ? 'Cập nhật tên lớp, sĩ số và tùy biến màu sắc ô vuông hiển thị.'
              : 'Nhập thông tin lớp học mới và chọn gam màu sắc đại diện.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Hàng 1: Tên lớp học & Khối lớp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">
                Tên lớp học <span className="text-brand-raspberry">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Lớp 10, Lớp 10A1..."
                required
                className="h-[44px] rounded-[10px] border-[#9C6B84] text-[14px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">
                Khối lớp (1 - 12)
              </Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                required
                className="h-[44px] rounded-[10px] border-[#9C6B84] text-[14px]"
              />
            </div>
          </div>

          {/* Hàng 2: Sĩ số học sinh ban đầu */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-[#3B2A35]">
              Sĩ số học sinh ban đầu
            </Label>
            <Input
              type="number"
              min={0}
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              placeholder="VD: 10"
              className="h-[44px] rounded-[10px] border-[#9C6B84] text-[14px]"
            />
          </div>

          {/* ==================== CHỌN MÀU SẮC Ô VUÔNG (COLOR THEME) ==================== */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-bold text-[#3B2A35] flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#2F6FA8]" />
                <span>Màu sắc ô vuông lớp học</span>
              </Label>
              <span className="text-[11px] font-semibold text-[#6B5560]">
                {currentTheme.name || 'Tùy chọn'}
              </span>
            </div>

            {/* Bảng 6 màu Preset Pastel thiết kế sẵn */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_COLOR_THEMES.map((theme) => {
                const isSelected =
                  !isCustomColor && selectedTheme.bg.toLowerCase() === theme.bg.toLowerCase();

                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(theme);
                      setIsCustomColor(false);
                    }}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: isSelected ? theme.text : theme.border,
                    }}
                    className={`h-[42px] rounded-[10px] border-2 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 relative ${
                      isSelected ? 'ring-2 ring-[#2F6FA8]/40 scale-102' : ''
                    }`}
                    title={theme.name}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: theme.text }} strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tùy chỉnh màu tự do (Custom Color Picker) */}
            <div className="pt-2 border-t border-[#F3D9E3]/70">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setIsCustomColor(!isCustomColor)}
                  className="text-[12px] font-bold text-[#2F6FA8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isCustomColor ? '← Sử dụng bảng màu có sẵn' : '+ Tự chọn màu tùy thích (Color Picker)'}
                </button>
              </div>

              {isCustomColor && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#FCF8FA] p-3 rounded-[10px] border border-[#F3D9E3]">
                  {/* Màu nền */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#6B5560]">Màu nền</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-8 h-8 rounded-[6px] border border-[#F3D9E3] cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={customBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-full h-8 px-2 text-[12px] font-mono rounded-[6px] border border-[#9C6B84] bg-white text-[#3B2A35]"
                      />
                    </div>
                  </div>

                  {/* Màu viền */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#6B5560]">Màu viền</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customBorder}
                        onChange={(e) => setCustomBorder(e.target.value)}
                        className="w-8 h-8 rounded-[6px] border border-[#F3D9E3] cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={customBorder}
                        onChange={(e) => setCustomBorder(e.target.value)}
                        className="w-full h-8 px-2 text-[12px] font-mono rounded-[6px] border border-[#9C6B84] bg-white text-[#3B2A35]"
                      />
                    </div>
                  </div>

                  {/* Màu chữ */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#6B5560]">Màu chữ</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="w-8 h-8 rounded-[6px] border border-[#F3D9E3] cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="w-full h-8 px-2 text-[12px] font-mono rounded-[6px] border border-[#9C6B84] bg-white text-[#3B2A35]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ==================== XEM TRƯỚC Ô VUÔNG TRỰC TIẾP (LIVE PREVIEW) ==================== */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#6B5560] block mb-1.5 uppercase tracking-wider">
                Xem trước ô vuông hiển thị
              </span>
              <div className="flex justify-center p-3 rounded-[10px] bg-[#FFF6F9] border border-dashed border-[#F3D9E3]">
                {/* Ô vuông mô phỏng thu nhỏ */}
                <div
                  style={{
                    backgroundColor: currentTheme.bg,
                    borderColor: currentTheme.border,
                  }}
                  className="w-[180px] h-[180px] rounded-[16px] border p-4 flex flex-col justify-between shadow-card transition-all"
                >
                  {/* Góc trên bên trái: Vòng tròn trắng chứa biểu tượng sách */}
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-2xs">
                    <BookOpen
                      className="w-4 h-4"
                      style={{ color: currentTheme.text }}
                      strokeWidth={1.75}
                    />
                  </div>

                  {/* Đáy ô: Tên lớp và số học sinh */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span
                        className="font-playfair text-[26px] font-bold leading-none block"
                        style={{ color: currentTheme.text }}
                      >
                        {name || 'Tên lớp'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-nunito text-[12px] text-[#3B2A35] font-semibold">
                        <Users className="w-3.5 h-3.5 text-[#3B2A35]" strokeWidth={1.75} />
                        <span>{studentCount || 0} học sinh</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs text-[#3B2A35]">
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-[#F3D9E3] gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-[44px] px-5 rounded-[10px] text-[#6B5560] border-[#F3D9E3] hover:bg-slate-50 text-[14px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-[44px] px-6 rounded-[10px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white font-bold text-[14px] shadow-xs active:scale-95"
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm lớp học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

