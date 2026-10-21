/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kavach/ui', '@kavach/api-contract'],
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || process.env.KAVACH_PUBLIC_URL || 'http://localhost:8000';
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiOrigin}/api/:path*`,
        },
        {
          source: '/clips/:path*',
          destination: `${apiOrigin}/clips/:path*`,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none';" },
          // App portal is strictly private and never indexed by search engines
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Check mock safety during production build
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_MOCK === '1' && !process.env.ALLOW_PROD_MOCK) {
      throw new Error(
        '[CRITICAL SECURITY GUARD] Production build failed: NEXT_PUBLIC_MOCK=1 is enabled in production. Mock data must not be deployed.'
      );
    }

    // Fail-fast guard: No secrets may appear in any NEXT_PUBLIC_* variable
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const lower = key.toLowerCase();
        if (lower.includes('secret') || lower.includes('pass') || lower.includes('token_hash')) {
          throw new Error(`[CRITICAL SECURITY GUARD] Secret-like variable detected in public env: ${key}`);
        }
      }
    }

    return config;
  },
};

module.exports = nextConfig;
