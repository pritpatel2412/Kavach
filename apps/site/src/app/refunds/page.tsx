'use client';

import React from 'react';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/refunds" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Refund Policy" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:card-recive-bold" width="16" height="16" />
            <span>Billing, Cancellations &amp; Guarantees</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>

          <div className="text-caption text-body font-mono border-b border-hairline pb-4">
            Last Updated: 18 October 2026 · Effective Date: Commercial Beta Launch
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-caption font-medium text-body">
              We want every family in India to experience peace of mind. If you purchase a Kavach Plus (₹149/mo) or Kavach Family (₹299/mo) subscription and decide within 14 days that Kavach is not suitable for your elderly parents, we will issue a full 100% refund without requiring any explanation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">2. Subscription Cancellation Anytime</h2>
            <p className="text-caption font-medium text-body">
              You can cancel your recurring monthly or annual subscription at any moment through the Guardian App billing panel. Upon cancellation:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-caption font-medium text-body">
              <li>Your subscription will remain active until the end of your current paid billing period.</li>
              <li>You will not be billed on the subsequent renewal date.</li>
              <li>Your household will transition gracefully to the Free Tier (30 monthly listening minutes + 10 min reserve, with standard neutral warning voice).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">3. Unused Listening Minutes</h2>
            <p className="text-caption font-medium text-body">
              Paid plans include monthly allocated speech-to-text listening minutes (150 mins for Plus, 400 mins for Family). In the event of subscription upgrade or plan modification, unused minutes carry forward for 30 days. Emergency scam reserve minutes (30 mins buffer on Plus, 60 mins on Family) never expire.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">4. How to Request a Refund</h2>
            <p className="text-caption font-medium text-body">
              To request a refund under the 14-day guarantee, simply email <a href="mailto:billing@kavach.ai" className="text-primary font-bold hover:underline">billing@kavach.ai</a> with your registered phone number or transaction ID. Refunds are credited via the original payment method (UPI / Credit Card / NetBanking via Razorpay) within 5 to 7 business days.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
