'use client';

import React from 'react';
import {
  Button,
} from '@kavach/ui';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';

export default function CourierParcelArticle() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/learn" />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-caption font-bold text-muted">
            <a href="/learn" className="hover:text-primary transition-colors">Learn Hub</a>
            <span>/</span>
            <span className="text-warm">Courier Narcotics Playbook</span>
          </div>

          <h1 className="text-display sm:text-[40px] font-bold text-ink leading-tight tracking-tight">
            The &ldquo;FedEx Parcel / Customs Narcotics&rdquo; Extortion Playbook
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-caption text-body border-b border-hairline pb-4">
            <span>Published: October 2026</span>
            <span>·</span>
            <span className="text-primary font-bold">Customs & Police Advisory Factsheet</span>
            <span>·</span>
            <span>Estimated Reading Time: 5 mins</span>
          </div>
        </div>

        {/* Threat Summary */}
        <div className="bg-warning-surface border border-warning-surface rounded-md p-6 space-y-2 text-warning-text">
          <div className="text-caption font-bold uppercase tracking-wider flex items-center gap-2">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:box-bold" width="18" height="18" />
            <span>The Setup</span>
          </div>
          <p className="text-caption font-medium leading-relaxed">
            The call begins with an automated IVR: <em>&ldquo;Your FedEx shipment to Taiwan with tracking ID 482910 has been detained by Mumbai Customs due to illegal contraband.&rdquo;</em> When the bewildered victim presses 1 to clarify, a fake customer support representative transfers them to an &ldquo;officer at the Narcotics Control Bureau (NCB)&rdquo;.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-body font-medium text-body leading-relaxed">
          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-4">
            <h2 className="text-heading font-bold text-ink">
              The Fabricated Package Inventory
            </h2>
            <p>
              Scammers read out a detailed, frightening inventory of what was allegedly seized inside the package addressed in the victim&apos;s name:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-body text-caption font-medium">
              <li>5 expired Indian passports</li>
              <li>140 grams of MDMA (Ecstasy) or synthetic narcotics</li>
              <li>Fake credit cards linked to international cartels</li>
              <li>4 pen drives with encrypted bank transaction records</li>
            </ul>
            <p>
              When the senior citizen insists they never sent any parcel, the impersonator replies: <em>&ldquo;Sir, that means someone has stolen your Aadhaar credentials to commit high treason and cross-border drug smuggling. You are now the prime suspect in an international criminal syndicate.&rdquo;</em>
            </p>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-3">
            <h2 className="text-heading font-bold text-ink">
              The Video Escalation
            </h2>
            <p>
              To &ldquo;clear their name,&rdquo; the victim is forced onto a video call via Skype or WhatsApp. Scammers configure their webcams with a green-screen background showing official police emblems, Indian national flags, walkie-talkie audio chatter, and individuals wearing forged police uniforms.
            </p>
            <p>
              They then present a forged document titled: <strong>&ldquo;Arrest and Seizure Order by Cyber Crime Cell &amp; Narcotics Control Bureau&rdquo;</strong>, bearing fake signatures of real IPS officers and stamped seals.
            </p>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-3">
            <h2 className="text-heading font-bold text-ink">
              FedEx &amp; DHL Official Stance
            </h2>
            <div className="p-4 rounded-md bg-canvas border border-hairline text-caption text-body space-y-2">
              <p>Leading international logistics couriers (FedEx, DHL, BlueDart) have issued public warnings:</p>
              <p className="italic font-medium text-ink">
                &ldquo;FedEx never requests personal financial details, account numbers, or money transfers to release detained shipments. FedEx never connects customers directly to police or customs officials via automated telephone calls.&rdquo;
              </p>
            </div>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-3">
            <h2 className="text-heading font-bold text-ink">
              Three Rules to Stay Safe
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-caption font-medium text-body">
              <li><strong>Never panic over unknown tracking numbers:</strong> If you did not send a parcel, you are not responsible for any package. Simply disconnect the call.</li>
              <li><strong>Do not accept call transfers to &ldquo;police&rdquo;:</strong> Genuine courier companies cannot and do not patch customer calls directly to police stations or customs officials.</li>
              <li><strong>Never move money to &ldquo;verify innocence&rdquo;:</strong> Indian law enforcement never demands citizens transfer funds to test account legitimacy.</li>
            </ol>
          </section>
        </div>

        {/* National Helpline Action Box */}
        <div className="bg-surface border-2 border-hot rounded-md p-6 sm:p-8 text-center space-y-3 shadow-sm">
          <div className="text-caption font-mono font-bold uppercase text-hot">
            Emergency Action Advisory
          </div>
          <div className="text-heading-lg font-bold text-ink">
            Hang up immediately and call 1930 or visit cybercrime.gov.in
          </div>
          <p className="text-caption text-body max-w-md mx-auto">
            If you or an elder relative received such a call, report it immediately to the national cybercrime portal or call the toll-free helpline.
          </p>
          <div className="pt-2">
            <Button variant="danger" size="md" href="tel:1930">
              Call 1930 Now
            </Button>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
