import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AllStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([
    { id: '1', name: 'John Doe', department: 'CSE', course: 'B.Tech', email: 'john@example.com', dateEnrolled: '2025-08-14', isActive: true },
    { id: '2', name: 'Jane Smith', department: 'ECE', course: 'B.Tech', email: 'jane@example.com', dateEnrolled: '2025-08-15', isActive: true },
    { id: '3', name: 'Alice Johnson', department: 'IT', course: 'B.Tech', email: 'alice@example.com', dateEnrolled: '2025-08-16', isActive: false },
    { id: '4', name: 'Bob Brown', department: 'Mech', course: 'B.Tech', email: 'bob@example.com', dateEnrolled: '2025-08-17', isActive: true },
  ]);

  const toggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

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
                <th className="px-6 py-4">Course Details</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0d3349]">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#e6f7f9] text-[#006496] px-2.5 py-1 rounded-md text-[12px] font-bold mr-2">
                        {student.department}
                      </span>
                      <span className="text-[#64748b] text-[13px]">{student.course}</span>
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex min-w-[80px] justify-center px-2.5 py-1 rounded-full text-[12px] font-bold ${
                        student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {student.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="text-[#006496] hover:text-[#004e75] font-semibold text-[13px] hover:underline"
                        >
                          Details
                        </button>
                        <span className="text-[#e2e8f0]">|</span>
                        <button 
                          onClick={() => toggleStatus(student.id)}
                          className={`font-semibold text-[13px] hover:underline ${
                            student.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {student.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
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
