import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubmitAssignmentModal from '../components/students/SubmitAssignmentModal';
import type { Assignment } from '../components/students/StudentAssignmentCard';
import { useAuth } from '../context/AuthContext';
import { useStudentData } from '../hooks/useStudentData';
import { supabase } from '../lib/supabase';
import { DetailPageSkeleton } from '../components/skeletons/PageSkeletons';
import { SkeletonBlock } from '../components/shared/Skeleton';

interface SubmissionAttempt {
  id: string;
  file_url: string | null;
  status: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  submitted_at: string | null;
}

const getGradeStatus = (grade: number | null | undefined): 'pending' | 'partial' | 'completed' => {
  if (grade === null || grade === undefined) return 'pending';
  return grade >= 80 ? 'completed' : 'partial';
};

const getGradeStatusLabel = (grade: number | null | undefined) => {
  const status = getGradeStatus(grade);
  if (status === 'completed') return 'Completed';
  if (status === 'partial') return 'Partial';
  return 'Pending';
};

export default function StudentAssignmentSubmissionPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  const { assignments, isLoading: isAssignmentLoading, error: assignmentError, refetch } = useStudentData();
  const [attempts, setAttempts] = useState<SubmissionAttempt[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const assignment = assignments.find((item) => item.id === assignmentId) as Assignment | undefined;
  const latestAttempt = attempts[0];
  const canResubmit = !!assignment && assignment.portalOpen !== false && assignment.isPastDue !== true;

  const summary = useMemo(() => {
    const grade = latestAttempt?.grade ?? null;
    return {
      status: getGradeStatusLabel(grade),
      grade,
      feedback: latestAttempt?.feedback || null,
      gradedAt: latestAttempt?.graded_at || null,
      submittedAt: latestAttempt?.submitted_at || null,
    };
  }, [latestAttempt]);

  const loadSubmissionHistory = async () => {
    if (!assignmentId || !user?.id) {
      setAttempts([]);
      setIsHistoryLoading(false);
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const actualAttempts = (data || []).filter((submission: SubmissionAttempt) => {
        return !!submission.file_url || submission.status !== 'pending' || submission.grade !== null;
      });

      setAttempts(actualAttempts);
    } catch (err: any) {
      console.error('Failed to load submission history', err);
      setHistoryError(err.message || 'Failed to load submission history.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissionHistory();
  }, [assignmentId, user?.id]);

  if (isAssignmentLoading) {
    return <DetailPageSkeleton />;
  }

  if (assignmentError || !assignment) {
    return (
      <div className="flex flex-col gap-4 h-[300px] items-center justify-center text-center">
        <p className="text-[#4b3f68] font-semibold">{assignmentError || 'Assignment not found.'}</p>
        <button onClick={() => navigate('/student/assignments')} className="px-5 py-2.5 rounded-[8px] bg-primary text-white text-[13px] font-semibold">
          Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 pb-10 flex-1 min-w-0 max-w-[980px] mx-auto w-full">
      <button onClick={() => navigate('/student/assignments')} className="self-start text-[#6a5182] hover:text-[#4b3f68] font-bold text-[13px] tracking-wide">
        Back to assignments
      </button>

      <div className="bg-white rounded-[10px] border border-[#e7dff0] p-6 shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <h1 className="font-sans text-[24px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">{assignment.title}</h1>
            <p className="text-[13px] font-medium text-[#7c8697] mt-2">
              {assignment.course} / <span className="text-primary font-semibold">{assignment.courseCode}</span>
            </p>
            {assignment.description && (
              <p className="text-[13px] text-[#64748b] bg-[#f8fafc] p-3 rounded-[8px] border border-[#e2e8f0] mt-4">
                {assignment.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="bg-[#fbf8fe] rounded-[8px] border border-[#e7dff0] p-3">
              <p className="text-[10px] font-bold text-[#778196] uppercase tracking-wide">Status</p>
              <p className="text-[15px] font-bold text-[#4b3f68] mt-1">{summary.status}</p>
            </div>
            <div className="bg-[#fbf8fe] rounded-[8px] border border-[#e7dff0] p-3">
              <p className="text-[10px] font-bold text-[#778196] uppercase tracking-wide">Grade</p>
              <p className="text-[15px] font-bold text-[#4b3f68] mt-1">{summary.grade ?? 'Pending'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {canResubmit && (
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-6 py-3 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
            >
              {attempts.length > 0 ? 'Resubmit Assignment' : 'Submit Assignment'}
            </button>
          )}
          {!canResubmit && (
            <span className="px-4 py-3 rounded-[8px] text-[13px] font-semibold text-[#94a3b8] bg-[#f1f5f9]">
              Submission portal is closed
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-[#e7dff0] p-6 shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
        <h2 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight">Teacher Remarks</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-4">
          {summary.feedback || 'No remarks yet.'}
        </p>
      </div>

      <div className="bg-white rounded-[10px] border border-[#e7dff0] p-6 shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight">Submission History</h2>
          <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-[6px] bg-[#fbf8fe] text-[#8b6ca8] border border-[#f3eff7] uppercase tracking-wide">
            {attempts.length}
          </span>
        </div>

        {isHistoryLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : historyError ? (
          <div className="py-10 text-center text-[#4b3f68] font-semibold">{historyError}</div>
        ) : attempts.length === 0 ? (
          <div className="py-10 text-center text-[13px] font-semibold text-[#7c8697] uppercase tracking-wider">
            No submissions yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {attempts.map((attempt, index) => {
              const status = getGradeStatusLabel(attempt.grade);
              return (
                <div key={attempt.id} className="border border-[#e7dff0] rounded-[10px] p-4 bg-[#fbf8fe]">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#4b3f68]">Attempt {attempts.length - index}</p>
                      <p className="text-[12px] text-[#64748b] mt-1">
                        {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : 'Submission time unavailable'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-primary bg-[#f3eff7] border border-[#e7dff0]">
                        {status}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-[#64748b] bg-white border border-[#e2e8f0]">
                        Grade: {attempt.grade ?? 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {attempt.file_url ? (
                      <a href={attempt.file_url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-primary hover:underline">
                        View submitted file
                      </a>
                    ) : (
                      <span className="text-[13px] font-semibold text-[#94a3b8]">No file attached</span>
                    )}
                    <div className="text-[13px] text-[#64748b] bg-white border border-[#e2e8f0] rounded-[8px] p-3">
                      <span className="font-bold text-[#4b3f68]">Remarks: </span>
                      {attempt.feedback || 'No remarks for this attempt.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isSubmitOpen && (
        <SubmitAssignmentModal
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          assignment={assignment}
          onSubmitted={() => {
            setIsSubmitOpen(false);
            void refetch();
            void loadSubmissionHistory();
          }}
        />
      )}
    </div>
  );
}
