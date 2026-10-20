'use client';

import React from 'react';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/privacy" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Privacy Policy" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:shield-check-bold" width="16" height="16" />
            <span>Digital Personal Data Protection Act (DPDP 2023) Aligned</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Privacy Policy &amp; Data Governance
          </h1>

          <div className="text-caption text-body font-mono border-b border-hairline pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">1. Fundamental Core Principle: Zero Raw Audio Retention</h2>
            <p>
              Kavach is engineered around the principle of data minimization. When an elder takes a phone call on speakerphone in the presence of a Kavach tabletop tablet:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-caption font-medium text-body">
              <li>Raw audio chunks (16 kHz PCM) are buffered only in volatile system RAM to extract speech-to-text transcripts.</li>
              <li>Raw microphone audio is <strong>NEVER saved to permanent disk, database records, or remote object storage (S3/GCS)</strong>.</li>
              <li>Once an audio packet is transcribed or discarded by our local energy voice-activity detector (VAD), the binary audio buffer is permanently erased from memory.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">2. Data We Collect and Process</h2>
            <div className="space-y-3 text-caption font-medium text-body">
              <p>
                <strong>A. Transcript Excerpts:</strong> Short textual snippets (capped at a maximum of 160 characters) surrounding detected scam trigger phrases. These excerpts are stored with 256-bit encryption and are <strong>automatically purged after 7 days</strong>.
              </p>
              <p>
                <strong>B. Consented Family Voice Embedding:</strong> If a family caregiver opts into the Cloned Voice Intervention feature, a mathematical voice embedding and pre-rendered emergency warning audio clips are generated. This requires explicit caregiver consent and a 3-phrase randomized liveness reading. You can delete your voice embedding and all pre-rendered clips at any time via the Guardian app with instantaneous deletion.
              </p>
              <p>
                <strong>C. Guardian Account Data:</strong> Phone number or email for authentication, household nickname, paired elder device tokens, and optional Telegram chat IDs for receiving push alerts.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">3. Third-Party Subprocessors</h2>
            <p className="text-caption font-medium text-body">
              Kavach partners exclusively with trusted sovereign infrastructure providers adhering to Indian data localization standards. Speech-to-text and voice cloning are processed through Gnani.ai data centers located within the Republic of India. No transcript or voice data is transferred across international borders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">4. Your Rights Under DPDP Act 2023</h2>
            <p className="text-caption font-medium text-body">
              As a Data Principal under India&apos;s Digital Personal Data Protection Act 2023, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-caption font-medium text-body">
              <li>Request summary and full export of personal data processed by Kavach.</li>
              <li>Request instantaneous erasure of your account, elder profiles, and voice embeddings.</li>
              <li>Withdraw consent for passive monitoring or voice cloning at any moment.</li>
              <li>Lodge a grievance with our designated Grievance Redressal Officer.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4 border-t border-hairline">
            <div className="text-ui font-bold text-ink">Contact Grievance Redressal</div>
            <p className="text-caption font-medium text-body">
              For any privacy inquiries or to exercise your DPDP rights, email <a href="mailto:grievance@kavach.ai" className="text-primary font-bold hover:underline">grievance@kavach.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
