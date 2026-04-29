import { MoreVertical, FileText } from '../shared/icons';

interface TeacherWhatsDueProps {
  recentAssignments: any[];
  isLoading: boolean;
}

export default function TeacherWhatsDue({ recentAssignments, isLoading }: TeacherWhatsDueProps) {
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#f1f5f9] text-[#64748b]';
      case 'graded': return 'bg-[#e0f2fe] text-[#0284c7]';
      default: return 'bg-[#f1f5f9] text-[#64748b]';
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col w-full shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
        <h3 className="text-[16px] font-bold text-[#4b3f68]">Recent Assignments</h3>
        <span className="text-[12px] font-semibold text-[#7c8697]">Latest added task</span>
      </div>

      <div className="overflow-x-auto min-h-[150px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full py-10">
            <span className="text-[13px] font-bold text-[#94a3b8] animate-pulse">Loading recent assignments...</span>
          </div>
        ) : recentAssignments.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full py-10 opacity-70">
            <FileText size={24} className="text-[#94a3b8] mb-2" />
            <span className="text-[13px] font-bold text-[#94a3b8]">No assignments found</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assignment Title</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Due Date</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentAssignments.map(item => (
                <tr key={item.id} className="border-b border-[#e7dff0] last:border-0 hover:bg-[#fbf8fe] transition-colors group">
                  <td className="py-3 px-6 text-[13px] font-semibold text-[#4b3f68] whitespace-pre-wrap">{item.title}</td>
                  <td className="py-3 px-6 text-[13px] font-medium text-[#475569]">
                    {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
                  </td>
                  <td className="py-3 px-6 text-[13px] font-bold text-primary uppercase">{item.type}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-sm whitespace-nowrap uppercase ${getBadgeClass(item.status)}`}>
                      {item.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button className="text-[#94a3b8] hover:text-primary transition-colors p-1 rounded-sm cursor-pointer inline-flex items-center justify-center">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
