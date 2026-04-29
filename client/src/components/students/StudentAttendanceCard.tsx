import type { Course } from "./StudentCourseCard";

export default function StudentAttendanceCard({ course }: { course: Course }) {
  const { name, code, instructor, attendance, totalClasses, attendedClasses } = course;

  const getStatusLabel = (pct: number) => {
    if (pct >= 90) return { label: "Good Standing", cls: "text-primary bg-[#f3eff7] border-[#e7dff0]" };
    if (pct >= 80) return { label: "Satisfactory", cls: "text-[#4b3f68] bg-[#faf8fc] border-[#e2d9ed]" };
    return { label: "At Risk", cls: "text-[#64748b] bg-[#f8fafc] border-[#cbd5e1]" };
  };

  const status = getStatusLabel(attendance);

  const getBarColor = (pct: number) => {
    if (pct >= 90) return "#6a5182";
    if (pct >= 80) return "#8b6ca8";
    return "#4b3f68";
  };

  const absentClasses = totalClasses - attendedClasses;

  return (
    <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] p-5 hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] transition-all duration-200">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-3">
          <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-[6px] text-primary bg-[#f3eff7] uppercase tracking-wide mb-1.5">{code}</span>
          <h3 className="font-sans text-[16px] font-semibold text-[#4b3f68] leading-tight tracking-tight mb-1">{name}</h3>
          <p className="text-[13px] text-[#7c8697] font-medium">{instructor}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="font-sans text-[24px] font-bold text-[#4b3f68] leading-none mb-2 mt-1">
            {attendance}<span className="text-[13px] font-medium text-[#778196] ml-[2px]">%</span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase border tracking-wide ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full h-[6px] bg-[#efe8f5] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${attendance}%`, backgroundColor: getBarColor(attendance) }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center py-3 bg-[#faf8fc] rounded-[8px] border border-[#e7dff0]">
          <p className="font-sans text-[18px] font-bold text-[#4b3f68] leading-none mb-1.5">{totalClasses}</p>
          <p className="text-[11px] font-semibold text-[#778196] uppercase tracking-wider">Total</p>
        </div>
        <div className="text-center py-3 bg-[#fbf8fe] rounded-[8px] border border-[#e2d9ed]">
          <p className="font-sans text-[18px] font-bold text-primary leading-none mb-1.5">{attendedClasses}</p>
          <p className="text-[11px] font-semibold text-[#6a5182] uppercase tracking-wider">Present</p>
        </div>
        <div className="text-center py-3 bg-[#f8fafc] rounded-[8px] border border-[#cbd5e1]">
          <p className="font-sans text-[18px] font-bold text-[#475569] leading-none mb-1.5">{absentClasses}</p>
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Absent</p>
        </div>
      </div>
    </div>
  );
}
