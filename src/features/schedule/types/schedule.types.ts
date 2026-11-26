export type WeekdayCode = 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN';

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  roomNumber?: string;
  weekdays: WeekdayCode[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  isActive: boolean;
  bgColor: string;
  textColor: string;
  cancelledDates: string[];
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSchedulePayload {
  classId: string;
  weekdays: WeekdayCode[];
  startTime: string;
  endTime: string;
  startDate: string;
  bgColor?: string;
  textColor?: string;
  note?: string;
}

export type UpdateSchedulePayload = Partial<CreateSchedulePayload>;
