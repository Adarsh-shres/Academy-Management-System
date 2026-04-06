import StatCard from '../StatCard';

export default function Cards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl mx-auto">
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
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>}
            label="System Architects"
            value="Secure"
            isAccent
            subContent={<span className="text-[10.5px] font-bold text-primary bg-[#f3eff7] px-[9px] py-0.5 rounded-full tracking-wide">Audit Link Active</span>}
        />
    </section>
  );
}

