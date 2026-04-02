import { useState } from 'react';
import StatCard from '../components/StatCard';

/* ─── Mock Data ─────────────────────────────────────────────── */
interface ScheduleItem {
  day: string;
  time: string;
  course: string;
  room: string;
}

interface ActivityItem {
  id: number;
  text: string;
  time: string;
  icon: string;
}

interface Teacher {
  id: string;
  name: string;
  initials: string;
  subject: string;
  department: string;
  employeeId: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatarGradient: string;
  totalClasses: number;
  totalStudents: number;
  avgAttendance: number;
  upcomingSessions: number;
  schedule: ScheduleItem[];
  activities: ActivityItem[];
}

const TEACHERS: Teacher[] = [
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
      { id: 1, text: 'Submitted grades for PHY-301 midterm exam',       time: '2 hours ago',  icon: '📝' },
      { id: 2, text: 'Created new assignment: Thermodynamics Problem Set 4', time: '5 hours ago',  icon: '📄' },
      { id: 3, text: 'Marked attendance for PHY-205 (28/30 present)',   time: 'Yesterday',    icon: '✅' },
    ]
  },
  {
    id: '2', name: 'Prof. Sunita Sharma', initials: 'SS',
    subject: 'Data Structures & Algorithms', department: 'Dept. of Computer Science',
    employeeId: 'FAC-00189', status: 'Active',
    avatarGradient: 'from-[#164e6a] to-[#0d3349]',
    totalClasses: 52, totalStudents: 287, avgAttendance: 88.7, upcomingSessions: 8,
    schedule: [
      { day: 'Tuesday',   time: '10:00 – 11:30', course: 'CS-201 Data Structures',    room: 'Lab D-01' },
      { day: 'Thursday',  time: '10:00 – 11:30', course: 'CS-201 Data Structures',    room: 'Lab D-01' },
      { day: 'Friday',    time: '11:00 – 13:00', course: 'CS-450 Advanced Algorithms',room: 'Hall C-02' },
    ],
    activities: [
      { id: 1, text: 'Merged pull requests for CS-201 final project',   time: '1 hour ago',   icon: '💻' },
      { id: 2, text: 'Sent announcement: Guest lecture on Friday',      time: 'Yesterday',    icon: '📢' },
    ]
  },
  {
    id: '3', name: 'Dr. Priya Menon', initials: 'PM',
    subject: 'Organic Chemistry', department: 'Dept. of Chemistry',
    employeeId: 'FAC-00156', status: 'On Leave',
    avatarGradient: 'from-[#fbbf24] to-[#d97706]',
    totalClasses: 36, totalStudents: 198, avgAttendance: 85.1, upcomingSessions: 0,
    schedule: [
      { day: 'Monday',    time: '08:00 – 10:00', course: 'CHE-210 Organic Chemistry I',room: 'Chem Lab 1' },
      { day: 'Wednesday', time: '08:00 – 10:00', course: 'CHE-210 Organic Chemistry I',room: 'Chem Lab 1' },
    ],
    activities: [
      { id: 1, text: 'Approved leave request for next week',            time: '2 days ago',   icon: '✈️' },
      { id: 2, text: 'Updated course syllabus for CHE-210',             time: '4 days ago',   icon: '📚' },
    ]
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
      { id: 1, text: 'Published quiz results for MAT-101',              time: '3 hours ago',  icon: '📊' },
      { id: 2, text: 'Created new assignment: Matrix Transformations',  time: '1 day ago',    icon: '📄' },
    ]
  },
  {
    id: '5', name: 'Dr. Kavitha Nair', initials: 'KN',
    subject: 'Structural Engineering', department: 'Dept. of Civil Engineering',
    employeeId: 'FAC-00278', status: 'Inactive',
    avatarGradient: 'from-[#f87171] to-[#ef4444]',
    totalClasses: 22, totalStudents: 145, avgAttendance: 78.3, upcomingSessions: 0,
    schedule: [
      { day: 'Wednesday', time: '14:00 – 17:00', course: 'CE-402 Structural Design',  room: 'Design Studio' },
    ],
    activities: [
      { id: 1, text: 'Archived course materials for CE-402',            time: '1 week ago',   icon: '📦' },
    ]
  },
  {
    id: '6', name: 'Prof. Anand Desai', initials: 'AD',
    subject: 'Microeconomics & Public Policy', department: 'Dept. of Economics',
    employeeId: 'FAC-00334', status: 'Active',
    avatarGradient: 'from-[#164e6a] to-[#0d3349]',
    totalClasses: 40, totalStudents: 220, avgAttendance: 89.5, upcomingSessions: 7,
    schedule: [
      { day: 'Monday',    time: '11:00 – 12:30', course: 'ECO-201 Microeconomics',    room: 'Hall A-05' },
      { day: 'Wednesday', time: '11:00 – 12:30', course: 'ECO-201 Microeconomics',    room: 'Hall A-05' },
      { day: 'Thursday',  time: '15:00 – 16:30', course: 'ECO-410 Public Policy',     room: 'Room 312' },
    ],
    activities: [
      { id: 1, text: 'Marked attendance for ECO-201 (45/48 present)',   time: '4 hours ago',  icon: '✅' },
      { id: 2, text: 'Uploaded reading materials for Week 4',           time: 'Yesterday',    icon: '📚' },
      { id: 3, text: 'Scheduled guest speaker for ECO-410',             time: '2 days ago',   icon: '🗓️' },
    ]
  },
];

