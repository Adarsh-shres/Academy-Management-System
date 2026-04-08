import { Award, Plus } from './icons';

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
    <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 flex flex-col mt-6 flex-1">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-gradient-to-r from-[#f5effa] to-white">
        <h3 className="font-sans text-[18px] font-extrabold tracking-tight text-[#4b3f68]">Latest Grades</h3>
        
        <button className="flex items-center gap-1.5 bg-primary hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-4 py-[8px] rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px">
          <Plus size={14} />
          New
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {MOCK_GRADES.map(item => (
          <div key={item.id} className="flex items-start gap-[12px] py-[14px] border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] transition-colors px-[12px] rounded-sm group">
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 text-white shadow-sm bg-primary">
              <Award size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-sans text-[15px] font-extrabold text-[#4b3f68] leading-tight tracking-tight mb-1">{item.title}</h4>
              <div className="flex items-center gap-1.5 text-[11.5px] text-[#7c8697] font-medium">
                <span className="text-[#4b3f68]">{item.course}</span>
                <span className="text-[#cbd5e1]">•</span>
                <span>{item.category}</span>
              </div>
            </div>
            {item.avgGrade && (
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#778196]">Avg</span>
                <span className="text-[13px] font-semibold text-[#4b3f68]">{item.avgGrade}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
