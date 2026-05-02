import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentEditorModal from '../components/students/StudentEditorModal';
import ConfirmActionModal from '../components/shared/ConfirmActionModal';
import { useStudents } from '../context/StudentContext';
import { supabase } from '../lib/supabase';
import type { StudentRecord } from '../types/student';

type StudentDetailTab = 'profile' | 'assignments' | 'attendance';

type StudentAssignmentRow = {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  status: string;
  grade: string;
  submittedAt: string;
};

type StudentAttendanceRow = {
  id: string;
  courseName: string;
  date: string;
  status: string;
  remarks: string;
};

/** Shows a single student profile with edit and delete actions. */
export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById, updateStudent, deleteStudent } = useStudents();
  const student = getStudentById(id || '1');
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<StudentDetailTab>('profile');
  const [assignments, setAssignments] = useState<StudentAssignmentRow[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceRow[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    if (!id) return;

    let isCancelled = false;

    async function loadStudentActivity() {
      setActivityLoading(true);
      setActivityError('');

      try {
        const [assignmentSubmissionsResult, submissionsResult, attendanceResult] = await Promise.all([
          supabase
            .from('assignment_submissions')
            .select('id, status, grade, marks_awarded, submitted_at, assignments(*)')
            .eq('student_id', id),
          supabase
            .from('submissions')
            .select('id, status, grade, submitted_at, assignments(*)')
            .eq('student_id', id),
          supabase
            .from('attendance')
            .select('*')
            .eq('student_id', id)
            .order('date', { ascending: false }),
        ]);

        const submissionRows = [
          ...((assignmentSubmissionsResult.data as any[] | null) ?? []),
          ...((submissionsResult.data as any[] | null) ?? []),
        ];

        const courseIds = Array.from(new Set([
          ...submissionRows.map((row) => row.assignments?.course_id).filter(Boolean),
          ...(((attendanceResult.data as any[] | null) ?? []).map((row) => row.course_id).filter(Boolean)),
        ]));

        const courseMap = new Map<string, { name?: string; course_code?: string }>();

        if (courseIds.length > 0) {
          const { data: courseRows } = await supabase
            .from('courses')
            .select('id, name, course_code')
            .in('id', courseIds);

          ((courseRows as any[] | null) ?? []).forEach((course) => {
            courseMap.set(course.id, course);
          });
        }

        const mappedAssignments = submissionRows.map((row) => {
          const assignment = row.assignments ?? {};
          const course = assignment.course_id ? courseMap.get(assignment.course_id) : null;

          return {
            id: row.id,
            title: assignment.title || 'Untitled Assignment',
            courseName: course?.name || 'Unknown Course',
            dueDate: [assignment.due_date, assignment.due_time].filter(Boolean).join(' ') || 'No due date',
            status: row.status || 'pending',
            grade: row.grade ? String(row.grade) : row.marks_awarded ? `${row.marks_awarded} marks` : '-',
            submittedAt: row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '-',
          };
        });

        const mappedAttendance = ((attendanceResult.data as any[] | null) ?? []).map((row) => {
          const course = row.course_id ? courseMap.get(row.course_id) : null;

          return {
            id: row.id,
            courseName: course?.name || 'Unknown Course',
            date: row.date || '-',
            status: row.status || '-',
            remarks: row.remarks || '-',
          };
        });

        if (!isCancelled) {
          setAssignments(mappedAssignments);
          setAttendance(mappedAttendance);

          const firstError = assignmentSubmissionsResult.error || submissionsResult.error || attendanceResult.error;
          setActivityError(firstError ? firstError.message : '');
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : 'Failed to load student activity.';
          setActivityError(message);
        }
      } finally {
        if (!isCancelled) {
          setActivityLoading(false);
        }
      }
    }

    void loadStudentActivity();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const attendanceSummary = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((row) => row.status === 'Present').length;
    const late = attendance.filter((row) => row.status === 'Late').length;
    const absent = attendance.filter((row) => row.status === 'Absent').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, late, absent, percentage };
  }, [attendance]);

  const handleDeleteStudent = () => {
    if (!student) {
      return;
    }

    deleteStudent(student.id);
    setIsDeleteModalOpen(false);
    navigate('/students');
  };

  if (!student) {
    return (
      <div className="flex flex-col gap-6 pb-10 md:gap-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e2d9ed] bg-[#f3eff7] text-[#6a5182] transition-colors hover:bg-[#6a5182] hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-[28px] font-extrabold text-[#0d3349]">Student Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 md:gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e2d9ed] bg-[#f3eff7] text-[#6a5182] transition-colors hover:bg-[#6a5182] hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#0d3349]">Student Details</h1>
            <p className="mt-1 text-[14px] text-[#64748b]">
              Viewing information for {student.firstName} {student.lastName}
            </p>
          </div>
        </div>

        <div className="mt-2 flex shrink-0 items-center gap-2 sm:mt-0">
          <button
            onClick={() => setEditingStudent({ ...student })}
            className="flex items-center gap-2 rounded-sm bg-[#6a5182] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#5b4471] hover:shadow"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-rose-200 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100"
            title="Delete Student"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#e2e8f0]">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'attendance', label: 'Attendance' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as StudentDetailTab)}
            className={`px-5 py-3 text-[13.5px] font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#6a5182] text-[#6a5182]'
                : 'border-transparent text-[#64748b] hover:text-[#4b3f68]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activityError && (
        <div className="rounded-sm border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-[13px] font-semibold text-[#c2410c]">
          {activityError}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 border-b border-[#e2e8f0] pb-4 text-[18px] font-bold text-[#0d3349]">
            Personal & Academic Information
          </h2>

          {saveError && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] font-semibold text-rose-700">
              {saveError}
            </div>
          )}

          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f1f5f9] text-[40px] font-bold text-[#64748b]">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                  student.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {student.isActive ? 'Active Status' : 'Deactivated'}
              </span>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
              <DetailItem label="Full Name" value={`${student.firstName} ${student.lastName}`} />
              <DetailItem label="Father's Name" value={student.fatherName} />
              <DetailItem label="Date of Birth" value={student.dateOfBirth} />
              <DetailItem label="Gender" value={student.gender} />
              <DetailItem label="Email ID" value={student.email} />
              <DetailItem label="Mobile No." value={student.mobileNo} />
              <DetailItem label="Department" value={student.department} />
              <DetailItem label="Course" value={student.course} />
              <DetailItem label="Enrollment Date" value={student.dateEnrolled} />
              <DetailItem label="City" value={student.city} />
              <div className="sm:col-span-2 md:col-span-2">
                <DetailItem label="Address" value={student.address} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="rounded-sm border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Assignments</h2>
              <p className="text-[12.5px] text-[#64748b] mt-1">Submitted and pending assignment records for this student.</p>
            </div>
            <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold text-[#64748b]">
              {assignments.length} records
            </span>
          </div>

          {activityLoading ? (
            <div className="py-16 text-center text-[13px] font-semibold text-[#64748b] animate-pulse">Loading assignments...</div>
          ) : assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assignment</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Due</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Grade</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                      <td className="py-4 px-6 text-[14px] font-bold text-[#1e293b]">{assignment.title}</td>
                      <td className="py-4 px-6 text-[13px] text-[#64748b]">{assignment.courseName}</td>
                      <td className="py-4 px-6 text-[13px] text-[#64748b]">{assignment.dueDate}</td>
                      <td className="py-4 px-6">
                        <span className="rounded-sm bg-[#f3eff7] px-2.5 py-1 text-[11px] font-bold uppercase text-[#6a5182]">
                          {assignment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[13px] font-semibold text-[#475569]">{assignment.grade}</td>
                      <td className="py-4 px-6 text-[13px] text-[#64748b]">{assignment.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyTab title="No Assignments Found" message="This student does not have assignment records yet." />
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SummaryPill label="Attendance" value={`${attendanceSummary.percentage}%`} />
            <SummaryPill label="Present" value={String(attendanceSummary.present)} />
            <SummaryPill label="Late" value={String(attendanceSummary.late)} />
            <SummaryPill label="Absent" value={String(attendanceSummary.absent)} />
          </div>

          <div className="rounded-sm border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Attendance</h2>
                <p className="text-[12.5px] text-[#64748b] mt-1">Attendance records across this student's courses.</p>
              </div>
              <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold text-[#64748b]">
                {attendanceSummary.total} records
              </span>
            </div>

            {activityLoading ? (
              <div className="py-16 text-center text-[13px] font-semibold text-[#64748b] animate-pulse">Loading attendance...</div>
            ) : attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Date</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                        <td className="py-4 px-6 text-[13px] font-semibold text-[#475569]">{record.date}</td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{record.courseName}</td>
                        <td className="py-4 px-6">
                          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase ${
                            record.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-700'
                              : record.status === 'Late'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                          }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{record.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyTab title="No Attendance Found" message="This student does not have attendance records yet." />
            )}
          </div>
        </div>
      )}

      {editingStudent && (
        <StudentEditorModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={async (updatedStudent) => {
            try {
              setSaveError('');
              await updateStudent(updatedStudent.id, updatedStudent);
              setEditingStudent(null);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to save student changes.';
              setSaveError(message);
            }
          }}
        />
      )}

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Profile"
        message="You're about to remove this student profile from the admin roster. Please confirm before we continue."
        subjectLabel={`${student.firstName} ${student.lastName} • ${student.email || 'No email'}`}
        confirmLabel="Delete Student"
      />
    </div>
  );
}

/** Displays a labeled read-only field in the student profile view. */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-[#64748b]">{label}</span>
      <span className="text-[15px] font-semibold text-[#1e293b]">{value || '-'}</span>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">{label}</p>
      <p className="mt-2 text-[24px] font-extrabold leading-none text-[#6a5182]">{value}</p>
    </div>
  );
}

function EmptyTab({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3eff7] text-[#6a5182]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      </div>
      <h3 className="mb-1 text-[18px] font-bold text-[#4b3f68]">{title}</h3>
      <p className="max-w-md text-[14px] text-[#64748b]">{message}</p>
    </div>
  );
}
