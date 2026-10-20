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
}

export const BRAND: BrandConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Kavach',
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN || 'kavach.ai',
  ticketPrefix: process.env.NEXT_PUBLIC_TICKET_PREFIX || 'KAV',
  githubRepoUrl: process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com/pritpatel2412/Kavach',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@kavach.ai',
  legalEntity: process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'Kavach Technologies India Pvt. Ltd.',
};
