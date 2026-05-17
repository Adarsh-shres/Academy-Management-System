import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchUsersInChunks, getInitials } from '../../lib/chatHelpers';

interface ClassDirectMessagesTabProps {
  classId: string;
}

export default function ClassDirectMessagesTab({ classId }: ClassDirectMessagesTabProps) {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Load blocked users from system messages
  const fetchBlockedUsers = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('content')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

      const blocks = new Set<string>();
      data?.forEach(m => {
        if (m.content?.startsWith('[SYSTEM_BLOCK:')) {
          blocks.add(m.content.split(':')[1].replace(']', ''));
        } else if (m.content?.startsWith('[SYSTEM_UNBLOCK:')) {
          blocks.delete(m.content.split(':')[1].replace(']', ''));
        }
      });
      setBlockedUsers(Array.from(blocks));
    } catch (err) {
      console.error('Failed to fetch blocked users:', err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
    const interval = setInterval(fetchBlockedUsers, 5000);
    return () => clearInterval(interval);
  }, [classId]);

  const handleToggleBlock = async (studentId: string) => {
    if (!currentUser) return;
    const isCurrentlyBlocked = blockedUsers.includes(studentId);
    const systemMessage = isCurrentlyBlocked ? `[SYSTEM_UNBLOCK:${studentId}]` : `[SYSTEM_BLOCK:${studentId}]`;

    try {
      await supabase.from('messages').insert({
        class_id: classId,
        sender_id: currentUser.id,
        content: systemMessage,
        message_type: 'text'
      });
      
      await supabase.from('direct_messages').insert({
        sender_id: currentUser.id,
        receiver_id: studentId,
        content: systemMessage,
        message_type: 'text',
        is_read: true
      });
      
      fetchBlockedUsers();
    } catch (err) {
      console.error('Failed to toggle block:', err);
    }
  };

  // Load all enrolled students
  useEffect(() => {
    if (!currentUser || !classId) return;

    const loadStudents = async () => {
      try {
        setIsLoading(true);
        // 1. Get student_ids from the class
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('student_ids')
          .eq('id', classId)
          .single();

        if (classError || !classData) throw classError;
        const studentIds = classData.student_ids || [];

        if (studentIds.length === 0) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

        // 2. Fetch student profiles
        const fetchedStudents = await fetchUsersInChunks(studentIds);
        setStudents(fetchedStudents);

        // 3. Get unread counts for each student
        await loadUnreadCounts(fetchedStudents, currentUser.id);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [currentUser, classId]);

  useEffect(() => {
    const handleSwitchToDM = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetUserId = customEvent.detail?.userId;
      if (targetUserId && students.length > 0) {
        const student = students.find(s => s.id === targetUserId);
        if (student) {
          setSelectedStudent(student);
        }
      }
    };
    window.addEventListener('switch-to-dm', handleSwitchToDM);
    return () => window.removeEventListener('switch-to-dm', handleSwitchToDM);
  }, [students]);

  const loadUnreadCounts = async (studentList: any[], teacherId: string) => {
    try {
      const { data: allDMs, error } = await supabase
        .from('direct_messages')
        .select('sender_id, is_read')
        .eq('receiver_id', teacherId);

      if (error) throw error;

      const unreadDMs = (allDMs || []).filter(dm => dm.is_read === false);
      const counts: Record<string, number> = {};
      const studentIdSet = new Set(studentList.map((s: any) => s.id));
      
      (unreadDMs || []).forEach((dm: any) => {
        if (studentIdSet.has(dm.sender_id)) {
          counts[dm.sender_id] = (counts[dm.sender_id] || 0) + 1;
        }
      });

      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to load unread counts:', err);
    }
  };

  // Periodically refresh unread counts
  useEffect(() => {
    if (!currentUser || students.length === 0) return;
    const interval = setInterval(() => {
      loadUnreadCounts(students, currentUser.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser, students]);

  const loadMessages = async (studentId: string) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const filteredMessages = (data || []).filter(
        m => (m.sender_id === currentUser.id && m.receiver_id === studentId) ||
             (m.sender_id === studentId && m.receiver_id === currentUser.id)
      );
      
      const realMessages = filteredMessages.filter(m =>
        !m.content?.startsWith('[SYSTEM_BLOCK:') && !m.content?.startsWith('[SYSTEM_UNBLOCK:')
      );
      
      setMessages(realMessages);

      // Mark unread as read
      const unreadIds = data
        ?.filter(m => m.receiver_id === currentUser.id && !m.is_read)
        .map(m => m.id) || [];

      if (unreadIds.length > 0) {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .in('id', unreadIds);
        
        // Update local unread counts
        setUnreadCounts(prev => {
          const updated = { ...prev };
          delete updated[studentId];
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Refresh messages when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      loadMessages(selectedStudent.id);
      const interval = setInterval(() => loadMessages(selectedStudent.id), 4000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedStudent) return;
    
    setSending(true);
    try {
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: currentUser.id,
        receiver_id: selectedStudent.id,
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
      await loadMessages(selectedStudent.id);
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
      if (selectedStudent) await loadMessages(selectedStudent.id);
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message: ' + err.message);
    }
  };

  // Filter students by search
  const filteredStudents = students.filter(s => {
    const name = (s.full_name || s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 text-[#94a3b8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6a5182]"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e7dff0] p-12 text-center text-[#94a3b8] flex flex-col items-center shadow-sm">
        <span className="text-4xl mb-3">👥</span>
        <p className="font-medium text-[#4b3f68]">No Students Enrolled</p>
        <p className="text-sm">No students are enrolled in this class yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e7dff0] flex h-[600px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden animate-fade-in w-full">
      {/* Left sidebar – Student list */}
      <div className="w-[280px] border-r border-[#e7dff0] flex flex-col bg-[#fbf8fe] shrink-0">
        <div className="p-3 border-b border-[#e7dff0]">
          <h3 className="font-bold text-[#4b3f68] text-[14px] mb-2">Students ({students.length})</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-white border border-[#e7dff0] rounded-lg px-3 py-2 text-[12px] text-[#4b3f68] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6a5182]/20"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map(student => {
            const displayName = student.full_name || student.name || 'Unknown';
            const isSelected = selectedStudent?.id === student.id;
            const unread = unreadCounts[student.id] || 0;

            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors border-b border-[#f0ebf5] ${
                  isSelected
                    ? 'bg-[#6a5182]/10 border-l-[3px] border-l-[#6a5182]'
                    : 'hover:bg-white/80'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? 'bg-[#6a5182] text-white'
                      : 'bg-gradient-to-br from-[#d8c8e9] to-[#bca6d6] text-[#4b3f68]'
                  }`}>
                    {getInitials(displayName)}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold break-words leading-tight ${isSelected ? 'text-[#4b3f68]' : 'text-[#4b3f68]'}`}>
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[#94a3b8] truncate">{student.email}</p>
                </div>
              </button>
            );
          })}
          {filteredStudents.length === 0 && searchQuery && (
            <div className="p-4 text-center text-[12px] text-[#94a3b8]">
              No students match "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Right side – Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedStudent ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-[#e7dff0] flex items-center gap-3 bg-white shrink-0 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6a5182] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {getInitials(selectedStudent.full_name || selectedStudent.name || 'Unknown')}
                </div>
                <div>
                  <h3 className="font-bold text-[#4b3f68] text-[15px]">
                    {selectedStudent.full_name || selectedStudent.name || 'Unknown'}
                  </h3>
                  <p className="text-[11px] text-[#64748b]">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleBlock(selectedStudent.id)}
                className={`text-[12px] px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  blockedUsers.includes(selectedStudent.id) 
                    ? 'bg-[#16a34a] text-white hover:bg-[#15803d]' 
                    : 'bg-[#e11d48] text-white hover:bg-[#be123c]'
                }`}
              >
                {blockedUsers.includes(selectedStudent.id) ? 'Unblock Student' : 'Block Student'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#f9f8fa]">
              {messages.map(msg => {
                const isOwn = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
                    {!isOwn && (
                      <div className="w-7 h-7 rounded-full bg-[#d8c8e9] text-[#6a5182] flex items-center justify-center text-[10px] font-bold shrink-0 mr-2 mt-auto">
                        {getInitials(selectedStudent.full_name || selectedStudent.name)}
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwn ? 'bg-[#6a5182] text-white rounded-br-sm shadow-sm' : 'bg-white border border-[#e7dff0] text-[#4b3f68] rounded-bl-sm shadow-sm'
                    } relative`}>
                      {isOwn && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-md z-10"
                          title="Unsend"
                        >✕</button>
                      )}
                      <p className="text-[13px] leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/70' : 'text-[#94a3b8]'}`}>
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
                  <p className="text-[13px] text-[#94a3b8] mt-1">
                    Start a conversation with {selectedStudent.full_name || selectedStudent.name || 'this student'}!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {blockedUsers.includes(selectedStudent.id) ? (
              <div className="p-4 bg-red-50 text-red-500 text-sm text-center border-t border-[#e7dff0]">
                You have blocked this student. Unblock them in the Class Chat Members panel to resume direct messaging.
              </div>
            ) : (
              <div className="p-4 bg-white border-t border-[#e7dff0] flex gap-3 shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a direct message..."
                  className="flex-1 bg-[#f6f2fb] border border-[#e7dff0] rounded-xl px-4 py-2.5 text-[13px] text-[#4b3f68] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6a5182]/30"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="px-5 py-2 bg-[#6a5182] text-white rounded-xl hover:bg-[#5b4471] transition-colors font-bold disabled:opacity-50 shadow-sm"
                >
                  Send
                </button>
              </div>
            )}
          </>
        ) : (
          /* No student selected placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f9f8fa]">
            <div className="w-20 h-20 rounded-full bg-[#f3eff7] flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#4b3f68] mb-1">Direct Messages</h3>
            <p className="text-[13px] text-[#94a3b8] max-w-[300px]">
              Select a student from the list to start or continue a private conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
