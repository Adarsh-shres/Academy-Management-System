export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  attendance: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  classNames?: string[];
  classIds?: string[];
}

interface StudentCourseCardProps {
  course: Course;
  onViewDetails?: (course: Course) => void;
  onViewFolders?: (course: Course) => void;
}

export default function StudentCourseCard({ course, onViewDetails, onViewFolders }: StudentCourseCardProps) {
  const { name, code, instructor, attendance, totalClasses, attendedClasses, color } = course;
  const displayCode = code.trim();
  const displayInstructor = instructor.trim();

  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return "text-primary bg-[#f3eff7] border-[#e7dff0]";
    if (pct >= 80) return "text-[#4b3f68] bg-[#faf8fc] border-[#e2d9ed]";
    return "text-[#64748b] bg-[#f8fafc] border-[#cbd5e1]";
  };

  const getBarGradient = (pct: number) => {
    if (pct >= 90) return "from-[#6a5182] to-[#8b6ca8]";
    if (pct >= 80) return "from-[#8b6ca8] to-[#b096cc]";
    return "from-[#4b3f68] to-[#778196]";
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] transition-all duration-200 group flex flex-col">
      {/* Colored top strip */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            {displayCode && (
              <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-[6px] text-primary bg-[#f3eff7] uppercase tracking-wide mb-2">
                {displayCode}
              </span>
            )}
            <h3 className="font-sans text-[16px] font-semibold text-[#4b3f68] leading-tight tracking-tight">{name}</h3>
          </div>
          <div
            className={`text-[12px] font-semibold px-2 py-[3px] rounded-[6px] border ${getAttendanceColor(attendance)}`}
          >
            {attendance}%
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[11px] font-semibold shadow-sm" style={{ backgroundColor: color }}>
            {(displayInstructor || name).charAt(0).toUpperCase()}
          </div>
          <span className="text-[13px] font-medium text-[#7c8697]">{displayInstructor || 'Instructor not assigned'}</span>
        </div>

        {/* Spacer to push attendance down if flex container grows */}
        <div className="flex-1" />

        {/* Attendance bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[11px] font-semibold text-[#778196] uppercase tracking-wide mb-2">
            <span>Attendance</span>
            <span>{attendedClasses}/{totalClasses} classes</span>
          </div>
          <div className="w-full h-[5px] bg-[#efe8f5] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getBarGradient(attendance)}`}
              style={{ width: `${attendance}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails && onViewDetails(course)}
            className="w-full py-3 rounded-[8px] text-[12px] font-semibold uppercase tracking-wider text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors duration-200"
          >
            View Details
          </button>
          <button
            onClick={() => onViewFolders && onViewFolders(course)}
            className="w-full py-3 rounded-[8px] text-[12px] font-semibold uppercase tracking-wider text-white bg-primary hover:opacity-90 transition-opacity duration-200"
          >
            View Folders
          </button>
        </div>
      </div>
    </div>
  );
}
