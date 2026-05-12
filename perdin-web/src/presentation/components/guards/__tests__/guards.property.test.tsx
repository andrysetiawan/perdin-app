import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

import { AuthGuard } from '../AuthGuard';
import { RoleGuard } from '../RoleGuard';

/**
 * Feature: perdin-dashboard, Property 1: Unauthenticated route protection
 * Feature: perdin-dashboard, Property 3: Role guard blocks unauthorized access
 *
 * Validates: Requirements 1.5, 12.1, 12.2
 */

// --- Mocks ---

const mockClear = vi.fn();
vi.mock('@/data/api/client', () => ({
  tokenStore: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clear: () => mockClear(),
  },
}));

const mockState = {
  user: null as any,
  accessToken: null as string | null,
  refreshToken: null as string | null,
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

function renderWithRouter(ui: React.ReactElement, initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>,
  );
}

// --- Arbitraries ---

/** All protected route paths in the application */
const PROTECTED_ROUTES = [
  '/',
  '/travels',
  '/travels/new',
  '/users',
  '/roles',
  '/cities',
  '/profile',
];

/** Admin-only route paths */
const ADMIN_ONLY_ROUTES = ['/users', '/roles', '/cities'];

/** Non-admin role names */
const NON_ADMIN_ROLES = ['hr', 'employee'];

/** Arbitrary: random protected route path */
const protectedRouteArb = fc.constantFrom(...PROTECTED_ROUTES);

/** Arbitrary: random admin-only route path */
const adminOnlyRouteArb = fc.constantFrom(...ADMIN_ONLY_ROUTES);

/** Arbitrary: non-empty subset of non-admin roles */
const nonAdminRoleSetArb = fc
  .subarray(NON_ADMIN_ROLES, { minLength: 1, maxLength: 2 })
  .filter((arr) => arr.length > 0);

// --- Tests ---

describe('Feature: perdin-dashboard, Property 1: Unauthenticated route protection', () => {
  beforeEach(() => {
    navigatedTo = null;
    mockClear.mockClear();
  });

  it('For any protected route, unauthenticated users are redirected to /login', () => {
    fc.assert(
      fc.property(protectedRouteArb, (routePath) => {
        // Setup: user is not authenticated
        mockState.user = null;
        mockState.accessToken = null;
        mockState.refreshToken = null;
        mockState.isAuthenticated = false;
        mockState.isLoading = false;
        navigatedTo = null;

        const { unmount } = renderWithRouter(
          <AuthGuard>
            <div data-testid="protected-content">Protected Content</div>
          </AuthGuard>,
          routePath,
        );

        // Assert: should redirect to /login
        expect(navigatedTo).toBe('/login');
        // Assert: protected content should NOT be rendered
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

describe('Feature: perdin-dashboard, Property 3: Role guard blocks unauthorized access', () => {
  beforeEach(() => {
    navigatedTo = null;
    mockClear.mockClear();
  });

  it('For any admin-only route and non-admin user, RoleGuard redirects to /', () => {
    fc.assert(
      fc.property(
        adminOnlyRouteArb,
        nonAdminRoleSetArb,
        (routePath, userRoles) => {
          // Setup: authenticated user with non-admin roles
          mockState.user = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            roles: userRoles.map((roleName, idx) => ({
              id: String(idx + 1),
              name: roleName,
            })),
          };
          mockState.accessToken = 'valid-token';
          mockState.refreshToken = 'valid-refresh';
          mockState.isAuthenticated = true;
          mockState.isLoading = false;
          navigatedTo = null;

          const { unmount } = renderWithRouter(
            <RoleGuard allowedRoles={['admin']}>
              <div data-testid="admin-content">Admin Content</div>
            </RoleGuard>,
            routePath,
          );

          // Assert: should redirect to / (dashboard overview)
          expect(navigatedTo).toBe('/');
          // Assert: admin content should NOT be rendered
          expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
