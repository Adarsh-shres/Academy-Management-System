import TeacherHeaderCard from '../components/TeacherHeaderCard';
import StatCard from '../components/StatCard';

export default function TeachersPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teachers</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Manage and view faculty members</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          label="Total Classes"
          value="186"
          subContent={<><span className="text-[#10b981] font-bold">↑ 12</span> this semester</>}
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          label="Total Students"
          value="1,247"
          subContent="Across all faculty"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
          label="Avg. Attendance"
          value="87.3%"
          isAccent
          subContent={<span className="text-[10.5px] font-bold text-[#006496] bg-[#e6f7f9] px-[9px] py-0.5 rounded-full tracking-wide">Above Target</span>}
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          label="Upcoming Sessions"
          value="24"
          subContent="Scheduled this week"
          linkText="View →"
        />
      </div>

      {/* Teacher Header Cards */}
      <TeacherHeaderCard
        fullName="Dr. Ramesh Kumar"
        subject="Quantum Physics & Applied Mechanics"
        employeeId="FAC-00247"
        department="Dept. of Physics"
        status="Active"
      />

      <TeacherHeaderCard
        fullName="Prof. Sunita Sharma"
        subject="Data Structures & Algorithms"
        employeeId="FAC-00189"
        department="Dept. of Computer Science"
        status="On Leave"
      />

      <TeacherHeaderCard
        fullName="Dr. Amit Joshi"
        subject="Structural Engineering"
        employeeId="FAC-00312"
        department="Dept. of Civil Engineering"
        status="Inactive"
      />
    </div>
  );
}
