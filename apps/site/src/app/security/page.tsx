'use client';

import React from 'react';
import {
  Button,
  Badge,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function SecurityArchitecturePage() {
  const securityPillars = [
    {
      title: 'Acoustic Volatility & Zero Audio Disk Persistence',
      desc: 'Microphone audio chunks (16 kHz PCM) reside exclusively in volatile server RAM for streaming speech recognition and are discarded in real time. We maintain zero raw audio files on disks or object storage.',
      badge: 'Architecture',
    },
    {
      title: 'Multi-Tenant Cryptographic Isolation',
      desc: 'All API routes require high-entropy bearer tokens issued on guardian registration. Cross-tenant access is strictly rejected: Guardian A can never inspect, preview, or delete sessions belonging to Guardian B.',
      badge: 'Identity',
    },
    {
      title: 'Ephemeral 7-Day Transcript Retention',
      desc: 'High-risk transcript excerpts (max 160 characters) are encrypted with AES-256 at rest and automatically wiped by an automated ledger sweeper after 7 days.',
      badge: 'Storage',
    },
    {
      title: 'Speech Processing & Regional Infrastructure',
      desc: 'Speech recognition and synthesis execute through Gnani.ai data centers within India. Operational databases are hosted on serverless PostgreSQL in AWS Singapore (ap-southeast-1) with zero audio or call transcripts stored.',
      badge: 'Infrastructure',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/security" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Security Architecture" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:shield-check-bold" width="16" height="16" />
            <span>Threat Model &amp; Defense in Depth</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Security &amp; Architecture Standards
          </h1>

          <p className="text-lead text-body font-medium leading-relaxed">
            Kavach is designed around a zero-trust threat model to guarantee that safeguarding vulnerable elders never turns into an eavesdropping liability.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityPillars.map((p, idx) => (
            <div key={idx} className="bg-surface border border-hairline rounded-md p-6 space-y-2 hover:shadow-level-2 transition-shadow">
              <div className="flex items-center justify-between">
                <Badge variant="filled">{p.badge}</Badge>
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:shield-check-bold" width="18" height="18" class="text-primary" />
              </div>
              <h3 className="text-ui font-bold text-ink">{p.title}</h3>
              <p className="text-caption font-medium text-body leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Vulnerability Disclosure RFC 9116 */}
        <div className="bg-surface border border-hairline rounded-md p-6 space-y-3 shadow-sm">
          <h2 className="text-heading font-bold text-ink">Coordinated Vulnerability Disclosure (RFC 9116)</h2>
          <p className="text-body font-medium text-body leading-relaxed">
            We welcome responsible security research. If you discover a vulnerability in Kavach systems, APIs, or acoustic pipelines, please report it via our verified security contact.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button variant="outline-neutral" size="sm" href="/.well-known/security.txt">
              View /.well-known/security.txt
            </Button>
            <Button variant="outline-green" size="sm" href="mailto:security@kavach.ai">
              security@kavach.ai
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
