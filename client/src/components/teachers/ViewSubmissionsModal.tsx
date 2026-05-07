import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText } from '../shared/icons';

interface ViewSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

export default function ViewSubmissionsModal({ isOpen, onClose, assignment }: ViewSubmissionsModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !assignment) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        // Step 1: Get student IDs from the class
        const { data: classData, error: classErr } = await supabase
          .from('classes')
          .select('student_ids')
          .eq('id', assignment.class_id)
          .single();

        if (classErr && classErr.code !== 'PGRST116') throw classErr;

        const studentIds = classData?.student_ids || [];

        if (studentIds.length === 0) {
          setStudents([]);
          setSubmissions([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Get student details for enrolled students only
        const { data: usersData, error: usersErr } = await supabase
          .from('users')
          .select('id, name')
          .in('id', studentIds);

        if (usersErr) throw usersErr;

        // Step 3: Fetch actual submissions for this assignment
        const { data: subData, error: subErr } = await supabase
          .from('submissions')
          .select('id, student_id, file_url, submitted_at, status')
          .eq('assignment_id', assignment.id);

        if (subErr) throw subErr;

        setStudents(usersData || []);
        setSubmissions(subData || []);
      } catch (err: any) {
        console.error('Failed to fetch submissions data:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [isOpen, assignment]);

  if (!isOpen || !assignment) return null;

  // Safe due date formatting
  const formatDueDate = () => {
    try {
      if (!assignment.due_date) return 'N/A';
      const dateStr = assignment.due_date.includes('T')
        ? assignment.due_date
        : `${assignment.due_date}T${assignment.due_time || '23:59:00'}`;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const totalStudents = students.length;
  const submittedCount = submissions.length;
  const pendingCount = totalStudents - submittedCount;

  const handleViewFile = (fileUrl: string) => {
    // Use Google Docs viewer to preview any file type in the browser
    const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-md w-full max-w-[800px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-[#e7dff0] flex justify-between items-start bg-[#fbf8fe] relative">
          <div className="pr-10">
            <h2 className="text-[20px] font-bold text-[#4b3f68] mb-1">{assignment.title}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-[#64748b] font-medium">
              <span><strong className="text-[#4b3f68]">Course:</strong> {assignment.course}</span>
              <span><strong className="text-[#4b3f68]">Due:</strong> {formatDueDate()}</span>
            </div>
            {assignment.file_url && (
              <div className="mt-4">
                <a
                  href={assignment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6a5182] text-[12px] font-semibold underline hover:text-[#4b3f68]"
                >
                  View File
                </a>
              </div>
            )}
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 text-[#94a3b8] hover:text-[#0d3349] transition-colors cursor-pointer bg-white rounded-full p-1.5 shadow-sm border border-[#e2d9ed]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-6 py-3 bg-white border-b border-[#e7dff0] flex gap-6 text-[13px] font-semibold text-[#64748b]">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#94a3b8] block"></span> Total Students: <span className="text-[#1e293b]">{totalStudents}</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981] block"></span> Submitted: <span className="text-[#1e293b]">{submittedCount}</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b] block"></span> Pending: <span className="text-[#1e293b]">{pendingCount}</span></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-main-bg p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-[#e2e8f0]/40 rounded-sm w-full"></div>)}
            </div>
          ) : (
            <div className="bg-white rounded-sm border border-[#e7dff0] overflow-hidden shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                    <th className="py-3.5 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student Name</th>
                    <th className="py-3.5 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Submitted At</th>
                    <th className="py-3.5 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7dff0]">
                  {students.map(student => {
                    const submission = submissions.find(s => s.student_id === student.id);
                    const formattedSubDate = submission?.submitted_at ? new Intl.DateTimeFormat('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    }).format(new Date(submission.submitted_at)) : '—';

                    return (
                      <tr key={student.id} className="hover:bg-[#fbf8fe]/50 transition-colors">
                        <td className="py-3.5 px-5 text-[13.5px] font-bold text-[#4b3f68]">{student.name}</td>
                        <td className="py-3.5 px-5 text-[13px] font-medium text-[#64748b]">{formattedSubDate}</td>
                        <td className="py-3.5 px-5">
                          {submission ? (
                            <span className="bg-[#dcfce7] text-[#16a34a] rounded-sm px-2 py-0.5 text-[11px] font-bold inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full block"></span>
                              Submitted
                            </span>
                          ) : (
                            <span className="bg-[#f1f5f9] text-[#64748b] rounded-sm px-2 py-0.5 text-[11px] font-bold inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full block"></span>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {submission?.file_url ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleViewFile(submission.file_url)}
                                className="text-[#6a5182] hover:text-[#5b4471] hover:underline flex items-center gap-1.5 font-semibold text-[13px] transition-colors cursor-pointer"
                              >
                                <FileText size={14} />
                                View Work
                              </button>
                              <a
                                href={submission.file_url}
                                download
                                className="text-[#64748b] hover:text-[#4b3f68] hover:underline font-semibold text-[13px] transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          ) : (
                            <span className="text-[#94a3b8]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#64748b] text-[13px]">
                        No students enrolled in this course yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
