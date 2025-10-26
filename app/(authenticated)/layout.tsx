'use client';

import SidebarNext from '../../components/SidebarNext';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        <SidebarNext />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ErrorBoundary>
  );
}
