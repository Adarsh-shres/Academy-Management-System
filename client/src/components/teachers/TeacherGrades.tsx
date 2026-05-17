import { useState } from 'react';
import { Award, Plus } from '../shared/icons';

interface GradeItem {
  id: string;
  title: string;
  course: string;
  category: string;
  avgGrade?: string;
}

export default function TeacherGrades() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ─── New Grade form state ─────────────────────────────────── */
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newCategory, setNewCategory] = useState('Classwork');

  const resetForm = () => {
    setNewTitle(''); setNewCourse(''); setNewCategory('Classwork');
  };

  const handleAdd = () => {
    setGrades(prev => [...prev, {
      id: String(prev.length + 1),
      title: newTitle || 'Untitled',
      course: newCourse || 'General',
      category: newCategory,
    }]);
    resetForm();
    setIsModalOpen(false);
  };

  const deleteGrade = (id: string) => {
    if (window.confirm('Delete this grade entry?')) {
      setGrades(prev => prev.filter(g => g.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#E1E6EE] flex flex-col mt-6 flex-1 shadow-[0_10px_28px_rgba(36,37,41,0.06)]">
      <div className="p-5 border-b border-[#E1E6EE] flex items-center justify-between bg-[#F6F8FB]">
        <h3 className="text-[16px] font-bold text-[#232529]">Latest Grades</h3>
        
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 bg-primary hover:bg-[#5F73F5] text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-sm transition-all cursor-pointer shadow-sm">
          <Plus size={14} />
          New
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {grades.length === 0 && (
          <div className="rounded-sm border border-dashed border-[#E1E6EE] bg-[#F6F8FB] p-8 text-center text-[13px] font-semibold text-[#7c8697]">
            No grade entries yet.
          </div>
        )}
        {grades.map(item => (
          <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-sm border border-[#E1E6EE] hover:border-[#E1E6EE] hover:shadow-sm transition-all bg-[#F6F8FB]">
            <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center border border-[#E1E6EE] shrink-0 text-primary">
              <Award size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-[#232529] leading-tight">{item.title}</h4>
              <div className="flex items-center gap-1.5 text-[12px] text-[#64748b] font-medium mt-1">
                <span>Course: <strong className="text-[#475569]">{item.course}</strong></span>
                <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span>
                <span>Category: <strong className="text-[#475569]">{item.category}</strong></span>
              </div>
            </div>
            {item.avgGrade && (
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">Avg Grade</span>
                <span className="text-[15px] font-extrabold text-primary mt-0.5">{item.avgGrade}</span>
              </div>
            )}
            <button 
              onClick={() => deleteGrade(item.id)}
              className="text-[#94a3b8] hover:text-rose-500 transition-colors ml-2 p-1"
              title="Delete Grade"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* New Grade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsModalOpen(false); resetForm(); }}>
          <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">New Grade Entry</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Quiz, Assignment, Lab Report" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#CCD4E0]/20 transition-all font-sans text-[#1e293b]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</label>
                <input type="text" value={newCourse} onChange={e => setNewCourse(e.target.value)} placeholder="e.g. Math 101" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#CCD4E0]/20 transition-all font-sans text-[#1e293b]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#CCD4E0]/20 transition-all font-sans text-[#1e293b]">
                  <option value="Classwork">Classwork</option>
                  <option value="Homework">Homework</option>
                  <option value="Exam">Exam</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 bg-[#F6F8FB] border border-[#E1E6EE] hover:bg-[#3E4FFF] hover:text-white text-[#4B5563] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] cursor-pointer">Cancel</button>
                <button type="submit" className="flex-[2] bg-[#3E4FFF] hover:bg-[#5F73F5] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">Add Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
