import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatches } from '../context/BatchContext';
import { useCourses } from '../context/CourseContext';
import { useStudents } from '../context/StudentContext';

export default function ClassBatchSelectPage() {
  const navigate = useNavigate();
  const { batches, loading, error } = useBatches();
  const { courses } = useCourses();
  const { students } = useStudents();
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === selectedBatchId),
    [batches, selectedBatchId],
  );

  const selectedBatchCourses = useMemo(
    () => (selectedBatch ? courses.filter((course) => selectedBatch.courseIds.includes(course.id)) : []),
    [courses, selectedBatch],
  );

  const selectedBatchStudents = useMemo(
    () => (selectedBatch ? students.filter((student) => selectedBatch.studentIds.includes(student.id)) : []),
    [selectedBatch, students],
  );

  const continueToClassForm = () => {
    if (!selectedBatchId) return;
    navigate(`/classes/${selectedBatchId}/new`);
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
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div>
        <button onClick={() => navigate('/classes')} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Classes
        </button>
        <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Create Class</h1>
        <p className="text-[14px] text-[#64748b] mt-1">Choose the batch first. The class will inherit that batch's courses and student roster.</p>
      </div>

      {error && (
        <div className="rounded-sm border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-[13px] font-semibold text-[#c2410c]">
          {error}
        </div>
      )}

      <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden max-w-4xl">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
          <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Batch</h2>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div>
            <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(event) => setSelectedBatchId(event.target.value)}
              className="mt-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
            >
              <option value="">Select a batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>{batch.name} ({batch.code})</option>
              ))}
            </select>

            {batches.length === 0 && (
              <p className="mt-3 text-[13px] font-semibold text-[#dc2626]">Create a batch before creating classes.</p>
            )}
          </div>

          <div className="rounded-sm border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <h3 className="text-[12px] font-bold text-[#4b3f68] uppercase tracking-wide">Selected Batch</h3>
            {selectedBatch ? (
              <div className="mt-3 space-y-2 text-[13px] text-[#64748b]">
                <p className="font-bold text-[#1e293b]">{selectedBatch.name}</p>
                <p>{selectedBatch.code}</p>
                <p>{selectedBatchStudents.length} students</p>
                <p>{selectedBatchCourses.length} courses</p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] font-semibold text-[#94a3b8]">No batch selected.</p>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/classes')} className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={continueToClassForm} disabled={!selectedBatchId} className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            Continue
          </button>
        </div>
      </section>
    </div>
  );
}
