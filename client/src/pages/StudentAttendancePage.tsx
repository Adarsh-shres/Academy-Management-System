import { courses } from "../data/studentMockData";
import StudentAttendanceCard from "../components/StudentAttendanceCard";
import StatCard from "../components/StatCard";

export default function StudentAttendancePage() {
  const avg = Math.round(courses.reduce((s, c) => s + c.attendance, 0) / courses.length);
  const atRisk = courses.filter((c) => c.attendance < 80);
  const good = courses.filter((c) => c.attendance >= 90);

  const getComparisonBarColor = (pct: number) => {
    if (pct >= 90) return "#10b981"; // Green
    if (pct >= 80) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Attendance Report
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Monitoring your presence across the academic term</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Attendance Average"
          value={`${avg}%`}
          subContent={<span className="text-[#10b981] font-bold">Stable performance</span>}
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
          subContent={<span className="text-[#ef4444] font-bold">Requires attention</span>}
        />
      </div>

      {/* Threshold Alert if any at risk */}
      {atRisk.length > 0 && (
        <div className="bg-[#fef2f2] border border-[#fee2e2] rounded-sm p-[24px] flex items-center gap-[20px] shadow-[0_2px_10px_rgba(57,31,86,0.02)]">
          <div className="w-[48px] h-[48px] rounded-[8px] bg-white flex items-center justify-center text-[24px] flex-shrink-0 shadow-sm border border-[#fee2e2]">⚠️</div>
          <div>
            <p className="text-[13px] font-extrabold text-[#dc2626] uppercase tracking-[0.08em] mb-1">Attendance Warning</p>
            <p className="text-[14px] text-[#7f1d1d] font-medium leading-snug">
              You are below the 80% threshold in: <span className="font-bold underline decoration-[#fca5a5] underline-offset-2">{atRisk.map(c => c.code).join(", ")}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Course Comparison Section */}
      <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-[32px]">
        <div className="flex items-center gap-[12px] mb-[28px] border-b border-[#f3eff7] pb-[20px]">
          <span className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#f3eff7] text-primary text-[16px]"></span>
          <h3 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">Course Comparison</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[48px] gap-y-[28px]">
          {courses
            .sort((a, b) => b.attendance - a.attendance)
            .map((course) => (
              <div key={course.id} className="space-y-[10px]">
                <div className="flex justify-between items-end">
                  <div className="text-[11.5px] font-extrabold text-[#7c8697] uppercase tracking-[0.1em] leading-none">{course.code}</div>
                  <div className="font-sans text-[18px] font-extrabold text-[#4b3f68] leading-none">{course.attendance}%</div>
                </div>
                <div className="w-full h-[8px] bg-[#efe8f5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${course.attendance}%`,
                      backgroundColor: getComparisonBarColor(course.attendance),
                    }}
                  />
                </div>
              </div>
            ))}
        </div>

        <div className="mt-[36px] pt-[24px] border-t border-[#f3eff7] flex items-center justify-center gap-[24px] flex-wrap">
          <div className="flex items-center gap-[10px] bg-[#ecfdf5] px-[12px] py-[6px] rounded-[6px] border border-[#d1fae5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-[10px] font-extrabold text-[#059669] uppercase tracking-widest">Good (&gt;= 90%)</span>
          </div>
          <div className="flex items-center gap-[10px] bg-[#fffbeb] px-[12px] py-[6px] rounded-[6px] border border-[#fef3c7]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-[10px] font-extrabold text-[#d97706] uppercase tracking-widest">Avg (80-89%)</span>
          </div>
          <div className="flex items-center gap-[10px] bg-[#fef2f2] px-[12px] py-[6px] rounded-[6px] border border-[#fee2e2]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="text-[10px] font-extrabold text-[#dc2626] uppercase tracking-widest">Risk (&lt; 80%)</span>
          </div>
        </div>
      </div>

      {/* Per-course dynamic cards */}
      <h3 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight mt-2">Course Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {courses.map((course) => (
          <StudentAttendanceCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
