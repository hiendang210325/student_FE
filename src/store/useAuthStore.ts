import { create } from 'zustand';
import { User } from '@/types/user.types';
import { tokenService } from '@/services/storage/tokenService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: tokenService.getUser(),
  isAuthenticated: !!tokenService.getAccessToken(),
  isLoading: false,

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

