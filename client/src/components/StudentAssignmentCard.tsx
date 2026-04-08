

export interface Assignment {
  id: number;
  title: string;
  course: string;
  courseCode: string;
  deadline: string;
  status: string;
  description: string;
  marks: number;
  submittedOn?: string | null;
  grade?: string | null;
}

interface StudentAssignmentCardProps {
  assignment: Assignment;
  compact?: boolean;
}

export default function StudentAssignmentCard({ assignment, compact = false }: StudentAssignmentCardProps) {
  const { title, course, courseCode, deadline, status, marks, submittedOn, grade } = assignment;

  const isPending = status === "pending";

  const today = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const getDueBadge = () => {
    if (!isPending) return null;
    if (diffDays < 0) return { text: "Overdue", cls: "text-[#ef4444] bg-[#fef2f2] border-[#fee2e2]" };
    if (diffDays === 0) return { text: "Due Today", cls: "text-[#c2410c] bg-[#fff7ed] border-[#ffedd5]" };
    if (diffDays <= 3) return { text: `${diffDays}d left`, cls: "text-[#b45309] bg-[#fffbeb] border-[#fef3c7]" };
    return { text: `${diffDays}d left`, cls: "text-[#64748b] bg-[#f8fafc] border-[#f1f5f9]" };
  };

  const dueBadge = getDueBadge();

  return (
    <div className={`bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 ${compact ? "p-4" : "p-[22px_22px_20px]"}`}>
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className={`mt-0.5 w-[38px] h-[38px] rounded-[8px] flex items-center justify-center flex-shrink-0 ${isPending ? "bg-[#fffbeb]" : "bg-[#ecfdf5]"}`}>
          {isPending ? (
            <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h3 className="font-sans text-[15px] font-extrabold text-[#4b3f68] leading-tight tracking-tight">{title}</h3>
            <span
              className={`text-[10px] font-bold px-2 py-[2px] uppercase tracking-wide rounded-full border flex-shrink-0 ${
                isPending ? "text-[#b45309] bg-[#fffbeb] border-[#fef3c7]" : "text-[#047857] bg-[#ecfdf5] border-[#d1fae5]"
              }`}
            >
              {isPending ? "Pending" : "Submitted"}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[12px] font-medium text-[#7c8697]">{course}</span>
            <span className="text-[#cbd5e1]">•</span>
            <span className="text-[11px] font-bold text-primary">{courseCode}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-[10px] mt-2 flex-wrap">
              <span className="text-[12px] text-[#7c8697]">
                {isPending ? `Due: ${new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : (submittedOn ? `Submitted: ${new Date(submittedOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : '')}
              </span>
              <span className="text-[12px] text-[#7c8697]">{marks} marks</span>
              {grade && <span className="text-[11px] font-bold text-primary bg-[#f3eff7] px-[8px] py-[2px] rounded-[6px]">Grade: {grade}</span>}
              {dueBadge && (
                <span className={`text-[11px] font-bold px-[8px] py-[2px] rounded-[6px] border ${dueBadge.cls}`}>
                  {dueBadge.text}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-[18px] flex gap-2">
          {isPending ? (
            <button className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity">
              Submit Assignment
            </button>
          ) : (
            <button className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors">
              View Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}
