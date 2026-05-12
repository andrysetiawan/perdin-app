import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';

import type { User } from '@/domain/entities/user';
import type { LoginCredentials } from '@/domain/entities/auth';
import { tokenStore } from '@/data/api/client';
import * as authRepository from '@/data/repositories/auth.repository';

// --- State and Action Types ---

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'TOKEN_REFRESHED'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

// --- Reducer ---

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case 'LOGOUT':
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// --- Context ---

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// --- Provider ---

const USER_STORAGE_KEY = 'perdin_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize from localStorage on mount
  useEffect(() => {
    const accessToken = tokenStore.getAccessToken();
    const refreshToken = tokenStore.getRefreshToken();
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (accessToken && refreshToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, accessToken, refreshToken },
        });
      } catch {
        // Invalid stored user data, clear everything
        tokenStore.clear();
        localStorage.removeItem(USER_STORAGE_KEY);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user, tokens } = await authRepository.login(credentials);
      tokenStore.setTokens({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const currentRefreshToken = tokenStore.getRefreshToken();
    try {
      if (currentRefreshToken) {
        await authRepository.logout(currentRefreshToken);
      }
    } catch {
      // Even if logout API fails, clear local state (Requirement 1.11)
    } finally {
      tokenStore.clear();
      localStorage.removeItem(USER_STORAGE_KEY);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    const currentRefreshToken = tokenStore.getRefreshToken();
    if (!currentRefreshToken) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    try {
      const tokens = await authRepository.refreshToken(currentRefreshToken);
      tokenStore.setTokens({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      dispatch({
        type: 'TOKEN_REFRESHED',
        payload: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch {
      tokenStore.clear();
      localStorage.removeItem(USER_STORAGE_KEY);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const value: AuthContextValue = {
    state,
    login,
    logout,
    refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Custom Hook ---

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
