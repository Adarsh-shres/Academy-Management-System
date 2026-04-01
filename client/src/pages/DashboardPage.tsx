import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Topbar from '../layouts/Topbar';
import TodoList from '../components/TodoList';

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveNav = () => {
    const path = location.pathname;
    if (path.includes('student')) return 'Students';
    if (path.includes('course')) return 'Courses';
    if (path.includes('teacher')) return 'Teachers';
    if (path.includes('userrole')) return 'User Roles';
    return 'Dashboard';
  };

  const handleNavClick = (navName: string) => {
    if (navName === 'Dashboard') navigate('/dashboard');
    else if (navName === 'Students') navigate('/students');
    else if (navName === 'Courses') navigate('/courses');
    else if (navName === 'Teachers') navigate('/teachers');
    else if (navName === 'User Roles') navigate('/userroles');
    else navigate('/under-development');
  };

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-[#f0f4f8] font-sans antialiased">
      <Sidebar activeNav={getActiveNav()} setActiveNav={handleNavClick} />
      
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
