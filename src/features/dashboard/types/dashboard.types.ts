export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  averageScore: number;
  recentActivities: {
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }[];
}

