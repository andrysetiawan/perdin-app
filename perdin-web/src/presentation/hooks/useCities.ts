import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { PaginationParams } from '@/shared/types';
import type { CityFormData } from '@/domain/validators/city.validator';
import * as cityRepository from '@/data/repositories/city.repository';

// --- Query Keys ---

export const cityKeys = {
  all: ['cities'] as const,
  list: (params: PaginationParams) => ['cities', 'list', params] as const,
  detail: (id: string) => ['cities', 'detail', id] as const,
};

// --- Queries ---

export function useCityList(params: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: cityKeys.list(params),
    queryFn: () => cityRepository.listCities(params),
    enabled,
  });
}

export function useCityDetail(id: string) {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => cityRepository.getCityById(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CityFormData) => cityRepository.createCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.all });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CityFormData }) =>
      cityRepository.updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.all });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cityRepository.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.all });
    },
  });
}
