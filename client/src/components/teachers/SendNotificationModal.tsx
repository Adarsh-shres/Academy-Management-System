import { useEffect, useState } from 'react';
import { sendClassNotification } from '../../lib/notifications';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
}

export default function SendNotificationModal({ isOpen, onClose, course }: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSending(true);

    try {
      await sendClassNotification({
        classId: course.id,
        title,
        message,
        type: 'manual',
      });
      
      alert('Notification sent successfully!');
      onClose();
    } catch (err: any) {
      alert('Failed to send notification: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-md w-full max-w-[480px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#E1E6EE] flex justify-between items-center bg-[#F6F8FB] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#232529]">Send Notification</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer bg-white rounded-full p-1.5 shadow-sm border border-[#E1E6EE]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto w-full hide-scrollbar">
          <form id="notification-form" onSubmit={handleSend} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Class Name</label>
              <input 
                type="text" 
                value={`${course.name} (${course.course_code})`}
                readOnly
                className="bg-[#e2e8f0]/40 border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none text-[#475569] font-medium cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Title *</label>
              <input 
                type="text" 
                placeholder="E.g. Important Update Regarding Midterms"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="bg-[#F6F8FB] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#CCD4E0] focus:ring-[3px] focus:ring-[#CCD4E0]/10 transition-all text-[#1e293b]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Message *</label>
              <textarea 
                rows={4}
                placeholder="Write your message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="bg-[#F6F8FB] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#CCD4E0] focus:ring-[3px] focus:ring-[#CCD4E0]/10 transition-all text-[#1e293b] resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#E1E6EE] bg-[#F6F8FB] flex justify-end gap-3 rounded-b-md">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSending}
            className="px-5 py-2.5 bg-white border border-[#E1E6EE] text-[#232529] text-[13.5px] font-semibold rounded-sm hover:bg-[#F6F8FB] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="notification-form"
            disabled={isSending}
            className="px-6 py-2.5 bg-[#3E4FFF] hover:bg-[#5F73F5] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
}
