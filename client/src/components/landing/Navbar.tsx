import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center justify-between gap-4 bg-white px-6 py-3 border-b border-[#e2d9ed] shadow-sm w-full">
        <h2 className="flex items-center gap-3 font-bold text-[16px] text-[#4b3f68]">
          <div className="w-[30px] h-[28px] bg-[#6a5182] text-white flex items-center justify-center rounded-[4px] text-[12px] font-bold leading-none tracking-wider">AM</div>
          Academic Management
        </h2>
        
        <div className="flex gap-3">
          <button 
             onClick={() => navigate('/login')}
             className="flex items-center gap-2 rounded-[3px] border border-[#e2d9ed] bg-white px-5 py-[7px] text-[12px] font-semibold text-[#4b3f68] transition-all hover:shadow-sm"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 rounded-[3px] border border-transparent bg-[#6a5182] px-5 py-[7px] text-[12px] font-semibold text-white transition-all hover:opacity-90"
          >
            Get Started
          </button>
        </div>
    </nav>
  );
}
