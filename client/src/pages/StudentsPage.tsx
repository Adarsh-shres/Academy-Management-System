import { useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';

export default function StudentsPage() {
  const navigate = useNavigate();
  const { students } = useStudents();

  const recentStudents = students.slice(-5).reverse();

  const formatCourseSummary = (department: string, course: string) => {
    if (department && course) return `${department} · ${course}`;
    if (department) return department;
    if (course) return course;
    return 'Profile details not set yet';
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Students Registration</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Register and manage your students</p>
        </div>
        <button
          onClick={() => navigate('/register-students')}
          className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add students
        </button>
      </div>

      <div className="bg-white rounded-sm border border-[#e2e8f0] p-5 shadow-sm flex flex-col mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[#4b3f68] uppercase tracking-wide">Recent Students</h3>
          <span onClick={() => navigate('/all-students')} className="text-[12px] font-semibold text-[#6a5182] cursor-pointer hover:underline transition-all">
            View All
          </span>
        </div>
        {recentStudents.length > 0 ? (
          <div className="divide-y divide-[#e2e8f0]">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between py-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0ea5b0] to-[#006496] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold text-[#0d3349]">
                      {student.firstName} {student.lastName}
                    </span>
                    <p className="text-[12px] text-[#64748b]">{formatCourseSummary(student.department, student.course)}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[14px] text-[#64748b] py-8 text-center bg-[#f8fafc] rounded-sm border border-dashed border-[#cbd5e1]">
            No recent students registered yet.
          </div>
        )}
      </div>
    </div>
  );
}
