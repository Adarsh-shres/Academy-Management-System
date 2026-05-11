import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id?: string;
  class_id?: string;
  teacher_id?: string;
  assignment_id?: string;
  title?: string;
  message: string;
  type: string;
  is_read?: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isLoading: boolean;
  latestNotification: Notification | null;
  clearLatestNotification: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─── Helper: filter rows that belong to this user ─────────────────────────────

function isNotificationForUser(row: any, currentUserId: string): boolean {
  // The notifications table has user_id (recipient) and teacher_id (sender).
  // A teacher sees notifications where they are the recipient (user_id) OR
  // where teacher_id matches (notifications they sent — useful for tracking).
  // Most importantly, user_id is the actual recipient column.
  return row.user_id === currentUserId || row.teacher_id === currentUserId;
}

function mapRow(n: any): Notification {
  return {
    id: n.id,
    user_id: n.user_id ?? undefined,
    class_id: n.class_id ?? undefined,
    teacher_id: n.teacher_id ?? undefined,
    assignment_id: n.assignment_id ?? undefined,
    title: n.title ?? 'Notification',
    message: n.message,
    type: n.type ?? 'announcement',
    is_read: n.is_read ?? false,
    created_at: n.created_at,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  // ── Auth tracking ───────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      if (!session) setNotifications([]);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Fetch + realtime ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Fetch all notifications, no .or() filter — avoids 400 from non-existent columns
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('notifications schema:', data?.slice(0, 2), error);

        if (error) throw error;

        // Client-side filter: only keep rows where user_id or teacher_id matches
        const filtered = (data || []).filter((n: any) => isNotificationForUser(n, userId));
        setNotifications(filtered.map(mapRow));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Realtime: listen for new rows on the notifications table
    const channel = supabase
      .channel(`notif-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const row = (payload.new ?? {}) as any;

          if (!isNotificationForUser(row, userId)) return;

          const normalised = mapRow(row);

          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [normalised, ...prev]);
            setLatestNotification(normalised);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === normalised.id ? normalised : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old?.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      // Mark all where user is the recipient
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (err) {
      console.error('markAllAsRead error:', err);
    }
  }, [userId]);

  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading,
        latestNotification,
        clearLatestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
