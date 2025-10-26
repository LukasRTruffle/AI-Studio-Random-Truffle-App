'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    // In Phase 1, this will check authentication and redirect accordingly
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
      </div>
    </div>
  );
}
