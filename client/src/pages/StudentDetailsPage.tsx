import { useParams, useNavigate } from 'react-router-dom';

const mockStudent = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  fatherName: 'Richard Doe',
  dateOfBirth: '2005-04-12',
  mobileNo: '9876543210',
  email: 'john@example.com',
  gender: 'Male',
  department: 'CSE',
  course: 'B.Tech',
  city: 'New York',
  address: '123 Tech Street, Silicon Valley, NY',
  isActive: true,
  dateEnrolled: '2025-08-14'
};

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Simulate fetching a student, fallback to mock details for demonstration
  const student = { ...mockStudent, id: id || '1' };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
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

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 md:p-8 shadow-sm">
        <h2 className="text-[18px] font-bold text-[#0d3349] mb-6 border-b border-[#e2e8f0] pb-4">Personal & Academic Information</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-32 h-40 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              <svg className="text-[#cbd5e1] w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
