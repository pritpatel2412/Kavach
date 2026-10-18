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

export default function CookieNoticePage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Cookie Notice" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="cookie-bold" size={14} color="#c8f542" />
            <span>Zero Third-Party Advertising Trackers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Cookie &amp; Storage Notice
          </h1>

          <div className="text-xs font-mono text-white/50 border-b border-white/10 pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 text-sm text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">1. Our Commitment: No Ad Trackers</h2>
            <p className="text-xs text-white/70">
              Kavach does not employ third-party advertising cookies, Facebook Pixels, or cross-site tracking beacons. We do not sell or monetize browsing behavior.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">2. Essential Cookies We Use</h2>
            <div className="space-y-2 text-xs text-white/70">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-white">kavach_session</div>
                  <div className="text-white/50 text-[11px]">Guardian authentication token. Required to keep you securely signed in.</div>
                </div>
                <span className="font-mono text-[10px] text-[#c8f542] px-2 py-0.5 rounded bg-[#c8f542]/10 border border-[#c8f542]/20">
                  Strictly Essential
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-white">kavach_device_token</div>
                  <div className="text-white/50 text-[11px]">Tabletop kiosk pairing identity. Enables tablet sync with household.</div>
                </div>
                <span className="font-mono text-[10px] text-[#c8f542] px-2 py-0.5 rounded bg-[#c8f542]/10 border border-[#c8f542]/20">
                  Strictly Essential
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">3. Local Device Storage (IndexedDB / CacheStorage)</h2>
            <p className="text-xs text-white/70">
              The tabletop device uses your browser’s local storage to cache pre-rendered familial audio clips (e.g. &ldquo;Mummy, call kaat do!&rdquo;) so that warning audio plays instantaneously even if Wi-Fi experience high latency during an active call.
            </p>
          </section>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
