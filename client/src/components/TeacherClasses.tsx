import { useState } from "react";

export interface TeacherClass {
  id: string;
  name: string;
  code: string;
  students: number;
  attendance: number;
  totalUnits: number;
  completedUnits: number;
  color: string;
  schedule: string;
  room: string;
}

const TEACHER_CLASSES: TeacherClass[] = [
  { id: '1', name: 'Math 101', code: 'MTH-101', students: 25, attendance: 92, totalUnits: 6, completedUnits: 3, color: '#6a5182', schedule: 'Mon Wed Fri 10:45 AM', room: 'Room 4a' },
  { id: '2', name: 'Math 102', code: 'MTH-102', students: 23, attendance: 88, totalUnits: 5, completedUnits: 2, color: '#f59e0b', schedule: 'Tue Thu 12:00 PM', room: 'Room 3b' },
  { id: '3', name: 'Math 103', code: 'MTH-103', students: 30, attendance: 95, totalUnits: 6, completedUnits: 4, color: '#ef4444', schedule: 'Mon Wed 9:00 AM', room: 'Room 2c' },
  { id: '4', name: 'Math 104', code: 'MTH-104', students: 15, attendance: 78, totalUnits: 4, completedUnits: 1, color: '#10b981', schedule: 'Tue Thu Fri 2:00 PM', room: 'Room 1a' },
];

interface StudentMockData {
  id: string;
  name: string;
  studentId: string;
  attendancePct: number;
  isActive: boolean;
}

const generateMockStudents = (count: number, prefix: string): StudentMockData[] => {
  const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-student-${i}`,
    name: `${firstNames[(i + prefix.length) % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
    studentId: `STU-26${Math.floor(Math.random() * 9000) + 1000}`,
    attendancePct: Math.floor(Math.random() * 30) + 70, // 70-99
    isActive: Math.random() > 0.1, // 90% active
  }));
};

const CLASS_STUDENTS_MAP: Record<string, StudentMockData[]> = {
  '1': generateMockStudents(25, '101'),
  '2': generateMockStudents(23, '102'),
  '3': generateMockStudents(30, '103'),
  '4': generateMockStudents(15, '104'),
};

interface TeacherClassCardProps {
  cls: TeacherClass;
  onViewDetails?: (cls: TeacherClass) => void;
  onViewStudents?: (cls: TeacherClass) => void;
}

