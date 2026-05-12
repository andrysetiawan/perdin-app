import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as roleRepository from '@/data/repositories/role.repository';

// --- Query Keys ---

export const roleKeys = {
  all: ['roles'] as const,
  list: () => ['roles', 'list'] as const,
};

// --- Queries ---

export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => roleRepository.listRoles(),
  });
}

// --- Mutations ---

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => roleRepository.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleRepository.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
