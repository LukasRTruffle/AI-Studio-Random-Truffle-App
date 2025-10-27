/**
 * Next.js Middleware for Route Protection
 *
 * Protects dashboard routes and ensures users are authenticated
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public paths
  const publicPaths = ['/auth', '/_next', '/favicon.ico', '/login', '/welcome'];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Run Auth0 middleware for authentication
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (Auth0 routes - changed from /api/auth in v4)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login, welcome (public pages)
     */
    '/((?!auth|_next/static|_next/image|favicon.ico|login|welcome).*)',
  ],
};