const STATUS_STYLES: Record<string, string> = {
  'Active':    'bg-[#d1fae5] text-[#065f46]',
  'On Leave':  'bg-[#fef3c7] text-[#92400e]',
  'Inactive':  'bg-[#f1f5f9] text-[#475569]',
};

/* ─── Component ─────────────────────────────────────────────── */

export default function TeachersPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#006496] tracking-widest uppercase mb-[-12px]">
        <span>Institutional Overview</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span 
          className={selectedTeacher ? "cursor-pointer hover:underline" : ""} 
          onClick={() => setSelectedTeacher(null)}
        >
          Teachers
        </span>
        {selectedTeacher && (
           <>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
             <span className="text-[#64748b]">{selectedTeacher.name}</span>
           </>
        )}
      </div>

      {selectedTeacher ? (
        /* ── DETAIL PANEL ── */
        <div key={selectedTeacher.id} className="contents">
          {/* Back + Page Title */}
          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => setSelectedTeacher(null)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors text-[#64748b] cursor-pointer shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teacher Profile</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Viewing details for {selectedTeacher.name}</p>
            </div>
          </div>

          {/* ── Header Card ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-up" style={{ animationDelay: '75ms' }}>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className={`w-[100px] h-[100px] rounded-2xl bg-gradient-to-br ${selectedTeacher.avatarGradient} text-white text-[32px] font-bold flex items-center justify-center shrink-0`}>
                  {selectedTeacher.initials}
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] ${STATUS_STYLES[selectedTeacher.status]}`}>
                  {selectedTeacher.status}
                </span>
              </div>
              {/* Info + Edit */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-sans text-[22px] font-extrabold text-[#0d3349] tracking-tight leading-tight">{selectedTeacher.name}</h2>
                    <p className="text-[13px] text-[#64748b] mt-1">{selectedTeacher.subject}</p>
                  </div>
                  <button className="flex items-center gap-2 bg-[#006496] hover:bg-[#004e75] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Profile
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-10 gap-y-4 mt-5">
                  <DetailField label="Employee ID" value={selectedTeacher.employeeId} />
                  <DetailField label="Department" value={selectedTeacher.department} />
                  <DetailField label="Specialization" value={selectedTeacher.subject} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] animate-fade-up" style={{ animationDelay: '150ms' }}>
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Total Classes"
              value={String(selectedTeacher.totalClasses)}
              subContent={<><span className="text-[#10b981] font-bold">↑ 4</span> this semester</>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              label="Total Students"
              value={selectedTeacher.totalStudents.toLocaleString()}
              subContent="Across all courses"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Avg. Attendance"
              value={`${selectedTeacher.avgAttendance}%`}
              isAccent
              subContent={
                selectedTeacher.avgAttendance >= 85
                  ? <span className="text-[10.5px] font-bold text-[#006496] bg-[#e6f7f9] px-[9px] py-0.5 rounded-full tracking-wide">Above Target</span>
                  : <span className="text-[10.5px] font-bold text-[#92400e] bg-[#fef3c7] px-[9px] py-0.5 rounded-full tracking-wide">Below Target</span>
              }
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label="Upcoming Sessions"
              value={String(selectedTeacher.upcomingSessions)}
              subContent="Scheduled this week"
              linkText="View →"
            />
          </div>

          {/* ── Two-Column: Schedule + Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 animate-fade-up" style={{ animationDelay: '225ms' }}>
            {/* Class Schedule Table */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
                <h3 className="font-sans text-[15px] font-bold text-[#0d3349]">Class Schedule</h3>
                <button className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] hover:text-[#0d3349] text-[13px] font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer">
                  This Week
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Day</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Time</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeacher.schedule.map((row, i) => (
                      <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-6 text-[13px] font-semibold text-[#0d3349]">{row.day}</td>
                        <td className="py-3 px-6 text-[13px] text-[#475569] whitespace-nowrap">{row.time}</td>
                        <td className="py-3 px-6 text-[13px] font-medium text-[#1e293b]">{row.course}</td>
                        <td className="py-3 px-6">
                          <span className="bg-[#e6f7f9] text-[#006496] px-2.5 py-1 rounded-md text-[12px] font-bold">{row.room}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-[22px] flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-[15px] font-bold text-[#0d3349]">Recent Activity</h3>
                <span className="text-[12px] font-semibold text-[#006496] cursor-pointer hover:underline transition-all">View All</span>
              </div>
              <div className="flex flex-col gap-0 flex-1">
                {selectedTeacher.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 py-3 border-b border-[#e2e8f0] last:border-0">
                    <div className="w-[34px] h-[34px] bg-[#e6f7f9] rounded-[10px] flex items-center justify-center text-[16px] shrink-0">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1e293b] leading-snug">{act.text}</p>
                      <p className="text-[11px] text-[#64748b] mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
                {selectedTeacher.activities.length === 0 && (
                  <p className="text-[13px] text-[#64748b] italic py-3 text-center">No recent activity found.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Actions Bar ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm animate-fade-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-sans text-[15px] font-bold text-[#0d3349] mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} label="Take Attendance" primary />
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} label="Create Assignment" />
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>} label="Send Announcement" />
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} label="View Reports" />
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST VIEW (Default) ── */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teachers</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Manage and view faculty members</p>
            </div>
            <button className="flex items-center gap-2 bg-[#006496] hover:bg-[#004e75] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Teacher
            </button>
          </div>

          {/* Summary Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label="Total Faculty"
              value={String(TEACHERS.length)}
              isAccent
              subContent={<><span className="text-[#10b981] font-bold">↑ 2</span> new this semester</>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Total Classes"
              value="186"
              subContent={<><span className="text-[#10b981] font-bold">↑ 12</span> this semester</>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Avg. Attendance"
              value="87.3%"
              subContent={<span className="text-[10.5px] font-bold text-[#006496] bg-[#e6f7f9] px-[9px] py-0.5 rounded-full tracking-wide">Above Target</span>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label="Upcoming Sessions"
              value="24"
              subContent="Scheduled this week"
              linkText="View →"
            />
          </div>

          {/* Teacher List */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
              <h3 className="font-sans text-[15px] font-bold text-[#0d3349]">All Faculty Members</h3>
              <span className="text-[12px] text-[#64748b]">{TEACHERS.length} members</span>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
              {TEACHERS.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-[40px] h-[40px] rounded-full bg-gradient-to-br ${teacher.avatarGradient} text-white text-[13px] font-bold flex items-center justify-center shrink-0`}>
                    {teacher.initials}
                  </div>

                  {/* Name + Subject */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0d3349] group-hover:text-[#006496] transition-colors truncate">{teacher.name}</p>
                    <p className="text-[12px] text-[#64748b] mt-0.5 truncate">{teacher.subject}</p>
                  </div>

                  {/* Department */}
                  <div className="hidden md:block">
                    <span className="bg-[#e6f7f9] text-[#006496] px-2.5 py-1 rounded-md text-[12px] font-bold">{teacher.department}</span>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex min-w-[80px] justify-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] ${STATUS_STYLES[teacher.status]}`}>
                    {teacher.status}
                  </span>

                  {/* Chevron */}
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-[#cbd5e1] group-hover:text-[#006496] transition-colors shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Sub-Components ────────────────────────────────────────── */

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
      <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-[#1e293b] font-semibold text-[15px]">{value}</span>
    </div>
  );
}

function QuickActionBtn({ icon, label, primary }: { icon: React.ReactNode; label: string; primary?: boolean }) {
  return primary ? (
    <button className="flex items-center gap-2 bg-[#006496] hover:bg-[#004e75] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer">
      {icon}
      {label}
    </button>
  ) : (
    <button className="flex items-center gap-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] text-[#475569] hover:text-[#0d3349] text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
      {icon}
      {label}
    </button>
  );
}
