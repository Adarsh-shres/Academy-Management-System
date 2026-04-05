import { useState, useRef, useEffect } from 'react';
import StatCard from '../components/StatCard';
import CurriculumCard from '../components/CurriculumCard';

type CourseStatus = 'Active' | 'Inactive';

interface Course {
  id: string;
  name: string;
  status: CourseStatus;
}

const initialCourses: Course[] = [
  { id: '5cs01', name: 'Collaborative Development', status: 'Active' },
  { id: '5cs02', name: 'Fullstack Development', status: 'Active' },
  { id: '5cs03', name: 'Algorithms and Currency', status: 'Inactive' },
  { id: '5cs05', name: 'Beginner Python Course', status: 'Active' },
  { id: '5cs06', name: 'Beginner Java Course', status: 'Active' },
  { id: '5cs07', name: 'Beginner React Course', status: 'Active' },
  { id: '5cs08', name: 'Beginner Pokemon Course', status: 'Inactive' },
  { id: '5cs09', name: 'Beginner Javascript Course', status: 'Active' },
  { id: '5cs10', name: 'WebDevelopment Course', status: 'Active' },
];

export default function CoursesPage() {
  const [view, setView] = useState<'overview' | 'list'>('overview');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [filterStatus, setFilterStatus] = useState<'All' | CourseStatus>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const handleSaveEdit = () => {
    if (editingCourse) {
      setCourses(courses.map(course => (course.id === editingCourse.id ? editingCourse : course)));
      setEditingCourse(null);
    }
  };

  const filteredCourses = courses.filter(course => filterStatus === 'All' || course.status === filterStatus);

  const renderOverview = () => (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Course Curriculum</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Conduct and create your courses.</p>
        </div>
        <button 
          onClick={() => setIsNewCourseModalOpen(true)}
          className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Course
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-8">
        {/* Left Column (Stats + Active Curriculum) */}
        <div className="flex-1 flex flex-col gap-6 md:gap-8">
          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:flex-1 max-w-[280px]">
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                label="Total Courses"
                value="50"
                subContent={null}
              />
            </div>
            <div className="w-full sm:flex-1 max-w-[280px]">
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                label="Active Enrollments"
                value="4,820"
                subContent={null}
              />
            </div>
          </div>

          {/* Center Main Content: Active Curriculum */}
          <div className="flex flex-col gap-5 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-bold text-[#0d3349] leading-tight">Active Curriculum</h3>
                <p className="text-[14px] text-[#64748b]">Currently running programs and their status.</p>
              </div>
              <button 
                onClick={() => setView('list')}
                className="text-[13px] font-semibold text-[#006496] hover:text-[#004e75] transition-all cursor-pointer underline-offset-2 hover:underline">
                View All Courses
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <CurriculumCard title="Collaborative Development" tag="STARTER" tagColor="bg-[#ccfbf1] text-[#0f766e]" />
              <CurriculumCard title="Full stack Development" tag="CORE" tagColor="bg-[#dbeafe] text-[#1d4ed8]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Course Curriculum</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Conduct and create your courses.</p>
        </div>
          <button 
          onClick={() => setView('overview')}
          className="text-[13px] font-semibold text-[#64748b] hover:text-[#6a5182] transition-all cursor-pointer">
          Back
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
          <h3 className="text-[16px] font-bold text-[#0d3349]">Courses</h3>
          <div className="flex gap-3">
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter {filterStatus !== 'All' && `(${filterStatus})`}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-[110%] right-0 w-36 bg-white border border-[#e2e8f0] rounded-sm shadow-lg z-10 flex flex-col overflow-hidden py-1">
                  <button onClick={() => { setFilterStatus('All'); setIsFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${filterStatus === 'All' ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}>All Courses</button>
                  <button onClick={() => { setFilterStatus('Active'); setIsFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${filterStatus === 'Active' ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}>Active</button>
                  <button onClick={() => { setFilterStatus('Inactive'); setIsFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${filterStatus === 'Inactive' ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}>Inactive</button>
                </div>
              )}
            </div>

            <button className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course ID</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors group">
                    <td className="py-3 px-6 text-[13px] font-semibold text-[#475569]">{course.id}</td>
                    <td className="py-3 px-6 text-[13px] font-medium text-[#1e293b]">{course.name}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${course.status === 'Active' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></span>
                        <span className="text-[13px] font-bold text-[#475569]">{course.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 text-[#94a3b8]">
                        <button 
                          onClick={() => setEditingCourse({ ...course })}
                          className="hover:text-[#6a5182] transition-colors cursor-pointer hover:scale-110 active:scale-95" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="hover:text-[#ef4444] transition-colors cursor-pointer hover:scale-110 active:scale-95" title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[13px] text-[#64748b]">No courses found matching this selection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal Overlay */}
      {editingCourse && (
        <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingCourse(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-bold text-[#0d3349] mb-5">Edit Course</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#64748b] tracking-wider">Course Name</label>
                <input 
                  type="text" 
                  value={editingCourse.name} 
                  onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#64748b] tracking-wider">Status</label>
                <div className="flex bg-[#f8fafc] rounded-lg p-1 gap-1 border border-[#cbd5e1] w-full">
                  <button 
                    onClick={() => setEditingCourse({...editingCourse, status: 'Active'})} 
                    className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editingCourse.status === 'Active' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>
                    Active
                  </button>
                  <button 
                    onClick={() => setEditingCourse({...editingCourse, status: 'Inactive'})} 
                    className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editingCourse.status === 'Inactive' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setEditingCourse(null)}
                className="flex-1 py-2.5 rounded-sm text-[13.5px] font-bold text-[#6a5182] bg-[#f3eff7] hover:bg-[#6a5182] hover:text-white transition-all cursor-pointer border border-[#e2d9ed]">
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-[2] py-2.5 rounded-sm text-[13.5px] font-bold bg-[#6a5182] text-white hover:bg-[#5b4471] shadow-md transition-all active:scale-[0.98] cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {view === 'overview' ? renderOverview() : renderList()}

      {/* New Course Modal Overlay */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsNewCourseModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">Initialize Course</h3>
              <button onClick={() => setIsNewCourseModalOpen(false)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
                <input type="text" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</label>
                  <input type="text" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Faculty Lead</label>
                  <input type="text" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Primary Schedule</label>
                <div className="flex flex-wrap gap-2 w-full mt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button 
                      key={day}
                      type="button" 
                      onClick={() => toggleDay(day)} 
                      className={`flex-1 min-w-[40px] rounded-sm py-1.5 text-[13px] transition-all duration-200 cursor-pointer border ${selectedDays.includes(day) ? 'bg-[#6a5182] font-semibold text-white border-[#6a5182] shadow-sm' : 'bg-[#f3eff7] font-medium text-[#6a5182] border-[#e2d9ed] hover:border-[#6a5182] hover:text-white hover:bg-[#6a5182]'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Description</label>
                <textarea rows={4} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b] resize-none"></textarea>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsNewCourseModalOpen(false)} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] w-full cursor-pointer">
                  Cancel
                </button>
                <button type="button" className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] w-full cursor-pointer">
                  Create and Activate Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
