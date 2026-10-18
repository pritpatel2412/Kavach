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
import { LegalBanner } from '../../components/LegalBanner';

export default function SecurityArchitecturePage() {
  const securityPillars = [
    {
      title: 'Acoustic Volatility & Zero Audio Disk Persistence',
      desc: 'Microphone audio chunks (16 kHz PCM) reside exclusively in volatile server RAM for streaming speech recognition and are discarded in real time. We maintain zero raw audio files on disks or object storage.',
      badge: 'Architecture',
      icon: 'soundwave-square-bold',
    },
    {
      title: 'Multi-Tenant Cryptographic Isolation',
      desc: 'All API routes require high-entropy bearer tokens issued on guardian registration. Cross-tenant access is strictly rejected: Guardian A can never inspect, preview, or delete sessions belonging to Guardian B.',
      badge: 'Identity',
      icon: 'key-bold',
    },
    {
      title: 'Ephemeral 7-Day Transcript Retention',
      desc: 'High-risk transcript excerpts (max 160 characters) are encrypted with AES-256 at rest and automatically wiped by an automated ledger sweeper after 7 days.',
      badge: 'Storage',
      icon: 'clock-circle-bold',
    },
    {
      title: 'Sovereign Indian Data Infrastructure',
      desc: 'All speech recognition, text synthesis, and database operations execute within verified data centers located physically within the Republic of India, complying fully with DPDP Act 2023 localization.',
      badge: 'Compliance',
      icon: 'map-point-bold',
    },
  ];

  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Security Architecture" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="shield-check-bold" size={14} color="#c8f542" />
            <span>Threat Model &amp; Defense in Depth</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Security &amp; Architecture Standards
          </h1>

          <p className="text-xs sm:text-sm text-white/60 font-body">
            How Kavach enforces cryptographic boundaries to protect families from eavesdropping and surveillance risks.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityPillars.map((p, idx) => (
            <GlassCard key={idx} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/18 bg-white/5 text-white/70">
                  {p.badge}
                </span>
                <Icon name={p.icon} size={20} color="#c8f542" />
              </div>
              <h3 className="font-heading font-bold text-white/90 text-sm">{p.title}</h3>
              <p className="text-xs text-white/60 font-body leading-relaxed">{p.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* Vulnerability Disclosure Section */}
        <GlassCard className="p-6 sm:p-8 space-y-4 border-[#c8f542]/30">
          <div className="flex items-center gap-2.5">
            <Icon name="bug-bold" size={20} color="#c8f542" />
            <h2 className="font-heading font-bold text-white/95 text-base">
              Vulnerability Disclosure Program (security.txt)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
            We welcome responsible security research from the global infosec community. If you discover a vulnerability or security flaw, please review our disclosure standards and report it directly:
          </p>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>Primary Security Contact: security@kavach.ai</span>
            <a
              href="/.well-known/security.txt"
              target="_blank"
              className="text-[#c8f542] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View RFC 9116 security.txt</span>
              <Icon name="arrow-right-up-linear" size={14} />
            </a>
          </div>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
