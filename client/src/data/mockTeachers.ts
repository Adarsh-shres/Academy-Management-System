import type { Teacher } from '../types/teacher';

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1', name: 'Dr. Ramesh Kumar', initials: 'RK',
    subject: 'Quantum Physics & Applied Mechanics', department: 'Dept. of Physics',
    employeeId: 'FAC-00247', status: 'Active',
    avatarGradient: 'from-[#0ea5b0] to-[#006496]',
    totalClasses: 48, totalStudents: 312, avgAttendance: 91.2, upcomingSessions: 6,
    schedule: [
      { day: 'Monday',    time: '09:00 – 10:30', course: 'PHY-301 Quantum Mechanics', room: 'Hall A-12' },
      { day: 'Monday',    time: '14:00 – 15:30', course: 'PHY-205 Thermodynamics',    room: 'Lab B-04' },
      { day: 'Wednesday', time: '09:00 – 10:30', course: 'PHY-301 Quantum Mechanics', room: 'Hall A-12' },
      { day: 'Friday',    time: '14:00 – 16:00', course: 'PHY-401 Research Seminar',  room: 'Seminar Rm' },
    ],
    activities: [
      { id: 1, text: 'Submitted grades for PHY-301 midterm exam',            time: '2 hours ago',  icon: '' },
      { id: 2, text: 'Created new assignment: Thermodynamics Problem Set 4',  time: '5 hours ago',  icon: '' },
      { id: 3, text: 'Marked attendance for PHY-205 (28/30 present)',         time: 'Yesterday',    icon: '' },
    ],
  },
  {
    id: '2', name: 'Prof. Sunita Sharma', initials: 'SS',
    subject: 'Data Structures & Algorithms', department: 'Dept. of Computer Science',
    employeeId: 'FAC-00189', status: 'Active',
    avatarGradient: 'from-[#164e6a] to-[#0d3349]',
    totalClasses: 52, totalStudents: 287, avgAttendance: 88.7, upcomingSessions: 8,
    schedule: [
      { day: 'Tuesday',   time: '10:00 – 11:30', course: 'CS-201 Data Structures',     room: 'Lab D-01' },
      { day: 'Thursday',  time: '10:00 – 11:30', course: 'CS-201 Data Structures',     room: 'Lab D-01' },
      { day: 'Friday',    time: '11:00 – 13:00', course: 'CS-450 Advanced Algorithms',  room: 'Hall C-02' },
    ],
    activities: [
      { id: 1, text: 'Merged pull requests for CS-201 final project',  time: '1 hour ago',  icon: '' },
      { id: 2, text: 'Sent announcement: Guest lecture on Friday',     time: 'Yesterday',   icon: '' },
    ],
  },
  {
    id: '3', name: 'Dr. Priya Menon', initials: 'PM',
    subject: 'Organic Chemistry', department: 'Dept. of Chemistry',
    employeeId: 'FAC-00156', status: 'On Leave',
    avatarGradient: 'from-[#fbbf24] to-[#d97706]',
    totalClasses: 36, totalStudents: 198, avgAttendance: 85.1, upcomingSessions: 0,
    schedule: [
      { day: 'Monday',    time: '08:00 – 10:00', course: 'CHE-210 Organic Chemistry I', room: 'Chem Lab 1' },
      { day: 'Wednesday', time: '08:00 – 10:00', course: 'CHE-210 Organic Chemistry I', room: 'Chem Lab 1' },
    ],
    activities: [
      { id: 1, text: 'Approved leave request for next week',        time: '2 days ago',  icon: '' },
      { id: 2, text: 'Updated course syllabus for CHE-210',         time: '4 days ago',  icon: '' },
    ],
  },
  {
    id: '4', name: 'Prof. Suresh Pillai', initials: 'SP',
    subject: 'Advanced Calculus & Linear Algebra', department: 'Dept. of Mathematics',
    employeeId: 'FAC-00312', status: 'Active',
    avatarGradient: 'from-[#0ea5b0] to-[#006496]',
    totalClasses: 44, totalStudents: 256, avgAttendance: 92.4, upcomingSessions: 5,
    schedule: [
      { day: 'Tuesday',   time: '13:00 – 14:30', course: 'MAT-305 Advanced Calculus', room: 'Room 204' },
      { day: 'Thursday',  time: '13:00 – 14:30', course: 'MAT-305 Advanced Calculus', room: 'Room 204' },
      { day: 'Friday',    time: '09:00 – 10:30', course: 'MAT-101 Linear Algebra',    room: 'Hall B-11' },
    ],
    activities: [
      { id: 1, text: 'Published quiz results for MAT-101',              time: '3 hours ago', icon: '' },
      { id: 2, text: 'Created new assignment: Matrix Transformations',   time: '1 day ago',   icon: '' },
    ],
  },
  {
    id: '5', name: 'Dr. Kavitha Nair', initials: 'KN',
    subject: 'Structural Engineering', department: 'Dept. of Civil Engineering',
    employeeId: 'FAC-00278', status: 'Inactive',
    avatarGradient: 'from-[#f87171] to-[#ef4444]',
    totalClasses: 22, totalStudents: 145, avgAttendance: 78.3, upcomingSessions: 0,
    schedule: [
      { day: 'Wednesday', time: '14:00 – 17:00', course: 'CE-402 Structural Design', room: 'Design Studio' },
    ],
    activities: [
      { id: 1, text: 'Archived course materials for CE-402', time: '1 week ago', icon: '' },
    ],
  },
  {
    id: '6', name: 'Prof. Anand Desai', initials: 'AD',
    subject: 'Microeconomics & Public Policy', department: 'Dept. of Economics',
    employeeId: 'FAC-00334', status: 'Active',
    avatarGradient: 'from-[#164e6a] to-[#0d3349]',
    totalClasses: 40, totalStudents: 220, avgAttendance: 89.5, upcomingSessions: 7,
    schedule: [
      { day: 'Monday',    time: '11:00 – 12:30', course: 'ECO-201 Microeconomics', room: 'Hall A-05' },
      { day: 'Wednesday', time: '11:00 – 12:30', course: 'ECO-201 Microeconomics', room: 'Hall A-05' },
      { day: 'Thursday',  time: '15:00 – 16:30', course: 'ECO-410 Public Policy',  room: 'Room 312' },
    ],
    activities: [
      { id: 1, text: 'Marked attendance for ECO-201 (45/48 present)',  time: '4 hours ago', icon: '' },
      { id: 2, text: 'Uploaded reading materials for Week 4',          time: 'Yesterday',   icon: '' },
      { id: 3, text: 'Scheduled guest speaker for ECO-410',            time: '2 days ago',  icon: '' },
    ],
  },
];
