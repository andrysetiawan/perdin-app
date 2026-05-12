import { Navigate } from 'react-router-dom';

import { useAuthContext } from '@/presentation/context/AuthContext';
import { tokenStore } from '@/data/api/client';
import { hasRole } from '@/domain/rules/role-permissions';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * RoleGuard restricts access by role and redirects unauthorized users.
 * - If user has no roles or roles array is empty, redirects to /login and clears token store (Requirement 12.5).
 * - If user doesn't have a required role, redirects to fallbackPath (default "/") (Requirement 12.2).
 * - Role comparison is case-insensitive via hasRole from domain rules.
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallbackPath = '/',
}: RoleGuardProps) {
  const { state } = useAuthContext();

  const userRoles = state.user?.roles?.map((r) => r.name) ?? [];

  // If user has no roles or roles array is empty, redirect to login and clear tokens (Requirement 12.5)
  if (userRoles.length === 0) {
    tokenStore.clear();
    return <Navigate to="/login" replace />;
  }

  // Check if user has at least one of the allowed roles (case-insensitive)
  const isAuthorized = allowedRoles.some((allowedRole) =>
    hasRole(userRoles, allowedRole),
  );

  if (!isAuthorized) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
