'use client';

import React from 'react';
import {
  Icon,
  Badge,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function CookieNoticePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LegalBanner category="Cookie Notice" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge variant="neutral-subtle" className="font-mono text-xs">
              <Icon name="cookie-bold" size={14} className="text-primary mr-1" />
              Zero Third-Party Advertising Trackers
            </Badge>
          </div>

          <h1 className="text-display font-heading font-bold text-ink">
            Cookie &amp; Storage Notice
          </h1>

          <div className="text-caption font-mono text-muted border-b border-hairline pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-ui text-body leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-heading font-heading font-bold text-ink">1. Our Commitment: No Ad Trackers</h2>
            <p className="text-body text-ui">
              Kavach does not employ third-party advertising cookies, Facebook Pixels, or cross-site tracking beacons. We do not sell or monetize browsing behavior.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-heading font-bold text-ink">2. Essential Cookies We Use</h2>
            <div className="space-y-3 text-ui">
              <div className="p-4 rounded-md bg-canvas border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-ink">kavach_session</div>
                  <div className="text-muted text-caption">Guardian authentication token. Required to keep you securely signed in.</div>
                </div>
                <Badge variant="primary" className="self-start sm:self-center">
                  Strictly Essential
                </Badge>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-ink">kavach_device_token</div>
                  <div className="text-muted text-caption">Tabletop kiosk pairing identity. Enables tablet sync with household.</div>
                </div>
                <Badge variant="primary" className="self-start sm:self-center">
                  Strictly Essential
                </Badge>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-heading font-heading font-bold text-ink">3. Local Device Storage (IndexedDB / CacheStorage)</h2>
            <p className="text-body text-ui">
              The tabletop device uses your browser’s local storage to cache pre-rendered familial audio clips (e.g. &ldquo;Mummy, call kaat do!&rdquo;) so that warning audio plays instantaneously even if Wi-Fi experiences high latency during an active call.
            </p>
          </section>
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}

