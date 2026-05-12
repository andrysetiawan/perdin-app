import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthGuard } from '../AuthGuard';

// Mock the AuthContext
const mockState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
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

// Helper to track navigation
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

describe('AuthGuard', () => {
  beforeEach(() => {
    navigatedTo = null;
    mockState.user = null;
    mockState.accessToken = null;
    mockState.refreshToken = null;
    mockState.isAuthenticated = false;
    mockState.isLoading = false;
  });

  it('shows loading spinner when auth state is loading', () => {
    mockState.isLoading = true;

    renderWithRouter(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    mockState.isAuthenticated = false;
    mockState.isLoading = false;

    renderWithRouter(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(navigatedTo).toBe('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockState.isAuthenticated = true;
    mockState.isLoading = false;
    mockState.user = { id: '1', name: 'Test User', email: 'test@example.com', roles: [{ id: '1', name: 'employee' }] } as any;

    renderWithRouter(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(navigatedTo).toBeNull();
  });

  it('does not render children while loading', () => {
    mockState.isLoading = true;
    mockState.isAuthenticated = true;

    renderWithRouter(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
