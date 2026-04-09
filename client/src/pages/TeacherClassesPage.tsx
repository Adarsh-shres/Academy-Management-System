import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, Presentation, CalendarCheck2 } from '../components/icons';
import ViewStudentsModal from '../components/ViewStudentsModal';
import SendNotificationModal from '../components/SendNotificationModal';

const MOCK_CLASSES = [
  { id: '1', course_code: 'MTH-101', name: 'Math 101', students: 25, room: 'Room 4a', attendance: 92, completed: 3, totalUnits: 6 },
  { id: '2', course_code: 'MTH-102', name: 'Math 102', students: 23, room: 'Room 3b', attendance: 88, completed: 2, totalUnits: 5 },
  { id: '3', course_code: 'MTH-103', name: 'Math 103', students: 30, room: 'Room 2c', attendance: 95, completed: 4, totalUnits: 6 },
  { id: '4', course_code: 'MTH-104', name: 'Math 104', students: 15, room: 'Room 1d', attendance: 85, completed: 1, totalUnits: 4 },
];

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<any>(null);
  const [selectedCourseForNotification, setSelectedCourseForNotification] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    setTotalStudents(93);
    setCourses(MOCK_CLASSES);
    setIsLoading(false);
  }, []);

  // Derived stats
  const totalClassesCount = courses.length;
  const avgAttendance = "88%";

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">My Classes</h1>
          <p className="text-[#64748b] font-medium mt-1">{totalClassesCount} active classes this semester</p>
        </div>
        <div className="bg-[#6a5182]/10 text-[#6a5182] border border-[#6a5182]/20 px-4 py-2 rounded-sm text-[13px] font-bold tracking-wide uppercase">
          Semester 5 Active
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182]">
            <Presentation size={24} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Total Classes</p>
            <h3 className="text-[28px] font-extrabold text-[#4b3f68] leading-none">{isLoading ? '-' : totalClassesCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#e0f2fe] flex items-center justify-center text-[#0284c7]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Total Students</p>
            <h3 className="text-[28px] font-extrabold text-[#4b3f68] leading-none">{isLoading ? '-' : totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a]">
            <CalendarCheck2 size={24} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Avg Attendance</p>
            <h3 className="text-[28px] font-extrabold text-[#4b3f68] leading-none">{isLoading ? '-' : avgAttendance}</h3>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white h-[260px] rounded-sm border border-[#e7dff0]"></div>)}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const randomProgress = (course.completed / course.totalUnits) * 100;
            const randomRoom = course.room;
            const courseTotalStudents = course.students;

            return (
              <div key={course.id} className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col hover:border-[#d8c8e9] transition-colors">
                <div className="p-6 border-b border-[#e7dff0] flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#f1f5f9] text-[#4b3f68] rounded-sm px-2.5 py-1 text-[11.5px] font-bold tracking-wide border border-[#e2e8f0]">
                      {course.course_code || `CRS-${idx + 1}`}
                    </span>
                    <span className="bg-[#dcfce7] text-[#16a34a] rounded-sm px-2.5 py-1 text-[11px] font-bold">
                      {course.attendance}% Attend.
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#4b3f68] mb-2 leading-tight">{course.name}</h3>
                  <p className="text-[13px] font-medium text-[#64748b] flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {courseTotalStudents} Students</span>
                    <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span>
                    <span className="flex items-center gap-1.5 text-[#6a5182] font-semibold">{randomRoom}</span>
                  </p>

                  <div className="mt-6">
                    <div className="flex justify-between text-[11.5px] font-bold text-[#64748b] mb-2 uppercase">
                      <span>Course Progress</span>
                      <span className="text-[#6a5182]">{Math.round(randomProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6a5182] rounded-full transition-all duration-500" style={{ width: `${randomProgress}%` }}></div>
                    </div>
                    <p className="text-[11.5px] text-[#94a3b8] font-medium mt-2">
                      {course.completed} / {course.totalUnits} Units Completed
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#fbf8fe]/50 flex gap-3">
                  <button
                    onClick={() => setSelectedCourseForStudents(course)}
                    className="flex-1 bg-[#6a5182] hover:bg-[#5b4471] text-white rounded-sm text-[12.5px] font-semibold py-2.5 transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    VIEW STUDENTS
                  </button>
                  <button
                    onClick={() => setSelectedCourseForNotification(course)}
                    className="flex-1 bg-white border border-[#d8c8e9] hover:bg-[#f3eff7] text-[#6a5182] rounded-sm text-[12.5px] font-semibold py-2.5 transition-colors active:scale-[0.98] cursor-pointer"
                  >
                    SEND NOTIFICATION
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-[#e7dff0] rounded-sm w-full text-center">
          <Presentation size={48} className="text-[#cbd5e1] mb-4" />
          <h2 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Classes Assigned</h2>
          <p className="text-[14px] text-[#64748b]">You are currently not assigned as faculty lead to any courses.</p>
        </div>
      )}

      {/* Modals */}
      <ViewStudentsModal
        isOpen={!!selectedCourseForStudents}
        onClose={() => setSelectedCourseForStudents(null)}
        course={selectedCourseForStudents}
      />
      <SendNotificationModal
        isOpen={!!selectedCourseForNotification}
        onClose={() => setSelectedCourseForNotification(null)}
        course={selectedCourseForNotification}
      />
    </div>
  );
}
