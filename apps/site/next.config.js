/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kavach/ui', '@kavach/api-contract'],
  webpack: (config, { isServer }) => {
    // Check mock safety during production build
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_MOCK === '1' && !process.env.ALLOW_PROD_MOCK) {
      throw new Error(
        '[CRITICAL SECURITY GUARD] Production build failed: NEXT_PUBLIC_MOCK=1 is enabled in production. Mock data must not be deployed.'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
