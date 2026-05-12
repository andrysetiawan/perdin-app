import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/presentation/hooks/useAuth';
import { getNavigationLinks } from '@/domain/rules/navigation';

/**
 * DashboardLayout - Main application shell with sidebar navigation,
 * header (user name + role + logout), and content area.
 * Responsive: sidebar collapses to hamburger menu below 768px.
 */
export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roles = user?.roles.map((r) => r.name) ?? [];
  const navLinks = getNavigationLinks(roles);
  const primaryRole = roles[0] ?? 'User';

  const handleLogout = async () => {
    await logout();
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b px-4">
          <h1 className="text-lg font-bold text-gray-800">Perdin Dashboard</h1>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-base" aria-hidden="true">
                  {getIcon(link.icon)}
                </span>
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          {/* Hamburger menu button - visible below md */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden min-h-[44px] min-w-[44px]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Spacer for desktop (no hamburger) */}
          <div className="hidden md:block" />

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name ?? 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{primaryRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-[1920px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications are rendered globally via GlobalNotifications */}
    </div>
  );
}

/**
 * Maps icon identifiers from NavItem to emoji/text icons.
 */
function getIcon(icon: string): string {
  const icons: Record<string, string> = {
    dashboard: '📊',
    travel: '✈️',
    users: '👥',
    roles: '🔑',
    cities: '🏙️',
    profile: '👤',
  };
  return icons[icon] ?? '📄';
}
