'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

const CHANGELOG_ENTRIES = [
  {
    version: 'v0.4.0',
    date: '18 October 2026',
    title: 'SaaS Frontend Architecture & CoinCompass Design System',
    summary: 'Complete product rebuild with strict DPDP compliance, trilingual elder notices, and full responsive design.',
    changes: [
      'Introduced CoinCompass design system in packages/ui with WebGL Aurora canvas and hatch overlay.',
      'Authored trilingual elder consent notices (English, Hindi, Gujarati) with printable tabletop card.',
      'Added RFC 9116 security.txt vulnerability disclosure file and subprocessor registry.',
      'Implemented typed mock adapter in packages/api-contract with strict production mock-guard.',
    ],
  },
  {
    version: 'v0.3.0',
    date: '17 October 2026',
    title: 'Sprint 3: Speakerphone Resilience & Daily Credit Guards',
    summary: 'Acoustic calibration for noisy living room environments and hard caps on cloud STT costs.',
    changes: [
      'Implemented client-side energy VAD gating in AudioWorklet (zero audio chunks uploaded during silence).',
      'Configured hard cap MAX_STT_MINUTES_PER_DAY with judge panel visualization.',
      'Added automated offline eval replaying 8 kHz mu-law synthetic call recordings at 20% WER.',
      'Pre-rendered familial warning clips in Hindi and English.',
    ],
  },
  {
    version: 'v0.2.0',
    date: '16 October 2026',
    title: 'Sprint 2: Multi-Tenant Guardian Auth & Emergency Intercom',
    summary: 'Role-based security isolation and remote caregiver Push-to-Talk intercom break.',
    changes: [
      'Secured all endpoints with cryptographically random bearer tokens issued on guardian registration.',
      'Implemented signed alert actions with 1-tap Telegram dispatch and direct caregiver audio intercom.',
      'Configured automated SQLite session sweeper to delete all transcripts older than 7 days.',
      'Enforced zero cross-guardian data leakage in test suite.',
    ],
  },
  {
    version: 'v0.1.0',
    date: '15 October 2026',
    title: 'Sprint 1: Deterministic 5-Stage Detector & Contest Architecture',
    summary: 'Initial core pipeline connecting Gnani Prisma STT to Kavach finite state machine.',
    changes: [
      'Created deterministic 5-stage extortion state machine (S1 Authority to S5 Transfer Demand).',
      'Integrated Gnani Prisma 16 kHz streaming WebSocket STT.',
      'Established offline mock STT and synthetic benchmark suite in eval/.',
      'Achieved 97.3% scam recall in synthetic speakerphone testbed.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader currentPath="/changelog" />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
              <Icon name="history-bold" size={14} color="#c8f542" />
              <span>Project Releases &amp; Milestones</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
              Changelog
            </h1>

            <p className="text-sm text-white/60 font-body">
              A transparent, dated record of every architectural release and security update to Kavach.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              href="/changelog/rss.xml"
              icon="rss-bold"
              className="text-xs"
            >
              RSS Feed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              href="/changelog/feed.json"
              icon="code-square-bold"
              className="text-xs"
            >
              JSON Feed
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 sm:before:left-5 before:w-0.5 before:bg-white/10">
          {CHANGELOG_ENTRIES.map((entry) => (
            <div key={entry.version} className="relative pl-8 sm:pl-12 space-y-3">
              {/* Dot */}
              <div className="absolute left-1.5 sm:left-3.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#c8f542] border-2 border-[#0a2a12] shadow-sm shadow-[#c8f542]/50" />

              <GlassCard className="p-6 sm:p-7 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#c8f542] px-2.5 py-0.5 rounded-lg bg-[#c8f542]/10 border border-[#c8f542]/30">
                      {entry.version}
                    </span>
                    <h2 className="font-heading font-bold text-white text-base sm:text-lg">
                      {entry.title}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-white/40">{entry.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-white/70 font-body">{entry.summary}</p>

                <ul className="space-y-1.5 pt-2">
                  {entry.changes.map((ch, idx) => (
                    <li key={idx} className="text-xs text-white/60 flex items-start gap-2 font-body">
                      <span className="text-[#c8f542] mt-0.5">·</span>
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          ))}
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
