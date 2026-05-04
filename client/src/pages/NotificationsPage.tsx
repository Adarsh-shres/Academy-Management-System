import { useState } from "react";
import { useNotificationContext } from "../context/NotificationContext";
import type { Notification } from "../context/NotificationContext";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotificationContext();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    await markAsRead(id);

    // Update selected notification state as well if it's currently open
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, is_read: true } : null);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Notifications
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">
            You have {unreadCount} unread message{unreadCount !== 1 && 's'}
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-[8px] border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-medium text-[#4b3f68] shadow-sm hover:bg-[#faf8fc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 text-[#7c8697]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center flex flex-col items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
             <p className="text-[#7c8697] font-medium text-[14px]">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <svg className="w-12 h-12 text-[#e2d9ed] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-[#7c8697] font-medium text-[14px]">No notifications to display</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#f3eff7]">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => setSelectedNotification(notification)}
                className={`p-5 cursor-pointer transition-colors hover:bg-[#faf8fc] flex items-start gap-4 ${!notification.is_read ? 'bg-[#f8f5fb]' : 'bg-white'}`}
              >
                <div className="mt-1 shrink-0">
                  {!notification.is_read ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(88,50,133,0.4)]"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e2d9ed]"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`text-[15px] font-semibold truncate ${!notification.is_read ? 'text-[#4b3f68]' : 'text-[#778196]'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[12px] font-medium text-[#7c8697] whitespace-nowrap shrink-0">
                      {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#7c8697] truncate pr-4">
                    {notification.message.substring(0, 80)}{notification.message.length > 80 ? '...' : ''}
                  </p>
                </div>

                {!notification.is_read && (
                  <button 
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="opacity-0 group-hover:opacity-100 md:opacity-100 shrink-0 text-[12px] font-medium text-primary hover:text-[#4b3f68] transition-colors p-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 bg-[#391f56]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            if (!selectedNotification.is_read) handleMarkAsRead(selectedNotification.id);
            setSelectedNotification(null);
          }}
        >
          <div 
            className="bg-white rounded-[12px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-0 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative border border-[#e7dff0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-7 border-b border-[#f3eff7] bg-gradient-to-br from-[#f5effa] to-white relative">
               <button
                onClick={() => {
                  if (!selectedNotification.is_read) handleMarkAsRead(selectedNotification.id);
                  setSelectedNotification(null);
                }}
                className="absolute top-5 right-5 w-8 h-8 rounded-[8px] bg-white border border-[#e7dff0] flex items-center justify-center text-[#7c8697] hover:text-[#4b3f68] hover:shadow-sm transition-all"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
               <h3 className="font-sans text-[20px] font-bold text-[#4b3f68] tracking-tight leading-tight pr-8">
                 {selectedNotification.title}
               </h3>
               <div className="flex items-center gap-3 mt-3 text-[13px] text-[#7c8697] font-medium">
                 <span className="uppercase tracking-wider">{selectedNotification.type}</span>
                 <span className="w-1 h-1 rounded-full bg-[#d3c8e0]"></span>
                 <span>{new Date(selectedNotification.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
               </div>
            </div>
            
            <div className="p-7">
              <div className="text-[14px] leading-relaxed text-[#4b3f68] whitespace-pre-wrap min-h-[100px]">
                {selectedNotification.message}
              </div>
              
              <div className="pt-8 flex justify-end">
                <button
                  onClick={() => {
                    if (!selectedNotification.is_read) handleMarkAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="px-6 py-2.5 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
