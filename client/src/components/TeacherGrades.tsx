import { Award, Plus } from 'lucide-react';

interface GradeItem {
  id: string;
  title: string;
  course: string;
  category: string;
  avgGrade?: string;
}

const MOCK_GRADES: GradeItem[] = [
  { id: '1', title: 'Attendance', course: 'Math 101', category: 'Classwork', avgGrade: '4/5' },
  { id: '2', title: 'Assignment', course: 'Math 104', category: 'Homework', avgGrade: '8.5/10' },
  { id: '3', title: 'Quiz', course: 'Math 104', category: 'Homework' },
];

export default function TeacherGrades() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] flex flex-col mt-6 flex-1">
      <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#0d3349]">Latest Grades</h3>
        
        <button className="flex items-center gap-1.5 bg-[#006496] hover:bg-[#004e75] text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm">
          <Plus size={14} />
          New
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {MOCK_GRADES.map(item => (
          <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm transition-all bg-[#f8fafc]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#e2e8f0] shrink-0 text-[#006496]">
              <Award size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-[#1e293b] leading-tight">{item.title}</h4>
              <div className="flex items-center gap-1.5 text-[12px] text-[#64748b] font-medium mt-1">
                <span>Course: <strong className="text-[#475569]">{item.course}</strong></span>
                <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span>
                <span>Category: <strong className="text-[#475569]">{item.category}</strong></span>
              </div>
            </div>
            {item.avgGrade && (
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">Avg Grade</span>
                <span className="text-[15px] font-extrabold text-[#006496] mt-0.5">{item.avgGrade}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
