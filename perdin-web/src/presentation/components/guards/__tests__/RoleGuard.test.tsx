import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RoleGuard } from '../RoleGuard';

// Mock tokenStore
const mockClear = vi.fn();
vi.mock('@/data/api/client', () => ({
  tokenStore: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clear: () => mockClear(),
  },
}));

// Mock the AuthContext
const mockState = {
  user: null as any,
  accessToken: 'token',
  refreshToken: 'refresh',
  isAuthenticated: true,
  isLoading: false,
};

vi.mock('@/presentation/context/AuthContext', () => ({
  useAuthContext: () => ({
    state: mockState,
    login: vi.fn(),
    logout: vi.fn(),
    refreshTokens: vi.fn(),
  }),
}));

// Track navigation
let navigatedTo: string | null = null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      navigatedTo = to;
      return <div data-testid="navigate" data-to={to} />;
    },
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RoleGuard', () => {
  beforeEach(() => {
    navigatedTo = null;
    mockClear.mockClear();
    mockState.user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      roles: [{ id: '1', name: 'employee' }],
    };
    mockState.isAuthenticated = true;
    mockState.isLoading = false;
  });

  it('renders children when user has an allowed role', () => {
    mockState.user = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      roles: [{ id: '1', name: 'admin' }],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(navigatedTo).toBeNull();
  });

  it('performs case-insensitive role comparison', () => {
    mockState.user = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      roles: [{ id: '1', name: 'Admin' }],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects to fallbackPath when user does not have required role', () => {
    mockState.user = {
      id: '1',
      name: 'Employee User',
      email: 'emp@example.com',
      roles: [{ id: '1', name: 'employee' }],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(navigatedTo).toBe('/');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('uses custom fallbackPath when provided', () => {
    mockState.user = {
      id: '1',
      name: 'Employee User',
      email: 'emp@example.com',
      roles: [{ id: '1', name: 'employee' }],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']} fallbackPath="/dashboard">
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(navigatedTo).toBe('/dashboard');
  });

  it('redirects to /login and clears token store when user has no roles', () => {
    mockState.user = {
      id: '1',
      name: 'No Role User',
      email: 'norole@example.com',
      roles: [],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(navigatedTo).toBe('/login');
    expect(mockClear).toHaveBeenCalled();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects to /login and clears token store when user is null', () => {
    mockState.user = null;

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(navigatedTo).toBe('/login');
    expect(mockClear).toHaveBeenCalled();
  });

  it('allows access when user has at least one of the allowed roles', () => {
    mockState.user = {
      id: '1',
      name: 'HR User',
      email: 'hr@example.com',
      roles: [{ id: '1', name: 'hr' }],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin', 'hr']}>
        <div>Restricted Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText('Restricted Content')).toBeInTheDocument();
    expect(navigatedTo).toBeNull();
  });

  it('allows access when user has multiple roles and one matches', () => {
    mockState.user = {
      id: '1',
      name: 'Multi Role User',
      email: 'multi@example.com',
      roles: [
        { id: '1', name: 'employee' },
        { id: '2', name: 'admin' },
      ],
    };

    renderWithRouter(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
