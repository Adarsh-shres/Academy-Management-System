

const TOOLS = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    label: "Onboard Faculty",
    desc: "Add new educators"
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    label: "Manage Roles",
    desc: "Permissions & access"
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    label: "Reports",
    desc: "Analytics & export"
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    label: "Quick Enroll",
    desc: "Add student fast"
  }
];

export default function QuickTools() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-[22px] flex flex-col">
      <h2 className="font-sans text-[15px] font-bold text-[#0d3349] mb-[18px]">Quick Tools</h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        
        {TOOLS.map((tool, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center gap-1.5 p-[16px_8px] border-[1.5px] border-[#e2e8f0] rounded-xl cursor-pointer bg-bg-custom text-center transition-all duration-200 hover:border-primary hover:bg-[#f0fbfc] hover:-translate-y-px hover:shadow-sm">
            <div className="w-[38px] h-[38px] bg-white border border-[#e2e8f0] rounded-[10px] flex items-center justify-center text-primary">
              {tool.icon}
            </div>
            <div className="text-[12px] font-bold text-[#0d3349] leading-tight">{tool.label}</div>
            <div className="text-[10.5px] text-[#64748b]">{tool.desc}</div>
          </div>
        ))}

      </div>
    </div>
  );
}
