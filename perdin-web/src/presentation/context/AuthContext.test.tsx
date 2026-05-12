import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AuthProvider, useAuthContext, authReducer, type AuthState, type AuthAction } from './AuthContext';

// Mock dependencies
vi.mock('@/data/api/client', () => ({
  tokenStore: {
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    setTokens: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('@/data/repositories/auth.repository', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}));

import { tokenStore } from '@/data/api/client';
import * as authRepository from '@/data/repositories/auth.repository';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  roles: [{ id: '1', name: 'admin' }],
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('authReducer', () => {
  const baseState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  };

  it('handles LOGIN_SUCCESS', () => {
    const action: AuthAction = {
      type: 'LOGIN_SUCCESS',
      payload: { user: mockUser, accessToken: 'access-123', refreshToken: 'refresh-123' },
    };
    const result = authReducer(baseState, action);
    expect(result).toEqual({
      user: mockUser,
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('handles TOKEN_REFRESHED', () => {
    const state: AuthState = {
      ...baseState,
      user: mockUser,
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      isAuthenticated: true,
    };
    const action: AuthAction = {
      type: 'TOKEN_REFRESHED',
      payload: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    };
    const result = authReducer(state, action);
    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(result.user).toEqual(mockUser);
    expect(result.isAuthenticated).toBe(true);
  });

  it('handles LOGOUT', () => {
    const state: AuthState = {
      user: mockUser,
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      isAuthenticated: true,
      isLoading: false,
    };
    const result = authReducer(state, { type: 'LOGOUT' });
    expect(result).toEqual({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('handles SET_LOADING', () => {
    const result = authReducer(baseState, { type: 'SET_LOADING', payload: true });
    expect(result.isLoading).toBe(true);
  });
});

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with loading state and resolves to unauthenticated when no stored tokens', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue(null);
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue(null);

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });
    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
  });

  it('initializes from localStorage when tokens and user exist', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue('stored-access');
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue('stored-refresh');
    localStorage.setItem('perdin_user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });
    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user).toEqual(mockUser);
    expect(result.current.state.accessToken).toBe('stored-access');
  });

  it('clears state when stored user data is invalid JSON', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue('stored-access');
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue('stored-refresh');
    localStorage.setItem('perdin_user', 'invalid-json');

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });
    expect(result.current.state.isAuthenticated).toBe(false);
    expect(tokenStore.clear).toHaveBeenCalled();
  });

  it('login stores tokens and user on success', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue(null);
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue(null);
    vi.mocked(authRepository.login).mockResolvedValue({
      user: mockUser,
      tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user).toEqual(mockUser);
    expect(tokenStore.setTokens).toHaveBeenCalledWith({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    });
  });

  it('login throws and resets loading on failure', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue(null);
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue(null);
    vi.mocked(authRepository.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      }),
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.isLoading).toBe(false);
  });

  it('logout clears tokens and state even if API fails', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue('access');
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue('refresh');
    localStorage.setItem('perdin_user', JSON.stringify(mockUser));
    vi.mocked(authRepository.logout).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
    expect(tokenStore.clear).toHaveBeenCalled();
  });

  it('refreshTokens updates tokens on success', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue('access');
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue('refresh');
    localStorage.setItem('perdin_user', JSON.stringify(mockUser));
    vi.mocked(authRepository.refreshToken).mockResolvedValue({
      accessToken: 'refreshed-access',
      refreshToken: 'refreshed-refresh',
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.refreshTokens();
    });

    expect(result.current.state.accessToken).toBe('refreshed-access');
    expect(result.current.state.refreshToken).toBe('refreshed-refresh');
    expect(tokenStore.setTokens).toHaveBeenCalledWith({
      access_token: 'refreshed-access',
      refresh_token: 'refreshed-refresh',
    });
  });

  it('refreshTokens logs out when refresh fails', async () => {
    vi.mocked(tokenStore.getAccessToken).mockReturnValue('access');
    vi.mocked(tokenStore.getRefreshToken).mockReturnValue('refresh');
    localStorage.setItem('perdin_user', JSON.stringify(mockUser));
    vi.mocked(authRepository.refreshToken).mockRejectedValue(new Error('Token expired'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.refreshTokens();
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(tokenStore.clear).toHaveBeenCalled();
  });
});

describe('useAuthContext', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow('useAuthContext must be used within an AuthProvider');
  });
});
