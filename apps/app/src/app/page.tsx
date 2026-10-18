'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Frame,
  HatchOverlay,
  AuroraCanvas,
  GlassCard,
  Button,
  StageChip,
  RiskMeter,
  StatusDot,
  Icon,
  KavachLogo,
} from '@kavach/ui';

export default function GuardianDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'devices'>('overview');
  const [simulatedAlertActive, setSimulatedAlertActive] = useState(false);

  const household = {
    name: 'Iyer Residence',
    city: 'Pune, Maharashtra',
    plan: 'Kavach Plus (₹149/mo)',
    elder: 'Mrs. Kamala Iyer',
    elderPhone: '+91 98230 11223',
    primaryLang: 'Hindi & Indian English',
    device: 'Living Room Tablet #1',
    deviceBattery: '100% (Plugged in)',
    wifiStrength: '94% Excellent',
    lastHeartbeat: '3 seconds ago',
    todayMinutesUsed: 12,
    todayMinutesCap: 30,
    monthMinutesUsed: 74,
    monthMinutesCap: 300,
  };

  const recentAlerts = [
    {
      id: 'alt-9821',
      timestamp: 'Today, 10:14 AM',
      type: 'Digital Arrest Impersonation',
      riskScore: 92,
      level: 3,
      stages: ['S1', 'S2', 'S3', 'S4'] as const,
      excerpt: '“Aapke naam par Mumbai Police aur CBI ka non-bailable warrant hai. Kisi ko mat batana, darwaza band rakho...”',
      warningPlayed: 'Familial Voice Alert (Daughter’s Voice)',
      telegramSent: true,
      resolved: false,
    },
    {
      id: 'alt-8412',
      timestamp: 'Yesterday, 4:32 PM',
      type: 'FedEx Customs Narcotics Threat',
      riskScore: 68,
      level: 2,
      stages: ['S1', 'S2'] as const,
      excerpt: '“Your parcel to Taiwan with 5 expired passports and MDMA has been confiscated by customs...”',
      warningPlayed: 'Standard Audio Caution',
      telegramSent: true,
      resolved: true,
    },
    {
      id: 'alt-7390',
      timestamp: '15 Oct 2026, 11:05 AM',
      type: 'Benign Call: Apollo Pharmacy Delivery',
      riskScore: 8,
      level: 1,
      stages: [] as const,
      excerpt: '“Namaste madam, aapki BP ki dawai deliver ho gayi hai. OTP bata dijiye...”',
      warningPlayed: 'None (Benign Filtered)',
      telegramSent: false,
      resolved: true,
    },
  ];

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kavach_guardian_token');
    }
    router.push('/auth');
  };

  const triggerTestSimulation = () => {
    setSimulatedAlertActive(true);
    setTimeout(() => {
      setSimulatedAlertActive(false);
    }, 4000);
  };

  return (
    <Frame withHatch={false} className="pb-16 min-h-screen">
      <AuroraCanvas />
      <HatchOverlay />

      {/* App Header */}
      <header className="relative z-20 px-6 py-4 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <a href="/" className="focus:outline-none">
            <KavachLogo size={32} showWordmark={true} />
          </a>
          <span className="hidden sm:inline-block text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-bold text-white/95">{household.name}</span>
            <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {household.city}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" href="/elder" icon="devices-outline">
            Open Tabletop Kiosk
          </Button>
          <Button variant="ghost" size="sm" href="/billing" icon="card-bold">
            Billing &amp; Usage
          </Button>
          <Button variant="ghost" size="sm" href="/privacy" icon="shield-check-bold">
            Privacy Rights
          </Button>
          <button
            onClick={handleSignOut}
            className="text-xs font-mono text-white/50 hover:text-white transition-colors px-2 py-1"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-8 max-w-6xl mx-auto space-y-8">
        {/* Top Status & Caps Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <GlassCard className="p-5 space-y-2">
            <div className="text-[11px] font-mono text-white/50 uppercase">Living Room Status</div>
            <div className="flex items-center gap-2">
              <StatusDot status="armed" label="Armed &amp; Listening" />
            </div>
            <div className="text-[11px] text-white/50 font-body">Tabletop Tablet #1 active</div>
          </GlassCard>

          {/* Daily Credit Guard */}
          <GlassCard className="p-5 space-y-2">
            <div className="text-[11px] font-mono text-white/50 uppercase">Daily Listening Guard</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white">{household.todayMinutesUsed}m</span>
              <span className="text-xs font-mono text-white/50">/ {household.todayMinutesCap}m daily cap</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#c8f542] h-full rounded-full"
                style={{ width: `${(household.todayMinutesUsed / household.todayMinutesCap) * 100}%` }}
              />
            </div>
          </GlassCard>

          {/* Monthly Plan Quota */}
          <GlassCard className="p-5 space-y-2">
            <div className="text-[11px] font-mono text-white/50 uppercase">Monthly Cycle Quota</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white">{household.monthMinutesUsed}m</span>
              <span className="text-xs font-mono text-white/50">/ {household.monthMinutesCap}m Plus tier</span>
            </div>
            <div className="text-[11px] text-[#c8f542] font-mono">+30m emergency reserve safe</div>
          </GlassCard>

          {/* Familial Voice Shield */}
          <GlassCard className="p-5 space-y-2 border-[#c8f542]/30">
            <div className="text-[11px] font-mono text-white/50 uppercase">Voice Intervention</div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#c8f542] font-bold">
              <Icon name="soundwave-square-bold" size={16} />
              <span>Consented Voice Armed</span>
            </div>
            <div className="text-[11px] text-white/60">Daughter&apos;s Voice (Pooja)</div>
          </GlassCard>
        </div>

        {/* Test Simulation Alert Banner */}
        {simulatedAlertActive && (
          <div className="p-4 rounded-2xl border-2 border-[#ff5a4d] bg-[#ff5a4d]/20 text-white flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <Icon name="shield-warning-bold" size={24} color="#ff5a4d" />
              <div>
                <div className="font-heading font-bold text-sm">Simulated Level 3 Alert Dispatched!</div>
                <div className="text-xs text-white/80">Tabletop tablet is speaking pre-rendered emergency warning audio.</div>
              </div>
            </div>
            <Button variant="lime" size="sm" href="/alerts/alt-9821">
              Open Live Intercom
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#c8f542] text-stone-950 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Overview &amp; Household
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              activeTab === 'alerts'
                ? 'bg-[#c8f542] text-stone-950 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Alert Feed ({recentAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              activeTab === 'devices'
                ? 'bg-[#c8f542] text-stone-950 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Paired Tablet Kiosks (1)
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Alert Stream */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-white">Recent Scam Incident Stream</h2>
                <button
                  onClick={triggerTestSimulation}
                  className="text-xs font-mono text-[#c8f542] hover:underline flex items-center gap-1"
                >
                  <Icon name="play-bold" size={12} />
                  <span>Simulate Test Call</span>
                </button>
              </div>

              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <GlassCard
                    key={alert.id}
                    className={`p-6 space-y-4 ${
                      alert.level === 3 ? 'border-[#ff5a4d]/40' : alert.level === 2 ? 'border-amber-400/40' : 'border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            alert.level === 3
                              ? 'bg-[#ff5a4d] shadow-sm shadow-[#ff5a4d]'
                              : alert.level === 2
                              ? 'bg-amber-400'
                              : 'bg-white/30'
                          }`}
                        />
                        <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                          {alert.type}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-white/40">{alert.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/50">Stages Detected:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {alert.stages.length > 0 ? (
                          alert.stages.map((st) => <StageChip key={st} stage={st} />)
                        ) : (
                          <span className="text-xs font-mono text-white/40">None (Safe)</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 font-body italic leading-relaxed">
                      {alert.excerpt}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-2 text-white/60 font-mono text-[11px]">
                        <Icon name="volume-loud-bold" size={14} color="#c8f542" />
                        <span>{alert.warningPlayed}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={alert.level === 3 ? 'lime' : 'ghost'}
                          size="sm"
                          href={`/alerts/${alert.id}`}
                          icon="arrow-right-linear"
                        >
                          View Timeline &amp; Intercom
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Right Col: Household & Device Card */}
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-heading font-bold text-white text-sm">Protected Elder</h3>
                  <span className="text-[11px] font-mono text-[#c8f542]">Active</span>
                </div>

                <div className="space-y-3 text-xs font-body">
                  <div>
                    <div className="text-white/40 uppercase font-mono text-[10px]">Name</div>
                    <div className="font-heading font-semibold text-white text-sm">{household.elder}</div>
                  </div>
                  <div>
                    <div className="text-white/40 uppercase font-mono text-[10px]">Mobile Number</div>
                    <div className="text-white/80 font-mono">{household.elderPhone}</div>
                  </div>
                  <div>
                    <div className="text-white/40 uppercase font-mono text-[10px]">Speech Recognition Model</div>
                    <div className="text-white/80">{household.primaryLang}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between">
                  <a
                    href="http://localhost:3000/consent-notice"
                    target="_blank"
                    className="text-[11px] font-mono text-[#c8f542] hover:underline flex items-center gap-1"
                  >
                    <span>Elder Notice Card</span>
                    <Icon name="arrow-right-up-linear" size={12} />
                  </a>
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-heading font-bold text-white text-sm">Tabletop Device</h3>
                  <StatusDot status="armed" label="" />
                </div>

                <div className="space-y-2.5 text-xs font-mono text-white/70">
                  <div className="flex justify-between">
                    <span className="text-white/40">Location:</span>
                    <span className="text-white/90">Living Room Table</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Heartbeat:</span>
                    <span className="text-emerald-300">{household.lastHeartbeat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Power / Battery:</span>
                    <span className="text-white/90">{household.deviceBattery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Wi-Fi Connection:</span>
                    <span className="text-white/90">{household.wifiStrength}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <Button variant="ghost" size="sm" href="/elder" className="w-full justify-center text-xs">
                    Open Tabletop View on this device
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* TAB 2: ALERTS FEED */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-lg font-heading font-bold text-white">Full Incident History</h2>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <GlassCard key={alert.id} className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <StageChip stage={alert.stages[alert.stages.length - 1] || 'S1'} />
                      <h3 className="font-heading font-bold text-white text-base">{alert.type}</h3>
                    </div>
                    <span className="text-xs font-mono text-white/40">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-white/80 font-body italic">{alert.excerpt}</p>
                  <div className="pt-2 flex justify-end">
                    <Button variant="ghost" size="sm" href={`/alerts/${alert.id}`}>
                      Inspect Full Utterance Timeline
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICES */}
        {activeTab === 'devices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-white">Paired Tabletop Kiosks</h2>
              <Button variant="lime" size="sm" href="/onboarding">
                Pair Additional Tablet
              </Button>
            </div>

            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c8f542]">
                    <Icon name="devices-outline" size={20} />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-white text-sm">{household.device}</div>
                    <div className="text-xs text-white/50">Paired code: KAV-7892</div>
                  </div>
                </div>
                <StatusDot status="armed" label="Online" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-white/40">Status</div>
                  <div className="text-white/90">Armed (Speakerphone)</div>
                </div>
                <div>
                  <div className="text-white/40">Silence Gating</div>
                  <div className="text-[#c8f542]">Active (0 credit silence)</div>
                </div>
                <div>
                  <div className="text-white/40">Heartbeat</div>
                  <div className="text-emerald-300">Live &lt; 5s</div>
                </div>
                <div>
                  <div className="text-white/40">Audio Worklet</div>
                  <div className="text-white/90">16 kHz PCM PCM16</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </Frame>
  );
}
