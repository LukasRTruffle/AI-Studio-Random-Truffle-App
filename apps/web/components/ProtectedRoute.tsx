'use client';

/**
 * Protected Route Component
 *
 * Wrapper component that ensures user is authenticated before rendering children
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional: Require specific roles
   */
  requiredRoles?: string[];
  /**
   * Optional: Custom redirect path if not authenticated
   */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access if required
    if (requiredRoles && requiredRoles.length > 0 && user) {
      const userRoles = user.roles || ['user'];
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        // User is authenticated but doesn't have required role
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const userRoles = user.roles || ['user'];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
