/**
 * Auth0 Login/Logout Button Component
 *
 * Shows login or logout button based on authentication state
 */

'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export function Auth0LoginButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-lg"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{user.name}</span>
        </div>
        <Link
          href="/api/auth/logout"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Logout
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Login
    </Link>
  );
}
