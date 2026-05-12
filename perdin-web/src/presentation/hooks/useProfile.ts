import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as profileRepository from '@/data/repositories/profile.repository';

// --- Query Keys ---

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => ['profile', 'detail'] as const,
};

// --- Queries ---

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => profileRepository.getProfile(),
  });
}

// --- Mutations ---

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      profileRepository.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
