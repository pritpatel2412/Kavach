'use client';

import React from 'react';
import {
  Button,
  Badge,
  TimestampPill,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function LearnHubPage() {
  const articles = [
    {
      slug: '/learn/digital-arrest',
      badge: 'High Threat · ₹4,057 Cr Lost Nationally',
      badgeVariant: 'hot' as const,
      title: 'Anatomy of a "Digital Arrest" Call: How Impersonators Trap Elders',
      summary:
        'Scammers pose as CBI, Mumbai Police, or Supreme Court officials. They isolate the victim on continuous video, fabricate forged arrest warrants, and order asset liquidation into "RBI verification accounts".',
      readTime: '6 min read',
      updated: 'October 2026',
      icon: 'shield-warning-bold',
    },
    {
      slug: '/learn/courier-parcel',
      badge: 'Narcotics & Customs Coercion',
      badgeVariant: 'warning' as const,
      title: 'The "FedEx Parcel / Customs Narcotics" Extortion Playbook',
      summary:
        'A robocall informs the victim that an international parcel addressed to Taiwan or Thailand containing expired passports and contraband MDMA has been intercepted at Mumbai airport.',
      readTime: '5 min read',
      updated: 'October 2026',
      icon: 'box-bold',
    },
    {
      slug: '/learn/kyc-otp',
      badge: 'Daily Urgency Traps',
      badgeVariant: 'primary' as const,
      title: 'Bank KYC Expiry, Electricity Cutoff & SIM Deactivation Threats',
      summary:
        'Urgent SMS or phone warnings claiming immediate power disconnection tonight or bank account freezing within 2 hours. Attackers trick elders into installing remote access APKs or sharing OTPs.',
      readTime: '4 min read',
      updated: 'October 2026',
      icon: 'phone-calling-rounded-bold',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/learn" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            <span>Public Scam Education &amp; Prevention Hub</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Scam Knowledge Base &amp; Advisories
          </h1>

          <p className="text-lead text-body font-medium">
            Learn the exact psychological extortion playbooks used against Indian senior citizens so your family can spot threats early.
          </p>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((art) => (
            <article
              key={art.slug}
              className="bg-surface border border-hairline rounded-md p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 hover:shadow-level-2 transition-shadow"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={art.badgeVariant}>{art.badge}</Badge>
                  <TimestampPill>{art.readTime}</TimestampPill>
                  <span className="text-caption text-muted">Updated {art.updated}</span>
                </div>

                <h2 className="text-heading font-bold text-ink hover:text-primary transition-colors">
                  <a href={art.slug}>{art.title}</a>
                </h2>

                <p className="text-body font-medium text-body leading-relaxed">
                  {art.summary}
                </p>

                <div className="pt-2">
                  <Button variant="outline-green" size="md" href={art.slug}>
                    Read Full Advisory →
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* National Helpline Callout */}
        <div className="bg-surface border border-hairline rounded-md p-8 text-center space-y-3 shadow-sm">
          <h3 className="text-heading font-bold text-ink">Victim of an Active Coercive Call?</h3>
          <p className="text-body font-medium text-body max-w-xl mx-auto">
            Disconnect immediately. Real Indian police or CBI officers will never demand video calls, Skype interrogations, or RTGS bank transfers.
          </p>
          <div className="pt-2">
            <a
              href="tel:1930"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-hot text-white font-bold text-ui shadow-sm"
            >
              Emergency Helpline: Dial 1930
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
