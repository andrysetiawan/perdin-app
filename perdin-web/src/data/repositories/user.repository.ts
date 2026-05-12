import type { User } from '@/domain/entities/user';
import type { PaginationMeta, PaginationParams } from '@/shared/types';
import apiClient from '../api/client';
import { USER_ENDPOINTS } from '../api/endpoints';
import { mapUserResponseToEntity, mapUserListResponse, type UserResponse } from '../mappers/user.mapper';

export async function listUsers(params: PaginationParams): Promise<{ users: User[]; meta: PaginationMeta }> {
  const response = await apiClient.get<{ success: boolean; data: UserResponse[]; meta: PaginationMeta }>(
    USER_ENDPOINTS.LIST,
    { params },
  );

  return {
    users: mapUserListResponse(response.data.data),
    meta: response.data.meta!,
  };
}

export async function getUserById(id: string): Promise<User> {
  const response = await apiClient.get<{ success: boolean; data: UserResponse }>(
    USER_ENDPOINTS.GET(id),
  );

  return mapUserResponseToEntity(response.data.data);
}

export async function createUser(data: { name: string; email: string; password: string }): Promise<User> {
  const response = await apiClient.post<{ success: boolean; data: UserResponse }>(
    USER_ENDPOINTS.CREATE,
    data,
  );

  return mapUserResponseToEntity(response.data.data);
}

export async function updateUser(id: string, data: { name: string; email: string }): Promise<User> {
  const response = await apiClient.put<{ success: boolean; data: UserResponse }>(
    USER_ENDPOINTS.UPDATE(id),
    data,
  );

  return mapUserResponseToEntity(response.data.data);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(USER_ENDPOINTS.DELETE(id));
}

export async function assignRole(userId: string, roleId: string): Promise<void> {
  await apiClient.post(USER_ENDPOINTS.ASSIGN_ROLE(userId, roleId));
}

export async function removeRole(userId: string, roleId: string): Promise<void> {
  await apiClient.delete(USER_ENDPOINTS.REMOVE_ROLE(userId, roleId));
}
