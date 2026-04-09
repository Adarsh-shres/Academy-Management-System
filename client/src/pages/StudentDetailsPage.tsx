import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentEditorModal from '../components/StudentEditorModal';
import { useStudents } from '../context/StudentContext';
import type { StudentRecord } from '../types/student';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById, updateStudent } = useStudents();
  const student = getStudentById(id || '1');
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

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

        <button
          onClick={() => setEditingStudent({ ...student })}
          className="mt-2 flex shrink-0 items-center gap-2 rounded-sm bg-[#6a5182] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#5b4471] hover:shadow sm:mt-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-6 border-b border-[#e2e8f0] pb-4 text-[18px] font-bold text-[#0d3349]">
          Personal & Academic Information
        </h2>

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

      {editingStudent && (
        <StudentEditorModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(updatedStudent) => {
            updateStudent(updatedStudent.id, updatedStudent);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-[#64748b]">{label}</span>
      <span className="text-[15px] font-semibold text-[#1e293b]">{value || '-'}</span>
    </div>
  );
}
