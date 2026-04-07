export type CourseStatus = 'Active' | 'Inactive';

export interface Course {
  id: string;
  name: string;
  status: CourseStatus;
  department: string;
  facultyLead: string;
  description: string;
  scheduleDays: string[];
}
