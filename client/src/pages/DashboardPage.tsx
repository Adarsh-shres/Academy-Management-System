import { Outlet } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Topbar from '../layouts/Topbar';
import TodoList from '../components/TodoList';

export default function DashboardPage() {
  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-main-bg font-sans antialiased">
      <Sidebar />

      <main className="flex-1 ml-[210px] flex flex-col min-h-screen min-w-0">
        <Topbar />

        <div className="flex flex-1 w-full min-w-0 flex-col xl:flex-row xl:items-stretch">
          <div className="w-full min-w-0 px-5 md:px-8 lg:px-10 xl:px-10 py-6 flex-1 flex flex-col">
            <Outlet />
          </div>

          <div className="w-full xl:w-[308px] xl:shrink-0 xl:pr-6 xl:py-6 pb-6 px-5 md:px-8 xl:px-0">
            <TodoList />
          </div>
        </div>
      </main>
    </div>
  );
}
