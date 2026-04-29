interface TeacherHeaderCardProps {
  photo?: string;
  fullName: string;
  subject: string;
  employeeId: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  onEdit?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  'Active':   'bg-[#d1fae5] text-[#065f46]',
  'On Leave': 'bg-[#fef3c7] text-[#92400e]',
  'Inactive': 'bg-[#f1f5f9] text-[#475569]',
};

export default function TeacherHeaderCard({
  photo,
  fullName,
  subject,
  employeeId,
  department,
  status,
  onEdit,
}: TeacherHeaderCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-sm p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-6">

        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="w-[120px] h-[150px] bg-[#f1f5f9] border border-[#e2e8f0] rounded-sm flex items-center justify-center overflow-hidden shrink-0">
            {photo ? (
              <img src={photo} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <svg className="text-[#cbd5e1] w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] ${STATUS_STYLES[status]}`}>
            {status}
          </span>
        </div>

        {/* Info + Actions */}
        <div className="flex-1 flex flex-col justify-between min-w-0">

          {/* Top: Name + Edit */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-sans text-[22px] font-extrabold text-[#0d3349] tracking-tight leading-tight">
                {fullName}
              </h2>
              <p className="text-[13px] text-[#64748b] mt-1">{subject}</p>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Detail Fields */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-5">
            <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
              <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">Employee ID</span>
              <span className="text-[#1e293b] font-semibold text-[15px]">{employeeId}</span>
            </div>
            <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
              <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">Department</span>
              <span className="text-[#1e293b] font-semibold text-[15px]">{department}</span>
            </div>
            <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
              <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">Specialization</span>
              <span className="text-[#1e293b] font-semibold text-[15px]">{subject}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
