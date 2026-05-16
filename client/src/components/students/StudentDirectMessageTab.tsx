import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchUsersInChunks, getInitials } from '../../lib/chatHelpers';

interface StudentDirectMessageTabProps {
  classId: string;
}

export default function StudentDirectMessageTab({ classId }: StudentDirectMessageTabProps) {
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!currentUser || !classId) return;

    const loadTeacher = async () => {
      try {
        setIsLoading(true);
        // 1. Get class details to find teacher_id
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', classId)
          .single();

        if (classError || !classData?.teacher_id) throw classError;
        
        // 2. Get teacher profile
        const teachers = await fetchUsersInChunks([classData.teacher_id]);
        if (teachers.length > 0) {
          setTeacher(teachers[0]);
        }
      } catch (err) {
        console.error('Failed to load teacher:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeacher();
  }, [currentUser, classId]);

  const loadMessages = async () => {
    if (!currentUser || !teacher) return;
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const filteredMessages = (data || []).filter(
        m => (m.sender_id === currentUser.id && m.receiver_id === teacher.id) ||
             (m.sender_id === teacher.id && m.receiver_id === currentUser.id)
      );
      
      setMessages(filteredMessages);

      // Mark unread as read
      const unreadIds = data
        ?.filter(m => m.receiver_id === currentUser.id && !m.is_read)
        .map(m => m.id) || [];

      if (unreadIds.length > 0) {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (teacher) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [teacher, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !teacher) return;
    
    setSending(true);
    try {
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: currentUser.id,
        receiver_id: teacher.id,
        content: newMessage.trim(),
        message_type: 'text',
        is_read: false
      });

      if (error) {
        console.error('Failed to send DM:', error);
        alert('Error sending DM: ' + error.message);
        throw error;
      }
      
      setNewMessage('');
      await loadMessages();
    } catch (err: any) {
      console.error('Failed to send DM:', err);
      alert('Failed to send DM: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to unsend this message?')) return;
    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', currentUser?.id);
        
      if (error) throw error;
      await loadMessages();
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 text-[#94a3b8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6a5182]"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="bg-white rounded-xl border border-[#e7dff0] p-12 text-center text-[#94a3b8] flex flex-col items-center">
        <span className="text-4xl mb-3">👨‍🏫</span>
        <p className="font-medium text-[#4b3f68]">Teacher Unavailable</p>
        <p className="text-sm">Could not load the teacher profile for this class.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e7dff0] flex flex-col h-[600px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden animate-fade-in w-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e7dff0] flex items-center gap-4 bg-gradient-to-r from-[#f6f2fb] to-[#faf8fc]">
        <div className="w-10 h-10 rounded-full bg-[#6a5182] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-white">
          {getInitials(teacher.full_name || teacher.name)}
        </div>
        <div>
          <h3 className="font-bold text-[#4b3f68]">Direct Message with {teacher.full_name || teacher.name || 'Teacher'}</h3>
          <p className="text-xs text-[#64748b] font-medium tracking-wide">Class Teacher</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f9f8fa]">
        {messages.map(msg => {
          const isOwn = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
              {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-[#d8c8e9] text-[#6a5182] flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-auto">
                  {getInitials(teacher.full_name || teacher.name)}
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isOwn ? 'bg-[#6a5182] text-white rounded-br-sm shadow-sm' : 'bg-white border border-[#e7dff0] text-[#4b3f68] rounded-bl-sm shadow-sm'
              } relative`}>
                {isOwn && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-md z-10"
                    title="Unsend"
                  >✕</button>
                )}
                <p className="text-[13.5px] leading-relaxed break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1.5 text-right font-medium ${isOwn ? 'text-white/70' : 'text-[#94a3b8]'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-[14px] font-semibold text-[#4b3f68]">No messages yet</p>
            <p className="text-[13px] text-[#94a3b8] mt-1">Start a direct conversation with your teacher!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-[#e7dff0] flex gap-3 relative">
        <textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a direct message to the teacher..."
          className="flex-1 bg-[#f6f2fb] border border-[#e7dff0] rounded-xl px-4 py-3 text-[13px] placeholder-[#94a3b8] text-[#4b3f68] focus:outline-none focus:ring-2 focus:ring-[#6a5182]/30 resize-none"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="px-5 py-2 h-[46px] bg-[#6a5182] text-white rounded-xl hover:bg-[#5b4471] transition-colors font-bold disabled:opacity-50 flex items-center justify-center self-end shadow-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
