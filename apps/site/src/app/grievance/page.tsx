'use client';

import React from 'react';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function GrievancePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/grievance" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Grievance Redressal Mechanism" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:user-id-bold" width="16" height="16" />
            <span>Statutory Compliance: IT Rules 2021 &amp; DPDP Act 2023</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Grievance Redressal Officer
          </h1>

          <div className="text-caption text-body font-mono border-b border-hairline pb-4">
            Published in accordance with Information Technology (Intermediary Guidelines) Rules, 2021
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">1. Designated Grievance Officer</h2>
            <p className="text-caption font-medium text-body">
              Users and Data Principals may direct complaints regarding personal data processing, terms of service compliance, or privacy concerns to our appointed Grievance Officer:
            </p>

            <div className="p-4 rounded-md bg-canvas border border-hairline space-y-3 text-caption font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-muted uppercase font-mono text-micro">Officer Name</div>
                  <div className="font-bold text-ink text-ui">Pritpal Singh</div>
                </div>
                <div>
                  <div className="text-muted uppercase font-mono text-micro">Designation</div>
                  <div className="text-ink font-medium">Data Protection &amp; Grievance Redressal Lead</div>
                </div>
                <div>
                  <div className="text-muted uppercase font-mono text-micro">Direct Grievance Email</div>
                  <a href="mailto:grievance@kavach.ai" className="text-primary font-bold hover:underline">
                    grievance@kavach.ai
                  </a>
                </div>
                <div>
                  <div className="text-muted uppercase font-mono text-micro">Physical Postal Address</div>
                  <div className="text-ink font-medium">
                    Kavach Security Technologies Pvt. Ltd.<br />
                    Koramangala 4th Block, Bengaluru, Karnataka 560034, India
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">2. Grievance Redressal Process &amp; Timelines</h2>
            <div className="space-y-2 text-caption font-medium text-body">
              <p>
                <strong>Acknowledgement within 24 Hours:</strong> Upon receiving your grievance notice, our office will generate a unique ticket reference ID and acknowledge receipt within twenty-four (24) hours.
              </p>
              <p>
                <strong>Resolution within 15 Days:</strong> In accordance with statutory Indian IT requirements, all grievances will be formally investigated and resolved within fifteen (15) days of receipt.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading font-bold text-ink">3. Data Protection Board of India (DPBI)</h2>
            <p className="text-caption font-medium text-body">
              If you remain dissatisfied with the resolution provided by our Grievance Officer, you retain the statutory right to appeal directly to the Data Protection Board of India under the provisions of the DPDP Act 2023.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
