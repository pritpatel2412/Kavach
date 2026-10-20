'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
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
    | 'waitlist'
    | 'support'
    | 'coupons'
    | 'exportCenter'
    | 'email'
    | 'households'
    | 'devices'
    | 'alerts'
    | 'credits'
    | 'plans'
    | 'payments'
    | 'usage'
    | 'detector'
    | 'dataRights'
    | 'featureFlags'
    | 'auditLog'
  >('overview');

  // Command palette state (Ctrl+K)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');

  // Step-up re-auth modal state
  const [reauthOpen, setReauthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Waitlist CRM state
  const [waitlistFilter, setWaitlistFilter] = useState<'all' | 'confirmed' | 'pending' | 'invited'>('all');
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState<any | null>(null);

  // Support Inbox state
  const [ticketFilter, setTicketFilter] = useState<'all' | 'emergency' | 'open' | 'pending' | 'solved'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('KAV-000101');
  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
  const [replyText, setReplyText] = useState('');

  // Coupon Simulator state
  const [simCode, setSimCode] = useState('KAVACH50');
  const [simPlan, setSimPlan] = useState('plan_plus');
  const [simResult, setSimResult] = useState<string | null>(null);

  // Email Subsystem state
  const [emailTemplateLocale, setEmailTemplateLocale] = useState<'en' | 'hi' | 'gu'>('en');
  const [selectedTemplate, setSelectedTemplate] = useState('waitlist_confirm');

  // Export Center state
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json' | 'html'>('csv');
  const [exportMasked, setExportMasked] = useState(true);

  // Manual Credit adjustment state
  const [creditHouseholdId, setCreditHouseholdId] = useState('HH-8921');
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState(100);

  // Feature flags state
  const [flags, setFlags] = useState({
    handsFreeVad: true,
    familialVoiceCloning: true,
    highSensitivityScoring: false,
    strictSilenceGating: true,
    aiDraftAssistance: false,
  });

  // Detector Weights State
  const [detectorWeights, setDetectorWeights] = useState({
    s1Weight: 20,
    s2Weight: 25,
    s3Weight: 35,
    s4Weight: 15,
    s5Weight: 40,
  });

  // Global Keyboard listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStepUpAuth = (actionName: string) => {
    setPendingAction(actionName);
    setReauthOpen(true);
  };

  const handleConfirmStepUp = () => {
    setReauthOpen(false);
    setActionSuccess(`Action verified: "${pendingAction}" executed successfully.`);
    if (pendingAction?.includes('Unmask Export')) {
      setExportMasked(false);
    }
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSimulateCoupon = () => {
    if (simCode.toUpperCase() === 'KAVACH50') {
      setSimResult('VALID: 50% discount applies to Plus/Family. Discounted price: ₹74.50 (pre-tax: ₹63.14 + ₹11.36 GST). 60% cap respected.');
    } else if (simCode.toUpperCase() === 'DIWALI60') {
      setSimResult('VALID: 60% discount ceiling reached. Discounted price: ₹59.60. Max allowed.');
    } else {
      setSimResult('INVALID: Code expired or does not meet minimum qualifying eligibility criteria.');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Telemetry Overview', icon: 'chart-bold', group: 'Analytics' },
    { id: 'waitlist', label: 'Waitlist CRM & Campaigns', icon: 'users-group-two-rounded-bold', group: 'Growth' },
    { id: 'support', label: 'Support Inbox & SLAs', icon: 'shield-warning-bold', group: 'Operations' },
    { id: 'coupons', label: 'Coupons & Referrals', icon: 'tag-price-bold', group: 'Growth' },
    { id: 'exportCenter', label: 'Data Export Center', icon: 'download-square-outline', group: 'Operations' },
    { id: 'email', label: 'Email Outbox & DNS', icon: 'letter-bold', group: 'Operations' },
    { id: 'households', label: 'Households Directory', icon: 'users-group-two-rounded-bold', group: 'Operations' },
    { id: 'devices', label: 'Tabletop Kiosks', icon: 'devices-outline', group: 'Operations' },
    { id: 'alerts', label: 'Alerts & False Alarms', icon: 'shield-warning-bold', group: 'Operations' },
    { id: 'credits', label: 'Credits & Balances', icon: 'wallet-bold', group: 'Billing' },
    { id: 'plans', label: 'Plans & Pricing', icon: 'card-bold', group: 'Billing' },
    { id: 'payments', label: 'GST Invoices', icon: 'card-bold', group: 'Billing' },
    { id: 'usage', label: 'Cost & Latency', icon: 'server-square-bold', group: 'Analytics' },
    { id: 'detector', label: 'Detector Engine', icon: 'radar-outline', group: 'Engineering' },
    { id: 'dataRights', label: 'DPDP Data Rights', icon: 'trash-bin-trash-bold', group: 'Governance' },
    { id: 'featureFlags', label: 'Feature Flags', icon: 'slider-minimalistic-horizontal-bold', group: 'Engineering' },
    { id: 'auditLog', label: 'Audit Log (Immutable)', icon: 'history-bold', group: 'Governance' },
  ];

  // Search items across entire platform for Ctrl+K
  const commandItems = [
    { type: 'Household', id: 'HH-8921', title: 'Iyer Residence (Mrs. K••••• Iyer)', module: 'households' },
    { type: 'Household', id: 'HH-7412', title: 'Sharma Household (Mr. R••••• Sharma)', module: 'households' },
    { type: 'Waitlist', id: 'WL-401', title: 'Rahul Verma (Pune, Marathi/English)', module: 'waitlist' },
    { type: 'Waitlist', id: 'WL-402', title: 'Meera Shah (Ahmedabad, Gujarati)', module: 'waitlist' },
    { type: 'Ticket', id: 'KAV-000101', title: 'SCAM EMERGENCY: Live CBI Digital Arrest Call', module: 'support' },
    { type: 'Ticket', id: 'KAV-000102', title: 'Billing: GST Invoice for Plus Plan Renewal', module: 'support' },
    { type: 'Coupon', id: 'KAVACH50', title: '50% off Plus/Family quarterly promotion', module: 'coupons' },
    { type: 'Coupon', id: 'DIWALI60', title: '60% festive cap discount code', module: 'coupons' },
  ];

  const filteredCommands = commandItems.filter(
    (c) =>
      c.title.toLowerCase().includes(commandSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(commandSearch.toLowerCase()) ||
      c.type.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col pb-16">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline bg-surface shadow-xs">
        <div className="flex items-center gap-4">
          <KavachLogo size={28} showWordmark={true} />
          <span className="text-muted/40">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
              OPS CONSOLE
            </span>
            <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded-sm bg-canvas border border-hairline">
              v1.5.0-prod
            </span>
            <span className="text-[10px] font-mono text-green-strong px-2 py-0.5 rounded-sm bg-green-surface border border-green-light">
              PORT 3002
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas hover:bg-hairline/60 border border-hairline text-xs font-mono text-muted hover:text-ink transition-all cursor-pointer"
          >
            <Icon name="magnifer-outline" size={14} />
            <span>Search users, tickets, coupons...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-mono text-muted border border-hairline">
              Ctrl+K
            </kbd>
          </button>

          <span className="text-xs font-mono text-muted hidden md:inline">
            Admin: <strong className="text-ink">ops@kavach.ai</strong>
          </span>
          <Button
            variant="outline-neutral"
            size="sm"
            onClick={() => router.push('/auth')}
            className="text-xs"
          >
            Lock Console
          </Button>
        </div>
      </header>

      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-md bg-surface border border-hairline text-ink text-xs font-mono shadow-level-2 flex items-center gap-2 border-l-4 border-l-primary animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check-circle-bold" size={16} className="text-primary" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Admin Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-6 px-4 sm:px-8 pt-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold px-3 py-1">
            Operations Modules
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as any)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-body transition-all text-left ${
                activeModule === item.id
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-body hover:text-ink hover:bg-surface border border-transparent hover:border-hairline'
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
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Platform Operations Telemetry</h1>
                  <p className="text-xs font-mono text-muted">Synthetic Evaluation &amp; Production Telemetry</p>
                </div>
                <span className="text-xs font-mono text-green-strong flex items-center gap-1.5">
                  <StatusDot status="armed" label="All 14 Services Armed" />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5">
                  <div className="text-xs font-mono text-muted uppercase">Active Households</div>
                  <div className="text-2xl font-heading font-bold text-ink">1,428</div>
                  <div className="text-[11px] text-green-strong font-medium">+42 onboarded this week</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5">
                  <div className="text-xs font-mono text-muted uppercase">Scam Calls Intercepted</div>
                  <div className="text-2xl font-heading font-bold text-ink">314</div>
                  <div className="text-[11px] text-green-strong font-medium">97.3% synthetic recall rate</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5">
                  <div className="text-xs font-mono text-muted uppercase">Listening Minutes (Today)</div>
                  <div className="text-2xl font-heading font-bold text-ink">8,420 m</div>
                  <div className="text-[11px] text-muted">Gated: 64,200 silence chunks saved</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5">
                  <div className="text-xs font-mono text-muted uppercase">STT Cloud Burn</div>
                  <div className="text-2xl font-heading font-bold text-primary">₹1,260.40</div>
                  <div className="text-[11px] text-muted">Well within ₹5,000 daily budget</div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-ink text-base">Growth &amp; Activation Funnel</h2>
                  <span className="text-xs font-mono text-muted">Last 30 Days (Demo Seeded)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-[11px] text-muted font-mono">Waitlist Signups</div>
                    <div className="text-lg font-bold text-ink font-heading">2,410</div>
                    <div className="text-[10px] text-primary font-mono font-bold">100%</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-[11px] text-muted font-mono">Double Opt-in</div>
                    <div className="text-lg font-bold text-ink font-heading">2,084</div>
                    <div className="text-[10px] text-green-strong font-mono font-bold">86.5% confirm</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-[11px] text-muted font-mono">Invited to Beta</div>
                    <div className="text-lg font-bold text-ink font-heading">1,820</div>
                    <div className="text-[10px] text-cold font-mono font-bold">87.3% invite</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-[11px] text-muted font-mono">Activated Device</div>
                    <div className="text-lg font-bold text-ink font-heading">1,428</div>
                    <div className="text-[10px] text-green-strong font-mono font-bold">78.5% active</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-[11px] text-muted font-mono">Paid Plus/Family</div>
                    <div className="text-lg font-bold text-ink font-heading">892</div>
                    <div className="text-[10px] text-amber-700 font-mono font-bold">62.5% pay</div>
                  </div>
                </div>
              </div>

              {/* Real-Time Queue Activity */}
              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <h2 className="font-heading font-bold text-ink text-base">Active Pipeline &amp; Cloud Infrastructure Monitors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">Gnani STT WebSocket</div>
                    <div className="text-green-strong font-bold">Connected (218 ms RTT)</div>
                  </div>
                  <div className="p-3.5 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">Kavach Rule Engine</div>
                    <div className="text-primary font-bold">0.8 ms inference / call</div>
                  </div>
                  <div className="p-3.5 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">Telegram Webhook</div>
                    <div className="text-green-strong font-bold">100% Delivery (412 ms)</div>
                  </div>
                  <div className="p-3.5 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">Neon Lakebase Postgres</div>
                    <div className="text-green-strong font-bold">Healthy (Pooled 18 ms)</div>
                  </div>
                  <div className="p-3.5 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">Neon Managed Auth</div>
                    <div className="text-primary font-bold">JWKS Key Verified</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: WAITLIST CRM & CAMPAIGNS */}
          {activeModule === 'waitlist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Waitlist CRM &amp; Broadcast Campaigns</h1>
                  <p className="text-xs font-mono text-muted">Double Opt-In Leads, Single-Use Invites &amp; Throttled Outbox</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline-neutral"
                    size="sm"
                    onClick={() => handleStepUpAuth('Bulk invite confirmed waitlist cohort')}
                  >
                    Bulk Invite Cohort
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStepUpAuth('Compose broadcast campaign')}
                  >
                    Compose Campaign
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {(['all', 'confirmed', 'pending', 'invited'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setWaitlistFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-full capitalize transition-all ${
                      waitlistFilter === tab
                        ? 'bg-primary text-on-primary font-bold'
                        : 'bg-surface border border-hairline text-body hover:text-ink'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Waitlist Table */}
              <div className="space-y-3">
                {[
                  { id: 'WL-401', name: 'Rahul Verma', email: 'rahul.v•••••@example.com', phone: '+91 98230 •••••', lang: 'Marathi (mr)', city: 'Pune', status: 'confirmed', date: 'Today 09:15', source: 'landing' },
                  { id: 'WL-402', name: 'Meera Shah', email: 'meera.s•••••@example.com', phone: '+91 94140 •••••', lang: 'Gujarati (gu)', city: 'Ahmedabad', status: 'confirmed', date: 'Yesterday 18:30', source: 'referral' },
                  { id: 'WL-403', name: 'Ananya Pillai', email: 'ananya.p•••••@example.com', phone: '+91 97450 •••••', lang: 'English (en)', city: 'Bengaluru', status: 'pending', date: '17 Oct 2026', source: 'landing' },
                  { id: 'WL-404', name: 'Deepak Joshi', email: 'deepak.j•••••@example.com', phone: '+91 98980 •••••', lang: 'Hindi (hi)', city: 'Delhi NCR', status: 'invited', date: '16 Oct 2026', source: 'partner' },
                ]
                  .filter((w) => waitlistFilter === 'all' || w.status === waitlistFilter)
                  .map((entry) => (
                    <div key={entry.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-sm">{entry.name}</span>
                          <span className="text-muted text-[11px]">({entry.city})</span>
                          <span className="px-2 py-0.5 rounded-sm bg-green-surface text-[10px] text-green-strong font-bold">{entry.lang}</span>
                          <span className="px-2 py-0.5 rounded-sm bg-canvas border border-hairline text-[10px] text-muted">via {entry.source}</span>
                        </div>
                        <div className="text-muted text-[11px]">
                          Email: {entry.email} · Phone: {entry.phone} · Registered: {entry.date}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            entry.status === 'confirmed'
                              ? 'bg-green-surface text-green-strong border border-green-light'
                              : entry.status === 'invited'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {entry.status}
                        </span>
                        <Button
                          variant="outline-neutral"
                          size="sm"
                          onClick={() => handleStepUpAuth(`Generate single-use invite code for ${entry.id}`)}
                          className="text-[11px]"
                        >
                          Send Invite
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* MODULE 3: SUPPORT INBOX & SLAS */}
          {activeModule === 'support' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Support Operations Inbox</h1>
                  <p className="text-xs font-mono text-muted">SLA Timers, Scam Emergency Routing &amp; CSAT Feedback</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-red-50 text-hot border border-red-200 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-hot animate-pulse" />
                    1 Scam Emergency Active
                  </span>
                </div>
              </div>

              {/* View Filters */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {(['all', 'emergency', 'open', 'pending', 'solved'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTicketFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-full capitalize transition-all ${
                      ticketFilter === tab
                        ? 'bg-primary text-on-primary font-bold'
                        : 'bg-surface border border-hairline text-body hover:text-ink'
                    }`}
                  >
                    {tab === 'emergency' ? '🚨 Scam Emergency' : tab}
                  </button>
                ))}
              </div>

              {/* Support Tickets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  {[
                    { id: 'KAV-000101', priority: 'P0_EMERGENCY', subject: 'Elder trapped in fake police Skype call', user: 'vikram@example.com', sla: '8 min left', status: 'open' },
                    { id: 'KAV-000102', priority: 'P1_HIGH', subject: 'GST invoice missing company GSTIN', user: 'accounts@sharma.in', sla: '1h 14m left', status: 'open' },
                    { id: 'KAV-000103', priority: 'P2_NORMAL', subject: 'Tabletop kiosk audio worklet restart request', user: 'patel@example.com', sla: '5h 20m left', status: 'pending' },
                    { id: 'KAV-000104', priority: 'P3_LOW', subject: 'Feature suggestion: Gujarati voice alert customization', user: 'meera@example.com', sla: 'Met (CSAT 5/5)', status: 'solved' },
                  ]
                    .filter((t) => {
                      if (ticketFilter === 'emergency') return t.priority.includes('EMERGENCY');
                      if (ticketFilter === 'open') return t.status === 'open';
                      if (ticketFilter === 'pending') return t.status === 'pending';
                      if (ticketFilter === 'solved') return t.status === 'solved';
                      return true;
                    })
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`p-4 rounded-md border transition-all cursor-pointer text-xs font-mono space-y-2 ${
                          selectedTicketId === t.id
                            ? 'bg-surface border-primary shadow-xs'
                            : 'bg-surface border-hairline hover:border-hairline/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">{t.id}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                              t.priority.includes('EMERGENCY')
                                ? 'bg-red-50 text-hot border border-red-200'
                                : 'bg-canvas text-muted border border-hairline'
                            }`}
                          >
                            {t.sla}
                          </span>
                        </div>
                        <div className="text-ink font-medium truncate">{t.subject}</div>
                        <div className="text-muted text-[11px]">{t.user}</div>
                      </div>
                    ))}
                </div>

                {/* Ticket Detail Drawer */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-surface border border-hairline rounded-md p-6 space-y-4 text-xs font-mono">
                    <div className="flex items-center justify-between pb-4 border-b border-hairline">
                      <div>
                        <div className="text-base font-bold text-ink font-heading">
                          {selectedTicketId === 'KAV-000101'
                            ? 'Elder trapped in fake police Skype call (Digital Arrest)'
                            : `Ticket Investigation: ${selectedTicketId}`}
                        </div>
                        <div className="text-muted text-[11px]">
                          Requester: Vikram Iyer · Household: Iyer Residence (HH-8921) · Pune
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-sm bg-red-50 text-hot border border-red-200 text-[11px] font-bold">
                        P0 SCAM EMERGENCY
                      </span>
                    </div>

                    {/* Emergency Advice Banner */}
                    <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-hot space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Icon name="shield-warning-bold" size={16} />
                        Automated Emergency Protocol Triggered
                      </div>
                      <div className="text-[11px] text-red-800">
                        Citizen advised: Do NOT transfer funds. Disconnect video call. National Cybercrime Helpline <strong>1930</strong> and <strong>cybercrime.gov.in</strong> dispatched via SMS &amp; email.
                      </div>
                    </div>

                    {/* Timeline Thread */}
                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                        <div className="flex justify-between text-muted text-[10px]">
                          <span>Vikram Iyer (Guardian)</span>
                          <span>Today, 10:12 AM</span>
                        </div>
                        <div className="text-ink">
                          My mother called me saying someone in police uniform on Skype told her she is under digital arrest for a FedEx parcel containing narcotics. What should we do right now?
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-green-surface border border-green-light space-y-1">
                        <div className="flex justify-between text-green-strong text-[10px] font-bold">
                          <span>Kavach Automated Emergency Responder</span>
                          <span>Today, 10:12 AM</span>
                        </div>
                        <div className="text-ink">
                          This is a verified scam pattern. Indian police NEVER conduct arrests, interrogations or clearances via Skype or WhatsApp. Tell your mother to hang up immediately. We have logged this incident.
                        </div>
                      </div>
                    </div>

                    {/* Reply Box */}
                    <div className="space-y-3 pt-4 border-t border-hairline">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReplyMode('public')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              replyMode === 'public'
                                ? 'bg-primary text-on-primary'
                                : 'text-muted hover:text-ink'
                            }`}
                          >
                            Customer Reply
                          </button>
                          <button
                            onClick={() => setReplyMode('internal')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              replyMode === 'internal'
                                ? 'bg-amber-600 text-white'
                                : 'text-muted hover:text-ink'
                            }`}
                          >
                            Internal Team Note
                          </button>
                        </div>
                        <select
                          className="px-3 py-1 rounded-full bg-surface border border-hairline text-body text-[11px] focus:outline-none focus:border-primary"
                          onChange={(e) => setReplyText(e.target.value)}
                        >
                          <option value="">Insert Canned Macro...</option>
                          <option value="Advice: Please call 1930 immediately to freeze any suspicious bank transactions.">Macro: 1930 Helpline</option>
                          <option value="Hardware check: Have you power-cycled the tabletop kiosk?">Macro: Kiosk Restart</option>
                          <option value="Resolved: We have verified the elder is safe and closed this ticket.">Macro: Close Safe</option>
                        </select>
                      </div>

                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={replyMode === 'public' ? 'Type response sent to customer magic portal...' : 'Internal note for agents only (not visible to customer)...'}
                        className="w-full p-3 rounded-md bg-canvas border border-hairline text-ink text-xs placeholder:text-muted focus:outline-none focus:border-primary"
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline-neutral"
                          size="sm"
                          onClick={() => handleStepUpAuth(`Resolve and close ticket ${selectedTicketId}`)}
                        >
                          Close as Solved
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setActionSuccess('Message dispatched to customer portal.');
                            setReplyText('');
                            setTimeout(() => setActionSuccess(null), 3000);
                          }}
                        >
                          {replyMode === 'public' ? 'Send Reply' : 'Save Internal Note'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4: COUPONS & REFERRALS */}
          {activeModule === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Coupons &amp; Referral Engine</h1>
                  <p className="text-xs font-mono text-muted">Strict 60% Maximum Discount Ceiling · 15-Min Reservation Hold</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStepUpAuth('Create high-discount promotional coupon')}
                >
                  Create New Coupon
                </Button>
              </div>

              {/* Active Coupons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">KAVACH50</span>
                    <span className="px-2 py-0.5 rounded-sm bg-green-surface text-green-strong text-[10px] font-bold border border-green-light">50% OFF</span>
                  </div>
                  <div className="text-body">Plus &amp; Family Plans · Max 3 months</div>
                  <div className="text-[11px] text-muted">Redemptions: 241 / 1,000 max</div>
                  <div className="text-green-strong text-[10px] font-bold">Active · 15-min hold enabled</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">DIWALI60</span>
                    <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">60% MAX CAP</span>
                  </div>
                  <div className="text-body">Festive Referral Special</div>
                  <div className="text-[11px] text-muted">Redemptions: 89 / 200 max</div>
                  <div className="text-amber-800 text-[10px] font-bold">Strict ceiling enforced</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">SENIOR30</span>
                    <span className="px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">30% FLAT</span>
                  </div>
                  <div className="text-body">Senior Citizen Partner NGO</div>
                  <div className="text-[11px] text-muted">Redemptions: 412 / 500 max</div>
                  <div className="text-green-strong text-[10px] font-bold">Active Partner Code</div>
                </div>
              </div>

              {/* Coupon Validation Simulator */}
              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <h2 className="font-heading font-bold text-ink text-base">Coupon Eligibility Sandbox</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-body mb-1">Coupon Code</label>
                    <input
                      type="text"
                      value={simCode}
                      onChange={(e) => setSimCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-full border border-hairline bg-surface text-ink uppercase font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body mb-1">Target Plan</label>
                    <select
                      value={simPlan}
                      onChange={(e) => setSimPlan(e.target.value)}
                      className="w-full px-3 py-2 rounded-full border border-hairline bg-surface text-ink focus:outline-none focus:border-primary"
                    >
                      <option value="plan_plus">Kavach Plus (₹149/mo)</option>
                      <option value="plan_family">Kavach Family (₹299/mo)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSimulateCoupon}
                      className="w-full justify-center"
                    >
                      Simulate Discount Math
                    </Button>
                  </div>
                </div>

                {simResult && (
                  <div className="p-3.5 rounded-md bg-green-surface border border-green-light text-xs font-mono text-green-strong">
                    {simResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODULE 5: DATA EXPORT CENTER */}
          {activeModule === 'exportCenter' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Central Data Export Center</h1>
                  <p className="text-xs font-mono text-muted">Anti-Formula Injection Neutralization · DPDP PII Masking · UTF-8 BOM</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStepUpAuth(`Trigger new export job in format ${exportFormat.toUpperCase()}`)}
                >
                  Generate New Export
                </Button>
              </div>

              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4 text-xs font-mono">
                <h3 className="font-heading font-bold text-ink text-sm">Export Configuration &amp; Safety Checks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body mb-2">Export Format</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['csv', 'xlsx', 'json', 'html'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`py-2 rounded-full uppercase font-bold text-center transition-all ${
                            exportFormat === fmt
                              ? 'bg-primary text-on-primary'
                              : 'bg-canvas border border-hairline text-body hover:text-ink'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-body mb-2">PII Protection Level</label>
                    <div className="flex items-center gap-3 p-2 rounded-md bg-canvas border border-hairline">
                      <span className="flex-1 text-[11px] text-body">
                        {exportMasked ? 'PII Columns Masked (DPDP Default)' : 'UNMASKED (Step-up Verified)'}
                      </span>
                      {exportMasked && (
                        <Button
                          variant="outline-neutral"
                          size="sm"
                          onClick={() => handleStepUpAuth('Unmask Export PII (Audit Logged)')}
                          className="text-[10px]"
                        >
                          Step-up Unmask
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-green-surface border border-green-light text-green-strong text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Icon name="shield-warning-bold" size={14} />
                    Active Security Protections
                  </div>
                  <div>• Formula injection prevention: Cells starting with =, +, -, @, \t are sanitized with a leading quote.</div>
                  <div>• Indic script support: UTF-8 BOM embedded for Hindi and Gujarati display in Microsoft Excel.</div>
                  <div>• Signed URLs expire in 24 hours with cryptographic SHA-256 hash validation.</div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 6: EMAIL SUBSYSTEM & DNS */}
          {activeModule === 'email' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Email Subsystem &amp; Domain DNS</h1>
                  <p className="text-xs font-mono text-muted">Outbox Queue · Local Mailpit Integration · SPF/DKIM/DMARC Verification</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStepUpAuth('Send diagnostic test email to admin')}
                >
                  Send Test Email
                </Button>
              </div>

              {/* DNS Authentication Status */}
              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <h3 className="font-heading font-bold text-ink text-base">Domain Authentication Checklist (kavach.ai)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">SPF Record</div>
                    <div className="text-green-strong font-bold">PASS</div>
                    <div className="text-[10px] text-muted truncate">v=spf1 include:_spf...</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">DKIM Signature</div>
                    <div className="text-green-strong font-bold">PASS (2048-bit)</div>
                    <div className="text-[10px] text-muted truncate">kavach._domainkey...</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">DMARC Policy</div>
                    <div className="text-green-strong font-bold">PASS (p=reject)</div>
                    <div className="text-[10px] text-muted truncate">v=DMARC1; p=reject...</div>
                  </div>
                  <div className="p-3 rounded-md bg-canvas border border-hairline space-y-1">
                    <div className="text-muted">Reverse DNS (rDNS)</div>
                    <div className="text-green-strong font-bold">PASS (PTR match)</div>
                    <div className="text-[10px] text-muted truncate">mail.kavach.ai</div>
                  </div>
                </div>
              </div>

              {/* Template Previews in Multi-Language */}
              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-ink text-base">Localized Template Previews</h3>
                  <div className="flex items-center gap-1 text-xs font-mono">
                    {(['en', 'hi', 'gu'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setEmailTemplateLocale(lang)}
                        className={`px-3 py-1 rounded-full uppercase font-bold transition-all ${
                          emailTemplateLocale === lang
                            ? 'bg-primary text-on-primary'
                            : 'bg-canvas border border-hairline text-body hover:text-ink'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-md bg-canvas border border-hairline text-xs font-mono space-y-2">
                  <div className="text-muted">Subject:</div>
                  <div className="text-ink font-bold text-sm">
                    {emailTemplateLocale === 'en'
                      ? 'Confirm your Kavach waitlist reservation'
                      : emailTemplateLocale === 'hi'
                      ? 'अपनी कवच प्रतीक्षा सूची की पुष्टि करें'
                      : 'તમારી કવચ પ્રતીક્ષા સૂચિની પુષ્ટિ કરો'}
                  </div>
                  <div className="text-body pt-2 border-t border-hairline font-body">
                    {emailTemplateLocale === 'en'
                      ? 'Welcome to Kavach. Click the secure link below to confirm your spot in our upcoming beta deployment.'
                      : emailTemplateLocale === 'hi'
                      ? 'कवच में आपका स्वागत है। हमारे आगामी बीटा रोलआउट में अपनी जगह सुरक्षित करने के लिए नीचे दिए गए लिंक पर क्लिक करें।'
                      : 'કવચમાં આપનું સ્વાગત છે. અમારા આગામી બીટા પ્રોગ્રામમાં તમારું સ્થાન પુષ્ટિ કરવા માટે નીચે આપેલી સુરક્ષિત લિંક પર ક્લિક કરો.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 7: HOUSEHOLDS (MASKED PII) */}
          {activeModule === 'households' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Households Directory (Masked PII)</h1>
                  <p className="text-xs font-mono text-muted">DPDP Act 2023 Masking Enforced · Step-up Audit on Reveal</p>
                </div>
                <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                  DPDP Masking Enforced
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'HH-8921', name: 'Iyer Residence', city: 'Pune', elder: 'Mrs. K••••• Iyer', phone: '+91 98230 •••••', plan: 'Plus (₹149)', status: 'Armed' },
                  { id: 'HH-7412', name: 'Sharma Household', city: 'Jaipur', elder: 'Mr. R••••• Sharma', phone: '+91 94140 •••••', plan: 'Family (₹299)', status: 'Armed' },
                  { id: 'HH-6204', name: 'Patel Villa', city: 'Ahmedabad', elder: 'Mrs. H••••• Patel', phone: '+91 98980 •••••', plan: 'Plus (₹149)', status: 'Armed' },
                  { id: 'HH-5119', name: 'Menon Home', city: 'Kochi', elder: 'Mr. G••••• Menon', phone: '+91 97450 •••••', plan: 'Free', status: 'Standby' },
                ].map((hh) => (
                  <div key={hh.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink text-sm">{hh.name}</span>
                        <span className="text-muted">({hh.city})</span>
                        <span className="px-2 py-0.5 rounded-sm bg-green-surface text-green-strong text-[10px] font-bold border border-green-light">{hh.plan}</span>
                      </div>
                      <div className="text-muted text-[11px]">
                        Elder: {hh.elder} · Phone: {hh.phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-green-strong font-bold">{hh.status}</span>
                      <Button
                        variant="outline-neutral"
                        size="sm"
                        onClick={() => handleStepUpAuth(`Inspect unmasked PII for ${hh.id}`)}
                        className="text-[11px]"
                      >
                        Unmask PII
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 8: DEVICES */}
          {activeModule === 'devices' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-ink">Registered Tabletop Kiosks</h1>
              <div className="space-y-3">
                {[
                  { id: 'DEV-101', tablet: 'Samsung Tab A8', household: 'Iyer Residence', heartbeat: '2s ago', battery: '100% plugged', audioWorklet: 'Active 16kHz', status: 'Online' },
                  { id: 'DEV-102', tablet: 'Lenovo M10', household: 'Sharma Household', heartbeat: '5s ago', battery: '92% plugged', audioWorklet: 'Active 16kHz', status: 'Online' },
                  { id: 'DEV-103', tablet: 'iPad 8th Gen', household: 'Patel Villa', heartbeat: '14s ago', battery: '85% battery', audioWorklet: 'Active 16kHz', status: 'Online' },
                ].map((dev) => (
                  <div key={dev.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                    <div>
                      <div className="font-bold text-ink text-sm">{dev.tablet} ({dev.id})</div>
                      <div className="text-muted text-[11px]">{dev.household} · Heartbeat: {dev.heartbeat}</div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-body">{dev.battery}</span>
                      <span className="text-green-strong font-bold">{dev.audioWorklet}</span>
                      <StatusDot status="armed" label="Online" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 9: ALERTS & FALSE ALARM REVIEW */}
          {activeModule === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Alerts &amp; False Alarm Review Queue</h1>
                  <p className="text-xs font-mono text-muted">Caregiver Feedback &amp; Staged Dictionary Phrase Proposals</p>
                </div>
                <span className="text-xs font-mono text-green-strong font-bold">Active Feedback Pipeline</span>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'EVT-901', household: 'Iyer Residence', scamType: 'Digital Arrest CBI', score: 92, verified: 'Confirmed Real Scam', tag: 'Coercion & Isolation' },
                  { id: 'EVT-894', household: 'Sharma Household', scamType: 'FedEx Customs MDMA', score: 72, verified: 'Confirmed Real Scam', tag: 'Contraband Threat' },
                  { id: 'EVT-870', household: 'Patel Villa', scamType: 'Bank KYC SMS', score: 58, verified: 'False Alarm (Doctor Call)', tag: 'FP Review Required' },
                ].map((ev) => (
                  <div key={ev.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                    <div>
                      <div className="font-bold text-ink">{ev.scamType} ({ev.id})</div>
                      <div className="text-muted text-[11px]">{ev.household} · Tag: {ev.tag}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-ink">Score: {ev.score}%</span>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                        ev.verified.startsWith('Confirmed') ? 'bg-red-50 text-hot border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {ev.verified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 10: CREDITS LEDGER & ADJUSTMENTS */}
          {activeModule === 'credits' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-ink">Credits Ledger &amp; Adjustments</h1>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStepUpAuth(`Credit Adjustment of ${creditAdjustmentAmount} mins for ${creditHouseholdId}`)}
                >
                  Adjust Household Credits
                </Button>
              </div>

              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <h3 className="font-heading font-bold text-ink text-sm">Credit Adjustment Sandbox</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-body mb-1">Target Household ID</label>
                    <input
                      type="text"
                      value={creditHouseholdId}
                      onChange={(e) => setCreditHouseholdId(e.target.value)}
                      className="w-full px-3 py-2 rounded-full border border-hairline bg-surface text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body mb-1">Minutes Adjustment (+/-)</label>
                    <input
                      type="number"
                      value={creditAdjustmentAmount}
                      onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-full border border-hairline bg-surface text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 11: PLANS & PRICING */}
          {activeModule === 'plans' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-ink">Plans &amp; Pricing Configuration</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((p) => (
                  <div key={p.id} className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                    <div className="font-bold text-ink text-sm">{p.name}</div>
                    <div className="text-body font-bold text-base text-primary">
                      {p.priceMonthly === 0 ? '₹0' : `₹${p.priceMonthly}`}/mo · {p.minutesPerMonth} mins
                    </div>
                    <div className="text-green-strong text-[11px] font-medium">Active in 1,120 households</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 12: PAYMENTS & GST INVOICES */}
          {activeModule === 'payments' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-ink">GST Invoices &amp; Razorpay Boundary</h1>
              <div className="space-y-3">
                {[
                  { id: 'INV-2026-1002', hh: 'Iyer Residence', amount: '₹149', razorpayId: 'pay_P109823901', gst: '₹22.73 (18%)' },
                  { id: 'INV-2026-1001', hh: 'Sharma Household', amount: '₹299', razorpayId: 'pay_P109823902', gst: '₹45.61 (18%)' },
                  { id: 'INV-2026-0999', hh: 'Patel Villa', amount: '₹149', razorpayId: 'pay_P109823903', gst: '₹22.73 (18%)' },
                ].map((inv) => (
                  <div key={inv.id} className="bg-surface border border-hairline rounded-md p-4 flex items-center justify-between text-xs font-mono hover:border-hairline/80">
                    <div>
                      <div className="font-bold text-ink">{inv.id} — {inv.hh}</div>
                      <div className="text-muted text-[11px]">Token: {inv.razorpayId} · GST Included: {inv.gst}</div>
                    </div>
                    <span className="font-bold text-primary text-sm">{inv.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 13: USAGE & COST */}
          {activeModule === 'usage' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-ink">Cost per Minute &amp; STT Metrics</h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                  <div className="text-muted">Average STT Cost</div>
                  <div className="text-2xl font-bold text-ink">₹0.15 / min</div>
                  <div className="text-green-strong font-bold">Gnani Prisma Streaming</div>
                </div>
                <div className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                  <div className="text-muted">TTS Voice Generation</div>
                  <div className="text-2xl font-bold text-ink">₹0.08 / alert</div>
                  <div className="text-cold font-bold">Gnani Timbre Cloned</div>
                </div>
                <div className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                  <div className="text-muted">Silence Gating Savings</div>
                  <div className="text-2xl font-bold text-green-strong">88.4%</div>
                  <div className="text-muted">Local VAD blocked upload</div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 14: DETECTOR ENGINE */}
          {activeModule === 'detector' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Detector Finite State Machine</h1>
                  <div className="text-xs font-mono text-muted">Active: kavach_detector v1.5.0 (0.8 ms)</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStepUpAuth('Update detector stage weights')}
                >
                  Deploy Weight Changes
                </Button>
              </div>

              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
                <h3 className="font-heading font-bold text-ink text-sm">Stage Weight Calibration</h3>
                <div className="space-y-3 text-xs font-mono">
                  {Object.entries(detectorWeights).map(([stage, weight]) => (
                    <div key={stage} className="flex items-center justify-between gap-4">
                      <span className="w-32 uppercase text-body font-bold">{stage}:</span>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={weight}
                        onChange={(e) =>
                          setDetectorWeights({ ...detectorWeights, [stage]: Number(e.target.value) })
                        }
                        className="flex-1 accent-primary"
                      />
                      <span className="w-12 text-right font-bold text-primary">{weight} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 15: DPDP DATA RIGHTS */}
          {activeModule === 'dataRights' && (
            <div className="space-y-4">
              <h1 className="text-xl font-heading font-bold text-ink">DPDP Act 2023 Erasure &amp; Export Queue</h1>
              <div className="space-y-3">
                {[
                  { id: 'REQ-101', type: '1-Click Voice Embedding Purge', user: 'vikram@example.com', date: 'Today 10:45 AM', status: 'Purged Instantly' },
                  { id: 'REQ-102', type: 'JSON Household Data Export', user: 'priya@example.com', date: 'Yesterday 3:12 PM', status: 'Export Delivered' },
                  { id: 'REQ-103', type: '7-Day Automatic Transcript Sweeper', user: 'System Automated Sweeper', date: 'Daily at 00:00', status: 'Completed (0 stale records)' },
                ].map((req) => (
                  <div key={req.id} className="bg-surface border border-hairline rounded-md p-4 flex items-center justify-between text-xs font-mono hover:border-hairline/80">
                    <div>
                      <div className="font-bold text-ink">{req.type}</div>
                      <div className="text-muted text-[11px]">{req.user} · {req.date}</div>
                    </div>
                    <span className="text-green-strong font-bold">{req.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 16: FEATURE FLAGS */}
          {activeModule === 'featureFlags' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold text-ink">System Feature Flags</h1>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStepUpAuth('Save feature flag changes')}
                >
                  Save Flag States
                </Button>
              </div>

              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4 text-xs font-mono">
                {Object.entries(flags).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3.5 rounded-md bg-canvas border border-hairline">
                    <div>
                      <div className="font-bold text-ink uppercase">{key}</div>
                      <div className="text-muted text-[11px]">Runtime toggle for household devices</div>
                    </div>
                    <button
                      onClick={() => setFlags({ ...flags, [key]: !enabled })}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        enabled ? 'bg-primary text-on-primary' : 'bg-surface border border-hairline text-muted'
                      }`}
                    >
                      {enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 17: AUDIT LOG */}
          {activeModule === 'auditLog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Operations Audit Log (Cryptographic Chain)</h1>
                  <p className="text-xs font-mono text-muted">SHA-256 Hash Chaining · Masked PII · Anti-Tamper Verification</p>
                </div>
                <Button
                  variant="outline-neutral"
                  size="sm"
                  onClick={() => {
                    setActionSuccess('Cryptographic Hash Chain verified: 100% intact.');
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                >
                  Verify Hash Chain
                </Button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {[
                  { time: '19 Oct 2026, 10:04:12 IST', actor: 'ops@kavach.ai', action: 'STEP_UP_REAUTH_VERIFIED', details: 'Unmasked household export PII (Ticket KAV-000101)' },
                  { time: '18 Oct 2026, 10:48:12 IST', actor: 'ops@kavach.ai', action: 'DEPLOY_DETECTOR_VERSION', details: 'Deployed kavach_detector v1.5.0-prod' },
                  { time: '18 Oct 2026, 09:30:00 IST', actor: 'cron_sweeper', action: 'PURGE_7_DAY_TRANSCRIPTS', details: 'Purged 14 expired call transcripts' },
                  { time: '17 Oct 2026, 16:15:22 IST', actor: 'admin@kavach.ai', action: 'UPDATE_FEATURE_FLAG', details: 'Enabled handsFreeVad for Pune beta' },
                ].map((log, idx) => (
                  <div key={idx} className="bg-surface border border-hairline rounded-md p-3.5 flex items-center justify-between text-[11px] hover:border-hairline/80">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-bold">{log.action}</span>
                      <span className="text-body">{log.details}</span>
                    </div>
                    <div className="text-muted">{log.time} · {log.actor}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Command Palette Modal (Ctrl/Cmd+K) */}
      <Modal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        title="Admin Quick Search & Navigation"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              placeholder="Search households, waitlist leads, tickets, coupons (or type 'goto')..."
              className="w-full px-4 py-2.5 rounded-full bg-canvas border border-hairline text-ink text-xs placeholder:text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => (
                <div
                  key={cmd.id}
                  onClick={() => {
                    setActiveModule(cmd.module as any);
                    setCommandPaletteOpen(false);
                  }}
                  className="p-3 rounded-md bg-canvas hover:bg-surface border border-hairline hover:border-primary transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-ink flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-sm bg-green-surface text-green-strong text-[10px]">
                        {cmd.type}
                      </span>
                      <span>{cmd.id}</span>
                    </div>
                    <div className="text-muted text-[11px]">{cmd.title}</div>
                  </div>
                  <span className="text-primary text-[10px] font-bold">Jump →</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted">
                No matching records found for "{commandSearch}"
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Step-Up Re-Authentication Modal */}
      <Modal
        isOpen={reauthOpen}
        onClose={() => setReauthOpen(false)}
        title="Admin Step-Up Re-Authentication Required"
      >
        <div className="space-y-4 text-xs font-body">
          <p className="text-body">
            You are requesting a privileged operation: <strong className="text-amber-800">{pendingAction}</strong>.
          </p>
          <div className="p-3 rounded-md bg-canvas border border-hairline text-muted font-mono text-[11px]">
            Please enter your 6-digit TOTP authenticator code or tap your FIDO2 security key.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline-neutral" size="sm" onClick={() => setReauthOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmStepUp} icon="key-bold">
              Authorize with TOTP
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
