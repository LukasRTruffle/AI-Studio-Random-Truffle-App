import { useAuthContext } from './AuthProvider';

/**
 * Convenience hook for accessing auth context
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
