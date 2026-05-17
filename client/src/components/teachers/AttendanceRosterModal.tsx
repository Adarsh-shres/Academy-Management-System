import { useState } from 'react';

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface StudentAttendance {
  id: string;
  name: string;
  rollNo: string;
  avatarUrl?: string;
  initials: string;
  status: AttendanceStatus;
  note?: string;
}

interface AttendanceRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameName?: string;
  date?: Date;
  courseName?: string;
}

/** Shows a teacher-facing attendance sheet for a single class session. */
export default function AttendanceRosterModal({ isOpen, onClose, date = new Date(), courseName }: AttendanceRosterModalProps) {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleNoteChange = (id: string, note: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, note } : s));
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  const handleSave = () => {
    setIsSubmitting(true);
    setIsSubmitting(false);
    onClose();
  };

  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"></div>

      <div 
        className="relative z-10 w-full max-w-[640px] bg-white rounded-sm shadow-[0_20px_60px_rgba(13,51,73,0.15)] flex flex-col max-h-[90vh] overflow-hidden animate-fade-up transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#3E4FFF] to-[#5F73F5] px-6 py-5 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div>
            <h2 className="text-[20px] font-extrabold tracking-tight drop-shadow-sm">Attendance Roster</h2>
            <div className="flex items-center gap-2 text-[#efe8f5] text-[13px] font-medium mt-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formattedDate} <span className="mx-1">•</span> {courseName || 'CS101: Introduction to Programming'}
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-sm bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex border-b border-[#E1E6EE] bg-[#F6F8FB] px-6 py-3 shrink-0 gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
            <span className="text-[12px] font-bold text-[#232529]">Present: {presentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
            <span className="text-[12px] font-bold text-[#232529]">Late: {lateCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
            <span className="text-[12px] font-bold text-[#232529]">Absent: {absentCount}</span>
          </div>
          <div className="ml-auto text-[12px] font-bold text-[#64748b]">Total: {students.length}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 hide-scrollbar">
          {students.length === 0 && (
            <div className="rounded-sm border border-dashed border-[#E1E6EE] bg-[#F6F8FB] p-8 text-center text-[13px] font-semibold text-[#7c8697]">
              No students are loaded for this roster yet.
            </div>
          )}
          {students.map((student, idx) => (
            <div 
              key={student.id} 
              className={`
                group flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-sm border transition-all duration-300
                ${student.status === 'present' ? 'bg-white border-[#E1E6EE] shadow-[0_2px_8px_rgba(0,0,0,0.02)]' : ''}
                ${student.status === 'late' ? 'bg-[#fffbeb] border-[#fde68a] shadow-[0_4px_12px_rgba(245,158,11,0.08)]' : ''}
                ${student.status === 'absent' ? 'bg-[#fef2f2] border-[#fecaca] shadow-[0_4px_12px_rgba(239,68,68,0.08)]' : ''}
              `}
              style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-3 mb-3 md:mb-0">
                <div className={`
                    w-11 h-11 rounded-sm text-white text-[13px] font-extrabold flex items-center justify-center shrink-0 shadow-sm
                    ${student.status === 'present' ? 'bg-gradient-to-br from-[#3E4FFF] to-[#5F73F5]' : ''}
                    ${student.status === 'late' ? 'bg-gradient-to-br from-[#f59e0b] to-[#d97706]' : ''}
                    ${student.status === 'absent' ? 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]' : ''}
                    transition-all duration-300
                  `}
                >
                  {student.initials}
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#0d3349] leading-tight">{student.name}</h3>
                  <p className="text-[12px] font-semibold text-[#64748b] mt-0.5">{student.rollNo}</p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className="flex bg-[#F6F8FB] rounded-sm p-1 gap-1 border border-[#E1E6EE] w-full md:w-auto relative overflow-hidden">
                  {(['present', 'late', 'absent'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(student.id, st)}
                      className={`
                        relative z-10 flex-1 md:w-[76px] py-1.5 text-[12px] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 cursor-pointer
                        ${student.status === st 
                          ? st === 'present' ? 'bg-white text-[#10b981] shadow-sm border border-[#e2e8f0]'
                          : st === 'late' ? 'bg-white text-[#f59e0b] shadow-sm border border-[#e2e8f0]'
                          : 'bg-white text-[#ef4444] shadow-sm border border-[#e2e8f0]'
                          : 'text-[#64748b] hover:text-[#232529] hover:bg-[#E1E6EE]/50'
                        }
                      `}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {student.status !== 'present' && (
                  <div className="w-full">
                    {activeNoteId === student.id ? (
                      <div className="relative animate-fade-up">
                        <textarea 
                          value={student.note || ''}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="Add reason/note..."
                          className="w-full text-[12px] bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 outline-none focus:border-[#CCD4E0] focus:ring-1 focus:ring-[#CCD4E0] resize-none h-14"
                          autoFocus
                          onBlur={() => { if(!student.note?.trim()) setActiveNoteId(null) }}
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveNoteId(student.id)}
                        className={`text-[11px] font-bold flex items-center justify-end w-full gap-1 cursor-pointer hover:underline transition-colors ${student.note ? 'text-[#4B5563]' : 'text-[#94a3b8]'}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        {student.note ? 'Edit Note' : 'Add Note'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-5 border-t border-[#e2e8f0] bg-[#F6F8FB] flex gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] text-[14px] font-bold px-6 py-3 rounded-sm transition-all cursor-pointer hover:shadow-sm"
          >
            Discard
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex-[2] text-white text-[14px] font-bold px-6 py-3 rounded-sm transition-all shadow-md flex items-center justify-center gap-2
              ${isSubmitting ? 'bg-[#5F73F5] opacity-70 cursor-not-allowed' : 'bg-gradient-to-r from-[#3E4FFF] to-[#5F73F5] hover:from-[#5F73F5] hover:to-[#7a5c96] active:scale-[0.98] cursor-pointer'}
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving Records...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .animate-fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
