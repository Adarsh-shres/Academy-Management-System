import { CalendarCheck2, MapPin } from './icons';

interface ScheduleItem {
  id: string;
  slot: string;
  time: string;
  course: string;
  topic: string;
  place: string;
}

const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: '1', slot: 'Slot 3', time: '10:45 AM - 11:30 AM', course: 'Math 101', topic: 'Unit 3: Simple equation', place: 'Classroom 4a' },
  { id: '2', slot: 'Slot 4', time: '12:00 PM - 12:45 PM', course: 'Math 102', topic: 'Unit 3: Multiple numbers', place: 'Classroom 3b' },
  { id: '3', slot: 'Slot 5', time: '1:00 PM - 1:45 PM', course: 'Math 102', topic: 'Unit 3: Multiple numbers', place: 'Classroom 3b' },
];

export default function TeacherSchedule() {
  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-gradient-to-r from-[#f5effa] to-white">
        <div className="flex items-center gap-[12px]">
          <h3 className="font-sans text-[18px] font-extrabold tracking-tight text-primary">Today's Schedule</h3>
          <span className="px-[8px] py-[3px] rounded-[6px] bg-primary text-white text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm">
            Today
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col overflow-y-auto">
        {MOCK_SCHEDULE.map((item) => (
          <div key={item.id} className="flex items-center gap-[18px] py-[18px] border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] transition-colors px-[18px] rounded-sm group">
            {/* Indicator Bar */}
            <div className="w-[6px] h-[48px] rounded-full flex-shrink-0 group-hover:scale-y-110 transition-transform bg-primary" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-sans text-[15px] font-extrabold text-[#4b3f68] truncate leading-tight tracking-tight">{item.course}</h4>
                <span className="text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-[2px] rounded-full flex-shrink-0 bg-[#f3eff7] text-primary border border-[#e7dff0]">
                  {item.slot}
                </span>
              </div>
              <p className="text-[12px] text-[#778196] font-semibold mb-[6px]">
                {item.time}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[11.5px] text-[#7c8697] font-medium truncate max-w-[150px]">{item.topic}</p>
                <span className="text-[10px] font-bold text-primary bg-[#f3eff7] px-[6px] py-[2px] rounded-[4px] uppercase tracking-wide border border-[#e7dff0]">{item.place}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
