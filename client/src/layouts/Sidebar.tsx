import { useLocation, useNavigate } from 'react-router-dom';

const SUPER_ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { name: 'User Roles', path: '/user-roles', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { name: 'Teachers', path: '/teachers', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { name: 'Students', path: '/students', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { name: 'Courses', path: '/courses', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { name: 'Batches', path: '/batches', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5"/><path d="M4 5h16l-2 5 2 5H4"/><path d="M8 19h8"/></svg> },
  { name: 'Classes', path: '/classes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h18"/><path d="M4 4v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4"/><path d="M8 9h8"/><path d="M8 13h5"/></svg> },
  { name: 'Schedules', path: '/schedule', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg> },
];

const STUDENT_NAV_ITEMS = [
  { name: 'Dashboard', path: '/student/dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
  { name: 'My Courses', path: '/student/courses', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { name: 'Assignments', path: '/student/assignments', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { name: 'Attendance', path: '/student/attendance', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg> },
  { name: 'My Folders', path: '/student/folders', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> },
  { name: 'Notifications', path: '/student/notifications', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
  { name: 'Profile', path: '/student/profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isStudent = location.pathname === '/student' || location.pathname.startsWith('/student/');
  const navItems = isStudent ? STUDENT_NAV_ITEMS : SUPER_ADMIN_NAV_ITEMS;

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[210px] bg-white/95 backdrop-blur border-r border-[#e7dff0] flex flex-col z-[100] transition-all duration-200 shadow-[0_0_30px_rgba(57,31,86,0.06)]">
      <div className="flex items-center justify-center gap-2 px-4 border-b border-[#e7dff0] min-h-[58px] bg-[#fbf8fe]">
        <img src="/image - Edited.png" alt="Learnify Logo" className="h-10 w-10 object-contain" style={{ mixBlendMode: 'multiply' }} />
        <span className="font-extrabold text-[#4b3f68] text-lg tracking-wide uppercase">LEARNIFY</span>
      </div>

      <nav className="flex-1 py-[14px] overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 p-[10px_16px] text-[13.5px] font-medium cursor-pointer border-l-[3px] transition-all duration-200 text-left ${
                isActive
                  ? 'text-[#6a5182] bg-[#f3eff7] border-[#6a5182] font-semibold'
                  : 'text-[#64748b] border-transparent hover:text-[#6a5182] hover:bg-[#fbf8fe]'
              }`}
            >
              <span className="w-5 flex items-center justify-center shrink-0">{item.icon}</span>
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="p-[14px_16px] border-t border-[#e7dff0] text-[11px] text-[#64748b] flex items-center justify-center bg-[#fbf8fe]">
        <span>v1.0 · {isStudent ? 'Student' : 'Super Admin'}</span>
      </div>
    </aside>
  );
}
