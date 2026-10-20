'use client';

import React from 'react';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/terms" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Terms of Service" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:notes-bold" width="16" height="16" />
            <span>Service Contract &amp; Technical Disclaimers</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Terms of Service
          </h1>

          <div className="text-caption text-body font-mono border-b border-hairline pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">1. Description of the Service</h2>
            <p className="text-caption font-medium text-body">
              Kavach is an acoustic scam detection companion designed for elderly households. The system functions exclusively on a secondary tabletop device (such as an Android tablet or iPad) that listens via ambient microphone when a user answers their primary phone on speakerphone.
            </p>
            <div className="p-3.5 rounded-md bg-canvas border border-hairline text-caption text-ink font-mono">
              <strong>CRITICAL TECHNICAL NOTICE:</strong> Kavach does NOT tap, intercept, decrypt, or record cellular phone calls, landlines, or VoIP services at the telecommunications network layer.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">2. User Consent and Elder Notification</h2>
            <p className="text-caption font-medium text-body">
              By activating Kavach in a household, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-caption font-medium text-body">
              <li>All elderly family members and household residents have been informed that the tabletop device acts as an audio monitor when speakerphone calls are initiated.</li>
              <li>You have displayed the provided trilingual Elder Consent Notice adjacent to the tablet.</li>
              <li>You will not place Kavach in private bedrooms or spaces where expectations of privacy exist without explicit consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">3. Synthetic Testing &amp; Limitation of Detection Claims</h2>
            <p className="text-caption font-medium text-body">
              All statistical performance metrics reported on this website (such as the 97.3% scam recall rate) are measured within synthetic audio replay testbeds and benchmark simulations (documented in eval/out/summary.md). While Kavach is engineered to catch recognized extortion playbooks, scam syndicates continuously evolve their phrasing. Kavach cannot guarantee prevention of 100% of fraud attempts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">4. Emergency Situations &amp; National Helplines</h2>
            <p className="text-caption font-medium text-body">
              Kavach is an assistive guardian tool, not a certified emergency dispatch or law enforcement agency. In any active extortion or threat situation, the victim or caregiver must immediately disconnect the call and report the incident directly to the National Cybercrime Portal by calling <strong>1930</strong> or visiting <strong>cybercrime.gov.in</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">5. Governing Law and Jurisdiction</h2>
            <p className="text-caption font-medium text-body">
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
