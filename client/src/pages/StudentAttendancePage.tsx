import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentData } from "../hooks/useStudentData";
import type { ClassAttendanceData } from "../hooks/useStudentData";

export default function StudentAttendancePage() {
  const { classAttendance, isLoading, error } = useStudentData();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Deduplicate classes by classId (in case the hook returns duplicates)
  const uniqueClassAttendance = useMemo(() => {
    const seen = new Set<string>();
    return classAttendance.filter((ca) => {
      if (seen.has(ca.classId)) return false;
      seen.add(ca.classId);
      return true;
    });
  }, [classAttendance]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">
        Loading Attendance...
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

  // Overall stats
  const totalSessions = uniqueClassAttendance.reduce((s, c) => s + c.totalSessions, 0);
  const totalPresent = uniqueClassAttendance.reduce((s, c) => s + c.presentCount, 0);
  const totalAbsent = uniqueClassAttendance.reduce((s, c) => s + c.absentCount, 0);
  const overallPercent = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 100;

  const atRisk = uniqueClassAttendance.filter((c) => c.attendancePercent < 80);

  const filteredClasses =
    selectedClass === "all"
      ? uniqueClassAttendance
      : uniqueClassAttendance.filter((c) => c.classId === selectedClass);

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Attendance Report
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">
            Monitoring your presence across all enrolled classes
          </p>
        </div>
        {uniqueClassAttendance.length > 1 && (
          <div className="bg-white border border-[#e7dff0] rounded-[8px] px-3 flex items-center shadow-[0_1px_4px_rgba(57,31,86,0.02)] shrink-0">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-[#b096cc] mr-2 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2.5 text-[13px] text-[#4b3f68] font-bold uppercase tracking-wide outline-none bg-transparent cursor-pointer truncate flex-1 min-w-[130px]"
            >
              <option value="all">ALL CLASSES</option>
              {uniqueClassAttendance.map((ca) => (
                <option key={ca.classId} value={ca.classId}>
                  {ca.courseName} — {ca.className}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Overall Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverallStatCard
          label="Overall"
          value={`${overallPercent}%`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          }
          accent
        />
        <OverallStatCard
          label="Total Sessions"
          value={String(totalSessions)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <OverallStatCard
          label="Present"
          value={String(totalPresent)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <OverallStatCard
          label="Absent"
          value={String(totalAbsent)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
      </div>

      {/* Threshold Alert */}
      {atRisk.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-6 flex items-start gap-5 shadow-[0_1px_4px_rgba(225,29,72,0.06)]">
          <div className="w-10 h-10 rounded-[8px] bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-rose-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-rose-700 uppercase tracking-[0.06em] mb-1">
              Attendance Warning
            </p>
            <p className="text-[14px] text-rose-700 font-medium leading-snug">
              You are below the 80% threshold in:{" "}
              <span className="font-semibold underline decoration-rose-400 underline-offset-2">
                {atRisk.map((c) => `${c.courseName} (${c.className})`).join(", ")}
              </span>
              .
            </p>
          </div>
        </div>
      )}

      {/* Per-class attendance cards — 2-column compact grid */}
      <h3 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight mt-2">
        Class Breakdown
      </h3>

      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6a5182" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Classes Found</h3>
          <p className="text-[14px] text-[#7c8697] max-w-md">
            You are not enrolled in any classes yet. Once a teacher adds you to a class, your attendance records will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClasses.map((ca) => (
            <CompactClassCard
              key={ca.classId}
              data={ca}
              onClick={() => navigate(`/student/attendance/${ca.classId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Sub-components                                                */
/* ────────────────────────────────────────────────────────────── */

function OverallStatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
          accent
            ? "bg-gradient-to-br from-[#6a5182] to-[#8b6ca8] text-white shadow-sm"
            : "bg-[#f3eff7] text-[#6a5182]"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-sans text-[22px] font-bold text-[#4b3f68] leading-none tracking-tight">
          {value}
        </p>
        <p className="text-[11px] font-semibold text-[#778196] uppercase tracking-[0.06em] mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

/** Compact class card — smaller, designed for a 2-column grid */
function CompactClassCard({
  data,
  onClick,
}: {
  data: ClassAttendanceData;
  onClick: () => void;
}) {
  const {
    className,
    courseName,
    courseCode,
    teacherName,
    color,
    totalSessions,
    presentCount,
    absentCount,
    attendancePercent,
    records,
  } = data;

  const getBarColor = (pct: number) => {
    if (pct >= 90) return "#6a5182";
    if (pct >= 80) return "#8b6ca8";
    return "#e11d48";
  };

  const getStatusLabel = (pct: number) => {
    if (pct >= 90) return { label: "Good Standing", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (pct >= 80) return { label: "Satisfactory", cls: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "At Risk", cls: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const status = getStatusLabel(attendancePercent);

  return (
    <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] transition-all duration-200 overflow-hidden group">
      {/* Colored top strip */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2 min-w-0">
            <span className="inline-block text-[9.5px] font-semibold px-1.5 py-[1px] rounded-[4px] text-[#6a5182] bg-[#f3eff7] uppercase tracking-wide mb-1">
              {courseCode}
            </span>
            <h3 className="font-sans text-[14px] font-semibold text-[#4b3f68] leading-tight tracking-tight truncate">
              {courseName}
            </h3>
            <p className="text-[11.5px] text-[#7c8697] font-medium truncate">
              {className} · {teacherName}
            </p>
          </div>
          <div className="text-right flex flex-col items-end shrink-0">
            <div className="font-sans text-[20px] font-bold text-[#4b3f68] leading-none">
              {attendancePercent}
              <span className="text-[11px] font-medium text-[#778196] ml-[1px]">%</span>
            </div>
            <span className={`text-[9px] font-semibold px-1.5 py-[2px] rounded-full uppercase border tracking-wide mt-1 ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="w-full h-[5px] bg-[#efe8f5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${attendancePercent}%`,
                backgroundColor: getBarColor(attendancePercent),
              }}
            />
          </div>
        </div>

        {/* Compact stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center py-2 bg-[#faf8fc] rounded-[6px] border border-[#e7dff0]">
            <p className="font-sans text-[15px] font-bold text-[#4b3f68] leading-none mb-0.5">{totalSessions}</p>
            <p className="text-[9.5px] font-semibold text-[#778196] uppercase tracking-wider">Total</p>
          </div>
          <div className="text-center py-2 bg-[#fbf8fe] rounded-[6px] border border-[#e2d9ed]">
            <p className="font-sans text-[15px] font-bold text-[#6a5182] leading-none mb-0.5">{presentCount}</p>
            <p className="text-[9.5px] font-semibold text-[#6a5182] uppercase tracking-wider">Present</p>
          </div>
          <div className="text-center py-2 bg-[#f8fafc] rounded-[6px] border border-[#cbd5e1]">
            <p className="font-sans text-[15px] font-bold text-[#475569] leading-none mb-0.5">{absentCount}</p>
            <p className="text-[9.5px] font-semibold text-[#64748b] uppercase tracking-wider">Absent</p>
          </div>
        </div>

        {/* View Records Button — navigates to detail page */}
        <button
          onClick={onClick}
          className="w-full py-2.5 rounded-[8px] text-[12px] font-semibold uppercase tracking-wider text-[#6a5182] bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer group-hover:bg-[#e7dff0]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Session Records ({records.length})
        </button>
      </div>
    </div>
  );
}
