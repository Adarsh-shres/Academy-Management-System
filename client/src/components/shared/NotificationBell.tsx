import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotificationContext } from "../../context/NotificationContext";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount } = useNotificationContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[#f3eff7] transition-colors text-[#7c8697] hover:text-[#4b3f68]"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-[12px] shadow-[0_10px_30px_rgba(57,31,86,0.1)] border border-[#e7dff0] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center p-4 border-b border-[#f3eff7] bg-[#faf8fc]">
            <h3 className="font-semibold text-[#4b3f68] text-[14px]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-[#e2d9ed] text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#7c8697]">
                No recent notifications.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#f3eff7]">
                {notifications.slice(0, 5).map((notif) => (
                  <Link 
                    key={notif.id}
                    to="/student/notifications" 
                    onClick={() => setIsOpen(false)}
                    className={`p-4 block hover:bg-[#faf8fc] transition-colors ${!notif.is_read ? 'bg-[#f8f5fb]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-[13px] font-semibold truncate pr-2 ${!notif.is_read ? 'text-[#4b3f68]' : 'text-[#778196]'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"></div>}
                    </div>
                    <p className="text-[12px] text-[#7c8697] truncate">{notif.message}</p>
                    <p className="text-[10px] text-[#a0a8b5] mt-2 uppercase tracking-wider font-semibold">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-[#f3eff7] p-2 bg-[#faf8fc]">
            <Link 
              to="/student/notifications" 
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-2 text-[12px] font-bold text-primary hover:text-[#4b3f68] transition-colors uppercase tracking-wider"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
