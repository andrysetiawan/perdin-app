import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { AuthLayout } from '@/presentation/layouts/AuthLayout';
import { DashboardLayout } from '@/presentation/layouts/DashboardLayout';
import { AuthGuard } from '@/presentation/components/guards/AuthGuard';
import { RoleGuard } from '@/presentation/components/guards/RoleGuard';
import { GuestGuard } from '@/presentation/components/guards/GuestGuard';
import { ErrorBoundary } from '@/presentation/components/ErrorBoundary';
import { ApiErrorListener } from '@/presentation/components/ApiErrorListener';
import { GlobalNotifications } from '@/presentation/components/GlobalNotifications';
import { AppProviders } from '@/presentation/app/providers';
import { LoginPage } from '@/presentation/pages/login/LoginPage';
import { DashboardOverview } from '@/presentation/pages/dashboard/DashboardOverview';
import { TravelFormPage } from '@/presentation/pages/travels/TravelFormPage';
import { TravelListPage } from '@/presentation/pages/travels/TravelListPage';
import { UserListPage } from '@/presentation/pages/users/UserListPage';
import { RoleListPage } from '@/presentation/pages/roles/RoleListPage';
import { CityListPage } from '@/presentation/pages/cities/CityListPage';
import { ProfilePage } from '@/presentation/pages/profile/ProfilePage';

/**
 * Root layout that wraps all routes with application providers.
 * This ensures AuthContext, NotificationContext, and QueryClient
 * are available to all route components including guards.
 * Also includes the app-level ErrorBoundary and ApiErrorListener.
 */
function RootLayout() {
  return (
    <ErrorBoundary level="app">
      <AppProviders>
        <ApiErrorListener />
        <GlobalNotifications />
        <Outlet />
      </AppProviders>
    </ErrorBoundary>
  );
}

/**
 * Application router with route guards per the routing table:
 * - /login: Guest only (redirects authenticated users to /)
 * - Protected routes wrapped with AuthGuard
 * - Admin-only routes additionally wrapped with RoleGuard
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Guest-only route (login)
      {
        element: (
          <GuestGuard>
            <AuthLayout />
          </GuestGuard>
        ),
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
        ],
      },
      // Protected routes (require authentication)
      {
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: '/',
            element: (
              <ErrorBoundary level="page">
                <DashboardOverview />
              </ErrorBoundary>
            ),
          },
          {
            path: '/travels',
            element: (
              <ErrorBoundary level="page">
                <TravelListPage />
              </ErrorBoundary>
            ),
          },
          {
            path: '/travels/new',
            element: (
              <ErrorBoundary level="page">
                <TravelFormPage />
              </ErrorBoundary>
            ),
          },
          {
            path: '/travels/:id/edit',
            element: (
              <ErrorBoundary level="page">
                <TravelFormPage />
              </ErrorBoundary>
            ),
          },
          {
            path: '/users',
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <ErrorBoundary level="page">
                  <UserListPage />
                </ErrorBoundary>
              </RoleGuard>
            ),
          },
          {
            path: '/roles',
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <ErrorBoundary level="page">
                  <RoleListPage />
                </ErrorBoundary>
              </RoleGuard>
            ),
          },
          {
            path: '/cities',
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <ErrorBoundary level="page">
                  <CityListPage />
                </ErrorBoundary>
              </RoleGuard>
            ),
          },
          {
            path: '/profile',
            element: (
              <ErrorBoundary level="page">
                <ProfilePage />
              </ErrorBoundary>
            ),
          },
        ],
      },
      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
