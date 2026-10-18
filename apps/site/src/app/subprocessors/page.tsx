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

export default function SubprocessorsPage() {
  const subprocessors = [
    {
      name: 'Gnani.ai (Gnani Innovations Pvt. Ltd.)',
      role: 'Speech Recognition (Prisma STT) & Voice Synthesis (Timbre TTS)',
      location: 'Bengaluru, Karnataka, India',
      dataScope: 'Acoustic audio stream for real-time transcription and consented voice profile embeddings.',
      transfer: 'Domestic India (No cross-border transfer)',
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
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Subprocessor Registry" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="server-square-bold" size={14} color="#c8f542" />
            <span>DPDP Act 2023 Vendor Disclosures</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Authorized Subprocessors
          </h1>

          <p className="text-xs sm:text-sm text-white/60 font-body">
            Kavach maintains a transparent, public registry of all third-party vendors and infrastructure partners that process data on our behalf.
          </p>
        </div>

        <div className="space-y-4">
          {subprocessors.map((sub, idx) => (
            <GlassCard key={idx} className="p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <h3 className="font-heading font-bold text-white text-base">{sub.name}</h3>
                <span className="text-[11px] font-mono text-[#c8f542] px-2.5 py-0.5 rounded bg-[#c8f542]/10 border border-[#c8f542]/20 shrink-0">
                  {sub.location}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Service Function</div>
                  <div className="text-white/80 font-medium">{sub.role}</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Data Scope</div>
                  <div className="text-white/70">{sub.dataScope}</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Data Residency</div>
                  <div className="text-white/70">{sub.transfer}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
