export interface Course {
  id: number;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  attendance: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  schedule: string;
}

interface StudentCourseCardProps {
  course: Course;
  onViewDetails?: (course: Course) => void;
}

export default function StudentCourseCard({ course, onViewDetails }: StudentCourseCardProps) {
  const { name, code, instructor, attendance, totalClasses, attendedClasses, color } = course;

  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return "text-[#047857] bg-[#ecfdf5] border-[#d1fae5]";
    if (pct >= 80) return "text-[#b45309] bg-[#fffbeb] border-[#fef3c7]";
    return "text-[#b91c1c] bg-[#fef2f2] border-[#fee2e2]";
  };

  const getBarGradient = (pct: number) => {
    if (pct >= 90) return "from-[#10b981] to-[#34d399]";
    if (pct >= 80) return "from-[#f59e0b] to-[#fbbf24]";
    return "from-[#ef4444] to-[#f87171]";
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 group flex flex-col">
      {/* Colored top strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-[22px_22px_20px] flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-[6px] text-primary bg-[#f3eff7] uppercase tracking-wide mb-2">
              {code}
            </span>
            <h3 className="font-sans text-[17px] font-extrabold text-[#4b3f68] leading-tight tracking-tight">{name}</h3>
          </div>
          <div
            className={`text-[12px] font-bold px-[8px] py-[3px] rounded-[6px] border ${getAttendanceColor(attendance)}`}
          >
            {attendance}%
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-[10px] mb-5">
          <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-white text-[12px] font-bold shadow-sm" style={{ backgroundColor: color }}>
            {instructor.split(" ").slice(-1)[0][0]}
          </div>
          <span className="text-[13px] font-medium text-[#7c8697]">{instructor}</span>
        </div>

        {/* Spacer to push attendance down if flex container grows */}
        <div className="flex-1" />

        {/* Attendance bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[11.5px] font-bold text-[#778196] uppercase tracking-wide mb-2">
            <span>Attendance</span>
            <span>{attendedClasses}/{totalClasses} classes</span>
          </div>
          <div className="w-full h-[6px] bg-[#efe8f5] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getBarGradient(attendance)}`}
              style={{ width: `${attendance}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onViewDetails && onViewDetails(course)}
          className="w-full py-[10px] rounded-[8px] text-[13px] font-bold uppercase tracking-wider text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
