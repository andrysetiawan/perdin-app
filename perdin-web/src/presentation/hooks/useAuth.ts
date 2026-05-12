import { useAuthContext } from '@/presentation/context/AuthContext';

export function useAuth() {
  const { state, login, logout, refreshTokens } = useAuthContext();
  return { ...state, login, logout, refreshTokens };
}
