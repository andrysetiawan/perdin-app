import { useRef } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthContext } from '@/presentation/context/AuthContext';
import { LoadingSpinner } from '@/presentation/components/ui';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard wraps guest-only routes (e.g., login) and redirects
 * authenticated users to the dashboard.
 *
 * Only shows a loading spinner on the initial app load (before we know
 * if the user has stored tokens). Once the children have rendered at least
 * once, we never replace them with a spinner again — this prevents the
 * login form from being unmounted during a login attempt.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { state } = useAuthContext();
  const hasRenderedChildren = useRef(false);

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Only show loading spinner on initial app boot, before children ever rendered
  if (state.isLoading && !hasRenderedChildren.current) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  hasRenderedChildren.current = true;
  return <>{children}</>;
}
