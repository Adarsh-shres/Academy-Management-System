import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  className?: string;
  useSimpleIcon?: boolean; // For teacher dashboard if it prefers UserCircle
}

export default function ProfileDropdown({ className = '', useSimpleIcon = false }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format the role for display
  const formatRole = (role?: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const buttonContent = useSimpleIcon ? (
    <div className="flex items-center justify-center shrink-0 text-[#64748b] hover:text-[#4b3f68] transition-colors p-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    </div>
  ) : (
    <div className="flex items-center gap-2 px-2.5 py-1.5 border-[1.5px] border-[#e7dff0] rounded-sm transition-all duration-200 hover:border-[#6a5182] bg-white">
      <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-[#6a5182] to-[#8d72ab] text-white text-[11px] font-bold flex items-center justify-center">
        {getInitials(user?.name || '')}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[12.5px] font-semibold text-[#4b3f68] leading-[1.2]">
          {user?.name || 'User'}
        </span>
        <span className="text-[10.5px] text-[#64748b]">
          {formatRole(user?.role)}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="focus:outline-none cursor-pointer block"
      >
        {buttonContent}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e7dff0] rounded-md shadow-lg z-[100] py-1">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-neutral-50 font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
