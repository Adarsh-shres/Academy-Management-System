import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatches } from '../context/BatchContext';
import { useCourses } from '../context/CourseContext';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';

type ClassRow = {
  id: string;
  batch_id?: string | null;
};

export default function ClassesPage() {
  const navigate = useNavigate();
  const { batches, loading, error } = useBatches();
  const { courses } = useCourses();
  const { students } = useStudents();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classesError, setClassesError] = useState('');

  useEffect(() => {
    async function loadClasses() {
      const { data, error: loadError } = await supabase
        .from('classes')
        .select('id, batch_id');

      if (loadError) {
        setClassesError(loadError.message);
        return;
      }

      setClasses((data as ClassRow[] | null) ?? []);
      setClassesError('');
    }

    void loadClasses();
  }, []);

  const classCountByBatch = useMemo(() => {
    const counts = new Map<string, number>();
    classes.forEach((classRow) => {
      if (!classRow.batch_id) return;
      counts.set(classRow.batch_id, (counts.get(classRow.batch_id) ?? 0) + 1);
    });
    return counts;
  }, [classes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading class batches...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Classes</h1>
            <p className="text-[14px] text-[#64748b] mt-1">Create and manage classes from batches, not from the course list.</p>
          </div>
          <button
            onClick={() => navigate('/classes/new')}
            className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Create Class
          </button>
        </div>

        {(error || classesError) && (
          <div className="rounded-sm border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-[13px] font-semibold text-[#c2410c]">
            {classesError || error}
          </div>
        )}

        <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden animate-fade-up">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
            <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Batch Class Directory</h3>
            <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
              {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Courses</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Students</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Classes</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.length > 0 ? (
                  batches.map((batch) => {
                    const batchCourses = courses.filter((course) => batch.courseIds.includes(course.id));
                    const batchStudents = students.filter((student) => batch.studentIds.includes(student.id));

                    return (
                      <tr
                        key={batch.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/classes/${batch.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/classes/${batch.id}`);
                          }
                        }}
                        className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6a5182]/25 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <p className="text-[14px] font-bold text-[#1e293b] group-hover:text-[#6a5182] group-hover:underline underline-offset-4">{batch.name}</p>
                          <p className="text-[12px] text-[#64748b] mt-1">{batch.code}</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{batchCourses.length}</td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{batchStudents.length}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex rounded-sm bg-[#f3eff7] px-2.5 py-1 text-[12px] font-bold text-[#6a5182]">
                            {classCountByBatch.get(batch.id) ?? 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${batch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {batch.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[13px] text-[#64748b]">Create a batch before creating classes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
