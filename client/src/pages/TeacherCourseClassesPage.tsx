import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, Presentation, ChevronLeft } from '../components/shared/icons';
import TeacherSidebar from '../components/teachers/TeacherSidebar';

export default function TeacherCourseClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [classes, setClasses] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      if (!user?.id || !courseId) return;
      setIsLoading(true);
      try {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseData) {
          setCourse(courseData);
        }

        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .eq('course_id', courseId)
          .eq('teacher_id', user.id);
        
        if (classData && classData.length > 0) {
          setClasses(classData);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadClasses();
  }, [user, courseId]);

  const totalClassesCount = classes.length;

  const handleTabChange = (tabId: string) => {
    navigate('/teacher/dashboard', { state: { targetTab: tabId } });
  };

  return (
    <div className="flex h-screen bg-main-bg font-sans overflow-hidden">
      <TeacherSidebar activeTab="Classes" onTabChange={handleTabChange} />

      <main className="flex-1 ml-[210px] flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
          {/* Header section */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/teacher/dashboard', { state: { targetTab: 'Classes' } })}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-4 cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
              Back to My Courses
            </button>
            <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">{course?.name || 'Course'} Classes</h1>
            <p className="text-[#64748b] font-medium mt-1">{totalClassesCount} active classes for this course</p>
          </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white h-[200px] rounded-sm border border-[#e7dff0]"></div>)}
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, idx) => {
            const courseRoom = course?.department || 'Virtual';
            const courseTotalStudents = cls.student_ids?.length || 0;
            const scheduleDisplay = cls.schedule_time 
              ? `${(cls.schedule_days || []).join(', ')} at ${cls.schedule_time}`
              : (cls.schedule_days || []).join(', ') || 'No Schedule';

            return (
              <div 
                key={cls.id} 
                onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col hover:border-[#6a5182] hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#f1f5f9] text-[#4b3f68] rounded-sm px-2.5 py-1 text-[11.5px] font-bold tracking-wide border border-[#e2e8f0]">
                      {course?.course_code || `CRS-${idx + 1}`}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#4b3f68] mb-2 leading-tight">{course?.name} - {cls.name || `Section ${idx + 1}`}</h3>
                  <p className="text-[13px] font-medium text-[#64748b] flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {courseTotalStudents} Students</span>
                    <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span>
                    <span className="flex items-center gap-1.5 text-[#6a5182] font-semibold">{courseRoom}</span>
                  </p>

                  <div className="mt-6">
                    <p className="text-[11.5px] text-[#94a3b8] font-medium mt-2">
                       {scheduleDisplay}
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
          <h2 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Classes Found</h2>
          <p className="text-[14px] text-[#64748b]">You don't have any assigned classes for this course.</p>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
