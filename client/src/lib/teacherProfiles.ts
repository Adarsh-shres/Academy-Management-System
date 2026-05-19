import type { Teacher, TeacherStatus } from '../types/teacher';

export interface TeacherProfileRow {
  teacher_id: string;
  subject: string | null;
  department: string | null;
  status: string | null;
}

export const TEACHER_PROFILE_SELECT = 'teacher_id, subject, department, status';

const VALID_STATUSES: TeacherStatus[] = ['Active', 'On Leave', 'Inactive'];

export function normalizeTeacherStatus(value: string | null | undefined): TeacherStatus {
  return VALID_STATUSES.includes(value as TeacherStatus) ? (value as TeacherStatus) : 'Active';
}

export function buildTeacherProfileUpsert(teacher: Pick<Teacher, 'id' | 'subject' | 'department' | 'status'>) {
  return {
    teacher_id: teacher.id,
    subject: teacher.subject?.trim() || 'Not assigned yet',
    department: teacher.department?.trim() || 'Not set',
    status: teacher.status || 'Active',
  };
}
