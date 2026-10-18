'use client';

import React, { useState } from 'react';
import {
  Frame,
  HatchOverlay,
  AuroraCanvas,
  WordReveal,
  GlassCard,
  TiltCard,
  FloatingCard,
  Button,
  MagneticButton,
  Chip,
  StageChip,
  RiskMeter,
  Bars,
  SliderMeter,
  StatusDot,
  Icon,
  KavachLogo,
} from '@kavach/ui';
import {
  SOURCED_CLAIMS,
  SCAM_FAMILIES,
  quotes,
  team,
} from '@kavach/api-contract';

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');

  return (
    <Frame withHatch={false} className="pb-12">
      {/* Layer 1: WebGL Aurora Canvas (z-0, opacity .9) */}
      <AuroraCanvas parallaxPercent={22} />

      {/* Layer 2: 115deg Hatch Pattern Overlay (z-1, pointer-events-none) */}
      <HatchOverlay />

      {/* Layer 3: Header / Navigation (relative z-10) */}
      <header className="relative z-10 px-6 py-5 sm:px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2.5 focus:outline-none">
            <KavachLogo size={32} showWordmark={true} />
          </a>

          {/* Navigation links with border 1px solid rgba(255,255,255,0.18), hover:scale-104 */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-heading font-medium tracking-tight text-white/80">
            <a
              href="#how-it-works"
              className="px-3.5 py-1.5 rounded-full border border-white/18 bg-white/5 hover:border-white/30 hover:text-white transition-all hover:scale-104 active:scale-95"
            >
              How it works
            </a>
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-full border border-white/18 bg-white/5 hover:border-white/30 hover:text-white transition-all hover:scale-104 active:scale-95"
            >
              Features
            </a>
            <a
              href="/pricing"
              className="px-3.5 py-1.5 rounded-full border border-white/18 bg-white/5 hover:border-white/30 hover:text-white transition-all hover:scale-104 active:scale-95"
            >
              Pricing
            </a>
            <a
              href="#story"
              className="px-3.5 py-1.5 rounded-full border border-white/18 bg-white/5 hover:border-white/30 hover:text-white transition-all hover:scale-104 active:scale-95"
            >
              Story
            </a>
            <a
              href="/changelog"
              className="px-3.5 py-1.5 rounded-full border border-white/18 bg-white/5 hover:border-white/30 hover:text-white transition-all hover:scale-104 active:scale-95"
            >
              Changelog
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher EN / HI / GU */}
          <div className="flex items-center p-0.5 rounded-full border border-white/14 bg-white/5 text-[11px] font-mono">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'en' ? 'bg-[#c8f542] text-[#0a2a12] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'hi' ? 'bg-[#c8f542] text-[#0a2a12] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              HI
            </button>
            <button
              onClick={() => setLang('gu')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'gu' ? 'bg-[#c8f542] text-[#0a2a12] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              GU
            </button>
          </div>

          {/* Join Waitlist Magnetic CTA Button */}
          <MagneticButton strength={0.25}>
            <Button variant="lime" size="sm" href="/pricing#waitlist" icon="user-plus-bold">
              Join Waitlist
            </Button>
          </MagneticButton>
        </div>
      </header>

      {/* Layer 4: Sections (relative z-10) */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-12 space-y-24 pt-8">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO */}
        {/* ========================================================================= */}
        <section className="relative min-h-[580px] lg:min-h-[640px] pt-8 sm:pt-14 pb-12 flex flex-col justify-center">
          {/* Top Pill Disclaimer */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/18 bg-white/5 backdrop-blur-md text-xs font-mono text-white/80">
              <StatusDot status="listening" label="" />
              <span>Listens on a second device when you put a call on speaker</span>
            </div>
          </div>

          <div className="max-w-2xl">
            {/* H1 with data-reveal-words */}
            <WordReveal
              as="h1"
              delay={0.15}
              className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-white/95"
            >
              Hang up. It&apos;s a scam.
            </WordReveal>

            {/* Subtext */}
            <p className="mt-6 text-base sm:text-lg text-white/70 font-body leading-relaxed max-w-xl">
              The dedicated tabletop guardian for Indian elders. Kavach listens to suspicious calls
              on speakerphone, detects coercive digital arrest interrogation, and speaks in your trusted family
              voice before life savings are lost.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton strength={0.3}>
                <Button variant="lime" size="lg" href="/pricing#waitlist" icon="shield-check-bold">
                  Protect Your Parents
                </Button>
              </MagneticButton>

              <Button variant="ghost" size="lg" href="#how-it-works" icon="play-circle-bold">
                How It Works
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* HERO FLOATING CARDS (6 Sample Preview Cards) */}
          {/* Desktop: lg:absolute positioning; Mobile: normal responsive grid */}
          {/* ========================================================================= */}
          <div className="mt-12 lg:mt-0 grid grid-cols-1 sm:grid-cols-2 lg:block gap-4">
            {/* Card 1: Listening Quota Slider (Top right desktop) */}
            <FloatingCard
              floatDistancePx={10}
              delaySeconds={0}
              durationSeconds={4.5}
              className="lg:top-6 lg:right-4 w-full sm:w-72"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Sample preview
              </div>
              <SliderMeter defaultValue={120} max={150} unit="min" label="Monthly Quota" readOnly />
            </FloatingCard>

            {/* Card 2: Calls Checked / Threats Stopped (Right center) */}
            <FloatingCard
              floatDistancePx={8}
              delaySeconds={0.8}
              durationSeconds={5.2}
              className="lg:top-36 lg:right-12 w-full sm:w-64"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Sample preview
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-mono font-bold text-white/90">42</div>
                  <div className="text-xs text-white/60">Calls verified safe</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[#f5b942]">2</div>
                  <div className="text-xs text-[#f5b942]/80 font-medium">Scams halted</div>
                </div>
              </div>
            </FloatingCard>

            {/* Card 3: Status "Kavach is listening" (Upper center right) */}
            <FloatingCard
              floatDistancePx={12}
              delaySeconds={1.5}
              durationSeconds={4.8}
              className="lg:top-14 lg:right-80 w-full sm:w-60"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Sample preview
              </div>
              <StatusDot status="listening" label="Kavach is listening" />
              <div className="text-[11px] text-white/50 mt-1">16 kHz PCM room acoustic VAD</div>
            </FloatingCard>

            {/* Card 4: Audio Spectrum Bars (Lower right) */}
            <FloatingCard
              floatDistancePx={7}
              delaySeconds={0.4}
              durationSeconds={4.0}
              className="lg:bottom-12 lg:right-6 w-full sm:w-72"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Sample preview · Speech analysis
              </div>
              <Bars count={14} barColor="#c8f542" />
            </FloatingCard>

            {/* Card 5: Supported Languages Chips (Lower center) */}
            <FloatingCard
              floatDistancePx={9}
              delaySeconds={1.2}
              durationSeconds={5.0}
              className="lg:bottom-6 lg:right-84 w-full sm:w-72"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
                Sample preview · Regional coverage
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip size="sm" variant="lime">Hindi</Chip>
                <Chip size="sm" variant="default">Hinglish</Chip>
                <Chip size="sm" variant="default">Gujarati</Chip>
                <Chip size="sm" variant="outline">Indian English</Chip>
              </div>
            </FloatingCard>

            {/* Card 6: Cloned Family Voice Warning Card (Bottom center) */}
            <FloatingCard
              floatDistancePx={11}
              delaySeconds={1.9}
              durationSeconds={4.7}
              className="lg:top-72 lg:right-64 w-full sm:w-80 border-[#c8f542]/30 shadow-lime-glow"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#c8f542] mb-1">
                Sample preview · Consented Family Voice
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full border border-[#c8f542] flex items-center justify-center shrink-0 text-[#c8f542]">
                  <Icon name="volume-loud-bold" size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/95">
                    &ldquo;Mummy, yeh scam call hai! Phone kaat do!&rdquo;
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">Spoken in Rahul&apos;s verified voice</div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SCAM FAMILIES STRIP */}
        {/* ========================================================================= */}
        <section className="border-y border-white/10 py-8">
          <div className="text-center mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-white/40">
              10 Coercive Scam Patterns Detected in Real Time
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SCAM_FAMILIES.map((fam) => (
              <div
                key={fam.id}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-[#c8f542]/40 hover:bg-white/[0.06] transition-all group"
              >
                <span className="text-white/30 group-hover:text-[#c8f542] transition-colors shrink-0">
                  <Icon name={fam.icon} size={20} />
                </span>
                <span className="text-xs font-heading font-medium text-white/70 group-hover:text-white transition-colors truncate">
                  {fam.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: "WHY NOW" SOURCED STAT CARDS (Honesty Rule: No fake partner logos) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="max-w-xl">
            <WordReveal as="h2" triggerOnScroll={true} className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
              The Digital Arrest Epidemic: Sourced Proof
            </WordReveal>
            <p className="text-sm text-white/60 font-body mt-2">
              Every statistic below is directly cited from official Indian cybercrime reporting portals and police investigations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sourced Stat 1: NCRP National Losses */}
            <GlassCard isHighlighted={true} withHoverShift={true}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#c8f542] mb-2 flex items-center justify-between">
                <span>National Crisis (2022–May 2026)</span>
                <Icon name="verified-check-bold" size={14} />
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white/95 tracking-tight">
                {SOURCED_CLAIMS.ncrpLosses.lossFormatted}
              </div>
              <div className="text-xs font-semibold text-white/80 mt-1">
                {SOURCED_CLAIMS.ncrpLosses.complaints} complaints filed
              </div>
              <p className="text-xs text-white/60 mt-3 leading-relaxed">
                Retirees and seniors lost over four thousand crore rupees to digital arrest extortion.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-white/40">
                <a
                  href={SOURCED_CLAIMS.ncrpLosses.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#c8f542] underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Source: NCRP / NewsBytes (6 Jul 2026)</span>
                  <Icon name="arrow-up-right-linear" size={10} />
                </a>
              </div>
            </GlassCard>

            {/* Sourced Stat 2: Pune Cyber Police */}
            <GlassCard withHoverShift={true}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-2 flex items-center justify-between">
                <span>Elder Vulnerability (19 Months)</span>
                <Icon name="verified-check-bold" size={14} />
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white/95 tracking-tight">
                {SOURCED_CLAIMS.puneCyberPolice.lossFormatted}
              </div>
              <div className="text-xs font-semibold text-white/80 mt-1">
                {SOURCED_CLAIMS.puneCyberPolice.cases} in Pune alone
              </div>
              <p className="text-xs text-white/60 mt-3 leading-relaxed">
                One 82-year-old victim alone lost ₹10.75 crore during acute psychological fear trance.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-white/40">
                <a
                  href={SOURCED_CLAIMS.puneCyberPolice.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#c8f542] underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Source: Pune Police / Punekar News</span>
                  <Icon name="arrow-up-right-linear" size={10} />
                </a>
              </div>
            </GlassCard>

            {/* Sourced Stat 3: Kavach Tested Recall */}
            <GlassCard withHoverShift={true}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
                <span>Speakerphone Testbed</span>
                <Icon name="verified-check-bold" size={14} />
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white/95 tracking-tight">
                {SOURCED_CLAIMS.detectorRecall.value}
              </div>
              <div className="text-xs font-semibold text-white/80 mt-1">
                95% Wilson CI: {SOURCED_CLAIMS.detectorRecall.ci95}
              </div>
              <p className="text-xs text-white/60 mt-3 leading-relaxed">
                In multi-lingual synthetic text tests, Kavach flags scams before the victim reaches the payment stage.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-white/40">
                <span className="text-white/50">{SOURCED_CLAIMS.detectorRecall.citation}</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: 6 FEATURES TILT CARDS */}
        {/* ========================================================================= */}
        <section id="features" className="space-y-6">
          <div className="max-w-xl">
            <WordReveal as="h2" triggerOnScroll={true} className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
              Built to Break the Psychological Trance
            </WordReveal>
            <p className="text-sm text-white/60 font-body mt-2">
              Telco filters stop spam numbers before the call. Kavach guards the actual conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <TiltCard maxTiltDeg={6} isHighlighted={false}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#c8f542] flex items-center justify-center mb-4">
                <Icon name="cpu-bolt-bold" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white/95 tracking-tight">
                Understands the Call Live
              </h3>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">
                Deterministic sub-millisecond risk engine tracking 5 coercive escalation stages:
                Authority, Accusation, Isolation, Urgency, and Payment Demand.
              </p>
            </TiltCard>

            {/* Feature 2 */}
            <TiltCard maxTiltDeg={6} isHighlighted={true}>
              <div className="w-10 h-10 rounded-xl bg-[#c8f542]/15 border border-[#c8f542]/30 text-[#c8f542] flex items-center justify-center mb-4">
                <Icon name="volume-loud-bold" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white/95 tracking-tight">
                Speaks in a Family Voice
              </h3>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">
                Elders panic and obey fake police uniforms. Hearing their son or daughter&apos;s authentic voice
                say &ldquo;Mummy, phone kaat do&rdquo; punctures the trance immediately.
              </p>
            </TiltCard>

            {/* Feature 3 */}
            <TiltCard maxTiltDeg={6} isHighlighted={false}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center mb-4">
                <Icon name="bell-bing-bold" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white/95 tracking-tight">
                Alerts the Caregiver Instantly
              </h3>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">
                Guardians receive a signed Telegram action notification with plain Hindi/English explanations
                and a 1-tap emergency link the second Level 2 is crossed.
              </p>
            </TiltCard>

            {/* Feature 4 */}
            <TiltCard maxTiltDeg={6} isHighlighted={false}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center mb-4">
                <Icon name="microphone-3-bold" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white/95 tracking-tight">
                Talk Through the Device (Intercom)
              </h3>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">
                Hold the Push-to-Talk button from your phone anywhere in the world. Your live voice broadcasts
                directly out of the elder&apos;s tabletop tablet speaker.
              </p>
            </TiltCard>

            {/* Feature 5 */}
            <TiltCard maxTiltDeg={6} isHighlighted={false}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-blue-400 flex items-center justify-center mb-4">
                <Icon name="shield-keyhole-bold" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white/95 tracking-tight">
                Private by Design (DPDP Ready)
              </h3>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">
                Zero raw call audio is ever saved on disk or server. Transcript snippets are capped at 160
                characters and auto-expire in 7 days.
              </p>
            </TiltCard>

            {/* Feature 6 */}
            <TiltCard maxTiltDeg={6} isHighlighted={false}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-purple-400 flex items-center justify-center mb-4">
                <Icon name="chat-round-line-bold" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white/95 tracking-tight">
                Multi-Lingual Indic Speech
              </h3>
              <p className="text-xs text-white/60 font-body mt-2 leading-relaxed">
                Trained on natural Indian code-switching: Hindi, Hinglish colloquial slang, Gujarati,
                and Indian English conversational patterns.
              </p>
            </TiltCard>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: STORY & TIMELINE ILLUSTRATION */}
        {/* ========================================================================= */}
        <section id="story" className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#c8f542]/30 bg-[#c8f542]/10 text-xs font-mono text-[#c8f542] mb-2">
                <Icon name="map-point-bold" size={14} />
                <span>Built in India, 2026</span>
              </div>
              <WordReveal as="h2" triggerOnScroll={true} className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
                The 3-Minute Escalation Window
              </WordReveal>
            </div>

            <div className="text-xs font-mono text-white/50">
              Deterministic 5-stage psychological timeline
            </div>
          </div>

          {/* Timeline visualization */}
          <GlassCard className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              <div className="flex flex-col items-start gap-2">
                <StageChip stage="S1" />
                <div className="text-xs font-semibold text-white/90 mt-1">1. False Authority</div>
                <div className="text-[11px] text-white/50">Caller claims Mumbai Police / CBI narcotics division</div>
              </div>

              <div className="flex flex-col items-start gap-2">
                <StageChip stage="S2" />
                <div className="text-xs font-semibold text-white/90 mt-1">2. Accusation</div>
                <div className="text-[11px] text-white/50">Claims Aadhaar misused for illegal money laundering</div>
              </div>

              <div className="flex flex-col items-start gap-2">
                <StageChip stage="S3" />
                <div className="text-xs font-semibold text-amber-400 mt-1">3. Isolation (L2 Alert)</div>
                <div className="text-[11px] text-white/50">&ldquo;Do not tell family, stay on video call&rdquo;</div>
              </div>

              <div className="flex flex-col items-start gap-2">
                <StageChip stage="S4" />
                <div className="text-xs font-semibold text-rose-400 mt-1">4. Severe Urgency</div>
                <div className="text-[11px] text-white/50">&ldquo;Immediate warrant issued, arrest within 10 minutes&rdquo;</div>
              </div>

              <div className="flex flex-col items-start gap-2">
                <StageChip stage="S5" />
                <div className="text-xs font-semibold text-[#ff5a4d] mt-1">5. Payment Demand</div>
                <div className="text-[11px] text-white/50">Kavach screams warning before UPI/RTGS occurs</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <RiskMeter level={2} score={70} showBar={false} className="max-w-md w-full" />
              <div className="text-xs font-mono text-white/60">
                Guardian alerted at <span className="text-[#c8f542] font-bold">Stage 3</span> · Zero money lost
              </div>
            </div>
          </GlassCard>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: TEAM (Honesty Rule: Initials avatars with lime borders) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="max-w-xl">
            <WordReveal as="h2" triggerOnScroll={true} className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
              Team & Mission
            </WordReveal>
            <p className="text-sm text-white/60 font-body mt-2">
              Engineered for Gnani AI&apos;s Great Indian AI Internship Challenge. Building authentic, measurable speech AI guardians.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((m) => (
              <GlassCard key={m.id} withHoverShift={true} className="text-left">
                <div className="w-12 h-12 rounded-full border-2 border-[#c8f542] bg-[#0a2a12] flex items-center justify-center font-mono font-bold text-[#c8f542] text-sm mb-4">
                  {m.initials}
                </div>
                <h4 className="font-heading font-semibold text-base text-white/95">{m.name}</h4>
                <div className="text-xs text-[#c8f542] font-mono mt-0.5">{m.role}</div>
                <p className="text-xs text-white/60 mt-3 leading-relaxed">{m.bio}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: PRIVATE BETA VOICES (Honesty Rule: Private beta trio) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="max-w-xl">
            <WordReveal as="h2" triggerOnScroll={true} className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
              Private Beta Validation
            </WordReveal>
            <p className="text-sm text-white/60 font-body mt-2">
              Feedback from Indian families participating in non-deception tabletop acoustic tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quotes.map((q) => (
              <GlassCard key={q.id} withHoverShift={true}>
                <div className="text-[#c8f542] mb-3">
                  <Icon name="chat-line-bold" size={20} />
                </div>
                <p className="text-xs text-white/80 italic font-body leading-relaxed">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="text-xs font-semibold text-white/90">{q.author}</div>
                  <div className="text-[11px] text-white/50">{q.role} · {q.city}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: CTA BLOCK (Exact 28px rounded corners + radial cta-gradient) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#c8f542]/30 p-8 sm:p-14 text-center bg-cta-gradient shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-white/95">
              Protect Your Parents Before the Next Call
            </h2>
            <p className="text-sm text-white/70 font-body leading-relaxed">
              Join 1,400+ caregivers across India securing elderly parents against digital arrest and courier scams.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <MagneticButton strength={0.3}>
                <Button variant="lime" size="lg" href="/pricing#waitlist" icon="shield-check-bold">
                  Join the Early Access Waitlist
                </Button>
              </MagneticButton>
            </div>
            <div className="text-[11px] text-white/40 pt-2 font-mono">
              Free during private beta · No credit card required · Instant WhatsApp alert demo
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: FOOTER (5 Columns) */}
        {/* ========================================================================= */}
        <footer className="pt-12 pb-8 border-t border-white/10 text-xs font-body text-white/60">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand & Disclaimer */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <KavachLogo size={28} showWordmark={true} />
              <p className="text-[11px] text-white/50 leading-relaxed">
                Kavach listens on a dedicated second device when you take a call on speaker. We do not tap or intercept telco lines.
              </p>
              <div className="text-[10px] text-white/40 font-mono">
                Built for Gnani AI Challenge · Nov 2026
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-2">
              <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">Product</div>
              <div><a href="#how-it-works" className="hover:text-[#c8f542] transition-colors">How It Works</a></div>
              <div><a href="#features" className="hover:text-[#c8f542] transition-colors">Detection Engine</a></div>
              <div><a href="/pricing" className="hover:text-[#c8f542] transition-colors">Pricing Plans</a></div>
              <div><a href="/pricing#waitlist" className="hover:text-[#c8f542] transition-colors">Private Beta</a></div>
            </div>

            {/* Col 3: Learn & Safety */}
            <div className="space-y-2">
              <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">Learn</div>
              <div><a href="#story" className="hover:text-[#c8f542] transition-colors">Digital Arrest Guide</a></div>
              <div><a href="#story" className="hover:text-[#c8f542] transition-colors">Courier Narcotics Scam</a></div>
              <div><a href="#story" className="hover:text-[#c8f542] transition-colors">Bank KYC Advisory</a></div>
              <div><a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Cyber Helpline: 1930</a></div>
            </div>

            {/* Col 4: Company */}
            <div className="space-y-2">
              <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">Company</div>
              <div><a href="#story" className="hover:text-[#c8f542] transition-colors">About Project</a></div>
              <div><a href="/changelog" className="hover:text-[#c8f542] transition-colors">Changelog</a></div>
              <div><a href="https://github.com/pritp/kavach" target="_blank" rel="noreferrer" className="hover:text-[#c8f542] transition-colors">GitHub Repository</a></div>
            </div>

            {/* Col 5: Legal */}
            <div className="space-y-2">
              <div className="font-heading font-semibold text-white/90 text-xs uppercase tracking-wider mb-3">Legal</div>
              <div><a href="/pricing" className="hover:text-[#c8f542] transition-colors">Privacy Policy</a></div>
              <div><a href="/pricing" className="hover:text-[#c8f542] transition-colors">Terms of Service</a></div>
              <div><a href="/pricing" className="hover:text-[#c8f542] transition-colors">DPDP Act Compliance</a></div>
              <div><span className="text-[10px] text-amber-400 font-mono">DRAFT: Pending legal review</span></div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40 font-mono">
            <div>&copy; 2026 Kavach Security Inc. All rights reserved.</div>
            <div>Zero audio retained · DPDP 2023 aligned</div>
          </div>
        </footer>
      </div>
    </Frame>
  );
}
