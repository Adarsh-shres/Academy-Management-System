import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Topbar from '../layouts/Topbar';
import TodoList from '../components/dashboard/TodoList';

export default function DashboardPage() {
  const location = useLocation();

  // Show the "My Tasks" sidebar only on the main dashboard pages
  const isDashboardHome =
    location.pathname === '/dashboard' ||
    location.pathname === '/student/dashboard';

  return (
    <div className="app-shell flex font-sans antialiased">
      <Sidebar />

      <main className="app-main flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-1 w-full min-w-0 flex-col xl:flex-row xl:items-stretch">
          <div className="w-full min-w-0 px-5 md:px-8 lg:px-10 xl:px-10 py-8 md:py-10 flex-1 flex flex-col">
            <div key={location.pathname} className="animate-page-switch">
              <Outlet />
            </div>
          </div>

          {isDashboardHome && (
            <div className="w-full xl:w-[308px] xl:shrink-0 xl:pr-6 xl:py-8 xl:pt-10 pb-8 px-5 md:px-8 md:pb-10 xl:px-0">
              <TodoList />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
