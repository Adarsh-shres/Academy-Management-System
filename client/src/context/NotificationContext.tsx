import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'content' | 'update' | 'announcement';
  is_read: boolean;
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
        const res = await fetch(`http://localhost:5000/notifications/${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Notification[] = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('NotificationContext – fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Realtime: listen for new rows where user_id OR teacher_id matches
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
          const isForMe =
            row.user_id === userId || row.teacher_id === userId;

          if (!isForMe) return;

          // Normalise to the Notification interface
          const normalised: Notification = {
            id: row.id,
            user_id: row.user_id ?? row.teacher_id,
            title: row.title ?? 'Notification',
            message: row.message,
            type: row.type ?? 'announcement',
            is_read: row.is_read ?? false,
            created_at: row.created_at,
          };

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
      await fetch(`http://localhost:5000/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch(`http://localhost:5000/notifications/user/${userId}/read-all`, {
        method: 'PATCH',
      });
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
