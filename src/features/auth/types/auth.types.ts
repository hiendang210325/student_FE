import { User, AuthTokens } from '@/types/user.types';

export interface LoginPayload {
  identifier?: string;
  username?: string;
  email?: string;
  studentCode?: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserSession {
  id: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ipAddress?: string;
  expiresAt: string;
  isCurrent?: boolean;
  lastUsedAt?: string;
  createdAt?: string;
}

export interface LoginResponseData {
  user: User;
  tokens: AuthTokens;
  session?: UserSession;
  csrfToken?: string;
  redirectTo?: string;
}

// Giữ lại LoginResponse để tương thích ngược
export type LoginResponse = LoginResponseData;

export interface ForgotPasswordResponseData {
  sent: boolean;
  expiresInMinutes: number;
  devReset?: {
    otp: string;
    resetToken: string;
  };
}

export interface VerifyResetOtpResponseData {
  valid: boolean;
  resetToken: string;
  expiresInMinutes: number;
}

export interface ResetPasswordPayload {
  token?: string;
  email?: string;
  otp?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}
