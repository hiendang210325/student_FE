export type NotificationCategory = 'SCHEDULE' | 'TUITION' | 'DOCUMENT' | 'GENERAL';
export type NotificationSource = 'AUTO' | 'MANUAL';
export type HistoryFilter = 'ALL' | 'MANUAL' | 'AUTO';
export type StudentNotifFilter = 'ALL' | 'UNREAD' | 'SCHEDULE' | 'TUITION' | 'OTHER';
export type ComposeType = 'GENERAL' | 'SCHEDULE' | 'TUITION';

export interface NotificationRelatedItem {
  label: string;
  value: string;
  isStatusBadge?: boolean;
  statusText?: string;
  statusTone?: 'pink' | 'blue';
}

export interface AdminNotificationItem {
  id: string;
  category: NotificationCategory;
  typeChipLabel: string;
  source: NotificationSource;
  title: string;
  preview: string;
  body: string;
  senderName: string;
  recipientsSummary: string;
  targetClasses: string[];
  readCount: number;
  totalCount: number;
  emailSentCount: number;
  createdAt: string;
}

export interface NotificationReminderSettings {
  scheduleReminderOn: boolean;
  scheduleSendTime: string;
  nextScheduleSummary: string;
  tuitionReminderOn: boolean;
  tuitionSendTime: string;
  tuitionMonthlyDay: number;
  tuitionRepeatDays: number;
  unpaidInvoiceCount: number;
  nextTuitionSummary: string;
}

export interface AdminNotificationsResponse {
  items: AdminNotificationItem[];
  counts: {
    ALL: number;
    MANUAL: number;
    AUTO: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  settings: NotificationReminderSettings;
}

export interface NotificationRecipientBrief {
  id: string;
  studentCode: string;
  fullName: string;
  className: string;
}

export interface AdminNotificationDetailResponse {
  notification: AdminNotificationItem;
  readStudents: NotificationRecipientBrief[];
  unreadStudents: NotificationRecipientBrief[];
}

export interface StudentNotificationItem {
  id: string;
  category: NotificationCategory;
  typeChipLabel: string;
  source: NotificationSource;
  title: string;
  preview: string;
  body: string;
  senderName: string;
  unread: boolean;
  relatedBoxTitle: string;
  relatedItems: NotificationRelatedItem[];
  primaryCtaLabel: string;
  targetPath: string;
  createdAt: string;
}

export interface MyNotificationsResponse {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
  } | null;
  unreadCount: number;
  counts: {
    ALL: number;
    UNREAD: number;
    SCHEDULE: number;
    TUITION: number;
    OTHER: number;
  };
  items: StudentNotificationItem[];
}
