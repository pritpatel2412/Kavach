'use client';

import React from 'react';
import {
  Icon,
  Badge,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function SubprocessorsPage() {
  const subprocessors = [
    {
      name: 'Gnani.ai (Gnani Innovations Pvt. Ltd.)',
      role: 'Speech Recognition (Prisma STT) & Voice Synthesis (Timbre TTS)',
      location: 'Bengaluru, Karnataka, India',
      dataScope: 'Acoustic audio stream for real-time speech-to-text transcription (retention governed per Gnani terms, to be confirmed); consented voice sample for guardian cloning.',
      transfer: 'Domestic India (No cross-border audio transfer)',
    },
    {
      name: 'Neon, Inc. (Serverless PostgreSQL)',
      role: 'Cloud Operational Database, Fleet Telemetry & Audit Logs',
      location: 'Singapore (AWS ap-southeast-1)',
      dataScope: 'Account metadata, device pairing tokens, billing status, and cryptographic audit hashes. Zero audio or call transcripts are stored in Neon.',
      transfer: 'International transfer (Singapore - AWS ap-southeast-1)',
    },
    {
      name: 'Telegram Messenger Inc. (Bot API)',
      role: 'Emergency Caregiver Push Dispatch',
      location: 'Dubai / Distributed Global Network',
      dataScope: 'Alert notification messages, scam category tags, and caregiver 1-click action URLs. (Opt-in only)',
      transfer: 'International transit via Telegram encrypted API',
    },
    {
      name: 'Razorpay Software Pvt. Ltd.',
      role: 'Subscription Billing, UPI & Card Processing',
      location: 'Bengaluru, Karnataka, India',
      dataScope: 'Payment tokens, invoices, customer billing email/phone. Zero payment card data touches Kavach servers.',
      transfer: 'Domestic India',
    },
    {
      name: 'Cloudflare, Inc.',
      role: 'Edge Content Delivery Network & DDoS Mitigation',
      location: 'Global Edge Anycast Network (Indian Data Centers)',
      dataScope: 'Encrypted web traffic transit and DNS routing. No plain-text audio or transcript access.',
      transfer: 'Global edge routing',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LegalBanner category="Subprocessor Registry" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge variant="neutral-subtle" className="font-mono text-xs">
              <Icon name="server-square-bold" size={14} className="text-primary mr-1" />
              DPDP Act 2023 Vendor Disclosures
            </Badge>
          </div>

          <h1 className="text-display font-heading font-bold text-ink">
            Authorized Subprocessors
          </h1>

          <p className="text-ui text-body">
            Kavach maintains a transparent, public registry of all third-party vendors and infrastructure partners that process data on our behalf.
          </p>
        </div>

        <div className="space-y-4">
          {subprocessors.map((sub, idx) => (
            <div key={idx} className="bg-surface border border-hairline rounded-md p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                <h3 className="font-heading font-bold text-ink text-heading">{sub.name}</h3>
                <Badge variant="primary" className="shrink-0 font-mono text-xs">
                  {sub.location}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-ui">
                <div>
                  <div className="text-muted uppercase font-mono text-micro font-bold">Service Function</div>
                  <div className="text-ink font-medium mt-0.5">{sub.role}</div>
                </div>
                <div>
                  <div className="text-muted uppercase font-mono text-micro font-bold">Data Scope</div>
                  <div className="text-body mt-0.5">{sub.dataScope}</div>
                </div>
                <div>
                  <div className="text-muted uppercase font-mono text-micro font-bold">Data Residency</div>
                  <div className="text-body mt-0.5">{sub.transfer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 space-y-2">
          <h3 className="font-heading font-bold text-ink text-ui">AI Gateway &amp; Large Language Model Boundary</h3>
          <p className="text-caption text-body leading-relaxed">
            By default, <strong>no AI gateway receives call transcripts or audio</strong>. Scam detection is evaluated entirely by our deterministic, rule-based Python detector running on our own server. Third-party AI assistance (such as Neon AI Gateway) is strictly consent-gated and disabled by default, reserved solely for optional administrative workflows with all PII masked.
          </p>
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}

