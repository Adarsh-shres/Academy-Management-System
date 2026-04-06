import { schedule } from "../data/studentMockData";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const typeStyles: Record<string, string> = {
  lecture: "bg-[#f3eff7] text-primary border border-[#e7dff0]",
  lab: "bg-[#ecfdf5] text-[#047857] border border-[#d1fae5]",
};

const subjectColors: Record<string, string> = {
  "Data Structures & Algorithms": "#6a5182",
  "Database Management Systems": "#f59e0b",
  "Operating Systems": "#ef4444",
  "Computer Networks": "#10b981",
  "Software Engineering": "#8b6ca8",
  "DBMS Lab": "#f59e0b",
  "OS Lab": "#ef4444",
  "Networks Lab": "#10b981",
  "DSA Lab": "#6a5182",
};

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: string;
}

function ScheduleRow({ item }: { item: ScheduleItem }) {
  const color = subjectColors[item.subject] || "#7c8697";
  return (
    <div className="flex items-center gap-[18px] py-[18px] border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] transition-colors px-[18px] rounded-sm group">
      {/* Indicator Bar */}
      <div className="w-[6px] h-[48px] rounded-full flex-shrink-0 group-hover:scale-y-110 transition-transform" style={{ backgroundColor: color }} />
      
      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-sans text-[15px] font-extrabold text-[#4b3f68] truncate leading-tight tracking-tight">{item.subject}</h4>
          <span className={`text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-[2px] rounded-full flex-shrink-0 ${typeStyles[item.type] || typeStyles.lecture}`}>
            {item.type}
          </span>
        </div>
        <p className="text-[12px] text-[#778196] font-semibold mb-[6px]">
          {item.day} <span className="mx-1 text-[#cbd5e1]">•</span> {item.time}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[11.5px] text-[#7c8697] font-medium">{item.teacher}</p>
          <span className="text-[10px] font-bold text-primary bg-[#f3eff7] px-[6px] py-[2px] rounded-[4px] uppercase tracking-wide border border-[#e7dff0]">{item.room}</span>
        </div>
      </div>
    </div>
  );
}

export default function StudentSchedulePage() {
  const today = new Date().toLocaleString("default", { weekday: "long" });

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[900px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Weekly Schedule
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Your class timetable for this semester</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 rounded-sm border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-semibold text-primary shadow-sm hover:shadow-md transition-shadow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Sync Calendar
          </button>
        </div>
      </div>

      {/* Main Schedule List */}
      <div className="space-y-[24px]">
        {DAYS.map((day) => {
          const dayClasses = schedule.filter((s) => s.day === day);
          const isToday = day === today;
          const isHoliday = day === "Saturday";
          
          return (
            <div key={day} className={`bg-white rounded-sm border ${isToday ? 'border-primary ring-1 ring-[#e0d6ef]' : 'border-[#e7dff0]'} shadow-[0_10px_28px_rgba(57,31,86,0.04)] overflow-hidden transition-all hover:shadow-[0_16px_36px_rgba(57,31,86,0.08)]`}>
              {/* Day Header */}
              <div className={`px-6 py-[18px] border-b border-[#e7dff0] flex items-center justify-between ${isToday ? "bg-gradient-to-r from-[#f5effa] to-white" : ""}`}>
                <div className="flex items-center gap-[12px]">
                  <h3 className={`font-sans text-[18px] font-extrabold tracking-tight ${isToday ? "text-primary" : "text-[#4b3f68]"}`}>{day}</h3>
                  {isToday && (
                    <span className="px-[8px] py-[3px] rounded-[6px] bg-primary text-white text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm">
                      Today
                    </span>
                  )}
                </div>
                {!isHoliday && (
                  <span className="text-[11.5px] font-bold text-[#778196] bg-[#faf8fc] border border-[#e7dff0] px-[10px] py-[4px] rounded-[6px] uppercase tracking-wide">
                    {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                  </span>
                )}
                {isHoliday && (
                  <span className="text-[11.5px] font-bold text-[#10b981] bg-[#ecfdf5] border border-[#d1fae5] px-[10px] py-[4px] rounded-[6px] uppercase tracking-wide">
                    Holiday
                  </span>
                )}
              </div>
              
              {/* Classes List */}
              <div className="px-2 py-2">
                {isHoliday ? (
                  <div className="py-[48px] text-center">
                    <span className="text-[32px] mb-3 block">🏖️</span>
                    <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-[0.1em] mb-1">Weekend Holiday</p>
                    <p className="text-[11.5px] text-[#778196] font-medium">Enjoy your break from the curriculum!</p>
                  </div>
                ) : dayClasses.length === 0 ? (
                  <div className="py-[32px] text-center">
                    <p className="text-[13px] text-[#778196] font-medium italic">No classes scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {dayClasses
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((item) => (
                        <ScheduleRow key={item.id} item={item} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Legend */}
      <div className="fixed bottom-8 right-8 z-[90] flex flex-col items-end pointer-events-none sm:pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-sm border border-[#e7dff0] shadow-[0_12px_24px_rgba(57,31,86,0.12)] p-4 flex flex-col gap-3">
          <div className="text-[10px] font-extrabold text-[#4b3f68] uppercase tracking-[0.08em] border-b border-[#e7dff0] pb-2 mb-1 w-full text-center">Legend</div>
          <div className="flex items-center gap-[10px]">
            <div className="w-[10px] h-[10px] rounded-full bg-primary shadow-sm" />
            <span className="text-[12px] font-bold text-[#778196]">Lecture</span>
          </div>
          <div className="flex items-center gap-[10px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#10b981] shadow-sm" />
            <span className="text-[12px] font-bold text-[#778196]">Lab</span>
          </div>
        </div>
      </div>
    </div>
  );
}
