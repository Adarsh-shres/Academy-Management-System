import { useNavigate } from 'react-router-dom';
import RegisterStudentForm from '../components/students/RegisterStudentForm';

export default function RegisterStudentsPage() {
  const navigate = useNavigate();

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
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">New Student Registration</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Enroll a new student to the institution</p>
        </div>
      </div>

      <RegisterStudentForm />
    </div>
  );
}
