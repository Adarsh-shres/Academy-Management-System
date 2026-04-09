import { CalendarCheck2, MapPin } from './icons';
import { useAuth } from '../context/AuthContext';
import { useSchedule } from '../context/ScheduleContext';

interface PersonalizedScheduleProps {
  onTakeAttendance?: (course: any) => void;
}

export default function PersonalizedSchedule({ onTakeAttendance }: PersonalizedScheduleProps = {}) {
  const { user } = useAuth();
  const { mySchedule } = useSchedule();

  const title = user?.role === 'teacher' ? 'Classes I Teach Today' : 'My Class Schedule';
  const emptyStateText = user?.role === 'teacher' 
    ? "You have no classes to teach today! Enjoy your day" 
    : "No classes scheduled for you today! Time to relax";

  const formattedDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col shadow-[0_10px_28px_rgba(57,31,86,0.06)] min-h-[320px]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="text-primary" size={18} />
          <h3 className="text-[16px] font-bold text-[#4b3f68]">{title}</h3>
        </div>
        <span className="text-[12px] font-semibold text-[#64748b]">
          {formattedDate}
        </span>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
        {mySchedule.length > 0 ? (
          mySchedule.map((item, index) => (
            <div key={item.id} className="border-l-[3px] border-primary bg-[#fbf8fe] rounded-sm p-3.5 flex flex-col gap-1.5 transition-all hover:bg-[#f6f0fb]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-primary">Session {index + 1}</span>
                <span className="text-[11px] font-bold text-[#64748b] bg-white px-2 py-0.5 rounded-sm border border-[#e7dff0]">
                  {item.time}
                </span>
              </div>
              <div className="mt-1">
                <h4 className="text-[14px] font-bold text-[#4b3f68]">{item.course}</h4>
                <p className="text-[12px] text-[#475569] font-medium leading-tight mt-1 flex gap-4">
                  {user?.role === 'student' && (
                    <span><strong className="text-[#64748b] font-semibold">Instructor:</strong> {item.instructor}</span>
                  )}
                  <span><strong className="text-[#64748b] font-semibold">Level:</strong> {item.level}</span>
                </p>
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 pt-2 border-t border-[#e2d9ed]/50 text-[11.5px] text-[#253f58] font-medium justify-between">
                <div className="flex items-center gap-1.5 text-primary">
                  <MapPin size={12} />
                  <span className="font-semibold text-primary">{item.room}</span>
                </div>
                {user?.role === 'teacher' && onTakeAttendance && (
                  <button 
                    onClick={() => onTakeAttendance(item)}
                    className="flex items-center gap-1 bg-[#6a5182]/10 hover:bg-[#6a5182]/20 text-[#6a5182] px-2.5 py-1.5 rounded-md font-bold transition-colors cursor-pointer"
                  >
                    <CalendarCheck2 size={13} />
                    Take Attendance
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-[#f3eff7] rounded-sm text-center border border-[#e2d9ed] h-[150px]">
            <span className="text-[13px] font-bold text-[#6a5182]">{emptyStateText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
