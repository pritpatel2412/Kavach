'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  StageChip,
  StatusDot,
  Icon,
  KavachLogo,
  Badge,
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
    <div className="min-h-screen bg-canvas text-ink font-body">
      {/* App Header */}
      <header className="bg-surface border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="focus:outline-none">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="hidden sm:inline-block text-muted">|</span>
            <div className="flex items-center gap-2">
              <span className="text-ui font-heading font-bold text-ink">{household.name}</span>
              <span className="text-micro font-mono text-muted px-2 py-0.5 rounded-sm bg-canvas border border-hairline">
                {household.city}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline-neutral" size="sm" href="/elder" icon="devices-outline">
              Tabletop Kiosk
            </Button>
            <Button variant="outline-neutral" size="sm" href="/billing" icon="card-bold">
              Billing &amp; Usage
            </Button>
            <Button variant="outline-neutral" size="sm" href="/privacy" icon="shield-check-bold">
              Privacy Rights
            </Button>
            <Button variant="muted" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Status & Caps Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <div className="bg-surface border border-hairline rounded-md p-5 space-y-2">
            <div className="text-micro font-mono text-muted uppercase font-bold">Living Room Status</div>
            <div className="flex items-center gap-2">
              <StatusDot status="armed" label="Armed &amp; Listening" />
            </div>
            <div className="text-caption text-muted">Tabletop Tablet #1 active</div>
          </div>

          {/* Daily Credit Guard */}
          <div className="bg-surface border border-hairline rounded-md p-5 space-y-2">
            <div className="text-micro font-mono text-muted uppercase font-bold">Daily Listening Guard</div>
            <div className="flex items-baseline gap-2">
              <span className="text-heading font-heading font-bold text-ink">{household.todayMinutesUsed}m</span>
              <span className="text-caption font-mono text-muted">/ {household.todayMinutesCap}m daily cap</span>
            </div>
            <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(household.todayMinutesUsed / household.todayMinutesCap) * 100}%` }}
              />
            </div>
          </div>

          {/* Monthly Plan Quota */}
          <div className="bg-surface border border-hairline rounded-md p-5 space-y-2">
            <div className="text-micro font-mono text-muted uppercase font-bold">Monthly Cycle Quota</div>
            <div className="flex items-baseline gap-2">
              <span className="text-heading font-heading font-bold text-ink">{household.monthMinutesUsed}m</span>
              <span className="text-caption font-mono text-muted">/ {household.monthMinutesCap}m Plus tier</span>
            </div>
            <div className="text-caption text-green-strong font-mono font-bold">+30m emergency reserve safe</div>
          </div>

          {/* Familial Voice Shield */}
          <div className="bg-surface border border-hairline rounded-md p-5 space-y-2">
            <div className="text-micro font-mono text-muted uppercase font-bold">Voice Intervention</div>
            <div className="flex items-center gap-2 text-ui font-mono text-green-strong font-bold">
              <Icon name="soundwave-square-bold" size={16} />
              <span>Consented Voice Armed</span>
            </div>
            <div className="text-caption text-muted">Daughter&apos;s Voice (Pooja)</div>
          </div>
        </div>

        {/* Test Simulation Alert Banner */}
        {simulatedAlertActive && (
          <div className="p-4 rounded-md border border-hairline bg-warning-surface text-warning-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <Icon name="shield-warning-bold" size={24} className="text-warning-text shrink-0" />
              <div>
                <div className="font-heading font-bold text-ui text-ink">Simulated Level 3 Alert Dispatched!</div>
                <div className="text-caption text-warning-text">Tabletop tablet is speaking pre-rendered emergency warning audio.</div>
              </div>
            </div>
            <Button variant="primary" size="sm" href="/alerts/alt-9821">
              Open Live Intercom
            </Button>
          </div>
        )}

        {/* Navigation Tabs (Full-round pills per DESIGN.md) */}
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-ui font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-body border border-hairline hover:bg-canvas'
            }`}
          >
            Overview &amp; Household
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-1.5 rounded-full text-ui font-bold transition-all ${
              activeTab === 'alerts'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-body border border-hairline hover:bg-canvas'
            }`}
          >
            Alert Feed ({recentAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-1.5 rounded-full text-ui font-bold transition-all ${
              activeTab === 'devices'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-body border border-hairline hover:bg-canvas'
            }`}
          >
            Paired Tablet Kiosks (1)
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Recent Alert Stream */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-heading font-heading font-bold text-ink">Recent Scam Incident Stream</h2>
                <button
                  onClick={triggerTestSimulation}
                  className="text-caption font-mono text-primary hover:underline flex items-center gap-1 font-bold"
                >
                  <Icon name="play-bold" size={12} />
                  <span>Simulate Test Call</span>
                </button>
              </div>

              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-surface border border-hairline rounded-md p-6 space-y-4 hover:shadow-level-2 transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            alert.level === 3
                              ? 'bg-hot'
                              : alert.level === 2
                              ? 'bg-warm'
                              : 'bg-cold'
                          }`}
                        />
                        <h3 className="font-heading font-bold text-ink text-ui sm:text-lead">
                          {alert.type}
                        </h3>
                      </div>
                      <span className="text-caption font-mono text-muted">{alert.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-caption font-mono text-muted">Stages Detected:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {alert.stages.length > 0 ? (
                          alert.stages.map((st) => <StageChip key={st} stage={st} />)
                        ) : (
                          <span className="text-caption font-mono text-muted">None (Safe)</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-md bg-canvas border border-hairline text-ui text-body italic leading-relaxed">
                      {alert.excerpt}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-ui">
                      <div className="flex items-center gap-2 text-muted font-mono text-caption">
                        <Icon name="volume-loud-bold" size={14} className="text-primary" />
                        <span>{alert.warningPlayed}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={alert.level === 3 ? 'primary' : 'outline-neutral'}
                          size="sm"
                          href={`/alerts/${alert.id}`}
                          icon="arrow-right-linear"
                        >
                          View Timeline &amp; Intercom
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Household & Device Card */}
            <div className="space-y-6">
              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="font-heading font-bold text-ink text-ui">Protected Elder</h3>
                  <Badge variant="primary">Active</Badge>
                </div>

                <div className="space-y-3 text-ui">
                  <div>
                    <div className="text-muted uppercase font-mono text-micro font-bold">Name</div>
                    <div className="font-heading font-bold text-ink text-ui mt-0.5">{household.elder}</div>
                  </div>
                  <div>
                    <div className="text-muted uppercase font-mono text-micro font-bold">Mobile Number</div>
                    <div className="text-body font-mono mt-0.5">{household.elderPhone}</div>
                  </div>
                  <div>
                    <div className="text-muted uppercase font-mono text-micro font-bold">Speech Recognition Model</div>
                    <div className="text-body mt-0.5">{household.primaryLang}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex justify-between">
                  <a
                    href="http://localhost:3000/consent-notice"
                    target="_blank"
                    className="text-caption font-mono text-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Elder Notice Card</span>
                    <Icon name="arrow-right-up-linear" size={12} />
                  </a>
                </div>
              </div>

              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="font-heading font-bold text-ink text-ui">Tabletop Device</h3>
                  <StatusDot status="armed" label="" />
                </div>

                <div className="space-y-2.5 text-caption font-mono text-body">
                  <div className="flex justify-between">
                    <span className="text-muted">Location:</span>
                    <span className="text-ink font-bold">Living Room Table</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Heartbeat:</span>
                    <span className="text-green-strong font-bold">{household.lastHeartbeat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Power / Battery:</span>
                    <span className="text-ink">{household.deviceBattery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Wi-Fi Connection:</span>
                    <span className="text-ink">{household.wifiStrength}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline">
                  <Button variant="outline-neutral" size="sm" href="/elder" className="w-full justify-center">
                    Open Tabletop View on this device
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALERTS FEED */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-heading font-heading font-bold text-ink">Full Incident History</h2>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="bg-surface border border-hairline rounded-md p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <StageChip stage={alert.stages[alert.stages.length - 1] || 'S1'} />
                      <h3 className="font-heading font-bold text-ink text-lead">{alert.type}</h3>
                    </div>
                    <span className="text-caption font-mono text-muted">{alert.timestamp}</span>
                  </div>
                  <p className="text-ui text-body italic bg-canvas border border-hairline rounded-md p-3">{alert.excerpt}</p>
                  <div className="pt-2 flex justify-end">
                    <Button variant="outline-neutral" size="sm" href={`/alerts/${alert.id}`}>
                      Inspect Full Utterance Timeline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICES */}
        {activeTab === 'devices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-heading font-heading font-bold text-ink">Paired Tabletop Kiosks</h2>
              <Button variant="primary" size="sm" href="/onboarding">
                Pair Additional Tablet
              </Button>
            </div>

            <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center text-primary">
                    <Icon name="devices-outline" size={20} />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-ink text-ui">{household.device}</div>
                    <div className="text-caption text-muted font-mono">Paired code: KAV-7892</div>
                  </div>
                </div>
                <StatusDot status="armed" label="Online" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-caption font-mono">
                <div>
                  <div className="text-muted">Status</div>
                  <div className="text-ink font-bold">Armed (Speakerphone)</div>
                </div>
                <div>
                  <div className="text-muted">Silence Gating</div>
                  <div className="text-green-strong font-bold">Active (0 credit silence)</div>
                </div>
                <div>
                  <div className="text-muted">Heartbeat</div>
                  <div className="text-green-strong font-bold">Live &lt; 5s</div>
                </div>
                <div>
                  <div className="text-muted">Audio Worklet</div>
                  <div className="text-ink">16 kHz PCM PCM16</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

