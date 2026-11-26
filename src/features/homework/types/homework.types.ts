export type HomeworkFileType = 'PDF' | 'DOCX' | 'XLSX' | 'IMAGE';

export type AssignmentStatus = 'not_submitted' | 'pending' | 'graded';

export interface HomeworkAttachment {
  id: string;
  originalName: string;
  storedName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  fileType: HomeworkFileType;
}

export interface SubmissionPhoto {
  id: string;
  originalName: string;
  storedName: string;
  url: string;
  sizeBytes: number;
}

export interface HomeworkAdminItem {
  id: string;
  title: string;
  classId: string;
  className: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  dueAt: string;
  instructions: string;
  attachments: HomeworkAttachment[];
  assignedByName: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminHomeworkListResponse {
  items: HomeworkAdminItem[];
  totalAllHomeworks: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GradingStudentItem {
  studentId: string;
  studentCode: string;
  fullName: string;
  initials: string;
  status: AssignmentStatus;
  isLate: boolean;
  submittedAt: string | null;
  photos: SubmissionPhoto[];
  score: number | null;
  comment: string;
  gradedAt: string | null;
  gradedByName: string | null;
}

export interface HomeworkGradingDetail {
  homework: {
    id: string;
    title: string;
    classId: string;
    className: string;
    dueDate: string;
    dueTime: string;
    dueAt: string;
    instructions: string;
    attachments: HomeworkAttachment[];
    assignedByName: string;
    createdAt: string;
  };
  students: GradingStudentItem[];
  summary: {
    totalStudents: number;
    submittedCount: number;
    gradedCount: number;
    pendingCount: number;
    notSubmittedCount: number;
  };
}

export interface StudentSubmissionDetail {
  id: string;
  photos: SubmissionPhoto[];
  status: 'pending' | 'graded';
  isLate: boolean;
  submittedAt: string;
  score: number | null;
  comment: string;
  gradedAt: string | null;
  gradedByName: string | null;
}

export interface StudentHomeworkItem {
  id: string;
  title: string;
  classId: string;
  className: string;
  dueDate: string;
  dueTime: string;
  dueAt: string;
  instructions: string;
  attachments: HomeworkAttachment[];
  assignedByName: string;
  createdAt: string;
  status: AssignmentStatus;
  submission: StudentSubmissionDetail | null;
}

export interface MyHomeworksResponse {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
    classes: string[];
  } | null;
  items: StudentHomeworkItem[];
}
