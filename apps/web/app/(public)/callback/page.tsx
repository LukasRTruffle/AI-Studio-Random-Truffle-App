'use client';

/**
 * OAuth Callback Page for Random Truffle
 *
 * Handles OAuth redirect from Okta after successful authentication
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          throw new Error('Authorization code is missing');
        }

        // Exchange code for tokens
        const response = await fetch(
          `${API_BASE_URL}/api/auth/callback?code=${encodeURIComponent(code)}${
            state ? `&state=${encodeURIComponent(state)}` : ''
          }`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Authentication failed');
        }

        const data = await response.json();
        const { accessToken, refreshToken, expiresIn } = data.data;

        // Store tokens in localStorage
        localStorage.setItem('random_truffle_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('random_truffle_refresh_token', refreshToken);
        }

        // Store token expiry time
        const expiryTime = Date.now() + expiresIn * 1000;
        localStorage.setItem('random_truffle_token_expiry', expiryTime.toString());

        // Small delay to ensure localStorage is updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
        <div className="w-full max-w-md text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
              <svg
                className="h-8 w-8 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Authentication Failed</h1>
          <p className="mb-6 text-slate-600">{error}</p>

          {/* Redirect Message */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Redirecting to login page in a few seconds...</p>
          </div>

          {/* Manual Redirect Button */}
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Return to login now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Loading Animation */}
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        </div>

        {/* Loading Message */}
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Completing sign in...</h1>
        <p className="mb-6 text-slate-600">
          Please wait while we verify your credentials and set up your session.
        </p>

        {/* Progress Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
              <svg className="h-4 w-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-slate-700">Authentication successful</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
            <span className="text-slate-700">Setting up your session</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
            <div className="h-6 w-6 rounded-full border-2 border-slate-200"></div>
            <span>Redirecting to dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
