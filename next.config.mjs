/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Output as standalone for optimized deployment
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Configure trailing slashes for consistent routing
  trailingSlash: true,

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {},

  // Security headers (Phase 0.4 - CSP headers)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // TODO: Add CSP header in Phase 0.4
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self'; ...",
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
