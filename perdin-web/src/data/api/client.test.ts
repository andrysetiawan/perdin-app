import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { tokenStore } from './client';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('tokenStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('returns null when no tokens are stored', () => {
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it('stores and retrieves tokens', () => {
    tokenStore.setTokens({
      access_token: 'my-access-token',
      refresh_token: 'my-refresh-token',
    });

    expect(tokenStore.getAccessToken()).toBe('my-access-token');
    expect(tokenStore.getRefreshToken()).toBe('my-refresh-token');
  });

  it('clears tokens', () => {
    tokenStore.setTokens({
      access_token: 'access',
      refresh_token: 'refresh',
    });

    tokenStore.clear();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});

describe('apiClient interceptors', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches Authorization header when token exists', async () => {
    tokenStore.setTokens({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
    });

    // We import apiClient fresh to test the interceptor
    const { default: apiClient } = await import('./client');

    // Mock the adapter to capture the request config
    const mockAdapter = vi.fn().mockResolvedValue({ data: {}, status: 200, headers: {} });
    apiClient.defaults.adapter = mockAdapter;

    await apiClient.get('/test');

    expect(mockAdapter).toHaveBeenCalled();
    const requestConfig = mockAdapter.mock.calls[0][0];
    expect(requestConfig.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('does not attach Authorization header when no token exists', async () => {
    const { default: apiClient } = await import('./client');

    const mockAdapter = vi.fn().mockResolvedValue({ data: {}, status: 200, headers: {} });
    apiClient.defaults.adapter = mockAdapter;

    await apiClient.get('/test');

    expect(mockAdapter).toHaveBeenCalled();
    const requestConfig = mockAdapter.mock.calls[0][0];
    // When no token, Authorization should not be set
    const authHeader = requestConfig.headers.get('Authorization');
    expect(authHeader).toBeFalsy();
  });

  it('attempts token refresh on 401 response', async () => {
    tokenStore.setTokens({
      access_token: 'expired-token',
      refresh_token: 'valid-refresh',
    });

    const { default: apiClient } = await import('./client');

    // Mock axios.post for the refresh call
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        },
      },
    });

    let callCount = 0;
    const mockAdapter = vi.fn().mockImplementation((config) => {
      callCount++;
      if (callCount === 1) {
        // First call returns 401
        return Promise.reject({
          config,
          response: { status: 401 },
        });
      }
      // Retry after refresh succeeds
      return Promise.resolve({ data: { success: true }, status: 200, headers: {} });
    });
    apiClient.defaults.adapter = mockAdapter;

    const response = await apiClient.get('/protected');

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(tokenStore.getAccessToken()).toBe('new-access-token');
    expect(tokenStore.getRefreshToken()).toBe('new-refresh-token');
    expect(response.data).toEqual({ success: true });
  });

  it('redirects to login when refresh fails', async () => {
    tokenStore.setTokens({
      access_token: 'expired-token',
      refresh_token: 'invalid-refresh',
    });

    const { default: apiClient } = await import('./client');

    // Mock window.location
    const locationMock = { href: '' };
    Object.defineProperty(window, 'location', { value: locationMock, writable: true });

    // Mock axios.post to fail for refresh
    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh failed'));

    const mockAdapter = vi.fn().mockImplementation((config) => {
      return Promise.reject({
        config,
        response: { status: 401 },
      });
    });
    apiClient.defaults.adapter = mockAdapter;

    await expect(apiClient.get('/protected')).rejects.toThrow();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
    expect(locationMock.href).toBe('/login');
  });
});
