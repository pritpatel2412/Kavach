/**
 * Mock Guard: Enforces strict environment separation.
 * - NEXT_PUBLIC_MOCK=1 is required in local mock development.
 * - A production build with mock enabled must strictly FAIL to prevent accidental test-leakage.
 */

export function assertMockBuildSafety() {
  const isProd = process.env.NODE_ENV === 'production';
  const isMock = process.env.NEXT_PUBLIC_MOCK === '1' || process.env.NEXT_PUBLIC_MOCK === 'true';

  if (isProd && isMock && !process.env.ALLOW_PROD_MOCK) {
    throw new Error(
      '[CRITICAL SECURITY GUARD] Production build failed: NEXT_PUBLIC_MOCK=1 is enabled in NODE_ENV=production. Mock data must NEVER be deployed to live production without explicit override.'
    );
  }
}

export function isMockEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_MOCK === '1' || process.env.NEXT_PUBLIC_MOCK === 'true';
  }
  return process.env.NEXT_PUBLIC_MOCK === '1' || process.env.NEXT_PUBLIC_MOCK === 'true';
}
