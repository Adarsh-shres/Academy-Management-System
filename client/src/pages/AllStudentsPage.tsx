import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentEditorModal from '../components/StudentEditorModal';
import ConfirmActionModal from '../components/ConfirmActionModal';
import { useStudents } from '../context/StudentContext';
import type { StudentRecord } from '../types/student';

/** Shows the full student table for admin management tasks. */
export default function AllStudentsPage() {
  const navigate = useNavigate();
  const { students, toggleStudentStatus, deleteStudent, updateStudent } = useStudents();
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null);
  const [saveError, setSaveError] = useState('');

  const formatCourseDetails = (department: string, course: string) => {
    if (department && course) return { badge: department, text: course };
    if (department) return { badge: department, text: 'Course not set yet' };
    if (course) return { badge: 'Not set', text: course };
    return { badge: 'Not set', text: 'Profile details not set yet' };
  };

  return (
    <div className="flex flex-col gap-6 pb-10 md:gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#0d3349]">All Students</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">A comprehensive list of all enrolled students</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        {saveError && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-[13.5px] font-semibold text-rose-700">
            {saveError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-[#1e293b]">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[13px] font-semibold uppercase tracking-wide text-[#64748b]">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Course Details</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {students.length > 0 ? (
                students.map((student) => {
                  const details = formatCourseDetails(student.department, student.course);

                  return (
                    <tr key={student.id} className="transition-colors hover:bg-[#f8fafc]">
                      <td className="px-6 py-4 font-medium text-[#0d3349]">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="mr-2 rounded-md bg-[#e6f7f9] px-2.5 py-1 text-[12px] font-bold text-[#006496]">
                          {details.badge}
                        </span>
                        <span className="text-[13px] text-[#64748b]">{details.text}</span>
                      </td>
                      <td className="px-6 py-4 text-[#64748b]">{student.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex min-w-[80px] justify-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
                            student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="text-[13px] font-semibold text-[#006496] hover:text-[#004e75] hover:underline"
                          >
                            Details
                          </button>
                          <span className="text-[#e2e8f0]">|</span>
                          <button
                            onClick={() => setEditingStudent({ ...student })}
                            className="text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] hover:underline"
                          >
                            Edit
                          </button>
                          <span className="text-[#e2e8f0]">|</span>
                          <button
                            onClick={() => toggleStudentStatus(student.id)}
                            className={`text-[13px] font-semibold hover:underline ${
                              student.isActive
                                ? 'text-rose-600 hover:text-rose-800'
                                : 'text-emerald-600 hover:text-emerald-800'
                            }`}
                          >
                            {student.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <span className="text-[#e2e8f0]">|</span>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="text-[13px] font-semibold text-gray-400 transition-colors hover:text-red-600"
                            title="Delete Student"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#64748b]">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (!studentToDelete) {
            return;
          }

          deleteStudent(studentToDelete.id);
          setStudentToDelete(null);
        }}
        title="Delete Student Profile"
        message="You're about to remove this student profile from the admin roster. Please confirm before we continue."
        subjectLabel={
          studentToDelete
            ? `${studentToDelete.firstName} ${studentToDelete.lastName} • ${studentToDelete.email || 'No email'}`
            : ''
        }
        confirmLabel="Delete Student"
      />
    </div>
  );
}
