import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  User as UserIcon,
  Briefcase,
  AtSign,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/features/auth/api/authApi';
import { UserSession } from '@/features/auth/types/auth.types';
import { getFileViewUrl } from '@/features/homework/api/homeworkApi';

interface ProfileFormValues {
  fullName: string;
  title: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  bio: string;
}

const formatDateTimeVN = (iso?: string | Date | null): string => {
  if (!iso) return 'Chưa ghi nhận';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Chưa ghi nhận';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${hh}:${mm}, ${dd}/${mo}/${yyyy}`;
};

const formatDateOnlyVN = (iso?: string | Date | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mo}/${yyyy}`;
};

const getInitials = (fullName?: string): string => {
  const parts = String(fullName || 'Chị Vân')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return String(fullName || 'CV')
    .slice(0, 2)
    .toUpperCase();
};

const formatSessionDeviceLabel = (session: UserSession): string => {
  const info: unknown = session.deviceInfo;
  if (typeof info === 'string' && info.trim()) {
    return info.trim();
  }
  if (info && typeof info === 'object') {
    const obj = info as { browser?: string; os?: string; device?: string };
    const parts = [obj.browser, obj.os, obj.device].filter(Boolean);
    if (parts.length > 0) return parts.join(' · ');
  }
  return 'Trình duyệt web';
};

const isMobileSession = (session: UserSession): boolean => {
  const label = formatSessionDeviceLabel(session).toLowerCase();
  return (
    label.includes('iphone') ||
    label.includes('android') ||
    label.includes('ipad') ||
    label.includes('mobile')
  );
};

export const AdminProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // ==================== TOAST THÔNG BÁO ====================
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 3400);
    },
    []
  );

  // ==================== STATE HỒ SƠ & ẢNH ĐẠI DIỆN ====================
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [initialForm, setInitialForm] = useState<ProfileFormValues>({
    fullName: user?.fullName || '',
    title: user?.title || 'Giáo viên phụ trách',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    bio: user?.bio || '',
  });
  const [form, setForm] = useState<ProfileFormValues>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>>
  >({});

  const [serverAvatarUrl, setServerAvatarUrl] = useState<string>(
    user?.avatarUrl || ''
  );
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>('');
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // ==================== STATE ĐỔI MẬT KHẨU ====================
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [showConfirmPw, setShowConfirmPw] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // ==================== STATE PHIÊN ĐĂNG NHẬP ====================
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Đồng bộ dữ liệu mới nhất từ /api/auth/me và /api/auth/sessions
  const loadFreshProfileAndSessions = useCallback(async () => {
    setIsLoadingProfile(true);
    setIsLoadingSessions(true);
    try {
      const [meRes, sessRes] = await Promise.all([
        authApi.getCurrentUser(),
        authApi.getActiveSessions().catch(() => null),
      ]);

      if (meRes?.data) {
        const fresh = meRes.data;
        updateUser(fresh);
        const mapped: ProfileFormValues = {
          fullName: fresh.fullName || '',
          title: fresh.title || 'Giáo viên phụ trách',
          username: fresh.username || '',
          email: fresh.email || '',
          phoneNumber: fresh.phoneNumber || '',
          address: fresh.address || '',
          bio: fresh.bio || '',
        };
        setInitialForm(mapped);
        setForm(mapped);
        setServerAvatarUrl(fresh.avatarUrl || '');
      }

      if (sessRes?.data) {
        setSessions(sessRes.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải thông tin tài khoản.', 'error');
    } finally {
      setIsLoadingProfile(false);
      setIsLoadingSessions(false);
    }
  }, [updateUser, showToast]);

  useEffect(() => {
    loadFreshProfileAndSessions();
  }, [loadFreshProfileAndSessions]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  // Kiểm tra xem người dùng đã thay đổi dữ liệu nào chưa
  const isProfileDirty = useMemo(() => {
    if (selectedAvatarFile || removeAvatarFlag) return true;
    return (
      form.fullName.trim() !== initialForm.fullName.trim() ||
      form.title.trim() !== initialForm.title.trim() ||
      form.username.trim().toLowerCase() !== initialForm.username.trim().toLowerCase() ||
      form.email.trim().toLowerCase() !== initialForm.email.trim().toLowerCase() ||
      form.phoneNumber.trim() !== initialForm.phoneNumber.trim() ||
      form.address.trim() !== initialForm.address.trim() ||
      form.bio.trim() !== initialForm.bio.trim()
    );
  }, [form, initialForm, selectedAvatarFile, removeAvatarFlag]);

  // Chọn ảnh đại diện mới
  const handleSelectAvatar = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG hoặc WEBP).', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Dung lượng ảnh đại diện tối đa là 5 MB.', 'error');
      return;
    }
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatarFlag(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl('');
    if (serverAvatarUrl) {
      setRemoveAvatarFlag(true);
    }
  };

  const handleResetProfileChanges = () => {
    setForm(initialForm);
    setFieldErrors({});
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl('');
    setRemoveAvatarFlag(false);
  };

  // Kiểm tra hợp lệ từng trường trước khi gửi
  const validateProfileForm = (): boolean => {
    const nextErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Họ và tên cần ít nhất 2 ký tự.';
    }
    const cleanUser = form.username.trim().toLowerCase();
    if (cleanUser.length < 3) {
      nextErrors.username = 'Tên đăng nhập cần tối thiểu 3 ký tự.';
    } else if (!/^[a-z0-9._-]+$/.test(cleanUser)) {
      nextErrors.username =
        'Chỉ dùng chữ thường không dấu, chữ số, dấu chấm, gạch ngang hoặc gạch dưới.';
    }
    const cleanMail = form.email.trim();
    if (cleanMail && !/^\S+@\S+\.\S+$/.test(cleanMail)) {
      nextErrors.email = 'Địa chỉ Email chưa đúng định dạng.';
    }
    const cleanPhone = form.phoneNumber.trim();
    if (cleanPhone && !/^[0-9+\s.-]{8,15}$/.test(cleanPhone)) {
      nextErrors.phoneNumber = 'Số điện thoại cần từ 8 đến 15 chữ số.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setIsSavingProfile(true);
    try {
      const res = await authApi.updateProfile({
        fullName: form.fullName.trim(),
        title: form.title.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
        bio: form.bio.trim(),
        avatarFile: selectedAvatarFile,
        removeAvatar: removeAvatarFlag,
      });

      if (res.data) {
        updateUser(res.data);
        const synced: ProfileFormValues = {
          fullName: res.data.fullName || '',
          title: res.data.title || 'Giáo viên phụ trách',
          username: res.data.username || '',
          email: res.data.email || '',
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || '',
          bio: res.data.bio || '',
        };
        setInitialForm(synced);
        setForm(synced);
        setServerAvatarUrl(res.data.avatarUrl || '');
        if (avatarPreviewUrl) {
          URL.revokeObjectURL(avatarPreviewUrl);
        }
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl('');
        setRemoveAvatarFlag(false);
        setFieldErrors({});
      }

      showToast(res.message || 'Đã lưu cập nhật thông tin quản trị viên!');
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu cập nhật thông tin.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Kiểm tra các quy tắc độ mạnh mật khẩu mới
  const passwordChecks = useMemo(
    () => [
      { label: 'Ít nhất 8 ký tự', valid: newPassword.length >= 8 },
      { label: 'Chữ cái in hoa (A–Z)', valid: /[A-Z]/.test(newPassword) },
      { label: 'Chữ cái thường (a–z)', valid: /[a-z]/.test(newPassword) },
      { label: 'Ít nhất 1 chữ số (0–9)', valid: /[0-9]/.test(newPassword) },
      {
        label: 'Ký tự đặc biệt (!@#$...)',
        valid: /[^A-Za-z0-9]/.test(newPassword),
      },
    ],
    [newPassword]
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    const allValid = passwordChecks.every((c) => c.valid);
    if (!allValid) {
      setPasswordError('Mật khẩu mới chưa đáp ứng đủ 5 tiêu chí bảo mật bên dưới.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('Mật khẩu mới cần khác với mật khẩu đang dùng.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message || 'Đã cập nhật mật khẩu mới thành công!');

      // Làm mới danh sách thiết bị vì các phiên khác vừa được thu hồi
      const sessRes = await authApi.getActiveSessions().catch(() => null);
      if (sessRes?.data) {
        setSessions(sessRes.data);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await authApi.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast('Đã đăng xuất thiết bị được chọn.');
    } catch (err: any) {
      showToast(err?.message || 'Không thể thu hồi phiên đăng nhập.', 'error');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const activeAvatarDisplay = avatarPreviewUrl
    ? avatarPreviewUrl
    : !removeAvatarFlag && serverAvatarUrl
    ? getFileViewUrl(serverAvatarUrl)
    : '';

  return (
    <div className="w-full flex justify-center bg-[#FFF6F9] min-h-[100dvh] font-nunito text-[#3B2A35]">
      {/* Toast phản hồi sau thao tác thật */}
      {toast && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-2.5 rounded-[12px] shadow-lg text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-[#B02525] text-white'
              : 'bg-[#3B2A35] text-white'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#FFE3E3] flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#CFE8FF] flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Khung căn đều lề trái/phải chuẩn 1136px */}
      <div className="w-full max-w-[1200px] p-0 lg:p-8 flex flex-col gap-5 box-border">
        {/* ==================== TIÊU ĐỀ TRANG ==================== */}
        <header className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-playfair text-[26px] lg:text-[30px] font-bold text-[#3B2A35] leading-tight">
                Thông tin quản trị viên
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#DCEBFA] text-[#1F4E79] text-[12px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Tài khoản Giáo viên · Admin</span>
              </span>
            </div>
            <p className="text-[14px] font-medium text-[#6B5560] mt-1">
              Quản lý hồ sơ giảng dạy, thông tin liên hệ nhận mã xác thực và bảo mật tài khoản
            </p>
          </div>

          <div className="text-[12px] font-semibold text-[#6B5560] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#2F6FA8]" />
            <span>Đăng nhập gần nhất: {formatDateTimeVN(user?.lastLoginAt)}</span>
          </div>
        </header>

        {isLoadingProfile ? (
          <div className="w-full min-h-[420px] bg-white border border-[#F3D9E3] rounded-[18px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2F6FA8] animate-spin" />
            <span className="text-[14px] font-semibold text-[#6B5560]">
              Đang tải hồ sơ quản trị viên...
            </span>
          </div>
        ) : (
          <>
            {/* ==================== THẺ ĐỊNH DANH & ẢNH ĐẠI DIỆN ==================== */}
            <section className="w-full bg-white border border-[#F3D9E3] rounded-[18px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(59,42,53,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
                {/* Khung ảnh đại diện 96x96px */}
                <div className="relative w-[96px] h-[96px] rounded-[20px] border-2 border-[#F3D9E3] bg-[#FFE4EE] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {activeAvatarDisplay ? (
                    <img
                      src={activeAvatarDisplay}
                      alt={`Ảnh đại diện của ${form.fullName || 'Quản trị viên'}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-playfair text-[34px] font-bold text-[#A61E4D] select-none">
                      {getInitials(form.fullName)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-playfair text-[24px] font-bold text-[#3B2A35] leading-tight truncate">
                      {form.fullName || 'Chị Vân'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFF0F6] border border-[#F8A5C2]/60 text-[#A61E4D] text-[12px] font-bold">
                      {form.title || 'Giáo viên phụ trách'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-semibold text-[#6B5560]">
                    <span className="inline-flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-[#2F6FA8]" />
                      <span>{form.username}</span>
                    </span>
                    {form.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#2F6FA8]" />
                        <span>{form.email}</span>
                      </span>
                    )}
                    {form.phoneNumber && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2F6FA8]" />
                        <span>{form.phoneNumber}</span>
                      </span>
                    )}
                    {user?.createdAt && (
                      <span>Tham gia từ {formatDateOnlyVN(user.createdAt)}</span>
                    )}
                  </div>

                  {form.bio && (
                    <p className="text-[13px] text-[#3B2A35] max-w-[640px] line-clamp-2 pt-0.5">
                      {form.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Cụm nút đổi / gỡ ảnh đại diện (chiều cao >= 44px chuẩn chạm) */}
              <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleSelectAvatar(e.target.files);
                    e.target.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="h-[44px] px-4 rounded-[12px] border border-[#2F6FA8] bg-[#E9F3FF] hover:bg-[#DCEBFA] text-[#1F4E79] text-[13px] font-bold inline-flex items-center gap-2 transition-all hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
                >
                  <Camera className="w-4 h-4" strokeWidth={1.75} />
                  <span>Đổi ảnh đại diện</span>
                </button>

                {activeAvatarDisplay && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="h-[44px] px-3.5 rounded-[12px] border border-[#F3D9E3] bg-white hover:bg-[#FFE3E3] text-[#B02525] text-[13px] font-bold inline-flex items-center gap-1.5 transition-all hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    <span>Gỡ ảnh</span>
                  </button>
                )}
              </div>
            </section>

            {/* ==================== LƯỚI 12 CỘT: HỒ SƠ BÊN TRÁI (7) & BẢO MẬT BÊN PHẢI (5) ==================== */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* CỘT TRÁI: BIỂU MẪU CHỈNH SỬA THÔNG TIN CÁ NHÂN & LỚP DẠY */}
              <form
                onSubmit={handleSaveProfile}
                className="lg:col-span-7 bg-white border border-[#F3D9E3] rounded-[18px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(59,42,53,0.05)] flex flex-col justify-between gap-5"
              >
                <div className="border-b border-[#F3D9E3] pb-3.5">
                  <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35]">
                    Chỉnh sửa hồ sơ &amp; liên hệ
                  </h2>
                  <p className="text-[13px] font-medium text-[#6B5560] mt-0.5">
                    Tên hiển thị sẽ xuất hiện trên Sidebar, thông báo giao bài tập và lời phê chấm điểm của học sinh
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div>
                    <label
                      htmlFor="profile-fullname"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Họ và tên hiển thị <span className="text-[#D6336C]">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-fullname"
                        type="text"
                        value={form.fullName}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, fullName: e.target.value }));
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        placeholder="VD: Nguyễn Thị Vân"
                        className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-[12px] font-semibold text-[#B02525] mt-1">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Chức danh */}
                  <div>
                    <label
                      htmlFor="profile-title"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Chức danh / Vai trò giảng dạy
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-title"
                        type="text"
                        maxLength={100}
                        value={form.title}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="VD: Giáo viên Ngữ Văn"
                        className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                    </div>
                  </div>

                  {/* Tên đăng nhập */}
                  <div>
                    <label
                      htmlFor="profile-username"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Tên đăng nhập <span className="text-[#D6336C]">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-username"
                        type="text"
                        value={form.username}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, username: e.target.value }));
                          if (fieldErrors.username) {
                            setFieldErrors((prev) => ({ ...prev, username: undefined }));
                          }
                        }}
                        placeholder="admin"
                        className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-[12px] font-semibold text-[#B02525] mt-1">
                        {fieldErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Số điện thoại liên hệ
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-phone"
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, phoneNumber: e.target.value }));
                          if (fieldErrors.phoneNumber) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              phoneNumber: undefined,
                            }));
                          }
                        }}
                        placeholder="VD: 0912 345 678"
                        className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-[12px] font-semibold text-[#B02525] mt-1">
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Địa chỉ Email */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="profile-email"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Địa chỉ Email quản trị (nhận OTP khôi phục mật khẩu)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, email: e.target.value }));
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="VD: chivan.nguvan@gmail.com"
                        className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[12px] font-semibold text-[#B02525] mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Địa chỉ lớp học */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="profile-address"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Cơ sở / Khu vực lớp học
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#6B5560] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-address"
                        type="text"
                        maxLength={200}
                        value={form.address}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="VD: Lớp Văn chị Vân — Quận Cầu Giấy, Hà Nội"
                        className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                    </div>
                  </div>

                  {/* Giới thiệu ngắn */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="profile-bio"
                        className="text-[13px] font-bold text-[#3B2A35]"
                      >
                        Giới thiệu ngắn / Ghi chú giảng dạy
                      </label>
                      <span className="text-[12px] font-semibold text-[#6B5560]">
                        {form.bio.length}/400
                      </span>
                    </div>
                    <textarea
                      id="profile-bio"
                      rows={3}
                      maxLength={400}
                      value={form.bio}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      placeholder="VD: Chuyên bồi dưỡng Ngữ Văn THCS & THPT, rèn tư duy đọc hiểu và viết văn nghị luận sâu sắc."
                      className="w-full p-3.5 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-medium text-[#3B2A35] leading-relaxed outline-none focus:border-2 focus:border-[#2F6FA8] resize-none"
                    />
                  </div>
                </div>

                {/* Thanh hành động lưu thay đổi */}
                <div className="pt-4 border-t border-[#F3D9E3] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#6B5560]">
                    {isProfileDirty
                      ? 'Bạn đang có thay đổi chưa lưu'
                      : 'Thông tin đang đồng bộ mới nhất'}
                  </span>

                  <div className="flex items-center gap-2.5 ml-auto">
                    {isProfileDirty && (
                      <button
                        type="button"
                        disabled={isSavingProfile}
                        onClick={handleResetProfileChanges}
                        className="h-[46px] px-4 rounded-[12px] border border-[#F3D9E3] bg-[#FFF6F9] hover:bg-[#EFE9ED] text-[#3B2A35] text-[13px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Khôi phục</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={!isProfileDirty || isSavingProfile}
                      className="h-[46px] px-6 rounded-[12px] bg-[#D6336C] hover:bg-[#be265d] text-white text-[14px] font-bold inline-flex items-center gap-2 shadow-xs transition-all hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" strokeWidth={1.75} />
                      )}
                      <span>Lưu thông tin</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* CỘT PHẢI: ĐỔI MẬT KHẨU & PHIÊN ĐĂNG NHẬP */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* THẺ 1: ĐỔI MẬT KHẨU */}
                <form
                  onSubmit={handleChangePassword}
                  className="bg-white border border-[#F3D9E3] rounded-[18px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(59,42,53,0.05)] flex flex-col gap-4"
                >
                  <div className="border-b border-[#F3D9E3] pb-3">
                    <h2 className="font-playfair text-[20px] font-bold text-[#3B2A35] flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#A61E4D]" strokeWidth={1.75} />
                      <span>Đổi mật khẩu</span>
                    </h2>
                    <p className="text-[13px] text-[#6B5560] mt-0.5">
                      Khi đổi mật khẩu, các thiết bị khác sẽ tự động đăng xuất để bảo vệ tài khoản
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="pw-current"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        id="pw-current"
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu đang sử dụng"
                        className="w-full h-[46px] pl-3.5 pr-11 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        aria-label="Hiện hoặc ẩn mật khẩu hiện tại"
                        className="w-9 h-9 rounded-[8px] text-[#6B5560] hover:bg-[#FFF6F9] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showCurrentPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pw-new"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="pw-new"
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự đủ chữ hoa, số, ký tự đặc biệt"
                        className="w-full h-[46px] pl-3.5 pr-11 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        aria-label="Hiện hoặc ẩn mật khẩu mới"
                        className="w-9 h-9 rounded-[8px] text-[#6B5560] hover:bg-[#FFF6F9] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showNewPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Danh sách kiểm tra độ mạnh mật khẩu trực quan */}
                    {newPassword.length > 0 && (
                      <div className="mt-2.5 p-3 rounded-[12px] bg-[#FFF9FB] border border-[#F3D9E3] grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {passwordChecks.map((rule) => (
                          <div
                            key={rule.label}
                            className={`text-[12px] font-semibold flex items-center gap-1.5 ${
                              rule.valid ? 'text-[#1F4E79]' : 'text-[#6B5560]'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                rule.valid
                                  ? 'bg-[#DCEBFA] text-[#1F4E79]'
                                  : 'bg-[#EFE9ED] text-[#6B5560]'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                            </span>
                            <span>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="pw-confirm"
                      className="block text-[13px] font-bold text-[#3B2A35] mb-1.5"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="pw-confirm"
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full h-[46px] pl-3.5 pr-11 rounded-[12px] border border-[#9C6B84] bg-white text-[14px] font-semibold text-[#3B2A35] outline-none focus:border-2 focus:border-[#2F6FA8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        aria-label="Hiện hoặc ẩn mật khẩu xác nhận"
                        className="w-9 h-9 rounded-[8px] text-[#6B5560] hover:bg-[#FFF6F9] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showConfirmPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-3 rounded-[10px] bg-[#FFE3E3] text-[#B02525] text-[12px] font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="h-[46px] w-full rounded-[12px] bg-[#2F6FA8] hover:bg-[#1F4E79] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isChangingPassword && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>Cập nhật mật khẩu mới</span>
                  </button>
                </form>

                {/* THẺ 2: THIẾT BỊ ĐANG ĐĂNG NHẬP */}
                <section className="bg-white border border-[#F3D9E3] rounded-[18px] p-5 lg:p-6 shadow-[0_1px_2px_rgba(59,42,53,0.05)] flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-[#F3D9E3] pb-3">
                    <div>
                      <h2 className="font-playfair text-[19px] font-bold text-[#3B2A35]">
                        Thiết bị đang đăng nhập
                      </h2>
                      <p className="text-[12px] text-[#6B5560] mt-0.5">
                        Kiểm soát các trình duyệt đang có quyền truy cập quản trị
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-[8px] bg-[#E9F3FF] text-[#1F4E79] text-[12px] font-bold">
                      {sessions.length} phiên
                    </span>
                  </div>

                  {isLoadingSessions ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="w-5 h-5 text-[#2F6FA8] animate-spin" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-[13px] text-[#6B5560] py-2">
                      Hiện chỉ có phiên làm việc trực tiếp này đang hoạt động.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#F3D9E3] max-h-[240px] overflow-y-auto">
                      {sessions.map((sess) => {
                        const mobile = isMobileSession(sess);
                        return (
                          <div
                            key={sess.id}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-[10px] bg-[#E9F3FF] text-[#1F4E79] flex items-center justify-center flex-shrink-0">
                                {mobile ? (
                                  <Smartphone className="w-4 h-4" />
                                ) : (
                                  <Laptop className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[13px] font-bold text-[#3B2A35] truncate">
                                    {formatSessionDeviceLabel(sess)}
                                  </span>
                                  {sess.isCurrent && (
                                    <span className="px-2 py-0.5 rounded-[6px] bg-[#DCEBFA] text-[#1F4E79] text-[10px] font-bold">
                                      Thiết bị này
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-medium text-[#6B5560] truncate">
                                  {sess.ipAddress ? `IP ${sess.ipAddress} · ` : ''}
                                  Hoạt động {formatDateTimeVN(sess.lastUsedAt || sess.createdAt)}
                                </div>
                              </div>
                            </div>

                            {!sess.isCurrent && (
                              <button
                                type="button"
                                disabled={revokingSessionId === sess.id}
                                onClick={() => handleRevokeSession(sess.id)}
                                title="Đăng xuất thiết bị này"
                                className="h-[36px] px-3 rounded-[9px] border border-[#F3D9E3] bg-white hover:bg-[#FFE3E3] text-[#B02525] text-[12px] font-bold inline-flex items-center gap-1 flex-shrink-0 cursor-pointer"
                              >
                                {revokingSessionId === sess.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <LogOut className="w-3.5 h-3.5" />
                                )}
                                <span>Thu hồi</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
