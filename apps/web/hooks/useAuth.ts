import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

// In a real app, you wouldn't hardcode this. This is for demonstration.
const MOCK_USER: User = {
  id: '1',
  name: 'Builder User',
  email: 'builder@example.com',
  role: 'superadmin',
};

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (_email?: string, _password?: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (_email?: string, _password?: string) => {
    // In a real app, this would involve an API call to your backend
    // TODO: Replace with actual Okta OIDC authentication in Phase 1
    localStorage.setItem('user', JSON.stringify(MOCK_USER));
    setUser(MOCK_USER);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };
};
