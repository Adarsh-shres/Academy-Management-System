import { MoreVertical, Filter } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-[#e2e8f0] flex flex-col w-full">
      <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#0d3349]">What's Due</h3>
        
        <button className="flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-[13px] font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer">
          <Filter size={14} />
          All Courses
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course/Topic</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Due Date</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Submission Rate</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DUE.map(item => (
              <tr key={item.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors group">
                <td className="py-3 px-6 text-[13px] font-semibold text-[#1e293b] whitespace-pre-wrap">{item.courseTopic}</td>
                <td className="py-3 px-6 text-[13px] font-medium text-[#475569]">{item.dueDate}</td>
                <td className="py-3 px-6 text-[13px] font-bold text-[#006496]">{item.submissionRate}</td>
                <td className="py-3 px-6">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap ${getBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-right">
                  <button className="text-[#94a3b8] hover:text-[#006496] transition-colors p-1 rounded-md cursor-pointer inline-flex items-center justify-center">
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
