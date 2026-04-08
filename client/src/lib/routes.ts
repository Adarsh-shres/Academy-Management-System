import type { UserRole } from '../context/AuthContext';

/**
 * Single source of truth: maps each role to its default dashboard route.
 * Used for post-login redirects and for ProtectedRoute mismatch redirects.
 */
export const ROLE_ROUTE_MAP: Record<UserRole, string> = {
  admin:   '/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};
