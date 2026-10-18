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

export default function TermsOfServicePage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Terms of Service" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="notes-bold" size={14} color="#c8f542" />
            <span>Service Contract &amp; Technical Disclaimers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Terms of Service
          </h1>

          <div className="text-xs font-mono text-white/50 border-b border-white/10 pb-4">
            Last Updated: 18 October 2026 · Effective Date: Private Beta Launch
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 text-sm text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">1. Description of the Service</h2>
            <p className="text-xs text-white/70">
              Kavach is an acoustic scam detection companion designed for elderly households. The system functions exclusively on a secondary tabletop device (such as an Android tablet or iPad) that listens via ambient microphone when a user answers their primary phone on speakerphone.
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 font-mono">
              <strong>CRITICAL TECHNICAL NOTICE:</strong> Kavach does NOT tap, intercept, decrypt, or record cellular phone calls, landlines, or VoIP services at the telecommunications network layer.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">2. User Consent and Elder Notification</h2>
            <p className="text-xs text-white/70">
              By activating Kavach in a household, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
              <li>All elderly family members and household residents have been informed that the tabletop device acts as an audio monitor when speakerphone calls are initiated.</li>
              <li>You have displayed the provided trilingual Elder Consent Notice adjacent to the tablet.</li>
              <li>You will not place Kavach in private bedrooms or spaces where expectations of privacy exist without explicit consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">3. Synthetic Testing &amp; Limitation of Detection Claims</h2>
            <p className="text-xs text-white/70">
              All statistical performance metrics reported on this website (such as the 97.3% scam recall rate) are measured within synthetic audio replay testbeds and benchmark simulations (documented in eval/out/summary.md). While Kavach is engineered to catch recognized extortion playbooks, scam syndicates continuously evolve their phrasing. Kavach cannot guarantee prevention of 100% of fraud attempts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">4. Emergency Situations &amp; National Helplines</h2>
            <p className="text-xs text-white/70">
              Kavach is an assistive guardian tool, not a certified emergency dispatch or law enforcement agency. In any active extortion or threat situation, the victim or caregiver must immediately disconnect the call and report the incident directly to the National Cybercrime Portal by calling <strong>1930</strong> or visiting <strong>cybercrime.gov.in</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">5. Governing Law and Jurisdiction</h2>
            <p className="text-xs text-white/70">
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
            </p>
          </section>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
