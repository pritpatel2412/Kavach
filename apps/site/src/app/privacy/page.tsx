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

export default function PrivacyPolicyPage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Privacy Policy" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="shield-check-bold" size={14} color="#c8f542" />
            <span>Digital Personal Data Protection Act (DPDP 2023) Aligned</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Privacy Policy &amp; Data Governance
          </h1>

          <div className="text-xs font-mono text-white/50 border-b border-white/10 pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 text-sm text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">1. Fundamental Core Principle: Zero Raw Audio Retention</h2>
            <p>
              Kavach is engineered around the principle of data minimization. When an elder takes a phone call on speakerphone in the presence of a Kavach tabletop tablet:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-white/70">
              <li>Raw audio chunks (16 kHz PCM) are buffered only in volatile system RAM to extract speech-to-text transcripts.</li>
              <li>Raw microphone audio is <strong>NEVER saved to permanent disk, database records, or remote object storage (S3/GCS)</strong>.</li>
              <li>Once an audio packet is transcribed or discarded by our local energy voice-activity detector (VAD), the binary audio buffer is permanently erased from memory.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">2. Data We Collect and Process</h2>
            <div className="space-y-3 text-xs text-white/70">
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
            <h2 className="text-lg font-heading font-bold text-white/95">3. Third-Party Subprocessors</h2>
            <p className="text-xs text-white/70">
              Kavach partners exclusively with trusted sovereign infrastructure providers adhering to Indian data localization standards. Speech-to-text and voice cloning are processed through Gnani.ai data centers located within the Republic of India. No transcript or voice data is transferred across international borders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">4. Your Rights Under DPDP Act 2023</h2>
            <p className="text-xs text-white/70">
              As a Data Principal under India&apos;s Digital Personal Data Protection Act 2023, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
              <li>Request summary and full export of personal data processed by Kavach.</li>
              <li>Request instantaneous erasure of your account, elder profiles, and voice embeddings.</li>
              <li>Withdraw consent for passive monitoring or voice cloning at any moment.</li>
              <li>Lodge a grievance with our designated Grievance Redressal Officer.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-xs font-heading font-semibold text-white/90">Contact Grievance Redressal</div>
            <p className="text-xs text-white/60">
              For any privacy inquiries or to exercise your DPDP rights, email <a href="mailto:grievance@kavach.ai" className="text-[#c8f542] underline">grievance@kavach.ai</a>.
            </p>
          </section>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
