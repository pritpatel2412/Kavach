'use client';

import React from 'react';
import {
  Button,
  StageChip,
  Badge,
} from '@kavach/ui';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';

export default function DigitalArrestArticle() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/learn" />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-caption font-bold text-muted">
            <a href="/learn" className="hover:text-primary transition-colors">Learn Hub</a>
            <span>/</span>
            <span className="text-hot">Digital Arrest Playbook</span>
          </div>

          <h1 className="text-display sm:text-[40px] font-bold text-ink leading-tight tracking-tight">
            Anatomy of a &ldquo;Digital Arrest&rdquo; Scam: How Syndicate Intimidation Traps Indian Elders
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-caption text-body border-b border-hairline pb-4">
            <span>Published: October 2026</span>
            <span>·</span>
            <span className="text-primary font-bold">NCRP Government Data Verified</span>
            <span>·</span>
            <span>Estimated Reading Time: 6 mins</span>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-warning-surface border border-warning-surface rounded-md p-6 space-y-2 text-warning-text">
          <div className="text-caption font-bold uppercase tracking-wider flex items-center gap-2">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:shield-warning-bold" width="18" height="18" />
            <span>Key Threat Factsheet</span>
          </div>
          <p className="text-caption font-medium leading-relaxed">
            Between 2022 and May 2026, the National Cybercrime Reporting Portal recorded <strong>297,727 complaints</strong> with losses exceeding <strong>₹4,057.7 crore</strong> attributed to digital arrest schemes. In Pune alone, 136 senior citizens lost over ₹100 crore in a 19-month span, including an 82-year-old pensioner extorted of ₹10.75 crore.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-body font-medium text-body leading-relaxed">
          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-4">
            <h2 className="text-heading font-bold text-ink">
              What Is &ldquo;Digital Arrest&rdquo;?
            </h2>
            <p>
              &ldquo;Digital arrest&rdquo; is a psychological extortion fraud where organized syndicates pose as officers from law enforcement agencies—most frequently the Central Bureau of Investigation (CBI), Mumbai Police, Enforcement Directorate (ED), or the Supreme Court of India.
            </p>
            <p>
              The perpetrators claim that the victim&apos;s identity, Aadhaar number, or mobile SIM card has been implicated in transnational money laundering, human trafficking, or drug smuggling. The victim is told that to &ldquo;avoid physical arrest and public dishonor,&rdquo; they are placed under digital arrest and must remain confined to a room on a live video call.
            </p>
            <div className="p-4 rounded-md bg-canvas border border-hairline text-caption font-mono text-ink font-medium">
              <strong className="text-hot font-bold">Legal Reality:</strong> Indian law contains NO provision for &ldquo;digital arrest&rdquo;. Neither the CBI, state police forces, nor any court in India ever arrests or interrogates individuals over Skype, WhatsApp, or Telegram video.
            </div>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-4">
            <h2 className="text-heading font-bold text-ink">
              The Five Stages of Coercion
            </h2>
            <p>
              Every digital arrest call follows an orchestrated script structured to break down rational skepticism:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <div className="flex items-center gap-2">
                  <StageChip stage="S1" />
                  <span className="font-bold text-ink text-ui">Stage 1: Authority Impersonation</span>
                </div>
                <p className="text-caption text-body">
                  Caller uses official police titles, shows cloned badges, fake uniform props, and displays forged official letterheads bearing official state seals.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <div className="flex items-center gap-2">
                  <StageChip stage="S2" />
                  <span className="font-bold text-ink text-ui">Stage 2: Manufactured Coercion</span>
                </div>
                <p className="text-caption text-body">
                  They accuse the elder of opening bank accounts tied to notorious syndicates. Threaten that a physical arrest team is en route unless compliance is immediate.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <div className="flex items-center gap-2">
                  <StageChip stage="S3" />
                  <span className="font-bold text-warm text-ui">Stage 3: Severe Isolation (The Red Line)</span>
                </div>
                <p className="text-caption text-body">
                  Victim is forbidden from talking to their spouse, children, or lawyer under threat of invoking the Official Secrets Act. They are commanded to shut doors and keep webcams on.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <div className="flex items-center gap-2">
                  <StageChip stage="S4" />
                  <span className="font-bold text-hot text-ui">Stage 4: Extreme Urgency</span>
                </div>
                <p className="text-caption text-body">
                  A fabricated &ldquo;Judge Order&rdquo; or &ldquo;Clearance Window&rdquo; creates artificial panic: the victim has exactly 30 minutes to verify funds before assets are frozen.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-1.5">
                <div className="flex items-center gap-2">
                  <StageChip stage="S5" />
                  <span className="font-bold text-hot text-ui">Stage 5: The Diversion Transfer</span>
                </div>
                <p className="text-caption text-body">
                  The elder is instructed to break fixed deposits, mutual funds, or transfer savings via RTGS to an &ldquo;RBI Secret Verification Account&rdquo; or &ldquo;Supreme Court Escrow&rdquo;, promising it will be refunded in 2 hours. Once sent, funds vanish instantly across mule networks.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-3">
            <h2 className="text-heading font-bold text-ink">
              Why Indian Seniors Are Uniquely Vulnerable
            </h2>
            <ul className="space-y-2 list-disc pl-5 text-body">
              <li><strong>Deep Respect for Law Enforcement:</strong> Elders who lived law-abiding lives fear social disgrace and public arrest above all else.</li>
              <li><strong>Technological Disconnect:</strong> The distinction between an official government portal and a convincing WhatsApp video backdrop is difficult to spot for non-digital natives.</li>
              <li><strong>Physical Isolation:</strong> Many senior citizens live alone during working hours while adult children are at work or abroad.</li>
            </ul>
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
            Reporting within the golden hour enables law enforcement to freeze mule accounts through the Indian Cyber Crime Coordination Centre (I4C).
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
