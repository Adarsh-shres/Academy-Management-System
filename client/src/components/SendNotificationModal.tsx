import { useEffect, useState } from 'react';

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
      // TODO: Implement Supabase insert query into a `notifications` table once it exists.
      // e.g. await supabase.from('notifications').insert({ course_id: course.id, title, message })
      
      // Simulating network delay for now
      await new Promise(res => setTimeout(res, 800));
      
      alert('Notification sent successfully!');
      onClose();
    } catch (err: any) {
      alert('Failed to send notification: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-[480px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#4b3f68]">Send Notification</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer bg-white rounded-full p-1.5 shadow-sm border border-[#e2d9ed]">
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
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Message *</label>
              <textarea 
                rows={4}
                placeholder="Write your message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3 rounded-b-md">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSending}
            className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="notification-form"
            disabled={isSending}
            className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
}
