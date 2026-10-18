'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  StatusDot,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function StatusPage() {
  const subsystems = [
    { name: 'Gnani Prisma Streaming STT Gateway (India Central)', status: 'operational', uptime: '99.99%', latency: '218 ms' },
    { name: 'Kavach 5-Stage Psychological Rule Engine', status: 'operational', uptime: '100.0%', latency: '0.8 ms' },
    { name: 'Gnani Timbre Familial Voice Synthesis', status: 'operational', uptime: '99.95%', latency: '342 ms' },
    { name: 'Telegram Caregiver Webhook Dispatch', status: 'operational', uptime: '99.98%', latency: '412 ms' },
    { name: 'Guardian API & Authentication Service', status: 'operational', uptime: '100.0%', latency: '14 ms' },
    { name: 'Tabletop Tablet Sync & Heartbeat WebSocket', status: 'operational', uptime: '99.97%', latency: '32 ms' },
  ];

  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-300">
            <StatusDot status="armed" label="" />
            <span>All Core Pipeline Systems Operational</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            System &amp; Pipeline Status
          </h1>

          <p className="text-sm text-white/60 font-body">
            Real-time telemetry and uptime monitors for Kavach streaming ingestion, detection engines, and alert dispatchers.
          </p>
        </div>

        {/* Global Uptime Card */}
        <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-emerald-500/30">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-emerald-300 font-bold">
              30-Day Pipeline Reliability
            </div>
            <div className="text-3xl sm:text-4xl font-heading font-bold text-white">
              99.98%
            </div>
            <div className="text-xs text-white/50">
              Measured across simulated continuous stream testbed (0 unhandled dropped frames)
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
            <Icon name="check-circle-bold" size={16} />
            <span>Zero Service Degradation</span>
          </div>
        </GlassCard>

        {/* Subsystems List */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-white/95">Component Health</h2>

          <div className="space-y-3">
            {subsystems.map((sub, idx) => (
              <GlassCard
                key={idx}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  <span className="font-heading font-semibold text-white/90">{sub.name}</span>
                </div>

                <div className="flex items-center gap-4 pl-5 sm:pl-0 font-mono text-[11px]">
                  <span className="text-white/40">Latency: <strong className="text-white/80">{sub.latency}</strong></span>
                  <span className="text-white/40">Uptime: <strong className="text-emerald-300">{sub.uptime}</strong></span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-white/95">Past Incident Reports</h2>

          <GlassCard className="p-6 text-center space-y-2 text-xs text-white/60">
            <Icon name="shield-check-bold" size={24} color="#c8f542" className="mx-auto" />
            <div className="font-heading font-semibold text-white/80">No System Incidents Reported in Last 90 Days</div>
            <div className="text-[11px] text-white/40">All simulated pipeline disruptions resolved within automated self-healing restart loops.</div>
          </GlassCard>
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
