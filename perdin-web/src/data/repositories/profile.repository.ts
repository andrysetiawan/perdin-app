import type { User } from '@/domain/entities/user';
import apiClient from '../api/client';
import { PROFILE_ENDPOINTS } from '../api/endpoints';
import { mapUserResponseToEntity, type UserResponse } from '../mappers/user.mapper';

export async function getProfile(): Promise<User> {
  const response = await apiClient.get<{ success: boolean; data: UserResponse }>(
    PROFILE_ENDPOINTS.GET,
  );

  return mapUserResponseToEntity(response.data.data);
}

export async function changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
  await apiClient.post(PROFILE_ENDPOINTS.CHANGE_PASSWORD, {
    old_password: data.oldPassword,
    new_password: data.newPassword,
  });
}
