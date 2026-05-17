import ProfileDropdown from '../components/shared/ProfileDropdown';
import NotificationBell from '../components/shared/NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user } = useAuth();
  const showSearch = user?.role !== 'student';

  return (
    <header className="app-topbar">
      {showSearch && (
        <div className="relative flex-1 max-w-[460px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search institutional data..."
            className="w-full rounded-full border border-[#e5e7eb] bg-white/78 py-2.5 pr-4 pl-9 text-[13px] font-medium text-[#111827] outline-none transition-all duration-200 placeholder:text-[#8a94a6] focus:border-[#d8b9ce] focus:bg-white focus:ring-4 focus:ring-[#f4eaf1]"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <div className="mx-1 h-6 w-px bg-[#e5e7eb]"></div>
        <ProfileDropdown />
      </div>
    </header>
  );
}
