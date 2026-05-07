import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotificationContext } from "../../context/NotificationContext";

type FilterType = 'all' | 'unread' | 'class' | 'personal';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showToast, setShowToast] = useState(false);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, latestNotification, clearLatestNotification } = useNotificationContext();
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

  useEffect(() => {
    if (latestNotification) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        clearLatestNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification, clearLatestNotification]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'class') return n.type === 'content' || n.type === 'update';
    if (filter === 'personal') return n.type === 'announcement';
    return true; // all
  });

  const getFilterClass = (f: FilterType) => `px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
    filter === f ? 'bg-[#4b3f68] text-white' : 'bg-[#f3eff7] text-[#7c8697] hover:bg-[#e2d9ed]'
  }`;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast Notification */}
      {showToast && latestNotification && (
        <div className="fixed top-20 right-6 bg-white border border-[#e7dff0] shadow-[0_10px_40px_rgba(57,31,86,0.15)] rounded-[12px] p-4 w-80 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f3eff7] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#4b3f68]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#4b3f68]">{latestNotification.title}</h4>
                <p className="text-[12px] text-[#7c8697] mt-0.5 line-clamp-2">{latestNotification.message}</p>
              </div>
            </div>
            <button onClick={() => setShowToast(false)} className="text-[#a0a8b5] hover:text-[#4b3f68]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${isOpen ? 'bg-[#f3eff7] text-[#4b3f68]' : 'hover:bg-[#f3eff7] text-[#7c8697] hover:text-[#4b3f68]'}`}
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8c67c6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4b3f68] border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-[12px] shadow-[0_15px_40px_rgba(57,31,86,0.12)] border border-[#e7dff0] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-[#f3eff7] bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-[#4b3f68] text-[16px] tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[11px] font-bold text-primary hover:text-[#391f56] uppercase tracking-wider transition-colors">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setFilter('all')} className={getFilterClass('all')}>All</button>
              <button onClick={() => setFilter('unread')} className={getFilterClass('unread')}>Unread</button>
              <button onClick={() => setFilter('class')} className={getFilterClass('class')}>Class</button>
              <button onClick={() => setFilter('personal')} className={getFilterClass('personal')}>Personal</button>
            </div>
          </div>
          
          <div className="max-h-[340px] overflow-y-auto bg-[#faf8fc]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#a0a8b5]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <p className="text-[13px] text-[#7c8697] font-medium">No notifications found.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#e7dff0]">
                {filteredNotifications.slice(0, 10).map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 transition-colors ${!notif.is_read ? 'bg-white border-l-[3px] border-l-[#4b3f68]' : 'hover:bg-white border-l-[3px] border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13.5px] truncate font-bold ${!notif.is_read ? 'text-[#0d3349]' : 'text-[#64748b]'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[12px] text-[#7c8697] mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <p className="text-[10px] text-[#a0a8b5] uppercase tracking-wider font-bold">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-[#d9cde8]"></span>
                          <p className="text-[10px] text-[#a0a8b5] uppercase tracking-wider font-bold">
                            {notif.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => { e.preventDefault(); markAsRead(notif.id); }}
                            className="w-2.5 h-2.5 rounded-full bg-[#4b3f68] ring-4 ring-[#f3eff7]"
                            title="Mark as read"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-[#e7dff0] p-3 bg-white">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-[12px] font-extrabold text-[#4b3f68] hover:bg-[#f3eff7] rounded-[8px] transition-colors uppercase tracking-wider"
            >
              View All History
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
