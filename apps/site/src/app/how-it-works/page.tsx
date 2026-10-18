'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  StageChip,
  RiskMeter,
  StatusDot,
  Icon,
  KavachLogo,
} from '@kavach/ui';

export default function HowItWorksPage() {
  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 sm:px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <a href="/" className="flex items-center gap-2.5 focus:outline-none">
          <KavachLogo size={32} showWordmark={true} />
        </a>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs font-heading font-medium tracking-tight text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Icon name="arrow-left-linear" size={14} />
            <span>Home</span>
          </a>

          <Button variant="lime" size="sm" href="/pricing#waitlist">
            Join Waitlist
          </Button>
        </div>
      </header>

      <div className="relative z-10 px-6 sm:px-10 lg:px-12 pt-10 max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <StatusDot status="listening" label="" />
            <span>Second-Device Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            How Kavach Protects Your Parents
          </h1>
          <p className="text-sm sm:text-base text-white/60 font-body max-w-2xl mx-auto">
            Zero network taps. Zero carrier interception. Kavach operates over room speakerphone, analyzing conversation patterns and alerting family before money is transferred.
          </p>
        </div>

        {/* 4 Step Diagram */}
        <div className="space-y-6">
          {/* Step 1 */}
          <GlassCard className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#c8f542]/15 border border-[#c8f542]/30 text-[#c8f542] flex items-center justify-center font-mono font-bold text-lg shrink-0">
              01
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-heading font-semibold text-lg text-white/95">
                The Call Begins on Speakerphone
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                When an unfamiliar number or robocall rings, the elder answers on speakerphone. Kavach sits
                on a secondary device (an old tablet or phone kept on the tabletop). The elder taps &ldquo;Start&rdquo; or leaves
                hands-free mode active.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/8 text-xs font-mono text-white/60">
                Acoustic room capture at 16 kHz PCM · Silence gated (zero credits burned when quiet)
              </div>
            </div>
          </GlassCard>

          {/* Step 2 */}
          <GlassCard className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-mono font-bold text-lg shrink-0">
              02
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-heading font-semibold text-lg text-white/95">
                Deterministic 5-Stage Pattern Detection
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                As the scammer delivers their interrogation script, our sub-millisecond offline engine tracks psychological stages:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <StageChip stage="S1" />
                <StageChip stage="S2" />
                <StageChip stage="S3" />
                <StageChip stage="S4" />
                <StageChip stage="S5" />
              </div>
              <p className="text-xs text-white/60 pt-1">
                Adversarial benign filtering prevents legitimate bank notifications or doctor reminders from firing false alarms.
              </p>
            </div>
          </GlassCard>

          {/* Step 3 */}
          <GlassCard className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-rose-400/15 border border-rose-400/30 text-rose-300 flex items-center justify-center font-mono font-bold text-lg shrink-0">
              03
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-heading font-semibold text-lg text-white/95">
                Stage 3 Isolation Triggers Immediate Caregiver Alert
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                The moment the caller says &ldquo;Do not tell your family, stay on video, this is a confidential CBI enquiry&rdquo;, Kavach escalates to Level 2 (Caution). An instant Telegram push notification with a 1-click action link is dispatched to family caregivers.
              </p>
              <RiskMeter level={2} score={70} showBar={false} className="max-w-md mt-2" />
            </div>
          </GlassCard>

          {/* Step 4 */}
          <GlassCard className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#ff5a4d]/15 border border-[#ff5a4d]/30 text-[#ff5a4d] flex items-center justify-center font-mono font-bold text-lg shrink-0">
              04
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-heading font-semibold text-lg text-white/95">
                Intervention & Emergency Voice Break
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                The caregiver can hold the live Push-to-Talk button from their smartphone anywhere in the world to speak out of the elder&apos;s speaker. If the caregiver cannot connect within 20 seconds of an escalation, Kavach speaks a pre-rendered alert in the son or daughter&apos;s consented voice:
              </p>
              <div className="p-3.5 rounded-xl border border-[#c8f542]/40 bg-[#c8f542]/10 text-white/90 text-xs font-semibold flex items-center gap-2">
                <Icon name="volume-loud-bold" size={18} color="#c8f542" />
                <span>&ldquo;Mummy, yeh scam call hai! Phone kaat do! Main ghar aa raha hoon.&rdquo;</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Button variant="lime" size="lg" href="/pricing#waitlist">
            Protect Your Family with Kavach
          </Button>
        </div>
      </div>
    </Frame>
  );
}
