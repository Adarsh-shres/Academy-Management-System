import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Topbar from '../layouts/Topbar';
import TodoList from '../components/TodoList';

export default function DashboardPage() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-[#f0f4f8] font-sans antialiased">
      <Sidebar />
      
      <main className="flex-1 ml-[210px] flex flex-col min-h-screen">
        <Topbar />
        
        <div className="flex flex-1 w-full">
          <div className="w-full px-6 md:px-10 lg:px-[40px] flex-1 flex flex-col pt-6">
            <Outlet />
          </div>
          
          {isDashboard && <TodoList />}
        </div>
      </main>
    </div>
  );
}
