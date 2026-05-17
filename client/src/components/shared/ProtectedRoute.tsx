import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_ROUTE_MAP } from '../../lib/routes';
import { SkeletonBlock, SkeletonCard } from './Skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

/** Guards routes by auth state and allowed roles. */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-main-bg p-6">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
          <SkeletonBlock className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
          <SkeletonCard className="h-[420px]" />
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
