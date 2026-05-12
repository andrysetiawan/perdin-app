import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import {
  useUserList,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAssignRole,
  useRemoveRole,
} from '@/presentation/hooks/useUsers';
import { useRoleList } from '@/presentation/hooks/useRoles';
import { useNotification } from '@/presentation/hooks/useNotification';
import {
  DataTable,
  Button,
  Pagination,
  Modal,
  Input,
  LoadingSpinner,
  ConfirmDialog,
} from '@/presentation/components/ui';
import type { Column } from '@/presentation/components/ui';
import { createUserSchema, type CreateUserFormData } from '@/domain/validators/user.validator';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/shared/constants';
import type { User } from '@/domain/entities/user';
import type { Role } from '@/domain/entities/role';

// --- Edit User Schema (no password) ---
import { z } from 'zod';

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

// --- Create User Form Component ---

interface CreateUserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  conflictError: string | null;
}

function CreateUserForm({ onSubmit, onCancel, loading, conflictError }: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Enter user name"
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message || (conflictError ?? undefined)}
        placeholder="Enter email address"
      />
      <Input
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="Enter password"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading} disabled={!isValid}>
          Create User
        </Button>
      </div>
    </form>
  );
}

// --- Edit User Form Component ---

interface EditUserFormProps {
  user: User;
  onSubmit: (data: EditUserFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  conflictError: string | null;
}

function EditUserForm({ user, onSubmit, onCancel, loading, conflictError }: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Enter user name"
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message || (conflictError ?? undefined)}
        placeholder="Enter email address"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading} disabled={!isValid}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// --- Role Management Panel Component ---

interface RoleManagementPanelProps {
  user: User;
  allRoles: Role[];
  onAssignRole: (roleId: string) => void;
  onRemoveRole: (roleId: string) => void;
  assignLoading: boolean;
  removeLoading: boolean;
  onClose: () => void;
}

