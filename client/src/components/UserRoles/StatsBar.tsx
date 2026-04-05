// StatsBar.tsx
import { type UserStats } from "../../hooks/useUsers.ts";

export interface StatsBarProps {
  stats: UserStats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const cards = [
    {
      label: "Institutional Reach",
      value: stats.total.toLocaleString(),
      sub: "Total registered users",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      isAccent: true,
    },
    {
      label: "Teaching Faculty",
      value: stats.teachers.toLocaleString(),
      sub: "Active academic staff",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      label: "Enrolled Students",
      value: stats.students.toLocaleString(),
      sub: "Across all departments",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mb-[22px]">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white border border-[#e2e8f0] rounded-2xl p-[24px_24px_22px] relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            card.isAccent ? "border-t-[3px] border-t-primary" : ""
          }`}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

          <div className="w-[42px] h-[42px] bg-[#e6f7f9] rounded-xl flex items-center justify-center text-primary mb-4 relative z-10">
            {card.icon}
          </div>

          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5 relative z-10">
            {card.label}
          </div>

          <div className="font-sans text-[32px] font-extrabold text-[#0d3349] leading-none mb-2 tracking-tight relative z-10">
            {card.value}
          </div>

          <div className="text-[12px] text-[#64748b] font-medium relative z-10">
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
