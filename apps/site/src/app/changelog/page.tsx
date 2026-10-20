'use client';

import React from 'react';
import {
  Button,
  Badge,
  TimestampPill,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

const CHANGELOG_ENTRIES = [
  {
    version: 'v0.5.0',
    date: '19 October 2026',
    title: 'Deals Community Design System Redesign',
    summary: 'Full front-end redesign strictly obeying DESIGN.md high-density tokens, white cards, and functional hot/cold temperature controls.',
    changes: [
      'Migrated entire theme from dark glassmorphism to Deals Community cool-gray canvas (#f2f4f7) and white cards (#ffffff).',
      'Implemented signature temperature-control pill with cold-blue down vote and hot-red degree reading.',
      'Adopted price-lockup pattern with bold green current price, struck-through original, and mint discount badge.',
      'Enforced Mulish 500/700 typography and 540px fully-round pills across buttons, search, and chips.',
      'Added lightweight dev-only /styleguide cataloging all primitives and states.',
    ],
  },
  {
    version: 'v0.4.0',
    date: '18 October 2026',
    title: 'SaaS Frontend Architecture & DPDP Compliance',
    summary: 'Complete product rebuild with strict DPDP compliance, trilingual elder notices, and full responsive design.',
    changes: [
      'Authored trilingual elder consent notices (English, Hindi, Gujarati) with printable tabletop card.',
      'Added RFC 9116 security.txt vulnerability disclosure file and subprocessor registry.',
      'Implemented typed mock adapter in packages/api-contract with strict production mock-guard.',
      'Configured multi-tenant database integration with Neon serverless Postgres.',
    ],
  },
  {
    version: 'v0.3.0',
    date: '17 October 2026',
    title: 'Speakerphone Resilience & Daily Credit Guards',
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
    title: 'Multi-Tenant Guardian Auth & Emergency Intercom',
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
    title: 'Deterministic 5-Stage Detector & Contest Architecture',
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
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/changelog" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display font-bold text-ink tracking-tight">
              Changelog &amp; Releases
            </h1>
            <p className="text-lead text-body font-medium mt-1">
              Transparent log of model updates, detector improvements, and security releases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline-neutral" size="sm" href="/changelog/rss.xml">
              RSS Feed
            </Button>
            <Button variant="outline-neutral" size="sm" href="/changelog/feed.json">
              JSON Feed
            </Button>
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {CHANGELOG_ENTRIES.map((entry) => (
            <article
              key={entry.version}
              className="bg-surface border border-hairline rounded-md p-6 space-y-3 hover:shadow-level-2 transition-shadow"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{entry.version}</Badge>
                  <h2 className="text-heading font-bold text-ink">{entry.title}</h2>
                </div>
                <TimestampPill>{entry.date}</TimestampPill>
              </div>

              <p className="text-body font-medium text-body leading-relaxed">
                {entry.summary}
              </p>

              <ul className="space-y-1.5 pt-2 border-t border-hairline">
                {entry.changes.map((ch, idx) => (
                  <li key={idx} className="text-caption text-ink font-medium flex items-start gap-2">
                    <span className="text-primary font-bold">●</span>
                    <span>{ch}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
