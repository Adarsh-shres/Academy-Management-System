import { useState } from "react";
import { courses } from "../data/studentMockData";
import StudentCourseCard from "../components/StudentCourseCard";
import type { Course } from "../components/StudentCourseCard";

export default function StudentCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const avgAttendance = Math.round(courses.reduce((s, c) => s + c.attendance, 0) / courses.length);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Enrolled Courses
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{courses.length} courses this semester</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 rounded-sm border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-semibold text-primary shadow-sm hover:shadow-md transition-shadow">
             <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
             Semester 5 Active
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
        <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[34px] font-extrabold text-primary leading-none tracking-tight mb-2">{courses.length}</p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">Total Courses</p>
        </div>
        <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center ring-1 ring-[#e0d6ef]">
          <p className="font-sans text-[34px] font-extrabold text-[#10b981] leading-none tracking-tight mb-2">
            {totalCredits}
          </p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">Credit Hours</p>
        </div>
        <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[34px] font-extrabold text-[#f59e0b] leading-none tracking-tight mb-2">
            {avgAttendance}%
          </p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">Avg Attendance</p>
        </div>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <StudentCourseCard
            key={course.id}
            course={course}
            onViewDetails={setSelectedCourse}
          />
        ))}
      </div>

      {/* Course detail modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-[#391f56]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-sm shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-0 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative border border-[#e7dff0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-7 border-b border-[#f3eff7] bg-gradient-to-br from-[#f5effa] to-white relative">
               <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-sm bg-white border border-[#e7dff0] flex items-center justify-center text-[#7c8697] hover:text-[#4b3f68] hover:shadow-sm transition-all"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
               <div className="w-[18px] h-[6px] rounded-full mb-3" style={{ backgroundColor: selectedCourse.color }} />
               <h3 className="font-sans text-[22px] font-extrabold text-[#4b3f68] tracking-tight leading-tight">{selectedCourse.name}</h3>
               <p className="text-[13px] font-bold text-primary tracking-wide uppercase mt-1">{selectedCourse.code}</p>
            </div>

            <div className="p-7 space-y-4">
              {[
                { label: "Instructor", value: selectedCourse.instructor },
                { label: "Schedule", value: selectedCourse.schedule },
                { label: "Credits", value: `${selectedCourse.credits} credit hours` },
                { label: "Total Classes", value: selectedCourse.totalClasses },
                { label: "Attended", value: selectedCourse.attendedClasses },
                { label: "Attendance", value: `${selectedCourse.attendance}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] px-2 transition-colors rounded-[8px]">
                  <span className="text-[12px] font-bold text-[#778196] uppercase tracking-wide">{label}</span>
                  <span className="text-[13px] font-semibold text-[#4b3f68]">{value}</span>
                </div>
              ))}

              <div className="pt-4">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full py-[12px] rounded-sm text-[13px] font-bold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
