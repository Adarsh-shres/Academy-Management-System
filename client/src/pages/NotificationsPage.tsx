import { useState } from "react";
import { useNotificationContext } from "../context/NotificationContext";
import type { Notification } from "../context/NotificationContext";

type FilterType = 'all' | 'unread' | 'class' | 'personal';

function getCategoryLabel(type: string): { label: string; color: string } {
  if (type === 'content' || type === 'update') return { label: 'CLASS', color: 'bg-[#ede8f7] text-[#4b3f68]' };
  return { label: 'PERSONAL', color: 'bg-[#edf4fb] text-[#2563a8]' };
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotificationContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'class') return n.type === 'content' || n.type === 'update';
    if (filter === 'personal') return n.type === 'announcement';
    return true;
  });

  const handleOpen = (notif: Notification) => {
    setSelectedNotification(notif);
    if (!notif.is_read) markAsRead(notif.id);
  };

  const handleClose = () => setSelectedNotification(null);

  const filterBtn = (f: FilterType, label: string) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
        filter === f
          ? 'bg-[#4b3f68] text-white shadow-sm'
          : 'bg-[#f3eff7] text-[#7c8697] hover:bg-[#e2d9ed]'
      }`}
    >
      {label}
      {f === 'unread' && unreadCount > 0 && (
        <span className="ml-1.5 bg-white text-[#4b3f68] rounded-full px-1.5 py-0.5 text-[10px] font-extrabold">
          {unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-6 pb-10 flex-1 min-w-0 max-w-[860px] mx-auto w-full animate-in fade-in duration-200">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Notification History
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        <button
          onClick={() => markAllAsRead()}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 rounded-[8px] border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-medium text-[#4b3f68] shadow-sm hover:bg-[#faf8fc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start lg:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Mark all as read
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {filterBtn('all', 'All')}
        {filterBtn('unread', 'Unread')}
        {filterBtn('class', 'Class')}
        {filterBtn('personal', 'Personal')}
      </div>

      {/* ── List ── */}
      <div className="bg-white rounded-[12px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.05)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b3f68]" />
            <p className="text-[#7c8697] font-medium text-[14px]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#c4b5d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-[#7c8697] font-medium text-[14px]">No notifications found.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#f3eff7]">
            {filteredNotifications.map((notif) => {
              const cat = getCategoryLabel(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleOpen(notif)}
                  className={`p-5 cursor-pointer transition-colors hover:bg-[#faf8fc] flex items-start gap-4 ${
                    !notif.is_read ? 'bg-[#f8f5fb] border-l-[3px] border-l-[#4b3f68]' : 'border-l-[3px] border-l-transparent'
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${!notif.is_read ? 'bg-[#4b3f68] shadow-[0_0_8px_rgba(75,63,104,0.4)]' : 'bg-[#e2d9ed]'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`text-[15px] font-semibold truncate ${!notif.is_read ? 'text-[#4b3f68]' : 'text-[#778196]'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[12px] text-[#a0a8b5] whitespace-nowrap shrink-0">
                        {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#7c8697] line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                      {!notif.is_read && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b3f68] bg-[#f3eff7] px-2 py-0.5 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-[#391f56]/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-[#e7dff0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-7 border-b border-[#f3eff7] bg-gradient-to-br from-[#f5effa] to-white relative">
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-[8px] bg-white border border-[#e7dff0] flex items-center justify-center text-[#7c8697] hover:text-[#4b3f68] hover:shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-[20px] font-bold text-[#4b3f68] tracking-tight leading-tight pr-10">
                {selectedNotification.title}
              </h3>
              <div className="flex items-center gap-3 mt-3 text-[12px] text-[#7c8697] font-medium">
                <span className={`uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getCategoryLabel(selectedNotification.type).color}`}>
                  {getCategoryLabel(selectedNotification.type).label}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#d3c8e0]" />
                <span>{formatTimestamp(selectedNotification.created_at)}</span>
              </div>
            </div>
            {/* Modal body */}
            <div className="p-7">
              <p className="text-[14px] leading-relaxed text-[#4b3f68] whitespace-pre-wrap min-h-[80px]">
                {selectedNotification.message}
              </p>
              <div className="pt-8 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-[8px] text-[13px] font-semibold text-white bg-[#4b3f68] hover:opacity-90 transition-opacity uppercase tracking-wider"
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
