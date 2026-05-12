import type { LoginCredentials, TokenPair } from '@/domain/entities/auth';
import type { User } from '@/domain/entities/user';
import apiClient from '../api/client';
import { tokenStore } from '../api/client';
import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS } from '../api/endpoints';
import { mapUserResponseToEntity, type UserResponse } from '../mappers/user.mapper';

interface LoginApiResponse {
  access_token: string;
  refresh_token: string;
}

export async function login(credentials: LoginCredentials): Promise<{ user: User; tokens: TokenPair }> {
  const response = await apiClient.post<{ success: boolean; data: LoginApiResponse }>(
    AUTH_ENDPOINTS.LOGIN,
    credentials,
  );

  const { access_token, refresh_token } = response.data.data;

  // Store tokens immediately so the next request (profile fetch) is authenticated
  tokenStore.setTokens({ access_token, refresh_token });

  // Fetch the user profile using the new access token
  const profileResponse = await apiClient.get<{ success: boolean; data: UserResponse }>(
    PROFILE_ENDPOINTS.GET,
  );
  const user = mapUserResponseToEntity(profileResponse.data.data);

  return {
    user,
    tokens: {
      accessToken: access_token,
      refreshToken: refresh_token,
    },
  };
}

export async function refreshToken(refreshTokenValue: string): Promise<TokenPair> {
  const response = await apiClient.post<{ success: boolean; data: { access_token: string; refresh_token: string } }>(
    AUTH_ENDPOINTS.REFRESH,
    { refresh_token: refreshTokenValue },
  );

  const { access_token, refresh_token } = response.data.data;

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
  };
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refresh_token: refreshTokenValue });
}
