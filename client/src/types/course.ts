export type CourseStatus = 'Active' | 'Inactive';

/* Row shape as stored in Supabase (snake_case) */
export interface CourseRow {
  id: string;
  course_code: string;
  name: string;
  status: CourseStatus;
  department: string;
  faculty_lead: string;
  description: string;
  created_at: string;
}

/* App-side shape (camelCase) used by components */
export interface Course {
  id: string;
  courseCode: string;
  name: string;
  status: CourseStatus;
  department: string;
  facultyLead: string;
  description: string;
  createdAt: string;
}

/* Helpers to convert between the two shapes */
export function rowToCourse(row: CourseRow): Course {
  return {
    id: row.id,
    courseCode: row.course_code,
    name: row.name,
    status: row.status as CourseStatus,
    department: row.department,
    facultyLead: row.faculty_lead,
    description: row.description,
    createdAt: row.created_at,
  };
}

export function courseToRow(
  course: Partial<Course>,
): Partial<CourseRow> {
  const row: Partial<CourseRow> = {};
  if (course.courseCode !== undefined) row.course_code = course.courseCode;
  if (course.name !== undefined) row.name = course.name;
  if (course.status !== undefined) row.status = course.status;
  if (course.department !== undefined) row.department = course.department;
  if (course.facultyLead !== undefined) row.faculty_lead = course.facultyLead;
  if (course.description !== undefined) row.description = course.description;
  return row;
}
