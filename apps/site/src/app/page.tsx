'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  StatCard,
  RiskIndicator,
  StageChips,
  Badge,
} from '@kavach/ui';
import { BRAND } from '@kavach/api-contract';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans selection:bg-primary selection:text-white">
      {/* 1. Header with Slim Helpline Utility Bar + Navigation */}
      <SiteHeader currentPath="/" lang={lang} onLangChange={setLang} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        
        {/* ========================================================================= */}
        {/* SECTION 1: HERO (Headline, One Sentence, Two CTAs) */}
        {/* ========================================================================= */}
        <section className="bg-surface border border-hairline rounded-md p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-surface text-green-strong rounded-full text-caption font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Listens on a second device · No call interception</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-ink leading-tight tracking-tight">
            Hang up. It&apos;s a scam.
          </h1>

          <p className="mt-4 text-lead font-medium text-body leading-relaxed max-w-2xl mx-auto">
            The tabletop scam guardian for Indian elders. A spare phone or tablet listens to speakerphone calls, detects coercive digital arrest extortion in real time, and speaks in your trusted family voice before life savings are lost.
          </p>

          <p className="mt-2 text-caption text-muted max-w-xl mx-auto">
            Audio is streamed securely for transcription and is not stored.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              href={BRAND.appUrl}
              icon="shield-check-bold"
            >
              Open Guardian App
            </Button>
            <Button
              variant="outline-neutral"
              size="lg"
              href={`${BRAND.appUrl}/elder`}
              icon="devices-bold"
            >
              Launch Elder Kiosk
            </Button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: ONE SOURCED STAT STRIP (3 stats with source links) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-heading font-bold text-ink">The Scale of Digital Arrest Extortion</h2>
            <p className="text-caption text-muted mt-1">Verified national cybercrime statistics from official records</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="National Cybercrime Portal"
              value="₹4,057.7 Cr"
              subtext="297,727 digital arrest & extortion complaints reported"
              statusColor="alert"
              source="NCRP / NewsBytes (2022 to May 2026)"
              sourceUrl="https://www.newsbytesapp.com/news/science/india-s-digital-arrest-scam-causes-4-000cr-losses-in-3-years/story"
            />
            <StatCard
              label="Pune Cyber Police Data"
              value=">₹100 Cr"
              subtext="136 FIRs filed by senior citizens (~₹73.5L average loss)"
              statusColor="caution"
              source="Pune Cyber Police / Punekar News"
              sourceUrl="https://www.punekarnews.in/?p=245348"
            />
            <StatCard
              label="Architecture Thesis"
              value="0 Interceptions"
              subtext="Acoustic room capture on a second tablet. Zero phone taps."
              statusColor="primary"
              source="Kavach Technical Spec (docs/CLAIMS.md)"
              sourceUrl="/how-it-works"
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: 3-STEP HOW-IT-WORKS */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="bg-surface border border-hairline rounded-md p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-heading-lg font-bold text-ink">How Kavach Works in 3 Steps</h2>
            <p className="text-body font-medium text-body mt-2">
              Zero carrier integration required. Protects any phone, landline, or WhatsApp call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-canvas border border-hairline rounded-md space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-ui">
                1
              </div>
              <h3 className="text-heading font-bold text-ink">Place Device on Table</h3>
              <p className="text-body text-body font-medium leading-relaxed">
                Keep a spare tablet or phone in the living room running Kavach Kiosk. When an unknown call arrives, the elder taps speakerphone.
              </p>
            </div>

            <div className="p-6 bg-canvas border border-hairline rounded-md space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-ui">
                2
              </div>
              <h3 className="text-heading font-bold text-ink">Deterministic Scam Scoring</h3>
              <p className="text-body text-body font-medium leading-relaxed">
                Gnani Prisma transcribes Hindi, Gujarati, and English audio. Kavach scores authority claims, accusation, secrecy, and payment demands in under 1 ms.
              </p>
            </div>

            <div className="p-6 bg-canvas border border-hairline rounded-md space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-ui">
                3
              </div>
              <h3 className="text-heading font-bold text-ink">Family Voice Intervention</h3>
              <p className="text-body text-body font-medium leading-relaxed">
                Kavach immediately speaks through the tablet in your consented family voice: <em>&ldquo;Papa, yeh fake police call hai, phone kaat do!&rdquo;</em> and alerts you.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: 6 CORE FEATURES */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-heading-lg font-bold text-ink">Built Specifically for Indian Families</h2>
            <p className="text-body font-medium text-body mt-2">
              Engineering features designed for non-technical elders and busy adult children.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card padding="lg" className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-green-surface text-primary flex items-center justify-center mb-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:microphone-large-bold" width="18" height="18" />
              </div>
              <h3 className="text-heading font-bold text-ink">Acoustic Room Capture</h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Operates without carrier cooperation, SIM taps, or root permissions. Listens over speakerphone via standard Web Audio Worklet.
              </p>
            </Card>

            <Card padding="lg" className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-risk-caution-surface text-risk-caution flex items-center justify-center mb-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:shield-warning-bold" width="18" height="18" />
              </div>
              <h3 className="text-heading font-bold text-ink">5-Stage Extortion Scorer</h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Rule-based detector matches legal extortion sequences: false authority, narcotics accusation, video secrecy, urgent timers, and safe account RTGS.
              </p>
            </Card>

            <Card padding="lg" className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-premium-surface text-premium flex items-center justify-center mb-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:soundwave-bold" width="18" height="18" />
              </div>
              <h3 className="text-heading font-bold text-ink">Consented Cloned Family Voice</h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Elders in high-cortisol panics dismiss generic AI warnings. Kavach speaks in the daughter&apos;s or son&apos;s authenticated voice with zero delay.
              </p>
            </Card>

            <Card padding="lg" className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-risk-alert-surface text-risk-alert flex items-center justify-center mb-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:alarm-bold" width="18" height="18" />
              </div>
              <h3 className="text-heading font-bold text-ink">Instant Guardian Alert & Intercom</h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Guardians receive a high-priority Telegram alert with an encrypted 1-click live intercom link to speak straight to the elder&apos;s room.
              </p>
            </Card>

            <Card padding="lg" className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-canvas text-body flex items-center justify-center mb-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:lock-password-bold" width="18" height="18" />
              </div>
              <h3 className="text-heading font-bold text-ink">Zero Raw Audio Storage</h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Audio streams directly to STT in memory and is discarded immediately. 160-character transcript excerpts auto-purge after 7 days.
              </p>
            </Card>

            <Card padding="lg" className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-risk-calm-surface text-risk-calm flex items-center justify-center mb-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:devices-bold" width="18" height="18" />
              </div>
              <h3 className="text-heading font-bold text-ink">Elder-First Tabletop Kiosk</h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Designed for 70+ seniors: 48px typography, 56px touch targets, calm guidance, Hindi and Gujarati scripts, with zero confusing menus.
              </p>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: SAMPLE PRODUCT PREVIEW (Clearly labelled "Sample preview") */}
        {/* ========================================================================= */}
        <section className="bg-surface border border-hairline rounded-md p-8 sm:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-caption font-bold text-muted uppercase tracking-wider">Product Demonstration</span>
                <span className="px-2.5 py-0.5 rounded-full text-micro font-bold bg-canvas text-muted border border-hairline">
                  Sample preview
                </span>
              </div>
              <h2 className="text-heading-lg font-bold text-ink">Real-Time Extortion Detection in Action</h2>
            </div>
            <RiskIndicator level="alert" />
          </div>

          <div className="p-6 bg-canvas border border-hairline rounded-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-hot" />
                <span className="text-ui font-bold text-ink">Digital Arrest Impersonation Incident</span>
              </div>
              <span className="text-caption text-muted font-medium">Flagged at 10:14 AM · Sample data</span>
            </div>

            <div className="space-y-2">
              <span className="text-caption font-bold text-body">Stages Detected by Kavach Risk Engine:</span>
              <StageChips stages={['S1', 'S2', 'S3', 'S4']} />
            </div>

            <div className="p-4 bg-surface border border-hairline rounded-md text-caption text-body space-y-2">
              <span className="font-bold text-ink block">Transcript Snippet (Excerpts &le; 160 chars):</span>
              <p className="italic">
                &ldquo;Aapke naam par Mumbai Police aur CBI ka non-bailable warrant hai. Kisi ko mat batana, darwaza band rakho aur video par raho...&rdquo;
              </p>
            </div>

            <div className="p-3.5 bg-green-surface/60 border border-primary/20 rounded-md flex items-center gap-3">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:volume-loud-bold" width="20" height="20" className="text-primary shrink-0" />
              <div className="text-caption text-green-strong">
                <strong>Cloned Voice Intervention Triggered:</strong> &ldquo;Papa, yeh fake police call hai! Supreme Court kabhi video call par arrest nahi karti. Phone abhi kaat do!&rdquo;
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
        {/* ========================================================================= */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-heading-lg font-bold text-ink">Frequently Asked Questions</h2>
            <p className="text-body font-medium text-body mt-1">Clear answers regarding safety, hardware, and privacy.</p>
          </div>

          <div className="space-y-4">
            <Card padding="md">
              <h3 className="text-ui font-bold text-ink">Does Kavach intercept or record telephone calls?</h3>
              <p className="text-body font-medium text-body mt-1.5 leading-relaxed">
                No. Kavach does not tap telecom networks or intercept calls. It operates on a second device (spare phone or tablet) resting on the table with the elder&apos;s call placed on speakerphone.
              </p>
            </Card>

            <Card padding="md">
              <h3 className="text-ui font-bold text-ink">Is raw voice audio stored on Kavach servers?</h3>
              <p className="text-body font-medium text-body mt-1.5 leading-relaxed">
                No. Audio chunks stream over secure TLS directly to Gnani Prisma STT and are immediately purged from memory. Only short transcript snippets (&le;160 characters) are retained for 7 days to generate the alert timeline.
              </p>
            </Card>

            <Card padding="md">
              <h3 className="text-ui font-bold text-ink">How does family voice cloning work safely?</h3>
              <p className="text-body font-medium text-body mt-1.5 leading-relaxed">
                Voice cloning requires the family guardian&apos;s explicit consent, followed by a randomized liveness challenge read. Embeddings are stored encrypted with AES-256 and can be permanently deleted with a single tap in the Guardian dashboard.
              </p>
            </Card>

            <Card padding="md">
              <h3 className="text-ui font-bold text-ink">What languages are supported?</h3>
              <p className="text-body font-medium text-body mt-1.5 leading-relaxed">
                Kavach supports Hindi, Gujarati, Indian English, and Hinglish mixtures. The elder tablet interface provides full high-contrast scripts in Hindi, Gujarati, and English.
              </p>
            </Card>

            <Card padding="md">
              <h3 className="text-ui font-bold text-ink">How much does Kavach cost?</h3>
              <p className="text-body font-medium text-body mt-1.5 leading-relaxed">
                Kavach offers a permanent Free Starter tier (30 minutes/month + 10 min reserve). Plus is ₹149/month (150 min + 30 min reserve) and Family is ₹299/month (400 min + 60 min reserve). All prices are inclusive of 18% GST.
              </p>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: FINAL CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="bg-surface border border-hairline rounded-md p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
          <h2 className="text-heading-lg font-bold text-ink">Protect Your Parents Before the Next Call</h2>
          <p className="text-body font-medium text-body max-w-xl mx-auto leading-relaxed">
            Set up Kavach on any spare phone or tablet in under 3 minutes. No hardware purchases or carrier paperwork needed.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              href={BRAND.appUrl}
              icon="shield-check-bold"
            >
              Get Started with Guardian App
            </Button>
            <Button
              variant="outline-neutral"
              size="lg"
              href="/pricing"
            >
              View Plan Details
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
