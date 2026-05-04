import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppModal from '../components/shared/AppModal';
import StatCard from '../components/dashboard/StatCard';
import { useBatches } from '../context/BatchContext';
import { useCourses } from '../context/CourseContext';
import type { Course } from '../types/course';

function buildBatchCode(batchesCount: number) {
  const year = new Date().getFullYear();
  return `BATCH-${year}-${String(batchesCount + 1).padStart(2, '0')}`;
}

function courseNames(courses: Course[], courseIds: string[]) {
  const names = courseIds
    .map((courseId) => courses.find((course) => course.id === courseId)?.name)
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(', ') : 'No courses assigned';
}

export default function BatchesPage() {
  const navigate = useNavigate();
  const { batches, loading, error, addBatch } = useBatches();
  const { courses } = useCourses();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const activeBatches = useMemo(
    () => batches.filter((batch) => batch.status === 'Active'),
    [batches],
  );
  const archivedBatches = useMemo(
    () => batches.filter((batch) => batch.status === 'Archived'),
    [batches],
  );
  const generatedCode = buildBatchCode(batches.length);

  const resetForm = () => {
    setBatchName('');
    setBatchDescription('');
    setSelectedCourseIds([]);
    setFormError('');
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleCreateBatch = async () => {
    if (!batchName.trim()) {
      setFormError('Enter a batch name before creating it.');
      return;
    }

    if (selectedCourseIds.length === 0) {
      setFormError('Assign at least one course to this batch.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const newBatch = await addBatch({
        name: batchName.trim(),
        code: generatedCode,
        description: batchDescription.trim(),
        status: 'Active',
        courseIds: selectedCourseIds,
        studentIds: [],
      });

      resetForm();
      setIsCreateOpen(false);
      navigate(`/batches/${newBatch.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create batch.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading batches...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Batches</h1>
            <p className="text-[14px] text-[#64748b] mt-1">Group student intakes and attach them to one or more courses.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Batch
          </button>
        </div>

        {error && (
          <div className="rounded-sm border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-[13px] font-semibold text-[#c2410c]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5" /><path d="M4 5h16l-2 5 2 5H4" /></svg>}
            label="Total Batches"
            value={String(batches.length)}
            compact
            showProgress={false}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>}
            label="Active"
            value={String(activeBatches.length)}
            compact
            showProgress={false}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18" /><path d="M5 7v12h14V7" /><path d="M9 11h6" /></svg>}
            label="Archived"
            value={String(archivedBatches.length)}
            compact
            showProgress={false}
          />
        </div>

        <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col animate-fade-up">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
            <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Batch Directory</h3>
            <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
              {batches.length} {batches.length === 1 ? 'batch' : 'batches'} shown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Courses</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Students</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <tr
                      key={batch.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/batches/${batch.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/batches/${batch.id}`);
                        }
                      }}
                      className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6a5182]/25 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <p className="text-[14px] font-bold text-[#1e293b] group-hover:text-[#6a5182] group-hover:underline underline-offset-4 transition-colors">{batch.name}</p>
                        <p className="text-[12px] text-[#64748b] mt-1">{batch.code}</p>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#64748b] max-w-[360px]">{courseNames(courses, batch.courseIds)}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-sm bg-[#f3eff7] px-2.5 py-1 text-[12px] font-bold text-[#6a5182]">
                          {batch.studentIds.length}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${batch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#64748b]">{new Date(batch.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[13px] text-[#64748b]">No batches created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <AppModal onClose={() => { setIsCreateOpen(false); resetForm(); }} widthClass="max-w-[720px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Create Batch</h3>
                <p className="text-[13px] text-[#64748b] mt-1">Create an intake group and assign the courses it belongs to.</p>
              </div>
              <button
                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Code</label>
                  <input
                    type="text"
                    value={generatedCode}
                    readOnly
                    className="bg-[#eef2f7] border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none font-sans text-[#1e293b] cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Name</label>
                  <input
                    value={batchName}
                    onChange={(event) => setBatchName(event.target.value)}
                    placeholder="e.g. Autumn 2026 Intake"
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Description</label>
                  <textarea
                    value={batchDescription}
                    onChange={(event) => setBatchDescription(event.target.value)}
                    rows={5}
                    placeholder="Optional intake notes"
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col min-h-0 rounded-sm border border-[#e2e8f0] overflow-hidden">
                <div className="p-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                  <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Assigned Courses</p>
                  <p className="text-[12px] text-[#64748b] mt-1">{selectedCourseIds.length} selected</p>
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y divide-[#edf2f7]">
                  {courses.length > 0 ? (
                    courses.map((course) => {
                      const isSelected = selectedCourseIds.includes(course.id);

                      return (
                        <label key={course.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCourse(course.id)}
                            className="mt-1 w-4 h-4 accent-[#6a5182]"
                          />
                          <span className="min-w-0">
                            <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{course.name}</span>
                            <span className="block text-[12px] text-[#64748b] mt-0.5">{course.courseCode} | {course.department}</span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-[13px] text-[#64748b] font-semibold">Create a course before adding batches.</div>
                  )}
                </div>
              </div>
            </div>

            {formError && (
              <div className="mx-6 mb-4 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                {formError}
              </div>
            )}

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                disabled={isSaving}
                className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBatch}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSaving ? 'Creating...' : 'Create Batch'}
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  );
}
