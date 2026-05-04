import { useEffect, useMemo, useState } from 'react';
import AppModal from '../components/shared/AppModal';
import StatCard from '../components/dashboard/StatCard';
import { useCourses } from '../context/CourseContext';
import type { Course } from '../types/course';

const DEPARTMENT_OPTIONS = ['Computer Science', 'Cyber Security', 'CSE', 'IT', 'ECE', 'Civil', 'Mech'] as const;

function buildCourseSerial(courses: Course[]) {
  let nextSequence = 1;

  courses.forEach((course) => {
    const match = course.courseCode.match(/^CRS-(\d+)$/i);
    if (!match) return;

    const existingSequence = Number(match[1]);
    if (existingSequence >= nextSequence) {
      nextSequence = existingSequence + 1;
    }
  });

  return `CRS-${String(nextSequence).padStart(3, '0')}`;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-[13.5px] font-semibold backdrop-blur-md animate-[slideUp_0.35s_ease-out] ${
        type === 'success'
          ? 'bg-gradient-to-r from-[#10b981]/90 to-[#059669]/90 text-white'
          : 'bg-gradient-to-r from-[#ef4444]/90 to-[#dc2626]/90 text-white'
      }`}
    >
      {type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
      )}
      {message}
    </div>
  );
}

export default function CoursesPage() {
  const { courses, loading, error: contextError, addCourse, updateCourse, deleteCourse } = useCourses();
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newFaculty, setNewFaculty] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const generatedCourseCode = useMemo(() => buildCourseSerial(courses), [courses]);
  const activeCourses = courses.filter((course) => course.status === 'Active');
  const inactiveCourses = courses.filter((course) => course.status === 'Inactive');
  const filteredCourses = courses.filter((course) => filterStatus === 'All' || course.status === filterStatus);

  const resetNewCourseForm = () => {
    setNewName('');
    setNewDepartment('');
    setNewFaculty('');
    setNewDescription('');
  };

  const handleCreateCourse = async () => {
    if (!newName.trim()) {
      setToast({ message: 'Enter a course name before creating it.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await addCourse({
        courseCode: generatedCourseCode,
        name: newName.trim(),
        status: 'Active',
        department: newDepartment || 'Unassigned',
        facultyLead: newFaculty || 'Unassigned',
        description: newDescription || 'No description provided.',
      });
      resetNewCourseForm();
      setIsNewCourseModalOpen(false);
      setToast({ message: 'Course created successfully.', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create course';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;

    setSaving(true);
    try {
      await updateCourse(editingCourse.id, editingCourse);
      setEditingCourse(null);
      setToast({ message: 'Course updated successfully.', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update course';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteCourse(id);
      setToast({ message: 'Course deleted successfully.', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete course';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Serial', 'Course Name', 'Department', 'Faculty Lead', 'Status', 'Description'];
    const escapeCSV = (val: string) => (/[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val);
    const rows = filteredCourses.map((course) => [
      escapeCSV(course.courseCode),
      escapeCSV(course.name),
      escapeCSV(course.department),
      escapeCSV(course.facultyLead),
      course.status,
      escapeCSV(course.description || ''),
    ].join(','));

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: `Exported ${filteredCourses.length} courses to CSV.`, type: 'success' });
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
            <p className="text-[14px] text-[#64748b] mt-1">Manage course records. Classes are handled separately from batches.</p>
          </div>
          <button
            onClick={() => setIsNewCourseModalOpen(true)}
            className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
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
            <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Course Directory</h3>
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <button
                onClick={() => setFilterStatus(filterStatus === 'All' ? 'Active' : 'All')}
                className="bg-[#f3eff7] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]"
              >
                {filterStatus === 'All' ? 'Show Active' : 'Show All'}
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-[#f3eff7] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]"
              >
                Export CSV
              </button>
              <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} shown
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Serial</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3 px-6 text-[13px] font-semibold text-[#475569]">{course.courseCode}</td>
                      <td className="py-3 px-6 text-[13px] font-bold text-[#1e293b]">{course.name}</td>
                      <td className="py-3 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dbeafe] text-[#1d4ed8]">{course.department}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${course.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 text-[#94a3b8]">
                          <button onClick={() => setEditingCourse({ ...course })} className="hover:text-[#6a5182] transition-colors cursor-pointer" title="Edit">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(course.id)} className="hover:text-[#ef4444] transition-colors cursor-pointer" title="Delete">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[13px] text-[#64748b]">No courses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingCourse && (
        <AppModal onClose={() => setEditingCourse(null)} widthClass="max-w-[500px]">
          <div className="bg-white rounded-2xl w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">Edit Course</h3>
              <button onClick={() => setEditingCourse(null)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">x</button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); handleSaveEdit(); }}>
              <CourseFields course={editingCourse} onChange={setEditingCourse} readOnlyCode />
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingCourse(null)} className="flex-1 py-2.5 rounded-sm text-[13.5px] font-bold text-[#6a5182] bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] py-2.5 rounded-sm text-[13.5px] font-bold bg-[#6a5182] text-white hover:bg-[#5b4471] shadow-md transition-all cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </AppModal>
      )}

      {isNewCourseModalOpen && (
        <AppModal onClose={() => { setIsNewCourseModalOpen(false); resetNewCourseForm(); }} widthClass="max-w-[500px]">
          <div className="bg-white rounded-2xl w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">Create Course</h3>
              <button onClick={() => { setIsNewCourseModalOpen(false); resetNewCourseForm(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">x</button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); handleCreateCourse(); }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Serial</label>
                <input value={generatedCourseCode} readOnly className="bg-[#eef2f7] border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none font-sans text-[#1e293b] cursor-not-allowed" />
                <p className="text-[12px] text-[#64748b]">Generated automatically as the next course serial.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
                <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Advanced Machine Learning" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 text-[#1e293b]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</label>
                <select value={newDepartment} onChange={(event) => setNewDepartment(event.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 text-[#1e293b]">
                  <option value="">Select department</option>
                  {DEPARTMENT_OPTIONS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Faculty Lead</label>
                <input value={newFaculty} onChange={(event) => setNewFaculty(event.target.value)} placeholder="e.g. Dr. John Doe" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 text-[#1e293b]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Description</label>
                <textarea rows={4} value={newDescription} onChange={(event) => setNewDescription(event.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 text-[#1e293b] resize-none" />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setIsNewCourseModalOpen(false); resetNewCourseForm(); }} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all w-full cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm w-full cursor-pointer disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Course'}
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

function CourseFields({
  course,
  onChange,
  readOnlyCode = false,
}: {
  course: Course;
  onChange: (course: Course) => void;
  readOnlyCode?: boolean;
}) {
  const inputClass = 'bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]';

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Serial</label>
        <input value={course.courseCode} readOnly={readOnlyCode} onChange={(event) => onChange({ ...course, courseCode: event.target.value })} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course Name</label>
        <input value={course.name} onChange={(event) => onChange({ ...course, name: event.target.value })} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</label>
        <div className="flex bg-[#f8fafc] rounded-lg p-1 gap-1 border border-[#cbd5e1] w-full">
          <button type="button" onClick={() => onChange({ ...course, status: 'Active' })} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${course.status === 'Active' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68]'}`}>
            Active
          </button>
          <button type="button" onClick={() => onChange({ ...course, status: 'Inactive' })} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${course.status === 'Inactive' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68]'}`}>
            Inactive
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</label>
          <input value={course.department || ''} onChange={(event) => onChange({ ...course, department: event.target.value })} className={inputClass} />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Faculty Lead</label>
          <input value={course.facultyLead || ''} onChange={(event) => onChange({ ...course, facultyLead: event.target.value })} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Description</label>
        <textarea rows={3} value={course.description || ''} onChange={(event) => onChange({ ...course, description: event.target.value })} className={`${inputClass} resize-none`} />
      </div>
    </>
  );
}
