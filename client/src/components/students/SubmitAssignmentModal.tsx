import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import type { Assignment } from './StudentAssignmentCard';
import { useAuth } from '../../context/AuthContext';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSubmitted: () => void;
}

export default function SubmitAssignmentModal({ isOpen, onClose, assignment, onSubmitted }: SubmitAssignmentModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFile(null);
      setIsSubmitting(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !assignment) return null;

  const handleFileUpload = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_student_${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from('assignments')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      alert('Please upload a file to submit.');
      return;
    }
    if (assignment.status === 'closed' || assignment.portalOpen === false || assignment.isPastDue) {
      alert('This assignment is overdue or closed and can no longer be submitted.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: latestAssignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('due_date, due_time, portal_open')
        .eq('id', assignment.id)
        .single();

      if (assignmentError) throw assignmentError;

      const dueDateValue = latestAssignment?.due_date ? String(latestAssignment.due_date) : '';
      const dueDateTime = dueDateValue
        ? new Date(dueDateValue.includes('T') ? dueDateValue : `${dueDateValue}T${latestAssignment.due_time || '23:59:00'}`)
        : null;

      if (latestAssignment?.portal_open === false || (dueDateTime && dueDateTime < new Date())) {
        alert('This assignment is overdue or closed and can no longer be submitted.');
        onClose();
        onSubmitted();
        return;
      }

      const fileUrl = await handleFileUpload(file);

      const { data: existingSubmissions, error: existingError } = await supabase
        .from('submissions')
        .select('id, status')
        .eq('assignment_id', assignment.id)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .limit(1);

      if (existingError) throw existingError;

      const existingSubmission = existingSubmissions?.[0];
      const submissionPayload = {
        file_url: fileUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      };

      const { error: saveError } = existingSubmission
        ? await supabase
          .from('submissions')
          .update(submissionPayload)
          .eq('id', existingSubmission.id)
        : await supabase
        .from('submissions')
        .insert({
          assignment_id: assignment.id,
          student_id: user.id,
          ...submissionPayload,
        });

      if (saveError) throw saveError;

      onSubmitted();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Submission error:', message);
      alert('Failed to submit assignment: ' + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-md w-full max-w-[500px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#E1E6EE] flex justify-between items-center bg-[#F6F8FB] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#232529]">Submit Assignment</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto w-full hide-scrollbar">
          <div className="mb-5">
            <h4 className="text-[15px] font-bold text-[#232529] mb-1">{assignment.title}</h4>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[12px] font-medium text-[#7c8697]">{assignment.course}</span>
              <span className="text-[#cbd5e1]">&bull;</span>
              <span className="text-[11px] font-semibold text-primary">{assignment.courseCode}</span>
            </div>
            {assignment.description && (
              <p className="text-[13px] text-[#64748b] bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0]">
                {assignment.description}
              </p>
            )}
          </div>

          <form id="submit-assignment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Your Work *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) setFile(droppedFile);
                }}
                className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-[#CCD4E0] bg-[#F6F8FB]' : 'border-[#E1E6EE] hover:border-[#CCD4E0] hover:bg-[#F6F8FB]'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) setFile(selected);
                  }}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-[#4B5563]">
                    <span className="text-[13px] font-semibold">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-rose-400 hover:text-rose-600 font-bold ml-2"
                    >✕</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[13px] font-medium">
                      Click or drag file to upload
                    </span>
                    <span className="text-[11px]">PDF, DOC, DOCX, ZIP supported</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#E1E6EE] bg-[#F6F8FB] flex justify-end gap-3 rounded-b-md">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-white border border-[#E1E6EE] text-[#232529] text-[13.5px] font-semibold rounded-sm hover:bg-[#F6F8FB] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="submit-assignment-form"
            disabled={isSubmitting || !file}
            className="px-6 py-2.5 bg-[#3E4FFF] hover:bg-[#5F73F5] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
