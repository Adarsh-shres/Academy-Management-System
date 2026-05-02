import ProfileDropdown from '../components/shared/ProfileDropdown';

export default function Topbar() {
  return (
    <header className="h-[58px] bg-white/85 backdrop-blur border-b border-[#e7dff0] px-7 flex items-center gap-3.5 sticky top-0 z-50 shadow-[0_6px_24px_rgba(57,31,86,0.04)]">
      


      {/* Topbar Right */}
      <div className="flex items-center gap-2 ml-auto">

        
        <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
        
        <ProfileDropdown />
      </div>
      
    </header>
  );
}
