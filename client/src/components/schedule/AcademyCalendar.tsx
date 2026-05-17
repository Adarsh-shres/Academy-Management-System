import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Assignment {
  deadline: string;
  status: string;
}

export default function AcademyCalendar({ assignmentsList = [] }: { assignmentsList?: Assignment[] }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /** Format a day number into YYYY-MM-DD for consistent storage */
  const formatDate = useCallback((day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }, [year, month]);

  /** Fetch all notes for the current month on mount */
  useEffect(() => {
    if (!user) return;

    const fetchMonthNotes = async () => {
      try {
        const startDate = formatDate(1);
        const endDate = formatDate(daysInMonth);

        const { data, error } = await supabase
          .from('calendar_notes')
          .select('date, note')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) {
          console.error('Error fetching calendar notes:', error);
          return;
        }

        if (data) {
          const notesMap: Record<string, string> = {};
          data.forEach((row: any) => {
            notesMap[row.date] = row.note;
          });
          setNotes(notesMap);
        }
      } catch (err: any) {
        console.error('Error fetching calendar notes:', err);
      }
    };

    void fetchMonthNotes();
  }, [user, formatDate, daysInMonth]);

  /** Fetch a specific note when a date is clicked */
  useEffect(() => {
    if (selectedDate === null || !user) return;

    const dateStr = formatDate(selectedDate);

    // Use cached note if available
    if (notes[dateStr] !== undefined) {
      setCurrentNote(notes[dateStr]);
      return;
    }

    const fetchNote = async () => {
      setIsLoadingNote(true);
      setNoteError(null);
      try {
        const { data, error } = await supabase
          .from('calendar_notes')
          .select('note')
          .eq('user_id', user.id)
          .eq('date', dateStr)
          .maybeSingle();

        if (error) {
          console.error('Error fetching note:', error);
          setNoteError('Failed to load note');
          return;
        }

        const noteText = data?.note || '';
        setCurrentNote(noteText);
        setNotes(prev => ({ ...prev, [dateStr]: noteText }));
      } catch (err: any) {
        console.error('Error fetching note:', err);
        setNoteError('Failed to load note');
      } finally {
        setIsLoadingNote(false);
      }
    };

    void fetchNote();
  }, [selectedDate, user, formatDate]);

  /** Save note via upsert */
  const handleSaveNote = async () => {
    if (selectedDate === null || !user) return;

    const dateStr = formatDate(selectedDate);
    setIsSaving(true);
    setNoteError(null);

    try {
      const { error } = await supabase
        .from('calendar_notes')
        .upsert(
          { user_id: user.id, date: dateStr, note: currentNote },
          { onConflict: 'user_id,date' }
        );

      if (error) {
        console.error('Error saving note:', error);
        setNoteError('Failed to save note');
        return;
      }

      setNotes(prev => ({ ...prev, [dateStr]: currentNote }));
      setSelectedDate(null);
    } catch (err: any) {
      console.error('Error saving note:', err);
      setNoteError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const deadlineInfo = assignmentsList.find(a => {
      const d = new Date(a.deadline);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

    if (!deadlineInfo) return null;

    if (deadlineInfo.status === "submitted") return "bg-[#3E4FFF] text-white shadow-sm ring-1 ring-[#232529]";
    if (new Date(deadlineInfo.deadline) < today && deadlineInfo.status !== "submitted") return "bg-[#232529] text-white shadow-sm ring-1 ring-[#391f56]";
    return "bg-[#5F73F5] text-white shadow-sm ring-1 ring-[#CCD4E0]";
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = today.toLocaleString("default", { month: "long" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-[#F6F8FB] backdrop-blur-md rounded-[10px] shadow-[0_2px_12px_rgba(36,37,41,0.03)] w-full overflow-hidden border border-[#E1E6EE]/60">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3E4FFF] to-[#5F73F5] px-6 py-5 text-white relative flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-[6px] bg-white/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </span>
          <h2 className="text-[17px] font-bold tracking-tight">Academy Calendar</h2>
        </div>
        <p className="text-[#efe8f5] text-[12px] font-medium">{monthName} {year}</p>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-5">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-[#778196] uppercase tracking-[0.06em] pb-2 border-b border-[#F6F8FB]">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-[46px]" />;
            const statusCls = getDayStatus(day);
            const isToday = day === today.getDate() && month === today.getMonth();
            const dateStr = formatDate(day);
            const hasNote = !!notes[dateStr];

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentNote(notes[dateStr] || "");
                  setNoteError(null);
                }}
                className={`
                  min-h-[46px] flex flex-col items-center justify-center text-[13px] font-semibold transition-all cursor-pointer rounded-[6px] hover:border-primary hover:text-primary hover:shadow-md relative
                  ${statusCls ? statusCls : isToday ? "bg-[#F6F8FB] text-primary border border-[#E1E6EE]" : "text-[#232529] hover:bg-[#faf8fc]"}
                `}
              >
                {day}
                {hasNote && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#5F73F5]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Note Modal */}
      {selectedDate !== null && (
        <div className="fixed inset-0 bg-[#0d3349]/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-[12px] w-full max-w-[420px] shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[17px] font-bold text-[#232529]">
                Notes for {monthName} {selectedDate}, {year}
              </h3>
              <button type="button" onClick={() => setSelectedDate(null)} className="text-[#64748b] hover:text-[#232529] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {isLoadingNote ? (
                <div className="flex items-center justify-center py-8 text-[13px] text-[#7c8697] font-semibold animate-pulse">
                  Loading note...
                </div>
              ) : (
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Type your notes or reminders here..."
                  className="w-full min-h-[120px] bg-[#f8fafc] border border-[#cbd5e1] rounded-[8px] p-3 text-[14px] text-[#1e293b] outline-none focus:border-[#CCD4E0] focus:ring-1 focus:ring-[#CCD4E0] resize-y transition-all"
                />
              )}

              {noteError && (
                <p className="text-[12px] font-semibold text-red-500">{noteError}</p>
              )}
              
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  disabled={isSaving}
                  className="flex-1 bg-[#F6F8FB] hover:bg-[#E1E6EE] text-[#232529] text-[13px] font-semibold py-2.5 rounded-[8px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isSaving || isLoadingNote}
                  className="flex-[2] bg-[#3E4FFF] hover:bg-[#5F73F5] text-white text-[13px] font-semibold py-2.5 rounded-[8px] transition-colors shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
