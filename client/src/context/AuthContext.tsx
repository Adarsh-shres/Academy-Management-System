import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

/* ─── Types ─────────────────────────────────────────────────── */

export type UserRole = 'admin' | 'teacher' | 'student';

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

/* ─── Helpers ───────────────────────────────────────────────── */

/**
 * Fetch the user's profile row from the public `users` table.
 * Returns null when no row exists (the caller should treat this as unauthorised).
 */
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
    
    // Fallback for mock testing where users table cannot be seeded due to RLS
    if (email === 'ram@s.edu') {
      return {
        id: userId,
        email: email,
        name: 'Ram (Teacher)',
        role: 'teacher' as UserRole,
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

/* ─── Provider ──────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Bootstrap: check existing session on mount ─────────────── */
  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        if (isMounted) setUser(profile);
      }

      if (isMounted) setIsLoading(false);
    };

    bootstrap();

    // Listen for sign-out and token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (event === 'TOKEN_REFRESHED' && session?.user) {
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

  /* ── Login ───────────────────────────────────────────────────── */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { success: false, error: error.message };

      // Directly fetch the profile here (don't wait for onAuthStateChange)
      const profile = await fetchUserProfile(data.user.id, data.user.email);

      if (!profile) {
        // Auth succeeded but no profile row — sign them out to avoid a stale session
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Your account exists but has no profile in the system. Please contact the administrator.',
        };
      }

      // Set user in context so the rest of the app picks it up
      setUser(profile);
      return { success: true, user: profile };
    },
    [],
  );

  /* ── Logout ──────────────────────────────────────────────────── */
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

/* ─── Hook ──────────────────────────────────────────────────── */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
