import { User, AuthTokens } from '@/types/user.types';

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

