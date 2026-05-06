import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
// Assuming you have an auth context, if not, we use a placeholder or check Supabase auth
// import { useAuth } from './AuthProvider'; 

export interface Notification {
  id: string;
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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID (adjust this based on how your app stores auth)
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch initial notifications and subscribe to realtime
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('teacher_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mapped = (data || []).map((n: any) => ({
          ...n,
          is_read: false
        }));
        setNotifications(mapped);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up Supabase Realtime subscription
    const channel = supabase
      .channel(`notifications:teacher_id=eq.${userId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `teacher_id=eq.${userId}` 
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = { ...payload.new, is_read: false } as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) => 
              prev.map((n) => (n.id === payload.new.id ? { ...n, ...payload.new, is_read: n.is_read } : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => 
      prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
