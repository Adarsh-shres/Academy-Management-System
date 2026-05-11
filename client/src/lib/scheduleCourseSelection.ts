export interface ScheduleCourseSource {
  course_id?: string | null;
}

export interface ClassCourseSource {
  course_id?: string | null;
  batchCourseIds?: string[];
}

export function getScheduleCourseId(schedule: ScheduleCourseSource, courseClass: ClassCourseSource) {
  return schedule.course_id || courseClass.course_id || courseClass.batchCourseIds?.[0] || '';
}
