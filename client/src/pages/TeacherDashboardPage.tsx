import { useState } from 'react';
import { Search, Bell, Mail, ChevronLeft, ChevronRight, PlusCircle, ClipboardList, Users, Calendar, Settings } from '../components/icons';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherStatCard from '../components/TeacherStatCard';
import PersonalizedSchedule from '../components/PersonalizedSchedule';
import EnrolledCoursesList from '../components/EnrolledCoursesList';
import TeacherWhatsDue from '../components/TeacherWhatsDue';
import TeacherLatestFiles from '../components/TeacherLatestFiles';
import TeacherGrades from '../components/TeacherGrades';
import ProfileDropdown from '../components/ProfileDropdown';
import AcademyCalendar from '../components/AcademyCalendar';

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  /* ─── Announcements state ──────────────────────────────────── */
  const [announcements, setAnnouncements] = useState([
    { id: 1, author: 'Super Admin', initials: 'SA', time: '2 hours ago', text: 'Please make sure all final grades for this semester are submitted by Friday at 5:00 PM. The system will be locked for grading review over the weekend. Thank you for your hard work!' },
  ]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  const handleAddAnnouncement = () => {
    const trimmed = announcementText.trim();
    if (!trimmed) return;
    setAnnouncements(prev => [{
      id: prev.length + 1,
      author: 'You (Teacher)',
      initials: 'YT',
      time: 'Just now',
      text: trimmed,
    }, ...prev]);
    setAnnouncementText('');
    setIsAnnouncementModalOpen(false);
  };

  const deleteAnnouncement = (id: number | string) => {
    if (window.confirm('Delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

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
            <h2 className="text-[18px] font-extrabold text-[#4b3f68] tracking-tight">Courses Progress</h2>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-sm bg-white border border-[#e7dff0] shadow-sm flex items-center justify-center text-[#64748b] hover:text-primary hover:border-[#d8c8e9] transition-colors cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button className="w-7 h-7 rounded-sm bg-white border border-[#e7dff0] shadow-sm flex items-center justify-center text-[#64748b] hover:text-primary hover:border-[#d8c8e9] transition-colors cursor-pointer">
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

        {/* Calendar Widget */}
        <div className="mb-8">
          <AcademyCalendar assignmentsList={[]} />
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col w-full shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
          <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
            <h3 className="text-[16px] font-bold text-[#4b3f68]">Announcements</h3>
            <button onClick={() => setIsAnnouncementModalOpen(true)} className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#eadff4] text-primary text-[13px] font-semibold px-4 py-2 rounded-sm border border-[#e2d9ed] transition-all cursor-pointer">
              <PlusCircle size={14} />
              New Announcement
            </button>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {announcements.map(a => (
              <div key={a.id} className="flex gap-4 p-4 rounded-sm border border-[#e7dff0] bg-[#fbf8fe] hover:shadow-sm transition-all border-l-[3px] border-l-primary">
                <div className="w-10 h-10 rounded-sm bg-primary shrink-0 text-white flex items-center justify-center font-bold text-[14px]">
                  {a.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#4b3f68]">{a.author}</h4>
                      <span className="text-[11px] text-[#64748b] font-medium">{a.time}</span>
                    </div>
                    <button 
                      onClick={() => deleteAnnouncement(a.id)}
                      className="text-[#94a3b8] hover:text-rose-500 transition-colors p-1"
                      title="Delete Announcement"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Announcement Modal */}
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsAnnouncementModalOpen(false); setAnnouncementText(''); }}>
            <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[18px] font-bold text-[#0d3349]">New Announcement</h3>
                <button onClick={() => { setIsAnnouncementModalOpen(false); setAnnouncementText(''); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleAddAnnouncement(); }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Message</label>
                  <textarea rows={4} value={announcementText} onChange={e => setAnnouncementText(e.target.value)} placeholder="Write your announcement here…" autoFocus className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b] resize-none" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setIsAnnouncementModalOpen(false); setAnnouncementText(''); }} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">Post Announcement</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT SIDEBAR PANEL */}
      <div className="w-full lg:w-[320px] flex flex-col shrink-0 gap-6">
        <div className="h-[400px]">
          <PersonalizedSchedule />
        </div>
        <div className="h-[300px]">
          <EnrolledCoursesList />
        </div>
        <TeacherGrades />
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, Icon: any) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#64748b]">
      <div className="bg-white p-8 rounded-sm shadow-sm border border-[#e7dff0] mb-6">
        <Icon size={64} className="text-[#cbd5e1]" strokeWidth={1.5} />
      </div>
      <h2 className="text-[22px] font-extrabold text-[#4b3f68] tracking-tight">{title} — Coming Soon</h2>
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
    <div className="flex w-full min-h-screen text-[#1e293b] bg-main-bg font-sans antialiased">
      <TeacherSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 ml-[210px] flex flex-col min-h-screen max-w-full overflow-x-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-[58px] bg-white border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">
          <div className="flex-1 max-w-[420px] relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" size={15} />
            <input 
              type="text" 
              placeholder="Search something here..." 
              className="w-full py-2 pr-3.5 pl-9 bg-[#f6f2fb] border border-transparent rounded-full text-[13px] text-[#1e293b] outline-none transition-all duration-200 focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 placeholder:text-[#94a3b8]"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-[#64748b] hover:text-primary transition-colors cursor-pointer">
              <Mail size={18} />
            </button>
            <button className="relative text-[#64748b] hover:text-primary transition-colors cursor-pointer">
              <Bell size={18} />
            </button>
            
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            
            <ProfileDropdown useSimpleIcon={true} />
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

