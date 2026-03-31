import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();
  return (
    <header className="h-[58px] bg-white border-b border-[#e2e8f0] px-7 flex items-center gap-3.5 sticky top-0 z-50">
      
      {/* Search */}
      <div className="flex-1 max-w-[420px] relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input 
          type="text" 
          placeholder="Search institutional data…" 
          className="w-full py-2 pr-3.5 pl-9 bg-transparent border-[1.5px] border-transparent rounded-full text-[13px] text-[#1e293b] outline-none transition-all duration-200 focus:bg-white focus:border-[#006496] focus:ring-[3px] focus:ring-[#006496]/10 placeholder:text-[#64748b]"
        />
      </div>

      {/* Topbar Right */}
      <div className="flex items-center gap-2 ml-auto">

        
        <div className="w-[1px] h-6 bg-[#e2e8f0] mx-1"></div>
        
        <div onClick={() => navigate('/login')} className="flex items-center gap-2 px-2.5 py-1.5 border-[1.5px] border-[#e2e8f0] rounded-full cursor-pointer transition-all duration-200 hover:border-[#006496]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006496] to-[#0d3349] text-white text-[11px] font-bold flex items-center justify-center">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-[12.5px] font-semibold text-[#0d3349] leading-[1.2]">Super Admin</span>
            <span className="text-[10.5px] text-[#64748b]">Administrator</span>
          </div>
        </div>
      </div>
      
    </header>
  );
}