function TeacherClassCard({ cls, onViewDetails, onViewStudents }: TeacherClassCardProps) {
  const { name, code, students, attendance, totalUnits, completedUnits, color, room } = cls;

  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return "text-[#047857] bg-[#ecfdf5] border-[#d1fae5]";
    if (pct >= 80) return "text-[#b45309] bg-[#fffbeb] border-[#fef3c7]";
    return "text-[#b91c1c] bg-[#fef2f2] border-[#fee2e2]";
  };

  const getBarGradient = (pct: number) => {
    if (pct >= 90) return "from-[#10b981] to-[#34d399]";
    if (pct >= 80) return "from-[#f59e0b] to-[#fbbf24]";
    return "from-[#ef4444] to-[#f87171]";
  };

  const progressPct = Math.round((completedUnits / totalUnits) * 100);

  return (
    <div className="relative overflow-hidden bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 group flex flex-col">
      {/* Colored top strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-[22px_22px_20px] flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-[6px] text-primary bg-[#f3eff7] uppercase tracking-wide mb-2">
              {code}
            </span>
            <h3 className="font-sans text-[17px] font-extrabold text-[#4b3f68] leading-tight tracking-tight">{name}</h3>
          </div>
          <div
            className={`text-[12px] font-bold px-[8px] py-[3px] rounded-[6px] border ${getAttendanceColor(attendance)}`}
          >
            {attendance}% Att
          </div>
        </div>

        {/* Room & Students */}
        <div className="flex items-center gap-[10px] mb-5">
          <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-white text-[12px] font-bold shadow-sm" style={{ backgroundColor: color }}>
            {students}
          </div>
          <span className="text-[13px] font-medium text-[#7c8697]">Students in {room}</span>
        </div>

        {/* Spacer to push progress down if flex container grows */}
        <div className="flex-1" />

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[11.5px] font-bold text-[#778196] uppercase tracking-wide mb-2">
            <span>Course Progress</span>
            <span>{completedUnits}/{totalUnits} units</span>
          </div>
          <div className="w-full h-[6px] bg-[#efe8f5] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getBarGradient(progressPct)}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails && onViewDetails(cls)}
            className="flex-1 py-[10px] rounded-[8px] text-[13px] font-bold uppercase tracking-wider text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors duration-200"
          >
            Manage Class
          </button>
          <button
            onClick={() => onViewStudents && onViewStudents(cls)}
            className="flex-1 py-[10px] rounded-[8px] text-[13px] font-bold uppercase tracking-wider text-white bg-primary hover:bg-[#5b4471] transition-colors duration-200"
          >
            View Students
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherClasses() {
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [viewingStudentsClass, setViewingStudentsClass] = useState<TeacherClass | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const totalStudents = TEACHER_CLASSES.reduce((sum, c) => sum + c.students, 0);
  const avgAttendance = Math.round(TEACHER_CLASSES.reduce((s, c) => s + c.attendance, 0) / TEACHER_CLASSES.length);

  // If viewing students, show the embedded student panel
  if (viewingStudentsClass) {
    const classStudents = CLASS_STUDENTS_MAP[viewingStudentsClass.id] || [];
    const filteredStudents = classStudents.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
      <div className="flex flex-col gap-6 md:gap-8 p-6 md:p-8 flex-1 min-w-0 max-w-[1200px]">
        {/* Header matching AllStudentsPage */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{viewingStudentsClass.name} Students</h1>
            <p className="text-[14px] text-[#64748b] mt-1">A comprehensive list of students enrolled in {viewingStudentsClass.code}</p>
          </div>
          
          <button
            onClick={() => setViewingStudentsClass(null)}
            className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Classes
          </button>
        </div>

        {/* Search Bar matching the exact AllStudentsPage / Student page style requirement */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#e7dff0] rounded-sm px-4 py-[10px] shadow-[0_2px_10px_rgba(57,31,86,0.02)] transition-shadow focus-within:shadow-[0_4px_16px_rgba(57,31,86,0.06)] focus-within:border-[#d8c8e9] w-full max-w-md mt-2">
          <svg className="w-4 h-4 text-[#7c8697]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="flex-1 text-[13px] text-[#4b3f68] placeholder-[#cbd5e1] outline-none bg-transparent font-medium"
          />
        </div>

        {/* List matching AllStudentsPage table styling exactly */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] text-[#1e293b]">
              <thead className="bg-[#f8fafc] text-[13px] font-semibold text-[#64748b] uppercase tracking-wide border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Attendance</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#0d3349]">{student.name}</td>
                      <td className="px-6 py-4 text-[#64748b]">{student.studentId}</td>
                      <td className="px-6 py-4 font-semibold text-[#1e293b]">{student.attendancePct}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex min-w-[80px] justify-center px-2.5 py-1 rounded-full text-[12px] font-bold ${
                          student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-[#64748b]">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-6 md:p-8 flex-1 min-w-0 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            My Classes
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{TEACHER_CLASSES.length} active classes this semester</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 rounded-sm border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-semibold text-primary shadow-sm hover:shadow-md transition-shadow">
             <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
             Semester 5 Active
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
        <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[34px] font-extrabold text-primary leading-none tracking-tight mb-2">{TEACHER_CLASSES.length}</p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">Total Classes</p>
        </div>
        <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center ring-1 ring-[#e0d6ef]">
          <p className="font-sans text-[34px] font-extrabold text-[#10b981] leading-none tracking-tight mb-2">
            {totalStudents}
          </p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">Total Students</p>
        </div>
        <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center">
          <p className="font-sans text-[34px] font-extrabold text-[#f59e0b] leading-none tracking-tight mb-2">
            {avgAttendance}%
          </p>
          <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em]">Avg Attendance</p>
        </div>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEACHER_CLASSES.map((cls) => (
          <TeacherClassCard
            key={cls.id}
            cls={cls}
            onViewDetails={setSelectedClass}
            onViewStudents={setViewingStudentsClass}
          />
        ))}
      </div>

      {/* Class detail modal */}
      {selectedClass && (
        <div
          className="fixed inset-0 bg-[#391f56]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="bg-white rounded-sm shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-0 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative border border-[#e7dff0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-7 border-b border-[#f3eff7] bg-gradient-to-br from-[#f5effa] to-white relative">
               <button
                onClick={() => setSelectedClass(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-sm bg-white border border-[#e7dff0] flex items-center justify-center text-[#7c8697] hover:text-[#4b3f68] hover:shadow-sm transition-all"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
               <div className="w-[18px] h-[6px] rounded-full mb-3" style={{ backgroundColor: selectedClass.color }} />
               <h3 className="font-sans text-[22px] font-extrabold text-[#4b3f68] tracking-tight leading-tight">{selectedClass.name}</h3>
               <p className="text-[13px] font-bold text-primary tracking-wide uppercase mt-1">{selectedClass.code}</p>
            </div>

            <div className="p-7 space-y-4">
              {[
                { label: "Enrolled Students", value: selectedClass.students },
                { label: "Class Schedule", value: selectedClass.schedule },
                { label: "Room", value: selectedClass.room },
                { label: "Total Units", value: selectedClass.totalUnits },
                { label: "Completed Units", value: selectedClass.completedUnits },
                { label: "Avg Attendance", value: `${selectedClass.attendance}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] px-2 transition-colors rounded-[8px]">
                  <span className="text-[12px] font-bold text-[#778196] uppercase tracking-wide">{label}</span>
                  <span className="text-[13px] font-semibold text-[#4b3f68]">{value}</span>
                </div>
              ))}

              <div className="pt-4">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="w-full py-[12px] rounded-sm text-[13px] font-bold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
                >
                  Close Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
