import { FileText } from '../shared/icons';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';

export default function EnrolledCoursesList({ courses }: { courses?: any[] }) {
  const { user } = useAuth();
  const { myCourses } = useCourses();
  
  const displayCourses = courses || myCourses;

  const title = user?.role === 'teacher' ? 'Active Course Assignments' : 'My Enrolled Courses';

  return (
    <div className="bg-white rounded-[10px] border border-[#e7dff0] flex flex-col shadow-[0_2px_12px_rgba(57,31,86,0.04)] min-h-[250px]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe] rounded-t-[10px]">
        <div className="flex items-center gap-2">
          <FileText className="text-[#006ec7]" size={18} />
          <h3 className="text-[15px] font-semibold text-[#4b3f68]">{title}</h3>
        </div>
        <span className="bg-[#e0f0fa] text-[#006ec7] text-[11px] font-semibold px-2 py-0.5 rounded-full">
          {displayCourses.length} Courses
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3">
        {displayCourses.length > 0 ? (
          displayCourses.map((course) => (
            <div key={course.id} className="flex items-start gap-3 p-3 rounded-[8px] border border-[#e2d9ed] hover:border-[#b096cc] transition-colors bg-white group">
              <div className="w-8 h-8 rounded-[6px] bg-[#f3eff7] text-[#6a5182] flex items-center justify-center shrink-0 font-semibold text-[12px]">
                {course.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-semibold text-[#1e293b] truncate group-hover:text-primary transition-colors">
                  {course.name}
                </h4>
                <p className="text-[11.5px] text-[#64748b] mt-0.5 border-b border-[#e2d9ed]/50 pb-1">
                  {course.department || course.schedule || (course.scheduleDays && course.scheduleDays.join(', '))}
                </p>
                {user?.role === 'student' && (
                  <p className="text-[11px] text-[#475569] mt-1.5 font-medium">
                    Instructor: {course.facultyLead || course.instructor}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-[#f8fafc] rounded-[8px] text-center border border-[#e2e8f0] h-full min-h-[120px]">
            <span className="text-[12.5px] font-medium text-[#64748b]">No active courses found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
