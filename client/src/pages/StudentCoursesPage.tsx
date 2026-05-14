import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useStudentData } from "../hooks/useStudentData";
import StudentCourseCard from "../components/students/StudentCourseCard";
import type { Course } from "../components/students/StudentCourseCard";

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const { courses, isLoading, error } = useStudentData();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Courses...</div>;
  }

  if (error) {
    return <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">{error}</div>;
  }

  const avgAttendance = courses.length > 0 ? Math.round(courses.reduce((s, c) => s + c.attendance, 0) / courses.length) : 100;
  const recordedSessions = courses.reduce((sum, course) => sum + course.totalClasses, 0);
  const courseDetailRows = selectedCourse ? [
    { label: "Course Code", value: selectedCourse.code.trim() },
    { label: "Instructor", value: selectedCourse.instructor.trim() },
    { label: "Classes", value: selectedCourse.classNames?.join(", ") || "" },
    {
      label: "Attendance",
      value: selectedCourse.totalClasses > 0
        ? `${selectedCourse.attendance}% (${selectedCourse.attendedClasses}/${selectedCourse.totalClasses})`
        : "",
    },
  ].filter((row) => row.value) : [];

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Enrolled Courses
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{courses.length} courses this semester</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[30px] font-bold text-primary leading-none tracking-tight mb-2">{courses.length}</p>
          <p className="text-[11px] font-semibold text-[#778196] uppercase tracking-[0.06em]">Total Courses</p>
        </div>
        <div className="relative overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[30px] font-bold text-[#4b3f68] leading-none tracking-tight mb-2">
            {recordedSessions}
          </p>
          <p className="text-[11px] font-semibold text-[#778196] uppercase tracking-[0.06em]">Recorded Sessions</p>
        </div>
        <div className="relative overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[30px] font-bold text-[#778196] leading-none tracking-tight mb-2">
            {avgAttendance}%
          </p>
          <p className="text-[11px] font-semibold text-[#778196] uppercase tracking-[0.06em]">Avg Attendance</p>
        </div>
      </div>

      {/* Courses grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <StudentCourseCard
              key={course.id}
              course={course}
              onViewDetails={setSelectedCourse}
              onViewFolders={(selected) => navigate(`/student/courses/${selected.id}/folders`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#d8c8e9] bg-white p-10 text-center shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
          <h3 className="text-[16px] font-bold text-[#4b3f68]">No Courses Assigned</h3>
          <p className="mt-1 text-[13px] font-medium text-[#7c8697]">Courses will appear here after your account is added to a class roster.</p>
        </div>
      )}

      {/* Course detail modal */}
      {selectedCourse && createPortal(
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-[10px] shadow-[0_24px_70px_rgba(15,23,42,0.22)] p-0 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative border border-[#e7dff0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-7 pt-7 pb-6 border-b border-[#f3eff7] bg-white relative">
               <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-[8px] bg-white border border-[#e7dff0] flex items-center justify-center text-[#7c8697] hover:text-[#4b3f68] hover:shadow-sm transition-all"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
               <div className="flex items-start gap-4 pr-10">
                 <div className="w-12 h-12 rounded-[10px] flex items-center justify-center text-white text-[16px] font-bold shadow-sm shrink-0" style={{ backgroundColor: selectedCourse.color }}>
                   {selectedCourse.name.substring(0, 2).toUpperCase()}
                 </div>
                 <div className="min-w-0">
                   <h3 className="font-sans text-[22px] font-bold text-[#4b3f68] tracking-tight leading-tight">{selectedCourse.name}</h3>
                   <p className="text-[13px] font-medium text-[#7c8697] mt-1">Course summary from your current class enrollment.</p>
                 </div>
               </div>
            </div>

            <div className="px-7 py-6">
              {courseDetailRows.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courseDetailRows.map(({ label, value }) => (
                    <div key={label} className="rounded-[8px] border border-[#e7dff0] bg-[#fdfcff] px-4 py-3">
                      <span className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">{label}</span>
                      <p className="mt-1 text-[13.5px] font-semibold text-[#4b3f68] leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[8px] border border-dashed border-[#d8c8e9] bg-[#fdfcff] px-5 py-8 text-center">
                  <p className="text-[13px] font-semibold text-[#4b3f68]">No verified course details are available yet.</p>
                  <p className="mt-1 text-[12px] font-medium text-[#7c8697]">Once the course has class, instructor, or attendance data, it will show here.</p>
                </div>
              )}

              <div className="pt-5">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full py-3 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
