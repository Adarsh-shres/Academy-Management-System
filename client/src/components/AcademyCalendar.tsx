import { useState } from 'react';

interface Assignment {
  deadline: string;
  status: string;
}

export default function AcademyCalendar({ assignmentsList = [] }: { assignmentsList?: Assignment[] }) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [currentNote, setCurrentNote] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const deadlineInfo = assignmentsList.find(a => {
      const d = new Date(a.deadline);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

    if (!deadlineInfo) return null;

    if (deadlineInfo.status === "submitted") return "bg-[#6a5182] text-white shadow-sm ring-1 ring-[#4b3f68]";
    if (new Date(deadlineInfo.deadline) < today && deadlineInfo.status !== "submitted") return "bg-[#4b3f68] text-white shadow-sm ring-1 ring-[#391f56]";
    return "bg-[#8b6ca8] text-white shadow-sm ring-1 ring-[#6a5182]";
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = today.toLocaleString("default", { month: "long" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-[#6a5182]/5 backdrop-blur-md rounded-[10px] shadow-[0_2px_12px_rgba(57,31,86,0.03)] w-full overflow-hidden border border-[#e7dff0]/60">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] px-6 py-5 text-white relative flex justify-between items-center">
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
            <div key={d} className="text-center text-[10px] font-semibold text-[#778196] uppercase tracking-[0.06em] pb-2 border-b border-[#f3eff7]">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-[46px]" />;
            const statusCls = getDayStatus(day);
            const isToday = day === today.getDate() && month === today.getMonth();

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentNote(notes[day] || "");
                }}
                className={`
                  min-h-[46px] flex flex-col items-center justify-center text-[13px] font-semibold transition-all cursor-pointer rounded-[6px] hover:border-primary hover:text-primary hover:shadow-md
                  ${statusCls ? statusCls : isToday ? "bg-[#f3eff7] text-primary border border-[#e7dff0]" : "text-[#4b3f68] hover:bg-[#faf8fc]"}
                `}
              >
                {day}
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
              <h3 className="text-[17px] font-bold text-[#4b3f68]">
                Notes for {monthName} {selectedDate}, {year}
              </h3>
              <button type="button" onClick={() => setSelectedDate(null)} className="text-[#64748b] hover:text-[#4b3f68] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Type your notes or reminders here..."
                className="w-full min-h-[120px] bg-[#f8fafc] border border-[#cbd5e1] rounded-[8px] p-3 text-[14px] text-[#1e293b] outline-none focus:border-[#6a5182] focus:ring-1 focus:ring-[#6a5182] resize-y transition-all"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 bg-[#f3eff7] hover:bg-[#e2d9ed] text-[#4b3f68] text-[13px] font-semibold py-2.5 rounded-[8px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotes({ ...notes, [selectedDate]: currentNote });
                    setSelectedDate(null);
                  }}
                  className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold py-2.5 rounded-[8px] transition-colors shadow-sm cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
