/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kavach/ui', '@kavach/api-contract'],
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || process.env.KAVACH_PUBLIC_URL || 'http://localhost:8000';
    const appUrl = process.env.APP_URL || 'http://localhost:3001';
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3002';
    const demoUrl = process.env.DEMO_URL || `${apiOrigin}`;

    const rules = [
      // Direct backend API proxy (same-origin, eliminates browser CORS)
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: '/clips/:path*',
        destination: `${apiOrigin}/clips/:path*`,
      },
    ];

    // Apex multi-zone rewrites: allows the entire SaaS product to be run from one live URL (e.g. https://kavach.ai)
    if (process.env.ENABLE_ROOT_REWRITES === '1' || process.env.NODE_ENV === 'production') {
      rules.push(
        // Route /app to Guardian app
        {
          source: '/app',
          destination: `${appUrl}`,
        },
        {
          source: '/app/:path*',
          destination: `${appUrl}/:path*`,
        },
        // Route /elder to Kiosk on app
        {
          source: '/elder',
          destination: `${appUrl}/elder`,
        },
        {
          source: '/elder/:path*',
          destination: `${appUrl}/elder/:path*`,
        },
        // Route /admin to Admin console
        {
          source: '/admin',
          destination: `${adminUrl}`,
        },
        {
          source: '/admin/:path*',
          destination: `${adminUrl}/:path*`,
        },
        {
          source: '/admin-api/:path*',
          destination: `${apiOrigin}/admin-api/:path*`,
        },
        // Route /demo to Static Demo
        {
          source: '/demo',
          destination: `${demoUrl}`,
        },
        {
          source: '/demo/:path*',
          destination: `${demoUrl}/:path*`,
        }
      );
    }

    return {
      fallback: rules,
    };
  },
  async headers() {
    const isIndexingAllowed = process.env.ALLOW_INDEXING === '1';
    const robotsHeader = isIndexingAllowed ? 'index, follow' : 'noindex, nofollow';

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none';" },
          { key: 'X-Robots-Tag', value: robotsHeader },
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
