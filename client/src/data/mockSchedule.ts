import type { ScheduleEntry } from '../types/schedule';

export const MOCK_SCHEDULE: ScheduleEntry[] = [
  { id: 1, time: '08:00 AM', course: 'Web Development',    level: 'Beginner',     instructor: 'Dr. John Doe',          room: 'Room 101' },
  { id: 2, time: '09:00 AM', course: 'Algorithms',          level: 'Intermediate', instructor: 'Prof. Jane Smith',      room: 'Room 102' },
  { id: 3, time: '10:00 AM', course: 'Break',               level: '-',            instructor: '-',                     room: '-' },
  { id: 4, time: '11:00 AM', course: 'Java',                level: 'Advanced',     instructor: 'Dr. Alan Turing',       room: 'Room 205' },
  { id: 5, time: '12:00 PM', course: 'Lunch Break',         level: '-',            instructor: '-',                     room: '-' },
  { id: 6, time: '01:00 PM', course: 'Python',              level: 'Beginner',     instructor: 'Dr. Guido Rossum',      room: 'Room 303' },
  { id: 7, time: '02:00 PM', course: 'Collaborative Dev',   level: 'Intermediate', instructor: 'Prof. Linus Torvalds',  room: 'Room 404' },
  { id: 8, time: '03:00 PM', course: 'React Fundamentals',  level: 'Beginner',     instructor: 'Prof. Sunita Sharma',   room: 'Room 201' },
  { id: 9, time: '04:00 PM', course: 'Database Systems',    level: 'Advanced',     instructor: 'Prof. Suresh Pillai',   room: 'Room 305' },
];
