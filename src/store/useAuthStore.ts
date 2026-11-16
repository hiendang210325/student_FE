import { create } from 'zustand';
import { User } from '@/types/user.types';
import { tokenService } from '@/services/storage/tokenService';

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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: AppViewRole;
  setActiveRole: (role: AppViewRole) => void;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  checkAuth: () => void;
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

  login: (user: User, token: string, refreshToken?: string) => {
    tokenService.setAccessToken(token);
    if (refreshToken) tokenService.setRefreshToken(refreshToken);
    tokenService.setUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    tokenService.clearAll();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updatedFields: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updatedFields };
    tokenService.setUser(updated);
    set({ user: updated });
  },

  checkAuth: () => {
    const token = tokenService.getAccessToken();
    const user = tokenService.getUser();
    if (token && user) {
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
