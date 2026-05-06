import { useNavigate, useParams } from "react-router-dom";
import { useStudentData } from "../hooks/useStudentData";

export default function StudentAttendanceDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classAttendance, isLoading, error } = useStudentData();

  const classData = classAttendance.find((ca) => ca.classId === classId);

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">
        Loading Attendance Details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">
        {error}
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex flex-col gap-6 pb-10 max-w-[900px] mx-auto w-full">
        <button
          onClick={() => navigate("/student/attendance")}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] transition-colors w-fit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Attendance
        </button>
        <div className="bg-white rounded-[12px] border border-[#e7dff0] p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6a5182" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#4b3f68] mb-1">Class Not Found</h3>
          <p className="text-[14px] text-[#7c8697] max-w-md">
            This class could not be found in your enrollment records.
          </p>
        </div>
      </div>
    );
  }

  const { className, courseName, courseCode, teacherName, color, totalSessions, presentCount, absentCount, attendancePercent, records } = classData;

  const getStatusLabel = (pct: number) => {
    if (pct >= 90) return { label: "Good Standing", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (pct >= 80) return { label: "Satisfactory", cls: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "At Risk", cls: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const status = getStatusLabel(attendancePercent);

  // Group records by month
  const groupedByMonth: Record<string, typeof records> = {};
  records.forEach((rec) => {
    const d = rec.date !== "-" ? new Date(rec.date + "T00:00:00") : null;
    const monthKey = d
      ? d.toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : "Unknown";
    if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = [];
    groupedByMonth[monthKey].push(rec);
  });

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-[900px] mx-auto w-full">
      {/* Back Button */}
      <button
        onClick={() => navigate("/student/attendance")}
        className="flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] transition-colors w-fit cursor-pointer group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Attendance
      </button>

      {/* Class Info Header */}
      <div className="bg-white rounded-[12px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-[6px] text-[#6a5182] bg-[#f3eff7] uppercase tracking-wide mb-2">
                {courseCode}
              </span>
              <h1 className="font-sans text-[22px] md:text-[24px] font-bold text-[#4b3f68] tracking-tight leading-tight">
                {courseName}
              </h1>
              <p className="text-[14px] text-[#7c8697] font-medium mt-1">
                {className} · {teacherName}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="font-sans text-[32px] font-bold text-[#4b3f68] leading-none">
                {attendancePercent}
                <span className="text-[14px] font-medium text-[#778196] ml-[2px]">%</span>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-[4px] rounded-full uppercase border tracking-wide ${status.cls}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 mb-5">
            <div className="w-full h-[6px] bg-[#efe8f5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${attendancePercent}%`,
                  backgroundColor: attendancePercent >= 80 ? "#6a5182" : "#e11d48",
                }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center py-3 bg-[#faf8fc] rounded-[8px] border border-[#e7dff0]">
              <p className="font-sans text-[20px] font-bold text-[#4b3f68] leading-none mb-1">{totalSessions}</p>
              <p className="text-[11px] font-semibold text-[#778196] uppercase tracking-wider">Total</p>
            </div>
            <div className="text-center py-3 bg-emerald-50/50 rounded-[8px] border border-emerald-100">
              <p className="font-sans text-[20px] font-bold text-emerald-700 leading-none mb-1">{presentCount}</p>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Present</p>
            </div>
            <div className="text-center py-3 bg-rose-50/50 rounded-[8px] border border-rose-100">
              <p className="font-sans text-[20px] font-bold text-rose-700 leading-none mb-1">{absentCount}</p>
              <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Records Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-[18px] font-bold text-[#4b3f68] tracking-tight">
          Session Records
        </h2>
        <span className="rounded-full bg-[#f3eff7] px-3 py-1 text-[11px] font-bold text-[#6a5182] uppercase tracking-wider">
          {records.length} sessions
        </span>
      </div>

      {/* Records grouped by month */}
      {records.length > 0 ? (
        Object.entries(groupedByMonth).map(([month, monthRecords]) => (
          <div key={month} className="bg-white rounded-[12px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] overflow-hidden">
            <div className="px-5 py-3 bg-[#fbf8fe] border-b border-[#e7dff0] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a5182" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3 className="text-[13px] font-bold text-[#4b3f68] uppercase tracking-wide">{month}</h3>
              <span className="ml-auto text-[11px] font-semibold text-[#778196]">
                {monthRecords.length} session{monthRecords.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-[#f0eaf5]">
              {monthRecords.map((record) => {
                const isPresent = record.status === "present";
                return (
                  <div key={record.id} className="flex items-center px-5 py-3.5 hover:bg-[#faf8fc] transition-colors">
                    {/* Status indicator */}
                    <div className={`w-2 h-2 rounded-full mr-4 flex-shrink-0 ${isPresent ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {/* Date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-[#475569]">{record.date}</p>
                      <p className="text-[12px] text-[#7c8697]">{record.day}</p>
                    </div>
                    {/* Time */}
                    <div className="text-[13px] text-[#64748b] font-medium px-4 hidden sm:block">
                      {record.time}
                    </div>
                    {/* Status badge */}
                    <span className={`rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
                      isPresent
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {isPresent ? "Present" : "Absent"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-[12px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center mb-4 text-[#6a5182]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Sessions Recorded</h3>
          <p className="text-[14px] text-[#7c8697] max-w-md">
            Attendance has not been taken for this class yet.
          </p>
        </div>
      )}
    </div>
  );
}
