/**
 * Auth0 Client Instance
 *
 * Central Auth0 configuration for Next.js App Router
 */

import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },
});
