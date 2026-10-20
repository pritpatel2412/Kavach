'use client';

import React from 'react';
import {
  Button,
  StageChip,
  StatusDot,
  Icon,
  Badge,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function FeaturesPage() {
  const latencyMetrics = [
    { component: 'Acoustic Room Capture (16 kHz PCM)', latency: '16 ms buffer', provider: 'Client AudioWorklet', color: 'text-body' },
    { component: 'Real-time Streaming STT (Hinglish/Hindi/Eng)', latency: '220 ms avg', provider: 'Gnani Prisma Engine', color: 'text-primary' },
    { component: 'Deterministic 5-Stage Risk Scorer', latency: '0.8 ms', provider: 'Kavach Pure Python Scorer', color: 'text-primary' },
    { component: 'Voice Synthesis & Prerender Alert (L2/L3)', latency: '340 ms', provider: 'Gnani Timbre / Prerendered Cache', color: 'text-warm' },
    { component: 'Caregiver Push Dispatch (Telegram Bot API)', latency: '410 ms', provider: 'Telegram / Webhook Delivery', color: 'text-cold' },
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
        'One-tap remote drop button breaks elder call immediately',
        'Signed HMAC-SHA256 webhook URLs prevent unauthorized actions',
        'Direct Push-to-Talk audio channel to the tabletop speaker',
      ],
      icon: 'bell-bing-bold',
    },
    {
      id: 'familial-voice',
      badge: 'Intervention',
      title: 'Consented Familial Voice Intervention',
      desc: 'Elders trapped in acute fear trance frequently disregard generic robotic alarms. Kavach synthesizes immediate emergency alerts in their son or daughter’s authentic voice, requiring verified affirmative consent and random liveness phrase verification before enrollment.',
      details: [
        'Gnani Timbre voice cloning from a 30-second clean reading sample',
        'Fallback to pre-rendered authoritative Hindi/English alerts if offline',
        'Zero retention: embeddings can be deleted permanently with one click',
      ],
      icon: 'volume-loud-bold',
    },
    {
      id: 'indic-speech',
      badge: 'Language',
      title: 'Multilingual Indic Speech Recognition',
      desc: 'Scammers switch fluidly between formal official Hindi, aggressive English legal jargon, and regional languages. Kavach leverages Gnani Prisma models optimized specifically for Indian accents and code-switching.',
      details: [
        'Full support for Hindi, Gujarati, Hinglish, and Indian English',
        'Handles degraded 8 kHz telephone speaker acoustics and room reverberation',
        'Pre-compiled scam vocabulary dictionary with 100+ high-confidence triggers',
      ],
      icon: 'chat-round-line-bold',
    },
    {
      id: 'privacy-first',
      badge: 'DPDP Act',
      title: 'Privacy-First Ephemeral Processing',
      desc: 'Kavach protects family elders without compromising home privacy. All processing follows strict zero-surveillance design principles aligned with India’s Digital Personal Data Protection (DPDP) Act 2023.',
      details: [
        'No raw telephone audio is ever stored on disk or transferred to third parties',
        'Transcript excerpts capped at 160 characters for forensic evidence only',
        'Strict 7-day auto-purge policy for all incident metadata and transcripts',
      ],
      icon: 'shield-check-bold',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/features" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Page Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            <StatusDot status="listening" label="" />
            <span>Architecture & Specifications</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Engineered for High-Pressure Scam Intervention
          </h1>

          <p className="text-lead text-body font-medium leading-relaxed">
            Real scam calls use extreme psychological isolation and threats of immediate imprisonment.
            Kavach is built to operate under real-world speakerphone acoustics, delivering interventions
            in milliseconds before financial compliance occurs.
          </p>
        </div>

        {/* Latency Pipeline Card */}
        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-hairline">
            <div>
              <div className="text-caption font-bold text-primary uppercase tracking-wider mb-1">
                Measured Synthetic Benchmark
              </div>
              <h2 className="text-heading font-bold text-ink">
                Sub-650ms End-to-End Decision Pipeline
              </h2>
            </div>
            <div className="flex items-center gap-2 text-caption text-body">
              <StatusDot status="armed" label="Tested on synthetic corpus" />
            </div>
          </div>

          <p className="text-body font-medium text-body">
            Because scams escalate in minutes, every millisecond counts. Kavach separates speech recognition
            from risk scoring so that state transitions occur without waiting for bulky LLM responses.
          </p>

          <div className="space-y-2.5 pt-2">
            {latencyMetrics.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-canvas border border-hairline hover:bg-surface transition-colors gap-2 text-caption font-sans"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-surface border border-hairline text-ink font-mono text-micro flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-ink">{item.component}</span>
                </div>
                <div className="flex items-center gap-4 pl-9 sm:pl-0">
                  <span className="text-muted font-mono">{item.provider}</span>
                  <span className={`font-mono font-bold px-2.5 py-0.5 rounded-sm border border-hairline bg-surface ${item.color}`}>
                    {item.latency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Features Deep-Dive */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-heading-lg font-bold text-ink">
              Six Layers of Active Defense
            </h2>
            <p className="text-caption text-body max-w-xl mx-auto">
              Built from scratch around the practical reality of Indian elderly households.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat) => (
              <div key={feat.id} className="bg-surface border border-hairline rounded-md p-6 flex flex-col justify-between space-y-4 hover:shadow-level-2 transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="filled">{feat.badge}</Badge>
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon={`solar:${feat.icon}`} width="22" height="22" class="text-primary" />
                  </div>

                  <h3 className="text-heading font-bold text-ink">
                    {feat.title}
                  </h3>

                  <p className="text-caption font-medium text-body leading-relaxed">
                    {feat.desc}
                  </p>

                  {feat.stages && (
                    <div className="space-y-2 pt-2">
                      {feat.stages.map((stg) => (
                        <div key={stg.id} className="flex items-start gap-2.5 p-2 rounded-md bg-canvas border border-hairline text-caption">
                          <StageChip stage={stg.id as any} />
                          <div>
                            <div className="font-bold text-ink text-micro">{stg.name}</div>
                            <div className="text-micro text-body">{stg.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feat.details && (
                    <ul className="space-y-1.5 pt-2">
                      {feat.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-caption text-body flex items-start gap-2 font-medium">
                          <span className="text-primary font-bold">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center p-8 rounded-md border border-hairline bg-surface space-y-4 shadow-sm">
          <h2 className="text-heading-lg font-bold text-ink">
            Test Kavach in Mock Simulation
          </h2>
          <p className="text-body font-medium text-body max-w-lg mx-auto">
            Experience our 5-stage detector replaying synthetic digital arrest and courier extortion transcripts.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" href="http://localhost:8000/?mock=1&judge=1">
              Open Contest Demo Studio (Port 8000)
            </Button>
            <Button variant="outline-neutral" size="lg" href="/how-it-works">
              Read How It Works
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
