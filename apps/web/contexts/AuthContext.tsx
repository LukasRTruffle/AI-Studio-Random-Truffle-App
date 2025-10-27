'use client';

/**
 * Auth Context for Random Truffle
 *
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { OktaUser } from '@random-truffle/auth';

interface AuthContextType {
  user: OktaUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'random_truffle_access_token';
const REFRESH_TOKEN_KEY = 'random_truffle_refresh_token';
const TOKEN_EXPIRY_KEY = 'random_truffle_token_expiry';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<OktaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get current user from access token
   */
  const getCurrentUser = useCallback(async (accessToken: string): Promise<OktaUser | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Failed to get current user:', err);
      return null;
    }
  }, []);

  /**
   * Refresh access token using refresh token
   */
  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const { accessToken, expiresIn } = data.data;

      // Store new tokens
      localStorage.setItem(TOKEN_KEY, accessToken);
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      // Update user
      const currentUser = await getCurrentUser(accessToken);
      setUser(currentUser);
    } catch (err) {
      console.error('Token refresh failed:', err);
      // Clear tokens and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setUser(null);
      window.location.href = '/login';
    }
  }, [getCurrentUser]);

  /**
   * Check if token needs refresh and refresh if necessary
   */
  const checkTokenExpiry = useCallback(async () => {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!accessToken || !expiryTime) {
      return;
    }

    const expiryTimestamp = parseInt(expiryTime, 10);
    const now = Date.now();
    const timeUntilExpiry = expiryTimestamp - now;

    // Refresh token if it expires in less than 5 minutes
    if (timeUntilExpiry < 5 * 60 * 1000) {
      await refreshToken();
    }
  }, [refreshToken]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem(TOKEN_KEY);

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if token needs refresh
        await checkTokenExpiry();

        // Get current user
        const currentUser = await getCurrentUser(accessToken);

        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [getCurrentUser, checkTokenExpiry]);

  /**
   * Set up automatic token refresh interval
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    // Check token expiry every minute
    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, checkTokenExpiry]);

  /**
   * Redirect to Okta login
   */
  const login = useCallback(() => {
    window.location.href = `${API_BASE_URL}/api/auth/login`;
  }, []);

  /**
   * Logout user and revoke tokens
   */
  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem(TOKEN_KEY);

    if (accessToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }

    // Clear local state
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setUser(null);

    // Redirect to login
    window.location.href = '/login';
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
