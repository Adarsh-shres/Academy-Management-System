import StatCard from './StatCard';
import Calendar from './Calendar';
import QuickTools from './QuickTools';
import { useCourses } from '../../context/CourseContext';
import { useStudents } from '../../context/StudentContext';
import { useTeachers } from '../../context/TeacherContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const { students } = useStudents();
  const { teachers } = useTeachers();

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">

      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Institutional Overview
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Real-time performance and resource monitoring.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 rounded-sm border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-semibold text-[#4b3f68] shadow-sm transition-all hover:-translate-y-px hover:shadow-md hover:border-[#d8c8e9]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Generate Report
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label="Students"
          value={String(students.length)}
          compact
          showProgress={false}
          onClick={() => navigate('/students')}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          label="Teachers"
          value={String(teachers.length)}
          compact
          showProgress={false}
          onClick={() => navigate('/teachers')}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          label="Courses"
          value={String(courses.length)}
          isAccent
          compact
          showProgress={false}
          onClick={() => navigate('/courses')}
        />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Calendar />
        <QuickTools />
      </div>
    </div>
  );
}
