export interface AccountRecord {
  id: string;
  username: string;
  studentCode: string | null;
  fullName: string;
  email: string;
  phoneNumber?: string;
  classes: string[];
  className?: string;
  role: 'admin' | 'user' | string;
  status: 'active' | 'locked' | 'banned' | string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface AccountStats {
  total: number;
  active: number;
  locked: number;
  unverified: number;
  trash?: number;
  classes?: string[];
}

export interface AccountListResponseData {
  items: AccountRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: AccountStats;
}

export interface CreateAccountPayload {
  fullName: string;
  studentCode: string;
  email?: string;
  password: string;
  phoneNumber?: string;
  className?: string;
  sendEmail?: boolean;
}

export interface CreateAccountResponseData {
  user: {
    id: string;
    username: string;
    email?: string;
    studentCode?: string;
    fullName: string;
    role: string;
    status: string;
    createdAt: string;
  };
  temporaryPassword?: string;
  emailSent?: boolean;
}

export interface ResetPasswordPayload {
  newPassword?: string;
  sendEmail?: boolean;
}

export interface ResetPasswordResponseData {
  temporaryPassword: string;
  emailSent?: boolean;
}
