import ProfileDropdown from '../components/shared/ProfileDropdown';
import NotificationBell from '../components/shared/NotificationBell';

export default function Topbar() {
  return (
    <header className="h-[58px] bg-white/85 backdrop-blur border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shadow-[0_6px_24px_rgba(57,31,86,0.04)]">
      
      {/* Search */}
      <div className="flex-1 max-w-[420px] relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input 
          type="text" 
          placeholder="Search institutional data…" 
          className="w-full py-2 pr-3.5 pl-9 bg-transparent border-none rounded-full text-[13px] text-[#1e293b] outline-none transition-all duration-200 placeholder:text-[#7c8697] focus:ring-0"
        />
      </div>

      {/* Topbar Right */}
      <div className="flex items-center gap-2 ml-auto">
        <NotificationBell />

        <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
        <ProfileDropdown />
      </div>
      
    </header>
  );
}
