import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppModal from '../components/shared/AppModal';
import StatCard from '../components/dashboard/StatCard';
import { useCourses } from '../context/CourseContext';
import type { Course } from '../types/course';

const LEVEL_OPTIONS = ['4', '5', '6'] as const;
const DEPARTMENT_OPTIONS = [
  { label: 'Computer Science', code: 'CS' },
  { label: 'Cyber Security', code: 'CY' },
] as const;

type CourseLevel = (typeof LEVEL_OPTIONS)[number];
type LevelFilter = 'All' | CourseLevel;

function buildCourseCode(level: string, departments: string[], courses: Course[]) {
  if (!level || departments.length === 0) return '';

  const selectedOptions = DEPARTMENT_OPTIONS.filter((option) => departments.includes(option.label));
  const prefix = `${level}-${selectedOptions.map((option) => option.code).join('-')}`;

  let nextSequence = 1;
  courses.forEach((course) => {
    const match = course.courseCode.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (!match) return;

    const existingSequence = Number(match[1]);
    if (existingSequence >= nextSequence) {
      nextSequence = existingSequence + 1;
    }
  });

  return `${prefix}-${String(nextSequence).padStart(2, '0')}`;
}

function getCourseLevel(course: Course): CourseLevel | null {
  const levelMatch = course.courseCode.match(/^[456]/);
  return levelMatch ? (levelMatch[0] as CourseLevel) : null;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-[13.5px] font-semibold backdrop-blur-md transition-all animate-[slideUp_0.35s_ease-out]
        ${type === 'success'
          ? 'bg-gradient-to-r from-[#10b981]/90 to-[#059669]/90 text-white'
          : 'bg-gradient-to-r from-[#ef4444]/90 to-[#dc2626]/90 text-white'
        }`}
    >
      {type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      )}
      {message}
    </div>
  );
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const { courses, loading, error: contextError, addCourse, updateCourse, deleteCourse } = useCourses();

  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterLevel, setFilterLevel] = useState<LevelFilter>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<CourseLevel | ''>('');
  const [newDepartments, setNewDepartments] = useState<string[]>([]);
  const [newFaculty, setNewFaculty] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const filterRef = useRef<HTMLDivElement>(null);
  const departmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (departmentMenuRef.current && !departmentMenuRef.current.contains(event.target as Node)) {
        setIsDepartmentMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const generatedCourseCode = buildCourseCode(newLevel, newDepartments, courses);

  const resetNewCourseForm = () => {
    setNewName('');
    setNewLevel('');
    setNewDepartments([]);
    setNewFaculty('');
    setNewDescription('');
    setIsDepartmentMenuOpen(false);
  };

  const toggleDepartmentSelection = (departmentLabel: string) => {
    setNewDepartments((prev) =>
      prev.includes(departmentLabel)
        ? prev.filter((item) => item !== departmentLabel)
        : [...prev, departmentLabel],
    );
  };

  const handleCreateCourse = async () => {
    if (!newLevel) {
      setToast({ message: 'Select a level before creating the course.', type: 'error' });
      return;
    }

    if (newDepartments.length === 0) {
      setToast({ message: 'Select at least one department for the course.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await addCourse({
        courseCode: generatedCourseCode,
        name: newName || 'Untitled Course',
        status: 'Active',
        department: newDepartments.join(', '),
        facultyLead: newFaculty || 'Unassigned',
        description: newDescription || 'No description provided.',
      });
      resetNewCourseForm();
      setIsNewCourseModalOpen(false);
      setToast({ message: 'Course created successfully!', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create course';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        setToast({ message: 'Course deleted successfully', type: 'success' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete course';
        setToast({ message: msg, type: 'error' });
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingCourse) {
      setSaving(true);
      try {
        await updateCourse(editingCourse.id, editingCourse);
        setEditingCourse(null);
        setToast({ message: 'Course updated successfully!', type: 'success' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update course';
        setToast({ message: msg, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesStatus = filterStatus === 'All' || course.status === filterStatus;
    const matchesLevel = filterLevel === 'All' || getCourseLevel(course) === filterLevel;

    return matchesStatus && matchesLevel;
  });
  const activeCourses = courses.filter((course) => course.status === 'Active');
  const inactiveCourses = courses.filter((course) => course.status === 'Inactive');

  const openCourseClasses = (courseId: string) => {
    navigate(`/courses/${courseId}/classes`);
  };

  const handleExportCSV = () => {
    if (!window.confirm('Download courses data as a CSV file?')) return;

    const headers = ['Course Code', 'Course Name', 'Department', 'Faculty Lead', 'Status', 'Description'];

    const escapeCSV = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = filteredCourses.map((course) => [
      escapeCSV(course.courseCode),
      escapeCSV(course.name),
      escapeCSV(course.department),
      escapeCSV(course.facultyLead),
      course.status,
      escapeCSV(course.description || ''),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `courses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({ message: `Exported ${filteredCourses.length} courses to CSV`, type: 'success' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading courses...</p>
      </div>
    );
  }

  if (contextError && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#fef2f2] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <p className="text-[14px] text-[#ef4444] font-semibold">Failed to load courses</p>
        <p className="text-[13px] text-[#64748b] max-w-md text-center">{contextError}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Courses</h1>
            <p className="text-[14px] text-[#64748b] mt-1">View active and inactive courses from one place.</p>
          </div>
          <button
            onClick={() => setIsNewCourseModalOpen(true)}
            className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="m9 11 2 2 4-4" /></svg>}
            label="Active Courses"
            value={String(activeCourses.length)}
            compact
            showProgress={false}
            isAccent={filterStatus === 'Active'}
            onClick={() => setFilterStatus('Active')}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="m10 9 4 4" /><path d="m14 9-4 4" /></svg>}
            label="Inactive Courses"
            value={String(inactiveCourses.length)}
            compact
            showProgress={false}
            isAccent={filterStatus === 'Inactive'}
            onClick={() => setFilterStatus('Inactive')}
          />
        </div>

        <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col animate-fade-up">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
            <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">
              {filterLevel === 'All' ? 'All Course Levels' : `Level ${filterLevel} Courses`}
            </h3>

            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} shown
              </span>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter {filterLevel !== 'All' && `(Level ${filterLevel})`}
                </button>

                {isFilterOpen && (
                  <div className="absolute top-[110%] right-0 w-36 bg-white border border-[#e2e8f0] rounded-sm shadow-lg z-10 flex flex-col overflow-hidden py-1">
                    <button onClick={() => { setFilterLevel('All'); setIsFilterOpen(false); }} className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${filterLevel === 'All' ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}>All Levels</button>
                    {LEVEL_OPTIONS.map((level) => (
                      <button
                        key={level}
                        onClick={() => { setFilterLevel(level); setIsFilterOpen(false); }}
                        className={`px-4 py-2 text-left text-[13px] hover:bg-[#f3eff7] transition-colors ${filterLevel === level ? 'bg-[#f3eff7] font-bold text-[#6a5182]' : 'text-[#475569]'}`}
                      >
                        Level {level}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Code</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department(s)</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      role="link"
                      tabIndex={0}
                      title={`View classes for ${course.name}`}
                      onClick={() => openCourseClasses(course.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openCourseClasses(course.id);
                        }
                      }}
                      className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6a5182]/25 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-6 text-[13px] font-semibold text-[#475569]">{course.courseCode}</td>
                      <td className="py-3 px-6 text-[13px] font-medium text-[#1e293b]">
                        <span className="group-hover:text-[#6a5182] group-focus:text-[#6a5182] group-hover:underline underline-offset-4 transition-colors">
                          {course.name}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dbeafe] text-[#1d4ed8]">{course.department}</span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${course.status === 'Active' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></span>
                          <span className="text-[13px] font-bold text-[#475569]">{course.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 text-[#94a3b8]">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingCourse({ ...course });
                            }}
                            className="hover:text-[#6a5182] transition-colors cursor-pointer hover:scale-110 active:scale-95"
                            title="Edit"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(course.id);
                            }}
                            className="hover:text-[#ef4444] transition-colors cursor-pointer hover:scale-110 active:scale-95"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[13px] text-[#64748b]">No courses found matching this selection.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editingCourse && (
          <AppModal onClose={() => setEditingCourse(null)} widthClass="max-w-[500px]">
            <div className="bg-white rounded-2xl w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[18px] font-bold text-[#0d3349]">Edit Course</h3>
                <button onClick={() => setEditingCourse(null)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Code</label>
                  <input
                    type="text"
                    value={editingCourse.courseCode}
                    onChange={(e) => setEditingCourse({ ...editingCourse, courseCode: e.target.value })}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
                  <input
                    type="text"
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</label>
                  <div className="flex bg-[#f8fafc] rounded-lg p-1 gap-1 border border-[#cbd5e1] w-full">
                    <button type="button" onClick={() => setEditingCourse({ ...editingCourse, status: 'Active' })} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editingCourse.status === 'Active' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>
                      Active
                    </button>
                    <button type="button" onClick={() => setEditingCourse({ ...editingCourse, status: 'Inactive' })} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editingCourse.status === 'Inactive' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department(s)</label>
                    <input type="text" value={editingCourse.department || ''} onChange={e => setEditingCourse({ ...editingCourse, department: e.target.value })} placeholder="Computer Science, Cyber Security" className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Faculty Lead</label>
                    <input type="text" value={editingCourse.facultyLead || ''} onChange={e => setEditingCourse({ ...editingCourse, facultyLead: e.target.value })} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Description</label>
                  <textarea rows={3} value={editingCourse.description || ''} onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-3 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b] resize-none"></textarea>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setEditingCourse(null)} className="flex-1 py-2.5 rounded-sm text-[13.5px] font-bold text-[#6a5182] bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-[2] py-2.5 rounded-sm text-[13.5px] font-bold bg-[#6a5182] text-white hover:bg-[#5b4471] shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </AppModal>
        )}
      </div>

      {isNewCourseModalOpen && (
        <AppModal onClose={() => { setIsNewCourseModalOpen(false); resetNewCourseForm(); }} widthClass="max-w-[500px]">
          <div className="bg-white rounded-2xl w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">Initialize Course</h3>
              <button onClick={() => { setIsNewCourseModalOpen(false); resetNewCourseForm(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleCreateCourse(); }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Code</label>
                <input
                  type="text"
                  value={generatedCourseCode}
                  readOnly
                  placeholder="Select level and department(s)"
                  className="bg-[#eef2f7] border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none transition-all font-sans text-[#1e293b] cursor-not-allowed"
                />
                <p className="text-[12px] text-[#64748b]">Generated automatically from the selected level and department(s).</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Advanced Machine Learning" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Level</label>
                <select value={newLevel} onChange={e => setNewLevel(e.target.value as CourseLevel | '')} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]">
                  <option value="">Select a level</option>
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department(s)</label>
                  <div className="relative" ref={departmentMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsDepartmentMenuOpen((prev) => !prev)}
                      className="w-full bg-[#e2e8f0]/40 rounded-sm px-4 py-2.5 text-[14px] text-left font-sans text-[#1e293b] transition-all focus:ring-2 focus:ring-[#6a5182]/20 flex items-center justify-between"
                    >
                      <span className={newDepartments.length > 0 ? 'text-[#1e293b]' : 'text-[#64748b]'}>
                        {newDepartments.length > 0 ? newDepartments.join(', ') : 'Select department(s)'}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {isDepartmentMenuOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-sm border border-[#d8c8e9] bg-white shadow-lg p-2">
                        {DEPARTMENT_OPTIONS.map((department) => {
                          const isSelected = newDepartments.includes(department.label);
                          return (
                            <button
                              key={department.label}
                              type="button"
                              onClick={() => toggleDepartmentSelection(department.label)}
                              className={`w-full rounded-sm px-3 py-2 text-left text-[13px] transition-colors flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#f3eff7] text-[#6a5182] font-semibold'
                                  : 'text-[#475569] hover:bg-[#f8fafc]'
                              }`}
                            >
                              <span>{department.label}</span>
                              {isSelected ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-[#64748b]">You can select more than one department for overlapping courses.</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Faculty Lead</label>
                  <input type="text" value={newFaculty} onChange={e => setNewFaculty(e.target.value)} placeholder="e.g. Dr. John Doe" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Description</label>
                <textarea rows={4} value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Describe what this course covers..." className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b] resize-none"></textarea>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setIsNewCourseModalOpen(false); resetNewCourseForm(); }} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] w-full cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] w-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {saving ? 'Creating...' : 'Create and Activate Course'}
                </button>
              </div>
            </form>
          </div>
        </AppModal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
