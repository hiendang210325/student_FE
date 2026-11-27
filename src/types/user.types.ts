import { BaseEntity } from './common.types';
import { AppRole } from '@/config/constants';

export interface User extends BaseEntity {
  username: string;
  email: string;
  fullName: string;
  role: AppRole;
  avatarUrl?: string;
  phoneNumber?: string;
  title?: string;
  bio?: string;
  address?: string;
  isActive: boolean;
  studentCode?: string | null;
  status?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string | number;
}

