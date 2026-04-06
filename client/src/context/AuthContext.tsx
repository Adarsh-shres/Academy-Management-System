import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

/* ─── Types ─────────────────────────────────────────────────── */

export type UserRole = 'admin' | 'teacher' | 'guest';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Mock credentials ──────────────────────────────────────── */

const MOCK_USERS: (AuthUser & { password: string })[] = [
  { email: 'admin@school.edu',   password: 'admin123',   name: 'Super Admin',    role: 'admin' },
  { email: 'teacher@school.edu', password: 'teacher123', name: 'Dr. Ramesh Kumar', role: 'teacher' },
];

/* ─── Provider ──────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((email: string, password: string): boolean => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser({ email: found.email, name: found.name, role: found.role });
      return true;
    }
    // For demo: allow any input to login as admin
    setUser({ email, name: 'Super Admin', role: 'admin' });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
