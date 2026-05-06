import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SendNotificationPage() {
  const [recipient, setRecipient] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: "" });
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase.from('courses').select('id, name');
      if (data) setCourses(data);
    }
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setStatus({ type: null, text: "" });

    try {
      let target = 'general';
      let classId = undefined;

      if (recipient === 'teacher') {
        target = 'teacher';
      } else if (recipient === 'student') {
        target = 'student';
      } else if (recipient !== 'general') {
        target = 'class';
        classId = recipient;
      }

      const response = await fetch('http://localhost:5000/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: subject,
          message,
          type: 'announcement',
          target,
          classId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      setStatus({ type: 'success', text: 'Notification sent successfully.' });
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus({ type: null, text: "" }), 3000);
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to send notification. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[800px] mx-auto w-full animate-in fade-in duration-200">
      <div className="flex flex-col">
        <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
          Send Notification
        </h1>
        <p className="text-[14px] text-[#7c8697] mt-1">Broadcast messages or target specific groups</p>
      </div>

      <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] overflow-hidden">
        <div className="p-6 md:p-8">
          {status.type && (
            <div className={`mb-6 p-4 rounded-[8px] text-[13px] font-medium flex items-center gap-3 ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="recipient" className="block text-[12px] font-semibold text-[#778196] uppercase tracking-wide mb-2">
                Recipient Group
              </label>
              <select
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[#faf8fc] border border-[#e2d9ed] rounded-[8px] px-4 py-2.5 text-[14px] text-[#4b3f68] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="general">All Users</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>Class: {course.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-[12px] font-semibold text-[#778196] uppercase tracking-wide mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Upcoming Assignment Deadline"
                className="w-full bg-[#faf8fc] border border-[#e2d9ed] rounded-[8px] px-4 py-2.5 text-[14px] text-[#4b3f68] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-[#a0a8b5]"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[12px] font-semibold text-[#778196] uppercase tracking-wide mb-2">
                Message Body
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="w-full bg-[#faf8fc] border border-[#e2d9ed] rounded-[8px] px-4 py-3 text-[14px] text-[#4b3f68] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-[#a0a8b5] resize-y"
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[8px] text-[13px] font-bold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
