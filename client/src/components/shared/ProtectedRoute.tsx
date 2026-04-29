import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_ROUTE_MAP } from '../../lib/routes';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

/** Guards routes by auth state and allowed roles. */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

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
            Loading...
          </span>

          {/* Keep the loading animation self-contained. */}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const correctRoute = ROLE_ROUTE_MAP[user.role] ?? '/login';
    return <Navigate to={correctRoute} replace />;
  }

  return <>{children}</>;
}
