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

export default function RefundsPage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Refund Policy" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="card-recive-bold" size={14} color="#c8f542" />
            <span>Billing, Cancellations &amp; Guarantees</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Refund &amp; Cancellation Policy
          </h1>

          <div className="text-xs font-mono text-white/50 border-b border-white/10 pb-4">
            Last Updated: 18 October 2026 · Effective Date: Commercial Beta Launch
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 text-sm text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-xs text-white/70">
              We want every family in India to experience peace of mind. If you purchase a Kavach Plus (₹149/mo) or Kavach Family (₹299/mo) subscription and decide within 14 days that Kavach is not suitable for your elderly parents, we will issue a full 100% refund without requiring any explanation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">2. Subscription Cancellation Anytime</h2>
            <p className="text-xs text-white/70">
              You can cancel your recurring monthly or annual subscription at any moment through the Guardian App billing panel. Upon cancellation:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
              <li>Your subscription will remain active until the end of your current paid billing period.</li>
              <li>You will not be billed on the subsequent renewal date.</li>
              <li>Your household will transition gracefully to the Free Tier (60 monthly listening minutes and standard synthetic voice warning).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">3. Unused Listening Minutes</h2>
            <p className="text-xs text-white/70">
              Paid plans include monthly allocated speech-to-text listening minutes (300 mins for Plus, 1,000 mins for Family). In the event of subscription upgrade or plan modification, unused minutes carry forward for 30 days. Emergency reserve minutes (30 mins buffer on all accounts) never expire.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">4. How to Request a Refund</h2>
            <p className="text-xs text-white/70">
              To request a refund under the 14-day guarantee, simply email <a href="mailto:billing@kavach.ai" className="text-[#c8f542] underline">billing@kavach.ai</a> with your registered phone number or transaction ID. Refunds are credited via the original payment method (UPI / Credit Card / NetBanking via Razorpay) within 5 to 7 business days.
            </p>
          </section>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
