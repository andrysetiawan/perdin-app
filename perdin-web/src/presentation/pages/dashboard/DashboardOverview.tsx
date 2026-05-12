import { useMemo } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useTravelList } from '@/presentation/hooks/useTravels';
import { useUserList } from '@/presentation/hooks/useUsers';
import { useCityList } from '@/presentation/hooks/useCities';
import { LoadingSpinner } from '@/presentation/components/ui/LoadingSpinner';
import { isAdmin, isHR, isEmployee } from '@/domain/rules/role-permissions';

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function DashboardOverview() {
  const { user } = useAuth();

  const roles = useMemo(() => user?.roles.map((r) => r.name) ?? [], [user]);
  const userIsAdmin = useMemo(() => isAdmin(roles), [roles]);
  const userIsHR = useMemo(() => isHR(roles), [roles]);
  const userIsEmployee = useMemo(() => isEmployee(roles), [roles]);

  // For Employee: filter by own userId; for HR/Admin: no userId filter
  const userIdFilter = useMemo(
    () => (userIsEmployee && !userIsHR && !userIsAdmin ? user?.id : undefined),
    [userIsEmployee, userIsHR, userIsAdmin, user?.id],
  );

  // Only enable queries when user is loaded
  const queriesEnabled = !!user;

  // Stable params objects via useMemo
  const pendingParams = useMemo(
    () => ({ page: 1, limit: 1, status: 'pending', userId: userIdFilter }),
    [userIdFilter],
  );
  const approvedParams = useMemo(
    () => ({ page: 1, limit: 1, status: 'approved', userId: userIdFilter }),
    [userIdFilter],
  );
  const rejectedParams = useMemo(
    () => ({ page: 1, limit: 1, status: 'rejected', userId: userIdFilter }),
    [userIdFilter],
  );

  const pendingQuery = useTravelList(pendingParams, queriesEnabled);
  const approvedQuery = useTravelList(approvedParams, queriesEnabled);
  const rejectedQuery = useTravelList(rejectedParams, queriesEnabled);

  // Admin-only: fetch user and city counts
  const usersQuery = useUserList({ page: 1, limit: 1 }, userIsAdmin);
  const citiesQuery = useCityList({ page: 1, limit: 1 }, userIsAdmin);

  const travelLoading =
    pendingQuery.isLoading || approvedQuery.isLoading || rejectedQuery.isLoading;
  const adminLoading = userIsAdmin && (usersQuery.isLoading || citiesQuery.isLoading);
  const isLoading = !user || travelLoading || adminLoading;

  const pendingCount = pendingQuery.data?.meta?.total ?? 0;
  const approvedCount = approvedQuery.data?.meta?.total ?? 0;
  const rejectedCount = rejectedQuery.data?.meta?.total ?? 0;
  const totalUsers = usersQuery.data?.meta?.total ?? 0;
  const totalCities = citiesQuery.data?.meta?.total ?? 0;

  const roleLabel = userIsAdmin ? 'Admin' : userIsHR ? 'HR' : userIsEmployee ? 'Employee' : 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name ?? 'User'}
        </h1>
        <p className="text-sm text-gray-500">Role: {roleLabel}</p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Pending Travels" value={pendingCount} />
          <StatCard title="Approved Travels" value={approvedCount} />
          <StatCard title="Rejected Travels" value={rejectedCount} />
          {userIsAdmin && (
            <>
              <StatCard title="Total Users" value={totalUsers} />
              <StatCard title="Total Cities" value={totalCities} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
