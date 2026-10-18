'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  StageChip,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';

export default function DigitalArrestArticle() {
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
            <span className="text-[#ff5a4d]">Digital Arrest Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-white/95 leading-tight">
            Anatomy of a &ldquo;Digital Arrest&rdquo; Scam: How Syndicate Intimidation Traps Indian Elders
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-white/50 border-b border-white/10 pb-6">
            <span>Published: October 2026</span>
            <span>·</span>
            <span>NCRP Government Data Verified</span>
            <span>·</span>
            <span>Estimated Reading Time: 6 mins</span>
          </div>
        </div>

        {/* Executive Summary Card */}
        <GlassCard className="p-6 sm:p-8 space-y-3 border-amber-400/30 bg-amber-400/5">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
            <Icon name="shield-warning-bold" size={16} color="#f5b942" />
            <span>Key Threat Factsheet</span>
          </div>
          <p className="text-xs sm:text-sm text-white/80 font-body leading-relaxed">
            Between 2022 and May 2026, the National Cybercrime Reporting Portal recorded <strong>297,727 complaints</strong> with losses exceeding <strong>₹4,057.7 crore</strong> attributed to digital arrest schemes. In Pune alone, 136 senior citizens lost over ₹100 crore in a 19-month span, including an 82-year-old pensioner extorted of ₹10.75 crore.
          </p>
        </GlassCard>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-white/80 font-body leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              What Is &ldquo;Digital Arrest&rdquo;?
            </h2>
            <p>
              &ldquo;Digital arrest&rdquo; is a psychological extortion fraud where organized syndicates pose as officers from law enforcement agencies—most frequently the Central Bureau of Investigation (CBI), Mumbai Police, Enforcement Directorate (ED), or the Supreme Court of India.
            </p>
            <p>
              The perpetrators claim that the victim&apos;s identity, Aadhaar number, or mobile SIM card has been implicated in transnational money laundering, human trafficking, or drug smuggling. The victim is told that to &ldquo;avoid physical arrest and public dishonor,&rdquo; they are placed under digital arrest and must remain confined to a room on a live video call.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70">
              <strong className="text-white">Legal Reality:</strong> Indian law contains NO provision for &ldquo;digital arrest&rdquo;. Neither the CBI, state police forces, nor any court in India ever arrests or interrogates individuals over Skype, WhatsApp, or Telegram video.
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              The Five Stages of Coercion
            </h2>
            <p>
              Every digital arrest call follows an orchestrated script structured to break down rational skepticism:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <StageChip stage="S1" />
                  <span className="font-heading font-bold text-white/95 text-sm">Stage 1: Authority Impersonation</span>
                </div>
                <p className="text-xs text-white/70">
                  Caller uses official police titles, shows cloned badges, fake uniform props, and displays forged official letterheads bearing official state seals.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <StageChip stage="S2" />
                  <span className="font-heading font-bold text-white/95 text-sm">Stage 2: Manufactured Coercion</span>
                </div>
                <p className="text-xs text-white/70">
                  They accuse the elder of opening bank accounts tied to notorious syndicates. Threaten that a physical arrest team is en route unless compliance is immediate.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <StageChip stage="S3" />
                  <span className="font-heading font-bold text-white/95 text-sm">Stage 3: Severe Isolation (The Red Line)</span>
                </div>
                <p className="text-xs text-white/70">
                  Victim is forbidden from talking to their spouse, children, or lawyer under threat of invoking the Official Secrets Act. They are commanded to shut doors and keep webcams on.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <StageChip stage="S4" />
                  <span className="font-heading font-bold text-white/95 text-sm">Stage 4: Extreme Urgency</span>
                </div>
                <p className="text-xs text-white/70">
                  A fabricated &ldquo;Judge Order&rdquo; or &ldquo;Clearance Window&rdquo; creates artificial panic: the victim has exactly 30 minutes to verify funds before assets are frozen.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <StageChip stage="S5" />
                  <span className="font-heading font-bold text-white/95 text-sm">Stage 5: The Diversion Transfer</span>
                </div>
                <p className="text-xs text-white/70">
                  The elder is instructed to break fixed deposits, mutual funds, or transfer savings via RTGS to an &ldquo;RBI Secret Verification Account&rdquo; or &ldquo;Supreme Court Escrow&rdquo;, promising it will be refunded in 2 hours. Once sent, funds vanish instantly across mule networks.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              Why Indian Seniors Are Uniquely Vulnerable
            </h2>
            <ul className="space-y-2 list-disc pl-5 text-sm text-white/70">
              <li><strong>Deep Respect for Law Enforcement:</strong> Elders who lived law-abiding lives fear social disgrace and public arrest above all else.</li>
              <li><strong>Technological Disconnect:</strong> The distinction between an official government portal and a convincing WhatsApp video backdrop is difficult to spot for non-digital natives.</li>
              <li><strong>Physical Isolation:</strong> Many senior citizens live alone during working hours while adult children are at work or abroad.</li>
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
            Reporting within the golden hour enables law enforcement to freeze mule accounts through the Indian Cyber Crime Coordination Centre (I4C).
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
