'use client';

import React from 'react';
import { KavachLogo, Icon } from '@kavach/ui';

export function SiteFooter() {
  return (
    <footer className="relative z-10 pt-12 pb-8 border-t border-white/10 text-xs font-body text-white/60">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Col 1: Brand & Second-Device Disclaimer */}
        <div className="col-span-2 md:col-span-1 space-y-3">
          <KavachLogo size={28} showWordmark={true} />
          <p className="text-[11px] text-white/50 leading-relaxed font-body">
            Kavach listens on a dedicated second device when you take a call on speaker. We do not tap, record, or intercept telco lines.
          </p>
          <div className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/50 font-mono">
            <span>Helpline: </span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-bold hover:underline"
            >
              Dial 1930
            </a>
          </div>
        </div>

        {/* Col 2: Product */}
        <div className="space-y-2">
          <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">
            Product
          </div>
          <div><a href="/how-it-works" className="hover:text-[#c8f542] transition-colors">How It Works</a></div>
          <div><a href="/features" className="hover:text-[#c8f542] transition-colors">Detection Engine</a></div>
          <div><a href="/pricing" className="hover:text-[#c8f542] transition-colors">Pricing Plans</a></div>
          <div><a href="/pricing#waitlist" className="hover:text-[#c8f542] transition-colors">Private Beta Waitlist</a></div>
          <div><a href="http://localhost:3001" className="hover:text-[#c8f542] transition-colors">Guardian Dashboard</a></div>
        </div>

        {/* Col 3: Learn & Guides */}
        <div className="space-y-2">
          <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">
            Learn & Advisories
          </div>
          <div><a href="/learn" className="hover:text-[#c8f542] transition-colors">Scam Knowledge Base</a></div>
          <div><a href="/learn/digital-arrest" className="hover:text-[#c8f542] transition-colors">Digital Arrest Scam Guide</a></div>
          <div><a href="/learn/courier-parcel" className="hover:text-[#c8f542] transition-colors">FedEx/Customs Narcotics</a></div>
          <div><a href="/learn/kyc-otp" className="hover:text-[#c8f542] transition-colors">Bank KYC & SIM Deactivation</a></div>
          <div><a href="/help" className="hover:text-[#c8f542] transition-colors">Elder Setup Tutorial</a></div>
        </div>

        {/* Col 4: Trust & Transparency */}
        <div className="space-y-2">
          <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">
            Trust & Company
          </div>
          <div><a href="/changelog" className="hover:text-[#c8f542] transition-colors">Changelog & Releases</a></div>
          <div><a href="/status" className="hover:text-[#c8f542] transition-colors">System Status</a></div>
          <div><a href="/security" className="hover:text-[#c8f542] transition-colors">Security Architecture</a></div>
          <div><a href="/subprocessors" className="hover:text-[#c8f542] transition-colors">Subprocessors & Vendors</a></div>
          <div><a href="/contact" className="hover:text-[#c8f542] transition-colors">Contact Support</a></div>
        </div>

        {/* Col 5: Legal & DPDP Compliance */}
        <div className="space-y-2">
          <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">
            Legal & Compliance
          </div>
          <div><a href="/privacy" className="hover:text-[#c8f542] transition-colors">Privacy Policy</a></div>
          <div><a href="/terms" className="hover:text-[#c8f542] transition-colors">Terms of Service</a></div>
          <div><a href="/consent-notice" className="hover:text-[#c8f542] transition-colors">Elder Consent Notice (3 Lang)</a></div>
          <div><a href="/grievance" className="hover:text-[#c8f542] transition-colors">Grievance Officer (IT Rules)</a></div>
          <div><a href="/refunds" className="hover:text-[#c8f542] transition-colors">Refund & Cancellation</a></div>
          <div><a href="/acceptable-use" className="hover:text-[#c8f542] transition-colors">Acceptable Use Policy</a></div>
          <div><a href="/cookies" className="hover:text-[#c8f542] transition-colors">Cookie Notice</a></div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40 font-mono">
        <div>&copy; 2026 Kavach Security Inc. Strictly synthetic evaluation data.</div>
        <div className="flex items-center gap-4">
          <span>Zero raw audio retained</span>
          <span>·</span>
          <span>DPDP Act 2023 Aligned</span>
          <span>·</span>
          <span>Bangalore, India</span>
        </div>
      </div>
    </footer>
  );
}
