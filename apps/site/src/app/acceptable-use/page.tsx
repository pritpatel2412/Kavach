'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function AcceptableUsePage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Acceptable Use Policy" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="shield-cross-bold" size={14} color="#c8f542" />
            <span>Ethical Boundaries &amp; Prohibitions</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Acceptable Use Policy
          </h1>

          <div className="text-xs font-mono text-white/50 border-b border-white/10 pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 text-sm text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">1. Purpose and Permitted Household Use</h2>
            <p className="text-xs text-white/70">
              Kavach is designed exclusively for transparent elder protection within bona fide domestic households. Its intended function is to prevent predatory extortion, financial fraud, and digital arrest deception when seniors receive incoming calls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[#ff5a4d]">2. Strictly Prohibited Activities</h2>
            <p className="text-xs text-white/70">
              Any of the following activities constitutes a violation of these terms and will result in immediate termination of account access and referral to authorities where applicable:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
              <li>
                <strong>Clandestine Eavesdropping or Wiretapping:</strong> Deploying Kavach to record, listen in on, or spy on spouses, household staff, tenants, or visitors without their explicit knowledge and consent.
              </li>
              <li>
                <strong>Non-Consensual Voice Cloning:</strong> Uploading or reading voice audio belonging to third parties, public figures, or relatives without their direct personal consent and participation in the liveness verification challenge.
              </li>
              <li>
                <strong>Spoofing Law Enforcement or State Entities:</strong> Utilizing Kavach or its generated synthesized warnings to impersonate police, judicial officers, or government bodies.
              </li>
              <li>
                <strong>Reverse Engineering or Adversarial Scraping:</strong> Attempting to decompile, probe, extract voice embeddings, or bypass rate limits on our backend services.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">3. Enforcement &amp; Account Suspension</h2>
            <p className="text-xs text-white/70">
              We reserve the right to suspend or permanently revoke access to any household or caregiver found violating this policy. If you suspect an unauthorized deployment or privacy abuse, please contact our trust team immediately at <a href="mailto:abuse@kavach.ai" className="text-[#c8f542] underline">abuse@kavach.ai</a>.
            </p>
          </section>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
