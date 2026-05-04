import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppModal from '../components/shared/AppModal';
import { useBatches } from '../context/BatchContext';
import { useCourses } from '../context/CourseContext';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';
import type { BatchStatus } from '../types/batch';
import type { StudentRecord } from '../types/student';

type CsvImportResult = {
  matchedIds: string[];
  unmatchedRows: string[];
};

function initials(student: StudentRecord) {
  return `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase() || 'ST';
}

function fullName(student: StudentRecord) {
  return `${student.firstName} ${student.lastName}`.trim() || student.email;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(value.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function getCsvImportResult(csvText: string, students: StudentRecord[]): CsvImportResult {
  const rows = parseCsv(csvText);
  const studentsByEmail = new Map(students.map((student) => [student.email.toLowerCase(), student.id]));
  const studentsById = new Map(students.map((student) => [student.id.toLowerCase(), student.id]));
  const matchedIds = new Set<string>();
  const unmatchedRows: string[] = [];

  if (rows.length === 0) {
    return { matchedIds: [], unmatchedRows: [] };
  }

  const header = rows[0].map((cell) => cell.toLowerCase().replace(/\s+/g, '_'));
  const hasHeader = header.some((cell) => ['email', 'student_email', 'id', 'student_id'].includes(cell));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const emailIndex = hasHeader ? header.findIndex((cell) => cell === 'email' || cell === 'student_email') : 0;
  const idIndex = hasHeader ? header.findIndex((cell) => cell === 'id' || cell === 'student_id') : 0;

  dataRows.forEach((row, index) => {
    const emailValue = emailIndex >= 0 ? row[emailIndex]?.toLowerCase() : '';
    const idValue = idIndex >= 0 ? row[idIndex]?.toLowerCase() : '';
    const matchedId = (emailValue && studentsByEmail.get(emailValue)) || (idValue && studentsById.get(idValue));

    if (matchedId) {
      matchedIds.add(matchedId);
    } else {
      unmatchedRows.push(row.join(', ') || `Row ${index + 1}`);
    }
  });

  return { matchedIds: Array.from(matchedIds), unmatchedRows };
}

export default function BatchDetailsPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { batches, loading, getBatchById, assignStudentsToBatch, updateBatch, deleteBatch } = useBatches();
  const { courses } = useCourses();
  const { students } = useStudents();

  const batch = batchId ? getBatchById(batchId) : undefined;
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [csvResult, setCsvResult] = useState<CsvImportResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<BatchStatus>('Active');
  const [editCourseIds, setEditCourseIds] = useState<string[]>([]);

  const assignedCourses = useMemo(
    () => (batch ? courses.filter((course) => batch.courseIds.includes(course.id)) : []),
    [batch, courses],
  );

  const assignedStudents = useMemo(
    () => (batch ? students.filter((student) => batch.studentIds.includes(student.id)) : []),
    [batch, students],
  );

  const studentIdsInOtherBatches = useMemo(() => {
    if (!batch) return new Set<string>();

    return new Set(
      batches
        .filter((item) => item.id !== batch.id)
        .flatMap((item) => item.studentIds),
    );
  }, [batch, batches]);

  const availableStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          !selectedStudentIds.includes(student.id) &&
          !studentIdsInOtherBatches.has(student.id),
      ),
    [selectedStudentIds, studentIdsInOtherBatches, students],
  );

  const filteredAvailableStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return availableStudents;

    return availableStudents.filter((student) =>
      `${fullName(student)} ${student.email} ${student.department}`.toLowerCase().includes(query),
    );
  }, [availableStudents, studentSearch]);

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedStudentIds.includes(student.id)),
    [selectedStudentIds, students],
  );

  const openSelectStudents = () => {
    setSelectedStudentIds(batch?.studentIds ?? []);
    setStudentSearch('');
    setActionError('');
    setIsSelectOpen(true);
  };

  const openImportStudents = () => {
    setCsvResult(null);
    setActionError('');
    setIsImportOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditBatch = () => {
    if (!batch) return;

    setEditName(batch.name);
    setEditDescription(batch.description);
    setEditStatus(batch.status);
    setEditCourseIds(batch.courseIds);
    setActionError('');
    setIsEditOpen(true);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const selectAllAvailableStudents = () => {
    setSelectedStudentIds((prev) =>
      Array.from(new Set([...prev, ...filteredAvailableStudents.map((student) => student.id)])),
    );
  };

  const toggleEditCourse = (courseId: string) => {
    setEditCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleSaveSelectedStudents = async () => {
    if (!batch) return;

    setIsSaving(true);
    setActionError('');

    try {
      await assignStudentsToBatch(batch.id, selectedStudentIds);
      setIsSelectOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update batch students.';
      setActionError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCsvFile = async (file: File | undefined) => {
    if (!file) return;

    const text = await file.text();
    const importableStudents = students.filter(
      (student) =>
        !batch?.studentIds.includes(student.id) &&
        !studentIdsInOtherBatches.has(student.id),
    );

    setCsvResult(getCsvImportResult(text, importableStudents));
  };

  const handleAddImportedStudents = async () => {
    if (!batch || !csvResult) return;

    setIsSaving(true);
    setActionError('');

    try {
      await assignStudentsToBatch(batch.id, [...batch.studentIds, ...csvResult.matchedIds]);
      setIsImportOpen(false);
      setCsvResult(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import students.';
      setActionError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!batch) return;

    setIsSaving(true);
    setActionError('');

    try {
      await updateBatch(batch.id, { status: batch.status === 'Active' ? 'Archived' : 'Active' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update batch status.';
      setActionError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBatch = async () => {
    if (!batch) return;

    if (!editName.trim()) {
      setActionError('Enter a batch name before saving.');
      return;
    }

    if (editCourseIds.length === 0) {
      setActionError('Select at least one course for this batch.');
      return;
    }

    setIsSaving(true);
    setActionError('');

    try {
      await updateBatch(batch.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
        courseIds: editCourseIds,
      });
      setIsEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update batch.';
      setActionError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batch) return;
    if (!window.confirm(`Delete ${batch.name}? This does not delete student accounts.`)) return;

    setIsSaving(true);
    setActionError('');

    try {
      const { error: classDeleteError } = await supabase
        .from('classes')
        .delete()
        .eq('batch_id', batch.id);

      if (classDeleteError && classDeleteError.code !== '42703') {
        throw new Error(classDeleteError.message);
      }

      await deleteBatch(batch.id);
      navigate('/batches');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete batch.';
      setActionError(message);
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading batch...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#fef2f2] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        </div>
        <p className="text-[14px] text-[#ef4444] font-semibold">Batch not found</p>
        <button
          onClick={() => navigate('/batches')}
          className="mt-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer"
        >
          Back to Batches
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/batches')}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              Back to Batches
            </button>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{batch.name}</h1>
            <p className="text-[14px] text-[#64748b] mt-1">{batch.code} | {batch.description || 'No description added.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openEditBatch}
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-bold px-5 py-2.5 rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer"
            >
              Edit Batch
            </button>
            <button
              onClick={openImportStudents}
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-bold px-5 py-2.5 rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
              Import CSV
            </button>
            <button
              onClick={openSelectStudents}
              className="inline-flex items-center justify-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-bold px-5 py-2.5 rounded-sm transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              Select Students
            </button>
            <button
              onClick={handleToggleArchive}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[13.5px] font-bold px-5 py-2.5 rounded-sm hover:bg-white transition-all cursor-pointer disabled:opacity-60"
            >
              {batch.status === 'Active' ? 'Archive' : 'Activate'}
            </button>
            <button
              onClick={() => void handleDeleteBatch()}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[13.5px] font-bold px-5 py-2.5 rounded-sm hover:bg-[#fee2e2] transition-all cursor-pointer disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </div>

        {actionError && (
          <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Batch Summary</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Students</p>
                  <p className="text-[24px] font-extrabold text-[#6a5182] leading-none">{assignedStudents.length}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Courses</p>
                  <p className="text-[24px] font-extrabold text-[#6a5182] leading-none">{assignedCourses.length}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${batch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {batch.status}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Assigned Courses</h2>
              </div>
              <div className="divide-y divide-[#edf2f7]">
                {assignedCourses.length > 0 ? (
                  assignedCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => navigate(`/classes/${batch.id}`)}
                      className="w-full px-5 py-4 text-left hover:bg-[#f8fafc] transition-colors cursor-pointer"
                    >
                      <p className="text-[14px] font-bold text-[#1e293b]">{course.name}</p>
                      <p className="text-[12px] text-[#64748b] mt-1">{course.courseCode} | {course.department}</p>
                    </button>
                  ))
                ) : (
                  <p className="p-5 text-[13px] font-semibold text-[#94a3b8]">No courses assigned.</p>
                )}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Students In Batch</h2>
                <p className="text-[12.5px] text-[#64748b] mt-1">Add students by CSV import or by selecting existing student records.</p>
              </div>
              <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold text-[#64748b]">
                {assignedStudents.length} students
              </span>
            </div>

            {assignedStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[80px]">S.No</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Email</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/students/${student.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/students/${student.id}`);
                          }
                        }}
                        className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6a5182]/25 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6 text-[13px] font-bold text-[#94a3b8]">{String(index + 1).padStart(2, '0')}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#eef2f7] text-[#475569] flex items-center justify-center text-[12px] font-extrabold shrink-0">
                              {initials(student)}
                            </div>
                            <p className="text-[14px] font-bold text-[#1e293b] group-hover:text-[#6a5182] group-hover:underline underline-offset-4 transition-colors">{fullName(student)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{student.email}</td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{student.department || 'Not set'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182] mb-4">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Students Added</h3>
                <p className="text-[14px] text-[#64748b] max-w-md">Use CSV import or the existing student list to build this batch roster.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {isSelectOpen && (
        <AppModal onClose={() => setIsSelectOpen(false)} widthClass="max-w-[920px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Select Students</h3>
                <p className="text-[13px] text-[#64748b] mt-1">Choose existing students to include in {batch.name}.</p>
              </div>
              <button onClick={() => setIsSelectOpen(false)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1" title="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
              <div className="rounded-sm border border-[#e2e8f0] bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Selected Students</p>
                  <span className="rounded-sm bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 text-[12px] font-bold text-[#64748b]">
                    {selectedStudentIds.length}
                  </span>
                </div>
                {selectedStudents.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-[420px] overflow-y-auto">
                    {selectedStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-[#d8c8e9] bg-[#fbf8fe] px-2.5 py-1.5 text-[12px] font-semibold text-[#4b3f68] hover:bg-[#f3eff7] cursor-pointer"
                      >
                        {fullName(student)}
                        <span aria-hidden="true">x</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-[#94a3b8]">No students selected.</p>
                )}
              </div>

              <div className="flex flex-col min-h-0 rounded-sm border border-[#e2e8f0] overflow-hidden">
                <div className="p-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Available Students</p>
                      <p className="text-[12px] text-[#64748b] mt-1">
                        {filteredAvailableStudents.length} available
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={selectAllAvailableStudents}
                      disabled={filteredAvailableStudents.length === 0}
                      className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer disabled:cursor-not-allowed disabled:text-[#cbd5e1]"
                    >
                      Select All
                    </button>
                  </div>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search students by name, email, or department"
                    className="bg-white border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>
                <div className="max-h-[430px] overflow-y-auto divide-y divide-[#edf2f7]">
                  {filteredAvailableStudents.length > 0 ? (
                    filteredAvailableStudents.map((student) => (
                      <label key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleStudent(student.id)}
                          className="w-4 h-4 accent-[#6a5182]"
                        />
                        <span className="w-9 h-9 rounded-full bg-[#f3eff7] text-[#6a5182] flex items-center justify-center text-[12px] font-extrabold shrink-0">
                          {initials(student)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{fullName(student)}</span>
                          <span className="block text-[12px] text-[#64748b] truncate">{student.email}</span>
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[13px] text-[#64748b] font-semibold">
                      No available students found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {actionError && (
              <div className="mx-6 mb-4 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                {actionError}
              </div>
            )}

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button type="button" onClick={() => setIsSelectOpen(false)} disabled={isSaving} className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={handleSaveSelectedStudents} disabled={isSaving} className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Students'}
              </button>
            </div>
          </div>
        </AppModal>
      )}

      {isEditOpen && (
        <AppModal onClose={() => setIsEditOpen(false)} widthClass="max-w-[760px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Edit Batch</h3>
                <p className="text-[13px] text-[#64748b] mt-1">Update batch details and the courses attached to this intake.</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1" title="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Code</label>
                  <input value={batch.code} readOnly className="bg-[#eef2f7] border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none font-sans text-[#1e293b] cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Batch Name</label>
                  <input value={editName} onChange={(event) => setEditName(event.target.value)} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</label>
                  <div className="flex bg-[#f8fafc] rounded-sm p-1 gap-1 border border-[#cbd5e1] w-full">
                    <button type="button" onClick={() => setEditStatus('Active')} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editStatus === 'Active' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68]'}`}>
                      Active
                    </button>
                    <button type="button" onClick={() => setEditStatus('Archived')} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editStatus === 'Archived' ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68]'}`}>
                      Archived
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Description</label>
                  <textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={5} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b] resize-none" />
                </div>
              </div>

              <div className="flex flex-col min-h-0 rounded-sm border border-[#e2e8f0] overflow-hidden">
                <div className="p-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                  <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Assigned Courses</p>
                  <p className="text-[12px] text-[#64748b] mt-1">{editCourseIds.length} selected</p>
                </div>
                <div className="max-h-[420px] overflow-y-auto divide-y divide-[#edf2f7]">
                  {courses.map((course) => {
                    const isSelected = editCourseIds.includes(course.id);

                    return (
                      <label key={course.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors cursor-pointer">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleEditCourse(course.id)} className="mt-1 w-4 h-4 accent-[#6a5182]" />
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{course.name}</span>
                          <span className="block text-[12px] text-[#64748b] mt-0.5">{course.courseCode} | {course.department}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {actionError && (
              <div className="mx-6 mb-4 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                {actionError}
              </div>
            )}

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditOpen(false)} disabled={isSaving} className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={() => void handleSaveBatch()} disabled={isSaving} className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving ? 'Saving...' : 'Save Batch'}
              </button>
            </div>
          </div>
        </AppModal>
      )}

      {isImportOpen && (
        <AppModal onClose={() => setIsImportOpen(false)} widthClass="max-w-[620px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Import Students From CSV</h3>
                <p className="text-[13px] text-[#64748b] mt-1">CSV rows are matched against existing students by email or student_id.</p>
              </div>
              <button onClick={() => setIsImportOpen(false)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1" title="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <label className="flex flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-[#d8c8e9] bg-[#fbf8fe] px-6 py-10 text-center cursor-pointer hover:bg-[#f3eff7] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => void handleCsvFile(event.target.files?.[0])}
                  className="sr-only"
                />
                <span className="w-12 h-12 rounded-full bg-white border border-[#e2d9ed] flex items-center justify-center text-[#6a5182]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
                </span>
                <span>
                  <span className="block text-[14px] font-extrabold text-[#4b3f68]">Choose CSV file</span>
                  <span className="block text-[12.5px] text-[#64748b] mt-1">Use headers like email or student_id.</span>
                </span>
              </label>

              {csvResult && (
                <div className="rounded-sm border border-[#e2e8f0] overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-[#e2e8f0] bg-[#f8fafc]">
                    <div className="p-4">
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Matched</p>
                      <p className="text-[24px] font-extrabold text-[#16a34a] leading-none mt-2">{csvResult.matchedIds.length}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Unmatched</p>
                      <p className="text-[24px] font-extrabold text-[#dc2626] leading-none mt-2">{csvResult.unmatchedRows.length}</p>
                    </div>
                  </div>
                  {csvResult.unmatchedRows.length > 0 && (
                    <div className="max-h-[160px] overflow-y-auto p-4 bg-white">
                      <p className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Unmatched Rows</p>
                      <div className="flex flex-col gap-1">
                        {csvResult.unmatchedRows.slice(0, 10).map((row, index) => (
                          <p key={`${row}-${index}`} className="text-[12.5px] text-[#b91c1c] truncate">{row}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {actionError && (
                <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                  {actionError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button type="button" onClick={() => setIsImportOpen(false)} disabled={isSaving} className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddImportedStudents}
                disabled={isSaving || !csvResult || csvResult.matchedIds.length === 0}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSaving ? 'Importing...' : 'Add Matched Students'}
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  );
}
