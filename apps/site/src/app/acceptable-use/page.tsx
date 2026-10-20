'use client';

import React from 'react';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/acceptable-use" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Acceptable Use Policy" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:shield-cross-bold" width="16" height="16" />
            <span>Ethical Boundaries &amp; Prohibitions</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Acceptable Use Policy
          </h1>

          <div className="text-caption text-body font-mono border-b border-hairline pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">1. Purpose and Permitted Household Use</h2>
            <p className="text-caption font-medium text-body">
              Kavach is designed exclusively for transparent elder protection within bona fide domestic households. Its intended function is to prevent predatory extortion, financial fraud, and digital arrest deception when seniors receive incoming calls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-hot">2. Strictly Prohibited Activities</h2>
            <p className="text-caption font-medium text-body">
              Any of the following activities constitutes a violation of these terms and will result in immediate termination of account access and referral to authorities where applicable:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-caption font-medium text-body">
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
            <h2 className="text-heading font-bold text-ink">3. Enforcement &amp; Account Suspension</h2>
            <p className="text-caption font-medium text-body">
              We reserve the right to suspend or permanently revoke access to any household or caregiver found violating this policy. If you suspect an unauthorized deployment or privacy abuse, please contact our trust team immediately at <a href="mailto:abuse@kavach.ai" className="text-primary font-bold hover:underline">abuse@kavach.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
