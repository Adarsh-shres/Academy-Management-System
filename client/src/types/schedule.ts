export type ScheduleLevel = 'Beginner' | 'Intermediate' | 'Advanced' | '-';

export interface ScheduleEntry {
  id: number;
  time: string;
  course: string;
  level: string;
  instructor: string;
  room: string;
}
