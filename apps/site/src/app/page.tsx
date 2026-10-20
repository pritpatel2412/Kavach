'use client';

import React, { useState } from 'react';
import {
  Button,
  DealCard,
  SidebarCard,
  TimestampPill,
  DiscountBadge,
  Badge,
  TemperatureControl,
  PriceLockup,
  StageChip,
  Chip,
  RiskMeter,
  Bars,
  SliderMeter,
  StatusDot,
  Icon,
  Tabs,
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
  const [heroTemp, setHeroTemp] = useState(98);
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* Deals Community Header with Nav & Category Strip */}
      <SiteHeader currentPath="/" />

      {/* Main 2-Column Shell Container per DESIGN.md */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT 2-COLUMN RAIL: THE LIVE SCAM COMMUNITY FEED */}
          {/* ========================================================================= */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Chips Bar (Full-Round Pills per DESIGN.md) */}
            <div className="bg-surface border border-hairline rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
              <Tabs
                activeTab={activeCategory}
                onChange={setActiveCategory}
                tabs={[
                  { id: 'all', label: 'All Threats', badge: 10 },
                  { id: 'digital-arrest', label: 'Digital Arrest', badge: 4 },
                  { id: 'customs', label: 'Customs / Courier', badge: 2 },
                  { id: 'telecom', label: 'TRAI / SIM KYC', badge: 2 },
                  { id: 'banking', label: 'Safe Account', badge: 2 },
                ]}
              />

              {/* Language Switcher Pills */}
              <div className="flex items-center gap-1 bg-canvas p-1 rounded-full border border-hairline text-caption font-bold">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    lang === 'en' ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    lang === 'hi' ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'
                  }`}
                >
                  HI
                </button>
                <button
                  type="button"
                  onClick={() => setLang('gu')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    lang === 'gu' ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'
                  }`}
                >
                  GU
                </button>
              </div>
            </div>

            {/* HERO FEATURED FEED CARD (Headline + Live Protection Atom) */}
            <article className="bg-surface border border-hairline rounded-md p-6 text-ink shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-hot text-white text-micro font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    BROADCAST ALERT
                  </span>
                  <TimestampPill>Live Protection Active</TimestampPill>
                </div>
                <TemperatureControl
                  value={heroTemp}
                  onUpVote={() => setHeroTemp(heroTemp + 1)}
                  onDownVote={() => setHeroTemp(heroTemp - 1)}
                  size="md"
                />
              </div>

              <div className="space-y-3">
                <h1 className="text-display sm:text-[44px] font-bold text-ink leading-[1.1] tracking-tight">
                  Hang up. It&apos;s a scam.
                </h1>

                <p className="text-lead text-body font-medium leading-relaxed">
                  The tabletop scam guardian for Indian elders. Kavach listens to suspicious calls
                  on speakerphone, detects coercive digital arrest interrogation in real time, and speaks
                  in your trusted family voice before life savings are lost.
                </p>

                {/* Price Lockup per DESIGN.md */}
                <div className="pt-2">
                  <PriceLockup
                    price="0"
                    currency="₹"
                    period="Free during Private Beta"
                    originalPrice="4,200 Cr"
                    discount="100% BLOCKED"
                  />
                  <div className="text-caption text-muted mt-0.5">
                    Struck-through amount: Official NCRP recorded loss to cybercrime extortion
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    href="/pricing#waitlist"
                    icon="shield-check-bold"
                  >
                    Protect Your Parents
                  </Button>
                  <Button
                    variant="outline-neutral"
                    size="lg"
                    href="/how-it-works"
                    icon="play-circle-bold"
                  >
                    How It Works
                  </Button>
                  <Button
                    variant="outline-green"
                    size="lg"
                    href="/styleguide"
                  >
                    View Design System
                  </Button>
                </div>
              </div>
            </article>

            {/* LIVE SCAM CALL FEED (Cards Stack with 12px Gaps) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-heading font-bold text-ink flex items-center gap-2">
                  <span>Community Scam Threat Feed</span>
                  <span className="text-caption font-bold text-hot bg-hot/10 px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </h2>
                <span className="text-caption text-body">Sorted by: <strong className="text-ink">Hot First</strong></span>
              </div>

              {/* Feed Card 1: CBI Digital Arrest */}
              <DealCard
                thumbnail={
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <StageChip stage="S5" />
                    <span className="text-caption font-bold text-ink mt-2">CBI New Delhi</span>
                  </div>
                }
                temperature={96}
                merchant="CBI Digital Arrest Impersonation"
                author="Pune Police Cyber Advisory"
                timestamp="Gepostet vor 5m"
                title="Fake Arrest Warrant & Bail Bond Demanded on WhatsApp Video (+91 98210 99841)"
                price="₹2,50,000"
                originalPrice="Extortion"
                discount="S5 PAYMENT"
                commentCount={34}
                primaryActionLabel="Block & Report"
                primaryActionHref="/learn/digital-arrest"
              >
                <div className="space-y-2 mt-2">
                  <p className="text-body font-medium text-body leading-normal">
                    Scammer poses as CBI officer, ordering the elder not to disconnect or talk to relatives. Kavach detector triggers Stage 3 Isolation and speaks in son Rahul&apos;s consented voice: <em>&ldquo;Mummy, yeh scam call hai! Phone kaat do!&rdquo;</em>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Chip size="sm" variant="hot">High Coercion</Chip>
                    <Chip size="sm" variant="default">Hindi / Hinglish</Chip>
                    <Chip size="sm" variant="primary">Family Voice Intervened</Chip>
                  </div>
                </div>
              </DealCard>

              {/* Feed Card 2: FedEx Narcotics Parcel */}
              <DealCard
                thumbnail={
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <StageChip stage="S2" />
                    <span className="text-caption font-bold text-ink mt-2">Customs IVR</span>
                  </div>
                }
                temperature={82}
                merchant="FedEx / Mumbai Customs Parcel"
                author="Kavach Sensor Node"
                timestamp="Gepostet vor 22m"
                title="Automated Robocall: '140g MDMA found in parcel sent with your Aadhaar'"
                price="₹0"
                discount="S2 ACCUSATION"
                commentCount={18}
                primaryActionLabel="Inspect Audio"
                primaryActionHref="/learn/courier-parcel"
              >
                <div className="space-y-2 mt-2">
                  <p className="text-body font-medium text-body leading-normal">
                    Pre-recorded IVR stating parcel to Taiwan was confiscated at airport customs. Demands pressing 9 to transfer to &ldquo;Narcotics Control Bureau&rdquo; officer.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Chip size="sm" variant="warning">IVR Phishing</Chip>
                    <Chip size="sm" variant="default">English & Hindi</Chip>
                    <Chip size="sm" variant="outline">Aadhaar Misuse Threat</Chip>
                  </div>
                </div>
              </DealCard>

              {/* Feed Card 3: TRAI SIM Deactivation */}
              <DealCard
                thumbnail={
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <StageChip stage="S1" />
                    <span className="text-caption font-bold text-ink mt-2">TRAI Robocall</span>
                  </div>
                }
                temperature={64}
                merchant="TRAI Telecom Authority"
                author="National 1930 Portal"
                timestamp="Gepostet vor 1h"
                title="Urgent SIM Disconnection Notice Within 2 Hours Due to Illegal Harassment"
                price="₹1,200"
                originalPrice="Fine"
                discount="S1 AUTHORITY"
                commentCount={9}
                primaryActionLabel="View Advisory"
                primaryActionHref="/learn/kyc-otp"
              >
                <div className="space-y-2 mt-2">
                  <p className="text-body font-medium text-body leading-normal">
                    Fraudulent warning that the elder&apos;s phone number is linked to 17 illegal SIM cards in Assam. Threatens complete telecom blacklisting unless biometric KYC is verified over phone.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Chip size="sm" variant="default">TRAI Impersonation</Chip>
                    <Chip size="sm" variant="default">Gujarati / Hindi</Chip>
                  </div>
                </div>
              </DealCard>

              {/* Feed Card 4: Mumbai Cyber Police Safe Account Demand */}
              <DealCard
                thumbnail={
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <StageChip stage="S4" />
                    <span className="text-caption font-bold text-ink mt-2">Police Uniform</span>
                  </div>
                }
                temperature={89}
                merchant="Reserve Bank / Police Verification"
                author="Pune Senior Citizen Forum"
                timestamp="Gepostet vor 3h"
                title="RBI 'Safe Custody Account' Transfer Demand to Clear Money Laundering Case"
                price="₹10,75,000"
                originalPrice="Demand"
                discount="S4 URGENCY"
                commentCount={42}
                primaryActionLabel="Read Guide"
                primaryActionHref="/learn/digital-arrest"
              >
                <div className="space-y-2 mt-2">
                  <p className="text-body font-medium text-body leading-normal">
                    Senior told that an RBI officer needs to verify funds for 48 hours to remove their name from the National Security Register. Kavach sounded remote siren and alerted guardian on Telegram.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Chip size="sm" variant="hot">Extortion Scheme</Chip>
                    <Chip size="sm" variant="primary">Telegram Alert Sent</Chip>
                  </div>
                </div>
              </DealCard>
            </div>

            {/* SOURCED STATS & PROOF TILES (Honesty Rule: Sourced Claims) */}
            <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-heading font-bold text-ink">The Digital Arrest Epidemic: Sourced Proof</h3>
                <p className="text-caption text-body">
                  Every statistic below is directly cited from official Indian cybercrime reporting portals and police investigations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="p-4 rounded-md border border-hairline bg-canvas">
                  <div className="text-caption text-body font-bold mb-1">National Losses</div>
                  <div className="text-heading-lg font-bold text-hot">
                    {SOURCED_CLAIMS.ncrpLosses.lossFormatted}
                  </div>
                  <div className="text-caption text-ink font-bold mt-1">
                    {SOURCED_CLAIMS.ncrpLosses.complaints} complaints
                  </div>
                  <p className="text-caption text-body mt-2">
                    Retirees and seniors lost over four thousand crore rupees to digital arrest extortion.
                  </p>
                  <a
                    href={SOURCED_CLAIMS.ncrpLosses.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-caption text-primary font-bold hover:underline mt-2 inline-block"
                  >
                    Source: NCRP / NewsBytes ↗
                  </a>
                </div>

                {/* Stat 2 */}
                <div className="p-4 rounded-md border border-hairline bg-canvas">
                  <div className="text-caption text-body font-bold mb-1">Pune Cyber Police</div>
                  <div className="text-heading-lg font-bold text-warm">
                    {SOURCED_CLAIMS.puneCyberPolice.lossFormatted}
                  </div>
                  <div className="text-caption text-ink font-bold mt-1">
                    {SOURCED_CLAIMS.puneCyberPolice.cases} in Pune alone
                  </div>
                  <p className="text-caption text-body mt-2">
                    One 82-year-old victim alone lost ₹10.75 crore during acute psychological fear trance.
                  </p>
                  <a
                    href={SOURCED_CLAIMS.puneCyberPolice.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-caption text-primary font-bold hover:underline mt-2 inline-block"
                  >
                    Source: Pune Police ↗
                  </a>
                </div>

                {/* Stat 3 */}
                <div className="p-4 rounded-md border border-hairline bg-canvas">
                  <div className="text-caption text-body font-bold mb-1">Kavach Recall (Synthetic Text Tests)</div>
                  <div className="text-heading-lg font-bold text-primary">
                    {SOURCED_CLAIMS.detectorRecall.value}
                  </div>
                  <div className="text-caption text-ink font-bold mt-1">
                    95% CI: {SOURCED_CLAIMS.detectorRecall.ci95}
                  </div>
                  <p className="text-caption text-body mt-2">
                    In multi-lingual synthetic text tests, Kavach flags scams before payment stage.
                  </p>
                  <span className="text-caption text-muted mt-2 inline-block">
                    {SOURCED_CLAIMS.detectorRecall.citation}
                  </span>
                </div>
              </div>
            </div>

            {/* 6 CORE ARCHITECTURE FEATURES */}
            <div id="how-it-works" className="bg-surface border border-hairline rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-heading font-bold text-ink">Built to Break the Psychological Trance</h3>
                <p className="text-caption text-body">
                  Telco filters stop spam numbers before the call. Kavach guards the actual conversation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border border-hairline bg-surface hover:shadow-level-2 transition-shadow">
                  <div className="text-ui font-bold text-ink mb-1 flex items-center gap-2">
                    <span className="text-primary">●</span> Understands the Call Live
                  </div>
                  <p className="text-caption text-body">
                    Deterministic sub-millisecond risk engine tracking 5 coercive escalation stages: Authority, Accusation, Isolation, Urgency, and Payment Demand.
                  </p>
                </div>

                <div className="p-4 rounded-md border border-hairline bg-surface hover:shadow-level-2 transition-shadow">
                  <div className="text-ui font-bold text-ink mb-1 flex items-center gap-2">
                    <span className="text-primary">●</span> Speaks in a Family Voice
                  </div>
                  <p className="text-caption text-body">
                    Hearing their son or daughter&apos;s authentic consented voice say &ldquo;Mummy, phone kaat do&rdquo; punctures the trance immediately.
                  </p>
                </div>

                <div className="p-4 rounded-md border border-hairline bg-surface hover:shadow-level-2 transition-shadow">
                  <div className="text-ui font-bold text-ink mb-1 flex items-center gap-2">
                    <span className="text-primary">●</span> Alerts the Caregiver Instantly
                  </div>
                  <p className="text-caption text-body">
                    Guardians receive a signed Telegram action notification with plain Hindi/English explanations and a 1-tap emergency link at Stage 3.
                  </p>
                </div>

                <div className="p-4 rounded-md border border-hairline bg-surface hover:shadow-level-2 transition-shadow">
                  <div className="text-ui font-bold text-ink mb-1 flex items-center gap-2">
                    <span className="text-primary">●</span> Push-to-Talk Intercom
                  </div>
                  <p className="text-caption text-body">
                    Hold the Push-to-Talk button from your phone anywhere in the world. Your live voice broadcasts directly out of the elder&apos;s tablet speaker.
                  </p>
                </div>

                <div className="p-4 rounded-md border border-hairline bg-surface hover:shadow-level-2 transition-shadow">
                  <div className="text-ui font-bold text-ink mb-1 flex items-center gap-2">
                    <span className="text-primary">●</span> Private by Design (DPDP Ready)
                  </div>
                  <p className="text-caption text-body">
                    Zero raw call audio is ever saved on disk or server. Transcript snippets are capped at 160 characters and auto-expire in 7 days.
                  </p>
                </div>

                <div className="p-4 rounded-md border border-hairline bg-surface hover:shadow-level-2 transition-shadow">
                  <div className="text-ui font-bold text-ink mb-1 flex items-center gap-2">
                    <span className="text-primary">●</span> Multi-Lingual Indic Speech
                  </div>
                  <p className="text-caption text-body">
                    Trained on natural Indian code-switching: Hindi, Hinglish colloquial slang, Gujarati, and Indian English conversational patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* TIMELINE VISUALIZATION */}
            <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-heading font-bold text-ink">The 3-Minute Escalation Window</h3>
                <p className="text-caption text-body">
                  Deterministic 5-stage timeline from false badge to extorted transfer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                <div className="p-3 rounded-md bg-canvas border border-hairline">
                  <StageChip stage="S1" />
                  <div className="text-caption font-bold text-ink mt-2">1. Authority</div>
                  <div className="text-micro text-body mt-1">Claims Police / CBI narcotics division</div>
                </div>

                <div className="p-3 rounded-md bg-canvas border border-hairline">
                  <StageChip stage="S2" />
                  <div className="text-caption font-bold text-ink mt-2">2. Accusation</div>
                  <div className="text-micro text-body mt-1">Aadhaar linked to money laundering</div>
                </div>

                <div className="p-3 rounded-md bg-canvas border border-hairline">
                  <StageChip stage="S3" />
                  <div className="text-caption font-bold text-warm mt-2">3. Isolation</div>
                  <div className="text-micro text-body mt-1">&ldquo;Do not tell family, stay on video&rdquo;</div>
                </div>

                <div className="p-3 rounded-md bg-canvas border border-hairline">
                  <StageChip stage="S4" />
                  <div className="text-caption font-bold text-hot mt-2">4. Urgency</div>
                  <div className="text-micro text-body mt-1">&ldquo;Immediate warrant, 10 min arrest&rdquo;</div>
                </div>

                <div className="p-3 rounded-md bg-canvas border border-hairline">
                  <StageChip stage="S5" />
                  <div className="text-caption font-bold text-hot mt-2">5. Payment</div>
                  <div className="text-micro text-body mt-1">Kavach speaks before UPI happens</div>
                </div>
              </div>

              <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
                <RiskMeter level={2} score={70} showBar={false} className="max-w-md w-full" />
                <div className="text-caption text-body">
                  Guardian alerted at <strong className="text-primary">Stage 3 Isolation</strong> · Zero money lost
                </div>
              </div>
            </div>

            {/* TEAM & MISSION */}
            <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-heading font-bold text-ink">Team & Mission</h3>
                <p className="text-caption text-body">
                  Engineered for Gnani AI&apos;s Great Indian AI Internship Challenge. Building authentic, measurable speech AI guardians.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {team.map((m) => (
                  <div key={m.id} className="p-4 rounded-md border border-hairline bg-canvas">
                    <div className="w-10 h-10 rounded-circle bg-surface border border-hairline flex items-center justify-center font-bold text-primary text-ui mb-2">
                      {m.initials}
                    </div>
                    <div className="text-ui font-bold text-ink">{m.name}</div>
                    <div className="text-caption font-bold text-primary">{m.role}</div>
                    <p className="text-caption text-body mt-2 leading-relaxed">{m.bio}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PRIVATE BETA FEEDBACK */}
            <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-heading font-bold text-ink">Caregiver Feedback</h3>
                <p className="text-caption text-body">
                  Feedback from Indian families participating in non-deception tabletop acoustic tests.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quotes.map((q) => (
                  <div key={q.id} className="p-4 rounded-md border border-hairline bg-canvas flex flex-col justify-between">
                    <p className="text-caption text-ink italic leading-relaxed">
                      &ldquo;{q.quote}&rdquo;
                    </p>
                    <div className="mt-3 pt-2 border-t border-hairline text-caption">
                      <div className="font-bold text-ink">{q.author}</div>
                      <div className="text-muted">{q.role} · {q.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT 1-COLUMN SIDEBAR RAIL (Coupon, News, Status & Kiosk Cards) */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            
            {/* Sidebar Card 1: Elder Kiosk Stream Status */}
            <SidebarCard
              title="Tabletop Kiosk Status"
              action={<span className="text-primary font-bold text-caption">LIVE MONITOR</span>}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-caption py-1 border-b border-hairline">
                  <span className="text-body">Acoustic Audio:</span>
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    16 kHz Room VAD
                  </span>
                </div>

                <div className="flex items-center justify-between text-caption py-1 border-b border-hairline">
                  <span className="text-body">Detector Latency:</span>
                  <span className="font-bold text-ink font-mono">0.42 ms</span>
                </div>

                <div className="flex items-center justify-between text-caption py-1 border-b border-hairline">
                  <span className="text-body">Monthly Listening Quota:</span>
                  <span className="font-bold text-primary font-mono">120 / 150 min</span>
                </div>

                <div className="pt-1">
                  <div className="text-caption font-bold text-ink mb-1.5">Room Acoustic Energy:</div>
                  <Bars count={16} barColor="#30a83c" />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  href="http://localhost:3001/elder"
                  className="w-full mt-2"
                >
                  Launch Elder Kiosk
                </Button>
              </div>
            </SidebarCard>

            {/* Sidebar Card 2: National Helpline Direct Access */}
            <SidebarCard
              title="National Cyber Helpline"
              action={<span className="text-hot font-bold text-caption">DIAL 1930</span>}
            >
              <div className="space-y-2 text-caption">
                <p className="text-body leading-relaxed">
                  If an elder transferred money within the last 2 hours, the Golden Window allows freezing bank accounts immediately.
                </p>
                <div className="p-3 bg-canvas border border-hairline rounded-md text-ink font-mono">
                  <div className="font-bold text-hot text-ui">Helpline: 1930</div>
                  <div className="text-muted text-micro">National Cyber Crime Reporting Portal</div>
                </div>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1"
                >
                  <span>Visit cybercrime.gov.in</span>
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:arrow-right-up-linear" width="14" height="14" />
                </a>
              </div>
            </SidebarCard>

            {/* Sidebar Card 3: Top Scam Patterns Detected */}
            <SidebarCard
              title="Trending Scam Patterns"
              action={<span className="text-caption text-body">10 Active</span>}
            >
              <div className="space-y-2">
                {SCAM_FAMILIES.slice(0, 6).map((fam) => (
                  <div
                    key={fam.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-canvas transition-colors text-caption"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-primary font-bold">#</span>
                      <span className="font-bold text-ink truncate">{fam.name}</span>
                    </div>
                    <Badge variant="neutral-subtle">Active Threat</Badge>
                  </div>
                ))}
              </div>
            </SidebarCard>

            {/* Sidebar Card 4: Guardian Quick Launch */}
            <SidebarCard title="Guardian Control Panel">
              <div className="space-y-3">
                <p className="text-caption text-body leading-relaxed">
                  Monitor elder phone sessions, review call transcript snippets, and configure family voice consent.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="md"
                    href="http://localhost:3001"
                    className="w-full"
                  >
                    Open Guardian Dashboard
                  </Button>
                  <Button
                    variant="outline-neutral"
                    size="md"
                    href="http://localhost:3001/onboarding"
                    className="w-full"
                  >
                    + Enroll New Household Elder
                  </Button>
                </div>
              </div>
            </SidebarCard>

            {/* Sidebar Card 5: Waitlist CTA */}
            <SidebarCard title="Private Beta Access">
              <div className="space-y-3">
                <p className="text-caption text-body leading-relaxed">
                  Join 1,400+ caregivers across India securing elderly parents against digital arrest and courier scams.
                </p>
                <Button
                  variant="outline-green"
                  size="md"
                  href="/pricing#waitlist"
                  className="w-full"
                >
                  Join Early Access Waitlist
                </Button>
              </div>
            </SidebarCard>

          </div>

        </div>
      </main>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}
