import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TodoList from './TodoList';

export default function DashboardPage() {
  const location = useLocation();

  let activeNav = 'Dashboard';
  if (location.pathname.startsWith('/students') || location.pathname.startsWith('/register-students')) {
    activeNav = 'Students';
  } else if (location.pathname.startsWith('/dashboard')) {
    activeNav = 'Dashboard';
  } else {
    activeNav = location.pathname.split('/')[1] || 'Dashboard';
    activeNav = activeNav.charAt(0).toUpperCase() + activeNav.slice(1).replace('-', ' ');
  }


  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-[#f0f4f8] font-sans antialiased">
      <Sidebar activeNav={activeNav} />
      
      <main className="flex-1 ml-[210px] flex flex-col min-h-screen">
        <Topbar />
        
        <div className="flex flex-1 w-full">
          <div className="w-full px-6 md:px-10 lg:px-[40px] flex-1 flex flex-col pt-6">
            <Outlet />
          </div>
          
          <TodoList />
        </div>
      </main>
    </div>
  );
}
