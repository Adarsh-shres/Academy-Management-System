import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from '../components/shared/icons';
import { Paperclip, Trash2, Reply, X, File } from 'lucide-react';
import { fetchUsersInChunks, getSenderNameFallback, getInitials } from '../lib/chatHelpers';

interface Message {
  id: string;
  class_id?: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
  is_read?: boolean;
  sender?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface Channel {
  id: string;
  course_code?: string;
  name?: string;
  title?: string;
  class_name?: string;
  code?: string;
  [key: string]: any;
}

interface DMUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  unreadCount?: number;
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

export default function TeacherChatPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [dmList, setDmList] = useState<DMUser[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedDM, setSelectedDM] = useState<DMUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [channelMembers, setChannelMembers] = useState<any[]>([]);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleBlock = async (studentId: string, channelId: string) => {
    const isCurrentlyBlocked = blockedUsers.includes(studentId);
    const systemMessage = isCurrentlyBlocked ? `[SYSTEM_UNBLOCK:${studentId}]` : `[SYSTEM_BLOCK:${studentId}]`;

    try {
      await supabase.from('messages').insert({
        class_id: channelId,
        sender_id: currentUser?.id,
        content: systemMessage,
        message_type: 'text'
      });
      
      await supabase.from('direct_messages').insert({
        sender_id: currentUser?.id,
        receiver_id: studentId,
        content: systemMessage,
        message_type: 'text',
        is_read: true
      });
      
      fetchChannelMessages(channelId);
    } catch (err) {
      console.error('Failed to toggle block:', err);
    }
  };

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Load channels and DMs
  useEffect(() => {
    if (!currentUser) return;
    loadChannelsAndDMs();
  }, [currentUser]);

  const loadChannelsAndDMs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      console.log('[Chat] current authenticated user id:', user.id);

      // Fetch classes where teacher_id contains current user
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*, courses(course_code, name)')
        .eq('teacher_id', user.id)

      console.log('[Chat] classes:', classesData, classesError)
      setChannels(classesData || [])

      let allStudentIds: string[] = []
      classesData?.forEach((c: any) => {
        if (c.student_ids) {
          allStudentIds = [...allStudentIds, ...c.student_ids]
        }
      })
      
