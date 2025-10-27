import type { Metadata } from 'next';
import { Auth0Provider } from '@/contexts/Auth0Context';
// import { AuthProvider } from '@/contexts/AuthContext'; // Old mock auth - replaced with Auth0
import './globals.css';

export const metadata: Metadata = {
  title: 'Random Truffle - AI Marketing Intelligence Platform',
  description:
    'Enterprise AI-driven marketing intelligence and activation platform with audience building, multi-channel activation, and advanced analytics.',
  keywords: [
    'marketing intelligence',
    'AI',
    'audience building',
    'Google Ads',
    'Meta Ads',
    'TikTok Ads',
    'BigQuery',
  ],
  authors: [{ name: 'Random Truffle Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-gray-50">
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}
