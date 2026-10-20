'use client';

import React from 'react';
import {
  Button,
} from '@kavach/ui';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';

export default function KycOtpArticle() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/learn" />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-caption font-bold text-muted">
            <a href="/learn" className="hover:text-primary transition-colors">Learn Hub</a>
            <span>/</span>
            <span className="text-primary">KYC &amp; Urgency Traps</span>
          </div>

          <h1 className="text-display sm:text-[40px] font-bold text-ink leading-tight tracking-tight">
            Bank KYC Expiry, Electricity Cutoff &amp; SIM Deactivation Threats
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-caption text-body border-b border-hairline pb-4">
            <span>Published: October 2026</span>
            <span>·</span>
            <span className="text-primary font-bold">RBI &amp; TRAI Consumer Advisory</span>
            <span>·</span>
            <span>Estimated Reading Time: 4 mins</span>
          </div>
        </div>

        {/* Threat Summary */}
        <div className="bg-warning-surface border border-warning-surface rounded-md p-6 space-y-2 text-warning-text">
          <div className="text-caption font-bold uppercase tracking-wider flex items-center gap-2">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:phone-calling-rounded-bold" width="18" height="18" />
            <span>The Daily Attack</span>
          </div>
          <p className="text-caption font-medium leading-relaxed">
            Unlike grand digital arrest operations, &ldquo;Utility Urgency&rdquo; scams hit millions of Indian mobile subscribers daily. Attackers send spoofed SMS messages warning of power cutoff at 9:30 PM, bank account suspension within 24 hours, or SIM card disconnection due to non-updated Aadhaar biometric records.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-body font-medium text-body leading-relaxed">
          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-4">
            <h2 className="text-heading font-bold text-ink">
              The Three Common Variants
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <h3 className="font-bold text-ink text-ui">1. Electricity Bill &ldquo;Power Cut at 9:30 PM&rdquo;</h3>
                <p className="text-caption text-body">
                  SMS warns: <em>&ldquo;Dear consumer, your electricity will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please immediately contact power officer at 98xxxxxx.&rdquo;</em> When called, the scammer instructs the victim to download AnyDesk or TeamViewer QuickSupport.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <h3 className="font-bold text-ink text-ui">2. Bank Pan/Aadhaar KYC Re-Verification</h3>
                <p className="text-caption text-body">
                  Caller claims to be from SBI, HDFC, or ICICI customer care: <em>&ldquo;Your net banking and debit card have been frozen because your KYC re-verification is pending under RBI mandate.&rdquo;</em> They send an APK file via WhatsApp disguised as &ldquo;SBI Yono Verification Tool&rdquo; which intercepts incoming SMS OTPs.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <h3 className="font-bold text-ink text-ui">3. Telecom Department (DoT / TRAI) SIM Deactivation</h3>
                <p className="text-caption text-body">
                  Automated IVR call stating: <em>&ldquo;Your mobile number will be terminated within 2 hours by order of Department of Telecommunications due to 23 complaints of obscene messages.&rdquo;</em> Directs the user to press 9 to connect with an executive who demands Aadhaar biometric verification fees.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-3">
            <h2 className="text-heading font-bold text-ink">
              RBI Golden Guidelines for Consumers
            </h2>
            <div className="p-4 rounded-md bg-canvas border border-hairline text-caption text-body space-y-2">
              <p>Reserve Bank of India (RBI) circular on electronic banking safety:</p>
              <ul className="list-disc pl-5 space-y-1.5 font-medium text-ink">
                <li>Banks NEVER request OTP, PIN, UPI MPIN, or passwords over the phone.</li>
                <li>Banks NEVER send executive visits or WhatsApp links to update KYC.</li>
                <li>Utility electricity providers NEVER disconnect supply at night without written physical postal notice.</li>
              </ul>
            </div>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-3">
            <h2 className="text-heading font-bold text-ink">
              How Kavach Protects During These Calls
            </h2>
            <p>
              When an elder is on speakerphone reading an SMS or answering an aggressive utility caller, Kavach&apos;s real-time parser flags dangerous trigger words: <em>&ldquo;AnyDesk&rdquo;</em>, <em>&ldquo;QuickSupport&rdquo;</em>, <em>&ldquo;OTP batao&rdquo;</em>, <em>&ldquo;bijli cut jayegi&rdquo;</em>, and <em>&ldquo;SIM block&rdquo;</em>.
            </p>
            <p>
              The tabletop device instantly speaks: <strong>&ldquo;Warning: Bank and electricity boards never ask for OTP or remote app downloads. Please disconnect.&rdquo;</strong>
            </p>
          </section>
        </div>

        {/* National Helpline Action Box */}
        <div className="bg-surface border-2 border-hot rounded-md p-6 sm:p-8 text-center space-y-3 shadow-sm">
          <div className="text-caption font-mono font-bold uppercase text-hot">
            Emergency Action Advisory
          </div>
          <div className="text-heading-lg font-bold text-ink">
            Report Suspicious Numbers to Chakshu (DoT) or 1930
          </div>
          <p className="text-caption text-body max-w-md mx-auto">
            You can report fraudulent SMS and SIM deactivation callers to the Department of Telecommunications Chakshu portal at sancharsaathi.gov.in.
          </p>
          <div className="pt-2">
            <Button variant="danger" size="md" href="tel:1930">
              Call 1930 Helpline
            </Button>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
