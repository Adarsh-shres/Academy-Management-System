import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import type { StudentRecord } from '../types/student';

const STATUS_STYLES = {
  active: { bg: 'bg-[#e7f8ef]', text: 'text-[#15803d]', label: 'Active' },
  inactive: { bg: 'bg-[#fef2f2]', text: 'text-[#b91c1c]', label: 'Inactive' },
};

const AVATAR_TILES = [
  'bg-[#0ea5b0]',
  'bg-[#006496]',
  'bg-[#6a5182]',
  'bg-[#8b6ca8]',
  'bg-[#4b3f68]',
  'bg-[#7b6591]',
];

function avatarTileColor(id: string) {
  const index = typeof id === 'string' ? id.charCodeAt(id.length - 1) % AVATAR_TILES.length : 0;
  return AVATAR_TILES[index];
}

function formatProgramSummary(student: StudentRecord) {
  if (student.department && student.course) {
    return `${student.department} - ${student.course}`;
  }

  if (student.department) {
    return student.department;
  }

  if (student.course) {
    return student.course;
  }

  return 'Profile details not set yet';
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const { students } = useStudents();
  const [studentSearch, setStudentSearch] = useState('');

  const filteredStudents = students.filter((student) => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const fullName = `${student.firstName} ${student.lastName}`.trim().toLowerCase();

    return (
      fullName.includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.department.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-[26px_28px_40px] flex-1">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Students</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Manage and view enrolled students</p>
        </div>
        <button
          onClick={() => navigate('/register-students')}
          className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden animate-fade-up">
        <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
          <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Student Directory</h3>

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a5182] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Search students..."
                className="pl-9 pr-4 py-2 border border-[#e2d9ed] rounded-sm text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6a5182]/15 bg-[#f3eff7] w-[220px] transition-all placeholder:text-[#8b7aa0] text-[#4b3f68]"
              />
            </div>

            <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
              {filteredStudents.length} students
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#f1eaf7] max-h-[560px] overflow-y-auto custom-scrollbar">
          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-[#64748b] font-medium text-sm">No students found matching your search.</div>
          ) : (
            filteredStudents.map((student) => {
              const status = student.isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive;

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="w-full group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#fcfaff] text-left cursor-pointer"
                >
                  <div className={`${avatarTileColor(student.id)} w-[42px] h-[42px] rounded-sm flex items-center justify-center text-white text-[12px] font-extrabold shadow-sm flex-shrink-0`}>
                    {student.firstName[0] ?? 'S'}
                    {student.lastName[0] ?? 'T'}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#0d3349] leading-tight truncate tracking-tight">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-[#e6f7f9] text-[#006496]">
                        student
                      </span>
                    </div>
                    <span className="text-[11.5px] text-[#64748b] font-medium truncate mt-0.5">
                      {student.email || formatProgramSummary(student)}
                    </span>
                  </div>

                  <div className="ml-auto hidden md:block">
                    <div className="px-3.5 py-1.5 rounded-sm bg-[#f3eff7] text-[#6a5182] text-[11.5px] font-bold tracking-tight border border-[#e2d9ed]">
                      {formatProgramSummary(student)}
                    </div>
                  </div>

                  <div className="md:ml-8">
                    <div className={`px-4 py-1.5 rounded-full text-[11.5px] font-bold min-w-[85px] text-center ${status.bg} ${status.text}`}>
                      {status.label}
                    </div>
                  </div>

                  <div className="ml-6 flex items-center justify-end w-12 flex-shrink-0 text-[#c4b6d4] group-hover:text-[#6a5182] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
