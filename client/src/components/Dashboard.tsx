
import StatCard from './StatCard';
import Calendar from './Calendar';
import QuickTools from './QuickTools';
import RecentActivity from './RecentActivity';

export default function Dashboard() {
  return (
    <div className="p-[26px_28px_40px] flex-1">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary tracking-widest uppercase mb-2">
        <span>Institutional Overview</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Dashboard</span>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between mb-[26px] flex-wrap gap-3">
        <h1 className="font-sans text-[26px] font-extrabold text-[#0d3349] tracking-tight">
          Super Admin Dashboard
        </h1>
        <div className="flex gap-2.5">
          <button className="btn btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Generate Report
          </button>
          <button className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Quick Action
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mb-[22px]">
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
          label="Active Students"
          value="10,000"
          subContent={<><span className="text-[#10b981] font-bold">↑ More</span> registrations this semester</>}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label="Teaching Staff"
          value="50"
          subContent="Active faculty members"
          linkText="View All →"
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          label="Active Courses"
          value="30"
          isAccent
          subContent={<span className="text-[10.5px] font-bold text-primary bg-[#e6f7f9] px-[9px] py-0.5 rounded-full tracking-wide">24 New Modules</span>}
          linkText="View →"
        />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-5 mb-[22px]">
        <Calendar />
        <QuickTools />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-1">
        <RecentActivity />
      </div>

    </div>
  );
}
