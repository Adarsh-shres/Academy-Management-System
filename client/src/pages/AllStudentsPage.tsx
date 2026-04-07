import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import type { StudentRecord } from '../types/student';

export default function AllStudentsPage() {
  const navigate = useNavigate();
  const { students, toggleStudentStatus, deleteStudent, updateStudent } = useStudents();

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const handleSaveEdit = () => {
    if (editingStudent) {
      updateStudent(editingStudent.id, editingStudent);
      setEditingStudent(null);
    }
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
                    <td className="px-6 py-4 font-medium text-[#0d3349]">{student.firstName} {student.lastName}</td>
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
                          onClick={() => setEditingStudent({ ...student })}
                          className="text-[#6a5182] hover:text-[#4b3f68] font-semibold text-[13px] hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-[#e2e8f0]">|</span>
                        <button 
                          onClick={() => toggleStudentStatus(student.id)}
                          className={`font-semibold text-[13px] hover:underline ${
                            student.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {student.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <span className="text-[#e2e8f0]">|</span>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this student permanently?')) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="font-semibold text-[13px] text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Student"
                        >
                          Delete
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

      {/* ─── Edit Student Modal ─────────────────────────────── */}
      {editingStudent && (
        <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditingStudent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl p-6 relative my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#0d3349]">Edit Student Profile</h3>
              <button onClick={() => setEditingStudent(null)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">First Name</label>
                  <input type="text" value={editingStudent.firstName} onChange={e => setEditingStudent({...editingStudent, firstName: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Last Name</label>
                  <input type="text" value={editingStudent.lastName} onChange={e => setEditingStudent({...editingStudent, lastName: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Father's Name</label>
                  <input type="text" value={editingStudent.fatherName} onChange={e => setEditingStudent({...editingStudent, fatherName: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Date of Birth</label>
                  <input type="date" value={editingStudent.dateOfBirth} onChange={e => setEditingStudent({...editingStudent, dateOfBirth: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Email</label>
                  <input type="email" value={editingStudent.email} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Mobile No</label>
                  <input type="text" value={editingStudent.mobileNo} onChange={e => setEditingStudent({...editingStudent, mobileNo: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</label>
                  <input type="text" value={editingStudent.department} onChange={e => setEditingStudent({...editingStudent, department: e.target.value as any})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</label>
                  <input type="text" value={editingStudent.course} onChange={e => setEditingStudent({...editingStudent, course: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">City</label>
                  <input type="text" value={editingStudent.city} onChange={e => setEditingStudent({...editingStudent, city: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Gender</label>
                  <select value={editingStudent.gender} onChange={e => setEditingStudent({...editingStudent, gender: e.target.value as any})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b]">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Address</label>
                <textarea rows={2} value={editingStudent.address} onChange={e => setEditingStudent({...editingStudent, address: e.target.value})} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-4 py-3 text-[14px] w-full outline-none focus:border-[#006496] focus:ring-1 focus:ring-[#006496]/20 transition-all font-sans text-[#1e293b] resize-none"></textarea>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 py-2.5 rounded-sm text-[13.5px] font-bold text-[#6a5182] bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-2.5 rounded-sm text-[13.5px] font-bold bg-[#6a5182] text-white hover:bg-[#5b4471] shadow-md transition-all active:scale-[0.98] cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
