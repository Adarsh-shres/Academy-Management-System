import { MoreVertical } from './icons';

interface DueItem {
  id: string;
  courseTopic: string;
  dueDate: string;
  submissionRate: string;
  status: 'Waiting submissions' | 'Ready for grading' | 'Graded successfully';
}

const MOCK_DUE: DueItem[] = [
  { id: '1', courseTopic: 'Math 101\nUnit 2: Add and subtract', dueDate: '23 Dec 2026', submissionRate: '69%', status: 'Waiting submissions' },
  { id: '2', courseTopic: 'Math 102\nUnit 2: Motion and forces', dueDate: '20 Dec 2026', submissionRate: '98%', status: 'Ready for grading' },
  { id: '3', courseTopic: 'Math 104\nLinear equations', dueDate: '13 Dec 2026', submissionRate: '100%', status: 'Graded successfully' },
];

export default function TeacherWhatsDue() {
  const getBadgeClass = (status: DueItem['status']) => {
    switch (status) {
      case 'Waiting submissions': return 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]';
      case 'Ready for grading': return 'bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]';
      case 'Graded successfully': return 'bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]';
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 flex flex-col w-full">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-gradient-to-r from-[#f5effa] to-white">
        <h3 className="font-sans text-[18px] font-extrabold tracking-tight text-[#4b3f68]">What's Due</h3>
        <span className="px-[8px] py-[3px] rounded-[6px] bg-[#faf8fc] text-[#778196] border border-[#e7dff0] text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm">
          Upcoming tasks
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf8fc] border-b border-[#e7dff0]">
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course / Topic</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Due Date</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Submission Rate</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DUE.map(item => (
              <tr key={item.id} className="border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] transition-colors group">
                <td className="py-[16px] px-6 text-[13px] font-extrabold text-[#4b3f68] whitespace-pre-wrap leading-tight">{item.courseTopic}</td>
                <td className="py-[16px] px-6 text-[13px] font-semibold text-[#7c8697]">{item.dueDate}</td>
                <td className="py-[16px] px-6 text-[13px] font-extrabold text-primary">{item.submissionRate}</td>
                <td className="py-[16px] px-6">
                  <span className={`inline-block px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.05em] rounded-full whitespace-nowrap ${getBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-[16px] px-6 text-right">
                  <button className="text-[#cbd5e1] hover:text-[#7c8697] transition-colors p-1 rounded-sm cursor-pointer inline-flex items-center justify-center">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
