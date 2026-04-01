import { useState } from 'react';

export default function AllStudentsPage() {
  const [students] = useState([
    { id: '1', name: 'John Doe', department: 'CSE', course: 'B.Tech', email: 'john@example.com', dateEnrolled: '2025-08-14' },
    { id: '2', name: 'Jane Smith', department: 'ECE', course: 'B.Tech', email: 'jane@example.com', dateEnrolled: '2025-08-15' },
    { id: '3', name: 'Alice Johnson', department: 'IT', course: 'B.Tech', email: 'alice@example.com', dateEnrolled: '2025-08-16' },
    { id: '4', name: 'Bob Brown', department: 'Mech', course: 'B.Tech', email: 'bob@example.com', dateEnrolled: '2025-08-17' },
  ]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">All Students</h1>
          <p className="text-[14px] text-[#64748b] mt-1">A comprehensive list of all enrolled students</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-[#1e293b]">
            <thead className="bg-[#f8fafc] text-[13px] font-semibold text-[#64748b] uppercase tracking-wide border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Enrollment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0d3349]">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#e6f7f9] text-[#006496] px-2.5 py-1 rounded-md text-[12px] font-bold">
                        {student.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">{student.course}</td>
                    <td className="px-6 py-4 text-[#64748b]">{student.email}</td>
                    <td className="px-6 py-4">{student.dateEnrolled}</td>
                  </tr>
                ))
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
    </div>
  );
}
