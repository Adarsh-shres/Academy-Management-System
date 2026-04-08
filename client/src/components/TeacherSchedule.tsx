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
  { id: '1', slot: 'Slot 3', time: '10:45 AM - 11:30 AM', course: 'Math 102', topic: 'Unit3: Simple equation', place: 'Classroom 4a' },
  { id: '2', slot: 'Slot 4', time: '12:00 PM - 12:45 PM', course: 'Math 101', topic: 'Unit3: Multiple numbers', place: 'Classroom 3b' },
  { id: '3', slot: 'Slot 5', time: '1:00 PM - 1:45 PM', course: 'Math 101', topic: 'Unit3: Multiple numbers', place: 'Classroom 3b' },
];

export default function TeacherSchedule() {
  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col h-full overflow-hidden shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="text-primary" size={18} />
          <h3 className="text-[16px] font-bold text-[#4b3f68]">Today Schedule</h3>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
        {MOCK_SCHEDULE.map((item) => (
          <div key={item.id} className="border-l-[3px] border-primary bg-[#fbf8fe] rounded-sm p-3.5 flex flex-col gap-1.5 transition-all hover:bg-[#f6f0fb]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-primary">{item.slot}</span>
              <span className="text-[11px] font-bold text-[#64748b] bg-white px-2 py-0.5 rounded-sm border border-[#e7dff0]">{item.time}</span>
            </div>
            <div className="mt-1">
              <h4 className="text-[14px] font-bold text-[#4b3f68]">Course: {item.course}</h4>
              <p className="text-[12.5px] text-[#475569] font-medium leading-tight mt-0.5">Topic: {item.topic}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11.5px] text-[#64748b] font-medium">
              <MapPin size={12} />
              <span>Place: {item.place}</span>
            </div>
          </div>
        ))}

        <div className="mt-4 flex flex-col items-center justify-center p-4 bg-[#f3eff7] rounded-sm text-center border border-[#e2d9ed]">
          <span className="text-[13px] font-bold text-primary">Your day ends here! Enjoy your day</span>
        </div>
      </div>
    </div>
  );
}



