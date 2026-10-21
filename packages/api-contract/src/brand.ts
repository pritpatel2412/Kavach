/**
 * Single source of truth for Brand identity, repository links, and contact domains.
 */
export interface BrandConfig {
  name: string;
  domain: string;
  ticketPrefix: string;
  githubRepoUrl: string;
  supportEmail: string;
  legalEntity: string;
  siteUrl: string;
  appUrl: string;
  adminUrl: string;
  apiOrigin: string;
  wsUrl: string;
}

export const BRAND: BrandConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Kavach',
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN || 'kavach.ai',
  ticketPrefix: process.env.NEXT_PUBLIC_TICKET_PREFIX || 'KAV',
  githubRepoUrl: process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com/pritpatel2412/Kavach',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@kavach.ai',
  legalEntity: process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'Kavach Technologies India Pvt. Ltd.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002',
  apiOrigin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/call',
};

