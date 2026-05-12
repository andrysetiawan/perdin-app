import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/presentation/context/AuthContext';
import { NotificationProvider } from '@/presentation/context/NotificationContext';

/**
 * Configured QueryClient with sensible defaults:
 * - staleTime: 5 minutes (data considered fresh for 5 min)
 * - retry: 1 attempt on failure
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
      refetchOnReconnect: false,   // Don't refetch on network reconnect
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders wraps the application with all required context providers:
 * 1. QueryClientProvider — server state management
 * 2. AuthProvider — authentication state
 * 3. NotificationProvider — toast notifications
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
