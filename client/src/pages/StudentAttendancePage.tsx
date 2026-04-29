import { useStudentData } from "../hooks/useStudentData";
import StudentAttendanceCard from "../components/students/StudentAttendanceCard";
import StatCard from "../components/dashboard/StatCard";

export default function StudentAttendancePage() {
  const { courses, isLoading, error } = useStudentData();
  
  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Attendance...</div>;
  }

  if (error) {
    return <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">{error}</div>;
  }

  const avg = courses.length > 0 ? Math.round(courses.reduce((s, c) => s + c.attendance, 0) / courses.length) : 100;
  const atRisk = courses.filter((c) => c.attendance < 80);
  const good = courses.filter((c) => c.attendance >= 90);

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Attendance Report
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Monitoring your presence across the academic term</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Attendance Average"
          value={`${avg}%`}
          subContent={<span className="text-primary font-semibold">Stable performance</span>}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20m10-10H2"/></svg>}
          label="Good Standing"
          value={good.length.toString()}
          subContent="Above 90% threshold"
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="At Risk"
          value={atRisk.length.toString()}
          isAccent
          subContent={<span className="text-[#4b3f68] font-semibold">Requires attention</span>}
        />
      </div>

      {/* Threshold Alert if any at risk */}
      {atRisk.length > 0 && (
        <div className="bg-[#faf8fc] border border-[#e7dff0] rounded-[10px] p-6 flex items-start gap-5 shadow-[0_1px_4px_rgba(57,31,86,0.02)]">
          <div className="w-10 h-10 rounded-[8px] bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#e7dff0]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b3f68" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#4b3f68] uppercase tracking-[0.06em] mb-1">Attendance Warning</p>
            <p className="text-[14px] text-[#4b3f68] font-medium leading-snug">
              You are below the 80% threshold in: <span className="font-semibold underline decoration-[#b096cc] underline-offset-2">{atRisk.map(c => c.code).join(", ")}</span>.
            </p>
          </div>
        </div>
      )}



      {/* Per-course dynamic cards */}
      <h3 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight mt-2">Course Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <StudentAttendanceCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
