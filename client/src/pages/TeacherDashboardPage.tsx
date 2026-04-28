import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Mail, ChevronLeft, ChevronRight, PlusCircle, ClipboardList, Users, Calendar, FileText, CheckCircle } from '../components/icons';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherStatCard from '../components/TeacherStatCard';
import PersonalizedSchedule from '../components/PersonalizedSchedule';
import EnrolledCoursesList from '../components/EnrolledCoursesList';
import TeacherWhatsDue from '../components/TeacherWhatsDue';
import ProfileDropdown from '../components/ProfileDropdown';
import AttendanceRosterModal from '../components/AttendanceRosterModal';
import TeacherAssignmentPage from './TeacherAssignmentPage';
import TeacherClassesPage from './TeacherClassesPage';
import TeacherSchedulePage from './TeacherSchedulePage';

/** Shows the monthly academic calendar for the teacher dashboard. */
const TeacherInstitutionalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));

  const prevMonth = () => {
     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearStr = currentDate.getFullYear();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isAcademic = (day: number) => [7, 14, 21].includes(day);
  const isEvent = (day: number) => [10, 22].includes(day);
  
  const getDayStyle = (day: number, index: number) => {
    const colIndex = index % 7; 
    const isWeekend = colIndex === 5 || colIndex === 6;

    if (isWeekend) return "text-[#ef4444] hover:bg-[#ffe4e6]";
    if (isAcademic(day)) return "text-[#3b82f6] hover:bg-[#dbeafe]";
    if (isEvent(day)) return "text-[#f59e0b] hover:bg-[#fef3c7]";
    return "text-[#475569] hover:bg-[#f3eff7]";
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] p-6 shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col w-full">
       <div className="flex flex-col items-center justify-center mb-6 border-b border-[#e7dff0] pb-4">
         <h2 className="text-[16px] font-extrabold text-[#4b3f68] tracking-wide mb-1">Academic Calendar</h2>
         <p className="text-[12px] font-medium text-[#64748b]">Institutional Timings</p>
       </div>
       
       <div className="w-full max-w-[260px] mx-auto flex flex-col items-center flex-1">
         <div className="flex justify-between items-center w-full mb-6 px-2">
           <button onClick={prevMonth} className="text-[#64748b] hover:text-[#6a5182] transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
           <h3 className="text-[13.5px] font-extrabold text-[#4b3f68] tracking-wide">{monthName} {yearStr}</h3>
           <button onClick={nextMonth} className="text-[#64748b] hover:text-[#6a5182] transition-colors cursor-pointer"><ChevronRight size={16} /></button>
         </div>
         
         <div className="grid grid-cols-7 gap-2 w-full mb-3 text-center">
           {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
              <div key={d} className="text-[10px] font-bold text-[#94a3b8]">{d}</div>
           ))}
         </div>
         
         <div className="grid grid-cols-7 gap-2 w-full mb-6 justify-items-center">
           {days.map((day, idx) => {
              const isClickable = day ? 'cursor-pointer' : '';
              const dayStyle = day ? getDayStyle(day, idx) : '';
              return (
                <div key={idx} className={`w-[30px] h-[30px] flex items-center justify-center rounded-sm font-bold text-[12.5px] transition-colors ${dayStyle} ${isClickable}`}>
                  {day || ''}
                </div>
              );
           })}
         </div>

         <div className="w-full mt-auto pt-4 border-t border-[#e7dff0] flex gap-3 flex-wrap items-center justify-center text-[11px] font-bold text-[#64748b]">
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></div> Academic</div>
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#fbbf24]"></div> Event</div>
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]"></div> Holiday</div>
         </div>
       </div>
    </div>
  );
};

import { useLocation } from 'react-router-dom';

