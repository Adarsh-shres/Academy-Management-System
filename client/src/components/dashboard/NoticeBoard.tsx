import { useEffect, useState } from 'react';
import { Bell } from '../shared/icons';
import { supabase } from '../../lib/supabase';
import { sendRoleNotification } from '../../lib/notifications';
import { SkeletonBlock } from '../shared/Skeleton';

interface Notice {
  id: string;
  author: string;
  initials: string;
  time: string;
  text: string;
  createdAt: string;
}

type Status = { type: 'success' | 'error' | null; text: string };
type NoticeRecipient = 'student' | 'teacher' | 'both';

function getRelativeTime(dateStr?: string | null) {
  if (!dateStr) return 'Recently';

  const date = new Date(dateStr);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
}

export default function NoticeBoard({ compact = false }: { compact?: boolean }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canPost, setCanPost] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState<NoticeRecipient>('both');
  const [isPosting, setIsPosting] = useState(false);
  const [status, setStatus] = useState<Status>({ type: null, text: '' });
  const [viewer, setViewer] = useState<{ id: string | null; role: string | null }>({ id: null, role: null });

  const loadNotices = async (currentViewer = viewer) => {
    setIsLoading(true);

    let query = supabase
      .from('notifications')
      .select('id, title, message, created_at')
      .eq('type', 'announcement')
      .gte('created_at', getPreviousMonthStart().toISOString())
      .order('created_at', { ascending: false });

    if (currentViewer.id && currentViewer.role !== 'admin' && currentViewer.role !== 'super_admin') {
      query = query.eq('user_id', currentViewer.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading notices:', error);
      setNotices([]);
      setIsLoading(false);
      return;
    }

    const seen = new Set<string>();
    const uniqueNotices = (data ?? []).reduce<Notice[]>((items, notice: any) => {
      const noticeTitle = notice.title || 'Admin';
      const noticeText = notice.message || notice.title || 'New notice posted.';
      const key = `${noticeTitle.trim()}::${noticeText.trim()}`;

      if (seen.has(key)) return items;
      seen.add(key);

      const author = 'Admin';
      items.push({
        id: notice.id,
        author,
        initials: author.substring(0, 2).toUpperCase(),
        time: getRelativeTime(notice.created_at),
        text: noticeText,
        createdAt: notice.created_at,
      });

      return items;
    }, []);

    setNotices(uniqueNotices);
    setIsLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    async function initializeBoard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let currentViewer = { id: user?.id ?? null, role: null as string | null };

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role ?? null;
        currentViewer = { id: user.id, role };

        if (mounted) {
          setViewer(currentViewer);
          setCanPost(role === 'admin' || role === 'super_admin');
        }
      }

      if (mounted) {
        await loadNotices(currentViewer);
      }
    }

    initializeBoard();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePostNotice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPost || !title.trim() || !message.trim()) return;

    setIsPosting(true);
    setStatus({ type: null, text: '' });

    const noticeTitle = title.trim();
    const noticeMessage = message.trim();

    try {
      if (recipient === 'both') {
        await Promise.all([
          sendRoleNotification('student', noticeTitle, noticeMessage),
          sendRoleNotification('teacher', noticeTitle, noticeMessage),
        ]);
      } else {
        await sendRoleNotification(recipient, noticeTitle, noticeMessage);
      }

      if (viewer.id) {
        const { error: selfNoticeError } = await supabase.from('notifications').insert({
          user_id: viewer.id,
          title: noticeTitle,
          message: noticeMessage,
          type: 'announcement',
          is_read: true,
          teacher_id: viewer.id,
          created_at: new Date().toISOString(),
        });

        if (selfNoticeError) {
          throw new Error(selfNoticeError.message);
        }
      }

      setTitle('');
      setMessage('');
      setRecipient('both');
      setStatus({ type: 'success', text: 'Notice posted and notifications sent.' });
      await loadNotices();
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to post notice.';
      setStatus({ type: 'error', text });
    } finally {
      setIsPosting(false);
    }
  };

  const recentNotices = notices.slice(0, 2);

  return (
    <section className="bg-white border border-[#e7dff0] rounded-[10px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
      <div className="bg-[#6a5182] text-white px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-white/15 flex items-center justify-center">
            <Bell size={18} />
          </div>
          <h2 className="font-sans text-[17px] font-bold tracking-tight">Notice Board</h2>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#efe8f5]">Latest</span>
      </div>

      <div className={`flex flex-col ${compact ? 'p-4 gap-3' : 'p-5 gap-4'}`}>
        {canPost && (
          <form onSubmit={handlePostNotice} className="rounded-[8px] border border-[#e7dff0] bg-[#fbf8fe] p-4 flex flex-col gap-3">
            {status.type && (
              <div className={`rounded-[6px] border px-3 py-2 text-[12.5px] font-semibold ${
                status.type === 'success'
                  ? 'border-green-100 bg-green-50 text-green-700'
                  : 'border-red-100 bg-red-50 text-red-700'
              }`}>
                {status.text}
              </div>
            )}

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Notice title"
              className="w-full rounded-[7px] border border-[#e2d9ed] bg-white px-3 py-2 text-[13px] font-semibold text-[#4b3f68] outline-none transition-colors placeholder:text-[#a0a8b5] focus:border-primary"
            />
            <select
              value={recipient}
              onChange={(event) => setRecipient(event.target.value as NoticeRecipient)}
              className="w-full rounded-[7px] border border-[#e2d9ed] bg-white px-3 py-2 text-[13px] font-semibold text-[#4b3f68] outline-none transition-colors focus:border-primary"
            >
              <option value="both">Students and teachers</option>
              <option value="student">Students only</option>
              <option value="teacher">Teachers only</option>
            </select>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`Write a notice for ${
                recipient === 'both' ? 'students and teachers' : recipient === 'student' ? 'students' : 'teachers'
              }...`}
              rows={3}
              className="w-full rounded-[7px] border border-[#e2d9ed] bg-white px-3 py-2 text-[13px] text-[#475569] outline-none transition-colors placeholder:text-[#a0a8b5] focus:border-primary resize-none"
            />
            <button
              type="submit"
              disabled={isPosting || !title.trim() || !message.trim()}
              className="self-end rounded-[7px] bg-primary px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPosting ? 'Posting...' : 'Post Notice'}
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        ) : notices.length > 0 ? (
          <>
            {recentNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
            {notices.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllNotices(true)}
                className="self-end rounded-[7px] border border-[#e2d9ed] bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[#4b3f68] transition-colors hover:bg-[#f3eff7]"
              >
                View More
              </button>
            )}
          </>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[#e7dff0] bg-[#fbf8fe] p-7 text-center">
            <p className="text-[13px] font-bold uppercase tracking-wide text-[#4b3f68]">No notices posted</p>
            <p className="mt-1 text-[12.5px] text-[#64748b]">New academy notices will appear here.</p>
          </div>
        )}
      </div>

      {showAllNotices && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6" onClick={() => setShowAllNotices(false)}>
          <div className="my-8 w-full max-w-[620px] overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 border-b border-[#e7dff0] bg-[#fbf8fe] px-5 py-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#4b3f68]">All Notices</h3>
                <p className="mt-0.5 text-[12.5px] font-medium text-[#7c8697]">Posted this month and previous month</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllNotices(false)}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#e7dff0] bg-white text-[#7c8697] transition-colors hover:text-[#4b3f68]"
                aria-label="Close notices"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-5">
              {notices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} showDate />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function getPreviousMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

function NoticeCard({ notice, showDate = false }: { notice: Notice; showDate?: boolean }) {
  return (
    <article className="flex gap-4 rounded-[8px] border border-[#e7dff0] bg-[#fbf8fe] p-4 border-l-[3px] border-l-primary">
      <div className="w-10 h-10 rounded-[8px] bg-primary text-white flex items-center justify-center shrink-0 text-[13px] font-bold">
        {notice.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-[14px] font-bold text-[#4b3f68] leading-tight">{notice.author}</h3>
          <span className="text-[11px] font-semibold text-[#94a3b8] whitespace-nowrap">
            {showDate
              ? new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : notice.time}
          </span>
        </div>
        <p className="text-[13px] text-[#475569] leading-relaxed">{notice.text}</p>
      </div>
    </article>
  );
}
