import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Presentation } from '../components/shared/icons';
import { SkeletonCard } from '../components/shared/Skeleton';



export default function TeacherClassesPage() {
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
          .or(`teacher_id.eq.${authUser.id},teacher_ids.cs.{${authUser.id}}`);

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
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-[200px] rounded-sm" />)}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const courseRoom = typeof course.room === 'string' ? course.room.trim() : '';
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
                  </div>

                  <h3 className="text-[18px] font-bold text-[#4b3f68] mb-2 leading-tight">{course.courses?.name || course.name}</h3>
                  <p className="text-[13px] font-medium text-[#64748b] flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {courseTotalStudents} Students</span>
                    {courseRoom && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span>
                        <span className="flex items-center gap-1.5 text-[#6a5182] font-semibold">{courseRoom}</span>
                      </>
                    )}
                  </p>
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
