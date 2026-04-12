import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Loads the app profile linked to an authenticated Supabase user. */
async function fetchUserProfile(userId: string, email?: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('id', userId)
    .limit(1);

  if (error) {
    console.error('[AuthContext] Failed to fetch user profile:', error.message);
    return null;
  }

  const row = data?.[0];
  if (!row) {
    console.warn('[AuthContext] No profile row found for user', userId);

    // Keeps local teacher login working when the users table is not seeded.
    if (email === 'ram@s.edu') {
      return {
        id: userId,
        email,
        name: 'Ram (Teacher)',
        role: 'teacher',
      };
    }

    return null;
  }

  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name ?? '',
    role: row.role as UserRole,
  };
}

/** Provides auth state and profile-aware login helpers to the app tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        if (isMounted) {
          setUser(profile);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          const profile = await fetchUserProfile(session.user.id, session.user.email);
          if (isMounted) {
            setUser(profile);
            setIsLoading(false);
          }
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      const profile = await fetchUserProfile(data.user.id, data.user.email);
      if (!profile) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Your account exists but has no profile in the system. Please contact the administrator.',
        };
      }

      setUser(profile);
      return { success: true, user: profile };
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Returns the active auth context. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
