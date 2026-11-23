import React, { useState, useEffect } from 'react';
import { BookOpen, Users, ChevronRight, Palette, Check, Loader2, AlertCircle } from 'lucide-react';
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
import { ClassColorTheme, ClassPayload, ClassRoom } from '../types/class.types';
import { ApiError } from '@/services/api/apiError';

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
  onSubmit: (data: ClassPayload) => Promise<void>;
  initialData?: ClassRoom | null;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(9);
  const [homeroomTeacher, setHomeroomTeacher] = useState('Chị Vân');
  const [roomNumber, setRoomNumber] = useState('P.201');
  const [schedule, setSchedule] = useState('Thứ 2, Thứ 5 (18:00 - 20:00)');
  const [maxCapacity, setMaxCapacity] = useState<number>(30);
  const [selectedTheme, setSelectedTheme] = useState<ClassColorTheme>(PRESET_COLOR_THEMES[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customBg, setCustomBg] = useState('#FFE0EB');
  const [customText, setCustomText] = useState('#A61E4D');
  const [customBorder, setCustomBorder] = useState('#F8A5C2');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (initialData) {
      setName(initialData.name);
      setGrade(initialData.grade || 9);
      setHomeroomTeacher(initialData.homeroomTeacher || 'Chị Vân');
      setRoomNumber(initialData.roomNumber || 'P.201');
      setSchedule(initialData.schedule || '');
      setMaxCapacity(initialData.maxCapacity || 30);

      const theme = initialData.colorTheme || PRESET_COLOR_THEMES[0];
      setSelectedTheme(theme);

      const matchedPreset = PRESET_COLOR_THEMES.find(
        (p) => p.bg.toLowerCase() === theme.bg.toLowerCase()
      );
      if (!matchedPreset) {
        setIsCustomColor(true);
        setCustomBg(theme.bg);
        setCustomText(theme.text);
        setCustomBorder(theme.border);
      } else {
        setIsCustomColor(false);
      }
    } else {
      setName('');
      setGrade(9);
      setHomeroomTeacher('Chị Vân');
      setRoomNumber('P.201');
      setSchedule('Thứ 2, Thứ 5 (18:00 - 20:00)');
      setMaxCapacity(30);
      setSelectedTheme(PRESET_COLOR_THEMES[0]);
      setIsCustomColor(false);
      setCustomBg('#FFE0EB');
      setCustomText('#A61E4D');
      setCustomBorder('#F8A5C2');
    }
  }, [initialData, isOpen]);

  const currentTheme: ClassColorTheme = isCustomColor
    ? {
        name: 'Tùy chỉnh',
        bg: customBg,
        border: customBorder,
        text: customText,
      }
    : selectedTheme;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vui lòng nhập tên lớp học.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        grade: Math.min(12, Math.max(1, Number(grade) || 9)),
        homeroomTeacher: homeroomTeacher.trim() || 'Chị Vân',
        roomNumber: roomNumber.trim() || 'P.201',
        schedule: schedule.trim(),
        maxCapacity: Math.max(1, Number(maxCapacity) || 30),
        colorTheme: {
          bg: currentTheme.bg,
          border: currentTheme.border,
          text: currentTheme.text,
        },
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể lưu thông tin lớp học. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-[12px] bg-white border border-[#F3D9E3] shadow-[0_20px_50px_rgba(59,42,53,0.18)]">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="font-playfair text-[22px] font-bold text-[#3B2A35]">
            {isEditing ? 'Sửa thông tin lớp học' : 'Thêm lớp học mới'}
          </DialogTitle>
          <DialogDescription className="font-nunito text-[13px] text-[#6B5560]">
            {isEditing
              ? 'Cập nhật thông tin lớp học và tùy biến màu sắc ô vuông hiển thị.'
              : 'Tạo ô vuông lớp học mới với thông tin lịch học và gam màu đại diện.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Hàng 1: Tên lớp học & Khối lớp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">
                Tên lớp học <span className="text-brand-raspberry">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Văn 9A, Ôn thi vào 10..."
                required
                className="h-[42px] rounded-[10px] border-[#9C6B84] text-[14px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">
                Khối lớp (1 – 12) <span className="text-brand-raspberry">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                required
                className="h-[42px] rounded-[10px] border-[#9C6B84] text-[14px]"
              />
            </div>
          </div>

          {/* Hàng 2: Giáo viên & Phòng học & Sĩ số tối đa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">Giáo viên</Label>
              <Input
                value={homeroomTeacher}
                onChange={(e) => setHomeroomTeacher(e.target.value)}
                placeholder="Chị Vân"
                className="h-[42px] rounded-[10px] border-[#9C6B84] text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">Phòng học</Label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="VD: P.201"
                className="h-[42px] rounded-[10px] border-[#9C6B84] text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-[#3B2A35]">Sĩ số tối đa</Label>
              <Input
                type="number"
                min={1}
                max={200}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="h-[42px] rounded-[10px] border-[#9C6B84] text-[13px]"
              />
            </div>
          </div>

          {/* Hàng 3: Lịch học */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-[#3B2A35]">Lịch học định kỳ</Label>
            <Input
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="VD: Thứ 2, Thứ 5 (18:00 - 20:00)"
              className="h-[42px] rounded-[10px] border-[#9C6B84] text-[13px]"
            />
          </div>

          {/* ==================== CHỌN BẢNG MÀU CHO Ô VUÔNG ==================== */}
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

            <div className="pt-2 border-t border-[#F3D9E3]/70">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setIsCustomColor(!isCustomColor)}
                  className="text-[12px] font-bold text-[#2F6FA8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isCustomColor
                    ? '← Sử dụng bảng màu có sẵn'
                    : '+ Tự chọn màu tùy thích (Color Picker)'}
                </button>
              </div>

              {isCustomColor && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#FCF8FA] p-3 rounded-[10px] border border-[#F3D9E3]">
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

            {/* Xem trước ô vuông trực tiếp */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#6B5560] block mb-1.5 uppercase tracking-wider">
                Xem trước ô vuông hiển thị
              </span>
              <div className="flex justify-center p-3 rounded-[10px] bg-[#FFF6F9] border border-dashed border-[#F3D9E3]">
                <div
                  style={{
                    backgroundColor: currentTheme.bg,
                    borderColor: currentTheme.border,
                  }}
                  className="w-[180px] h-[180px] rounded-[16px] border p-4 flex flex-col justify-between shadow-card transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-2xs">
                    <BookOpen
                      className="w-4 h-4"
                      style={{ color: currentTheme.text }}
                      strokeWidth={1.75}
                    />
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className="font-playfair text-[24px] font-bold leading-tight block truncate"
                        style={{ color: currentTheme.text }}
                      >
                        {name || 'Tên lớp'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-nunito text-[12px] text-[#3B2A35] font-semibold">
                        <Users className="w-3.5 h-3.5 text-[#3B2A35]" strokeWidth={1.75} />
                        <span>{initialData?.totalStudents ?? 0} học sinh</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs text-[#3B2A35] flex-shrink-0">
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
              disabled={isSubmitting}
              onClick={onClose}
              className="h-[44px] px-5 rounded-[10px] text-[#6B5560] border-[#F3D9E3] hover:bg-slate-50 text-[14px] cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[44px] px-6 rounded-[10px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white font-bold text-[14px] shadow-xs active:scale-95 gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Thêm lớp học'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
