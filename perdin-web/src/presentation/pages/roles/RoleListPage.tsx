import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import { useRoleList, useCreateRole, useDeleteRole } from '@/presentation/hooks/useRoles';
import { useNotification } from '@/presentation/hooks/useNotification';
import {
  DataTable,
  Button,
  Modal,
  Input,
  LoadingSpinner,
  ConfirmDialog,
} from '@/presentation/components/ui';
import type { Column } from '@/presentation/components/ui';
import { createRoleSchema, type CreateRoleFormData } from '@/domain/validators/role.validator';
import type { Role } from '@/domain/entities/role';

// --- Create Role Form Component ---

interface CreateRoleFormProps {
  onSubmit: (data: CreateRoleFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  conflictError: string | null;
}

function CreateRoleForm({ onSubmit, onCancel, loading, conflictError }: CreateRoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Role Name"
        {...register('name')}
        error={errors.name?.message || (conflictError ?? undefined)}
        placeholder="Enter role name"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading} disabled={!isValid}>
          Create Role
        </Button>
      </div>
    </form>
  );
}

// --- Main RoleListPage Component ---

export function RoleListPage() {
  const { addNotification } = useNotification();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Selected role for deletion
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Conflict error state
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Queries
  const { data: roles, isLoading } = useRoleList();

  // Mutations
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();

  const roleList = roles ?? [];

  // Create role handlers
  const openCreateModal = useCallback(() => {
    setConflictError(null);
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setConflictError(null);
  }, []);

  const handleCreateRole = useCallback(
    async (data: CreateRoleFormData) => {
      setConflictError(null);
      try {
        await createRole.mutateAsync(data);
        addNotification({ type: 'success', message: 'Role created successfully' });
        closeCreateModal();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
          setConflictError('This role name already exists');
        } else {
          addNotification({ type: 'error', message: 'Failed to create role' });
        }
      }
    },
    [createRole, addNotification, closeCreateModal],
  );

  // Delete role handlers
  const openDeleteConfirm = useCallback((role: Role) => {
    setSelectedRole(role);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedRole(null);
  }, []);

  const handleDeleteRole = useCallback(async () => {
    if (!selectedRole) return;
    try {
      await deleteRole.mutateAsync(selectedRole.id);
      addNotification({ type: 'success', message: 'Role deleted successfully' });
      closeDeleteConfirm();
    } catch {
      addNotification({ type: 'error', message: 'Failed to delete role' });
      closeDeleteConfirm();
    }
  }, [selectedRole, deleteRole, addNotification, closeDeleteConfirm]);

  // Column definitions
  const columns = useMemo((): Column<Role>[] => {
    return [
      {
        key: 'name',
        header: 'Role Name',
        render: (role) => <span className="font-medium capitalize">{role.name}</span>,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (role) => (
          <Button variant="danger" size="sm" onClick={() => openDeleteConfirm(role)}>
            Delete
          </Button>
        ),
      },
    ];
  }, [openDeleteConfirm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create Role
        </Button>
      </div>

      {/* Table */}
      <DataTable<Role>
        columns={columns}
        data={roleList}
        keyExtractor={(role) => role.id}
        emptyMessage="No roles found"
      />

      {/* Create Role Modal */}
      <Modal open={createModalOpen} onClose={closeCreateModal} title="Create Role">
        <CreateRoleForm
          onSubmit={handleCreateRole}
          onCancel={closeCreateModal}
          loading={createRole.isPending}
          conflictError={conflictError}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Role"
        message={`Are you sure you want to delete role "${selectedRole?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteRole}
        onCancel={closeDeleteConfirm}
        loading={deleteRole.isPending}
      />
    </div>
  );
}
