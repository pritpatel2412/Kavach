'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  StatusDot,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function LearnHubPage() {
  const articles = [
    {
      slug: '/learn/digital-arrest',
      badge: 'High Threat · ₹4,057 Cr Lost Nationally',
      title: 'Anatomy of a "Digital Arrest" Call: How Impersonators Trap Elders',
      summary:
        'Scammers pose as CBI, Mumbai Police, or Supreme Court officials. They isolate the victim on continuous video, fabricate forged arrest warrants, and order asset liquidation into "RBI verification accounts".',
      readTime: '6 min read',
      updated: 'October 2026',
      icon: 'shield-warning-bold',
      accentColor: 'text-[#ff5a4d]',
    },
    {
      slug: '/learn/courier-parcel',
      badge: 'Narcotics & Customs Coercion',
      title: 'The "FedEx Parcel / Customs Narcotics" Extortion Playbook',
      summary:
        'A robocall informs the victim that an international parcel addressed to Taiwan or Thailand containing expired passports and contraband MDMA has been intercepted at Mumbai airport.',
      readTime: '5 min read',
      updated: 'October 2026',
      icon: 'box-bold',
      accentColor: 'text-amber-300',
    },
    {
      slug: '/learn/kyc-otp',
      badge: 'Daily Urgency Traps',
      title: 'Bank KYC Expiry, Electricity Cutoff & SIM Deactivation Threats',
      summary:
        'Urgent SMS or phone warnings claiming immediate power disconnection tonight or bank account freezing within 2 hours. Attackers trick elders into installing remote access APKs or sharing OTPs.',
      readTime: '4 min read',
      updated: 'October 2026',
      icon: 'phone-calling-rounded-bold',
      accentColor: 'text-[#c8f542]',
    },
  ];

  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader currentPath="/learn" />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <StatusDot status="armed" label="" />
            <span>Public Safety & Elder Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            Scam Intelligence & Prevention Hub
          </h1>

          <p className="text-sm sm:text-base text-white/60 font-body">
            Factual breakdowns of real extortion playbooks targeting senior citizens in India.
            Learn the psychological triggers used by scammers before they target your family.
          </p>
        </div>

        {/* Emergency Helpline Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-400/40 bg-amber-400/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Icon name="phone-calling-rounded-bold" size={22} />
            </div>
            <div>
              <div className="font-heading font-bold text-white/95 text-sm">
                Under Active Threat or Just Transferred Money?
              </div>
              <div className="text-xs text-amber-200/80 font-body">
                Call India&apos;s National Cybercrime Helpline immediately to freeze fraudulent bank transfers.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-4 py-2 rounded-xl bg-amber-400 text-stone-950 font-heading font-bold text-xs hover:bg-amber-300 transition-colors flex items-center gap-2"
            >
              <Icon name="phone-bold" size={14} />
              <span>Dial 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-white/70 hover:text-white underline font-mono"
            >
              cybercrime.gov.in
            </a>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-bold text-white/90">
            Featured Investigations & Guides
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {articles.map((art) => (
              <GlassCard
                key={art.slug}
                className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-[#c8f542]/40 transition-all"
              >
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                      {art.badge}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-[11px] font-mono text-white/40">{art.readTime}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white/95 group-hover:text-[#c8f542] transition-colors">
                    <a href={art.slug}>{art.title}</a>
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  href={art.slug}
                  icon="arrow-right-linear"
                  className="shrink-0"
                >
                  Read Analysis
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
