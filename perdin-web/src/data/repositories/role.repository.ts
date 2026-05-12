import type { Role } from '@/domain/entities/role';
import apiClient from '../api/client';
import { ROLE_ENDPOINTS } from '../api/endpoints';

interface RoleResponse {
  id: string;
  name: string;
}

export async function listRoles(): Promise<Role[]> {
  const response = await apiClient.get<{ success: boolean; data: RoleResponse[] }>(
    ROLE_ENDPOINTS.LIST,
  );

  return response.data.data.map((role) => ({
    id: role.id,
    name: role.name,
  }));
}

export async function createRole(data: { name: string }): Promise<Role> {
  const response = await apiClient.post<{ success: boolean; data: RoleResponse }>(
    ROLE_ENDPOINTS.CREATE,
    data,
  );

  return {
    id: response.data.data.id,
    name: response.data.data.name,
  };
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(ROLE_ENDPOINTS.DELETE(id));
}
