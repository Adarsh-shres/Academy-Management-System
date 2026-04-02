import { useState, useRef, useEffect } from 'react';

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
                <div className="absolute top-[110%] right-0 w-40 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-10 flex flex-col overflow-hidden py-1">
                  {['All', 'Web Development', 'Algorithms', 'Java', 'Python'].map(c => (
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
      </div>
    </div>
  );
}
