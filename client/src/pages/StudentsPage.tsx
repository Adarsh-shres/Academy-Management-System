import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';

export default function StudentsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Students Registration</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Register and manage your students</p>
        </div>
        <button
          onClick={() => navigate('/register-students')}
          className="flex items-center gap-2 bg-[#006496] hover:bg-[#004e75] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow hover:-translate-y-px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add students
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          label="Total students"
          value="50,000"
          isAccent={true}
          subContent={null}
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
          label="Active Enrollments"
          value="4,820"
          subContent={null}
        />
      </div>

      {/* Recent Students List (Placeholder) */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm flex flex-col mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[#0d3349] uppercase tracking-wide">Recent Students</h3>
          <span 
            onClick={() => navigate('/all-students')}
            className="text-[12px] font-semibold text-[#006496] cursor-pointer hover:underline transition-all">
            View All
          </span>
        </div>
        <div className="text-[14px] text-[#64748b] py-8 text-center bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1]">
          No recent students registered yet.
        </div>
      </div>
    </div>
  );
}
