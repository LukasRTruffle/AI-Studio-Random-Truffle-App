/**
 * Next.js Middleware for Route Protection
 *
 * Protects dashboard routes and ensures users are authenticated
 */

import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login, welcome (public pages)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|welcome).*)',
  ],
};
