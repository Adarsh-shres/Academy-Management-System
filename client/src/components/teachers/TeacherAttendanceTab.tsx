import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { Calendar, Users } from '../shared/icons';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent';
}

interface TeacherAttendanceTabProps {
  classId: string | undefined;
  students: Student[];
  courseName: string;
  className: string;
}

export default function TeacherAttendanceTab({ classId, students, courseName, className }: TeacherAttendanceTabProps) {
  // Session selection
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('10:00 AM');

  // Attendance data
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [isExistingSession, setIsExistingSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Stats
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  // Derived day name
  const dayName = (() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  })();

  // Load attendance for a selected date
  const loadAttendance = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    setSaveMessage(null);

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status, time')
        .eq('class_id', classId)
        .eq('date', selectedDate);

      if (error) throw error;

      const map: Record<string, 'present' | 'absent'> = {};

      if (data && data.length > 0) {
        // Existing session found
        setIsExistingSession(true);
        if (data[0].time) setSessionTime(data[0].time);
        data.forEach((rec: any) => {
          map[rec.student_id] = rec.status;
        });
        // Fill in any students not yet in records
        students.forEach(s => {
          if (!map[s.id]) map[s.id] = 'present';
        });
      } else {
        // New session — all present by default
        setIsExistingSession(false);
        students.forEach(s => {
          map[s.id] = 'present';
        });
      }

      setAttendance(map);
      setSessionLoaded(true);
    } catch (err: any) {
      console.error('Failed to load attendance:', err.message);
      setSaveMessage({ type: 'error', text: 'Failed to load attendance: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  }, [classId, selectedDate, students]);

  // Auto-load on mount and when date changes
  useEffect(() => {
    if (students.length > 0) {
      loadAttendance();
    }
  }, [students.length, selectedDate]);

  // Toggle student status
  const toggleStatus = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  // Save attendance
  const handleSave = async () => {
    if (!classId) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const records = students.map(s => ({
        class_id: classId,
        student_id: s.id,
        teacher_id: user.id,
        date: selectedDate,
        time: sessionTime,
        status: attendance[s.id] || 'present',
        updated_at: new Date().toISOString(),
      }));

      if (isExistingSession) {
        // Delete existing and re-insert (upsert approach)
        const { error: delError } = await supabase
          .from('attendance')
          .delete()
          .eq('class_id', classId)
          .eq('date', selectedDate);
        if (delError) throw delError;
      }

      const { error } = await supabase
        .from('attendance')
        .insert(records);

      if (error) throw error;

      setIsExistingSession(true);
      setSaveMessage({ type: 'success', text: isExistingSession ? 'Attendance updated successfully!' : 'Attendance recorded successfully!' });

      // Auto-dismiss message
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save attendance:', err.message);
      setSaveMessage({ type: 'error', text: 'Failed to save: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Export attendance to Excel (.xlsx)
  const handleExport = async () => {
    if (!classId) return;
    setIsExporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Fetch ALL attendance for this class
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, date, time, status')
        .eq('class_id', classId)
        .order('date', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        setSaveMessage({ type: 'error', text: 'No attendance records to export.' });
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Build student name map
      const studentMap: Record<string, { name: string; email: string }> = {};
      students.forEach(s => { studentMap[s.id] = { name: s.name, email: s.email }; });

      // Build rows for Excel
      const rows = data.map((rec: any) => {
        const d = new Date(rec.date + 'T00:00:00');
        const day = d.toLocaleDateString('en-US', { weekday: 'long' });
        const student = studentMap[rec.student_id] || { name: 'Unknown', email: 'Unknown' };
        return {
          'Date': rec.date,
          'Day': day,
          'Time': rec.time || '',
          'Student Name': student.name,
          'Email': student.email,
          'Status': rec.status === 'present' ? 'Present' : 'Absent',
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Title rows
      const titleData = [
        [`Attendance Report - ${courseName} (${className})`],
        [`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`],
        [],
      ];
      const ws = XLSX.utils.aoa_to_sheet(titleData);

      // Append data rows starting after the title
      XLSX.utils.sheet_add_json(ws, rows, { origin: 'A4' });

      // Set column widths for readability
      ws['!cols'] = [
        { wch: 14 },  // Date
        { wch: 12 },  // Day
        { wch: 12 },  // Time
        { wch: 24 },  // Student Name
        { wch: 28 },  // Email
        { wch: 10 },  // Status
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');

      // --- Student Summary Sheet ---
      // Calculate per-student stats
      const studentStats: Record<string, { present: number; absent: number; total: number }> = {};
      data.forEach((rec: any) => {
        if (!studentStats[rec.student_id]) {
          studentStats[rec.student_id] = { present: 0, absent: 0, total: 0 };
        }
        studentStats[rec.student_id].total++;
        if (rec.status === 'present') studentStats[rec.student_id].present++;
        else studentStats[rec.student_id].absent++;
      });

      const summaryRows = students.map((s, idx) => {
        const stat = studentStats[s.id] || { present: 0, absent: 0, total: 0 };
        const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
        return {
          'S.No': idx + 1,
          'Student Name': s.name,
          'Email': s.email,
          'Total Present': stat.present,
          'Total Absent': stat.absent,
          'Total Classes': stat.total,
          'Attendance %': `${pct}%`,
        };
      });

      // Create summary sheet
      const summaryTitle = [
        [`Student Attendance Summary - ${courseName} (${className})`],
        [`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`],
        [],
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(summaryTitle);
      XLSX.utils.sheet_add_json(ws2, summaryRows, { origin: 'A4' });

      // Overall class totals at the bottom
      const overallPresent = data.filter((r: any) => r.status === 'present').length;
      const overallAbsent = data.filter((r: any) => r.status === 'absent').length;
      const overallTotal = data.length;
      const overallPct = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

      const classTotalRow = 4 + summaryRows.length + 1; // title(3) + header(1) + data + 1 blank
      XLSX.utils.sheet_add_aoa(ws2, [
        [],
        ['', '', 'CLASS TOTAL', '', overallPresent, overallAbsent, overallTotal, `${overallPct}%`],
      ], { origin: `A${classTotalRow}` });

      ws2['!cols'] = [
        { wch: 6 },   // S.No
        { wch: 24 },  // Student Name
        { wch: 28 },  // Email
        { wch: 14 },  // Total Present
        { wch: 14 },  // Total Absent
        { wch: 14 },  // Total Classes
        { wch: 14 },  // Attendance %
      ];

      XLSX.utils.book_append_sheet(wb, ws2, 'Student Summary');

      // Generate and download
      const fileName = `Attendance_${courseName.replace(/\s+/g, '_')}_${className.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSaveMessage({ type: 'success', text: 'Attendance exported to Excel successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Export failed:', err.message);
      setSaveMessage({ type: 'error', text: 'Export failed: ' + err.message });
    } finally {
      setIsExporting(false);
    }
  };

  // Mark all present / absent
  const markAll = (status: 'present' | 'absent') => {
    const map: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendance(map);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Session Selector Card */}
      <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
        <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] px-6 py-4 text-white">
          <h3 className="text-[17px] font-extrabold tracking-tight flex items-center gap-2">
            <Calendar size={18} />
            Session Details
          </h3>
          <p className="text-[12px] text-[#efe8f5] mt-1">Select date and time for the attendance session</p>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-5 items-end">
          {/* Date */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setSessionLoaded(false);
              }}
              className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium"
            />
          </div>

          {/* Day (read-only) */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Day</label>
            <div className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] text-[#4b3f68] font-semibold">
              {dayName}
            </div>
          </div>

          {/* Time */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Time</label>
            <input
              type="text"
              value={sessionTime}
              onChange={e => setSessionTime(e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium"
            />
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#217346] hover:bg-[#1a5c38] text-white text-[13px] font-bold tracking-wide rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase whitespace-nowrap"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Exporting...
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M10 9h4" /></svg>
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {saveMessage && (
        <div className={`p-4 rounded-sm border text-[14px] font-medium transition-all animate-fade-in ${saveMessage.type === 'success'
          ? 'bg-[#dcfce7] border-[#86efac] text-[#166534]'
          : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
          }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Attendance Table */}
      {sessionLoaded && (
        <>
          {/* Summary Bar */}
          <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#fbf8fe] border-b border-[#e7dff0]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                  <span className="text-[12px] font-bold text-[#4b3f68]">Present: {presentCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
                  <span className="text-[12px] font-bold text-[#4b3f68]">Absent: {absentCount}</span>
                </div>
                <div className="text-[12px] font-bold text-[#64748b]">Total: {students.length}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAll('present')}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#dcfce7] text-[#166534] border border-[#86efac] rounded-sm hover:bg-[#bbf7d0] transition-colors cursor-pointer"
                >
                  All P
                </button>
                <button
                  onClick={() => markAll('absent')}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-sm hover:bg-[#fecaca] transition-colors cursor-pointer"
                >
                  All A
                </button>
              </div>
            </div>

            {/* Student Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[70px]">S.No</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student Name</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-center w-[180px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7dff0]">
                {students.map((student, idx) => {
                  const status = attendance[student.id] || 'present';
                  return (
                    <tr
                      key={student.id}
                      className={`transition-all duration-200 ${status === 'present'
                        ? 'bg-white hover:bg-[#f0fdf4]/50'
                        : 'bg-[#fef2f2]/30 hover:bg-[#fef2f2]/60'
                        }`}
                    >
                      <td className="py-4 px-6 text-[13px] font-semibold text-[#64748b]">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-sm text-white text-[12px] font-extrabold flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${status === 'present'
                            ? 'bg-gradient-to-br from-[#6a5182] to-[#8b6ca8]'
                            : 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]'
                            }`}>
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[14px] font-bold text-[#4b3f68]">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[13.5px] text-[#64748b]">{student.email}</td>
                      <td className="py-4 px-6">
                        <div className="flex bg-[#f3eff7] rounded-sm p-1 gap-1 border border-[#e7dff0] justify-center">
                          <button
                            onClick={() => toggleStatus(student.id, 'present')}
                            className={`flex-1 py-2 text-[13px] font-extrabold rounded-sm transition-all duration-300 cursor-pointer ${status === 'present'
                              ? 'bg-[#10b981] text-white shadow-sm'
                              : 'text-[#64748b] hover:text-[#10b981] hover:bg-white/50'
                              }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => toggleStatus(student.id, 'absent')}
                            className={`flex-1 py-2 text-[13px] font-extrabold rounded-sm transition-all duration-300 cursor-pointer ${status === 'absent'
                              ? 'bg-[#ef4444] text-white shadow-sm'
                              : 'text-[#64748b] hover:text-[#ef4444] hover:bg-white/50'
                              }`}
                          >
                            A
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Users size={32} className="text-[#cbd5e1] mb-3" />
                        <p className="text-[14px] font-semibold text-[#4b3f68]">No Students Enrolled</p>
                        <p className="text-[13px] text-[#64748b] mt-1">There are no students in this class to take attendance for.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-[14px] font-bold tracking-wide rounded-sm transition-all shadow-md cursor-pointer uppercase ${isSaving
                  ? 'bg-[#5b4471] opacity-70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] hover:from-[#5b4471] hover:to-[#7a5c96] active:scale-[0.98]'
                  }`}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                    {isExistingSession ? 'Update Attendance' : 'Save Attendance'}
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
