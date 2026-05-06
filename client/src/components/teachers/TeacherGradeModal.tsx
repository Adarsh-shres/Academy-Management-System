import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface TeacherGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onGraded: () => void;
}

/** Lets a teacher review a submission and save a grade. */
export default function TeacherGradeModal({ isOpen, onClose, submission, onGraded }: TeacherGradeModalProps) {
  const [gradeStatus, setGradeStatus] = useState<'complete' | 'partial' | 'pending'>('pending');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && submission) {
      if (submission.grade === null) setGradeStatus('pending');
      else if (submission.grade >= 80) setGradeStatus('complete');
      else setGradeStatus('partial');
      setFeedback(submission.feedback || '');
    }
  }, [isOpen, submission]);

  if (!isOpen || !submission) return null;

  const assignmentTitle = submission.assignments?.title || 'Unknown Assignment';
  const studentName = submission.users?.name || 'Unknown Student';

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();

    let numericGrade: number | null = null;
    if (gradeStatus === 'complete') numericGrade = 100;
    else if (gradeStatus === 'partial') numericGrade = 50;

    setIsSaving(true);
    try {
      if (String(submission.id).startsWith('pending-')) {
        const { error: gradeError } = await supabase
          .from('submissions')
          .insert({
            assignment_id: submission.assignment_id,
            student_id: submission.student_id,
            grade: numericGrade,
            feedback: feedback.trim() || null,
            graded_at: new Date().toISOString(),
            status: 'graded'
          });
        if (gradeError) throw new Error(gradeError.message);
      } else {
        const { error: gradeError } = await supabase
          .from('submissions')
          .update({
            grade: numericGrade,
            feedback: feedback.trim() || null,
            graded_at: new Date().toISOString()
          })
          .eq('id', submission.id);
        if (gradeError) throw new Error(gradeError.message);
      }

      if (submission.assignment_id) {
        const { error: submitError } = await supabase
          .from('assignments')
          .update({ status: 'graded' })
          .eq('id', submission.assignment_id);

        if (submitError) throw new Error(submitError.message);
      }

      onGraded();
      onClose();
    } catch (err: any) {
      alert("Failed to save grade: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 bg-white rounded-md w-full max-w-[500px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#4b3f68]">Grade Submission</h3>
          <button 
            onClick={onClose} 
            className="text-[#94a3b8] hover:text-[#4b3f68] transition-colors cursor-pointer bg-white rounded-full p-1 border border-[#e2d9ed]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto w-full hide-scrollbar">
          <form id="grading-form" onSubmit={handleSaveGrade} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-1.5">
                 <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student</label>
                 <div className="px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-[13.5px] font-semibold text-[#475569]">
                   {studentName}
                 </div>
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assignment Target</label>
                 <div className="px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm text-[13.5px] font-semibold text-[#475569] truncate" title={assignmentTitle}>
                   {assignmentTitle}
                 </div>
               </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#e2e8f0]">
               <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">{studentName}'s Submitted Work</label>
               {submission.file_url ? (
                  <a 
                    href={submission.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 group w-fit"
                  >
                     <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#f3eff7] text-[#6a5182] group-hover:bg-[#6a5182] group-hover:text-white transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                     </div>
                     <span className="text-[13.5px] font-bold text-[#6a5182] group-hover:underline">View Attachment Target / Solution</span>
                  </a>
               ) : (
                  <span className="text-[13px] text-[#94a3b8] italic">No file attachment provided.</span>
               )}
            </div>

            <div className="flex flex-col gap-1.5 pt-4 border-t border-[#e2e8f0]">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Grade Status *</label>
              <div className="relative w-1/2">
                <select
                  value={gradeStatus}
                  onChange={e => setGradeStatus(e.target.value as any)}
                  className="bg-white border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] font-bold text-[#4b3f68] outline-none focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all w-full appearance-none cursor-pointer"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#64748b]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider flex justify-between">
                <span>Direct Feedback</span>
                <span className="text-[10px] font-normal text-[#94a3b8] normal-case">(Optional)</span>
              </label>
              <textarea 
                rows={4}
                placeholder="Give constructive feedback related to their assignment output..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="bg-white border border-[#cbd5e1] rounded-sm px-4 py-3 text-[13.5px] w-full outline-none focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3 rounded-b-md">
           <button 
             type="button" 
             onClick={onClose} 
             disabled={isSaving}
             className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-50"
           >
             Cancel
           </button>
           <button 
             type="submit" 
             form="grading-form"
             disabled={isSaving}
             className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-bold tracking-wide rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isSaving ? 'Registering...' : 'Save Grade Result'}
           </button>
        </div>
      </div>
    </div>
  );
}
