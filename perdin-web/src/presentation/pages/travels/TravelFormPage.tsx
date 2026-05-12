import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';

import { travelFormSchema, type TravelFormData } from '@/domain/validators/travel.validator';
import { useTravelDetail, useCreateTravel, useUpdateTravel } from '@/presentation/hooks/useTravels';
import { useCityList } from '@/presentation/hooks/useCities';
import { useNotification } from '@/presentation/hooks/useNotification';
import { Select } from '@/presentation/components/ui/Select';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingSpinner } from '@/presentation/components/ui/LoadingSpinner';
import type { ApiErrorResponse } from '@/shared/types';

/**
 * Compute duration in days between two date strings (YYYY-MM-DD).
 * Returns 0 if dates are invalid or end < start.
 */
function computeDuration(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

export function TravelFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const isEditMode = !!id;

  const {
    data: travelData,
    isLoading: isTravelLoading,
    isError: isTravelError,
  } = useTravelDetail(id ?? '');

  const {
    data: citiesData,
    isLoading: isCitiesLoading,
    isError: isCitiesError,
  } = useCityList({ page: 1, limit: 1000 });

  const createTravel = useCreateTravel();
  const updateTravel = useUpdateTravel();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<TravelFormData>({
    resolver: zodResolver(travelFormSchema),
    mode: 'onChange',
    defaultValues: {
      purpose: '',
      originCityId: '',
      destinationCityId: '',
      startDate: '',
      endDate: '',
    },
  });

  // Watch dates to compute duration live
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });
  const duration = useMemo(() => computeDuration(startDate, endDate), [startDate, endDate]);

  useEffect(() => {
    if (isEditMode && travelData && citiesData) {
      reset({
        purpose: travelData.purpose,
        originCityId: travelData.originCityId,
        destinationCityId: travelData.destinationCityId,
        startDate: travelData.startDate,
        endDate: travelData.endDate,
      });
    }
  }, [isEditMode, travelData, citiesData, reset]);

  const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 400) {
      const apiError = error.response.data as ApiErrorResponse;
      if (apiError.errors) {
        const fieldMap: Record<string, keyof TravelFormData> = {
          purpose: 'purpose',
          origin_city_id: 'originCityId',
          destination_city_id: 'destinationCityId',
          start_date: 'startDate',
          end_date: 'endDate',
        };
        for (const [apiField, message] of Object.entries(apiError.errors)) {
          const formField = fieldMap[apiField] || (apiField as keyof TravelFormData);
          if (formField) {
            setError(formField, { type: 'server', message });
          }
        }
        return;
      }
      addNotification({ type: 'error', message: apiError.message || 'Permintaan tidak valid' });
      return;
    }
    addNotification({ type: 'error', message: 'Terjadi kesalahan. Silakan coba lagi.' });
  };

  const onSubmit = async (data: TravelFormData) => {
    try {
      if (isEditMode && id) {
        await updateTravel.mutateAsync({ id, data });
        addNotification({ type: 'success', message: 'Perjalanan dinas berhasil diperbarui' });
      } else {
        await createTravel.mutateAsync(data);
        addNotification({ type: 'success', message: 'Perjalanan dinas berhasil dibuat' });
      }
      navigate('/travels');
    } catch (error) {
      handleApiError(error);
    }
  };

  const cityOptions = (citiesData?.cities ?? []).map((city) => ({
    value: city.id,
    label: `${city.name} - ${city.province}`,
  }));

  if (isEditMode && (isTravelLoading || isCitiesLoading)) {
    return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (isEditMode && isTravelError) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">Gagal memuat data perjalanan dinas.</div>;
  }

  if (isEditMode && travelData && travelData.status !== 'pending') {
    return (
      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800" role="alert">
        Hanya perjalanan dinas dengan status <strong>pending</strong> yang dapat diubah.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">
            {isEditMode ? 'Edit Perdin' : 'Tambah Perdin'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-5">
          {isCitiesError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
              Gagal memuat daftar kota.
            </div>
          )}

          {/* Kota - side by side */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Kota</p>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Select
                  placeholder="Pilih kota asal"
                  options={cityOptions}
                  error={errors.originCityId?.message}
                  disabled={isCitiesError || isCitiesLoading}
                  {...register('originCityId')}
                />
              </div>
              <span className="mt-2 text-gray-400 text-lg">→</span>
              <div className="flex-1">
                <Select
                  placeholder="Pilih kota tujuan"
                  options={cityOptions}
                  error={errors.destinationCityId?.message}
                  disabled={isCitiesError || isCitiesLoading}
                  {...register('destinationCityId')}
                />
              </div>
            </div>
          </div>

          {/* Tanggal - side by side */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Tanggal</p>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  placeholder="Tanggal Awal"
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 min-h-[44px] ${
                    errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  {...register('startDate')}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
              </div>
              <span className="mt-2 text-gray-400 text-lg">→</span>
              <div className="flex-1">
                <input
                  type="date"
                  placeholder="Tanggal Akhir"
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 min-h-[44px] ${
                    errors.endDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  {...register('endDate')}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Keterangan (purpose) - textarea */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Keterangan</p>
            <textarea
              rows={4}
              placeholder="Masukkan keterangan perjalanan dinas"
              className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 resize-y ${
                errors.purpose ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              {...register('purpose')}
            />
            {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>}
          </div>

          {/* Total Perjalanan Dinas */}
          <div className="flex justify-center">
            <div className="rounded-md border border-gray-200 bg-gray-50 px-8 py-4 text-center">
              <p className="text-sm text-gray-600">Total Perjalanan Dinas</p>
              <p className="mt-1 text-xl font-bold text-blue-600">{duration} Hari</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/travels')}
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Perbarui' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
