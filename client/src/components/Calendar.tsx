import { useState, useMemo } from 'react';

// Sample static events
const CALENDAR_EVENTS: Record<string, { label: string; type: 'blue' | 'green' | 'red' }[]> = {};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Calendar() {
  const [calDate, setCalDate] = useState({ year: 2024, month: 8 }); // 8 = September

  const handlePrevMonth = () => {
    setCalDate(prev => {
      let { year, month } = prev;
      month -= 1;
      if (month < 0) { month = 11; year -= 1; }
      return { year, month };
    });
  };

  const handleNextMonth = () => {
    setCalDate(prev => {
      let { year, month } = prev;
      month += 1;
      if (month > 11) { month = 0; year += 1; }
      return { year, month };
    });
  };

  // Generate Calendar Grid
  const calendarGrid = useMemo(() => {
    const { year, month } = calDate;
    const firstDayOfMonth  = new Date(year, month, 1);
    const daysInMonth      = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth  = new Date(year, month, 0).getDate();
    
    // Monday-based offset: Sunday = 6, Monday = 0 … Saturday = 5
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const today = new Date();
    
    const rows = [];
    let dayCounter = 1 - startOffset;
    
    for (let row = 0; row < 5; row++) {
      const cols = [];
      for (let col = 0; col < 7; col++, dayCounter++) {
        let displayDay = dayCounter;
        let isOtherMonth = false;
        
        if (dayCounter <= 0) {
          displayDay = daysInPrevMonth + dayCounter;
          isOtherMonth = true;
        } else if (dayCounter > daysInMonth) {
          displayDay = dayCounter - daysInMonth;
          isOtherMonth = true;
        }
        
        const isToday = !isOtherMonth &&
          today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === displayDay;
          
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(displayDay).padStart(2, "0")}`;
        const events = !isOtherMonth && CALENDAR_EVENTS[dateKey] ? CALENDAR_EVENTS[dateKey] : [];
        
        cols.push({
          key: `${row}-${col}`,
          displayDay,
          isOtherMonth,
          isToday,
          events
        });
      }
      rows.push(cols);
    }
    return rows;
  }, [calDate]);

  return (
    <div className="bg-white border border-[#e7dff0] rounded-sm p-[22px] shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="font-sans text-[15px] font-extrabold text-[#4b3f68]">Institutional Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="w-[26px] h-[26px] rounded-sm border-[1.5px] border-[#e2e8f0] bg-white cursor-pointer text-base leading-none text-[#64748b] flex items-center justify-center transition-all hover:bg-primary hover:text-white hover:border-primary">
            &#8249;
          </button>
          <span className="text-[12.5px] font-semibold text-[#4b3f68] min-w-[110px] text-center">
            {MONTH_NAMES[calDate.month]} {calDate.year}
          </span>
          <button onClick={handleNextMonth} className="w-[26px] h-[26px] rounded-sm border-[1.5px] border-[#e2e8f0] bg-white cursor-pointer text-base leading-none text-[#64748b] flex items-center justify-center transition-all hover:bg-primary hover:text-white hover:border-primary">
            &#8250;
          </button>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
              <th key={d} className="text-[10.5px] font-bold text-[#7d8797] uppercase tracking-[0.08em] p-[6px_4px] text-center">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarGrid.map((row, rIdx) => (
            <tr key={`row-${rIdx}`}>
              {row.map(cell => (
                <td key={cell.key} className="p-1 text-center align-top min-w-[48px]">
                  <div className={`w-[30px] h-[30px] mx-auto rounded-sm inline-flex items-center justify-center text-[12.5px] cursor-pointer transition-all
                    ${cell.isOtherMonth ? 'text-[#c8d3df]' : ''}
                    ${cell.isToday ? 'bg-[#6a5182] text-white font-bold shadow-sm' : (!cell.isOtherMonth ? 'hover:bg-[#f3edf8]' : '')}
                  `}>
                    {cell.displayDay}
                  </div>
                  {cell.events.map((ev, i) => (
                    <div key={i} className={`text-[9.5px] font-semibold p-[2px_5px] rounded-[3px] mt-[1px] whitespace-nowrap overflow-hidden text-ellipsis
                      ${ev.type === 'blue' ? 'bg-[#dbeafe] text-[#1d4ed8]' : ''}
                      ${ev.type === 'green' ? 'bg-[#d1fae5] text-[#065f46]' : ''}
                      ${ev.type === 'red' ? 'bg-[#fee2e2] text-[#b91c1c]' : ''}
                    `}>
                      {ev.label}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2 mt-3.5 text-[11px] text-[#64748b]">
        <span className="w-2 h-2 rounded-sm inline-block ml-1 bg-[#3b82f6]"></span><span>Academic</span>
        <span className="w-2 h-2 rounded-sm inline-block ml-1 bg-green-custom"></span><span>Event</span>
        <span className="w-2 h-2 rounded-sm inline-block ml-1 bg-red-custom"></span><span>Deadline</span>
      </div>
    </div>
  );
}
