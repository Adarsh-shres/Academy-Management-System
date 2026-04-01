

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { name: 'User Roles', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { name: 'Teachers', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { name: 'Students', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { name: 'Courses', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { name: 'Schedule', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { name: 'Settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
];

export default function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[210px] bg-white border-r border-[#e2e8f0] flex flex-col z-[100] transition-all duration-200">
      
      {/* Logo */}
      <div className="flex items-center px-6 border-b border-[#e2e8f0] min-h-[58px]">
        <svg viewBox="0 0 24 24" className="h-7 w-auto text-[#aa3bff]" fill="currentColor">
          <path d="M12 2L2 7h20L12 2zM2 9v2h20V9H2zm2 4v7h3v-7H4zm6 0v7h4v-7h-4zm7 0v7h3v-7h-3zM2 22v2h20v-2H2z" />
        </svg>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-[14px] overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`w-full flex items-center gap-2.5 p-[10px_16px] text-[13.5px] font-medium cursor-pointer border-l-[3px] transition-all duration-200 text-left
                ${isActive 
                  ? 'text-[#006496] bg-[#e6f7f9] border-[#006496] font-semibold' 
                  : 'text-[#64748b] border-transparent hover:text-[#006496] hover:bg-[#f0fbfc]'
                }
              `}
            >
              <span className="w-5 flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-[14px_16px] border-t border-[#e2e8f0] text-[11px] text-[#64748b] flex items-center justify-center">
        <span>v1.0 · Super Admin</span>
      </div>

    </aside>
  );
}
