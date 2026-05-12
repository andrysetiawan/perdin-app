import axios, { type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '../../shared/constants';
import { handleApiError } from '../../shared/error-handler';
import { AUTH_ENDPOINTS } from './endpoints';

// --- Token Store ---

export interface TokenStore {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(tokens: { access_token: string; refresh_token: string }): void;
  clear(): void;
}

const ACCESS_TOKEN_KEY = 'perdin_access_token';
const REFRESH_TOKEN_KEY = 'perdin_refresh_token';

export const tokenStore: TokenStore = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(tokens) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// --- Axios Instance ---

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request Interceptor: Attach access token ---

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor: Handle 401 with token refresh and request queue ---

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<{ access_token: string; refresh_token: string }> {
  const refreshToken = tokenStore.getRefreshToken();
  const response = await axios.post(
    `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
    { refresh_token: refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data.data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl: string = originalRequest?.url ?? '';

    // Skip token refresh for auth endpoints (login, refresh) — a 401 there means bad credentials
    const isAuthEndpoint = requestUrl.includes('/auth/');

    // Handle 401 with token refresh — but NOT for auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const newTokens = await refreshAccessToken();
        tokenStore.setTokens(newTokens);
        processQueue(null, newTokens.access_token);
        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Centralized error handling — skip for auth endpoints (login form handles its own errors)
    if (!isAuthEndpoint) {
      handleApiError(error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
