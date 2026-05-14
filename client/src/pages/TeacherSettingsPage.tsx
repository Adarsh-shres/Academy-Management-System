import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/shared/NotificationBell';
import ProfileDropdown from '../components/shared/ProfileDropdown';
import TeacherSidebar from '../components/teachers/TeacherSidebar';
import { useAuth } from '../context/AuthContext';

export default function TeacherSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTabChange = (tabId: string) => {
    navigate('/teacher/dashboard', { state: { targetTab: tabId } });
  };

  const handleUpdatePassword = () => {
    navigate('/teacher/update-password');
  };

  return (
    <div className="flex h-screen bg-main-bg font-sans overflow-hidden">
      <TeacherSidebar activeTab="Settings" onTabChange={handleTabChange} />

      <main className="flex-1 ml-[210px] flex flex-col min-w-0 bg-[#f9f8fa] overflow-y-auto">
        
        <header className="h-[58px] bg-white border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">

          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell />
            
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            
            <ProfileDropdown />
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-extrabold text-[#4b3f68] tracking-tight mb-2">Settings</h1>
          <p className="text-[14px] text-[#7c8697] mb-8">Manage your account settings and preferences</p>

          {/* Profile Information Card */}
          <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-8 mb-6">
            <h2 className="font-sans text-[19px] font-bold text-[#4b3f68] tracking-tight mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#f3eff7]">
                <div>
                  <p className="text-[13px] font-semibold text-[#778196] uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-[14px] font-medium text-[#4b3f68]">{user?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#f3eff7]">
                <div>
                  <p className="text-[13px] font-semibold text-[#778196] uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-[14px] font-medium text-[#4b3f68]">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#778196] uppercase tracking-wider mb-1">Role</p>
                  <p className="text-[14px] font-medium text-[#4b3f68] capitalize">{user?.role || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-8">
            <h2 className="font-sans text-[19px] font-bold text-[#4b3f68] tracking-tight mb-6">Security</h2>
            
            <div className="flex items-center justify-between p-4 bg-[#f9f8fa] rounded-[8px] border border-[#e7dff0]">
              <div>
                <p className="text-[14px] font-semibold text-[#4b3f68]">Account Password</p>
                <p className="text-[12px] font-medium text-[#7c8697] mt-1">Change your password regularly to keep your account secure</p>
              </div>
              <button 
                onClick={handleUpdatePassword}
                className="text-[11.5px] font-semibold text-white bg-[#6a5182] hover:bg-[#7a6492] px-4 py-2.5 rounded-[6px] uppercase tracking-wider transition-colors border border-transparent cursor-pointer whitespace-nowrap ml-4"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
