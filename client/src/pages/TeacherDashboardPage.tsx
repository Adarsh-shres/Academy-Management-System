import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bell, ChevronLeft, ChevronRight, ClipboardList, FileText, CalendarCheck2, MapPin, Users, PenLine } from '../components/shared/icons';
import TeacherSidebar from '../components/teachers/TeacherSidebar';
import TeacherWhatsDue from '../components/teachers/TeacherWhatsDue';
import ProfileDropdown from '../components/shared/ProfileDropdown';
import AttendanceRosterModal from '../components/teachers/AttendanceRosterModal';
import TeacherAssignmentPage from './TeacherAssignmentPage';
import TeacherClassesPage from './TeacherClassesPage';
import TeacherSchedulePage from './TeacherSchedulePage';
import NotificationBell from '../components/shared/NotificationBell';

/** Components for Teacher Dashboard */


const TeacherAcademyCalendar = ({ selectedDate, setSelectedDate }: { selectedDate: Date, setSelectedDate: (d: Date) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const handler = () => setRefresh(r => r + 1);
    window.addEventListener('notesUpdated', handler);
    return () => window.removeEventListener('notesUpdated', handler);
  }, []);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day; // Sunday is 0
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearStr = currentDate.getFullYear();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const today = new Date();
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  const isSelected = (day: number) => selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();

  const hasNotes = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const saved = localStorage.getItem(`teacher_notes_${dateStr}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch(e) { return false; }
    }
    return false;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col w-full overflow-hidden">
      <div className="bg-[#6a5182] text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span className="font-bold text-[15px]">Academy Calendar</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="hover:text-[#d1c4e9] transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
          <span className="font-semibold text-[13px] uppercase tracking-wider">{monthName} {yearStr}</span>
          <button onClick={nextMonth} className="hover:text-[#d1c4e9] transition-colors cursor-pointer"><ChevronRight size={16} /></button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-7 gap-1 mb-3 text-center">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-[10px] font-bold text-[#6a5182]/60">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 justify-items-center">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="w-[34px] h-[34px]" />;
            
            const todayStyle = isToday(day) ? 'bg-[#6a5182] text-white shadow-sm' : '';
            const selectedStyle = isSelected(day) && !isToday(day) ? 'border border-[#6a5182] bg-white text-[#4b3f68] shadow-sm' : '';
            const normalStyle = !isToday(day) && !isSelected(day) ? 'text-[#475569] hover:bg-[#f6f2fb]' : '';
            const hasEvent = hasNotes(day);

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`relative w-[34px] h-[34px] flex flex-col items-center justify-center rounded-full font-semibold text-[13px] cursor-pointer transition-all ${todayStyle} ${selectedStyle} ${normalStyle}`}
              >
                {day}
                {hasEvent && !isToday(day) && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#a78bfa]"></div>}
                {hasEvent && isToday(day) && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white opacity-80"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AllNotesModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [allNotes, setAllNotes] = useState<{ date: string, dateObj: Date, notes: any[], key: string }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const updateNotes = () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('teacher_notes_'));
      const grouped: { date: string, dateObj: Date, notes: any[], key: string }[] = [];
      keys.forEach(k => {
        try {
          const arr = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(arr) && arr.length > 0) {
            const dateStr = k.replace('teacher_notes_', ''); 
            const parts = dateStr.split('-');
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const formatted = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            grouped.push({ date: formatted, dateObj, notes: arr, key: k });
          }
        } catch(e) {}
      });
      grouped.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
      setAllNotes(grouped);
    };
    updateNotes();
    window.addEventListener('notesUpdated', updateNotes);
    return () => window.removeEventListener('notesUpdated', updateNotes);
  }, [isOpen]);

  const deleteNote = (key: string, id: string) => {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = arr.filter((n: any) => n.id !== id);
      if (updated.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('notesUpdated'));
    } catch(e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#e7dff0] bg-[#fbf8fe]">
          <h2 className="text-[18px] font-bold text-[#4b3f68]">All Notes</h2>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#4b3f68] transition-colors cursor-pointer bg-white border border-[#e7dff0] rounded-full p-1.5 shadow-sm">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8 bg-white">
          {allNotes.length === 0 ? (
            <div className="text-center py-10 text-[#94a3b8] font-medium">No notes saved yet.</div>
          ) : (
            allNotes.map(group => (
              <div key={group.date}>
                <h3 className="text-[14px] font-extrabold text-[#6a5182] mb-3">{group.date}</h3>
                <div className="flex flex-col gap-3">
                  {group.notes.map(note => (
                    <div key={note.id} className="p-4 rounded-xl border border-[#e7dff0] bg-[#fbf8fe] relative group shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
                      <p className="text-[13px] font-medium text-[#475569] pr-6 mb-2 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                      <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide">{note.timestamp}</div>
                      <button 
                        onClick={() => deleteNote(group.key, note.id)}
                        className="absolute top-3 right-3 text-[#cbd5e1] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TeacherNotesWidget = ({ selectedDate }: { selectedDate: Date }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const storageKey = `teacher_notes_${dateStr}`;
  const displayDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setNotes(JSON.parse(saved)); } catch (e) { setNotes([]); }
    } else {
      setNotes([]);
    }
    setNewNote('');
  }, [storageKey]);

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { setNotes(JSON.parse(saved)); } catch (e) { setNotes([]); }
      } else {
        setNotes([]);
      }
    };
    window.addEventListener('notesUpdated', handler);
    return () => window.removeEventListener('notesUpdated', handler);
  }, [storageKey]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(' at', ' ·')
    };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewNote('');
    window.dispatchEvent(new Event('notesUpdated'));
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (updated.length === 0) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    window.dispatchEvent(new Event('notesUpdated'));
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col w-full h-full">
        <div className="p-5 border-b border-[#e7dff0] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#f6f2fb] flex items-center justify-center text-[#6a5182]">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#4b3f68]">Notes for {displayDate}</h3>
        </div>
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-2">
            <textarea 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              className="w-full bg-[#f6f2fb] border border-[#e7dff0] rounded-xl p-3 text-[13px] text-[#475569] resize-none focus:outline-none focus:border-[#6a5182] transition-colors"
              rows={3}
            />
            <button 
              onClick={addNote}
              className="self-end bg-[#6a5182] hover:bg-[#5b4671] text-white px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer"
            >
              Add Note
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
            {notes.length === 0 ? (
              <div className="text-center py-6 text-[#94a3b8] text-[13px] font-medium">
                No notes for this date. Add one above.
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="p-4 rounded-xl border border-[#e7dff0] bg-white relative group shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
                  <p className="text-[13px] font-medium text-[#475569] pr-6 mb-2 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                  <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide">{note.timestamp}</div>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-3 right-3 text-[#cbd5e1] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setShowAllNotes(true)}
            className="self-end mt-auto pt-3 text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] flex items-center gap-1 transition-colors cursor-pointer"
          >
            See All Notes
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
      <AllNotesModal isOpen={showAllNotes} onClose={() => setShowAllNotes(false)} />
    </>
  );
};

const TeacherCalendarAndNotesSection = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start w-full">
      <div className="w-full md:w-[55%] shrink-0">
        <TeacherAcademyCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>
      <div className="w-full md:flex-1">
        <TeacherNotesWidget selectedDate={selectedDate} />
      </div>
    </div>
  );
};

function trimTime(value?: string | null) {
  if (!value) return 'Time not set';
  return value.slice(0, 5);
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function classLabelForRow(classRow?: any) {
  if (!classRow) return 'Independent teaching block';
  const batch = classRow.batches?.code?.trim() || classRow.batches?.name?.trim();
  return batch ? `${classRow.name?.trim() || 'Class'} | ${batch}` : (classRow.name?.trim() || 'Class');
}

const TeachingScheduleToday = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = getLocalDateString();

  useEffect(() => {
    async function loadSchedule() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [classResult, teacherScheduleResult, classScheduleResult] = await Promise.all([
          supabase
            .from('classes')
            .select('id, name, room, batches(name, code)')
            .or(`teacher_id.eq.${user.id},teacher_ids.cs.{${user.id}}`),
          supabase
            .from('teacher_schedules')
            .select('id, teacher_id, class_id, schedule_type, day_of_week, schedule_date, start_time, end_time, title, room, notes, is_cancelled')
            .eq('teacher_id', user.id),
          supabase
            .from('class_schedules')
            .select('id, class_id, course_id, teacher_id, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes, classes(name, room, batches(name, code)), courses(name, course_code)')
            .eq('teacher_id', user.id),
        ]);

        const classes = (classResult.data as any[] | null) ?? [];
        const classMap = new Map(classes.map((classRow) => [classRow.id, classRow]));

        const classScheduleEntries = ((classScheduleResult.data as any[] | null) ?? []).map((entry) => ({
          id: `class-${entry.id}`,
          start_time: entry.start_time,
          end_time: entry.end_time,
          schedule_type: entry.schedule_type,
          day_of_week: entry.day_of_week,
          schedule_date: entry.schedule_date,
          title: entry.courses?.name?.trim() || entry.courses?.course_code?.trim() || entry.classes?.name?.trim() || 'Class schedule',
          room: entry.room || entry.classes?.room || null,
          className: classLabelForRow(entry.classes ?? classMap.get(entry.class_id)),
          classLabel: entry.classes?.name?.trim() || classMap.get(entry.class_id)?.name?.trim() || 'Class',
          is_cancelled: false,
          source: 'class'
        }));

        let teacherScheduleEntries: any[] = [];
        if (!teacherScheduleResult.error || teacherScheduleResult.error.code === '42P01') {
           teacherScheduleEntries = ((teacherScheduleResult.data as any[] | null) ?? [])
            .filter((entry) => !entry.is_cancelled)
            .map((entry) => ({
              ...entry,
              className: classLabelForRow(entry.class_id ? classMap.get(entry.class_id) : null),
              classLabel: entry.class_id ? (classMap.get(entry.class_id)?.name?.trim() || 'Class') : 'Independent teaching block',
              source: 'teacher'
            }));
        }

        const allEntries = [...classScheduleEntries, ...teacherScheduleEntries];
        const todays = allEntries.filter((entry) => (
          (entry.schedule_type === 'weekly' && entry.day_of_week === todayDay)
          || (entry.schedule_type === 'one_time' && entry.schedule_date === todayDate)
        )).sort((a, b) => `${a.start_time}${a.end_time}`.localeCompare(`${b.start_time}${b.end_time}`));

        setEntries(todays);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, [todayDate, todayDay]);

  return (
    <div className="bg-white rounded-2xl border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col w-full">
      <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 size={18} className="text-[#6a5182]" />
            <h3 className="text-[16px] font-extrabold text-[#4b3f68]">Teaching Schedule Today</h3>
          </div>
          <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{todayDay}</p>
        </div>
        <span className="rounded-md bg-white border border-[#e2d9ed] px-2.5 py-1 text-[12px] font-bold text-[#64748b] h-fit">
          {entries.length}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3.5">
        {loading ? (
           <div className="flex flex-col gap-4">
              <div className="h-[120px] bg-slate-100 animate-pulse rounded-xl" />
              <div className="h-[120px] bg-slate-100 animate-pulse rounded-xl" />
           </div>
        ) : entries.length === 0 ? (
           <div className="text-center py-6 text-[#94a3b8] text-[13px] font-medium">
             No teaching sessions today
           </div>
        ) : (
           entries.map((entry) => (
             <div key={entry.id} className="border-l-[4px] border-l-[#6a5182] bg-white rounded-xl shadow-[0_10px_28px_rgba(57,31,86,0.06)] p-4 relative overflow-hidden">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#e0f2fe] text-[#0369a1]">
                    {trimTime(entry.start_time)}{entry.end_time ? ` - ${trimTime(entry.end_time)}` : ''}
                  </span>
                  <span className="bg-[#f8fafc] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {entry.schedule_type === 'weekly' ? entry.day_of_week : (entry.schedule_date ? new Date(`${entry.schedule_date}T00:00:00`).toLocaleDateString() : 'Today')}
                  </span>
                </div>
                <h4 className="text-[16px] font-semibold text-gray-800 mb-1 leading-tight">{entry.title}</h4>
                <p className="text-[14px] text-gray-500 mb-3">{entry.className}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-gray-500">
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {entry.room || 'Room not set'}</span>
                  <span className="flex items-center gap-1.5"><Users size={14} /> {entry.classLabel}</span>
                </div>
                <p className="text-[12px] text-gray-400 mt-2 capitalize">{entry.source === 'class' ? 'Class Session' : 'Teacher Block'}</p>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

const ActiveCoursesWidget = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);

        if (data) {
           const active = data.filter(c => c.status ? c.status === 'active' : true);
           setCourses(active);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col w-full">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between">
         <h3 className="text-[16px] font-bold text-[#4b3f68]">Active Classes</h3>
      </div>
      <div className="p-5 flex flex-col gap-3">
        {loading ? (
           <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#6a5182] border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : courses.length === 0 ? (
           <div className="text-center py-6 text-[#94a3b8] text-[13px] font-medium">
             No active courses found.
           </div>
        ) : (
           <>
             {courses.slice(0, 4).map((c, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-[#e7dff0] hover:bg-[#fbf8fe] transition-colors">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#4b3f68]">{c.name || c.course || 'Unnamed'}</h4>
                    <p className="text-[11px] text-[#64748b] font-medium">
                      {c.student_ids ? c.student_ids.length : 0} Students
                    </p>
                  </div>
                  <Link to={`/teacher/classes/${c.id}`} className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68]">
                    View
                  </Link>
               </div>
             ))}
             {courses.length > 4 && (
               <Link to="/teacher/classes" className="text-center text-[13px] font-bold text-[#6a5182] hover:text-[#4b3f68] mt-2 block">
                 View All ({courses.length})
               </Link>
             )}
           </>
        )}
      </div>
    </div>
  );
};


/** Coordinates teacher dashboard tabs and dashboard-side actions. */
export default function TeacherDashboardPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.targetTab || 'Dashboard');

  const goToAssignments = () => {
    setActiveTab('Assignment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<any>(null);

  const handleTakeAttendance = (course: any) => {
    setSelectedClassForAttendance(course);
    setIsAttendanceModalOpen(true);
  };

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000); // minutes
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return `${Math.floor(diff/1440)}d ago`;
  };

  /* ─── Overview stats & announcements state ─────────────────── */
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingCounters, setIsLoadingCounters] = useState(true);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState({ assignments: 0, draftQuizzes: 0, students: 0 });
  const [draftQuizzes, setDraftQuizzes] = useState<any[]>([]);
  const [teacherClassesCache, setTeacherClassesCache] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('All');

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoadingCounters(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        console.log('[Dashboard] currentUser:', user.id, user.email);

        // ── Diagnostic logs ──────────────────────────────────────
        const [sampleClassesRes, teacherClassesByIdRes, allQuizzesRes, sampleUsersRes] = await Promise.all([
          supabase.from('classes').select('*').limit(3),
          supabase.from('classes').select('*').eq('teacher_id', user.id),
          supabase.from('quizzes').select('*').limit(5),
          supabase.from('users').select('*').limit(2),
        ]);
        console.log('[Dashboard] sample classes (no filter):', sampleClassesRes.data);
        console.log('[Dashboard] classes by teacher_id:', teacherClassesByIdRes.data, 'error:', teacherClassesByIdRes.error);
        console.log('[Dashboard] sample quizzes:', allQuizzesRes.data, 'error:', allQuizzesRes.error);
        console.log('[Dashboard] quiz statuses:', allQuizzesRes.data?.map((q: any) => q.status));
        console.log('[Dashboard] sample users:', sampleUsersRes.data, 'error:', sampleUsersRes.error);
        // ─────────────────────────────────────────────────────────

        // Fetch announcements
        const { data: announcementData } = await supabase
          .from('notifications')
          .select('*')
          .eq('type', 'announcement')
          .order('created_at', { ascending: false })
          .limit(5);

        if (announcementData && announcementData.length > 0) {
          setAnnouncements(announcementData.map((n: any) => ({
            id: n.id,
            author: n.sender_name || 'Admin',
            initials: (n.sender_name || 'AD').substring(0, 2).toUpperCase(),
            time: getRelativeTime(n.created_at),
            text: n.message || n.content || '',
          })));
        } else {
          setAnnouncements([]);
        }

        // Step 1 — Get teacher's classes: try teacher_id first, then teacher_ids array, then created_by
        let teacherClasses: any[] | null = teacherClassesByIdRes.data;
        if (!teacherClasses || teacherClasses.length === 0) {
          // try teacher_ids array column
          const { data: byArray } = await supabase
            .from('classes')
            .select('id, name, student_ids')
            .contains('teacher_ids', [user.id]);
          if (byArray && byArray.length > 0) {
            teacherClasses = byArray;
            console.log('[Dashboard] classes found via teacher_ids array:', byArray.length);
          } else {
            // try created_by
            const { data: byCreatedBy } = await supabase
              .from('classes')
              .select('id, name, student_ids')
              .eq('created_by', user.id);
            if (byCreatedBy && byCreatedBy.length > 0) {
              teacherClasses = byCreatedBy;
              console.log('[Dashboard] classes found via created_by:', byCreatedBy.length);
            }
          }
        }
        console.log('[Dashboard] final teacherClasses:', teacherClasses?.length, teacherClasses?.map((c: any) => c.id));

        const classIds = teacherClasses?.map((c: any) => c.id) || [];
        console.log('[Dashboard] classIds for quiz query:', classIds);
        setTeacherClassesCache(
          (teacherClasses || []).map((c: any) => ({
            id: c.id,
            name: c.name || sampleClassesRes.data?.find((sc: any) => sc.id === c.id)?.name || 'Class',
            student_ids: c.student_ids || [],
          }))
        );
        // Step 2 — Total assignments + all quizzes (filter client-side for draft)
        let assignmentCount = 0;
        let drafts: any[] = [];
        if (classIds.length > 0) {
          const [assignRes, quizRes] = await Promise.all([
            supabase
              .from('assignments')
              .select('*', { count: 'exact', head: true })
              .in('class_id', classIds),
            supabase
              .from('quizzes')
              .select('*')
              .in('class_id', classIds),
          ]);
          assignmentCount = assignRes.count || 0;
          const allQuizzesData = quizRes.data || [];
          console.log('[Dashboard] quiz raw data:', JSON.stringify(allQuizzesData));
          drafts = allQuizzesData.filter((q: any) => q.is_published === false);
          console.log('[Dashboard] filtered drafts (is_published===false):', drafts);
        }
        setDraftQuizzes(drafts);

        // Step 3 — Unique student IDs + fetch their details
        const allStudentIds = (teacherClasses || []).flatMap((c: any) => c.student_ids || []);
        const uniqueStudentIds = [...new Set<string>(allStudentIds)];
        console.log('[Dashboard] uniqueStudentIds:', uniqueStudentIds);

        if (uniqueStudentIds.length > 0) {
          // Use the same pattern as ViewStudentsModal — fetch all students by role, filter client-side
          const { data: allStudents, error: studentsError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('role', 'student');
          console.log('[Dashboard] users role=student:', allStudents?.length, 'error:', studentsError);

          if (allStudents && !studentsError) {
            // Filter to only students in our classes
            const uniqueSet = new Set(uniqueStudentIds);
            const matchedStudents = allStudents
              .filter((s: any) => uniqueSet.has(s.id))
              .map((s: any) => ({
                id: s.id,
                full_name: s.name || 'Unknown',
                email: s.email || '',
              }));
            console.log('[Dashboard] matched students:', matchedStudents.length);
            setStudentsList(matchedStudents);
          } else {
            // Fallback: build from class membership
            console.log('[Dashboard] users query failed, using class-data fallback');
            const studentListFromClasses = (teacherClasses || []).flatMap((cls: any) =>
              (cls.student_ids || []).map((sid: string) => ({
                id: sid,
                full_name: 'Student',
                email: '',
              }))
            );
            const uniqueStudents = Array.from(
              new Map(studentListFromClasses.map((s: any) => [s.id, s])).values()
            );
            setStudentsList(uniqueStudents as any[]);
          }
        } else {
          setStudentsList([]);
        }
        const uniqueStudentCount = uniqueStudentIds.length;

        setOverviewStats({
          assignments: assignmentCount,
          draftQuizzes: drafts.length,
          students: uniqueStudentCount,
        });

        // Recent assignments for TeacherWhatsDue widget
        if (classIds.length > 0) {
          const { data: recentData } = await supabase
            .from('assignments')
            .select('*')
            .in('class_id', classIds)
            .order('created_at', { ascending: false })
            .limit(5);
          setRecentAssignments(recentData || []);
        } else {
          setRecentAssignments([]);
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Card 1 — Total Assignments */}
            <div
              onClick={goToAssignments}
              className="cursor-pointer bg-white rounded-2xl p-6 border border-[#e7dff0] flex flex-col items-center text-center shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-[#ede9f5] flex items-center justify-center mx-auto mb-3 text-[#6a5182]">
                <FileText size={22} />
              </div>
              <h4 className="text-3xl font-bold text-gray-800">{isLoadingCounters ? '...' : overviewStats.assignments}</h4>
              <p className="text-sm text-gray-500 mt-1">Total Assignments</p>
              <span
                onClick={(e) => { e.stopPropagation(); goToAssignments(); }}
                className="text-xs font-semibold text-[#6a5182] mt-3 cursor-pointer hover:underline"
              >
                View all →
              </span>
            </div>

            {/* Card 2 — Draft Quizzes */}
            <div
              onClick={() => setShowDraftModal(true)}
              className="cursor-pointer bg-white rounded-2xl p-6 border border-[#e7dff0] flex flex-col items-center text-center shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-[#fef9c3] flex items-center justify-center mx-auto mb-3 text-[#ca8a04]">
                <PenLine size={22} />
              </div>
              <h4 className="text-3xl font-bold text-gray-800">{isLoadingCounters ? '...' : overviewStats.draftQuizzes}</h4>
              <p className="text-sm text-gray-500 mt-1">Draft Quizzes</p>
              <span
                onClick={(e) => { e.stopPropagation(); setShowDraftModal(true); }}
                className="text-xs font-semibold text-[#6a5182] mt-3 cursor-pointer hover:underline"
              >
                View all →
              </span>
            </div>

            {/* Card 3 — Total Students */}
            <div
              onClick={() => setShowStudentsModal(true)}
              className="cursor-pointer bg-white rounded-2xl p-6 border border-[#e7dff0] flex flex-col items-center text-center shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-[#e0f2fe] flex items-center justify-center mx-auto mb-3 text-[#0369a1]">
                <Users size={22} />
              </div>
              <h4 className="text-3xl font-bold text-gray-800">{isLoadingCounters ? '...' : overviewStats.students}</h4>
              <p className="text-sm text-gray-500 mt-1">Total Students</p>
              <span
                onClick={(e) => { e.stopPropagation(); setShowStudentsModal(true); }}
                className="text-xs font-semibold text-[#6a5182] mt-3 cursor-pointer hover:underline"
              >
                View all →
              </span>
            </div>

          </div>
        </div>

        {/* ── Draft Quizzes Modal ────────────────────────────── */}
        {showDraftModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDraftModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-[#e7dff0] bg-[#fbf8fe]">
                <div className="flex items-center gap-2">
                  <PenLine size={18} className="text-[#ca8a04]" />
                  <h2 className="text-[17px] font-bold text-[#4b3f68]">Draft Quizzes</h2>
                </div>
                <button onClick={() => setShowDraftModal(false)} className="text-[#64748b] hover:text-[#4b3f68] cursor-pointer bg-white border border-[#e7dff0] rounded-full p-1.5 shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="overflow-y-auto p-5 flex flex-col gap-3">
                {draftQuizzes.length === 0 ? (
                  <div className="text-center py-10 text-[#94a3b8] font-medium text-[14px]">✅ No draft quizzes — all published!</div>
                ) : (
                  draftQuizzes.map(quiz => {
                    const className = teacherClassesCache.find((c: any) => c.id === quiz.class_id)?.name || 'Unknown Class';
                    const dueDate = quiz.due_date ? new Date(quiz.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';
                    return (
                      <div key={quiz.id} className="bg-[#f6f2fb] rounded-xl p-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-[14px] truncate">{quiz.title || 'Untitled Quiz'}</p>
                          <p className="text-[12px] text-[#64748b] mt-0.5">Class: {className} · Due: {dueDate}</p>
                        </div>
                        <button
                          onClick={async () => {
                            const { error } = await supabase.from('quizzes').update({ is_published: true }).eq('id', quiz.id);
                            if (!error) {
                              setDraftQuizzes(prev => prev.filter(q => q.id !== quiz.id));
                              setOverviewStats(prev => ({ ...prev, draftQuizzes: prev.draftQuizzes - 1 }));
                            }
                          }}
                          className="shrink-0 bg-[#16a34a] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#15803d] transition font-semibold cursor-pointer"
                        >
                          Publish
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Total Students Modal ───────────────────────────── */}
        {showStudentsModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowStudentsModal(false); setStudentSearch(''); setStudentClassFilter('All'); }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-[#e7dff0] bg-[#fbf8fe]">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#0369a1]" />
                  <h2 className="text-[17px] font-bold text-[#4b3f68]">All Students</h2>
                  <span className="bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold px-2 py-0.5 rounded-full">{studentsList.length} students</span>
                </div>
                <button onClick={() => { setShowStudentsModal(false); setStudentSearch(''); setStudentClassFilter('All'); }} className="text-[#64748b] hover:text-[#4b3f68] cursor-pointer bg-white border border-[#e7dff0] rounded-full p-1.5 shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-5 pt-4">
                <input
                  type="text"
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full border border-[#e7dff0] rounded-xl px-4 py-2 bg-[#f6f2fb] text-sm focus:outline-none focus:border-[#6a5182] transition-colors"
                />
              </div>
              {/* Class filter */}
              <div className="px-5 pt-3 flex items-center gap-2 flex-wrap">
                <select
                  value={studentClassFilter}
                  onChange={e => setStudentClassFilter(e.target.value)}
                  className="text-xs border border-[#e7dff0] rounded-lg px-2 py-1 bg-[#f6f2fb] text-[#6a5182] cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  {teacherClassesCache.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>{cls.name || 'Class'}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-y-auto p-5 flex flex-col gap-1">
                {(() => {
                  const filtered = studentsList
                    .filter(s => {
                      const matchesSearch = !studentSearch ||
                        (s.full_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.email || '').toLowerCase().includes(studentSearch.toLowerCase());
                      const matchesClass = studentClassFilter === 'All' ||
                        teacherClassesCache.find((c: any) => c.id === studentClassFilter)?.student_ids?.includes(s.id);
                      return matchesSearch && matchesClass;
                    })
                    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

                  if (filtered.length === 0) {
                    return <div className="text-center py-10 text-[#94a3b8] font-medium text-[14px]">No students found.</div>;
                  }

                  return filtered.map(student => {
                    const initials = (student.full_name || 'S').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
                    const studentClasses = teacherClassesCache.filter((c: any) => (c.student_ids || []).includes(student.id));
                    return (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f6f2fb] transition">
                        <div className="w-9 h-9 rounded-full bg-[#6a5182] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] text-gray-800 leading-tight">{student.full_name || 'Unknown'}</p>
                          <p className="text-[12px] text-[#64748b] truncate">{student.email || ''}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {studentClasses.map((c: any) => (
                            <span key={c.id} className="bg-[#ede9f5] text-[#6a5182] text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">{c.name}</span>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 mb-8">
          <TeacherWhatsDue recentAssignments={recentAssignments} isLoading={isLoadingCounters} />
          
          <div className="w-full mt-4">
            <TeacherCalendarAndNotesSection />
          </div>
        </div>

      </div>

      <div className="w-full lg:w-[320px] flex flex-col shrink-0 gap-8 pb-10">
        <div className="h-auto">
          <TeachingScheduleToday />
        </div>
        
        <div className="h-[1px] w-[80%] mx-auto bg-gradient-to-r from-transparent via-[#e7dff0] to-transparent"></div>
        
        <div className="h-auto">
          <ActiveCoursesWidget />
        </div>
      </div>
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
            <NotificationBell />
            
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

