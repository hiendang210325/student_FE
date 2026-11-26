export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LeaveFilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequestItem {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string | null;
  className: string;
  leaveDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  teacherNote: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpcomingClassSession {
  date: string; // YYYY-MM-DD
  weekdayLabel: string;
  timeRange: string;
}

export interface MyLeaveRequestsResponse {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
    classes: string[];
  } | null;
  upcomingSessionsByClass: Record<string, UpcomingClassSession[]>;
  items: LeaveRequestItem[];
  counts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface AdminLeaveRequestsResponse {
  items: LeaveRequestItem[];
  globalPendingCount: number;
  counts: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
