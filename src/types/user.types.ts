import { BaseEntity } from './common.types';
import { AppRole } from '@/config/constants';

export interface User extends BaseEntity {
  username: string;
  email: string;
  fullName: string;
  role: AppRole;
  avatarUrl?: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

