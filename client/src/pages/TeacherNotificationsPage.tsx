import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/shared/NotificationBell';
import ProfileDropdown from '../components/shared/ProfileDropdown';
import TeacherSidebar from '../components/teachers/TeacherSidebar';
import NotificationsPage from './NotificationsPage';

export default function TeacherNotificationsPage() {
  const navigate = useNavigate();

  const handleTabChange = (tabId: string) => {
    navigate('/teacher/dashboard', { state: { targetTab: tabId } });
  };

  return (
    <div className="flex h-screen bg-main-bg font-sans overflow-hidden">
      <TeacherSidebar activeTab="" onTabChange={handleTabChange} />

      <main className="flex-1 ml-[210px] flex flex-col min-w-0 bg-[#f9f8fa] overflow-y-auto">
        
        <header className="h-[58px] bg-white border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell />
            
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            
            <ProfileDropdown />
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <NotificationsPage />
        </div>
      </main>
    </div>
  );
}