      // Also include anyone the teacher has exchanged DMs with
      const { data: dmHistory } = await supabase
        .from('direct_messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
      if (dmHistory) {
        dmHistory.forEach(dm => {
          if (dm.sender_id !== user.id) allStudentIds.push(dm.sender_id);
          if (dm.receiver_id !== user.id) allStudentIds.push(dm.receiver_id);
        });
      }
      
      allStudentIds = [...new Set(allStudentIds.filter(Boolean))]
      console.log('[Chat] unique student ids for teacher DM list:', allStudentIds);

      let groupedStudents: any[] = []

      if (allStudentIds.length > 0) {
        console.log('[Chat] fetch users chunks:', allStudentIds.length);
        let studentsData = await fetchUsersInChunks(allStudentIds);

        // Get unread counts
        const { data: unreadData } = await supabase
          .from('direct_messages')
          .select('sender_id')
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        const unreadCounts = unreadData?.reduce((acc: any, curr: any) => {
          acc[curr.sender_id] = (acc[curr.sender_id] || 0) + 1;
          return acc;
        }, {}) || {};

        // Group by class
        classesData?.forEach((c: any) => {
          if (c.student_ids && c.student_ids.length > 0) {
            const channelName = c.name || c.title || c.class_name || 'Unnamed Class';
            const courseCode = c.course_code || c.courses?.course_code || c.code || '';
            const className = courseCode ? `${courseCode}_${channelName}` : channelName;

            c.student_ids.forEach((sid: string) => {
              const studentInfo = studentsData.find(s => s.id === sid);
              if (studentInfo) {
                groupedStudents.push({
                  ...studentInfo,
                  class_name: className,
                  unreadCount: unreadCounts[studentInfo.id] || 0
                });
              }
            });
          }
        });
      }
      setDmList(groupedStudents)
      setLoading(false);
    } catch (err) {
      console.error('Failed to load channels and DMs:', err);
      setLoading(false);
    }
  };

  const fetchChannelMessages = async (channelId: string) => {
    try {
      // Fetch messages without join
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('class_id', channelId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Failed to fetch messages:', error);
        return;
      }

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])]

      // Fetch senders separately
      const sendersMap: Record<string, any> = {}
      if (senderIds.length > 0) {
        const users = await fetchUsersInChunks(senderIds);
        users.forEach(s => { sendersMap[s.id] = s });
      }

      const enriched = messagesData?.map(m => ({
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

      const realMessages = enriched.filter(m =>
        !m.content?.startsWith('[SYSTEM_BLOCK:') && !m.content?.startsWith('[SYSTEM_UNBLOCK:')
      );

      setMessages(realMessages);
    } catch (err) {
      console.error('Failed to fetch channel messages:', err);
    }
  };

  const fetchDMMessages = async (teacherId: string) => {
    try {
      // Fetch DM messages
      const { data: messagesData, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch DM messages:', error);
        return;
      }

      // Mark received messages as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', teacherId);

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];

      // Fetch senders separately
      const sendersMap: Record<string, any> = {}
      if (senderIds.length > 0) {
        const users = await fetchUsersInChunks(senderIds);
        users.forEach(s => { sendersMap[s.id] = s });
      }

      // Merge sender info
      const allEnrichedMessages = messagesData?.map(m => ({
        ...m,
        sender: {
          id: m.sender_id,
          full_name: getSenderNameFallback(sendersMap[m.sender_id], currentUser?.id, m.sender_id)
        }
      })) || [];

      // Filter messages for the selected DM
      const enrichedMessages = allEnrichedMessages.filter(
        m => (m.sender_id === currentUser.id && m.receiver_id === teacherId) ||
             (m.sender_id === teacherId && m.receiver_id === currentUser.id)
      );

      setMessages(enrichedMessages);
    } catch (err) {
      console.error('Failed to fetch DM messages:', err);
    }
  };

  // Handle channel selection
  useEffect(() => {
    if (selectedChannel && !selectedDM) {
      setMessages([]);
      fetchChannelMessages(selectedChannel.id);

      const fetchMembers = async () => {
        const studentIds = selectedChannel.student_ids || [];
        const teacherId = selectedChannel.teacher_id;
        const memberIds = [...new Set([...studentIds, teacherId].filter(Boolean))];

        if (memberIds.length > 0) {
          const usersData = await fetchUsersInChunks(memberIds);
          setChannelMembers(usersData || []);
        } else {
          setChannelMembers([]);
        }
      };
      fetchMembers();

      // Set up polling
      pollIntervalRef.current = setInterval(() => {
        fetchChannelMessages(selectedChannel.id);
      }, 5000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [selectedChannel]);

  // Handle DM selection
  useEffect(() => {
    if (selectedDM && !selectedChannel) {
      console.log('[Chat] selected DM target:', selectedDM.id);
      setMessages([]);
      fetchDMMessages(selectedDM.id);

      // Set up polling
      pollIntervalRef.current = setInterval(() => {
        fetchDMMessages(selectedDM.id);
      }, 5000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [selectedDM, currentUser]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, dmMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 52428800) {
      alert('File size exceeds 50MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const sendMessage = async () => {
    if (!currentUser || (!newMessage.trim() && !selectedFile)) {
      alert('Please enter a message or select a file.');
      return;
    }

    if (!selectedChannel && !selectedDM) {
      alert('Please select a channel or direct message.');
      return;
    }

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;
      let fileSize: number | null = null;
      let messageType: 'text' | 'file' | 'image' = 'text';

      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop();
        const timestamp = new Date().getTime();
        const path = selectedChannel
          ? `${selectedChannel.id}/${timestamp}.${ext}`
          : `dm_${selectedDM?.id}_${timestamp}.${ext}`;

        const { error: uploadError } = await supabase.storage
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

      if (selectedChannel) {
        await supabase.from('messages').insert({
          class_id: selectedChannel.id,
          sender_id: currentUser.id,
          content: finalContent,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          message_type: messageType
        });
      } else if (selectedDM) {
        await supabase.from('direct_messages').insert({
          sender_id: currentUser.id,
          receiver_id: selectedDM.id,
          content: finalContent,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          message_type: messageType,
          is_read: false
        });
      }

      setNewMessage('');
      removeFile();
      setReplyTo(null);

      if (selectedChannel) await fetchChannelMessages(selectedChannel.id);
      if (selectedDM) await fetchDMMessages(selectedDM.id);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleUnsendMessage = async (messageId: string, isChannel: boolean) => {
    if (!window.confirm('Are you sure you want to unsend this message? It will be removed for everyone.')) return;
    try {
      const table = isChannel ? 'messages' : 'direct_messages';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', messageId)
        .eq('sender_id', currentUser.id);
        
      if (error) throw error;
      
      if (selectedChannel) await fetchChannelMessages(selectedChannel.id);
      if (selectedDM) await fetchDMMessages(selectedDM.id);
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
        const filtered = channelMembers.filter(m =>
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

  // Filter channels and DMs
  const filteredChannels = channels.filter(c => {
    const channelName = c.name || c.title || c.class_name || 'Unnamed Class';
    const courseCode = c.course_code || c.code || '';
    const displayName = courseCode ? `${courseCode}_${channelName}` : channelName;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredDMs = dmList.filter(d =>
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dmsByClass = filteredDMs.reduce((acc, curr) => {
    const cname = curr.class_name || 'Other';
    if (!acc[cname]) acc[cname] = [];
    acc[cname].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9f8fa]">
        <p className="text-[#94a3b8]">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className={`w-full md:w-[280px] shrink-0 bg-[#f6f2fb] border-r border-[#e7dff0] flex-col overflow-hidden ${(selectedChannel || selectedDM) ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-2 p-4 border-b border-[#e7dff0]">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 text-[#6a5182] hover:bg-[#ede9f5] px-3 py-2 rounded-xl transition text-sm font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
        {/* Search Bar */}
        <div className="p-4 border-b border-[#e7dff0]">
          <input
            type="text"
            placeholder="Search Channels or Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#e7dff0] rounded-lg text-[13px] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6a5182] focus:ring-opacity-30"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Channels Section */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Channels <span className="bg-[#e7dff0] text-[#6a5182] px-1.5 rounded-sm text-[10px] ml-2">{filteredChannels.length}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {filteredChannels.length === 0 ? (
                <p className="text-[12px] text-[#94a3b8]">No channels found</p>
              ) : (
                filteredChannels.map(channel => {
                  const channelName = channel.name || channel.title || channel.class_name || 'Unnamed Class';
                  const courseCode = channel.course_code || channel.code || '';
                  const displayName = courseCode ? `${courseCode}_${channelName}` : channelName;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        setSelectedDM(null);
                      }}
                      className={`text-left px-3 py-2 rounded-lg text-[13px] truncate transition-colors border-l-2 ${selectedChannel?.id === channel.id
                          ? 'bg-[#ede9f5] border-[#6a5182] text-[#6a5182] font-semibold'
                          : 'border-transparent text-[#64748b] hover:bg-[#ede9f5]/50'
                        }`}
                    >
                      <span className="mr-2">💬</span>
                      {displayName}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div className="px-4 py-4 border-t border-[#e7dff0]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Direct Messages <span className="bg-[#e7dff0] text-[#6a5182] px-1.5 rounded-sm text-[10px] ml-2">{filteredDMs.length}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {filteredDMs.length === 0 ? (
                <p className="text-[12px] text-[#94a3b8]">No students found</p>
              ) : (
                Object.entries(dmsByClass).map(([className, students]) => (
                  <div key={className} className="mb-3">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1 pl-2">{className}</p>
                    <div className="flex flex-col gap-1">
                      {students.map(dm => (
                        <button
                          key={`${className}-${dm.id}`}
                          onClick={() => {
                            setSelectedDM(dm);
                            setSelectedChannel(null);
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-[13px] flex items-center gap-2 transition-colors border-l-2 ${selectedDM?.id === dm.id
                              ? 'bg-[#ede9f5] border-[#6a5182] text-[#6a5182] font-semibold'
                              : 'border-transparent text-[#64748b] hover:bg-[#ede9f5]/50'
                            }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[10px] font-bold text-[#6a5182] shrink-0">
                            {getInitials(dm.full_name)}
                          </div>
                          <div className="flex-1 flex justify-between items-center min-w-0">
                            <span className="truncate">{dm.full_name}</span>
                            {dm.unreadCount > 0 && (
                              <span className="bg-[#e11d48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                {dm.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col min-w-0 ${!(selectedChannel || selectedDM) ? 'hidden md:flex' : 'flex'}`}>
        {selectedChannel || selectedDM ? (
          <>
            {/* Header */}
            <div className="border-b border-[#e7dff0] bg-white px-4 md:px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedChannel(null);
                      setSelectedDM(null);
                    }}
                    className="md:hidden mr-1 p-1 -ml-2 rounded hover:bg-[#f6f2fb] text-[#64748b] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {selectedChannel ? (
                    <>
                      <span className="text-[18px]">💬</span>
                      <h2 className="text-[18px] font-bold text-[#4b3f68]">
                        {(() => {
                          const channelName = selectedChannel.name || selectedChannel.title || selectedChannel.class_name || 'Unnamed Class';
                          const courseCode = selectedChannel.course_code || selectedChannel.code || '';
                          return courseCode ? `${courseCode}_${channelName}` : channelName;
                        })()}
                      </h2>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[12px] font-bold text-[#6a5182]">
                        {getInitials(selectedDM?.full_name)}
                      </div>
                      <div>
                        <h2 className="text-[18px] font-bold text-[#4b3f68]">{selectedDM?.full_name}</h2>
                        <p className="text-[11px] text-[#94a3b8] font-semibold">Student</p>
                      </div>
                    </>
                  )}
                </div>
                {selectedChannel && (
                  <button
                    onClick={() => setShowMembersPanel(true)}
                    className="text-[12px] text-[#6a5182] hover:underline cursor-pointer text-left mt-1 block"
                  >
                    👥 {selectedChannel?.student_ids?.length || 0} members · Click to view
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {(() => {
                const currentMessages = selectedChannel ? messages : dmMessages;
                if (currentMessages.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-[16px] font-semibold text-[#4b3f68]">
                        {selectedChannel ? 'No messages yet. Start the conversation!' : 'No direct messages yet.'}
                      </p>
                    </div>
                  );
                }
                return (
                  <>
                    {currentMessages.map((message, idx) => {
                      const isOwnMessage = message.sender_id === currentUser?.id;
                      const showDateDivider =
                        idx === 0 ||
                        getDateDivider(currentMessages[idx - 1]?.created_at) !==
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

                        <div className={`flex gap-2 group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          {!isOwnMessage && (
                            <div className="flex flex-col gap-1">
                              <div className="w-8 h-8 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[11px] font-bold text-[#6a5182] shrink-0">
                                {getInitials(message.sender?.full_name)}
                              </div>
                            </div>
                          )}

                          <div className={`flex flex-col gap-1 max-w-xs ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            {!isOwnMessage && (
                              <p className="text-[11px] font-semibold text-[#6a5182] px-2">
                                {message.sender?.full_name || 'Unknown'}
                              </p>
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
                                    channelMembers
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
                                  onClick={() => handleUnsendMessage(message.id, !!selectedChannel)}
                                  className="text-[#ef4444] hover:scale-110 transition-all"
                                  title="Unsend Message"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {isOwnMessage && <div className="w-8 shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              );
              })()}
            </div>

            {/* Input Area */}
            {selectedChannel && JSON.parse(localStorage.getItem(`chat_blocked_${selectedChannel.id}`) || '[]').includes(currentUser?.id) ? (
              <div className="border-t border-[#e7dff0] bg-white p-4 text-center">
                <p className="text-[#e11d48] font-semibold text-[13px]">You have been removed from this chat</p>
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
                  {/* Mentions Dropdown */}
                  {showMentions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-[#e7dff0] rounded-xl shadow-lg flex flex-col w-64 overflow-hidden z-10">
                      {mentionSuggestions.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleMentionClick(user)}
                          className="flex items-center gap-2 p-3 hover:bg-[#f6f2fb] transition-colors text-left border-b border-[#e7dff0] last:border-0"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[10px] font-bold text-[#6a5182] shrink-0">
                            {getInitials(user.full_name)}
                          </div>
                          <span className="text-[13px] font-medium text-[#4b3f68] break-words leading-tight pr-2">{user.full_name}</span>
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
                    className="px-3 py-2 text-[#6a5182] hover:bg-[#f6f2fb] rounded-xl transition-colors flex items-center justify-center"
                    title="Attach file"
                  >
                    <Paperclip size={20} />
                  </button>

                  <textarea
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedChannel ? `Message #${selectedChannel.name || selectedChannel.title || selectedChannel.class_name || 'Unnamed Class'}` : `Message @${selectedDM?.full_name}`}
                    className="flex-1 bg-[#f6f2fb] border border-[#e7dff0] rounded-xl px-4 py-2 text-[13px] placeholder-[#94a3b8] text-[#4b3f68] focus:outline-none focus:ring-2 focus:ring-[#6a5182] focus:ring-opacity-30 resize-none"
                    rows={2}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className="px-4 py-2 bg-[#6a5182] text-white rounded-xl hover:bg-[#5b4471] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    ➤
                  </button>
                </div>

                {selectedFile && (
                  <div className="mt-3 bg-[#f6f2fb] rounded-xl p-3 flex items-center gap-3 border border-[#e7dff0]">
                    <span className="text-lg">📄</span>
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
              </div>
            )}
          </>
        ) : (
          // No selection state
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-[18px] font-semibold text-[#4b3f68]">Select a channel or start a direct message</p>
            <p className="text-[14px] text-[#94a3b8] mt-2">Choose from the list on the left to begin</p>
          </div>
        )}
      </div>

      {/* Members Panel */}
      {showMembersPanel && selectedChannel && (
        <div className="w-72 bg-[#f9f8fa] border-l border-[#e7dff0] flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-[#e7dff0] flex items-center justify-between">
            <h3 className="font-bold text-[#4b3f68]">Members ({channelMembers.length})</h3>
            <button onClick={() => setShowMembersPanel(false)} className="text-[#94a3b8] hover:text-[#4b3f68] font-bold">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {/* Teacher */}
            <div>
              <p className="text-[11px] font-bold text-[#64748b] mb-3 uppercase tracking-wider">Teacher</p>
              {channelMembers.filter(m => m.id === selectedChannel.teacher_id).map(teacher => (
                <div key={teacher.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[11px] font-bold text-[#6a5182] shrink-0">
                      {getInitials(teacher.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#4b3f68] break-words leading-tight">{teacher.full_name}</p>
                      <p className="text-[11px] text-[#6a5182] font-semibold bg-[#ede9f5] inline-block px-1.5 rounded-sm mt-0.5">Admin</p>
                    </div>
                  </div>
                  {currentUser?.id !== teacher.id && (
                    <button
                      onClick={() => {
                        setSelectedChannel(null);
                        setSelectedDM({ id: teacher.id, full_name: teacher.full_name, email: teacher.email });
                      }}
                      className="hidden group-hover:block text-[11px] text-[#6a5182] font-semibold bg-[#ede9f5] px-2 py-1 rounded"
                    >
                      Message
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Students */}
            <div>
              <p className="text-[11px] font-bold text-[#64748b] mb-3 uppercase tracking-wider">Students</p>
              <div className="flex flex-col gap-4">
                {channelMembers.filter(m => m.id !== selectedChannel.teacher_id).map(student => (
                  <div key={student.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#d8c8e9] flex items-center justify-center text-[11px] font-bold text-[#6a5182] shrink-0">
                        {getInitials(student.full_name)}
                      </div>
                      <p className="text-[13px] font-medium text-[#4b3f68] break-words leading-tight">{student.full_name}</p>
                    </div>
                    {currentUser?.id !== student.id && (
                      <div className="relative shrink-0 ml-2">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                          className="text-[#64748b] hover:bg-[#ede9f5] p-1 rounded font-bold transition-colors"
                        >
                          ⋮
                        </button>
                        {openMenuId === student.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#e7dff0] rounded-lg shadow-lg z-10 py-1">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedChannel(null);
                                setSelectedDM({ id: student.id, full_name: student.full_name, email: student.email });
                              }}
                              className="w-full text-left px-4 py-2 text-[12px] text-[#4b3f68] hover:bg-[#f6f2fb]"
                            >
                              Message
                            </button>
                            {(() => {
                              const isBlocked = blockedUsers.includes(student.id);
                              
                              return (
                                <button
                                  onClick={() => {
                                    handleToggleBlock(student.id, selectedChannel.id);
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-[12px] ${isBlocked ? 'text-[#16a34a] hover:bg-[#f0fdf4]' : 'text-[#e11d48] hover:bg-[#fef2f2]'}`}
                                >
                                  {isBlocked ? 'Unblock Student' : 'Block Student'}
                                </button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
