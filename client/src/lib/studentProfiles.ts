import type { Department, Gender, StudentRecord } from '../types/student';

export interface SupabaseStudentUserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
}

export interface StudentProfileRow {
  student_id: string;
  father_name: string | null;
  date_of_birth: string | null;
  mobile_no: string | null;
  gender: string | null;
  department: string | null;
  course: string | null;
  city: string | null;
  address: string | null;
  is_active: boolean | null;
  date_enrolled: string | null;
}

export const STUDENT_PROFILE_SELECT =
  'student_id, father_name, date_of_birth, mobile_no, gender, department, course, city, address, is_active, date_enrolled';

const DEPARTMENTS: Department[] = ['CSE', 'IT', 'ECE', 'Civil', 'Mech'];

export function splitStudentName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { firstName: 'Unnamed', lastName: 'Student' };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ') || 'Student',
  };
}

export function formatDateValue(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  return value.includes('T') ? value.split('T')[0] : value;
}

export function normalizeStudentGender(value: string | null | undefined): Gender {
  return value === 'Female' ? 'Female' : 'Male';
}

export function normalizeStudentDepartment(value: string | null | undefined): Department {
  return DEPARTMENTS.includes(value as Department) ? (value as Department) : '';
}

export function mapStudentRecord(row: SupabaseStudentUserRow, profile?: StudentProfileRow | null): StudentRecord | null {
  if (row.role !== 'student') {
    return null;
  }

  const { firstName, lastName } = splitStudentName(row.name ?? '');

  return {
    id: row.id,
    firstName,
    lastName,
    fatherName: profile?.father_name ?? '',
    dateOfBirth: formatDateValue(profile?.date_of_birth),
    mobileNo: profile?.mobile_no ?? '',
    email: row.email ?? '',
    password: '',
    gender: normalizeStudentGender(profile?.gender),
    department: normalizeStudentDepartment(profile?.department),
    course: profile?.course ?? '',
    city: profile?.city ?? '',
    address: profile?.address ?? '',
    isActive: profile?.is_active ?? true,
    dateEnrolled: formatDateValue(profile?.date_enrolled),
  };
}

export function buildStudentProfileUpsert(student: StudentRecord) {
  return {
    student_id: student.id,
    father_name: student.fatherName.trim(),
    date_of_birth: student.dateOfBirth || null,
    mobile_no: student.mobileNo.trim(),
    gender: student.gender,
    department: student.department,
    course: student.course.trim(),
    city: student.city.trim(),
    address: student.address.trim(),
    is_active: student.isActive,
    date_enrolled: student.dateEnrolled || null,
  };
}

export function buildStudentFullName(student: Pick<StudentRecord, 'firstName' | 'lastName'>) {
  return `${student.firstName} ${student.lastName}`.trim() || 'Unnamed Student';
}

export function buildStudentAvatar(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'ST'
  );
}
