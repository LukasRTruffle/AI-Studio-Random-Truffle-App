/**
 * Get Current User Info
 *
 * Returns the currently authenticated user's information
 */

import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Extract roles from custom claim
    const namespace = 'https://random-truffle.com';
    const roles = session.user[`${namespace}/roles`] || [];

    return NextResponse.json({
      user: {
        id: session.user.sub,
        email: session.user[`${namespace}/email`] || session.user.email,
        name: session.user[`${namespace}/name`] || session.user.name,
        picture: session.user.picture,
        role: roles[0] || 'user', // Use first role as primary
        roles: roles,
      },
    });
  } catch (error) {
    console.error('Error getting user session:', error);
    return NextResponse.json({ user: null, error: 'Failed to get session' }, { status: 500 });
  }
}
