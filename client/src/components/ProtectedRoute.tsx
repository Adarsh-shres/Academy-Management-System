import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTE_MAP } from '../lib/routes';
import type { UserRole } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Route guard that enforces authentication and role-based access.
 *
 * 1. While the auth state is loading → show a neutral spinner.
 * 2. If the user is not logged in   → redirect to /login.
 * 3. If logged in but role mismatch → redirect to the user's own dashboard.
 * 4. Otherwise                      → render the children normally.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  /* ── 1. Loading state ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
            Loading…
          </span>

          {/* Inline keyframes so no extra CSS file is needed */}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  /* ── 2. Not authenticated ────────────────────────────────────── */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  /* ── 3. Role mismatch → send to correct dashboard ────────────── */
  if (!allowedRoles.includes(user.role)) {
    const correctRoute = ROLE_ROUTE_MAP[user.role] ?? '/login';
    return <Navigate to={correctRoute} replace />;
  }

  /* ── 4. All checks passed ────────────────────────────────────── */
  return <>{children}</>;
}
