import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center justify-between gap-4 bg-white px-6 py-3 border-b border-[#E1E6EE] shadow-sm w-full">
        <h2 className="flex items-center gap-3 font-bold text-[16px] text-[#232529]">
          <div className="w-[30px] h-[28px] bg-[#3E4FFF] text-white flex items-center justify-center rounded-[4px] text-[12px] font-bold leading-none tracking-wider">AM</div>
          Academic Management
        </h2>
        
        <div className="flex gap-3">
          <button 
             onClick={() => navigate('/login')}
             className="flex items-center gap-2 rounded-[3px] border border-[#E1E6EE] bg-white px-5 py-[7px] text-[12px] font-semibold text-[#232529] transition-all hover:shadow-sm"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 rounded-[3px] border border-transparent bg-[#3E4FFF] px-5 py-[7px] text-[12px] font-semibold text-white transition-all hover:opacity-90"
          >
            Get Started
          </button>
        </div>
    </nav>
  );
}
