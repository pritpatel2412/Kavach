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

export default function GrievancePage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Grievance Redressal Mechanism" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="user-id-bold" size={14} color="#c8f542" />
            <span>Statutory Compliance: IT Rules 2021 &amp; DPDP Act 2023</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Grievance Redressal Officer
          </h1>

          <div className="text-xs font-mono text-white/50 border-b border-white/10 pb-4">
            Published in accordance with Information Technology (Intermediary Guidelines) Rules, 2021
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 text-sm text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">1. Designated Grievance Officer</h2>
            <p className="text-xs text-white/70">
              Users and Data Principals may direct complaints regarding personal data processing, terms of service compliance, or privacy concerns to our appointed Grievance Officer:
            </p>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Officer Name</div>
                  <div className="font-heading font-bold text-white text-sm">Pritpal Singh</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Designation</div>
                  <div className="text-white/90">Data Protection &amp; Grievance Redressal Lead</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Direct Grievance Email</div>
                  <a href="mailto:grievance@kavach.ai" className="text-[#c8f542] font-semibold hover:underline">
                    grievance@kavach.ai
                  </a>
                </div>
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Physical Postal Address</div>
                  <div className="text-white/80">
                    Kavach Security Technologies Pvt. Ltd.<br />
                    Koramangala 4th Block, Bengaluru, Karnataka 560034, India
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">2. Grievance Redressal Process &amp; Timelines</h2>
            <div className="space-y-2 text-xs text-white/70">
              <p>
                <strong>Acknowledgement within 24 Hours:</strong> Upon receiving your grievance notice, our office will generate a unique ticket reference ID and acknowledge receipt within twenty-four (24) hours.
              </p>
              <p>
                <strong>Resolution within 15 Days:</strong> In accordance with statutory Indian IT requirements, all grievances will be formally investigated and resolved within fifteen (15) days of receipt.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-white/95">3. Data Protection Board of India (DPBI)</h2>
            <p className="text-xs text-white/70">
              If you remain dissatisfied with the resolution provided by our Grievance Officer, you retain the statutory right to appeal directly to the Data Protection Board of India under the provisions of the DPDP Act 2023.
            </p>
          </section>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
