import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Paperclip, Trash2, Reply, X, File } from 'lucide-react';
import { fetchUsersInChunks, getSenderNameFallback, getInitials } from '../../lib/chatHelpers';

interface Message {
  id: string;
  class_id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
  sender?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface ClassChatTabProps {
  classId: string;
}



const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getDateDivider = (dateStr: string): string | null => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ClassChatTab({ classId }: ClassChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [chatLoading, setChatLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  useEffect(() => {
    const getCurrentUserAndMembers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Get class details with student_ids
      const { data: classData } = await supabase
        .from('classes')
        .select('*, teacher_id, student_ids')
        .eq('id', classId)
        .single()

      // Fetch all student details
      const studentIds = classData?.student_ids || []
      let membersData: any[] = []

      if (studentIds.length > 0) {
        membersData = await fetchUsersInChunks(studentIds);
      }

      // Fetch teacher details
      let teacherData = null;
      if (classData?.teacher_id) {
        const teachers = await fetchUsersInChunks([classData.teacher_id]);
        teacherData = teachers[0] || null;
      }

      setClassMembers([
        ...(teacherData ? [{ ...teacherData, role: 'teacher' }] : []),
        ...membersData
      ])

    };
    getCurrentUserAndMembers();
  }, [classId]);

  const [showBlockedMessages, setShowBlockedMessages] = useState(false);

  const toggleBlockUser = async (userId: string) => {
    const isCurrentlyBlocked = blockedUsers.includes(userId);
    const systemMessage = isCurrentlyBlocked ? `[SYSTEM_UNBLOCK:${userId}]` : `[SYSTEM_BLOCK:${userId}]`;

    try {
      await supabase.from('messages').insert({
        class_id: classId,
        sender_id: currentUser.id,
        content: systemMessage,
        message_type: 'text'
      });
      
      await supabase.from('direct_messages').insert({
        sender_id: currentUser.id,
        receiver_id: userId,
        content: systemMessage,
        message_type: 'text',
        is_read: true
      });
      
      fetchMessages();
    } catch (err) {
      console.error('Failed to toggle block:', err);
    }
  };



  const fetchMessages = async () => {
    try {
      // Step 1: fetch messages without join
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch messages:', error);
        return;
      }

      // Step 2: get unique sender IDs
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];

      // Step 3: fetch sender details separately
      const sendersMap: Record<string, any> = {}

      // First try from classMembers already fetched
      classMembers.forEach(m => { sendersMap[m.id] = m })

      // Then try fetching remaining unknown senders
      const unknownIds = senderIds.filter(id => !sendersMap[id])
      if (unknownIds.length > 0) {
        const users = await fetchUsersInChunks(unknownIds);
        users.forEach(s => { sendersMap[s.id] = s });
      }

      // Step 4: merge sender info into messages
      const enrichedMessages = messagesData?.map(m => ({
        ...m,
        sender: {
          id: m.sender_id,
          full_name: getSenderNameFallback(sendersMap[m.sender_id], currentUser?.id, m.sender_id)
        }
      })) || [];

      // Calculate blocked users from system messages
      const blocks = new Set<string>();
      messagesData?.forEach(m => {
        if (m.content?.startsWith('[SYSTEM_BLOCK:')) {
          const id = m.content.split(':')[1].replace(']', '');
          blocks.add(id);
        } else if (m.content?.startsWith('[SYSTEM_UNBLOCK:')) {
          const id = m.content.split(':')[1].replace(']', '');
          blocks.delete(id);
        }
      });
      setBlockedUsers(Array.from(blocks));

      // Filter out system messages
      const realMessages = enrichedMessages.filter(m => 
        !m.content?.startsWith('[SYSTEM_BLOCK:') && !m.content?.startsWith('[SYSTEM_UNBLOCK:')
      );

      setMessages(realMessages);
      setChatLoading(false);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [classId, classMembers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [classId, classMembers]);



  const handleDMFromPanel = (student: any) => {
    setShowMembersPanel(false)
    window.dispatchEvent(new CustomEvent('switch-to-dm', { detail: { userId: student.id } }));
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!currentUser || (!newMessage.trim() && !selectedFile)) {
      alert('Please enter a message or select a file.');
      return;
    }

    setSendingMessage(true);

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;
      let fileSize: number | null = null;
      let messageType: 'text' | 'file' | 'image' = 'text';

      if (selectedFile) {
        if (selectedFile.size > 104857600) {
          alert('File size exceeds 100MB limit.');
          setSendingMessage(false);
          return;
        }

        const ext = selectedFile.name.split('.').pop();
        const timestamp = new Date().getTime();
        const path = `${classId}/${timestamp}.${ext}`;

        const { error: uploadError, data } = await supabase.storage
          .from('chat-files')
          .upload(path, selectedFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(path);

        fileUrl = publicData.publicUrl;
        fileName = selectedFile.name;
        fileType = selectedFile.type;
        fileSize = selectedFile.size;
        messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
      }

      // Build content with reply prefix if replying
      let finalContent = newMessage.trim() || null;
      if (replyTo && finalContent) {
        const replyName = replyTo.sender?.full_name || 'Unknown';
        const replyPreviewRaw = replyTo.content?.startsWith('[REPLY:') && replyTo.content.indexOf(']') !== -1
          ? replyTo.content.slice(replyTo.content.indexOf(']') + 1).trim()
          : (replyTo.content || (replyTo.file_name ? `📎 ${replyTo.file_name}` : 'Attachment'));
        const replyPreview = (replyPreviewRaw || '').slice(0, 80);
        finalContent = `[REPLY:${replyName}:${replyPreview}] ${finalContent}`;
      }

      const { error: insertError } = await supabase.from('messages').insert({
        class_id: classId,
        sender_id: currentUser.id,
        content: finalContent,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        message_type: messageType
      });

      if (insertError) {
        console.error('Failed to send message:', insertError);
        alert('Error sending message: ' + insertError.message);
        throw insertError;
      }

      setNewMessage('');
      setReplyTo(null);
      // Fetch latest messages
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleUnsendMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to unsend this message? It will be removed for everyone.')) return;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', currentUser.id);
        
      if (error) throw error;
      fetchMessages();
    } catch (err: any) {
      alert('Failed to unsend message: ' + err.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1) {
      const query = val.slice(atIndex + 1).toLowerCase();
      if (!query.includes(' ')) {
        const filtered = classMembers.filter(m =>
          m.full_name?.toLowerCase().includes(query)
        ).slice(0, 5);
        setMentionSuggestions(filtered);
        setShowMentions(filtered.length > 0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionClick = (user: any) => {
    const atIndex = newMessage.lastIndexOf('@');
    const newText = newMessage.slice(0, atIndex) + `@${user.full_name} `;
    setNewMessage(newText);
    setShowMentions(false);
  };

  const renderMessageContent = (content: string, members: any[]) => {
    if (!content) return null;
    let result: React.ReactNode[] = [content];

    members.forEach(m => {
      if (!m.full_name) return;
      const mention = `@${m.full_name}`;
      result = result.flatMap((part, idx) => {
        if (typeof part === 'string') {
          const parts = part.split(mention);
          if (parts.length === 1) return [part];
          return parts.reduce((acc: React.ReactNode[], curr, i) => {
            if (i === 0) return [curr];
            return [...acc, <span key={`${idx}-${i}`} className="bg-[#ede9f5] text-[#6a5182] rounded px-1 font-semibold">{mention}</span>, curr];
          }, [] as React.ReactNode[]);
        }
        return [part];
      });
    });
    return result;
  };

  if (chatLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`h-12 rounded-lg bg-[#f1f5f9] animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'
                }`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f6f2fb] to-[#faf8fc] border-b border-[#e7dff0] p-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-[#4b3f68]">💬 Class Chat</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMembersPanel(true)}
              className="text-sm text-[#6a5182] hover:opacity-80 transition-opacity font-medium mt-1 flex items-center gap-3 text-left"
            >
              <span>👥 {classMembers.length} members</span>
              <div className="flex -space-x-2">
                {classMembers.slice(0, 3).map((m: any, i: number) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d8c8e9] to-[#bca6d6] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#6a5182] shadow-sm">
                    {getInitials(m.full_name)}
                  </div>
                ))}
                {classMembers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-[#f3eff7] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#6a5182] shadow-sm">
                    +{classMembers.length - 3}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.filter(m => blockedUsers.includes(m.sender_id)).length > 0 && (
          <div className="w-full flex justify-center sticky top-0 z-20">
            <div className="bg-[#f3eff7] border border-[#d8c8e9] text-[#6a5182] text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
              {messages.filter(m => blockedUsers.includes(m.sender_id)).length} messages from blocked users.
              <button 
                onClick={() => setShowBlockedMessages(!showBlockedMessages)}
                className="underline hover:text-[#4b3f68]"
              >
                {showBlockedMessages ? 'Hide' : 'Show'}?
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💭</div>
            <p className="text-[14px] font-semibold text-[#4b3f68]">No messages yet</p>
            <p className="text-[13px] text-[#94a3b8] mt-1">Start the conversation with your class!</p>
          </div>
        ) : (
          <>
            {(showBlockedMessages ? messages : messages.filter(m => !blockedUsers.includes(m.sender_id))).map((message, idx, arr) => {
              const isOwnMessage = message.sender_id === currentUser?.id;
              const showDateDivider =
                idx === 0 ||
                getDateDivider(messages[idx - 1]?.created_at) !==
                getDateDivider(message.created_at);

              return (
                <div key={message.id}>
                  {showDateDivider && (
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-[#e7dff0]" />
                      <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider px-2">
                        {getDateDivider(message.created_at)}
                      </p>
                      <div className="flex-1 h-px bg-[#e7dff0]" />
                    </div>
                  )}

                  <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isOwnMessage && (
                      <div className="flex flex-col gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[11px] font-bold text-[#6a5182] shrink-0">
                          {getInitials(message.sender?.full_name)}
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-xs ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center gap-2 px-2">
                          <p className="text-[11px] font-semibold text-[#6a5182]">
                            {message.sender?.full_name || 'Unknown'}
                          </p>
                          {currentUser?.id !== message.sender_id && currentUser?.id === classMembers.find(m => m.role === 'teacher')?.id && (
                            <div className="relative group cursor-pointer">
                              <span className="text-[#94a3b8] hover:text-[#4b3f68]">⋮</span>
                              <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col bg-white border border-[#e7dff0] rounded-md shadow-lg overflow-hidden z-20 min-w-[120px]">
                                <button
                                  onClick={() => toggleBlockUser(message.sender_id)}
                                  className="px-4 py-2 text-xs text-left hover:bg-[#f6f2fb] text-red-500 font-medium"
                                >
                                  Block Student
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reply preview inside bubble */}
                      {message.content?.startsWith('[REPLY:') && (() => {
                        const endIdx = message.content.indexOf(']');
                        if (endIdx === -1) return null;
                        const replyMeta = message.content.slice(7, endIdx);
                        const sepIdx = replyMeta.indexOf(':');
                        const replySender = sepIdx !== -1 ? replyMeta.slice(0, sepIdx) : 'Someone';
                        const replyPreview = sepIdx !== -1 ? replyMeta.slice(sepIdx + 1) : replyMeta;
                        return (
                          <div className={`rounded-lg px-3 py-1.5 text-[11px] border-l-[3px] ${isOwnMessage ? 'bg-[#7d6694] border-white/40 text-white/80' : 'bg-[#f3eff7] border-[#6a5182] text-[#64748b]'}`}>
                            <p className="font-bold text-[10px]">{replySender}</p>
                            <p className="truncate max-w-[200px]">{replyPreview}</p>
                          </div>
                        );
                      })()}

                      <div
                        className={`rounded-xl px-4 py-3 ${isOwnMessage
                            ? 'bg-[#6a5182] text-white'
                            : 'bg-white border border-[#e7dff0] text-[#4b3f68]'
                          }`}
                      >
                        {message.content && (
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                            {renderMessageContent(
                              message.content.startsWith('[REPLY:') && message.content.indexOf(']') !== -1
                                ? message.content.slice(message.content.indexOf(']') + 1).trim()
                                : message.content,
                              classMembers
                            )}
                          </p>
                        )}

                        {message.message_type === 'image' && message.file_url && (
                          <div className="mt-2">
                            <img
                              src={message.file_url}
                              alt="Message attachment"
                              className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(message.file_url, '_blank')}
                            />
                          </div>
                        )}

                        {message.message_type === 'file' && message.file_url && (
                          <a
                            href={message.file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-3 px-4 py-3 bg-white border border-[#e7dff0] rounded-xl hover:shadow-sm transition-all w-fit max-w-[300px] no-underline"
                          >
                            <div className="relative flex-shrink-0">
                              <File className="w-8 h-8 text-[#3b82f6]" strokeWidth={1.5} />
                              <div className="absolute bottom-0 -left-1 bg-[#3b82f6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm border border-white">
                                {message.file_name?.split('.').pop()?.substring(0, 4) || 'FILE'}
                              </div>
                            </div>
                            <span className="text-[14px] font-medium text-[#475569] truncate">
                              {message.file_name}
                            </span>
                          </a>
                        )}
                      </div>

                      <p className="text-[11px] opacity-60 px-2 leading-none mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>

                    {/* Action buttons: Reply + Delete */}
                    <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleReply(message)}
                        className="text-[#6a5182] hover:text-[#4b3f68] hover:scale-110 transition-all"
                        title="Reply"
                      >
                        <Reply size={14} />
                      </button>
                      {isOwnMessage && (
                        <button
                          onClick={() => handleUnsendMessage(message.id)}
                          className="text-[#ef4444] hover:scale-110 transition-all"
                          title="Unsend Message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="bg-[#f6f2fb] rounded-xl p-3 mx-4 flex items-center gap-3 border border-[#e7dff0]">
          {filePreview ? (
            <img
              src={filePreview}
              alt="Preview"
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <span className="text-lg">📄</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#4b3f68] truncate">
              {selectedFile.name}
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={removeFile}
            className="px-2 py-1 text-[#6a5182] hover:bg-white rounded transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      {blockedUsers.includes(currentUser?.id) ? (
        <div className="p-4 text-center text-red-400 text-sm bg-red-50 rounded-xl m-4">
          You have been blocked from sending messages by the teacher.
        </div>
      ) : (
        <div className="border-t border-[#e7dff0] bg-white p-4">
          {/* Reply Preview Bar */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 bg-[#f6f2fb] border border-[#e7dff0] rounded-xl px-4 py-2">
              <Reply size={14} className="text-[#6a5182] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#6a5182]">
                  Replying to {replyTo.sender?.full_name || 'Unknown'}
                </p>
                <p className="text-[12px] text-[#64748b] truncate">
                  {replyTo.content?.startsWith('[REPLY:') && replyTo.content.indexOf(']') !== -1
                    ? replyTo.content.slice(replyTo.content.indexOf(']') + 1).trim()
                    : (replyTo.content || (replyTo.file_name ? `📎 ${replyTo.file_name}` : 'Attachment'))}
                </p>
              </div>
              <button onClick={cancelReply} className="text-[#94a3b8] hover:text-[#ef4444] transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="relative flex gap-3 items-end">
          {showMentions && mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-[#e7dff0] rounded-lg shadow-xl z-10 overflow-hidden">
              {mentionSuggestions.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleMentionClick(user)}
                  className="w-full text-left px-4 py-2 hover:bg-[#f6f2fb] flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[10px] font-bold text-[#6a5182]">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="text-sm text-[#4b3f68] font-medium flex-1 break-words leading-tight pr-2">{user.full_name}</span>
                  <span className="text-[10px] text-[#94a3b8] uppercase ml-auto">{user.role}</span>
                </button>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-[#6a5182] hover:bg-[#f6f2fb] rounded-xl transition-colors font-bold text-lg flex items-center justify-center"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-[#f6f2fb] border border-[#e7dff0] rounded-xl px-4 py-2 text-[13px] placeholder-[#94a3b8] text-[#4b3f68] focus:outline-none focus:ring-2 focus:ring-[#6a5182] focus:ring-opacity-30 resize-none"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
            className="px-4 py-2 bg-[#6a5182] text-white rounded-xl hover:bg-[#5b4471] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            ➤
          </button>
        </div>
      </div>
      )}

      {/* Members Panel */}
      {showMembersPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/30 flex-1" onClick={() => setShowMembersPanel(false)} />
          <div className="w-80 bg-white shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#e7dff0]">
              <h3 className="font-bold text-gray-800">Members ({classMembers.length})</h3>
              <button onClick={() => setShowMembersPanel(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Members List */}
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
              {/* Teacher section */}
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Teacher — Admin</p>
              {classMembers.filter(m => m.role === 'teacher').map(member => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f6f2fb]">
                  <div className="w-9 h-9 rounded-full bg-[#6a5182] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {member.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{member.full_name}</p>
                    <span className="text-xs bg-[#6a5182] text-white px-2 py-0.5 rounded-full">Admin</span>
                  </div>
                  {currentUser?.id !== member.id && (
                    <button
                      onClick={() => handleDMFromPanel(member)}
                      className="text-xs bg-[#f6f2fb] text-[#6a5182] px-2 py-1 rounded-lg hover:bg-[#ede9f5] shrink-0"
                    >
                      💬 DM
                    </button>
                  )}
                </div>
              ))}

              {/* Students section */}
              <p className="text-xs font-bold text-gray-400 uppercase mt-3 mb-1">Students ({classMembers.filter(m => m.role !== 'teacher').length})</p>
              {classMembers.filter(m => m.role !== 'teacher').map(member => (
                <div key={member.id} className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#f6f2fb] ${blockedUsers.includes(member.id) ? 'opacity-50' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-purple-200 text-[#6a5182] flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {member.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 break-words leading-tight">{member.full_name}</p>
                    {blockedUsers.includes(member.id) && (
                      <span className="text-xs text-red-400">Blocked</span>
                    )}
                  </div>
                  {/* Admin controls — only show if current user is teacher */}
                  {currentUser?.id === classMembers.find(m => m.role === 'teacher')?.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDMFromPanel(member)}
                        className="text-xs bg-[#f6f2fb] text-[#6a5182] px-2 py-1 rounded-lg hover:bg-[#ede9f5]"
                      >
                        💬 DM
                      </button>
                      <button
                        onClick={() => toggleBlockUser(member.id)}
                        className={`text-xs px-2 py-1 rounded-lg ${blockedUsers.includes(member.id) ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}
                      >
                        {blockedUsers.includes(member.id) ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
