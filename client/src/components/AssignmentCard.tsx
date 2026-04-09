import { Calendar, FileText } from './icons'; // Adjust imports passing on what icons exist

interface Assignment {
  id: string;
  title: string;
  course: string;
  description: string;
  due_date: string;
  file_url: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  totalStudents: number;
  submittedCount: number;
  onViewSubmissions: (assignment: Assignment) => void;
}

export default function AssignmentCard({
  assignment,
  totalStudents,
  submittedCount,
  onViewSubmissions,
}: AssignmentCardProps) {
  const isPending = submittedCount === 0;
  const isGraded = submittedCount === totalStudents && totalStudents > 0;
  const isReady = submittedCount > 0 && submittedCount < totalStudents;

  const getStatusBadge = () => {
    if (isGraded) return <span className="bg-[#e0f2fe] text-[#0284c7] rounded-sm px-2.5 py-1 text-[11px] font-bold">GRADED</span>;
    if (isReady) return <span className="bg-[#dcfce7] text-[#16a34a] rounded-sm px-2.5 py-1 text-[11px] font-bold">READY FOR GRADING</span>;
    return <span className="bg-[#ffedd5] text-[#ea580c] rounded-sm px-2.5 py-1 text-[11px] font-bold">PENDING GRADING</span>;
  };

  const formattedDueDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(assignment.due_date));

  return (
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
          <div className="shrink-0">{getStatusBadge()}</div>
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

      <div className="p-4 border-t border-[#e7dff0] bg-[#fbf8fe]/50">
        <button
          onClick={() => onViewSubmissions(assignment)}
          className="w-full bg-[#6a5182] hover:bg-[#5b4471] text-white rounded-sm text-[13px] font-semibold py-2.5 transition-colors shadow-sm active:scale-[0.99] cursor-pointer"
        >
          VIEW SUBMISSIONS
        </button>
      </div>
    </div>
  );
}
