'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  PillTabs,
  RiskIndicator,
  StageChips,
  Badge,
  Drawer,
  Modal,
  KavachLogo,
} from '@kavach/ui';
import { BRAND } from '@kavach/api-contract';

export default function GuardianDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [guardian, setGuardian] = useState<{ id: string; name: string; email?: string } | null>(null);
  const [eldersList, setEldersList] = useState<any[]>([]);
  const [devicesList, setDevicesList] = useState<any[]>([]);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState({
    todayMinutesUsed: 0,
    todayMinutesCap: 30,
    monthMinutesUsed: 0,
    monthMinutesCap: 150,
    emergencyReserve: 30,
  });

  // Device Pairing State
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [selectedElderForPair, setSelectedElderForPair] = useState<string>('');
  const [generatedPairingCode, setGeneratedPairingCode] = useState<string>('');
  const [pairingCodeLoading, setPairingCodeLoading] = useState(false);
  const [pairingSuccessDetected, setPairingSuccessDetected] = useState<string | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const isDemoParam = urlParams.get('demo') === '1' || urlParams.get('sandbox') === '1' || urlParams.get('mock') === '1';
    const demoToken = urlParams.get('demo_token') || urlParams.get('token');

    const initAuth = async () => {
      let token = localStorage.getItem('kavach_guardian_token');

      if (!token && (isDemoParam || demoToken)) {
        try {
          const demoRes = await fetch('/api/auth/guardian/demo-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (demoRes.ok) {
            const demoData = await demoRes.json();
            token = demoData.session_id;
            localStorage.setItem('kavach_guardian_token', demoData.session_id);
            if (demoData.guardian?.id) localStorage.setItem('kavach_guardian_id', demoData.guardian.id);
            if (demoData.guardian?.email) localStorage.setItem('kavach_guardian_email', demoData.guardian.email);
            if (demoData.guardian?.name) localStorage.setItem('kavach_guardian_name', demoData.guardian.name);
          }
        } catch {}
      }

      if (!token) {
        router.push('/auth');
        return;
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      fetch('/api/auth/guardian/me', { headers })
        .then(async (res) => {
          if (!res.ok) {
            if (isDemoParam) {
              try {
                const demoRes = await fetch('/api/auth/guardian/demo-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                });
                if (demoRes.ok) {
                  const demoData = await demoRes.json();
                  localStorage.setItem('kavach_guardian_token', demoData.session_id);
                  window.location.reload();
                  return;
                }
              } catch {}
            }
            // Attempt session recovery via Neon session sync
            try {
              const syncRes = await fetch('/api/auth/guardian/neon-session');
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (syncData.session_id) {
                  localStorage.setItem('kavach_guardian_token', syncData.session_id);
                  window.location.reload();
                  return;
                }
              }
            } catch {}
            localStorage.removeItem('kavach_guardian_token');
            router.push('/auth');
            return;
          }
        const data = await res.json();
        setGuardian(data.guardian);

        fetch('/api/elders', { headers })
          .then((r) => r.ok ? r.json() : { elders: [] })
          .then((d) => setEldersList(d.elders || []))
          .catch(() => setEldersList([]));

        fetch('/api/devices', { headers })
          .then((r) => r.ok ? r.json() : { devices: [] })
          .then((d) => setDevicesList(d.devices || []))
          .catch(() => setDevicesList([]));

        fetch('/api/usage', { headers })
          .then((r) => r.ok ? r.json() : ({} as any))
          .then((d: any) => {
            if (d?.stt_minutes_today !== undefined) {
              setUsageStats({
                todayMinutesUsed: Math.round(d.stt_minutes_today || 0),
                todayMinutesCap: Math.round(d.max_stt_minutes_per_day || 30),
                monthMinutesUsed: Math.round(d.stt_minutes_today || 0),
                monthMinutesCap: 150,
                emergencyReserve: 30,
              });
            }
          })
          .catch(() => {});

        fetch('/api/sessions', { headers })
          .then((r) => r.ok ? r.json() : { sessions: [] })
          .then((d) => {
            const raw = d.sessions || [];
            const mapped = raw.map((s: any, idx: number) => ({
              id: s.id || `session-${idx}`,
              timestamp: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent call',
              type: s.scam_type || 'Monitored Speakerphone Call',
              level: (s.max_level || 'L1') as 'L0' | 'L1' | 'L2' | 'L3',
              stages: (s.stages || ['S1', 'S2']) as ('S1' | 'S2' | 'S3' | 'S4' | 'S5')[],
              excerpt: s.transcript_excerpt || 'Call audio transcribed and analyzed by Kavach detector rules.',
              warningPlayed: s.warning_played || 'Audio Alert Dispatched',
              telegramSent: Boolean(s.telegram_sent),
              resolved: Boolean(s.resolved),
            }));
            setAlertsList(mapped);
          })
          .catch(() => setAlertsList([]));

        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('kavach_guardian_token');
        router.push('/auth');
      });
    };
    initAuth();
  }, [router]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kavach_guardian_token');
      localStorage.removeItem('kavach_guardian_id');
      localStorage.removeItem('kavach_guardian_name');
      localStorage.removeItem('kavach_guardian_email');
    }
    router.push('/auth');
  };

  const openPairingModal = async () => {
    if (eldersList.length === 0) {
      router.push('/onboarding');
      return;
    }
    const targetElder = eldersList[0];
    setSelectedElderForPair(targetElder.id);
    setPairingModalOpen(true);
    await generateDevicePairingCode(targetElder.id);
  };

  const generateDevicePairingCode = async (elderId: string) => {
    const token = localStorage.getItem('kavach_guardian_token');
    if (!token || !elderId) return;
    setPairingCodeLoading(true);
    setPairingSuccessDetected(null);
    try {
      const res = await fetch('/api/devices/pairing-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ elder_id: elderId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPairingCode(data.code || '');
      }
    } catch (e) {
      console.error('Failed to generate pairing code', e);
    } finally {
      setPairingCodeLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to revoke authorization for this tabletop tablet?')) return;
    const token = localStorage.getItem('kavach_guardian_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setDevicesList((prev) => prev.filter((d) => d.id !== deviceId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!pairingModalOpen) return;
    const initialCount = devicesList.length;

    const pollInterval = setInterval(async () => {
      const token = localStorage.getItem('kavach_guardian_token');
      if (!token) return;
      try {
        const res = await fetch('/api/devices', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.devices || [];
          setDevicesList(list);
          if (list.length > initialCount) {
            setPairingSuccessDetected('Tablet linked and actively guarding!');
            setTimeout(() => {
              setPairingModalOpen(false);
              setPairingSuccessDetected(null);
            }, 2500);
          }
        }
      } catch {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [pairingModalOpen, devicesList.length]);

  const primaryElder = eldersList[0] || null;
  const primaryDevice = devicesList[0] || null;

  const household = {
    name: guardian?.name ? `${guardian.name.replace(' (Demo Caregiver)', '')}'s Residence` : 'Protected Residence',
    city: 'Family Protection Active',
    plan: 'Kavach Plus (Active)',
    elderDisplayName: primaryElder?.name || 'No Elder Registered Yet',
    elderPhone: primaryElder?.phone || 'Add emergency phone',
    primaryLang: primaryElder?.language || 'Hindi & Indian English',
    device: primaryDevice?.label || (primaryElder ? 'Living Room Tablet #1' : 'No Kiosk Paired'),
    deviceBattery: '100% (Plugged in)',
    wifiStrength: 'Online',
    lastHeartbeat: primaryDevice?.last_heartbeat ? 'Active now' : 'Online',
    todayMinutesUsed: usageStats.todayMinutesUsed,
    todayMinutesCap: usageStats.todayMinutesCap,
    monthMinutesUsed: usageStats.monthMinutesUsed,
    monthMinutesCap: usageStats.monthMinutesCap,
    emergencyReserve: usageStats.emergencyReserve,
  };

  const navTabs = [
    { id: 'overview', label: 'Overview & Household' },
    { id: 'alerts', label: 'Alert Feed', count: alertsList.length },
    { id: 'devices', label: 'Paired Tablet Kiosks', count: devicesList.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <KavachLogo size={36} showWordmark={true} />
          <div className="text-caption text-muted font-medium">Securing session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      {/* 2. Guardian App Header */}
      <header className="bg-surface/95 backdrop-blur-md border-b border-hairline px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 shadow-level-1">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <a href="/" className="focus:outline-none flex-shrink-0">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="hidden sm:inline-block text-muted">/</span>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-ui font-bold text-ink whitespace-nowrap">{household.name}</span>
              <span className="text-caption text-muted px-2 py-0.5 rounded-full bg-canvas border border-hairline whitespace-nowrap">
                {household.city}
              </span>
              {(guardian?.email === 'demo@kavach.ai' || guardian?.id === 'g_demo_kavach_caregiver') && (
                <Badge variant="primary" className="text-micro font-mono font-bold whitespace-nowrap">
                  Demo Mode
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
            <Button variant="outline-neutral" size="sm" href="/elder" className="whitespace-nowrap">
              Tabletop Kiosk
            </Button>
            <Button variant="outline-neutral" size="sm" href="/billing" className="whitespace-nowrap">
              Billing &amp; Usage
            </Button>
            <Button variant="outline-neutral" size="sm" href="/privacy" className="whitespace-nowrap">
              Privacy Rights
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="whitespace-nowrap text-muted hover:text-ink">
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
            <div className="text-caption text-muted">{guardian?.name ? `${guardian.name}'s Consented Voice` : 'Reassuring Synthetic Voice'}</div>
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
            onClick={openPairingModal}
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
                <span className="text-caption text-muted font-medium">Real-Time Threat Shield</span>
              </div>

              <div className="space-y-4">
                {alertsList.length === 0 ? (
                  <Card padding="lg" className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center mx-auto text-primary">
                      {/* @ts-expect-error solar icon */}
                      <iconify-icon icon="solar:shield-check-bold" width="28" height="28" />
                    </div>
                    <h3 className="font-bold text-ink text-ui">No Threat Incidents Detected</h3>
                    <p className="text-caption text-muted max-w-sm mx-auto">
                      All recent calls are benign. The speakerphone audio listener is actively armed to protect this household.
                    </p>
                  </Card>
                ) : (
                  alertsList.map((alert) => (
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
                  ))
                )}
              </div>
            </div>

            {/* Right Rail: Protected Elder & Tabletop Device */}
            <div className="space-y-6">
              <Card padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="font-bold text-ink text-ui">Protected Elder</h3>
                  <Badge variant="primary">{primaryElder ? 'Active' : 'Pending Setup'}</Badge>
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
                  <Badge variant="calm">{primaryDevice ? 'Online' : 'Unpaired'}</Badge>
                </div>

                <div className="space-y-2 text-caption text-body">
                  <div className="flex justify-between">
                    <span className="text-muted">Placement:</span>
                    <span className="text-ink font-bold">{household.device}</span>
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
            <div className="flex items-center gap-2">
              <h2 className="text-heading font-bold text-ink">Incident Audit Ledger</h2>
              <Badge variant="calm">Live Database Audit</Badge>
            </div>
            <div className="space-y-4">
              {alertsList.length === 0 ? (
                <Card padding="lg" className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center mx-auto text-primary">
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:shield-check-bold" width="28" height="28" />
                  </div>
                  <h3 className="font-bold text-ink text-ui">Incident Log Clean</h3>
                  <p className="text-caption text-muted max-w-sm mx-auto">
                    Zero scam attempts detected. Monitored calls meeting scam thresholds will automatically generate audit records here.
                  </p>
                </Card>
              ) : (
                alertsList.map((alert) => (
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
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICES */}
        {activeTab === 'devices' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
              <div>
                <h2 className="text-heading font-bold text-ink">Tabletop Kiosks &amp; Mobile Listeners</h2>
                <p className="text-caption text-muted font-medium">Real-Time Passive Speakerphone Acoustic Telemetry</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={openPairingModal}
                icon="add-circle-bold"
              >
                Pair New Device
              </Button>
            </div>

            {devicesList.length === 0 ? (
              <Card padding="lg" className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center mx-auto text-primary">
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:devices-bold" width="28" height="28" />
                </div>
                <h3 className="font-bold text-ink text-ui">No Tabletop Kiosks Paired Yet</h3>
                <p className="text-caption text-muted max-w-sm mx-auto">
                  Protect your elders by linking a tabletop tablet. Pair a device using the button above to begin passive speakerphone scam monitoring.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={openPairingModal} icon="add-circle-bold">
                    Pair Tabletop Kiosk
                  </Button>
                </div>
              </Card>
            ) : (
              devicesList.map((dev) => (
                <Card key={dev.id} padding="lg" className="space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-canvas border border-hairline flex items-center justify-center text-primary">
                        {/* @ts-expect-error solar icon */}
                        <iconify-icon icon="solar:devices-bold" width="20" height="20" />
                      </div>
                      <div>
                        <div className="font-bold text-ink text-ui">{dev.label || 'Living Room Kiosk'}</div>
                        <div className="text-caption text-muted">
                          Elder: <span className="font-bold text-ink">{dev.elder_name || 'Protected Elder'}</span>
                          {dev.paired_at && <span> · Paired {new Date(dev.paired_at).toLocaleDateString('en-IN')}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant={dev.revoked ? 'alert' : 'calm'}>{dev.revoked ? 'Revoked' : 'Paired & Active'}</Badge>
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
                      <div className={`font-bold mt-0.5 flex items-center gap-1.5 ${dev.status === 'online' ? 'text-green-strong' : 'text-muted'}`}>
                        <span className={`w-2 h-2 rounded-full ${dev.status === 'online' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                        <span>{dev.status === 'online' ? '< 5s Live' : 'Standby / Idle'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted font-bold uppercase text-micro">Audio Worklet</div>
                      <div className="text-ink mt-0.5 font-bold">16 kHz PCM16</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-hairline text-caption">
                    <div className="text-micro text-muted font-mono">
                      Device ID: {dev.id} · Consent: DPDP 2026-10-elder-v1
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRevokeDevice(dev.id)}
                    >
                      Revoke Device
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* 4. Progressive Disclosure Drawer for Incident Details & Intercom */}
      <Drawer
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident ? selectedIncident.type : 'Incident Details'}
        description={selectedIncident ? `Flagged at ${selectedIncident.timestamp} · Audio Security Event` : undefined}
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

      {/* 5. Pair New Device Modal */}
      <Modal
        isOpen={pairingModalOpen}
        onClose={() => setPairingModalOpen(false)}
        title="Pair Tabletop Tablet or Mobile"
        description="Connect a secondary tablet or phone placed on the senior's table."
      >
        <div className="space-y-5 pt-2 text-ui font-body">
          {eldersList.length > 1 && (
            <div className="space-y-1.5">
              <label className="block text-caption font-bold text-muted uppercase">Select Elder</label>
              <select
                value={selectedElderForPair}
                onChange={(e) => {
                  setSelectedElderForPair(e.target.value);
                  generateDevicePairingCode(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-md bg-canvas border border-hairline text-ink font-bold focus:outline-none focus:border-primary"
              >
                {eldersList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.language || 'hi-IN'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-6 rounded-md bg-canvas border border-hairline text-center space-y-3">
            <div className="text-caption font-mono text-muted uppercase tracking-wider font-bold">
              Single-Use 6-Character Pairing Code (15-min TTL)
            </div>
            {pairingCodeLoading ? (
              <div className="text-2xl font-mono text-muted py-3 animate-pulse">Generating Code...</div>
            ) : (
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.2em] text-primary py-2 select-all">
                {generatedPairingCode || '------'}
              </div>
            )}
            <p className="text-caption text-body max-w-sm mx-auto leading-relaxed">
              Open <code className="text-green-strong font-mono font-bold">{typeof window !== 'undefined' ? `${window.location.origin}/elder` : '/elder'}</code> on the elder tablet, enter this code, and check the consent box to activate.
            </p>
          </div>

          {pairingSuccessDetected && (
            <div className="p-4 rounded-md bg-green-surface border border-green-light text-green-strong font-bold text-sm text-center flex items-center justify-center gap-2">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:check-circle-bold" width="20" height="20" />
              <span>{pairingSuccessDetected}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <a
              href="/elder"
              target="_blank"
              rel="noreferrer"
              className="text-caption text-primary hover:underline font-bold flex items-center gap-1.5"
            >
              <span>Open Tablet Kiosk View</span>
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:arrow-right-up-linear" width="14" height="14" />
            </a>

            <Button
              variant="outline-neutral"
              size="md"
              onClick={() => setPairingModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
