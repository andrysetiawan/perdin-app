import { Navigate, useLocation } from 'react-router-dom';

import { useAuthContext } from '@/presentation/context/AuthContext';
import { LoadingSpinner } from '@/presentation/components/ui';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard wraps protected routes and redirects unauthenticated users to /login.
 * Re-evaluates on every route navigation via useLocation (Requirement 12.4).
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { state } = useAuthContext();
  // useLocation ensures re-evaluation on every route navigation
  useLocation();

  if (state.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
