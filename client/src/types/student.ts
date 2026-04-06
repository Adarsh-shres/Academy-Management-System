export type Gender = 'Male' | 'Female';
export type Department = 'CSE' | 'IT' | 'ECE' | 'Civil' | 'Mech';

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
  course: string;
  city: string;
  address: string;
  photo?: File | null;
}

/** Full student record stored in context (post-registration) */
export interface StudentRecord extends Omit<StudentFormData, 'photo'> {
  id: string;
  isActive: boolean;
  dateEnrolled: string;
}

/**
 * @deprecated Use StudentFormData for forms, StudentRecord for stored data.
 * Kept for backwards compat with imports that reference `Student`.
 */
export type Student = StudentFormData;
