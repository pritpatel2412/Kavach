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

export default function CourierParcelArticle() {
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
            <span className="text-amber-300">Courier Narcotics Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-white/95 leading-tight">
            The &ldquo;FedEx Parcel / Customs Narcotics&rdquo; Extortion Playbook
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-white/50 border-b border-white/10 pb-6">
            <span>Published: October 2026</span>
            <span>·</span>
            <span>Customs & Police Advisory Factsheet</span>
            <span>·</span>
            <span>Estimated Reading Time: 5 mins</span>
          </div>
        </div>

        {/* Threat Summary */}
        <GlassCard className="p-6 sm:p-8 space-y-3 border-amber-400/30 bg-amber-400/5">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
            <Icon name="box-bold" size={16} color="#f5b942" />
            <span>The Setup</span>
          </div>
          <p className="text-xs sm:text-sm text-white/80 font-body leading-relaxed">
            The call begins with an automated IVR: <em>&ldquo;Your FedEx shipment to Taiwan with tracking ID 482910 has been detained by Mumbai Customs due to illegal contraband.&rdquo;</em> When the bewildered victim presses 1 to clarify, a fake customer support representative transfers them to an &ldquo;officer at the Narcotics Control Bureau (NCB)&rdquo;.
          </p>
        </GlassCard>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              The Fabricated Package Inventory
            </h2>
            <p>
              Scammers read out a detailed, frightening inventory of what was allegedly seized inside the package addressed in the victim&apos;s name:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/70 text-sm">
              <li>5 expired Indian passports</li>
              <li>140 grams of MDMA (Ecstasy) or synthetic narcotics</li>
              <li>Fake credit cards linked to international cartels</li>
              <li>4 pen drives with encrypted bank transaction records</li>
            </ul>
            <p>
              When the senior citizen insists they never sent any parcel, the impersonator replies: <em>&ldquo;Sir, that means someone has stolen your Aadhaar credentials to commit high treason and cross-border drug smuggling. You are now the prime suspect in an international criminal syndicate.&rdquo;</em>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              The Video Escalation
            </h2>
            <p>
              To &ldquo;clear their name,&rdquo; the victim is forced onto a video call via Skype or WhatsApp. Scammers configure their webcams with a green-screen background showing official police emblems, Indian national flags, walkie-talkie audio chatter, and individuals wearing forged police uniforms.
            </p>
            <p>
              They then present a forged document titled: <strong>&ldquo;Arrest and Seizure Order by Cyber Crime Cell &amp; Narcotics Control Bureau&rdquo;</strong>, bearing fake signatures of real IPS officers and stamped seals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              FedEx &amp; DHL Official Stance
            </h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-2">
              <p>
                Leading international logistics couriers (FedEx, DHL, BlueDart) have issued public warnings:
              </p>
              <p className="italic">
                &ldquo;FedEx never requests personal financial details, account numbers, or money transfers to release detained shipments. FedEx never connects customers directly to police or customs officials via automated telephone calls.&rdquo;
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              Three Rules to Stay Safe
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-white/70">
              <li><strong>Never panic over unknown tracking numbers:</strong> If you did not send a parcel, you are not responsible for any package. Simply disconnect the call.</li>
              <li><strong>Do not accept call transfers to &ldquo;police&rdquo;:</strong> Genuine courier companies cannot and do not patch customer calls directly to police stations or customs officials.</li>
              <li><strong>Never move money to &ldquo;verify innocence&rdquo;:</strong> Indian law enforcement never demands citizens transfer funds to test account legitimacy.</li>
            </ol>
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
            If you or an elder relative received such a call, report it immediately to the national cybercrime portal or call the toll-free helpline.
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
