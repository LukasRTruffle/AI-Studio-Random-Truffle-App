/**
 * Auth0 Context Provider
 *
 * Provides authentication state throughout the application
 */

'use client';

import { Auth0Provider as Auth0ClientProvider } from '@auth0/nextjs-auth0/client';
import { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  return <Auth0ClientProvider>{children}</Auth0ClientProvider>;
}
