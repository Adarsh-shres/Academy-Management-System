import type { Course } from "./StudentCourseCard";

export default function StudentAttendanceCard({ course }: { course: Course }) {
  const { name, code, instructor, attendance, totalClasses, attendedClasses } = course;

  const getStatusLabel = (pct: number) => {
    if (pct >= 90) return { label: "Good Standing", cls: "text-[#059669] bg-[#ecfdf5] border-[#d1fae5]" };
    if (pct >= 80) return { label: "Satisfactory", cls: "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]" };
    return { label: "At Risk", cls: "text-[#dc2626] bg-[#fef2f2] border-[#fee2e2]" };
  };

  const status = getStatusLabel(attendance);

  const getBarColor = (pct: number) => {
    if (pct >= 90) return "#10b981";
    if (pct >= 80) return "#f59e0b";
    return "#ef4444";
  };

  const absentClasses = totalClasses - attendedClasses;

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.04)] p-[22px] hover:shadow-[0_16px_36px_rgba(57,31,86,0.08)] transition-all duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pr-3">
          <span className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-[6px] text-primary bg-[#f3eff7] uppercase tracking-wide mb-1.5">{code}</span>
          <h3 className="font-sans text-[16px] font-extrabold text-[#4b3f68] leading-tight tracking-tight mb-[4px]">{name}</h3>
          <p className="text-[12px] text-[#7c8697] font-medium">{instructor}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="font-sans text-[26px] font-extrabold text-[#4b3f68] leading-none mb-2 mt-1">
            {attendance}<span className="text-[14px] font-bold text-[#778196] ml-[2px]">%</span>
          </div>
          <span className={`text-[10px] font-extrabold px-[8px] py-[3px] rounded-full uppercase border tracking-wide ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-[20px]">
        <div className="flex justify-between text-[11.5px] font-bold text-[#778196] uppercase tracking-wide mb-2 hidden">
            <span>Attendance</span>
        </div>
        <div className="w-full h-[6px] bg-[#efe8f5] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${attendance}%`, backgroundColor: getBarColor(attendance) }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center py-3 bg-[#faf8fc] rounded-sm border border-[#e7dff0]">
          <p className="font-sans text-[18px] font-extrabold text-[#4b3f68] leading-none mb-1">{totalClasses}</p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-wider">Total</p>
        </div>
        <div className="text-center py-3 bg-[#ecfdf5] rounded-sm border border-[#d1fae5]">
          <p className="font-sans text-[18px] font-extrabold text-[#10b981] leading-none mb-1">{attendedClasses}</p>
          <p className="text-[10.5px] font-bold text-[#059669] uppercase tracking-wider">Present</p>
        </div>
        <div className="text-center py-3 bg-[#fef2f2] rounded-sm border border-[#fee2e2]">
          <p className="font-sans text-[18px] font-extrabold text-[#ef4444] leading-none mb-1">{absentClasses}</p>
          <p className="text-[10.5px] font-bold text-[#dc2626] uppercase tracking-wider">Absent</p>
        </div>
      </div>
    </div>
  );
}
