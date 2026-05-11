export interface ScheduleTeacherSource {
  teacher_id?: string | null;
}

export interface ClassTeacherSource {
  teacher_id?: string | null;
  teacher_ids?: string[] | null;
}

export function getScheduleTeacherId(schedule: ScheduleTeacherSource, courseClass: ClassTeacherSource) {
  return schedule.teacher_id || courseClass.teacher_id || courseClass.teacher_ids?.[0] || '';
}
