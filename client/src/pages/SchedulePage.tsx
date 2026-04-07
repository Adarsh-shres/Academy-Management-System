import { useState, useRef, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';

export default function SchedulePage() {
  const { schedule, addEntry, updateEntry, deleteEntry } = useSchedule();

  const [editingEntry, setEditingEntry] = useState<any>(null);

  const [dayView, setDayView] = useState<'Today' | 'Tomorrow'>('Today');
  const [classFilter, setClassFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  
  const [isClassFilterOpen, setIsClassFilterOpen] = useState(false);
  const [isLevelFilterOpen, setIsLevelFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  /* ─── Create Schedule form state ───────────────────────────── */
  const [newTime, setNewTime] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');
  const [newInstructor, setNewInstructor] = useState('');
  const [newRoom, setNewRoom] = useState('');

  const resetForm = () => {
    setNewTime('');
    setNewCourse('');
    setNewLevel('Beginner');
    setNewInstructor('');
    setNewRoom('');
  };

  const handleCreate = () => {
    addEntry({
      time: newTime || '09:00 AM',
      course: newCourse || 'New Course',
      level: newLevel,
      instructor: newInstructor || 'TBD',
      room: newRoom || 'TBD',
    });
    resetForm();
    setIsCreateModalOpen(false);
  };

  const handleSaveEdit = () => {
    if (editingEntry) {
      updateEntry(editingEntry.id, {
        time: editingEntry.time,
        course: editingEntry.course,
        level: editingEntry.level,
        instructor: editingEntry.instructor,
        room: editingEntry.room
      });
      setEditingEntry(null);
    }
  };

  /* ─── Filters ──────────────────────────────────────────────── */
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

  const uniqueCourses = Array.from(new Set(schedule.filter(s => s.course !== 'Break' && s.course !== 'Lunch Break').map(s => s.course)));

  const filteredSchedule = schedule.filter(item => {
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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Schedule
        </button>
      </div>

      <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-[#e2e8f0] gap-4">
          {/* Day View Toggle */}
          <div className="flex bg-[#f1f5f9] rounded-sm p-1 gap-1">
            <button 
              onClick={() => setDayView('Today')} 
              className={`px-4 py-1.5 rounded-sm text-[13px] transition-all cursor-pointer ${dayView === 'Today' ? 'bg-white font-semibold text-[#4b3f68] shadow-sm' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>
              Today
            </button>
            <button 
              onClick={() => setDayView('Tomorrow')} 
              className={`px-4 py-1.5 rounded-sm text-[13px] transition-all cursor-pointer ${dayView === 'Tomorrow' ? 'bg-white font-semibold text-[#4b3f68] shadow-sm' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>
              Tomorrow
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3" ref={filterRef}>
            {/* Class Filter */}
            <div className="relative">
              <button 
                onClick={() => { setIsClassFilterOpen(!isClassFilterOpen); setIsLevelFilterOpen(false); }}
                className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Class: {classFilter}
              </button>
              
              {isClassFilterOpen && (
                <div className="absolute top-[110%] right-0 w-48 bg-white border border-[#e2e8f0] rounded-sm shadow-lg z-10 flex flex-col overflow-hidden py-1">
                  {['All', ...uniqueCourses].map(c => (
                    <button key={c} onClick={() => { setClassFilter(c); setIsClassFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${classFilter === c ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Level Filter */}
            <div className="relative">
              <button 
                onClick={() => { setIsLevelFilterOpen(!isLevelFilterOpen); setIsClassFilterOpen(false); }}
                className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Level: {levelFilter}
              </button>

              {isLevelFilterOpen && (
                <div className="absolute top-[110%] right-0 w-36 bg-white border border-[#e2e8f0] rounded-sm shadow-lg z-10 flex flex-col overflow-hidden py-1">
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <button key={l} onClick={() => { setLevelFilter(l); setIsLevelFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${levelFilter === l ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}>{l}</button>
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
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
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
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 text-[#94a3b8]">
                        <button onClick={() => setEditingEntry({...item})} className="hover:text-[#6a5182] transition-colors cursor-pointer hover:scale-110 active:scale-95" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this schedule entry?')) {
                              deleteEntry(item.id);
                            }
                          }}
                          className="hover:text-[#ef4444] transition-colors cursor-pointer hover:scale-110 active:scale-95" title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13px] text-[#64748b]">No classes scheduled matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Create Schedule Modal ───────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
          <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">New Schedule Entry</h3>
              <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Time Slot</label>
                  <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="e.g. 09:00 AM" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</label>
                  <input type="text" value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="e.g. Room 101" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
                <input type="text" value={newCourse} onChange={e => setNewCourse(e.target.value)} placeholder="e.g. Web Development" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Level</label>
                  <select value={newLevel} onChange={e => setNewLevel(e.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Instructor</label>
                  <input type="text" value={newInstructor} onChange={e => setNewInstructor(e.target.value)} placeholder="e.g. Dr. John Doe" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Schedule Modal ───────────────────────────────── */}
      {editingEntry && (
        <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingEntry(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">Edit Schedule Entry</h3>
              <button onClick={() => setEditingEntry(null)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Time Slot</label>
                  <input type="text" value={editingEntry.time} onChange={e => setEditingEntry({...editingEntry, time: e.target.value})} placeholder="e.g. 09:00 AM" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</label>
                  <input type="text" value={editingEntry.room} onChange={e => setEditingEntry({...editingEntry, room: e.target.value})} placeholder="e.g. Room 101" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
                <input type="text" value={editingEntry.course} onChange={e => setEditingEntry({...editingEntry, course: e.target.value})} placeholder="e.g. Web Development" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Level</label>
                  <select value={editingEntry.level} onChange={e => setEditingEntry({...editingEntry, level: e.target.value})} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="-">-</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Instructor</label>
                  <input type="text" value={editingEntry.instructor} onChange={e => setEditingEntry({...editingEntry, instructor: e.target.value})} placeholder="e.g. Dr. John Doe" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingEntry(null)} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
