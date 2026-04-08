import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import type { StudentRecord } from '../types/student';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById, updateStudent } = useStudents();

  const student = getStudentById(id || '1');

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const handleSaveEdit = () => {
    if (editingStudent) {
      updateStudent(editingStudent.id, editingStudent);
      setEditingStudent(null);
    }
  };

  if (!student) {
    return (
      <div className="flex flex-col gap-6 md:gap-8 pb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-[#f3eff7] border border-[#e2d9ed] rounded-lg hover:bg-[#6a5182] hover:text-white transition-colors text-[#6a5182]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-[28px] font-extrabold text-[#0d3349]">Student Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-[#f3eff7] border border-[#e2d9ed] rounded-lg hover:bg-[#6a5182] hover:text-white transition-colors text-[#6a5182]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Student Details</h1>
            <p className="text-[14px] text-[#64748b] mt-1">Viewing information for {student.firstName} {student.lastName}</p>
          </div>
        </div>

        <button 
          onClick={() => setEditingStudent({ ...student })}
          className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0 mt-2 sm:mt-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 md:p-8 shadow-sm">
        <h2 className="text-[18px] font-bold text-[#0d3349] mb-6 border-b border-[#e2e8f0] pb-4">Personal & Academic Information</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-32 h-40 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center justify-center overflow-hidden shrink-0 text-[40px] font-bold text-[#64748b]">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${
              student.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {student.isActive ? 'Active Status' : 'Deactivated'}
            </span>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
      <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-[#1e293b] font-semibold text-[15px]">{value || '-'}</span>
    </div>
  );
}
