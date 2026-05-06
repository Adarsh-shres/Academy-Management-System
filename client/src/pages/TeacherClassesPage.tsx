import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, Presentation } from '../components/shared/icons';



export default function TeacherClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from('classes')
          .select(`
            *,
            courses (
              id,
              name,
              description,
              course_code
            )
          `)
          .eq('teacher_id', authUser.id);

        if (error) throw error;

        if (data && data.length > 0) {
          setCourses(data);
        } else {
          setCourses([]);
        }

      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  const totalClassesCount = courses.length;

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">My Courses</h1>
        <p className="text-[#64748b] font-medium mt-1">{totalClassesCount} active courses this semester</p>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white h-[200px] rounded-sm border border-[#e7dff0]"></div>)}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const randomProgress = course.completed_lessons ? (course.completed_lessons / (course.total_lessons || 1)) * 100 : 0;
            const courseRoom = course.room || 'Virtual';
            const courseTotalStudents = course.student_ids ? course.student_ids.length : 0;

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/teacher/classes/${course.id}`)}
                className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col hover:border-[#6a5182] hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#f1f5f9] text-[#4b3f68] rounded-sm px-2.5 py-1 text-[11.5px] font-bold tracking-wide border border-[#e2e8f0]">
                      {course.courses?.course_code || `CRS-${idx + 1}`}
                    </span>
                    <span className="bg-[#dcfce7] text-[#16a34a] rounded-sm px-2.5 py-1 text-[11px] font-bold">
                      {course.attendance || 100}% Attend.
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#4b3f68] mb-2 leading-tight">{course.courses?.name || course.name}</h3>
                  <p className="text-[13px] font-medium text-[#64748b] flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {courseTotalStudents} Students</span>
                    <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span>
                    <span className="flex items-center gap-1.5 text-[#6a5182] font-semibold">{courseRoom}</span>
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
                      {course.completed_lessons || 0} / {course.total_lessons || 'N'} Units Completed
                    </p>
                  </div>
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
    </div>
  );
}
