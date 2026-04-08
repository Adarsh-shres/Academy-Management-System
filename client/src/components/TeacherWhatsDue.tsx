import { MoreVertical } from './icons';

interface DueItem {
  id: string;
  courseTopic: string;
  dueDate: string;
  submissionRate: string;
  status: 'Waiting submissions' | 'Ready for grading' | 'Graded successfully';
}

const MOCK_DUE: DueItem[] = [
  { id: '1', courseTopic: 'Math 101\nUnit 2: Add and subtract', dueDate: '23 Dec 2017', submissionRate: '69%', status: 'Waiting submissions' },
  { id: '2', courseTopic: 'Math 102\nUnit 2: Motion and forces', dueDate: '20 Dec 2017', submissionRate: '98%', status: 'Ready for grading' },
  { id: '3', courseTopic: 'Math 104\nLinear equations', dueDate: '13 Dec 2017', submissionRate: '100%', status: 'Graded successfully' },
];

export default function TeacherWhatsDue() {
  const getBadgeClass = (status: DueItem['status']) => {
    switch (status) {
      case 'Waiting submissions': return 'bg-[#f1f5f9] text-[#64748b]';
      case 'Ready for grading': return 'bg-[#dcfce7] text-[#16a34a]';
      case 'Graded successfully': return 'bg-[#e0f2fe] text-[#0284c7]';
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col w-full shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
        <h3 className="text-[16px] font-bold text-[#4b3f68]">What's Due</h3>
        <span className="text-[12px] font-semibold text-[#7c8697]">Upcoming tasks</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course/Topic</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Due Date</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Submission Rate</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DUE.map(item => (
              <tr key={item.id} className="border-b border-[#e7dff0] last:border-0 hover:bg-[#fbf8fe] transition-colors group">
                <td className="py-3 px-6 text-[13px] font-semibold text-[#4b3f68] whitespace-pre-wrap">{item.courseTopic}</td>
                <td className="py-3 px-6 text-[13px] font-medium text-[#475569]">{item.dueDate}</td>
                <td className="py-3 px-6 text-[13px] font-bold text-primary">{item.submissionRate}</td>
                <td className="py-3 px-6">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-sm whitespace-nowrap ${getBadgeClass(item.status)}`}>
                    {item.status}
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
      </div>
    </div>
  );
}
