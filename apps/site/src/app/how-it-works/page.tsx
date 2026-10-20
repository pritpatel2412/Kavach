'use client';

import React from 'react';
import {
  Button,
  StageChip,
  StatusDot,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/how-it-works" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            <StatusDot status="listening" label="" />
            <span>Second-Device Architecture</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            How Kavach Protects Your Parents
          </h1>
          <p className="text-lead text-body font-medium max-w-2xl mx-auto">
            Zero network taps. Zero carrier interception. Kavach operates over room speakerphone, analyzing conversation patterns and alerting family before money is transferred.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-surface border border-hairline rounded-md p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-level-2 transition-shadow">
            <div className="w-10 h-10 rounded-md bg-canvas border border-hairline text-primary flex items-center justify-center font-bold text-ui shrink-0">
              01
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-heading font-bold text-ink">
                The Call Begins on Speakerphone
              </h3>
              <p className="text-body font-medium text-body leading-relaxed">
                When an unfamiliar number or robocall rings, the elder answers on speakerphone. Kavach sits
                on a secondary device (an old tablet or phone kept on the tabletop). The elder taps &ldquo;Start&rdquo; or leaves
                hands-free mode active.
              </p>
              <div className="p-3 rounded-md bg-canvas border border-hairline text-caption font-mono text-body">
                Acoustic room capture at 16 kHz PCM · Silence gated (zero credits burned when quiet)
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface border border-hairline rounded-md p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-level-2 transition-shadow">
            <div className="w-10 h-10 rounded-md bg-canvas border border-hairline text-warm flex items-center justify-center font-bold text-ui shrink-0">
              02
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-heading font-bold text-ink">
                Deterministic 5-Stage Pattern Detection
              </h3>
              <p className="text-body font-medium text-body leading-relaxed">
                As the scammer delivers their interrogation script, our sub-millisecond offline engine tracks psychological stages:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <StageChip stage="S1" />
                <StageChip stage="S2" />
                <StageChip stage="S3" />
                <StageChip stage="S4" />
                <StageChip stage="S5" />
              </div>
              <p className="text-caption text-body pt-1 font-medium">
                Adversarial benign filtering prevents legitimate bank notifications or doctor reminders from firing false alarms.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface border border-hairline rounded-md p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-level-2 transition-shadow">
            <div className="w-10 h-10 rounded-md bg-canvas border border-hairline text-hot flex items-center justify-center font-bold text-ui shrink-0">
              03
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-heading font-bold text-ink">
                Immediate Family Voice Intervention
              </h3>
              <p className="text-body font-medium text-body leading-relaxed">
                When the scammer enforces isolation (&ldquo;Do not tell anyone, stay on camera&rdquo;), Kavach interrupts through the tabletop speaker in the son or daughter&apos;s verified cloned voice.
              </p>
              <div className="p-3 rounded-md bg-discount-surface border border-hairline text-green-strong text-caption font-bold">
                &ldquo;Mummy, yeh scam call hai! Abhi phone kaat do!&rdquo; ( राहुल ki aawaz )
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-surface border border-hairline rounded-md p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-level-2 transition-shadow">
            <div className="w-10 h-10 rounded-md bg-canvas border border-hairline text-cold flex items-center justify-center font-bold text-ui shrink-0">
              04
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-heading font-bold text-ink">
                Caregiver Telegram Alert & Remote Drop
              </h3>
              <p className="text-body font-medium text-body leading-relaxed">
                Simultaneously, the registered guardian receives a high-priority Telegram message with a 1-tap call-drop button and Push-to-Talk intercom directly to the elder&apos;s living room.
              </p>
              <div className="p-3 rounded-md bg-canvas border border-hairline text-caption font-mono text-body">
                Delivery latency &lt; 450 ms · Audio transcript excerpt &lt; 160 characters (DPDP compliant)
              </div>
            </div>
          </div>
        </div>

        {/* Live Demo Banner */}
        <div className="bg-surface border border-hairline rounded-md p-8 text-center space-y-4 shadow-sm">
          <h2 className="text-heading-lg font-bold text-ink">
            Experience the Audio Pipeline Live
          </h2>
          <p className="text-body font-medium text-body max-w-lg mx-auto">
            Test Kavach in offline mock mode (zero paid credits) or connect with live Gnani Prisma STT and Timbre TTS.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" href="http://localhost:8000/?mock=1&judge=1">
              Open Demo Studio (Port 8000)
            </Button>
            <Button variant="outline-green" size="lg" href="/pricing#waitlist">
              Join Early Beta
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
