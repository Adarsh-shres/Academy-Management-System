import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Assignment } from './StudentAssignmentCard';

interface ViewStudentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export default function ViewStudentSubmissionModal({ isOpen, onClose, assignment }: ViewStudentSubmissionModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !assignment) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-md w-full max-w-[500px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#4b3f68]">Submission Report</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto w-full hide-scrollbar flex flex-col gap-5">
          <div>
            <h4 className="text-[16px] font-bold text-[#4b3f68] mb-1">{assignment.title}</h4>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[13px] font-medium text-[#7c8697]">{assignment.course}</span>
              <span className="text-[#cbd5e1]">&bull;</span>
              <span className="text-[12px] font-semibold text-primary">{assignment.courseCode}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[11px] font-semibold px-2.5 py-1 uppercase tracking-wide rounded-full text-primary bg-[#f3eff7] border border-[#e7dff0]">
                Submitted
              </span>
              {assignment.submittedOn && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0]">
                  {new Date(assignment.submittedOn).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-3">
              <span className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider">Grade</span>
              <span className="text-[15px] font-bold text-[#4b3f68]">{assignment.grade || 'Not Graded Yet'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-3">
              <span className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider">Marks Awarded</span>
              <span className="text-[15px] font-bold text-[#4b3f68]">{assignment.marks !== 'Pending' ? assignment.marks : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider">Your File</span>
              {assignment.fileUrl ? (
                <a 
                  href={assignment.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  View Submission
                </a>
              ) : (
                <span className="text-[13px] font-bold text-[#94a3b8]">No file attached</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3 rounded-b-md">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary hover:opacity-90 text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
