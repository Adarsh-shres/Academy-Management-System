/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBatches } from '../context/BatchContext';
import { useCourses } from '../context/CourseContext';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';

type BatchClass = {
  id: string;
  batch_id?: string | null;
  teacher_id?: string | null;
  teacher_ids?: string[] | null;
  name?: string | null;
  student_ids?: string[] | null;
};

function teacherIdsForClass(classRow: BatchClass) {
  if (classRow.teacher_ids?.length) return classRow.teacher_ids;
  return classRow.teacher_id ? [classRow.teacher_id] : [];
}

export default function BatchClassesPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getBatchById, loading } = useBatches();
  const { courses } = useCourses();
  const { students } = useStudents();

  const batch = batchId ? getBatchById(batchId) : undefined;
  const [classes, setClasses] = useState<BatchClass[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [error, setError] = useState('');

  const batchStudents = useMemo(
    () => (batch ? students.filter((student) => batch.studentIds.includes(student.id)) : []),
    [batch, students],
  );

  const batchCourses = useMemo(
    () => (batch ? courses.filter((course) => batch.courseIds.includes(course.id)) : []),
    [batch, courses],
  );

  const loadBatchClasses = useCallback(async () => {
    if (!batchId) return;

    setIsLoadingClasses(true);
    const { data, error: loadError } = await supabase
      .from('classes')
      .select('id, batch_id, teacher_id, teacher_ids, name, student_ids')
      .eq('batch_id', batchId)
      .order('name', { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setClasses([]);
      setIsLoadingClasses(false);
      return;
    }

    const nextClasses = (data as BatchClass[] | null) ?? [];
    const teacherIds = Array.from(new Set(nextClasses.flatMap(teacherIdsForClass)));
    const nextTeacherNames: Record<string, string> = {};

    if (teacherIds.length > 0) {
      const { data: userRows } = await supabase
        .from('users')
        .select('id, name, role')
        .in('id', teacherIds);

      ((userRows as Array<{ id: string; name: string | null; role: string | null }> | null) ?? []).forEach((user) => {
        if (user.role === 'teacher') {
          nextTeacherNames[user.id] = user.name?.trim() || 'Unnamed Teacher';
        }
      });
    }

    setTeacherNames(nextTeacherNames);
    setClasses(nextClasses);
    setError('');
    setIsLoadingClasses(false);
  }, [batchId]);

  useEffect(() => {
    void loadBatchClasses();
  }, [loadBatchClasses]);

  const handleDeleteClass = async (classRow: BatchClass) => {
    if (!window.confirm(`Delete ${classRow.name || 'this class'}?`)) return;

    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classRow.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadBatchClasses();
  };

  if (loading || isLoadingClasses) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading batch classes...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[14px] text-[#ef4444] font-semibold">Batch not found</p>
        <button onClick={() => navigate('/classes')} className="mt-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer">
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/classes')} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to Classes
          </button>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{batch.name}</h1>
          <p className="text-[14px] text-[#64748b] mt-1">{batch.code} | {batchStudents.length} students in this batch roster</p>
        </div>
        <button onClick={() => navigate(`/classes/${batch.id}/new`)} className="inline-flex items-center justify-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-bold px-5 py-2.5 rounded-sm transition-all cursor-pointer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          Create Class
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
            <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Students In Batch</h2>
          </div>
          <div className="max-h-[560px] overflow-y-auto divide-y divide-[#edf2f7]">
            {batchStudents.length > 0 ? (
              batchStudents.map((student, index) => (
                <button key={student.id} type="button" onClick={() => navigate(`/students/${student.id}`)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#f8fafc] text-left cursor-pointer">
                  <span className="w-8 text-[12px] font-bold text-[#94a3b8]">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{student.firstName} {student.lastName}</span>
                    <span className="block text-[12px] text-[#64748b] truncate">{student.email}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="p-5 text-[13px] font-semibold text-[#94a3b8]">No students assigned to this batch yet.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Classes For This Batch</h2>
              <p className="text-[12.5px] text-[#64748b] mt-1">Class rosters are selected from this batch.</p>
            </div>
            <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold text-[#64748b]">
              {classes.length} classes
            </span>
          </div>

          {classes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Class</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Courses</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Teachers</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Students</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classRow) => {
                    const assignedTeacherNames = teacherIdsForClass(classRow)
                      .map((teacherId) => teacherNames[teacherId])
                      .filter(Boolean);

                    return (
                      <tr key={classRow.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc]">
                        <td className="py-4 px-6 text-[14px] font-bold text-[#1e293b]">{classRow.name || 'Class'}</td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{batchCourses.length} inherited</td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{assignedTeacherNames.length > 0 ? assignedTeacherNames.join(', ') : 'Unassigned'}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex rounded-sm bg-[#f3eff7] px-2.5 py-1 text-[12px] font-bold text-[#6a5182]">{classRow.student_ids?.length ?? 0}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button type="button" onClick={() => navigate(`/classes/${batch.id}/${classRow.id}/edit`)} className="text-[13px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer">
                              Edit
                            </button>
                            <button type="button" onClick={() => void handleDeleteClass(classRow)} className="text-[13px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <h3 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Classes Created</h3>
              <p className="text-[14px] text-[#64748b] max-w-md mb-4">Create the first class for this batch using selected students from its roster.</p>
              <button onClick={() => navigate(`/classes/${batch.id}/new`)} className="bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer">
                Create First Class
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
