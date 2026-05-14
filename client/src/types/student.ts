export type Gender = 'Male' | 'Female';
export type Department = '' | 'CSE' | 'IT' | 'ECE' | 'Civil' | 'Mech';
export const STUDENT_SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
] as const;
export type Semester = '' | (typeof STUDENT_SEMESTERS)[number];

/** Shape used by the registration form (input-only, no id yet) */
export interface StudentFormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  dateOfBirth: string;
  mobileNo: string;
  email: string;
  password: string;
  gender: Gender;
  department: Department;
  semester: Semester;
  city: string;
  address: string;
  photo?: File | null;
}

/** Full student record stored in context (post-registration) */
export interface StudentRecord extends Omit<StudentFormData, 'photo'> {
  id: string;
  course: string;
  isActive: boolean;
  dateEnrolled: string;
}

/**
 * @deprecated Use StudentFormData for forms, StudentRecord for stored data.
 * Kept for backwards compat with imports that reference `Student`.
 */
export type Student = StudentFormData;
