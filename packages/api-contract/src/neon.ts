import { neon } from '@neondatabase/serverless';

export interface NeonDbConfig {
  databaseUrl?: string;
  databaseUrlUnpooled?: string;
  branch?: string;
  authBaseUrl?: string;
  authJwksUrl?: string;
  aiGatewayBaseUrl?: string;
  aiGatewayToken?: string;
}

export function getNeonConfig(): NeonDbConfig {
  return {
    databaseUrl: process.env.DATABASE_URL,
    databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED,
    branch: process.env.NEON_BRANCH || 'production',
    authBaseUrl: process.env.NEON_AUTH_BASE_URL,
    authJwksUrl: process.env.NEON_AUTH_JWKS_URL,
    aiGatewayBaseUrl: process.env.NEON_AI_GATEWAY_BASE_URL,
    aiGatewayToken: process.env.NEON_AI_GATEWAY_TOKEN,
  };
}

/**
 * Returns a Neon serverless SQL client.
 * Uses pooled DATABASE_URL for standard application queries.
 * Use unpooled: true for migrations, session state, or direct commands.
 */
export function getNeonSql(options: { unpooled?: boolean } = {}) {
  const cfg = getNeonConfig();
  const connStr = options.unpooled ? cfg.databaseUrlUnpooled || cfg.databaseUrl : cfg.databaseUrl;
  if (!connStr) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }
  return neon(connStr);
}

/**
 * Executes an end-to-end connectivity check on Neon Postgres.
 */
export async function testNeonPostgresConnection() {
  const t0 = Date.now();
  const sql = getNeonSql({ unpooled: false });
  const rows = await sql.query(
    'SELECT 1 as healthy, current_database() as database, current_user as user, version() as version;'
  );
  const latencyMs = Date.now() - t0;
  return {
    success: true,
    latencyMs,
    data: rows[0],
    branch: process.env.NEON_BRANCH || 'production',
    mode: 'pooled',
  };
}

/**
 * Verifies Neon Managed Auth JWKS endpoint.
 */
export async function testNeonAuthConnection() {
  const cfg = getNeonConfig();
  if (!cfg.authJwksUrl) {
    return { success: false, error: 'NEON_AUTH_JWKS_URL not configured' };
  }
  const t0 = Date.now();
  const res = await fetch(cfg.authJwksUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS: ${res.status} ${res.statusText}`);
  }
  const jwks = (await res.json()) as { keys?: any[] };
  const latencyMs = Date.now() - t0;
  return {
    success: true,
    latencyMs,
    keysCount: jwks.keys?.length || 0,
    baseUrl: cfg.authBaseUrl,
    jwksUrl: cfg.authJwksUrl,
  };
}

/**
 * Inspects Neon AI Gateway status.
 */
export function testNeonAiGatewayConfig() {
  const cfg = getNeonConfig();
  const hasConfig = Boolean(cfg.aiGatewayBaseUrl || cfg.aiGatewayToken);
  return {
    configured: hasConfig,
    baseUrl: cfg.aiGatewayBaseUrl || null,
    planNotice: 'AI Gateway is supported on Neon paid plans. Free plan routes fall back to local/mock inference.',
  };
}
