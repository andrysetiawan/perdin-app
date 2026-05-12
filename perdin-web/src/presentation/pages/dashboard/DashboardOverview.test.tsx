import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DashboardOverview } from './DashboardOverview';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/presentation/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useTravelList
const mockUseTravelList = vi.fn();
vi.mock('@/presentation/hooks/useTravels', () => ({
  useTravelList: (params: unknown) => mockUseTravelList(params),
}));

// Mock useUserList
const mockUseUserList = vi.fn();
vi.mock('@/presentation/hooks/useUsers', () => ({
  useUserList: (params: unknown) => mockUseUserList(params),
}));

// Mock useCityList
const mockUseCityList = vi.fn();
vi.mock('@/presentation/hooks/useCities', () => ({
  useCityList: (params: unknown) => mockUseCityList(params),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('DashboardOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while data is loading', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'John', email: 'john@test.com', roles: [{ id: '1', name: 'employee' }] },
    });
    mockUseTravelList.mockReturnValue({ isLoading: true, data: undefined });
    mockUseUserList.mockReturnValue({ isLoading: false, data: undefined });
    mockUseCityList.mockReturnValue({ isLoading: false, data: undefined });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays welcome message with user name and role for Employee', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'John Doe', email: 'john@test.com', roles: [{ id: '1', name: 'employee' }] },
    });
    mockUseTravelList.mockReturnValue({
      isLoading: false,
      data: { travels: [], meta: { page: 1, limit: 1, total: 0, totalPage: 0 } },
    });
    mockUseUserList.mockReturnValue({ isLoading: false, data: undefined });
    mockUseCityList.mockReturnValue({ isLoading: false, data: undefined });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByText('Role: Employee')).toBeInTheDocument();
  });

  it('displays travel counts for Employee with 0 for empty counts', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Jane', email: 'jane@test.com', roles: [{ id: '1', name: 'employee' }] },
    });
    mockUseTravelList.mockReturnValue({
      isLoading: false,
      data: { travels: [], meta: { page: 1, limit: 1, total: 0, totalPage: 0 } },
    });
    mockUseUserList.mockReturnValue({ isLoading: false, data: undefined });
    mockUseCityList.mockReturnValue({ isLoading: false, data: undefined });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    expect(screen.getByText('Pending Travels')).toBeInTheDocument();
    expect(screen.getByText('Approved Travels')).toBeInTheDocument();
    expect(screen.getByText('Rejected Travels')).toBeInTheDocument();
    // All counts should be 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
    // Should NOT show user/city stats
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Cities')).not.toBeInTheDocument();
  });

  it('displays travel counts for HR user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '2', name: 'HR Manager', email: 'hr@test.com', roles: [{ id: '2', name: 'hr' }] },
    });
    mockUseTravelList.mockImplementation((params: { status?: string }) => {
      const totals: Record<string, number> = { pending: 5, approved: 10, rejected: 2 };
      return {
        isLoading: false,
        data: { travels: [], meta: { page: 1, limit: 1, total: totals[params.status!] ?? 0, totalPage: 1 } },
      };
    });
    mockUseUserList.mockReturnValue({ isLoading: false, data: undefined });
    mockUseCityList.mockReturnValue({ isLoading: false, data: undefined });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    expect(screen.getByText('Welcome, HR Manager')).toBeInTheDocument();
    expect(screen.getByText('Role: HR')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    // Should NOT show user/city stats for HR
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Cities')).not.toBeInTheDocument();
  });

  it('displays travel counts + user count + city count for Admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '3', name: 'Admin User', email: 'admin@test.com', roles: [{ id: '3', name: 'admin' }] },
    });
    mockUseTravelList.mockImplementation((params: { status?: string }) => {
      const totals: Record<string, number> = { pending: 3, approved: 7, rejected: 1 };
      return {
        isLoading: false,
        data: { travels: [], meta: { page: 1, limit: 1, total: totals[params.status!] ?? 0, totalPage: 1 } },
      };
    });
    mockUseUserList.mockReturnValue({
      isLoading: false,
      data: { users: [], meta: { page: 1, limit: 1, total: 25, totalPage: 25 } },
    });
    mockUseCityList.mockReturnValue({
      isLoading: false,
      data: { cities: [], meta: { page: 1, limit: 1, total: 15, totalPage: 15 } },
    });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument();
    expect(screen.getByText('Role: Admin')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Total Cities')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('passes userId filter for Employee role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'emp-123', name: 'Employee', email: 'emp@test.com', roles: [{ id: '1', name: 'employee' }] },
    });
    mockUseTravelList.mockReturnValue({
      isLoading: false,
      data: { travels: [], meta: { page: 1, limit: 1, total: 0, totalPage: 0 } },
    });
    mockUseUserList.mockReturnValue({ isLoading: false, data: undefined });
    mockUseCityList.mockReturnValue({ isLoading: false, data: undefined });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    // Verify useTravelList was called with userId for employee
    expect(mockUseTravelList).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'emp-123', status: 'pending' }),
    );
    expect(mockUseTravelList).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'emp-123', status: 'approved' }),
    );
    expect(mockUseTravelList).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'emp-123', status: 'rejected' }),
    );
  });

  it('does not pass userId filter for Admin role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', roles: [{ id: '3', name: 'admin' }] },
    });
    mockUseTravelList.mockReturnValue({
      isLoading: false,
      data: { travels: [], meta: { page: 1, limit: 1, total: 0, totalPage: 0 } },
    });
    mockUseUserList.mockReturnValue({ isLoading: false, data: undefined });
    mockUseCityList.mockReturnValue({ isLoading: false, data: undefined });

    render(<DashboardOverview />, { wrapper: createWrapper() });

    // Verify useTravelList was called without userId for admin
    expect(mockUseTravelList).toHaveBeenCalledWith(
      expect.objectContaining({ userId: undefined, status: 'pending' }),
    );
  });
});
