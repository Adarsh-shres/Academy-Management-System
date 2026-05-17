import { LayoutDashboard, ClipboardList, Users, Calendar, Settings } from '../shared/icons';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'Dashboard', id: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Assignment', id: 'Assignment', icon: <ClipboardList size={16} /> },
  { name: 'Classes', id: 'Classes', icon: <Users size={16} /> },
  { name: 'Schedule', id: 'Schedule', icon: <Calendar size={16} /> },
  { name: 'Settings', id: 'Settings', icon: <Settings size={16} /> },
];

interface TeacherSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TeacherSidebar({ activeTab, onTabChange }: TeacherSidebarProps) {
  const navigate = useNavigate();

  const handleNavClick = (tabId: string) => {
    if (tabId === 'Settings') {
      navigate('/teacher/settings');
      return;
    }

    onTabChange(tabId);
  };

  return (
    <aside className="app-sidebar" aria-label="Teacher navigation">
      <div className="app-sidebar-brand">
        <img src="/image - Edited.png" alt="Learnify Logo" className="app-sidebar-logo" />
        <span className="app-sidebar-label font-extrabold text-[#4B5563] text-lg tracking-wide uppercase">LEARNIFY</span>
      </div>

      <nav className="app-sidebar-nav custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.name}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleNavClick(item.id)}
              className={`app-nav-item ${isActive ? 'is-active' : ''}`}
            >
              <span className="app-nav-icon">{item.icon}</span>
              <span className="app-sidebar-label">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar-footer">
        <span className="app-sidebar-label">v1.0 &middot; Teacher</span>
      </div>
    </aside>
  );
}
