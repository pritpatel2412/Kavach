'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  PillTabs,
  RiskIndicator,
  StageChips,
  Badge,
  Drawer,
  KavachLogo,
} from '@kavach/ui';
import { BRAND } from '@kavach/api-contract';
import { MockBanner } from '../components/MockBanner';

export default function GuardianDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIncident, setSelectedIncident] = useState<{
    id: string;
    timestamp: string;
    type: string;
    level: 'L0' | 'L1' | 'L2' | 'L3';
    stages: ('S1' | 'S2' | 'S3' | 'S4' | 'S5')[];
    excerpt: string;
    warningPlayed: string;
    telegramSent: boolean;
  } | null>(null);

  const household = {
    name: 'Iyer Residence',
    city: 'Pune, Maharashtra',
    plan: 'Kavach Plus (₹149/mo)',
    elderDisplayName: 'Kamala-ji (Living Room Tablet)',
    elderPhone: '+91 98230 11223',
    primaryLang: 'Hindi & Indian English',
    device: 'Living Room Tablet #1',
    deviceBattery: '100% (Plugged in)',
    wifiStrength: '94% Excellent',
    lastHeartbeat: '3 seconds ago',
    todayMinutesUsed: 12,
    todayMinutesCap: 30,
    monthMinutesUsed: 74,
    monthMinutesCap: 150, // Canonical Plus limit (reconciled from 300)
    emergencyReserve: 30,
  };

  const recentAlerts = [
    {
      id: 'alt-9821',
      timestamp: 'Today, 10:14 AM',
      type: 'Digital Arrest Impersonation',
      level: 'L2' as const,
      stages: ['S1', 'S2', 'S3', 'S4'] as ('S1' | 'S2' | 'S3' | 'S4' | 'S5')[],
      excerpt:
        '“Aapke naam par Mumbai Police aur CBI ka non-bailable warrant hai. Kisi ko mat batana, darwaza band rakho aur video call par raho...”',
      warningPlayed: 'Familial Voice Alert (Daughter’s Voice)',
      telegramSent: true,
      resolved: false,
    },
    {
      id: 'alt-8412',
      timestamp: 'Yesterday, 4:32 PM',
      type: 'FedEx Customs Narcotics Threat',
      level: 'L1' as const,
      stages: ['S1', 'S2'] as ('S1' | 'S2' | 'S3' | 'S4' | 'S5')[],
      excerpt:
        '“Your parcel to Taiwan with 5 expired passports and MDMA has been confiscated by customs...”',
      warningPlayed: 'Standard Audio Caution',
      telegramSent: true,
      resolved: true,
    },
    {
      id: 'alt-7390',
      timestamp: '15 Oct 2026, 11:05 AM',
      type: 'Benign Call: Pharmacy Delivery',
      level: 'L0' as const,
      stages: [] as ('S1' | 'S2' | 'S3' | 'S4' | 'S5')[],
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

  const navTabs = [
    { id: 'overview', label: 'Overview & Household' },
    { id: 'alerts', label: 'Alert Feed', count: recentAlerts.length },
    { id: 'devices', label: 'Paired Tablet Kiosks', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      {/* 1. Neutral Demo Mode / Environment Strip */}
      <MockBanner />

      {/* 2. Guardian App Header */}
      <header className="bg-surface border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 sticky top-8 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="focus:outline-none">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="hidden sm:inline-block text-muted">/</span>
            <div className="flex items-center gap-2">
              <span className="text-ui font-bold text-ink">{household.name}</span>
              <span className="text-caption text-muted px-2 py-0.5 rounded-full bg-canvas border border-hairline">
                {household.city}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline-neutral" size="sm" href="/elder">
              Tabletop Kiosk
            </Button>
            <Button variant="outline-neutral" size="sm" href="/billing">
              Billing &amp; Usage
            </Button>
            <Button variant="outline-neutral" size="sm" href="/privacy">
              Privacy Rights
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Top 4 Calm Status Cards Max */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Living Room Status */}
          <Card padding="md" className="space-y-2">
            <div className="text-caption font-bold text-muted uppercase tracking-wider">
              Living Room Status
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-heading font-bold text-ink">Active &amp; Armed</span>
            </div>
            <div className="text-caption text-muted">Tabletop Tablet #1 listening</div>
          </Card>

          {/* Card 2: Daily Listening Guard */}
          <Card padding="md" className="space-y-2">
            <div className="text-caption font-bold text-muted uppercase tracking-wider">
              Daily Listening Guard
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-heading font-bold text-ink" style={{ fontFeatureSettings: '"tnum"' }}>
                {household.todayMinutesUsed}m
              </span>
              <span className="text-caption text-muted">/ {household.todayMinutesCap}m daily cap</span>
            </div>
            <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(household.todayMinutesUsed / household.todayMinutesCap) * 100}%` }}
              />
            </div>
          </Card>

          {/* Card 3: Monthly Cycle Quota */}
          <Card padding="md" className="space-y-2">
            <div className="text-caption font-bold text-muted uppercase tracking-wider">
              Monthly Cycle Quota
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-heading font-bold text-ink" style={{ fontFeatureSettings: '"tnum"' }}>
                {household.monthMinutesUsed}m
              </span>
              <span className="text-caption text-muted">/ {household.monthMinutesCap}m Plus tier</span>
            </div>
            <div className="text-caption text-green-strong font-bold">
              +{household.emergencyReserve}m emergency reserve safe
            </div>
          </Card>

          {/* Card 4: Voice Intervention */}
          <Card padding="md" className="space-y-2">
            <div className="text-caption font-bold text-muted uppercase tracking-wider">
              Voice Intervention
            </div>
            <div className="flex items-center gap-1.5 text-ui font-bold text-premium">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:soundwave-bold" width="16" height="16" />
              <span>Consented Voice Armed</span>
            </div>
            <div className="text-caption text-muted">Daughter&apos;s Voice (Pooja)</div>
          </Card>
        </div>

        {/* PillTabs Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-3">
          <PillTabs
            tabs={navTabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />

          <Button
            variant="primary"
            size="sm"
            href="/onboarding"
            icon="add-circle-bold"
          >
            Pair Elder Tablet
          </Button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Incident Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-heading font-bold text-ink">Recent Scam Incident Stream</h2>
                <span className="text-caption text-muted font-medium">Sample data · Replay active</span>
              </div>

              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <Card key={alert.id} padding="lg" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                      <div className="flex items-center gap-3">
                        <RiskIndicator level={alert.level} size="sm" />
                        <h3 className="font-bold text-ink text-ui sm:text-heading">
                          {alert.type}
                        </h3>
                      </div>
                      <span className="text-caption text-muted font-medium">{alert.timestamp}</span>
                    </div>

                    {alert.stages.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-caption font-bold text-body">Stages Detected:</span>
                        <StageChips stages={alert.stages} />
                      </div>
                    )}

                    <div className="p-3.5 rounded-md bg-canvas border border-hairline text-caption text-body italic leading-relaxed">
                      {alert.excerpt}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-caption text-body">
                        {/* @ts-expect-error solar icon */}
                        <iconify-icon icon="solar:volume-loud-bold" width="16" height="16" className="text-primary" />
                        <span>{alert.warningPlayed}</span>
                      </div>

                      <Button
                        variant="outline-neutral"
                        size="sm"
                        onClick={() => setSelectedIncident(alert)}
                        icon="sidebar-minimalistic-linear"
                      >
                        Inspect Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Rail: Protected Elder & Tabletop Device */}
            <div className="space-y-6">
              <Card padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="font-bold text-ink text-ui">Protected Elder</h3>
                  <Badge variant="primary">Active</Badge>
                </div>

                <div className="space-y-3 text-caption">
                  <div>
                    <div className="text-muted font-bold uppercase tracking-wider text-micro">Moniker</div>
                    <div className="font-bold text-ink text-ui mt-0.5">{household.elderDisplayName}</div>
                  </div>
                  <div>
                    <div className="text-muted font-bold uppercase tracking-wider text-micro">Emergency Phone</div>
                    <div className="text-body mt-0.5 font-medium">{household.elderPhone}</div>
                  </div>
                  <div>
                    <div className="text-muted font-bold uppercase tracking-wider text-micro">ASR Language Model</div>
                    <div className="text-body mt-0.5 font-medium">{household.primaryLang}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline">
                  <a
                    href={`${BRAND.siteUrl}/consent-notice`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-caption text-primary hover:underline font-bold flex items-center justify-between"
                  >
                    <span>View Elder Consent Version (2026-10-v1)</span>
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:arrow-right-up-linear" width="14" height="14" />
                  </a>
                </div>
              </Card>

              <Card padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="font-bold text-ink text-ui">Tabletop Device</h3>
                  <Badge variant="calm">Online</Badge>
                </div>

                <div className="space-y-2 text-caption text-body">
                  <div className="flex justify-between">
                    <span className="text-muted">Placement:</span>
                    <span className="text-ink font-bold">Living Room Table</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Heartbeat:</span>
                    <span className="text-green-strong font-bold">{household.lastHeartbeat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Battery:</span>
                    <span className="text-ink">{household.deviceBattery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Wi-Fi:</span>
                    <span className="text-ink">{household.wifiStrength}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline">
                  <Button variant="outline-neutral" size="sm" href="/elder" className="w-full">
                    Launch Tablet View
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: ALERTS FEED */}
        {activeTab === 'alerts' && (
          <div className="space-y-4 max-w-4xl">
            <h2 className="text-heading font-bold text-ink">Incident Audit Ledger</h2>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <Card key={alert.id} padding="lg" className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-2">
                    <div className="flex items-center gap-3">
                      <RiskIndicator level={alert.level} size="sm" />
                      <h3 className="font-bold text-ink text-ui">{alert.type}</h3>
                    </div>
                    <span className="text-caption text-muted">{alert.timestamp}</span>
                  </div>
                  <p className="text-caption text-body italic bg-canvas border border-hairline rounded-md p-3">
                    {alert.excerpt}
                  </p>
                  <div className="flex justify-end pt-1">
                    <Button
                      variant="outline-neutral"
                      size="sm"
                      onClick={() => setSelectedIncident(alert)}
                    >
                      Inspect Timeline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICES */}
        {activeTab === 'devices' && (
          <div className="space-y-4 max-w-4xl">
            <Card padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-canvas border border-hairline flex items-center justify-center text-primary">
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:devices-bold" width="20" height="20" />
                  </div>
                  <div>
                    <div className="font-bold text-ink text-ui">{household.device}</div>
                    <div className="text-caption text-muted">Pairing code: <span className="font-mono font-bold text-ink">KAV-7892</span></div>
                  </div>
                </div>
                <Badge variant="calm">Online</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-caption">
                <div>
                  <div className="text-muted font-bold uppercase text-micro">Acoustic Mode</div>
                  <div className="text-ink font-bold mt-0.5">Speakerphone</div>
                </div>
                <div>
                  <div className="text-muted font-bold uppercase text-micro">Voice Activity Gating</div>
                  <div className="text-green-strong font-bold mt-0.5">Active</div>
                </div>
                <div>
                  <div className="text-muted font-bold uppercase text-micro">Heartbeat Status</div>
                  <div className="text-green-strong font-bold mt-0.5">&lt; 5s Live</div>
                </div>
                <div>
                  <div className="text-muted font-bold uppercase text-micro">Audio Worklet</div>
                  <div className="text-ink mt-0.5 font-bold">16 kHz PCM16</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* 4. Progressive Disclosure Drawer for Incident Details & Intercom */}
      <Drawer
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident ? selectedIncident.type : 'Incident Details'}
        description={selectedIncident ? `Flagged at ${selectedIncident.timestamp} · Sample data` : undefined}
      >
        {selectedIncident && (
          <div className="space-y-6 text-caption">
            <div className="space-y-2">
              <div className="text-micro font-bold uppercase tracking-wider text-muted">Risk Assessment</div>
              <RiskIndicator level={selectedIncident.level} size="lg" />
            </div>

            {selectedIncident.stages.length > 0 && (
              <div className="space-y-2">
                <div className="text-micro font-bold uppercase tracking-wider text-muted">Extortion Progression Stages</div>
                <StageChips stages={selectedIncident.stages} />
              </div>
            )}

            <div className="space-y-2">
              <div className="text-micro font-bold uppercase tracking-wider text-muted">Transcript Excerpt (&le; 160 characters)</div>
              <div className="p-4 rounded-md bg-canvas border border-hairline text-body italic leading-relaxed">
                {selectedIncident.excerpt}
              </div>
              <span className="text-micro text-muted">Auto-deleted after 7 days in accordance with data minimization.</span>
            </div>

            <div className="space-y-2">
              <div className="text-micro font-bold uppercase tracking-wider text-muted">Voice Intervention Played</div>
              <div className="p-3 bg-green-surface rounded-md border border-primary/20 text-green-strong font-bold flex items-center gap-2">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:soundwave-bold" width="18" height="18" />
                <span>{selectedIncident.warningPlayed}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline space-y-3">
              <Button
                variant="primary"
                size="md"
                href={`/alerts/${selectedIncident.id}`}
                className="w-full"
              >
                Open Push-to-Talk Intercom
              </Button>
              <Button
                variant="outline-neutral"
                size="md"
                onClick={() => setSelectedIncident(null)}
                className="w-full"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
