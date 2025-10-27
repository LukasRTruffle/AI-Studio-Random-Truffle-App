'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { oktaAuth, isOktaConfigured } from './okta-config';
import { UserRole } from '@random-truffle/types';
import type { User, AuthSession } from '@random-truffle/types';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOkta: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 *
 * Provides authentication state and methods to the application.
 * Supports both Okta OIDC (when configured) and placeholder auth (for development).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);

      if (isOktaConfigured()) {
        // Use Okta authentication
        const isAuth = await oktaAuth.isAuthenticated();
        if (isAuth) {
          const userInfo = await oktaAuth.getUser();

          // Map Okta user to our User type
          const mappedUser: User = {
            id: userInfo.sub || '',
            email: userInfo.email || '',
            name: userInfo.name || userInfo.email || '',
            role: (userInfo.role as UserRole) || UserRole.USER,
            tenantId: userInfo.tenantId ? String(userInfo.tenantId) : 'default',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const authSession: AuthSession = {
            userId: mappedUser.id,
            email: mappedUser.email,
            name: mappedUser.name,
            role: mappedUser.role,
            tenantId: mappedUser.tenantId,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour
          };

          setUser(mappedUser);
          setSession(authSession);
          setIsAuthenticated(true);
        }
      } else {
        // Placeholder auth for development
        const storedUser = localStorage.getItem('placeholder_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSession({
            userId: parsedUser.id,
            email: parsedUser.email,
            name: parsedUser.name,
            role: parsedUser.role,
            tenantId: parsedUser.tenantId,
            expiresAt: new Date(Date.now() + 3600000),
          });
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, _password: string): Promise<void> {
    if (isOktaConfigured()) {
      throw new Error('Direct login not supported with Okta. Use loginWithOkta() instead.');
    }

    // Placeholder login for development
    const placeholderUser: User = {
      id: '1',
      email,
      name: email.split('@')[0] || email,
      role: UserRole.USER,
      tenantId: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem('placeholder_user', JSON.stringify(placeholderUser));
    setUser(placeholderUser);
    setSession({
      userId: placeholderUser.id,
      email: placeholderUser.email,
      name: placeholderUser.name,
      role: placeholderUser.role,
      tenantId: placeholderUser.tenantId,
      expiresAt: new Date(Date.now() + 3600000),
    });
    setIsAuthenticated(true);
  }

  async function loginWithOkta(): Promise<void> {
    if (!isOktaConfigured()) {
      throw new Error('Okta is not configured. Please set OKTA environment variables.');
    }

    try {
      await oktaAuth.signInWithRedirect();
    } catch (error) {
      console.error('Okta login failed:', error);
      throw error;
    }
  }

  async function logout(): Promise<void> {
    try {
      if (isOktaConfigured()) {
        await oktaAuth.signOut();
      } else {
        localStorage.removeItem('placeholder_user');
      }

      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async function getAccessToken(): Promise<string | undefined> {
    if (isOktaConfigured()) {
      return await oktaAuth.getAccessToken();
    }
    return undefined;
  }

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    loginWithOkta,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
