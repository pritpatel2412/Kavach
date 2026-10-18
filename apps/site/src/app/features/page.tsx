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
  Chip,
  Bars,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function FeaturesPage() {
  const latencyMetrics = [
    { component: 'Acoustic Room Capture (16 kHz PCM)', latency: '16 ms buffer', provider: 'Client AudioWorklet', color: 'border-white/20' },
    { component: 'Real-time Streaming STT (Hinglish/Hindi/Eng)', latency: '220 ms avg', provider: 'Gnani Prisma Engine', color: 'border-emerald-500/40 text-emerald-300' },
    { component: 'Deterministic 5-Stage Risk Scorer', latency: '0.8 ms', provider: 'Kavach Pure Python Scorer', color: 'border-[#c8f542]/40 text-[#c8f542]' },
    { component: 'Voice Synthesis & Prerender Alert (L2/L3)', latency: '340 ms', provider: 'Gnani Timbre / Prerendered Cache', color: 'border-amber-500/40 text-amber-300' },
    { component: 'Caregiver Push Dispatch (Telegram Bot API)', latency: '410 ms', provider: 'Telegram / Webhook Delivery', color: 'border-blue-500/40 text-blue-300' },
  ];

  const features = [
    {
      id: 'speakerphone-capture',
      badge: 'Architecture',
      title: 'Second-Device Acoustic Room Capture',
      desc: 'Kavach requires zero telecommunication carrier access or SIM-level wiretapping. An old tablet or spare smartphone sits on the living room table. When the elder puts an unknown caller on speakerphone, Kavach captures acoustic audio at 16 kHz PCM.',
      details: [
        'Client-side energy VAD with local silence gating (0 credits wasted on silence)',
        'Resilient to ambient background noise (televisions, pressure cookers, traffic)',
        'Automatic disconnect after 3 minutes of continuous silence or 20 minutes maximum',
      ],
      icon: 'devices-outline',
    },
    {
      id: 'deterministic-detector',
      badge: 'Core Intelligence',
      title: 'Deterministic 5-Stage Scam State Machine',
      desc: 'Scammers execute well-defined psychological extortion scripts. Rather than relying on slow, non-deterministic LLM chat completions, Kavach runs an offline, zero-I/O finite state machine that evaluates conversation context in 0.8 milliseconds.',
      stages: [
        { id: 'S1', name: 'Authority Impersonation', desc: 'Claims to be Mumbai Police, CBI, Customs, TRAI' },
        { id: 'S2', name: 'Threat & Coercion', desc: 'Arrest warrant, passport cancellation, contraband found' },
        { id: 'S3', name: 'Isolation Mandate', desc: 'Do not tell family, close room door, stay on Skype video' },
        { id: 'S4', name: 'Manufactured Urgency', desc: 'Immediate supreme court order, 20 minute compliance limit' },
        { id: 'S5', name: 'Financial Diversion', desc: 'RBI verification account, RTGS clearing, liquidation of assets' },
      ],
      icon: 'radar-outline',
    },
    {
      id: 'sub-second-alerting',
      badge: 'Speed',
      title: 'Sub-Second Caregiver Dispatch',
      desc: 'The moment stage S3 (Isolation) or S4 (Urgency) is detected, Kavach dispatches an emergency push notification to registered family caregivers over Telegram with the exact scam phrase, audio transcript excerpt, and 1-tap action buttons.',
      details: [
        'Dispatched in under 650 ms end-to-end from utterance completion',
        'Includes 1-click action link: Intercom, Call Elder, or Mark False Alarm',
        'Direct cryptographic token authentication for caregiver security',
      ],
      icon: 'bell-bing-bold',
    },
    {
      id: 'cloned-voice',
      badge: 'Psychological Shield',
      title: 'Familial Voice Intervention (Consented Clone)',
      desc: 'When an elder is trapped in high psychological panic, a generic electronic siren or robot voice is often ignored or silenced. Kavach plays a loud, pre-rendered alert in the verified voice of their actual son or daughter through the tabletop speaker.',
      details: [
        'Strict DPDP liveness verification: 3-phrase random challenge during onboarding',
        'Voice embeddings can be deleted with 1-click at any time',
        'Offline pre-rendered audio clips ensure zero synthesis latency during active panic',
      ],
      icon: 'soundwave-square-bold',
    },
    {
      id: 'intercom-ptt',
      badge: 'Live Intervention',
      title: 'Caregiver Intercom (Push-to-Talk)',
      desc: 'If a caregiver receives a Level 3 alert while away from home, they can immediately hold a push-to-talk button on their phone. Their live voice broadcasts directly out of the elder’s tabletop device to break the scammer’s spell.',
      details: [
        'One-way priority audio override to tabletop tablet',
        'Instantly shatters the scammer’s illusion of secrecy and control',
        'Full acoustic audit logged for family verification',
      ],
      icon: 'microphone-large-bold',
    },
    {
      id: 'privacy-dpdp',
      badge: 'Compliance',
      title: 'Zero Raw Audio Storage & 7-Day Auto-Purge',
      desc: 'Built strictly to the requirements of the Digital Personal Data Protection Act (DPDP 2023). Kavach streams raw audio chunks in memory to the STT worker and discards them immediately upon transcription.',
      details: [
        'Raw audio is never written to disk, database, or external object storage',
        'Transcript snippets are capped at 160 characters and auto-purged after 7 days',
        'Explicit trilingual elder consent notice displayed on the device',
      ],
      icon: 'shield-check-bold',
    },
  ];

  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader currentPath="/features" />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-5xl mx-auto space-y-16">
        {/* Page Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c8f542]/30 bg-[#c8f542]/10 text-xs font-mono text-[#c8f542]">
            <StatusDot status="listening" label="" />
            <span>Architecture & Specifications</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            Engineered for High-Pressure Scam Intervention
          </h1>

          <p className="text-sm sm:text-base text-white/60 font-body leading-relaxed">
            Real scam calls use extreme psychological isolation and threats of immediate imprisonment.
            Kavach is built to operate under real-world speakerphone acoustics, delivering interventions
            in milliseconds before financial compliance occurs.
          </p>
        </div>

        {/* Latency Pipeline Card */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#c8f542] uppercase tracking-wider mb-1">
                Measured Synthetic Benchmark
              </div>
              <h2 className="text-xl font-heading font-semibold text-white/95">
                Sub-650ms End-to-End Decision Pipeline
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/60">
              <StatusDot status="armed" label="Tested on synthetic corpus" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/70 font-body">
            Because scams escalate in minutes, every millisecond counts. Kavach separates speech recognition
            from risk scoring so that state transitions occur without waiting for bulky LLM responses.
          </p>

          <div className="space-y-3 pt-2">
            {latencyMetrics.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/18 transition-all gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white/5 text-white/60 font-mono text-[11px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-heading font-medium text-white/90">{item.component}</span>
                </div>
                <div className="flex items-center gap-4 pl-9 sm:pl-0">
                  <span className="text-[11px] text-white/50 font-mono">{item.provider}</span>
                  <span className={`font-mono font-bold px-2.5 py-1 rounded-md border ${item.color} bg-white/5`}>
                    {item.latency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 6 Features Deep-Dive */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
              Six Layers of Active Defense
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
              Built from scratch around the practical reality of Indian elderly households.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => (
              <GlassCard key={feat.id} className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-white/18 bg-white/5 text-white/70">
                      {feat.badge}
                    </span>
                    <Icon name={feat.icon} size={22} color="#c8f542" />
                  </div>

                  <h3 className="text-lg font-heading font-semibold text-white/95">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
                    {feat.desc}
                  </p>

                  {feat.stages && (
                    <div className="space-y-2 pt-2">
                      {feat.stages.map((stg) => (
                        <div key={stg.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 text-xs">
                          <StageChip stage={stg.id as any} />
                          <div>
                            <div className="font-heading font-semibold text-white/90 text-[11px]">{stg.name}</div>
                            <div className="text-[11px] text-white/50">{stg.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feat.details && (
                    <ul className="space-y-1.5 pt-2">
                      {feat.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-xs text-white/60 flex items-start gap-2 font-body">
                          <span className="text-[#c8f542] mt-0.5">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center p-8 rounded-[28px] border border-[#c8f542]/30 bg-cta-gradient space-y-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
            Test Kavach in Mock Simulation
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto">
            Experience our 5-stage detector replaying synthetic digital arrest and courier extortion transcripts.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button variant="lime" size="md" href="http://localhost:8000/?mock=1&judge=1">
              Open Contest Demo Studio (Port 8000)
            </Button>
            <Button variant="ghost" size="md" href="/how-it-works">
              Read How It Works
            </Button>
          </div>
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
