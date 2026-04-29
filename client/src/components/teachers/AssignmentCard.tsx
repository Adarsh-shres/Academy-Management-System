import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, FileText } from '../shared/icons';

interface Assignment {
  id: string;
  title: string;
  course: string;
  description?: string;
  due_date: string;
  file_url?: string;
  portal_open?: boolean;
  class_id?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  totalStudents: number;
  submittedCount: number;
  onViewSubmissions: (assignment: Assignment) => void;
  onRefresh?: () => void;
}

export default function AssignmentCard({
  assignment,
  totalStudents,
  submittedCount,
  onViewSubmissions,
  onRefresh
}: AssignmentCardProps) {
  const [togglingPortal, setTogglingPortal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');

  const isGraded = submittedCount > 0 && submittedCount >= totalStudents && totalStudents > 0;
  const isDuePassed = assignment.due_date ? (() => { const d = new Date(assignment.due_date); return !isNaN(d.getTime()) && d < new Date(); })() : false;
  const isOpen = assignment.portal_open && !isDuePassed;

  const getStatusBadge = () => {
    if (isGraded) return <span className="bg-[#e0f2fe] text-[#0284c7] rounded-sm px-2.5 py-1 text-[11px] font-bold">GRADED</span>;
    if (isOpen) return <span className="bg-[#dcfce7] text-[#16a34a] rounded-sm px-2.5 py-1 text-[11px] font-bold">OPEN</span>;
    return <span className="bg-[#ffedd5] text-[#ea580c] rounded-sm px-2.5 py-1 text-[11px] font-bold">CLOSED</span>;
  };

  const formattedDueDate = assignment.due_date ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(assignment.due_date)) : 'No Due Date';

  const handleTogglePortal = async () => {
    if (togglingPortal) return;

    // If portal is currently open → close it directly
    if (assignment.portal_open) {
      setTogglingPortal(true);
      try {
        const { error: updateError } = await supabase
          .from('assignments')
          .update({ portal_open: false })
          .eq('id', assignment.id);
        if (updateError) throw updateError;
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(err);
        alert('Failed to close portal.');
      } finally {
        setTogglingPortal(false);
      }
      return;
    }

    // If due date has passed → show reopen modal to set new date/time
    if (isDuePassed) {
      setNewDueDate('');
      setNewDueTime('');
      setShowReopenModal(true);
      return;
    }

    // Active assignment (due date in future) → open portal directly
    setTogglingPortal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from('assignments')
        .update({ portal_open: true })
        .eq('id', assignment.id);
      if (updateError) throw updateError;

      await supabase
        .from('notifications')
        .insert({
          class_id: assignment.class_id,
          teacher_id: user.id,
          message: `New assignment posted: ${assignment.title}. Due: ${formattedDueDate}`,
          type: 'assignment_open',
          assignment_id: assignment.id
        });

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to open portal.');
    } finally {
      setTogglingPortal(false);
    }
  };

  const handleReopenWithNewDate = async () => {
    if (!newDueDate || !newDueTime) {
      alert('Please enter both a new due date and time.');
      return;
    }
    setTogglingPortal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from('assignments')
        .update({
          due_date: newDueDate,
          due_time: newDueTime,
          portal_open: true
        })
        .eq('id', assignment.id);

      if (updateError) throw updateError;

      const newFormattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      }).format(new Date(`${newDueDate}T${newDueTime}`));

      await supabase
        .from('notifications')
        .insert({
          class_id: assignment.class_id,
          teacher_id: user.id,
          message: `Assignment reopened: ${assignment.title}. New due date: ${newFormattedDate}`,
          type: 'assignment_open',
          assignment_id: assignment.id
        });

      setShowReopenModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to reopen portal.');
    } finally {
      setTogglingPortal(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const confirmed = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignment.id);

      if (error) throw error;

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete assignment.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col hover:border-[#d8c8e9] transition-colors">
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-[15px] font-bold text-[#4b3f68] truncate" title={assignment.title}>
                {assignment.title}
              </h3>
              <p className="text-[12px] font-semibold text-[#64748b] mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {assignment.course}
              </p>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              {getStatusBadge()}
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete assignment"
                className="text-[#94a3b8] hover:text-[#dc2626] transition-colors cursor-pointer p-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 text-[12.5px]">
            <div className="flex items-center gap-2 text-[#475569]">
              <Calendar size={14} className="text-[#94a3b8]" />
              <span className="font-medium">
                Due: <span className="text-[#1e293b] font-semibold">{formattedDueDate}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#475569]">
              <FileText size={14} className="text-[#94a3b8]" />
              <span className="font-medium">
                Submitted:{' '}
                <span className="text-[#1e293b] font-semibold">
                  {submittedCount} / {totalStudents}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#e7dff0] bg-[#fbf8fe]/50 flex gap-2">
          <button
            onClick={handleTogglePortal}
            disabled={togglingPortal}
            className={`flex-1 border rounded-sm text-[12px] font-bold py-2.5 transition-colors shadow-sm active:scale-[0.99] cursor-pointer ${
              assignment.portal_open
                ? 'bg-white border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#dc2626]'
                : 'bg-white border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7] hover:border-[#6a5182]'
            }`}
          >
            {togglingPortal
              ? (assignment.portal_open ? 'CLOSING...' : 'OPENING...')
              : (assignment.portal_open ? 'CLOSE PORTAL' : 'OPEN PORTAL')
            }
          </button>
          <button
            onClick={() => onViewSubmissions(assignment)}
            className="flex-1 bg-[#6a5182] hover:bg-[#5b4471] text-white rounded-sm text-[12px] font-bold py-2.5 transition-colors shadow-sm active:scale-[0.99] cursor-pointer"
          >
            VIEW SUBMISSIONS
          </button>
        </div>
      </div>

      {/* Reopen Portal Modal — shown when opening an expired assignment */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowReopenModal(false)} />
          <div className="relative z-10 bg-white rounded-md w-full max-w-[380px] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
              <h3 className="text-[16px] font-bold text-[#4b3f68]">Reopen Assignment</h3>
              <button onClick={() => setShowReopenModal(false)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-[13px] text-[#475569]">
                Set a new due date and time for <span className="font-semibold text-[#4b3f68]">{assignment.title}</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">New Due Date *</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">New Due Time *</label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={e => setNewDueTime(e.target.value)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>
            </div>
            <div className="p-5 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3 rounded-b-md">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenWithNewDate}
                disabled={togglingPortal}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                {togglingPortal ? 'Reopening...' : 'Reopen Portal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
