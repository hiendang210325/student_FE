import { create } from 'zustand';
import { User } from '@/types/user.types';
import { tokenService } from '@/services/storage/tokenService';
import { authApi } from '@/features/auth/api/authApi';
import { LoginPayload } from '@/features/auth/types/auth.types';

export type AppViewRole = 'admin' | 'student';

const ROLE_STORAGE_KEY = 'lvcv_active_role_v3';

const getInitialViewRole = (): AppViewRole => {
  try {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === 'student' || saved === 'admin') {
      return saved;
    }
  } catch {
    // Bỏ qua lỗi truy cập localStorage nếu có
  }
  return 'admin';
};

const mapUserRoleToViewRole = (role?: string): AppViewRole => {
  if (!role) return 'admin';
  const clean = role.toLowerCase();
  return clean === 'admin' ? 'admin' : 'student';
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: AppViewRole;
  setActiveRole: (role: AppViewRole) => void;
  loginWithCredentials: (
    credentials: LoginPayload
  ) => Promise<{ user: User; redirectTo?: string }>;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: tokenService.getUser(),
  isAuthenticated: !!tokenService.getAccessToken(),
  isLoading: false,
  activeRole: getInitialViewRole(),

  setActiveRole: (role: AppViewRole) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch {
      // Bỏ qua lỗi lưu trữ nếu có
    }
    set({ activeRole: role });
  },

  /**
   * Đăng nhập thực tế qua Backend API
   */
  loginWithCredentials: async (credentials: LoginPayload) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(credentials);
      const { user, tokens, redirectTo } = response.data;

      // Lưu Token vào Storage
      if (tokens?.accessToken) {
        tokenService.setAccessToken(tokens.accessToken);
      }
      if (tokens?.refreshToken) {
        tokenService.setRefreshToken(tokens.refreshToken);
      }
      tokenService.setUser(user);

      // Đồng bộ vai trò người dùng vào giao diện
      const targetRole = mapUserRoleToViewRole(user.role);
      try {
        localStorage.setItem(ROLE_STORAGE_KEY, targetRole);
      } catch {
        // Bỏ qua
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        activeRole: targetRole,
      });

      return { user, redirectTo };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Phương thức đăng nhập thủ công / tương thích ngược
   */
  login: (user: User, token: string, refreshToken?: string) => {
    tokenService.setAccessToken(token);
    if (refreshToken) tokenService.setRefreshToken(refreshToken);
    tokenService.setUser(user);

    const targetRole = mapUserRoleToViewRole(user.role);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, targetRole);
    } catch {
      // Bỏ qua
    }

    set({ user, isAuthenticated: true, activeRole: targetRole });
  },

  /**
   * Đăng xuất an toàn: Gọi API xóa phiên trên server và thu hồi cookie/storage
   */
  logout: async () => {
    try {
      const refreshToken = tokenService.getRefreshToken() || undefined;
      await authApi.logout(refreshToken).catch(() => {
        // Bỏ qua nếu token đã hết hạn trên server
      });
    } finally {
      tokenService.clearAll();
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (updatedFields: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updatedFields };
    tokenService.setUser(updated);
    set({ user: updated });
  },

  /**
   * Khôi phục và đối chiếu phiên đăng nhập khi tải lại trang (F5)
   */
  checkAuth: async () => {
    const token = tokenService.getAccessToken();
    const storedUser = tokenService.getUser();

    // Nếu không có token trong localStorage (và không có cookie), xóa trạng thái
    if (!token && !storedUser) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // Tạm giữ user từ cache để tránh nhấp nháy giao diện
    if (storedUser) {
      set({ user: storedUser, isAuthenticated: true });
    }

    try {
      set({ isLoading: true });
      const response = await authApi.getCurrentUser();
      const freshUser = response.data;

      tokenService.setUser(freshUser);
      const targetRole = mapUserRoleToViewRole(freshUser.role);

      set({
        user: freshUser,
        isAuthenticated: true,
        isLoading: false,
        activeRole: targetRole,
      });
    } catch {
      // Nếu token không còn hợp lệ và làm mới thất bại
      tokenService.clearAll();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
