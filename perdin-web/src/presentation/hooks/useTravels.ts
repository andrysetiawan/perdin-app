import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { PaginationParams } from '@/shared/types';
import type { TravelFormData } from '@/domain/validators/travel.validator';
import * as travelRepository from '@/data/repositories/travel.repository';

// --- Query Keys ---

export const travelKeys = {
  all: ['travels'] as const,
  list: (params: PaginationParams & { status?: string; userId?: string }) =>
    ['travels', 'list', params] as const,
  detail: (id: string) => ['travels', 'detail', id] as const,
};

// --- Queries ---

export function useTravelList(params: PaginationParams & { status?: string; userId?: string }, enabled = true) {
  return useQuery({
    queryKey: travelKeys.list(params),
    queryFn: () => travelRepository.listTravels(params),
    enabled,
  });
}

export function useTravelDetail(id: string) {
  return useQuery({
    queryKey: travelKeys.detail(id),
    queryFn: () => travelRepository.getTravelById(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TravelFormData) => travelRepository.createTravel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: travelKeys.all });
    },
  });
}

export function useUpdateTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TravelFormData }) =>
      travelRepository.updateTravel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: travelKeys.all });
    },
  });
}

export function useDeleteTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => travelRepository.deleteTravel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: travelKeys.all });
    },
  });
}

export function useApproveTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => travelRepository.approveTravel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: travelKeys.all });
    },
  });
}

export function useRejectTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => travelRepository.rejectTravel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: travelKeys.all });
    },
  });
}
