import { CalendarCheck2 } from '../shared/icons';

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
        <div className="flex flex-1 flex-col items-center justify-center rounded-sm border border-dashed border-[#d8c8e9] bg-[#fbf8fe] p-8 text-center">
          <span className="text-[13px] font-bold text-[#4b3f68]">No schedule entries yet.</span>
          <span className="mt-1 text-[12px] font-medium text-[#7c8697]">Assigned sessions will appear here.</span>
        </div>
      </div>
    </div>
  );
}



