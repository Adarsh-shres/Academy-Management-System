import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import RecentActivity from '../components/RecentActivity';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useScrollReveal();

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-main-bg font-sans antialiased flex-col" ref={rootRef}>
      
      {/* Top Navigation */}
      <header className="h-[58px] bg-white/85 backdrop-blur border-b border-[#e7dff0] px-7 flex items-center justify-between sticky top-0 z-50 shadow-[0_6px_24px_rgba(57,31,86,0.04)]">
        <div className="flex items-center gap-3">
           <div className="w-[30px] h-[30px] bg-[#6a5182] text-white flex items-center justify-center rounded-[6px] text-[13px] font-bold tracking-wider">AM</div>
           <h1 className="font-sans text-[17px] font-bold text-[#4b3f68] tracking-tight">Academic Management</h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/login')} className="flex items-center gap-2 rounded-sm border border-[#e2d9ed] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#4b3f68] shadow-sm transition-all hover:-translate-y-px hover:shadow-md hover:border-[#d8c8e9]">
             Sign In
           </button>
           <button onClick={() => navigate('/login')} className="flex items-center gap-2 rounded-sm bg-primary px-4 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(106,81,130,0.24)] transition-all hover:-translate-y-px hover:shadow-[0_12px_24px_rgba(106,81,130,0.3)]">
             Get Started
           </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 md:px-8 py-10 flex flex-col gap-[30px]">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto pt-8 pb-4 animate-fade-up">
          <h1 className="font-sans text-[42px] md:text-[54px] font-extrabold text-[#4b3f68] tracking-tight leading-[1.1] mb-5">
            The Future of <br/><span className="text-[#4b3f68]">Academic Precision</span>
          </h1>
          <p className="text-[15px] text-[#7c8697] mb-8 max-w-[80%] leading-relaxed">
            Modern academic management system for forward-thinking institutions. Real-time performance tracking and resource monitoring built on a robust architecture.
          </p>
          <div className="flex gap-3 justify-center">
             <button onClick={() => navigate('/login')} className="flex items-center gap-2 rounded-sm bg-[#6a5182] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(106,81,130,0.24)] transition-all hover:-translate-y-px hover:shadow-[0_12px_24px_rgba(106,81,130,0.3)]">
               Login to Dashboard
               <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
             </button>
          </div>
        </div>

        {/* Feature Cards using StatCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] animate-fade-up" style={{ animationDelay: '100ms' }}>
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
            subContent="Stable Performance"
          />
          <StatCard 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            label="System Architects"
            value="Secure"
            isAccent
            subContent={<span className="text-[10.5px] font-bold text-primary bg-[#f3eff7] px-[9px] py-0.5 rounded-full tracking-wide">Audit Link Active</span>}
          />
        </div>

        {/* System Preview using RecentActivity Component */}
        <div className="animate-fade-up flex flex-col gap-3 mt-4" style={{ animationDelay: '200ms' }}>
          <div>
            <h2 className="font-sans text-[20px] font-extrabold text-[#4b3f68] tracking-tight">System Preview</h2>
            <p className="text-[13px] text-[#7c8697] mt-0.5">Experience the power of real-time administrative oversight.</p>
          </div>
          <div className="pointer-events-none w-full relative">
            <RecentActivity />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-main-bg to-transparent pointer-events-none"></div>
          </div>
        </div>

      </main>

    </div>
  );
}
