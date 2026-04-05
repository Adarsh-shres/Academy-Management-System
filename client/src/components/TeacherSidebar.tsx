import { LayoutDashboard, ClipboardList, Users, Calendar, Settings } from './icons';

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
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[210px] bg-white/95 backdrop-blur border-r border-[#e7dff0] flex flex-col z-[100] transition-all duration-200 shadow-[0_0_30px_rgba(57,31,86,0.06)]">
      
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 px-4 border-b border-[#e7dff0] min-h-[58px] bg-[#fbf8fe]">
        <img src="/image - Edited.png" alt="Yogify Logo" className="h-10 w-10 object-contain" style={{ mixBlendMode: 'multiply' }} />
        <span className="font-extrabold text-[#4b3f68] text-lg tracking-wide uppercase">YOGIFY</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-[14px] overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-2.5 p-[10px_16px] text-[13.5px] font-medium cursor-pointer border-l-[3px] transition-all duration-200 text-left
                ${isActive 
                  ? 'text-[#6a5182] bg-[#f3eff7] border-[#6a5182] font-semibold' 
                  : 'text-[#64748b] border-transparent hover:text-[#6a5182] hover:bg-[#fbf8fe]'
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
      <div className="p-[14px_16px] border-t border-[#e7dff0] text-[11px] text-[#64748b] flex items-center justify-center bg-[#fbf8fe]">
        <span>v1.0 · Teacher</span>
      </div>

    </aside>
  );
}

