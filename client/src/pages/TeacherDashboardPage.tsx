import { useState } from 'react';
import { Search, Bell, Mail, ChevronLeft, ChevronRight, PlusCircle, UserCircle, Settings } from '../components/icons';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherStatCard from '../components/TeacherStatCard';
import TeacherSchedule from '../components/TeacherSchedule';
import TeacherWhatsDue from '../components/TeacherWhatsDue';
import TeacherLatestFiles from '../components/TeacherLatestFiles';
import TeacherGrades from '../components/TeacherGrades';
import TeacherAssignments from '../components/TeacherAssignments';
import TeacherClasses from '../components/TeacherClasses';
import TeacherFullSchedule from '../components/TeacherFullSchedule';

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const COURSES = [
    { id: '1', course: 'Math 101', percentage: 63, classes: 5 },
    { id: '2', course: 'Math 102', percentage: 45, classes: 3 },
    { id: '3', course: 'Math 103', percentage: 33, classes: 4 },
    { id: '4', course: 'Math 104', percentage: 25, classes: 2 },
  ];

  const renderDashboardContent = () => (
    <div className="flex-1 p-6 md:p-8 flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[22px] md:text-[24px] font-extrabold text-[#4b3f68] tracking-tight">Courses Progress</h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-sm bg-white border border-[#e7dff0] flex items-center justify-center text-[#778196] hover:text-primary hover:shadow-sm transition-all cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-sm bg-white border border-[#e7dff0] flex items-center justify-center text-[#778196] hover:text-primary hover:shadow-sm transition-all cursor-pointer">
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
        <div className="flex flex-col mb-8">
          <TeacherWhatsDue />
          <TeacherLatestFiles />
        </div>
        <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 flex flex-col w-full">
          <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-gradient-to-r from-[#f5effa] to-white">
            <h3 className="font-sans text-[18px] font-extrabold tracking-tight text-[#4b3f68]">Announcements</h3>
            <button className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#e7dff0] text-primary text-[13px] font-bold px-[12px] py-[8px] uppercase tracking-wider rounded-sm transition-all cursor-pointer">
              <PlusCircle size={14} />
              New Announcement
            </button>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-[12px] p-4 rounded-sm border border-dashed border-[#e7dff0] bg-[#faf8fc] hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-[8px] bg-primary shrink-0 text-white flex items-center justify-center font-bold text-[14px]">
                SA
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-sans text-[15px] font-extrabold text-[#4b3f68] leading-tight group-hover:text-primary transition-colors">Super Admin</h4>
                  <span className="text-[11px] text-[#7c8697] font-semibold">2 hours ago</span>
                </div>
                <p className="text-[13px] text-[#778196] leading-relaxed">
                  Please make sure all final grades for this semester are submitted by Friday at 5:00 PM. The system will be locked for grading review over the weekend. Thank you for your hard work!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[320px] flex flex-col shrink-0 gap-6">
        <div className="h-[400px]">
          <TeacherSchedule />
        </div>
        <TeacherGrades />
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, Icon: any) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#778196]">
      <div className="bg-white p-8 rounded-sm shadow-[0_10px_28px_rgba(57,31,86,0.06)] border border-[#e7dff0] mb-6">
        <Icon size={64} className="text-[#cbd5e1]" strokeWidth={1.5} />
      </div>
      <h2 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">{title} — Coming Soon</h2>
      <p className="text-[14px] text-[#7c8697] mt-2">This section is currently under development.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return renderDashboardContent();
      case 'Assignment': return <TeacherAssignments />;
      case 'Classes': return <TeacherClasses />;
      case 'Schedule': return <TeacherFullSchedule />;
      case 'Settings': return renderPlaceholder('Settings', Settings);
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-[#faf8fc] font-sans antialiased">
      <TeacherSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-[210px] flex flex-col min-h-screen max-w-full overflow-x-hidden relative">
        <header className="h-[58px] bg-white/90 backdrop-blur-md border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">
          <div className="flex-1 max-w-[420px] relative hidden md:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c8697] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search something here..."
              className="w-full py-2 pr-3.5 pl-9 bg-transparent border-[1.5px] border-transparent rounded-sm text-[13px] text-[#1e293b] outline-none transition-all duration-200 focus:bg-white focus:border-[#d8c8e9] focus:ring-[3px] focus:ring-[#6a5182]/5 placeholder:text-[#cbd5e1] font-medium"
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-[#cbd5e1] hover:text-[#7c8697] transition-colors cursor-pointer">
              <Mail size={18} />
            </button>
            <button className="relative text-[#cbd5e1] hover:text-[#7c8697] transition-colors cursor-pointer">
              <Bell size={18} />
            </button>
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            <div className="flex items-center justify-center shrink-0 cursor-pointer text-[#cbd5e1] hover:text-[#4b3f68] transition-colors p-1">
              <UserCircle size={28} strokeWidth={1.5} />
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}