import { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/presentation/hooks/useAuth';
import { useNotification } from '@/presentation/hooks/useNotification';
import {
  useTravelList,
  useApproveTravel,
  useRejectTravel,
  useDeleteTravel,
  travelKeys,
} from '@/presentation/hooks/useTravels';
import {
  DataTable,
  Button,
  Pagination,
  Select,
  LoadingSpinner,
  ConfirmDialog,
  Modal,
} from '@/presentation/components/ui';
import type { Column } from '@/presentation/components/ui';
import { isAdmin, isHR, canApproveTravel } from '@/domain/rules/role-permissions';
import { formatDate } from '@/shared/utils';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/shared/constants';
import type { Travel } from '@/domain/entities/travel';

type ConfirmAction = 'approve' | 'reject' | 'delete';

interface ConfirmState {
  open: boolean;
  action: ConfirmAction;
  travel: Travel | null;
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function StatusBadge({ status }: { status: Travel['status'] }) {
  const styles: Record<Travel['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatCurrency(amount: number): string {
  return `Rp. ${amount.toLocaleString('id-ID')},-`;
}

export function TravelListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();

  const roles = useMemo(() => user?.roles.map((r) => r.name) ?? [], [user]);
  const userIsAdmin = useMemo(() => isAdmin(roles), [roles]);
  const userIsHR = useMemo(() => isHR(roles), [roles]);
  const userCanApprove = useMemo(() => canApproveTravel(roles), [roles]);
  const isHROrAdmin = userIsAdmin || userIsHR;
  // HR can only view/approve — cannot create or edit travel requests
  const canCreate = userIsAdmin || (!userIsHR);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  // Detail modal state
  const [detailTravel, setDetailTravel] = useState<Travel | null>(null);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    action: 'approve',
    travel: null,
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params: { page: number; limit: number; status?: string; userId?: string } = {
      page,
      limit: pageSize,
    };
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (!isHROrAdmin && user?.id) {
      params.userId = user.id;
    }
    if (userIsAdmin && userIdFilter) {
      params.userId = userIdFilter;
    }
    return params;
  }, [page, pageSize, statusFilter, userIdFilter, isHROrAdmin, userIsAdmin, user?.id]);

  const { data, isLoading } = useTravelList(queryParams);

  const approveMutation = useApproveTravel();
  const rejectMutation = useRejectTravel();
  const deleteMutation = useDeleteTravel();

  const travels = data?.travels ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;

  const handlePageChange = useCallback((newPage: number) => { setPage(newPage); }, []);
  const handlePageSizeChange = useCallback((newSize: number) => { setPageSize(newSize); setPage(1); }, []);
  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }, []);
  const handleUserIdFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setUserIdFilter(e.target.value); setPage(1); }, []);

  // Row click: HR sees detail/approval modal, Employee goes to edit, Admin sees detail modal
  const handleRowClick = useCallback(
    (travel: Travel) => {
      if (userIsHR || userIsAdmin) {
        setDetailTravel(travel);
      } else {
        navigate(`/travels/${travel.id}/edit`);
      }
    },
    [userIsHR, userIsAdmin, navigate],
  );

  const openConfirm = useCallback((action: ConfirmAction, travel: Travel, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfirmState({ open: true, action, travel });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ open: false, action: 'approve', travel: null });
  }, []);

  const handleConfirm = useCallback(async () => {
    const { action, travel } = confirmState;
    if (!travel) return;

    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync(travel.id);
        addNotification({ type: 'success', message: `Perjalanan "${travel.purpose}" disetujui` });
      } else if (action === 'reject') {
        await rejectMutation.mutateAsync(travel.id);
        addNotification({ type: 'success', message: `Perjalanan "${travel.purpose}" ditolak` });
      } else if (action === 'delete') {
        await deleteMutation.mutateAsync(travel.id);
        addNotification({ type: 'success', message: `Perjalanan "${travel.purpose}" dihapus` });
      }
      closeConfirm();
      setDetailTravel(null);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        addNotification({
          type: 'warning',
          message: action === 'delete'
            ? 'Hanya perjalanan pending yang dapat dihapus'
            : 'Status perjalanan ini sudah berubah',
        });
        queryClient.invalidateQueries({ queryKey: travelKeys.all });
      } else {
        addNotification({ type: 'error', message: `Gagal ${action} perjalanan` });
      }
      closeConfirm();
    }
  }, [confirmState, approveMutation, rejectMutation, deleteMutation, addNotification, closeConfirm, queryClient]);

  // Column definitions
  const columns = useMemo((): Column<Travel>[] => {
    const cols: Column<Travel>[] = [
      {
        key: 'purpose',
        header: 'Purpose',
        render: (travel) => (
          <span className="font-medium truncate max-w-[200px] block">{travel.purpose}</span>
        ),
      },
    ];

    if (isHROrAdmin) {
      cols.push({
        key: 'userName',
        header: 'Requester',
        render: (travel) => <span>{travel.userName}</span>,
      });
    }

    cols.push(
      { key: 'originCityName', header: 'Origin', render: (travel) => <span>{travel.originCityName}</span> },
      { key: 'destinationCityName', header: 'Destination', render: (travel) => <span>{travel.destinationCityName}</span> },
      { key: 'startDate', header: 'Start Date', render: (travel) => <span>{formatDate(travel.startDate)}</span> },
      { key: 'endDate', header: 'End Date', render: (travel) => <span>{formatDate(travel.endDate)}</span> },
      { key: 'status', header: 'Status', render: (travel) => <StatusBadge status={travel.status} /> },
      {
        key: 'actions',
        header: 'Actions',
        render: (travel) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="sm" onClick={() => handleRowClick(travel)}>View</Button>
            {canCreate && travel.status === 'pending' && (userIsAdmin || travel.userId === user?.id) && (
              <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/travels/${travel.id}/edit`); }}>Edit</Button>
            )}
            {travel.status === 'pending' && (userIsAdmin || travel.userId === user?.id) && (
              <Button variant="danger" size="sm" onClick={(e) => openConfirm('delete', travel, e)}>Delete</Button>
            )}
          </div>
        ),
      },
    );

    return cols;
  }, [isHROrAdmin, canCreate, userIsAdmin, user?.id, openConfirm, handleRowClick, navigate]);

  const confirmTitle = useMemo(() => {
    switch (confirmState.action) {
      case 'approve': return 'Approve Travel';
      case 'reject': return 'Reject Travel';
      case 'delete': return 'Delete Travel';
    }
  }, [confirmState.action]);

  const confirmMessage = useMemo(() => {
    if (!confirmState.travel) return '';
    switch (confirmState.action) {
      case 'approve': return `Setujui perjalanan "${confirmState.travel.purpose}"?`;
      case 'reject': return `Tolak perjalanan "${confirmState.travel.purpose}"?`;
      case 'delete': return `Hapus perjalanan "${confirmState.travel.purpose}"? Tindakan ini tidak dapat dibatalkan.`;
    }
  }, [confirmState.action, confirmState.travel]);

  const confirmLoading = approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending;

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Travel Requests</h1>
        {canCreate && (
          <Link to="/travels/new">
            <Button variant="primary">Create Travel</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isHROrAdmin && (
          <div className="w-full sm:w-48">
            <Select label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={handleStatusFilterChange} />
          </div>
        )}
        {userIsAdmin && (
          <div className="w-full sm:w-64">
            <label htmlFor="user-id-filter" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input id="user-id-filter" type="text" value={userIdFilter} onChange={handleUserIdFilterChange} placeholder="Filter by user ID" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]" />
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable<Travel> columns={columns} data={travels} keyExtractor={(t) => t.id} onRowClick={handleRowClick} emptyMessage="No travel requests found" />

      {/* Pagination */}
      {travels.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} pageSizeOptions={[...PAGE_SIZE_OPTIONS]} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
      )}

      {/* Detail / Approval Modal for HR/Admin */}
      <Modal open={!!detailTravel} onClose={() => setDetailTravel(null)} title="Approval Pengajuan Perdin">
        {detailTravel && (
          <div className="space-y-4">
            {/* Nama */}
            <div>
              <p className="text-sm font-semibold text-gray-700">Nama</p>
              <div className="mt-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900">
                {detailTravel.userName}
              </div>
            </div>

            {/* Kota */}
            <div>
              <p className="text-sm font-semibold text-gray-700">Kota</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900">
                  {detailTravel.originCityName}
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900">
                  {detailTravel.destinationCityName}
                </div>
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <p className="text-sm font-semibold text-gray-700">Tanggal</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900">
                  {formatDate(detailTravel.startDate)}
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900">
                  {formatDate(detailTravel.endDate)}
                </div>
              </div>
            </div>

            {/* Keterangan / Purpose */}
            <div>
              <p className="text-sm font-semibold text-gray-700">Keterangan</p>
              <div className="mt-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900">
                {detailTravel.purpose}
              </div>
            </div>

            {/* Summary table */}
            <div className="rounded-md bg-blue-50 border border-blue-100 overflow-hidden">
              <div className="grid grid-cols-3 text-center">
                <div className="p-3 border-r border-blue-100">
                  <p className="text-xs font-semibold text-gray-600">Total Hari</p>
                  <p className="mt-1 text-lg font-bold text-blue-600">{detailTravel.durationDays} Hari</p>
                </div>
                <div className="p-3 border-r border-blue-100">
                  <p className="text-xs font-semibold text-gray-600">Jarak Tempuh</p>
                  <p className="mt-1 text-lg font-bold text-blue-600">{Math.round(detailTravel.distanceKm)} KM</p>
                  <p className="text-xs text-gray-500">{formatCurrency(detailTravel.allowancePerDay)} / Hari</p>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-600">Total Uang Perdin</p>
                  <p className="mt-1 text-lg font-bold text-blue-600">{formatCurrency(detailTravel.totalAllowance)}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">Status:</p>
              <StatusBadge status={detailTravel.status} />
            </div>

            {/* Action buttons */}
            {userCanApprove && detailTravel.status === 'pending' && (
              <div className="flex justify-center gap-4 pt-2">
                <Button
                  variant="danger"
                  onClick={() => openConfirm('reject', detailTravel)}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => openConfirm('approve', detailTravel)}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmState.action === 'delete' ? 'Delete' : 'Confirm'}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
        loading={confirmLoading}
      />
    </div>
  );
}
