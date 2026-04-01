export type Gender = 'Male' | 'Female';
export type Department = 'CSE' | 'IT' | 'ECE' | 'Civil' | 'Mech';

export interface Student {
  id?: string;
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
