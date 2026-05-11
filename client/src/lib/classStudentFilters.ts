import type { StudentRecord } from '../types/student';

export type StudentDepartmentFilter = 'All' | 'CSE' | 'IT' | 'ECE' | 'Civil' | 'Mech';

export const CLASS_STUDENT_DEPARTMENTS: Exclude<StudentDepartmentFilter, 'All'>[] = ['CSE', 'IT', 'ECE', 'Civil', 'Mech'];

export function filterAvailableClassStudents(
  students: StudentRecord[],
  selectedStudentIds: string[],
  searchText: string,
  departmentFilter: StudentDepartmentFilter,
) {
  const search = searchText.trim().toLowerCase();
  const selectedIds = new Set(selectedStudentIds);

  return students.filter((student) => {
    if (selectedIds.has(student.id)) return false;
    if (departmentFilter !== 'All' && student.department !== departmentFilter) return false;
    if (!search) return true;

    const name = `${student.firstName} ${student.lastName}`.trim().toLowerCase();
    const email = student.email.toLowerCase();
    return name.includes(search) || email.includes(search);
  });
}
