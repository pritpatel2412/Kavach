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
  Modal,
  Icon,
  KavachLogo,
} from '@kavach/ui';
import { PLANS } from '@kavach/api-contract';

export default function AdminConsolePage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<
    | 'overview'
    | 'households'
    | 'devices'
    | 'alerts'
    | 'credits'
    | 'plans'
    | 'payments'
    | 'usage'
    | 'detector'
    | 'content'
    | 'dataRights'
    | 'featureFlags'
    | 'auditLog'
  >('overview');

  // Step-up re-auth modal state
  const [reauthOpen, setReauthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Manual Credit adjustment state
  const [creditHouseholdId, setCreditHouseholdId] = useState('HH-8921');
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState(100);

  // Feature flags state
  const [flags, setFlags] = useState({
    handsFreeVad: true,
    familialVoiceCloning: true,
    highSensitivityScoring: false,
    strictSilenceGating: true,
  });

  // Detector Weights State
  const [detectorWeights, setDetectorWeights] = useState({
    s1Weight: 20,
    s2Weight: 25,
    s3Weight: 35,
    s4Weight: 15,
    s5Weight: 40,
  });

  const handleStepUpAuth = (actionName: string) => {
    setPendingAction(actionName);
    setReauthOpen(true);
  };

  const handleConfirmStepUp = () => {
    setReauthOpen(false);
    setActionSuccess(`Action verified: "${pendingAction}" executed successfully.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const navItems = [
    { id: 'overview', label: 'Telemetry Overview', icon: 'chart-bold' },
    { id: 'households', label: 'Households & Elders', icon: 'users-group-two-rounded-bold' },
    { id: 'devices', label: 'Tabletop Kiosks', icon: 'devices-outline' },
    { id: 'alerts', label: 'Alerts & False Alarms', icon: 'shield-warning-bold' },
    { id: 'credits', label: 'Credits & Balances', icon: 'wallet-bold' },
    { id: 'plans', label: 'Plans & Coupons', icon: 'tag-price-bold' },
    { id: 'payments', label: 'GST Invoices', icon: 'card-bold' },
    { id: 'usage', label: 'Cost & Latency', icon: 'server-square-bold' },
    { id: 'detector', label: 'Detector Engine', icon: 'radar-outline' },
    { id: 'dataRights', label: 'DPDP Data Rights', icon: 'trash-bin-trash-bold' },
    { id: 'featureFlags', label: 'Feature Flags', icon: 'slider-minimalistic-horizontal-bold' },
    { id: 'auditLog', label: 'Audit Log', icon: 'history-bold' },
  ];

  return (
    <Frame withHatch={false} className="min-h-screen pb-16 flex flex-col">
      <AuroraCanvas />
      <HatchOverlay />

      {/* Admin Top Header */}
      <header className="relative z-20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <KavachLogo size={30} showWordmark={true} />
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-300">OPS CONSOLE</span>
            <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded bg-white/5 border border-white/10">
              v1.4.0-prod
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/60">
            Admin: <strong className="text-white">ops@kavach.ai</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/auth')}
            className="text-xs text-white/70"
          >
            Lock Console
          </Button>
        </div>
      </header>

      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-2xl flex items-center gap-2">
          <Icon name="check-circle-bold" size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Admin Workspace Grid */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-6 px-4 sm:px-8 pt-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 px-3 py-1">
            Operations Modules
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                activeModule === item.id
                  ? 'bg-[#c8f542] text-stone-950 font-bold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-4 lg:col-span-5 space-y-6">
          {/* MODULE 1: TELEMETRY OVERVIEW */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-white">Platform Operations Telemetry</h1>
                <span className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                  <StatusDot status="armed" label="Pipeline Healthy" />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-5 space-y-1.5">
                  <div className="text-xs font-mono text-white/50 uppercase">Active Households</div>
                  <div className="text-2xl font-heading font-bold text-white">1,428</div>
                  <div className="text-[11px] text-[#c8f542]">+42 onboarded this week</div>
                </GlassCard>

                <GlassCard className="p-5 space-y-1.5">
                  <div className="text-xs font-mono text-white/50 uppercase">Scam Calls Intercepted</div>
                  <div className="text-2xl font-heading font-bold text-white">314</div>
                  <div className="text-[11px] text-emerald-300">97.3% synthetic recall rate</div>
                </GlassCard>

                <GlassCard className="p-5 space-y-1.5">
                  <div className="text-xs font-mono text-white/50 uppercase">Listening Minutes (Today)</div>
                  <div className="text-2xl font-heading font-bold text-white">8,420 m</div>
                  <div className="text-[11px] text-white/40">Gated: 64,200 silence chunks saved</div>
                </GlassCard>

                <GlassCard className="p-5 space-y-1.5">
                  <div className="text-xs font-mono text-white/50 uppercase">STT Cloud Burn</div>
                  <div className="text-2xl font-heading font-bold text-amber-300">₹1,260.40</div>
                  <div className="text-[11px] text-white/40">Well within ₹5,000 daily budget</div>
                </GlassCard>
              </div>

              {/* Real-Time Queue Activity */}
              <GlassCard className="p-6 space-y-4">
                <h2 className="font-heading font-bold text-white text-base">Active Pipeline Monitors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-white/40">Gnani STT WebSocket</div>
                    <div className="text-emerald-300 font-bold">Connected (218 ms RTT)</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-white/40">Kavach Rule Engine</div>
                    <div className="text-[#c8f542] font-bold">0.8 ms inference / call</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-white/40">Telegram Alert Webhook</div>
                    <div className="text-emerald-300 font-bold">100% Delivery (412 ms)</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* MODULE 2: HOUSEHOLDS (MASKED PII) */}
          {activeModule === 'households' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-white">Households Directory (Masked PII)</h1>
                <span className="text-xs font-mono text-amber-300">DPDP Masking Enforced</span>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'HH-8921', name: 'Iyer Residence', city: 'Pune', elder: 'Mrs. K••••• Iyer', phone: '+91 98230 •••••', plan: 'Plus (₹149)', status: 'Armed' },
                  { id: 'HH-7412', name: 'Sharma Household', city: 'Jaipur', elder: 'Mr. R••••• Sharma', phone: '+91 94140 •••••', plan: 'Family (₹299)', status: 'Armed' },
                  { id: 'HH-6204', name: 'Patel Villa', city: 'Ahmedabad', elder: 'Mrs. H••••• Patel', phone: '+91 98980 •••••', plan: 'Plus (₹149)', status: 'Armed' },
                  { id: 'HH-5119', name: 'Menon Home', city: 'Kochi', elder: 'Mr. G••••• Menon', phone: '+91 97450 •••••', plan: 'Free', status: 'Standby' },
                ].map((hh) => (
                  <GlassCard key={hh.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{hh.name}</span>
                        <span className="text-white/40">({hh.city})</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-[#c8f542]">{hh.plan}</span>
                      </div>
                      <div className="text-white/50 text-[11px]">
                        Elder: {hh.elder} · Phone: {hh.phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-emerald-300 font-bold">{hh.status}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStepUpAuth(`Inspect unmasked PII for ${hh.id}`)}
                        className="text-[11px]"
                      >
                        Unmask PII
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 3: DEVICES */}
          {activeModule === 'devices' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-white">Registered Tabletop Kiosks</h1>
              <div className="space-y-3">
                {[
                  { id: 'DEV-101', tablet: 'Samsung Tab A8', household: 'Iyer Residence', heartbeat: '2s ago', battery: '100% plugged', audioWorklet: 'Active 16kHz', status: 'Online' },
                  { id: 'DEV-102', tablet: 'Lenovo M10', household: 'Sharma Household', heartbeat: '5s ago', battery: '92% plugged', audioWorklet: 'Active 16kHz', status: 'Online' },
                  { id: 'DEV-103', tablet: 'iPad 8th Gen', household: 'Patel Villa', heartbeat: '14s ago', battery: '85% battery', audioWorklet: 'Active 16kHz', status: 'Online' },
                ].map((dev) => (
                  <GlassCard key={dev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div>
                      <div className="font-bold text-white text-sm">{dev.tablet} ({dev.id})</div>
                      <div className="text-white/50 text-[11px]">{dev.household} · Heartbeat: {dev.heartbeat}</div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-white/70">{dev.battery}</span>
                      <span className="text-[#c8f542]">{dev.audioWorklet}</span>
                      <StatusDot status="armed" label="Online" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 4: ALERTS & FALSE ALARM QUEUE */}
          {activeModule === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-white">Alerts &amp; False Positive Queue</h1>
                <span className="text-xs font-mono text-[#c8f542]">Caregiver Verified Feed</span>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'EVT-901', household: 'Iyer Residence', scamType: 'Digital Arrest CBI', score: 92, verified: 'Confirmed Real Scam', tag: 'Coercion & Isolation' },
                  { id: 'EVT-894', household: 'Sharma Household', scamType: 'FedEx Customs MDMA', score: 72, verified: 'Confirmed Real Scam', tag: 'Contraband Threat' },
                  { id: 'EVT-870', household: 'Patel Villa', scamType: 'Bank KYC SMS', score: 58, verified: 'False Alarm (Doctor Call)', tag: 'FP Review Required' },
                ].map((ev) => (
                  <GlassCard key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div>
                      <div className="font-bold text-white">{ev.scamType} ({ev.id})</div>
                      <div className="text-white/50 text-[11px]">{ev.household} · Tag: {ev.tag}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white">Score: {ev.score}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        ev.verified.startsWith('Confirmed') ? 'bg-[#ff5a4d]/20 text-[#ff5a4d]' : 'bg-amber-400/20 text-amber-300'
                      }`}>
                        {ev.verified}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 5: CREDITS LEDGER & MANUAL ADJUSTMENTS */}
          {activeModule === 'credits' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-white">Credits Ledger &amp; Adjustments</h1>
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => handleStepUpAuth(`Credit Adjustment of ${creditAdjustmentAmount} mins for ${creditHouseholdId}`)}
                >
                  Adjust Household Credits
                </Button>
              </div>

              <GlassCard className="p-6 space-y-4">
                <h3 className="font-heading font-bold text-white text-sm">Credit Adjustment Sandbox</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-white/60 mb-1">Target Household ID</label>
                    <input
                      type="text"
                      value={creditHouseholdId}
                      onChange={(e) => setCreditHouseholdId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/18 bg-white/5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">Minutes Adjustment (+/-)</label>
                    <input
                      type="number"
                      value={creditAdjustmentAmount}
                      onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-white/18 bg-white/5 text-white"
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* MODULE 6: PLANS & COUPONS */}
          {activeModule === 'plans' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-white">Plans &amp; Coupon Promotions</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((p) => (
                  <GlassCard key={p.id} className="p-4 space-y-2 text-xs font-mono">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-white/60">
                      {p.priceMonthly === 0 ? '₹0' : `₹${p.priceMonthly}`}/mo · {p.minutesPerMonth} mins
                    </div>
                    <div className="text-[#c8f542] text-[11px]">Active in 1,120 households</div>
                  </GlassCard>
                ))}
              </div>

              <GlassCard className="p-5 space-y-3">
                <div className="font-heading font-bold text-white text-sm">Active Promotions</div>
                <div className="text-xs font-mono text-white/70">
                  <strong className="text-[#c8f542]">KAVACH50</strong> — 50% discount for first 3 months on Plus and Family tiers. (Used by 241 households)
                </div>
              </GlassCard>
            </div>
          )}

          {/* MODULE 7: PAYMENTS & GST INVOICES */}
          {activeModule === 'payments' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-white">GST Invoices &amp; Razorpay Tokens</h1>
              <div className="space-y-3">
                {[
                  { id: 'INV-2026-1002', hh: 'Iyer Residence', amount: '₹149', razorpayId: 'pay_P109823901', gst: '₹22.73 (18%)' },
                  { id: 'INV-2026-1001', hh: 'Sharma Household', amount: '₹299', razorpayId: 'pay_P109823902', gst: '₹45.61 (18%)' },
                  { id: 'INV-2026-0999', hh: 'Patel Villa', amount: '₹149', razorpayId: 'pay_P109823903', gst: '₹22.73 (18%)' },
                ].map((inv) => (
                  <GlassCard key={inv.id} className="p-4 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-white">{inv.id} — {inv.hh}</div>
                      <div className="text-white/40 text-[11px]">Token: {inv.razorpayId} · GST Included: {inv.gst}</div>
                    </div>
                    <span className="font-bold text-[#c8f542]">{inv.amount}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 8: USAGE & COST */}
          {activeModule === 'usage' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-white">Cost per Minute &amp; STT Metrics</h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-5 space-y-2 text-xs font-mono">
                  <div className="text-white/50">Average STT Cost</div>
                  <div className="text-2xl font-bold text-white">₹0.15 / min</div>
                  <div className="text-[#c8f542]">Gnani Prisma Streaming</div>
                </GlassCard>
                <GlassCard className="p-5 space-y-2 text-xs font-mono">
                  <div className="text-white/50">TTS Voice Generation</div>
                  <div className="text-2xl font-bold text-white">₹0.08 / alert</div>
                  <div className="text-emerald-300">Gnani Timbre Cloned</div>
                </GlassCard>
                <GlassCard className="p-5 space-y-2 text-xs font-mono">
                  <div className="text-white/50">Silence Gating Savings</div>
                  <div className="text-2xl font-bold text-emerald-300">88.4%</div>
                  <div className="text-white/50">Local VAD blocked upload</div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* MODULE 9: DETECTOR WEIGHTS */}
          {activeModule === 'detector' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold text-white">Detector Finite State Machine</h1>
                  <div className="text-xs font-mono text-white/50">Active: kavach_detector v1.4.0 (0.8 ms)</div>
                </div>
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => handleStepUpAuth('Update detector stage weights')}
                >
                  Deploy Weight Changes
                </Button>
              </div>

              <GlassCard className="p-6 space-y-4">
                <h3 className="font-heading font-bold text-white text-sm">Stage Weight Calibration</h3>
                <div className="space-y-3 text-xs font-mono">
                  {Object.entries(detectorWeights).map(([stage, weight]) => (
                    <div key={stage} className="flex items-center justify-between gap-4">
                      <span className="w-32 uppercase text-white/70">{stage}:</span>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={weight}
                        onChange={(e) =>
                          setDetectorWeights({ ...detectorWeights, [stage]: Number(e.target.value) })
                        }
                        className="flex-1 accent-[#c8f542]"
                      />
                      <span className="w-12 text-right font-bold text-[#c8f542]">{weight} pts</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* MODULE 10: DPDP DATA RIGHTS */}
          {activeModule === 'dataRights' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-white">DPDP Act 2023 Erasure &amp; Export Queue</h1>
              <div className="space-y-3">
                {[
                  { id: 'REQ-101', type: '1-Click Voice Embedding Purge', user: 'vikram@example.com', date: 'Today 10:45 AM', status: 'Purged Instantly' },
                  { id: 'REQ-102', type: 'JSON Household Data Export', user: 'priya@example.com', date: 'Yesterday 3:12 PM', status: 'Export Delivered' },
                  { id: 'REQ-103', type: '7-Day Automatic Transcript Sweeper', user: 'System Automated Sweeper', date: 'Daily at 00:00', status: 'Completed (0 stale records)' },
                ].map((req) => (
                  <GlassCard key={req.id} className="p-4 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-white">{req.type}</div>
                      <div className="text-white/40 text-[11px]">{req.user} · {req.date}</div>
                    </div>
                    <span className="text-[#c8f542] font-bold">{req.status}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 11: FEATURE FLAGS */}
          {activeModule === 'featureFlags' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-white">System Feature Flags</h1>
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => handleStepUpAuth('Save feature flag changes')}
                >
                  Save Flag States
                </Button>
              </div>

              <GlassCard className="p-6 space-y-4 text-xs font-mono">
                {Object.entries(flags).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-bold text-white uppercase">{key}</div>
                      <div className="text-white/40 text-[11px]">Runtime toggle for household devices</div>
                    </div>
                    <button
                      onClick={() => setFlags({ ...flags, [key]: !enabled })}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        enabled ? 'bg-[#c8f542] text-stone-950' : 'bg-stone-800 text-white/50'
                      }`}
                    >
                      {enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </GlassCard>
            </div>
          )}

          {/* MODULE 12: AUDIT LOG */}
          {activeModule === 'auditLog' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-white">Operations Audit Log (Immutable)</h1>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { time: '18 Oct 2026, 10:48:12 IST', actor: 'ops@kavach.ai', action: 'DEPLOY_DETECTOR_VERSION', details: 'Deployed kavach_detector v1.4.0-prod' },
                  { time: '18 Oct 2026, 09:30:00 IST', actor: 'cron_sweeper', action: 'PURGE_7_DAY_TRANSCRIPTS', details: 'Purged 14 expired call transcripts' },
                  { time: '17 Oct 2026, 16:15:22 IST', actor: 'admin@kavach.ai', action: 'UPDATE_FEATURE_FLAG', details: 'Enabled handsFreeVad for Pune beta' },
                ].map((log, idx) => (
                  <GlassCard key={idx} className="p-3.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#c8f542] font-bold">{log.action}</span>
                      <span className="text-white/80">{log.details}</span>
                    </div>
                    <div className="text-white/40">{log.time} · {log.actor}</div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step-Up Re-Authentication Modal */}
      <Modal
        isOpen={reauthOpen}
        onClose={() => setReauthOpen(false)}
        title="Admin Step-Up Re-Authentication Required"
      >
        <div className="space-y-4 text-xs font-body">
          <p className="text-white/80">
            You are requesting a privileged operation: <strong className="text-amber-300">{pendingAction}</strong>.
          </p>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white/70 font-mono text-[11px]">
            Please tap your FIDO2 security key or verify device biometric to authorize this change.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setReauthOpen(false)}>
              Cancel
            </Button>
            <Button variant="lime" size="sm" onClick={handleConfirmStepUp} icon="key-bold">
              Authorize with Security Key
            </Button>
          </div>
        </div>
      </Modal>
    </Frame>
  );
}
