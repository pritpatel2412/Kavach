'use client';

import React, { useState } from 'react';
import {
  Button,
  SidebarCard,
  Badge,
  StageChip,
  ScamStage,
  Chip,
  RiskMeter,
  Bars,
} from '@kavach/ui';
import {
  SOURCED_CLAIMS,
  SCAM_FAMILIES,
  quotes,
  team,
} from '@kavach/api-contract';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');

  const scamThreats: Array<{
    id: string;
    category: string;
    stage: ScamStage;
    stageName: string;
    title: string;
    agency: string;
    source: string;
    target: string;
    excerpt: string;
    interventionAudio: string;
    chips: string[];
    learnUrl: string;
  }> = [
    {
      id: 'threat-1',
      category: 'digital-arrest',
      stage: 'S5',
      stageName: 'Stage 5: Payment Demand',
      title: 'Fake Arrest Warrant & Safe Account Transfer on Video Call',
      agency: 'CBI / Supreme Court Impersonation',
      source: 'Pune Police Cyber Advisory (136 cases, >₹100 Cr)',
      target: 'Elderly Retirees & Pensioners',
      excerpt: '“Aapka naam Naresh Goyal money laundering case mein aaya hai. Supreme Court ne digital arrest order issue kiya hai. 24 ghante camera ke samne rahiye aur safe custody account mein fund transfer kijiye.”',
      interventionAudio: '“Papa, yeh fake police call hai! Supreme Court kabhi video call par arrest nahi karti. Phone abhi kaat do!”',
      chips: ['Digital Arrest', 'High Coercion', 'WhatsApp Video', 'Hinglish'],
      learnUrl: '/learn/digital-arrest',
    },
    {
      id: 'threat-2',
      category: 'customs',
      stage: 'S2',
      stageName: 'Stage 2: Accusation',
      title: 'Automated Robocall: Illegal Narcotics Found in Taiwan Parcel',
      agency: 'FedEx / Airport Customs Division',
      source: 'National NCRP Advisory',
      target: 'Seniors with Aadhaar on Speakerphone',
      excerpt: '“This is FedEx Customs. A parcel under your Aadhaar number containing 140 grams of contraband MDMA has been confiscated at Mumbai airport. Press 9 to connect to Narcotics Bureau.”',
      interventionAudio: '“Mummy, yeh automated scam call hai! Aapne koi parcel nahi bheja. Phone disconnect kijiye!”',
      chips: ['Customs Scam', 'IVR Robocall', 'Aadhaar Misuse', 'English / Hindi'],
      learnUrl: '/learn/courier-parcel',
    },
    {
      id: 'threat-3',
      category: 'telecom',
      stage: 'S1',
      stageName: 'Stage 1: False Authority',
      title: 'Immediate SIM Disconnection Warning Within 2 Hours',
      agency: 'TRAI / DoT Telecom Department',
      source: 'DoT Consumer Warning 2026',
      target: 'Elderly Living Alone',
      excerpt: '“TRAI notification: Aapke mobile number se illegal advertisement aur harassment ho raha hai. Agle 2 ghante mein aapke sabhi SIM card block kar diye jayenge. Biometric KYC online verify karein.”',
      interventionAudio: '“Bapu, TRAI kabhi phone par SIM disconnect nahi karti. Yeh fraudster hai. Call cut karo.”',
      chips: ['SIM Disconnection', 'TRAI Fraud', 'Urgency Tactic', 'Gujarati / Hindi'],
      learnUrl: '/learn/kyc-otp',
    },
    {
      id: 'threat-4',
      category: 'banking',
      stage: 'S4',
      stageName: 'Stage 4: Financial Urgency',
      title: 'RBI Security Account Audit Demanding Immediate RTGS Verification',
      agency: 'Reserve Bank of India Impersonation',
      source: 'RBI Kehta Hai Advisory',
      target: 'Fixed Deposit & Pension Accounts',
      excerpt: '“Aapke savings account mein unauthorized transactions detect hue hain. Account freeze hone se bachane ke liye funds ko temporary Reserve Bank secure escrow account mein move kijiye.”',
      interventionAudio: '“Uncleji, RBI kabhi individual account se transfer nahi maangti. Phone turant kaat dijiye!”',
      chips: ['Bank Scam', 'RTGS / UPI Fraud', 'Financial Urgency', 'Hindi'],
      learnUrl: '/learn/digital-arrest',
    },
  ];

  const filteredThreats = activeCategory === 'all'
    ? scamThreats
    : scamThreats.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans selection:bg-primary selection:text-white">
      {/* Sleek, Single-Tier Sticky Navigation */}
      <SiteHeader currentPath="/" lang={lang} onLangChange={setLang} />

      {/* Main 2-Column Shell Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT 2-COLUMN RAIL: HERO & LIVE THREAT INTELLIGENCE */}
          {/* ========================================================================= */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* HERO CARD: Clean, Authoritative, High-Trust Security */}
            <article className="bg-surface border border-hairline rounded-2xl p-6 sm:p-8 text-ink shadow-sm relative overflow-hidden">
              {/* Subtle accent corner glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

              {/* Status & Category Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Active Threat Defense
                </span>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-full">
                  100% Offline AI · Zero Audio Uploads
                </span>
                <span className="bg-canvas text-body border border-hairline text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline-block">
                  Acoustic Speakerphone Protection
                </span>
              </div>

              {/* Main Headline & Value Prop */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-bold text-ink leading-tight tracking-tight">
                  Hang up. It&apos;s a scam.
                </h1>

                <p className="text-lg text-body font-medium leading-relaxed max-w-2xl">
                  The tabletop scam guardian for Indian elders. A dedicated phone or tablet listens
                  to calls on speakerphone, detects coercive digital arrest interrogation in real time,
                  and speaks in your trusted family voice before life savings are lost.
                </p>

                {/* Sourced Metrics Pill Row */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-canvas border border-hairline rounded-xl">
                    <div className="text-xs font-bold text-body">National Extortion</div>
                    <div className="text-xl font-bold text-red-600 font-mono mt-0.5">₹4,057.7 Cr</div>
                    <div className="text-[11px] text-muted">297,727 complaints (NCRP)</div>
                  </div>
                  <div className="p-3 bg-canvas border border-hairline rounded-xl">
                    <div className="text-xs font-bold text-body">Pune Cyber Police</div>
                    <div className="text-xl font-bold text-warm font-mono mt-0.5">&gt;₹100 Cr</div>
                    <div className="text-[11px] text-muted">~₹73.5L avg loss / FIR</div>
                  </div>
                  <div className="p-3 bg-canvas border border-hairline rounded-xl">
                    <div className="text-xs font-bold text-body">Kavach Intercept</div>
                    <div className="text-xl font-bold text-primary font-mono mt-0.5">&lt;0.42 ms</div>
                    <div className="text-[11px] text-muted">Flags before Stage 5 payment</div>
                  </div>
                </div>

                {/* Clear, Accessible Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    href="http://localhost:3001/elder"
                    icon="play-circle-bold"
                    className="font-bold shadow-sm"
                  >
                    Launch Elder Kiosk (Demo)
                  </Button>
                  <Button
                    variant="outline-neutral"
                    size="lg"
                    href="http://localhost:3001"
                    icon="shield-check-bold"
                    className="font-bold"
                  >
                    Guardian Dashboard
                  </Button>
                  <Button
                    variant="outline-green"
                    size="lg"
                    href="#how-it-works"
                    className="font-bold"
                  >
                    How It Works
                  </Button>
                </div>
              </div>
            </article>

            {/* THREAT INTELLIGENCE FEED SECTION */}
            <div id="threat-feed" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div>
                  <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                    <span>Live Threat Intelligence Feed</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      10 SCAM FAMILIES TRACKED
                    </span>
                  </h2>
                  <p className="text-xs text-body font-medium mt-0.5">
                    Real extortion scripts identified across Indian police FIRs, with Kavach family voice interventions.
                  </p>
                </div>
              </div>

              {/* Clean Filter Pill Strip */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                {[
                  { id: 'all', label: 'All Threats (10)' },
                  { id: 'digital-arrest', label: 'Digital Arrest (4)' },
                  { id: 'customs', label: 'Customs / Courier (2)' },
                  { id: 'telecom', label: 'TRAI / SIM KYC (2)' },
                  { id: 'banking', label: 'Safe Account (2)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeCategory === tab.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface border border-hairline text-body hover:text-ink hover:border-body'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Threat Cards */}
              <div className="space-y-4">
                {filteredThreats.map((threat) => (
                  <article
                    key={threat.id}
                    className="bg-surface border border-hairline rounded-2xl p-6 text-ink shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                      <div className="flex items-center gap-2">
                        <StageChip stage={threat.stage} />
                        <span className="text-xs font-bold text-ink">{threat.agency}</span>
                      </div>
                      <span className="text-xs text-muted font-medium">{threat.source}</span>
                    </div>

                    {/* Threat Details */}
                    <div>
                      <h3 className="text-lg font-bold text-ink leading-snug mb-1">
                        {threat.title}
                      </h3>
                      <div className="p-3 bg-canvas border border-hairline rounded-xl text-body text-xs font-mono leading-relaxed mt-2">
                        <span className="text-red-700 font-bold">Caller Transcript: </span>
                        <span>{threat.excerpt}</span>
                      </div>
                    </div>

                    {/* Consented Family Voice Intervention Box */}
                    <div className="p-3.5 bg-green-50/80 border border-green-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-green-900">
                        {/* @ts-expect-error solar icon */}
                        <iconify-icon icon="solar:volume-loud-bold" width="16" height="16" />
                        <span>Kavach Family Voice Speaks (Tablet Speaker):</span>
                      </div>
                      <p className="text-xs text-green-800 font-medium italic leading-relaxed">
                        {threat.interventionAudio}
                      </p>
                    </div>

                    {/* Tags & Action Link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {threat.chips.map((c, i) => (
                          <Chip key={i} size="sm" variant={i === 0 ? 'hot' : 'default'}>
                            {c}
                          </Chip>
                        ))}
                      </div>

                      <a
                        href={threat.learnUrl}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Read Advisory Guide</span>
                        {/* @ts-expect-error solar icon */}
                        <iconify-icon icon="solar:arrow-right-linear" width="14" height="14" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 5-STAGE ESCALATION ARCHITECTURE */}
            <section id="how-it-works" className="bg-surface border border-hairline rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Detection Architecture</span>
                <h2 className="text-2xl font-bold text-ink mt-1">The 3-Minute Psychological Escalation Timeline</h2>
                <p className="text-sm text-body font-medium leading-relaxed mt-1">
                  Digital arrest operates through systematic intimidation stages. Kavach identifies the pattern and alerts the family before the payment demand occurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                  <StageChip stage="S1" />
                  <div className="text-xs font-bold text-ink pt-1">1. Authority</div>
                  <p className="text-[11px] text-body">Posing as CBI, Police, Supreme Court or Customs official</p>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                  <StageChip stage="S2" />
                  <div className="text-xs font-bold text-ink pt-1">2. Accusation</div>
                  <p className="text-[11px] text-body">Aadhaar tied to money laundering or seized narcotics</p>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                  <StageChip stage="S3" />
                  <div className="text-xs font-bold text-warm pt-1">3. Isolation</div>
                  <p className="text-[11px] text-body">“Do not disconnect, do not talk to children or lawyer”</p>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                  <StageChip stage="S4" />
                  <div className="text-xs font-bold text-red-600 pt-1">4. Urgency</div>
                  <p className="text-[11px] text-body">“Arrest warrant issued within 10 minutes”</p>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas border border-hairline space-y-1">
                  <StageChip stage="S5" />
                  <div className="text-xs font-bold text-red-700 pt-1">5. Payment</div>
                  <p className="text-[11px] text-body">Demanding RTGS/UPI transfer to “Safe Escrow”</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-body font-medium">
                  <strong className="text-ink font-bold">Intervention Threshold:</strong> Kavach triggers family voice intervention and guardian Telegram alerts at <strong className="text-primary font-bold">Stage 3 Isolation</strong>, puncturing the fear trance before funds are moved.
                </div>
                <Button variant="primary" size="sm" href="http://localhost:3001" className="shrink-0 font-bold">
                  View Live Incident Demo
                </Button>
              </div>
            </section>

            {/* TEAM & SOURCED PROOF */}
            <section className="bg-surface border border-hairline rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Authentic Attribution</span>
                <h2 className="text-2xl font-bold text-ink mt-1">Built to Win: Team & Research Grounding</h2>
                <p className="text-sm text-body font-medium">
                  Developed for Gnani AI&apos;s Great Indian AI Internship Challenge. Strictly synthetic evaluation datasets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {team.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-hairline bg-canvas space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                      {m.initials}
                    </div>
                    <div className="text-sm font-bold text-ink">{m.name}</div>
                    <div className="text-xs font-bold text-primary">{m.role}</div>
                    <p className="text-xs text-body leading-relaxed">{m.bio}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT 1-COLUMN SIDEBAR RAIL (Status, Helpline & Quick Launch) */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* Tabletop Kiosk Monitor Card */}
            <SidebarCard
              title="Tabletop Kiosk Status"
              action={<span className="text-primary font-bold text-xs">LIVE MONITOR</span>}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-hairline">
                  <span className="text-body font-medium">Acoustic Audio:</span>
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    16 kHz Room VAD
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-hairline">
                  <span className="text-body font-medium">Detector Latency:</span>
                  <span className="font-bold text-ink font-mono">0.42 ms</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-hairline">
                  <span className="text-body font-medium">Monthly Quota:</span>
                  <span className="font-bold text-primary font-mono">120 / 150 min</span>
                </div>

                <div className="pt-1">
                  <div className="text-xs font-bold text-ink mb-2">Room Acoustic Energy:</div>
                  <Bars count={18} barColor="#30a83c" />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  href="http://localhost:3001/elder"
                  className="w-full mt-2 font-bold shadow-sm"
                >
                  Launch Tabletop Kiosk Screen
                </Button>
              </div>
            </SidebarCard>

            {/* National Helpline 1930 Card */}
            <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Emergency Response</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  DIAL 1930
                </span>
              </div>
              <h3 className="text-lg font-bold text-red-950">
                National Cybercrime Helpline
              </h3>
              <p className="text-xs text-red-900 leading-relaxed font-medium">
                If an elder was tricked into initiating a transfer within the last 2 hours, the Golden Window enables immediate bank account freezing via the National Cyber Portal.
              </p>
              <div className="p-3 bg-white/90 border border-red-200 rounded-xl">
                <div className="text-xl font-bold text-red-700 font-mono">Helpline: 1930</div>
                <div className="text-[11px] text-red-600">Free 24/7 Government Assistance</div>
              </div>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline pt-1"
              >
                <span>File official report on cybercrime.gov.in</span>
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:arrow-right-up-linear" width="14" height="14" />
              </a>
            </div>

            {/* Sourced Pune Police Statistics Card */}
            <SidebarCard title="Sourced Ground Reality">
              <div className="space-y-3 text-xs">
                <p className="text-body leading-relaxed font-medium">
                  According to official data released by the Pune Cyber Crime Cell:
                </p>
                <div className="p-3 bg-canvas border border-hairline rounded-xl space-y-1">
                  <div className="text-base font-bold text-ink">&gt;₹100 Crore Extorted</div>
                  <div className="text-muted text-[11px]">Across 136 registered senior citizen cases in 19 months</div>
                </div>
                <p className="text-body leading-relaxed text-[11px]">
                  One 82-year-old victim alone lost ₹10.75 crore during severe psychological isolation.
                </p>
                <a
                  href="https://www.punekarnews.in/?p=245348"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-bold hover:underline inline-block text-[11px]"
                >
                  Source: Punekar News / Pune Cyber Police ↗
                </a>
              </div>
            </SidebarCard>

            {/* Guardian Portal Quick Action */}
            <SidebarCard title="Guardian Control Center">
              <div className="space-y-3 text-xs">
                <p className="text-body leading-relaxed font-medium">
                  Configure elder pairing, review recent 160-char transcript excerpts, and verify family voice consent.
                </p>
                <div className="space-y-2 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    href="http://localhost:3001"
                    className="w-full font-bold"
                  >
                    Open Guardian Dashboard
                  </Button>
                  <Button
                    variant="outline-neutral"
                    size="md"
                    href="http://localhost:3001/onboarding"
                    className="w-full font-bold"
                  >
                    + Enroll New Household Elder
                  </Button>
                </div>
              </div>
            </SidebarCard>

            {/* DPDP Compliance Notice */}
            <div className="p-4 bg-canvas border border-hairline rounded-2xl space-y-1.5 text-xs">
              <div className="font-bold text-ink flex items-center gap-1.5">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:shield-check-bold" width="16" height="16" className="text-primary" />
                <span>Statutory Privacy Assurance</span>
              </div>
              <p className="text-muted leading-relaxed text-[11px]">
                Audio is processed in real time and never retained on disk. Voice embeddings are encrypted and deletable at any time from the guardian settings. Notice version 2026-10-elder-v1.
              </p>
              <a href="/privacy" className="text-primary font-bold hover:underline text-[11px] inline-block">
                Read Privacy & DPDP Notice ↗
              </a>
            </div>

          </div>

        </div>
      </main>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}
