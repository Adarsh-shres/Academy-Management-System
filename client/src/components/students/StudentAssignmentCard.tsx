import { useState } from "react";
import SubmitAssignmentModal from "./SubmitAssignmentModal";
import ViewStudentSubmissionModal from "./ViewStudentSubmissionModal";

export interface Assignment {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  deadline: string;
  status: string;
  description?: string;
  marks: string;
  submittedOn?: string | null;
  grade?: string | null;
  fileUrl?: string;
}

interface StudentAssignmentCardProps {
  assignment: Assignment;
  compact?: boolean;
  onSubmitted?: () => void;
}

export default function StudentAssignmentCard({ assignment, compact = false, onSubmitted }: StudentAssignmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { title, course, courseCode, deadline, status, marks, submittedOn, grade } = assignment;

  const isPending = status === "pending";

  const today = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const getDueBadge = () => {
    if (!isPending) return null;
    if (diffDays < 0) return { text: "Overdue", cls: "text-[#4b3f68] bg-[#faf8fc] border-[#e2d9ed]" };
    if (diffDays === 0) return { text: "Due Today", cls: "text-primary bg-[#f3eff7] border-[#e7dff0]" };
    if (diffDays <= 3) return { text: `${diffDays}d left`, cls: "text-[#64748b] bg-[#f8fafc] border-[#e2e8f0]" };
    return { text: `${diffDays}d left`, cls: "text-[#64748b] bg-[#f8fafc] border-[#f1f5f9]" };
  };

  const dueBadge = getDueBadge();

  return (
    <div className={`bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] transition-all duration-200 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start gap-4">
        {/* Status icon */}
        <div className={`mt-0.5 w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${isPending ? "bg-[#faf8fc]" : "bg-[#f3eff7]"}`}>
          {isPending ? (
            <svg className="w-[18px] h-[18px] text-[#4b3f68]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-[18px] h-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h3 className="font-sans text-[14px] font-semibold text-[#4b3f68] leading-tight tracking-tight">{title}</h3>
            <span
              className={`text-[10px] font-semibold px-2 py-[2px] uppercase tracking-wide rounded-full border flex-shrink-0 ${
                isPending ? "text-[#4b3f68] bg-[#faf8fc] border-[#e2d9ed]" : "text-primary bg-[#f3eff7] border-[#e7dff0]"
              }`}
            >
              {isPending ? "Pending" : "Submitted"}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[12px] font-medium text-[#7c8697]">{course}</span>
            <span className="text-[#cbd5e1]">&bull;</span>
            <span className="text-[11px] font-semibold text-primary">{courseCode}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              <span className="text-[12px] text-[#7c8697]">
                {isPending ? `Due: ${new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : (submittedOn ? `Submitted: ${new Date(submittedOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : '')}
              </span>
              <span className="text-[12px] text-[#7c8697]">{marks}</span>
              {grade && <span className="text-[11px] font-semibold text-primary bg-[#f3eff7] px-2 py-[2px] rounded-[6px]">Grade: {grade}</span>}
              {dueBadge && (
                <span className={`text-[11px] font-semibold px-2 py-[2px] rounded-[6px] border ${dueBadge.cls}`}>
                  {dueBadge.text}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-5 flex gap-3">
          {isPending ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer"
            >
              Submit Assignment
            </button>
          ) : (
            <button 
              onClick={() => setIsReportOpen(true)}
              className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors cursor-pointer"
            >
              View Report
            </button>
          )}
        </div>
      )}

      {/* Submission Modal */}
      {isModalOpen && (
        <SubmitAssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignment={assignment}
          onSubmitted={() => {
            setIsModalOpen(false);
            if (onSubmitted) onSubmitted();
          }}
        />
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <ViewStudentSubmissionModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          assignment={assignment}
        />
      )}
    </div>
  );
}
