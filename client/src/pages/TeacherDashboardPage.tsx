import { useState } from 'react';
import { Search, Bell, Mail, ChevronLeft, ChevronRight, PlusCircle, UserCircle, ClipboardList, Users, Calendar, Settings } from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherStatCard from '../components/TeacherStatCard';
import TeacherSchedule from '../components/TeacherSchedule';
import TeacherWhatsDue from '../components/TeacherWhatsDue';
import TeacherLatestFiles from '../components/TeacherLatestFiles';
import TeacherGrades from '../components/TeacherGrades';

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [dateStr, setDateStr] = useState('2026/4/4');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [year, month, day] = val.split('-');
      setDateStr(`${year}/${parseInt(month)}/${parseInt(day)}`);
    }
  };

  const formattedDateForInput = (() => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  })();

  const COURSES = [
    { id: '1', course: 'Math 101', percentage: 63, classes: 5 },
    { id: '2', course: 'Math 102', percentage: 45, classes: 3 },
    { id: '3', course: 'Math 103', percentage: 33, classes: 4 },
    { id: '4', course: 'Math 104', percentage: 25, classes: 2 },
  ];

  const renderDashboardContent = () => (
    <div className="flex-1 p-6 md:p-8 flex flex-col lg:flex-row gap-8 w-full">
      {/* LEFT CENTER (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Courses Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-extrabold text-[#0d3349] tracking-tight">Courses Progress</h2>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-full bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#64748b] hover:text-[#006496] hover:border-[#006496] transition-colors cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button className="w-7 h-7 rounded-full bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#64748b] hover:text-[#006496] hover:border-[#006496] transition-colors cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {COURSES.map(course => (
              <div key={course.id} className="snap-start">
                <TeacherStatCard course={course.course} percentage={course.percentage} classes={course.classes} />
              </div>
            ))}
          </div>
        </div>

        {/* Middle Tables */}
        <div className="flex flex-col mb-8">
          <TeacherWhatsDue />
          <TeacherLatestFiles />
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] flex flex-col w-full">
          <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#0d3349]">Announcements</h3>
            <button className="flex items-center gap-1.5 bg-[#f0fbfc] hover:bg-[#e6f7f9] text-[#006496] text-[13px] font-semibold px-4 py-2 rounded-lg border border-[#bfe7ec] transition-all cursor-pointer">
              <PlusCircle size={14} />
              New Announcement
            </button>
          </div>
          <div className="p-5">
            <div className="flex gap-4 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:shadow-sm transition-all border-l-[3px] border-l-[#10b981]">
              <div className="w-10 h-10 rounded-full bg-[#10b981] shrink-0 text-white flex items-center justify-center font-bold text-[14px]">
                SA
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[14px] font-bold text-[#1e293b]">Super Admin</h4>
                  <span className="text-[11px] text-[#64748b] font-medium">2 hours ago</span>
                </div>
                <p className="text-[13px] text-[#475569] leading-relaxed">
                  Please make sure all final grades for this semester are submitted by Friday at 5:00 PM. The system will be locked for grading review over the weekend. Thank you for your hard work!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR PANEL */}
      <div className="w-full lg:w-[320px] flex flex-col shrink-0">
        <div className="h-[400px]">
          <TeacherSchedule />
        </div>
        
        <TeacherGrades />
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, Icon: any) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#64748b]">
      <div className="bg-white p-8 rounded-full shadow-sm border border-[#e2e8f0] mb-6">
        <Icon size={64} className="text-[#cbd5e1]" strokeWidth={1.5} />
      </div>
      <h2 className="text-[22px] font-extrabold text-[#0d3349] tracking-tight">{title} — Coming Soon</h2>
      <p className="text-[14.5px] mt-2 font-medium">This section is currently under development.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return renderDashboardContent();
      case 'Assignment': return renderPlaceholder('Assignments', ClipboardList);
      case 'Classes': return renderPlaceholder('Classes', Users);
      case 'Schedule': return renderPlaceholder('Schedule', Calendar);
      case 'Settings': return renderPlaceholder('Settings', Settings);
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-[#f0f4f8] font-sans antialiased">
      <TeacherSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 ml-[210px] flex flex-col min-h-screen max-w-full overflow-x-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-[58px] bg-white border-b border-[#e2e8f0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[14.5px] font-bold text-[#0d3349] leading-tight">Welcome Mr. Khalid,</span>
            <div className="relative mt-0.5 w-fit">
              <span className="text-[12px] font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md border border-[#e2e8f0] flex items-center gap-1">
                {dateStr}
                <input 
                  type="date" 
                  value={formattedDateForInput}
                  onChange={handleDateChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </span>
            </div>
          </div>

          <div className="flex-[2] max-w-[420px] relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" size={15} />
            <input 
              type="text" 
              placeholder="Search something here..." 
              className="w-full py-2 pr-3.5 pl-9 bg-[#f8fafc] border border-[#e2e8f0] rounded-full text-[13px] text-[#1e293b] outline-none transition-all duration-200 focus:bg-white focus:border-[#006496] focus:ring-[3px] focus:ring-[#006496]/10 placeholder:text-[#94a3b8]"
            />
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <button className="relative text-[#64748b] hover:text-[#006496] transition-colors cursor-pointer">
              <Mail size={18} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#006496] border-[2px] border-white rounded-full"></span>
            </button>
            <button className="relative text-[#64748b] hover:text-[#006496] transition-colors cursor-pointer">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#ef4444] border-[2px] border-white rounded-full text-[8.5px] text-white font-bold flex items-center justify-center leading-none">3</span>
            </button>
            
            <div className="w-[1px] h-6 bg-[#e2e8f0] mx-1"></div>
            
            <div className="flex items-center justify-center shrink-0 cursor-pointer text-[#64748b] hover:text-[#0d3349] transition-colors p-1">
              <UserCircle size={28} strokeWidth={1.5} />
            </div>
          </div>
        </header>

        {/* MAIN RENDERING AREA */}
        <div className="flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
