import { useNavigate } from 'react-router-dom';
import { Bell, Mail } from '../components/shared/icons';
import ProfileDropdown from '../components/shared/ProfileDropdown';
import TeacherSidebar from '../components/teachers/TeacherSidebar';

export default function TeacherSettingsPage() {
  const navigate = useNavigate();

  const handleTabChange = (tabId: string) => {
    navigate('/teacher/dashboard', { state: { targetTab: tabId } });
  };

  return (
    <div className="flex h-screen bg-main-bg font-sans overflow-hidden">
      <TeacherSidebar activeTab="Settings" onTabChange={handleTabChange} />

      <main className="flex-1 ml-[210px] flex flex-col min-w-0 bg-[#f9f8fa] overflow-y-auto">
        
        <header className="h-[58px] bg-white border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-[#64748b] hover:text-primary transition-colors cursor-pointer">
              <Mail size={18} />
            </button>
            <button className="relative text-[#64748b] hover:text-primary transition-colors cursor-pointer">
              <Bell size={18} />
            </button>
            
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            
            <ProfileDropdown />
          </div>
        </header>

        <div className="p-[26px_28px_40px]">
          <h2 className="text-2xl font-bold font-sans text-[#0d3349]">Under Development</h2>
          <p className="mt-4 text-[#64748b]">This page is currently being developed.</p>
        </div>
      </main>
    </div>
  );
}
