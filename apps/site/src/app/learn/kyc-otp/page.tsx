'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';

export default function KycOtpArticle() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader currentPath="/learn" />

      <article className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono text-white/50">
            <a href="/learn" className="hover:text-[#c8f542] flex items-center gap-1">
              <Icon name="arrow-left-linear" size={14} />
              <span>Learn Hub</span>
            </a>
            <span>/</span>
            <span className="text-[#c8f542]">KYC &amp; Urgency Traps</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-white/95 leading-tight">
            Bank KYC Expiry, Electricity Cutoff &amp; SIM Deactivation Threats
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-white/50 border-b border-white/10 pb-6">
            <span>Published: October 2026</span>
            <span>·</span>
            <span>RBI &amp; TRAI Consumer Advisory</span>
            <span>·</span>
            <span>Estimated Reading Time: 4 mins</span>
          </div>
        </div>

        {/* Threat Summary */}
        <GlassCard className="p-6 sm:p-8 space-y-3 border-emerald-400/30 bg-emerald-400/5">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-2">
            <Icon name="phone-calling-rounded-bold" size={16} color="#c8f542" />
            <span>The Daily Attack</span>
          </div>
          <p className="text-xs sm:text-sm text-white/80 font-body leading-relaxed">
            Unlike grand digital arrest operations, &ldquo;Utility Urgency&rdquo; scams hit millions of Indian mobile subscribers daily. Attackers send spoofed SMS messages warning of power cutoff at 9:30 PM, bank account suspension within 24 hours, or SIM card disconnection due to non-updated Aadhaar biometric records.
          </p>
        </GlassCard>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              The Three Common Variants
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-heading font-bold text-white text-base">
                  1. The Electricity / Power Disconnection Threat
                </h3>
                <p className="text-xs text-white/70">
                  <em>&ldquo;Dear consumer, your electricity will be disconnected tonight at 9:30 PM from the power office because your previous month&apos;s bill was not updated. Please immediately contact our electricity officer at 98xxxxxx.&rdquo;</em>
                </p>
                <p className="text-xs text-white/50">
                  When the elder calls, they are told to pay a token ₹10 fee via a malicious link or install an app like AnyDesk or RustDesk so the &ldquo;officer&rdquo; can fix the error. The app then captures their bank MPIN and drains accounts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-heading font-bold text-white text-base">
                  2. Bank Account KYC Suspension
                </h3>
                <p className="text-xs text-white/70">
                  <em>&ldquo;SBI/HDFC Alert: Your NetBanking account will be blocked today due to pending re-KYC. Click here to verify your PAN card and Aadhaar details.&rdquo;</em>
                </p>
                <p className="text-xs text-white/50">
                  The link loads a near-identical phishing portal mimicking State Bank of India or HDFC. The elder enters their user ID, password, and OTP, granting instant access to attackers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-heading font-bold text-white text-base">
                  3. TRAI Mobile Number Disconnection
                </h3>
                <p className="text-xs text-white/70">
                  An automated voice claims: <em>&ldquo;This call is from the Telecom Regulatory Authority of India (TRAI). Your mobile number will be terminated within 2 hours due to illegal advertising and harassment complaints.&rdquo;</em>
                </p>
                <p className="text-xs text-white/50">
                  TRAI has officially clarified that it NEVER calls individual telecom subscribers to disconnect phone numbers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              RBI Golden Rules for Elders
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
              <li><strong>Never download screen-sharing APKs:</strong> No legitimate bank or utility electricity board will ever ask you to install AnyDesk, TeamViewer, or QuickSupport on your mobile phone.</li>
              <li><strong>OTP is strictly private:</strong> Bank staff and electricity officers never require OTP or debit card CVV numbers to verify accounts.</li>
              <li><strong>Always pay bills through official utility apps:</strong> Use official state electricity portals (e.g. BESCOM, MSEDCL, TPDDL) or established UPI apps rather than numbers sent in SMS.</li>
            </ul>
          </section>
        </div>

        {/* MANDATORY NATIONAL HELPLINE FOOTNOTE */}
        <div className="p-6 rounded-2xl border-2 border-amber-400 bg-amber-400/10 text-center space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
            Emergency Action Advisory
          </div>
          <div className="text-lg sm:text-xl font-heading font-bold text-white">
            Hang up immediately and call 1930 or visit cybercrime.gov.in
          </div>
          <p className="text-xs text-white/70 max-w-md mx-auto">
            If you shared an OTP or downloaded a screen-sharing tool, switch on Airplane Mode immediately and call 1930 to freeze unauthorized debit transfers.
          </p>
          <div className="pt-2">
            <Button variant="lime" size="sm" href="tel:1930" icon="phone-bold">
              Call 1930 Now
            </Button>
          </div>
        </div>

        <SiteFooter />
      </article>
    </Frame>
  );
}
