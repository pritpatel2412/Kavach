'use client';

import React from 'react';
import { KavachLogo, CountrySelector } from '@kavach/ui';

export function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-hairline font-sans text-body text-caption pt-12 pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Second-Device Disclaimer */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <KavachLogo size={28} showWordmark={true} />
            <p className="text-caption text-body leading-relaxed">
              Kavach listens on a dedicated second device when you take a call on speaker. We do not tap, record, or intercept telco lines.
            </p>
            <div className="p-2.5 rounded-md border border-hairline bg-canvas text-caption text-body font-mono">
              <span>National Helpline: </span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-bold hover:underline"
              >
                Dial 1930
              </a>
            </div>
            <div className="pt-2">
              <CountrySelector />
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-2">
            <div className="font-heading font-bold text-ink text-ui uppercase tracking-wider mb-3">
              Product
            </div>
            <div><a href="/how-it-works" className="hover:text-primary transition-colors">How It Works</a></div>
            <div><a href="/features" className="hover:text-primary transition-colors">Detection Engine</a></div>
            <div><a href="/pricing" className="hover:text-primary transition-colors">Pricing Plans</a></div>
            <div><a href="/pricing#waitlist" className="hover:text-primary transition-colors">Private Beta Waitlist</a></div>
            <div><a href="http://localhost:3001" className="hover:text-primary transition-colors">Guardian Dashboard</a></div>
            <div><a href="/styleguide" className="hover:text-primary transition-colors font-bold text-primary">Design System (/styleguide)</a></div>
          </div>

          {/* Col 3: Learn & Advisories */}
          <div className="space-y-2">
            <div className="font-heading font-bold text-ink text-ui uppercase tracking-wider mb-3">
              Learn & Advisories
            </div>
            <div><a href="/learn" className="hover:text-primary transition-colors">Scam Knowledge Base</a></div>
            <div><a href="/learn/digital-arrest" className="hover:text-primary transition-colors">Digital Arrest Scam Guide</a></div>
            <div><a href="/learn/courier-parcel" className="hover:text-primary transition-colors">FedEx/Customs Narcotics</a></div>
            <div><a href="/learn/kyc-otp" className="hover:text-primary transition-colors">Bank KYC & SIM Deactivation</a></div>
            <div><a href="/help" className="hover:text-primary transition-colors">Elder Setup Tutorial</a></div>
          </div>

          {/* Col 4: Trust & Company */}
          <div className="space-y-2">
            <div className="font-heading font-bold text-ink text-ui uppercase tracking-wider mb-3">
              Trust & Company
            </div>
            <div><a href="/changelog" className="hover:text-primary transition-colors">Changelog & Releases</a></div>
            <div><a href="/status" className="hover:text-primary transition-colors">System Status</a></div>
            <div><a href="/security" className="hover:text-primary transition-colors">Security Architecture</a></div>
            <div><a href="/subprocessors" className="hover:text-primary transition-colors">Subprocessors & Vendors</a></div>
            <div><a href="/support" className="hover:text-primary transition-colors font-semibold text-primary">Customer Support</a></div>
            <div><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></div>
          </div>

          {/* Col 5: Legal & DPDP Compliance */}
          <div className="space-y-2">
            <div className="font-heading font-bold text-ink text-ui uppercase tracking-wider mb-3">
              Legal & Compliance
            </div>
            <div><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></div>
            <div><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></div>
            <div><a href="/consent-notice" className="hover:text-primary transition-colors">Elder Consent Notice</a></div>
            <div><a href="/grievance" className="hover:text-primary transition-colors">Grievance Officer (IT Rules)</a></div>
            <div><a href="/refunds" className="hover:text-primary transition-colors">Refund & Cancellation</a></div>
            <div><a href="/acceptable-use" className="hover:text-primary transition-colors">Acceptable Use Policy</a></div>
            <div><a href="/cookies" className="hover:text-primary transition-colors">Cookie Notice</a></div>
          </div>
        </div>

        {/* Foot Row with Social Icons and Legal Notes */}
        <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-muted">
          <div>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_BRAND_NAME || "Kavach"} Security Technologies. Strictly synthetic evaluation data.</div>
          <div className="flex items-center gap-3">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-circle bg-canvas border border-hairline flex items-center justify-center text-body hover:text-ink hover:border-body">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:share-circle-bold" width="16" height="16" />
            </a>
            <a href={process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "https://github.com/pritpatel2412/Kavach"} target="_blank" rel="noreferrer" aria-label="GitHub Repository" className="w-8 h-8 rounded-circle bg-canvas border border-hairline flex items-center justify-center text-body hover:text-ink hover:border-body">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:code-circle-bold" width="16" height="16" />
            </a>
            <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@kavach.ai"}`} aria-label="Email Support" className="w-8 h-8 rounded-circle bg-canvas border border-hairline flex items-center justify-center text-body hover:text-ink hover:border-body">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:letter-bold" width="16" height="16" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
