export interface TeacherScheduleItem {
  day: string;
  time: string;
  course: string;
  room: string;
}

export interface TeacherActivityItem {
  id: number;
  text: string;
  time: string;
  icon: string;
}

export type TeacherStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  subject: string;
  department: string;
  employeeId: string;
  status: TeacherStatus;
  avatarGradient: string;
  totalClasses: number;
  totalStudents: number;
  avgAttendance: number;
  upcomingSessions: number;
  schedule: TeacherScheduleItem[];
  activities: TeacherActivityItem[];
}