function RoleManagementPanel({
  user,
  allRoles,
  onAssignRole,
  onRemoveRole,
  assignLoading,
  removeLoading,
  onClose,
}: RoleManagementPanelProps) {
  const userRoleIds = useMemo(() => new Set(user.roles.map((r) => r.id)), [user.roles]);
  const availableRoles = useMemo(
    () => allRoles.filter((r) => !userRoleIds.has(r.id)),
    [allRoles, userRoleIds],
  );

  return (
    <div className="space-y-4">
      {/* Current Roles */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Roles</h4>
        {user.roles.length === 0 ? (
          <p className="text-sm text-gray-500">No roles assigned</p>
        ) : (
          <div className="space-y-2">
            {user.roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
              >
                <span className="text-sm text-gray-800 capitalize">{role.name}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRemoveRole(role.id)}
                  loading={removeLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Roles */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Roles</h4>
        {availableRoles.length === 0 ? (
          <p className="text-sm text-gray-500">All roles are already assigned</p>
        ) : (
          <div className="space-y-2">
            {availableRoles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
              >
                <span className="text-sm text-gray-800 capitalize">{role.name}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAssignRole(role.id)}
                  loading={assignLoading}
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// --- Main UserListPage Component ---

export function UserListPage() {
  const { addNotification } = useNotification();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Selected user for edit/delete/role management
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Conflict error state
  const [createConflictError, setCreateConflictError] = useState<string | null>(null);
  const [editConflictError, setEditConflictError] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useUserList({ page, limit: pageSize });
  const { data: rolesData } = useRoleList();

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const users = data?.users ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;
  const allRoles = rolesData ?? [];

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  // Create user handlers
  const openCreateModal = useCallback(() => {
    setCreateConflictError(null);
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateConflictError(null);
  }, []);

  const handleCreateUser = useCallback(
    async (data: CreateUserFormData) => {
      setCreateConflictError(null);
      try {
        await createUser.mutateAsync(data);
        addNotification({ type: 'success', message: 'User created successfully' });
        closeCreateModal();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
          setCreateConflictError('This email is already in use');
        } else {
          addNotification({ type: 'error', message: 'Failed to create user' });
        }
      }
    },
    [createUser, addNotification, closeCreateModal],
  );

  // Edit user handlers
  const openEditModal = useCallback((user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    setEditConflictError(null);
    setEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditConflictError(null);
  }, []);

  const handleEditUser = useCallback(
    async (data: EditUserFormData) => {
      if (!selectedUser) return;
      setEditConflictError(null);
      try {
        await updateUser.mutateAsync({ id: selectedUser.id, data });
        addNotification({ type: 'success', message: 'User updated successfully' });
        closeEditModal();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
          setEditConflictError('This email is already in use');
        } else {
          addNotification({ type: 'error', message: 'Failed to update user' });
        }
      }
    },
    [selectedUser, updateUser, addNotification, closeEditModal],
  );

  // Delete user handlers
  const openDeleteConfirm = useCallback((user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedUser(null);
  }, []);

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser.id);
      addNotification({ type: 'success', message: 'User deleted successfully' });
      closeDeleteConfirm();
    } catch {
      addNotification({ type: 'error', message: 'Failed to delete user' });
      closeDeleteConfirm();
    }
  }, [selectedUser, deleteUser, addNotification, closeDeleteConfirm]);

  // Role management handlers
  const openRoleModal = useCallback((user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    setRoleModalOpen(true);
  }, []);

  const closeRoleModal = useCallback(() => {
    setRoleModalOpen(false);
    setSelectedUser(null);
  }, []);

  const handleAssignRole = useCallback(
    async (roleId: string) => {
      if (!selectedUser) return;
      try {
        await assignRole.mutateAsync({ userId: selectedUser.id, roleId });
        // Update selectedUser to reflect the new role
        const assignedRole = allRoles.find((r) => r.id === roleId);
        if (assignedRole) {
          setSelectedUser({
            ...selectedUser,
            roles: [...selectedUser.roles, assignedRole],
          });
        }
        addNotification({ type: 'success', message: 'Role assigned successfully' });
      } catch {
        addNotification({ type: 'error', message: 'Failed to assign role' });
      }
    },
    [selectedUser, assignRole, addNotification, allRoles],
  );

  const handleRemoveRole = useCallback(
    async (roleId: string) => {
      if (!selectedUser) return;
      try {
        await removeRole.mutateAsync({ userId: selectedUser.id, roleId });
        // Update selectedUser to reflect the removed role
        setSelectedUser({
          ...selectedUser,
          roles: selectedUser.roles.filter((r) => r.id !== roleId),
        });
        addNotification({ type: 'success', message: 'Role removed successfully' });
      } catch {
        addNotification({ type: 'error', message: 'Failed to remove role' });
      }
    },
    [selectedUser, removeRole, addNotification],
  );

  // Column definitions
  const columns = useMemo((): Column<User>[] => {
    return [
      {
        key: 'name',
        header: 'Name',
        render: (user) => <span className="font-medium">{user.name}</span>,
      },
      {
        key: 'email',
        header: 'Email',
        render: (user) => <span>{user.email}</span>,
      },
      {
        key: 'roles',
        header: 'Roles',
        render: (user) => (
          <div className="flex flex-wrap gap-1">
            {user.roles.length === 0 ? (
              <span className="text-gray-400 text-xs">No roles</span>
            ) : (
              user.roles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize"
                >
                  {role.name}
                </span>
              ))
            )}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (user) => (
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" onClick={(e) => openEditModal(user, e)}>
              Edit
            </Button>
            <Button variant="primary" size="sm" onClick={(e) => openRoleModal(user, e)}>
              Roles
            </Button>
            <Button variant="danger" size="sm" onClick={(e) => openDeleteConfirm(user, e)}>
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, [openEditModal, openRoleModal, openDeleteConfirm]);

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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create User
        </Button>
      </div>

      {/* Table */}
      <DataTable<User>
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {users.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Create User Modal */}
      <Modal open={createModalOpen} onClose={closeCreateModal} title="Create User">
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={closeCreateModal}
          loading={createUser.isPending}
          conflictError={createConflictError}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit User">
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onSubmit={handleEditUser}
            onCancel={closeEditModal}
            loading={updateUser.isPending}
            conflictError={editConflictError}
          />
        )}
      </Modal>

      {/* Role Management Modal */}
      <Modal open={roleModalOpen} onClose={closeRoleModal} title={`Manage Roles - ${selectedUser?.name ?? ''}`}>
        {selectedUser && (
          <RoleManagementPanel
            user={selectedUser}
            allRoles={allRoles}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
            assignLoading={assignRole.isPending}
            removeLoading={removeRole.isPending}
            onClose={closeRoleModal}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteUser}
        onCancel={closeDeleteConfirm}
        loading={deleteUser.isPending}
      />
    </div>
  );
}
