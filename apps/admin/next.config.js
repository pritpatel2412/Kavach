/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kavach/ui', '@kavach/api-contract'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none';" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_MOCK === '1' && !process.env.ALLOW_PROD_MOCK) {
      throw new Error(
        '[CRITICAL SECURITY GUARD] Production build failed: NEXT_PUBLIC_MOCK=1 is enabled in production. Mock data must not be deployed.'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
