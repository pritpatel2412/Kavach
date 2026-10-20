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
            <span>Designed Toward DPDP 2023 Principles · Not Legally Reviewed</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Privacy Policy &amp; Data Governance
          </h1>

          <div className="text-caption text-body font-mono border-b border-hairline pb-4">
            Last Updated: 20 October 2026 · Sprint Y Truth Alignment
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">1. Acoustic Streaming &amp; Speech-to-Text Transit</h2>
            <p>
              Kavach activates only when an incoming call is placed on speakerphone next to the tabletop kiosk device:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-caption font-medium text-body">
              <li>Microphone audio chunks (16 kHz PCM) are streamed in real time to <strong>Gnani.ai (Prisma STT)</strong> for Indian-language speech-to-text transcription.</li>
              <li>Data retention and handling of transit audio by Gnani is governed by Gnani platform terms (retention policy to be confirmed in writing).</li>
              <li>Kavach servers do not save raw incoming call audio to disk, databases, or remote object storage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">2. Server-Side Processing &amp; Data Storage</h2>
            <div className="space-y-3 text-caption font-medium text-body">
              <p>
                <strong>A. Scam Detection Engine:</strong> The 5-stage deterministic scam detector (<code>kavach_detector</code>) and operational database execute directly on our backend server. No call audio or real-time transcripts are sent to third-party Large Language Models (LLMs) for live scam classification.
              </p>
              <p>
                <strong>B. Consented Family Voice Embeddings:</strong> If a family caregiver enrolls in voice intervention, the biometric embedding and synthesized warning clips are stored <strong>server-side</strong> in our database, protected by AES-256 encryption. Caregivers can permanently erase their voice profile and audio clips at any time via <code>DELETE /api/guardians/{'{id}'}/voice</code>.
              </p>
              <p>
                <strong>C. Ephemeral Transcript Excerpts:</strong> Only high-risk textual excerpts (maximum 160 characters) surrounding detected scam trigger phrases are stored on our server for caregiver timeline verification. These excerpts are <strong>automatically purged after 7 days</strong>.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">3. Direct Elder Consent Protocol</h2>
            <p className="text-caption font-medium text-body">
              Consent cannot be granted on behalf of another adult by a caregiver ticking a proxy checkbox. Under our design, the senior citizen must explicitly review the trilingual plain-language notice and tap to grant consent directly on the paired tabletop tablet during device pairing. The pairing ledger cryptographically records the consent timestamp and statutory notice version (<code>2026-10-elder-v1</code>).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">4. Cloud Infrastructure &amp; AI Gateways</h2>
            <div className="space-y-2 text-caption font-medium text-body">
              <p>
                <strong>Neon Serverless PostgreSQL:</strong> Fleet health telemetry, account subscriptions, and cryptographic audit logs are hosted on Neon Serverless Postgres located in <strong>AWS Singapore (ap-southeast-1)</strong>. Zero raw call audio and zero call transcripts are synced to Neon.
              </p>
              <p>
                <strong>AI Gateway Default:</strong> By default, <strong>no AI gateway receives call transcripts</strong>. Any administrative AI assistance (e.g., summarizing support tickets) is strictly consent-gated and disabled by default.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">5. Statutory Alignment &amp; Legal Disclaimer</h2>
            <p className="text-caption font-medium text-body">
              Kavach is designed toward the core principles of India&apos;s Digital Personal Data Protection Act (DPDP 2023), including data minimization, purposeful processing, explicit consent, and right to erasure. However, this system has been developed for a technology innovation challenge and has <strong>not undergone formal statutory or legal review</strong> by licensed legal counsel.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-hairline">
            <div className="text-ui font-bold text-ink">Contact Privacy Inquiries</div>
            <p className="text-caption font-medium text-body">
              For privacy inquiries or data erasure requests, contact <a href="mailto:privacy@kavach.ai" className="text-primary font-bold hover:underline">privacy@kavach.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
