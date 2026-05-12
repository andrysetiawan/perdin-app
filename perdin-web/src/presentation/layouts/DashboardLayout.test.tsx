import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardLayout } from './DashboardLayout';

// Mock useAuth hook
const mockLogout = vi.fn();
vi.mock('@/presentation/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      roles: [{ id: '1', name: 'Admin' }],
    },
    isAuthenticated: true,
    isLoading: false,
    accessToken: 'token',
    refreshToken: 'refresh',
    login: vi.fn(),
    logout: mockLogout,
    refreshTokens: vi.fn(),
  }),
}));

// Mock NotificationContext
vi.mock('@/presentation/context/NotificationContext', () => ({
  useNotificationContext: () => ({
    notifications: [],
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
  }),
}));

function renderDashboardLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<div>Dashboard Page</div>} />
          <Route path="/travels" element={<div>Travels Page</div>} />
          <Route path="/users" element={<div>Users Page</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders child route content via Outlet', () => {
    renderDashboardLayout('/');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('displays user name in the header', () => {
    renderDashboardLayout();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays user primary role in the header', () => {
    renderDashboardLayout();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders a logout button', () => {
    renderDashboardLayout();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    renderDashboardLayout();
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders navigation links based on user roles', () => {
    renderDashboardLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Travels')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('highlights the active navigation link', () => {
    renderDashboardLayout('/travels');
    const travelsLink = screen.getByText('Travels').closest('a');
    expect(travelsLink?.className).toContain('bg-blue-100');
  });

  it('does not highlight inactive navigation links', () => {
    renderDashboardLayout('/');
    const travelsLink = screen.getByText('Travels').closest('a');
    expect(travelsLink?.className).not.toContain('bg-blue-100');
  });

  it('renders a hamburger menu button', () => {
    renderDashboardLayout();
    expect(
      screen.getByRole('button', { name: /open navigation menu/i }),
    ).toBeInTheDocument();
  });

  it('renders the application title in the sidebar', () => {
    renderDashboardLayout();
    expect(screen.getByText('Perdin Dashboard')).toBeInTheDocument();
  });

  it('renders main navigation landmark', () => {
    renderDashboardLayout();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });
});