/** Coordinates teacher dashboard tabs and dashboard-side actions. */
export default function TeacherDashboardPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.targetTab || 'Dashboard');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<any>(null);

  const handleTakeAttendance = (course: any) => {
    setSelectedClassForAttendance(course);
    setIsAttendanceModalOpen(true);
  };

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

  const [isLoadingCounters, setIsLoadingCounters] = useState(true);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [pendingGradesCount, setPendingGradesCount] = useState(0);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoadingCounters(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { count: assignCount } = await supabase
          .from('assignments')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', user.id);
        
        const { data: recent } = await supabase
          .from('assignments')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!recent || recent.length === 0) {
            setTotalAssignments(0);
            setRecentAssignments([]);
            setPendingGradesCount(0);
         } else {
           setTotalAssignments(assignCount || 0);
           setRecentAssignments(recent);
           
           const { data: myAssignments } = await supabase.from('assignments').select('id').eq('teacher_id', user.id);
           if (myAssignments && myAssignments.length > 0) {
             const assignmentIds = myAssignments.map((a: any) => a.id);
             const { count: pGraded } = await supabase
               .from('submissions')
               .select('id', { count: 'exact', head: true })
               .in('assignment_id', assignmentIds)
               .is('grade', null)
               .not('file_url', 'is', null);
             
             setPendingGradesCount(pGraded || 0);
           } else {
             setPendingGradesCount(0);
           }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoadingCounters(false);
      }
    }
    
    if (activeTab === 'Dashboard') {
      loadDashboardData();
    }
  }, [activeTab]);

  const renderDashboardContent = () => (
    <div className="flex-1 p-6 md:p-8 flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col w-full shadow-[0_10px_28px_rgba(57,31,86,0.06)] mb-8">
          <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
            <h3 className="text-[16px] font-bold text-[#4b3f68]">Announcements</h3>
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
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-extrabold text-[#4b3f68] tracking-tight">Overview</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
             <div className="snap-start bg-white rounded-sm p-6 border border-[#e7dff0] flex flex-col items-center justify-center min-w-[200px] shrink-0 shadow-[0_10px_28px_rgba(57,31,86,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)]">
                <div className="w-12 h-12 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182] mb-3">
                   <FileText size={24} />
                </div>
                <h4 className="text-[28px] font-extrabold text-[#4b3f68] leading-none mb-1">{isLoadingCounters ? '...' : totalAssignments}</h4>
                <p className="text-[13px] text-[#64748b] font-medium">Total Assignments</p>
             </div>
             
             <div className="snap-start bg-white rounded-sm p-6 border border-[#e7dff0] flex flex-col items-center justify-center min-w-[200px] shrink-0 shadow-[0_10px_28px_rgba(57,31,86,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)]">
                <div className="w-12 h-12 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] mb-3">
                   <ClipboardList size={24} />
                </div>
                <h4 className="text-[28px] font-extrabold text-[#4b3f68] leading-none mb-1">{isLoadingCounters ? '...' : pendingGradesCount}</h4>
                <p className="text-[13px] text-[#64748b] font-medium">Pending Grades</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-8">
          <TeacherWhatsDue recentAssignments={recentAssignments} isLoading={isLoadingCounters} />
          
          <div className="w-full flex items-center justify-center mt-4">
            <div className="w-full max-w-[500px]">
              <TeacherInstitutionalCalendar />
            </div>
          </div>
        </div>

      </div>

      <div className="w-full lg:w-[320px] flex flex-col shrink-0 gap-8 pb-10">
        <div className="h-auto">
          <PersonalizedSchedule onTakeAttendance={handleTakeAttendance} />
        </div>
        
        <div className="h-[1px] w-[80%] mx-auto bg-gradient-to-r from-transparent via-[#e7dff0] to-transparent"></div>
        
        <div className="h-auto">
          <EnrolledCoursesList />
        </div>
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
      case 'Assignment': return <TeacherAssignmentPage />;
      case 'Classes': return <TeacherClassesPage />;
      case 'Schedule': return <TeacherSchedulePage />;
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="flex w-full min-h-screen text-[#1e293b] bg-main-bg font-sans antialiased">
      <TeacherSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 ml-[210px] flex flex-col min-h-screen max-w-full overflow-x-hidden">
        
        <header className="h-[58px] bg-white border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shrink-0">

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-[#64748b] hover:text-primary transition-colors cursor-pointer">
              <Mail size={18} />
            </button>
            <button className="relative text-[#64748b] hover:text-primary transition-colors cursor-pointer">
              <Bell size={18} />
            </button>
            
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            
            <ProfileDropdown />
          </div>
        </header>

        <div className="flex-1 flex flex-col relative">
          {renderContent()}

          <AttendanceRosterModal 
            isOpen={isAttendanceModalOpen} 
            onClose={() => {
              setIsAttendanceModalOpen(false);
              setSelectedClassForAttendance(null);
            }} 
            courseName={selectedClassForAttendance?.course}
          />
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

