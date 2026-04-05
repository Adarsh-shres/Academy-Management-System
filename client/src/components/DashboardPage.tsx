import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Dashboard from './Dashboard';
import TodoList from './TodoList';
import StudentsPage from './StudentsPage';

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-[#f0f4f8] font-sans antialiased">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      
      <main className="flex-1 ml-[210px] flex flex-col min-h-screen">
        <Topbar />
        
        <div className="flex flex-1 w-full">
          <div className="w-full px-6 md:px-10 lg:px-[40px] flex-1 flex flex-col pt-6">
            {activeNav === 'Dashboard' ? (
              <Dashboard />
            ) : activeNav === 'Students' ? (
              <StudentsPage />
            ) : (
              <div className="p-[26px_28px_40px]">
                <h2 className="text-2xl font-bold font-sans text-[#0d3349]">{activeNav} Content</h2>
                <p className="mt-4 text-[#64748b]">Under Construction</p>
              </div>
            )}
          </div>
          
          <TodoList />
        </div>
      </main>
    </div>
  );
}
