/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBatches } from '../context/BatchContext';
import { useCourses } from '../context/CourseContext';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';

type BatchClass = {
  id: string;
  batch_id?: string | null;
  course_id?: string | null;
  teacher_id?: string | null;
  teacher_ids?: string[] | null;
  name?: string | null;
  student_ids?: string[] | null;
};

type TeacherOption = {
  id: string;
  name: string;
  email: string;
};

function teacherIdsForClass(classRow: BatchClass) {
  if (classRow.teacher_ids?.length) return classRow.teacher_ids;
  return classRow.teacher_id ? [classRow.teacher_id] : [];
}

export default function ClassFormPage() {
  const { batchId, classId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(classId);
  const { getBatchById, loading: batchesLoading } = useBatches();
  const { courses } = useCourses();
  const { students } = useStudents();

  const batch = batchId ? getBatchById(batchId) : undefined;
  const [className, setClassName] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const batchStudents = useMemo(
    () => (batch ? students.filter((student) => batch.studentIds.includes(student.id)) : []),
    [batch, students],
  );

  const batchCourses = useMemo(
    () => (batch ? courses.filter((course) => batch.courseIds.includes(course.id)) : []),
    [batch, courses],
  );

  const selectedStudents = useMemo(
    () => batchStudents.filter((student) => selectedStudentIds.includes(student.id)),
    [batchStudents, selectedStudentIds],
  );

  const availableStudents = useMemo(() => {
    const search = studentSearch.trim().toLowerCase();

    return batchStudents.filter((student) => {
      if (selectedStudentIds.includes(student.id)) return false;
      if (!search) return true;

      const name = `${student.firstName} ${student.lastName}`.trim().toLowerCase();
      return name.includes(search) || student.email.toLowerCase().includes(search);
    });
  }, [batchStudents, selectedStudentIds, studentSearch]);

  const loadFormData = useCallback(async () => {
    if (!batchId) return;

    setIsLoadingForm(true);
    setError('');

    const { data: teacherRows, error: teacherError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'teacher')
      .order('name', { ascending: true });

    if (teacherError) {
      setError(teacherError.message);
      setTeacherOptions([]);
    } else {
      const nextTeachers = ((teacherRows as Array<{ id: string; name: string | null; email: string | null }> | null) ?? [])
        .map((teacher) => ({
          id: teacher.id,
          name: teacher.name?.trim() || 'Unnamed Teacher',
          email: teacher.email?.trim() || 'No email',
        }));

      setTeacherOptions(nextTeachers);
    }

    if (classId) {
      const { data: classRow, error: classError } = await supabase
        .from('classes')
        .select('id, batch_id, course_id, teacher_id, teacher_ids, name, student_ids')
        .eq('id', classId)
        .eq('batch_id', batchId)
        .single();

      if (classError) {
        setError(classError.message);
      } else {
        const selectedClass = classRow as BatchClass;
        setClassName(selectedClass.name || '');
        setSelectedTeacherIds(teacherIdsForClass(selectedClass));
        setSelectedStudentIds(selectedClass.student_ids ?? []);
      }

      setIsLoadingForm(false);
      return;
    }

    const { data: existingClasses } = await supabase
      .from('classes')
      .select('id')
      .eq('batch_id', batchId);

    const nextNumber = ((existingClasses as Array<{ id: string }> | null) ?? []).length + 1;
    setClassName(`Class ${String(nextNumber).padStart(2, '0')}`);
    setSelectedTeacherIds([]);
    setSelectedStudentIds([]);
    setIsLoadingForm(false);
  }, [batchId, classId]);

  useEffect(() => {
    void loadFormData();
  }, [loadFormData]);

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId],
    );
  };

  const addStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => (prev.includes(studentId) ? prev : [...prev, studentId]));
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  const selectAllAvailableStudents = () => {
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...availableStudents.map((student) => student.id)])));
  };

  const clearSelectedStudents = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!batchId || !batch) return;
    if (!className.trim()) {
      setError('Enter a class name.');
      return;
    }

    setIsSaving(true);
    setError('');

    const payload = {
      batch_id: batchId,
      course_id: batch.courseIds[0] ?? null,
      name: className.trim(),
      teacher_id: selectedTeacherIds[0] ?? null,
      teacher_ids: selectedTeacherIds,
      student_ids: selectedStudentIds,
    };

    const { error: saveError } = classId
      ? await supabase.from('classes').update(payload).eq('id', classId).eq('batch_id', batchId)
      : await supabase.from('classes').insert([payload]);

    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    navigate(`/classes/${batchId}`);
  };

  if (batchesLoading || isLoadingForm) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading class form...</p>
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <button type="button" onClick={() => navigate(`/classes/${batch.id}`)} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to {batch.name}
          </button>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{isEditing ? 'Edit Class' : 'Create Class'}</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Assign teachers and choose students from this batch roster.</p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(`/classes/${batch.id}`)} className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : isEditing ? 'Save Class' : 'Create Class'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
            <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Class Details</h2>
          </div>

          <div className="p-5 space-y-6">
            <div>
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Class Name</label>
              <input
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className="mt-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
              />
            </div>

            <div className="rounded-sm border border-[#e2e8f0] bg-[#f8fafc] p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Students</p>
                <p className="mt-1 text-[18px] font-extrabold text-[#1e293b]">{batchStudents.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Courses</p>
                <p className="mt-1 text-[18px] font-extrabold text-[#1e293b]">{batchCourses.length}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assigned Teachers</h3>
                <span className="text-[12px] font-bold text-[#64748b]">{selectedTeacherIds.length} selected</span>
              </div>
              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden max-h-[380px] overflow-y-auto">
                {teacherOptions.length > 0 ? (
                  teacherOptions.map((teacher) => (
                    <label key={teacher.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#edf2f7] last:border-0 hover:bg-[#f8fafc] cursor-pointer">
                      <input type="checkbox" checked={selectedTeacherIds.includes(teacher.id)} onChange={() => toggleTeacher(teacher.id)} className="w-4 h-4 accent-[#6a5182]" />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{teacher.name}</span>
                        <span className="block text-[12px] text-[#64748b] truncate">{teacher.email}</span>
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="p-4 text-[13px] font-semibold text-[#94a3b8]">No teachers found.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3">
              <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Selected Students</h2>
              <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-1.5 text-[12px] font-bold text-[#64748b]">{selectedStudents.length}</span>
            </div>
            <div className="max-h-[560px] overflow-y-auto divide-y divide-[#edf2f7]">
              {selectedStudents.length > 0 ? (
                selectedStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-[#1e293b] truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-[12px] text-[#64748b] truncate">{student.email}</p>
                    </div>
                    <button type="button" onClick={() => removeStudent(student.id)} className="text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer">
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="p-5 text-[13px] font-semibold text-[#94a3b8]">No students selected.</p>
              )}
            </div>
            {selectedStudents.length > 0 && (
              <div className="px-5 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe]">
                <button type="button" onClick={clearSelectedStudents} className="text-[13px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer">
                  Clear selected
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Batch Students</h2>
                <p className="text-[12.5px] text-[#64748b] mt-1">{availableStudents.length} available to add</p>
              </div>
              <button type="button" onClick={selectAllAvailableStudents} disabled={availableStudents.length === 0} className="text-[13px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Select All
              </button>
            </div>

            <div className="p-5 border-b border-[#e2e8f0]">
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Search batch students"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-[#edf2f7]">
              {availableStudents.length > 0 ? (
                availableStudents.map((student) => (
                  <button key={student.id} type="button" onClick={() => addStudent(student.id)} className="w-full flex items-center justify-between gap-4 px-5 py-3 hover:bg-[#f8fafc] text-left cursor-pointer">
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{student.firstName} {student.lastName}</span>
                      <span className="block text-[12px] text-[#64748b] truncate">{student.email}</span>
                    </span>
                    <span className="shrink-0 text-[12px] font-bold text-[#6a5182]">Add</span>
                  </button>
                ))
              ) : (
                <p className="p-5 text-[13px] font-semibold text-[#94a3b8]">No available students match this list.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
