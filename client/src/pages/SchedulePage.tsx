import { useState, useRef, useEffect } from 'react';

const dummySchedule = [
  { id: 1, time: '08:00 AM', course: 'Web Development', level: 'Beginner', instructor: 'Dr. John Doe', room: 'Room 101' },
  { id: 2, time: '09:00 AM', course: 'Algorithms', level: 'Intermediate', instructor: 'Prof. Jane Smith', room: 'Room 102' },
  { id: 3, time: '10:00 AM', course: 'Break', level: '-', instructor: '-', room: '-' },
  { id: 4, time: '11:00 AM', course: 'Java', level: 'Advanced', instructor: 'Dr. Alan Turing', room: 'Room 205' },
  { id: 5, time: '12:00 PM', course: 'Lunch Break', level: '-', instructor: '-', room: '-' },
  { id: 6, time: '01:00 PM', course: 'Python', level: 'Beginner', instructor: 'Dr. Guido Rossum', room: 'Room 303' },
  { id: 7, time: '02:00 PM', course: 'Collaborative Dev', level: 'Intermediate', instructor: 'Prof. Linus Torvalds', room: 'Room 404' },
];

export default function SchedulePage() {
  const [dayView, setDayView] = useState<'Today' | 'Tomorrow'>('Today');
  const [classFilter, setClassFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  
  const [isClassFilterOpen, setIsClassFilterOpen] = useState(false);
  const [isLevelFilterOpen, setIsLevelFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsClassFilterOpen(false);
        setIsLevelFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredSchedule = dummySchedule.filter(item => {
    if (item.course === 'Break' || item.course === 'Lunch Break') return true;
    if (classFilter !== 'All' && item.course !== classFilter) return false;
    if (levelFilter !== 'All' && item.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Schedule</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Manage and view your hourly class schedule.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-[#e2e8f0] gap-4">
          {/* Day View Toggle */}
          <div className="flex bg-[#f1f5f9] rounded-lg p-1 gap-1">
            <button 
              onClick={() => setDayView('Today')} 
              className={`px-4 py-1.5 rounded-md text-[13px] transition-all cursor-pointer ${dayView === 'Today' ? 'bg-white font-semibold text-[#0d3349] shadow-sm' : 'font-medium text-[#64748b] hover:text-[#0d3349] hover:bg-black/5'}`}>
              Today
            </button>
            <button 
              onClick={() => setDayView('Tomorrow')} 
              className={`px-4 py-1.5 rounded-md text-[13px] transition-all cursor-pointer ${dayView === 'Tomorrow' ? 'bg-white font-semibold text-[#0d3349] shadow-sm' : 'font-medium text-[#64748b] hover:text-[#0d3349] hover:bg-black/5'}`}>
              Tomorrow
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3" ref={filterRef}>
            {/* Class Filter */}
            <div className="relative">
              <button 
                onClick={() => { setIsClassFilterOpen(!isClassFilterOpen); setIsLevelFilterOpen(false); }}
                className="flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] hover:text-[#0d3349] text-[#475569] text-[13px] font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Class: {classFilter}
              </button>
              
              {isClassFilterOpen && (
                <div className="absolute top-[110%] right-0 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-10 flex flex-col overflow-hidden py-1">
                  {['All', 'Web Development', 'Algorithms', 'Java', 'Python', 'Collaborative Dev'].map(c => (
                    <button key={c} onClick={() => { setClassFilter(c); setIsClassFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f1f5f9] transition-colors ${classFilter === c ? 'bg-[#f8fafc] font-bold text-[#006496]' : 'text-[#475569]'}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Level Filter */}
            <div className="relative">
              <button 
                onClick={() => { setIsLevelFilterOpen(!isLevelFilterOpen); setIsClassFilterOpen(false); }}
                className="flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] hover:text-[#0d3349] text-[#475569] text-[13px] font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Level: {levelFilter}
              </button>

              {isLevelFilterOpen && (
                <div className="absolute top-[110%] right-0 w-36 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-10 flex flex-col overflow-hidden py-1">
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <button key={l} onClick={() => { setLevelFilter(l); setIsLevelFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f1f5f9] transition-colors ${levelFilter === l ? 'bg-[#f8fafc] font-bold text-[#006496]' : 'text-[#475569]'}`}>{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider whitespace-nowrap">Time</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Level</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Instructor</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((item) => (
                  <tr key={item.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                    <td className="py-3 px-6 text-[13px] font-semibold text-[#006496] whitespace-nowrap">{item.time}</td>
                    <td className="py-3 px-6 text-[13px] font-medium text-[#1e293b]">
                      {item.course}
                      {(item.course === 'Break' || item.course === 'Lunch Break') && (
                        <span className="ml-2 inline-flex items-center justify-center bg-[#f1f5f9] text-[#64748b] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Break</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-[13px] font-medium text-[#475569]">
                      {item.level !== '-' ? (
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.level === 'Beginner' ? 'bg-[#dbeafe] text-[#1d4ed8]' : 
                          item.level === 'Intermediate' ? 'bg-[#fef3c7] text-[#b45309]' : 
                          'bg-[#fee2e2] text-[#b91c1c]'
                        }`}>{item.level}</span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-6 text-[13px] font-medium text-[#475569]">{item.instructor}</td>
                    <td className="py-3 px-6 text-[13px] font-medium text-[#475569]">{item.room}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-[#64748b]">No classes scheduled matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
