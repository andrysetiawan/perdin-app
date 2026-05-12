import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import {
  useCityList,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
} from '@/presentation/hooks/useCities';
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
import { cityFormSchema, type CityFormData } from '@/domain/validators/city.validator';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/shared/constants';
import type { City } from '@/domain/entities/city';

// --- City Form Component ---

interface CityFormProps {
  defaultValues?: CityFormData;
  onSubmit: (data: CityFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  apiErrors: Record<string, string> | null;
  submitLabel: string;
}

function CityForm({ defaultValues, onSubmit, onCancel, loading, apiErrors, submitLabel }: CityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(cityFormSchema),
    mode: 'onBlur' as const,
    defaultValues: defaultValues ?? {
      name: '',
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
      province: '',
      island: '',
      isOverseas: false,
    },
  });

  const onFormSubmit = (data: Record<string, unknown>) => {
    return onSubmit(data as unknown as CityFormData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name')}
        error={errors.name?.message || apiErrors?.name}
        placeholder="Enter city name"
      />
      <Input
        label="Latitude"
        type="number"
        step="any"
        {...register('latitude', { valueAsNumber: true })}
        error={errors.latitude?.message || apiErrors?.latitude}
        placeholder="e.g. -6.2088"
      />
      <Input
        label="Longitude"
        type="number"
        step="any"
        {...register('longitude', { valueAsNumber: true })}
        error={errors.longitude?.message || apiErrors?.longitude}
        placeholder="e.g. 106.8456"
      />
      <Input
        label="Province"
        {...register('province')}
        error={errors.province?.message || apiErrors?.province}
        placeholder="Enter province"
      />
      <Input
        label="Island"
        {...register('island')}
        error={errors.island?.message || apiErrors?.island}
        placeholder="Enter island"
      />
      <div className="flex items-center gap-2">
        <input
          id="isOverseas"
          type="checkbox"
          {...register('isOverseas')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isOverseas" className="text-sm font-medium text-gray-700">
          Overseas
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading} disabled={!isValid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// --- Main CityListPage Component ---

export function CityListPage() {
  const { addNotification } = useNotification();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Selected city for edit/delete
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // API error state
  const [createApiErrors, setCreateApiErrors] = useState<Record<string, string> | null>(null);
  const [editApiErrors, setEditApiErrors] = useState<Record<string, string> | null>(null);

  // Queries
  const { data, isLoading } = useCityList({ page, limit: pageSize });

  // Mutations
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const cities = data?.cities ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage ?? 1;

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  // Create city handlers
  const openCreateModal = useCallback(() => {
    setCreateApiErrors(null);
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateApiErrors(null);
  }, []);

  const handleCreateCity = useCallback(
    async (data: CityFormData) => {
      setCreateApiErrors(null);
      try {
        await createCity.mutateAsync(data);
        addNotification({ type: 'success', message: 'City created successfully' });
        closeCreateModal();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 400) {
          const apiErrors = error.response.data?.errors as Record<string, string> | undefined;
          if (apiErrors) {
            setCreateApiErrors(apiErrors);
          } else {
            addNotification({ type: 'error', message: 'Failed to create city' });
          }
        } else {
          addNotification({ type: 'error', message: 'Failed to create city' });
        }
      }
    },
    [createCity, addNotification, closeCreateModal],
  );

  // Edit city handlers
  const openEditModal = useCallback((city: City, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCity(city);
    setEditApiErrors(null);
    setEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedCity(null);
    setEditApiErrors(null);
  }, []);

  const handleEditCity = useCallback(
    async (data: CityFormData) => {
      if (!selectedCity) return;
      setEditApiErrors(null);
      try {
        await updateCity.mutateAsync({ id: selectedCity.id, data });
        addNotification({ type: 'success', message: 'City updated successfully' });
        closeEditModal();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 400) {
          const apiErrors = error.response.data?.errors as Record<string, string> | undefined;
          if (apiErrors) {
            setEditApiErrors(apiErrors);
          } else {
            addNotification({ type: 'error', message: 'Failed to update city' });
          }
        } else {
          addNotification({ type: 'error', message: 'Failed to update city' });
        }
      }
    },
    [selectedCity, updateCity, addNotification, closeEditModal],
  );

  // Delete city handlers
  const openDeleteConfirm = useCallback((city: City, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCity(city);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedCity(null);
  }, []);

  const handleDeleteCity = useCallback(async () => {
    if (!selectedCity) return;
    try {
      await deleteCity.mutateAsync(selectedCity.id);
      addNotification({ type: 'success', message: 'City deleted successfully' });
      closeDeleteConfirm();
    } catch {
      addNotification({ type: 'error', message: 'Failed to delete city' });
      closeDeleteConfirm();
    }
  }, [selectedCity, deleteCity, addNotification, closeDeleteConfirm]);

  // Column definitions
  const columns = useMemo((): Column<City>[] => {
    return [
      {
        key: 'name',
        header: 'Name',
        render: (city) => <span className="font-medium">{city.name}</span>,
      },
      {
        key: 'province',
        header: 'Province',
        render: (city) => <span>{city.province}</span>,
      },
      {
        key: 'island',
        header: 'Island',
        render: (city) => <span>{city.island}</span>,
      },
      {
        key: 'isOverseas',
        header: 'Overseas',
        render: (city) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              city.isOverseas
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {city.isOverseas ? 'Yes' : 'No'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (city) => (
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" onClick={(e) => openEditModal(city, e)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={(e) => openDeleteConfirm(city, e)}>
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, [openEditModal, openDeleteConfirm]);

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
        <h1 className="text-2xl font-bold text-gray-900">City Management</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create City
        </Button>
      </div>

      {/* Table */}
      <DataTable<City>
        columns={columns}
        data={cities}
        keyExtractor={(city) => city.id}
        emptyMessage="No cities found"
      />

      {/* Pagination */}
      {cities.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Create City Modal */}
      <Modal open={createModalOpen} onClose={closeCreateModal} title="Create City">
        <CityForm
          onSubmit={handleCreateCity}
          onCancel={closeCreateModal}
          loading={createCity.isPending}
          apiErrors={createApiErrors}
          submitLabel="Create City"
        />
      </Modal>

      {/* Edit City Modal */}
      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit City">
        {selectedCity && (
          <CityForm
            defaultValues={{
              name: selectedCity.name,
              latitude: selectedCity.latitude,
              longitude: selectedCity.longitude,
              province: selectedCity.province,
              island: selectedCity.island,
              isOverseas: selectedCity.isOverseas,
            }}
            onSubmit={handleEditCity}
            onCancel={closeEditModal}
            loading={updateCity.isPending}
            apiErrors={editApiErrors}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete City"
        message={`Are you sure you want to delete city "${selectedCity?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteCity}
        onCancel={closeDeleteConfirm}
        loading={deleteCity.isPending}
      />
    </div>
  );
}
