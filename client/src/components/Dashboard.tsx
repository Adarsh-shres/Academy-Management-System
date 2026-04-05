
import StatCard from './StatCard';
import Calendar from './Calendar';
import QuickTools from './QuickTools';
import RecentActivity from './RecentActivity';

export default function Dashboard() {
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
          <button className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(106,81,130,0.24)] transition-all hover:-translate-y-px hover:shadow-[0_12px_24px_rgba(106,81,130,0.3)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Quick Action
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
          label="Active Entities"
          value="1,284"
          subContent={<><span className="text-[#10b981] font-bold">+12%</span> this month</>}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label="Faculty Chairs"
          value="42"
          subContent="Stable"
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          label="System Architects"
          value="08"
          isAccent
          subContent={<span className="text-[10.5px] font-bold text-primary bg-[#f3eff7] px-[9px] py-0.5 rounded-full tracking-wide">Audit Link</span>}
        />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
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
