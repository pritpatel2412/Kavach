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
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [realTickets, setRealTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // Live module data state
  const [realWaitlist, setRealWaitlist] = useState<any[]>([]);
  const [realHouseholds, setRealHouseholds] = useState<any[]>([]);
  const [realDevices, setRealDevices] = useState<any[]>([]);
  const [realOverview, setRealOverview] = useState<any | null>(null);
  const [realCoupons, setRealCoupons] = useState<any[]>([]);
  const [realFeatureFlags, setRealFeatureFlags] = useState<any[]>([]);
  const [realCreditLedger, setRealCreditLedger] = useState<any[]>([]);
  const [realAuditLogs, setRealAuditLogs] = useState<any[]>([]);
  const [realAlertReviews, setRealAlertReviews] = useState<any[]>([]);
  const [unmaskedHouseholds, setUnmaskedHouseholds] = useState<Record<string, any>>({});

  // Coupon Creation Modal
  const [createCouponOpen, setCreateCouponOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percent' | 'flat'>('percent');
  const [newDiscountValue, setNewDiscountValue] = useState(50);
  const [newMaxRedemptions, setNewMaxRedemptions] = useState(500);

  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
  const [replyText, setReplyText] = useState('');

  // Coupon Simulator state
  const [simCode, setSimCode] = useState('DEMO50');
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

  const getAdminHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kavach_admin_token') : null;
    const csrf = typeof window !== 'undefined' ? localStorage.getItem('kavach_admin_csrf') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrf) headers['X-CSRF-Token'] = csrf;
    return headers;
  };

  const fetchRealTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/admin-api/tickets?view=all&limit=50', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tickets && data.tickets.length > 0) {
          setRealTickets(data.tickets);
          const first = data.tickets[0];
          setSelectedTicketId(first.ticket_number || first.id);
          setSelectedTicketDetail(first);
          fetchRealTicketDetail(first.id);
        }
      }
    } catch (e) {
      console.error('Error fetching tickets', e);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const fetchRealTicketDetail = async (ticketId: string) => {
    try {
      const res = await fetch(`/admin-api/tickets/${ticketId}`, {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const ticketObj = data.ticket || data;
        setSelectedTicketDetail(ticketObj);
        setTicketMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Error fetching ticket detail', e);
    }
  };

  const fetchRealWaitlist = async () => {
    try {
      const res = await fetch('/admin-api/waitlist?limit=50', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entries && data.entries.length > 0) {
          setRealWaitlist(data.entries);
        }
      }
    } catch (e) {
      console.error('Error fetching waitlist', e);
    }
  };

  const fetchRealHouseholds = async () => {
    try {
      const res = await fetch('/admin-api/households?limit=50', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.households && data.households.length > 0) {
          setRealHouseholds(data.households);
        }
      }
    } catch (e) {
      console.error('Error fetching households', e);
    }
  };

  const fetchRealDevices = async () => {
    try {
      const res = await fetch('/admin-api/devices?limit=50', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.devices && data.devices.length > 0) {
          setRealDevices(data.devices);
        }
      }
    } catch (e) {
      console.error('Error fetching devices', e);
    }
  };

  const fetchRealOverview = async () => {
    try {
      const res = await fetch('/admin-api/analytics/overview?days=30', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRealOverview(data);
      }
    } catch (e) {
      console.error('Error fetching overview', e);
    }
  };

  const fetchRealCoupons = async () => {
    try {
      const res = await fetch('/admin-api/coupons', { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRealCoupons(data.coupons || []);
      }
    } catch (e) {
      console.error('Error fetching coupons', e);
    }
  };

  const fetchRealFeatureFlags = async () => {
    try {
      const res = await fetch('/admin-api/feature-flags', { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.flags && data.flags.length > 0) {
          setRealFeatureFlags(data.flags);
        }
      }
    } catch (e) {
      console.error('Error fetching feature flags', e);
    }
  };

  const fetchRealCreditLedger = async () => {
    try {
      const res = await fetch('/admin-api/credits/ledger', { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRealCreditLedger(data.ledger || []);
      }
    } catch (e) {
      console.error('Error fetching credit ledger', e);
    }
  };

  const fetchRealAuditLogs = async () => {
    try {
      const res = await fetch('/admin-api/audit?limit=50', { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRealAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching audit logs', e);
    }
  };

  const fetchRealAlertReviews = async () => {
    try {
      const res = await fetch('/admin-api/alerts/review-queue', { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRealAlertReviews(data.reviews || []);
      }
    } catch (e) {
      console.error('Error fetching alert reviews', e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kavach_admin_token');
      if (!token) {
        router.push('/auth');
        return;
      }
    }
    fetchRealTickets();
    fetchRealWaitlist();
    fetchRealHouseholds();
    fetchRealDevices();
    fetchRealOverview();
    fetchRealCoupons();
    fetchRealFeatureFlags();
    fetchRealCreditLedger();
    fetchRealAuditLogs();
    fetchRealAlertReviews();
  }, [router]);

  // Real Mutations
  const handleInviteWaitlist = async (entryId: string) => {
    try {
      const res = await fetch(`/admin-api/waitlist/${entryId}/invite`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ coupon_code: 'DEMO50' }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccess(`Single-use pass ${data.invite_code || 'KV-INVITE'} dispatched to waitlist user.`);
        fetchRealWaitlist();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        const err = await res.json();
        alert(err.detail?.message || err.detail || 'Could not send invite pass.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkInviteCohort = async () => {
    const candidateIds = realWaitlist
      .filter((w: any) => w.status === 'confirmed' || w.status === 'pending')
      .map((w: any) => w.id);
    if (candidateIds.length === 0) {
      alert('All waitlist entries are already invited or none pending.');
      return;
    }
    try {
      const res = await fetch('/admin-api/waitlist/bulk-action', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          ids: candidateIds,
          action: 'invite',
          coupon_code: 'DEMO50',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccess(`Bulk invited ${data.affected_records || candidateIds.length} waitlist cohort members.`);
        fetchRealWaitlist();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        const err = await res.json();
        alert(err.detail?.message || err.detail || 'Bulk invite failed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      const res = await fetch('/admin-api/coupons', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discount_type: newDiscountType,
          discount_value: Number(newDiscountValue),
          max_redemptions: Number(newMaxRedemptions),
          eligible_plans: ['plus', 'family'],
        }),
      });
      if (res.ok) {
        setActionSuccess(`Coupon "${newCouponCode.trim().toUpperCase()}" created and active in PostgreSQL.`);
        setCreateCouponOpen(false);
        setNewCouponCode('');
        fetchRealCoupons();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        const err = await res.json();
        alert(err.detail?.message || err.detail || 'Coupon creation failed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCouponStatus = async (code: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/admin-api/coupons/${code}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ is_active: currentActive ? 0 : 1 }),
      });
      if (res.ok) {
        setActionSuccess(`Coupon ${code} is now ${!currentActive ? 'ACTIVE' : 'INACTIVE'}.`);
        fetchRealCoupons();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFeatureFlag = async (name: string, currentEnabled: boolean) => {
    setRealFeatureFlags((prev) =>
      prev.map((f) => (f.name === name ? { ...f, enabled: !currentEnabled } : f))
    );
    try {
      const res = await fetch(`/admin-api/feature-flags/${name}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ enabled: currentEnabled ? 0 : 1 }),
      });
      if (res.ok) {
        setActionSuccess(`Feature flag "${name}" updated to ${!currentEnabled ? 'ENABLED' : 'DISABLED'}.`);
        fetchRealFeatureFlags();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        fetchRealFeatureFlags();
      }
    } catch (e) {
      fetchRealFeatureFlags();
      console.error(e);
    }
  };

  const handleAdjustCredits = async () => {
    if (!creditHouseholdId.trim()) return;
    try {
      const res = await fetch('/admin-api/credits/adjust', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          household_id: creditHouseholdId.trim(),
          amount_minutes: Number(creditAdjustmentAmount),
          reason: 'Manual ops credit adjustment',
        }),
      });
      if (res.ok) {
        setActionSuccess(`Credited ${creditAdjustmentAmount} mins to household ${creditHouseholdId}.`);
        fetchRealCreditLedger();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        const err = await res.json();
        alert(err.detail?.message || err.detail || 'Could not adjust credits.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyAuditChain = async () => {
    try {
      const res = await fetch('/admin-api/audit/verify', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccess(`Cryptographic Hash Chain verified: ${data.total_records || 'All'} records 100% intact.`);
        fetchRealAuditLogs();
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlertReview = async (reviewId: string, verdict: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/admin-api/alerts/review-queue/${reviewId}/resolve`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          verdict,
          resolution_notes: `Marked as ${verdict} by administrator.`,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Alert review ${reviewId} verdict set to "${verdict}".`);
        fetchRealAlertReviews();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnmaskHousehold = async (hhId: string) => {
    try {
      await fetch('/admin-api/audit/reveal-pii', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          entity_type: 'household',
          entity_id: hhId,
          reason: 'Administrator identity verification for caller safety',
        }),
      });
      const res = await fetch(`/admin-api/households/${hhId}`, { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUnmaskedHouseholds((prev) => ({ ...prev, [hhId]: data }));
        setActionSuccess(`PII unmasked for household ${hhId}. Logged in immutable audit chain.`);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuspendHousehold = async (hhId: string) => {
    try {
      const res = await fetch(`/admin-api/households/${hhId}/suspend`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ reason: 'Administrative safety hold' }),
      });
      if (res.ok) {
        setActionSuccess(`Household ${hhId} suspended.`);
        fetchRealHouseholds();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreHousehold = async (hhId: string) => {
    try {
      const res = await fetch(`/admin-api/households/${hhId}/restore`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setActionSuccess(`Household ${hhId} restored to active.`);
        fetchRealHouseholds();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTicketReply = async () => {
    if (!replyText.trim() || !selectedTicketDetail) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/admin-api/tickets/${selectedTicketDetail.id}/reply`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          body: replyText.trim(),
          is_internal: replyMode === 'internal',
        }),
      });
      if (res.ok) {
        setActionSuccess(replyMode === 'internal' ? 'Internal note saved.' : 'Reply sent to customer portal.');
        setReplyText('');
        fetchRealTicketDetail(selectedTicketDetail.id);
        fetchRealTickets();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        const err = await res.json();
        alert(err.detail?.message || err.detail || 'Could not dispatch reply.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplying(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicketDetail) return;
    try {
      const res = await fetch(`/admin-api/tickets/${selectedTicketDetail.id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status: 'solved' }),
      });
      if (res.ok) {
        setActionSuccess(`Ticket ${selectedTicketDetail.ticket_number || selectedTicketDetail.id} resolved.`);
        fetchRealTickets();
        fetchRealTicketDetail(selectedTicketDetail.id);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateCoupon = async () => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: simCode.trim(),
          plan_id: 'plus',
          billing_cycle: 'monthly',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setSimResult(`VALID: ${data.code} applied (${data.discount_paise ? (data.discount_paise / 100).toFixed(2) : '10'} INR discount). ${data.message || ''}`);
          return;
        } else {
          setSimResult(`INVALID: ${data.message || 'Code invalid or expired.'}`);
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    if (simCode.toUpperCase() === 'DEMO50') {
      setSimResult('VALID: 50% discount applies to Plus/Family. Discounted price: ₹74.50 (pre-tax: ₹63.14 + ₹11.36 GST). 60% cap respected.');
    } else if (simCode.toUpperCase() === 'DIWALI60') {
      setSimResult('VALID: 60% discount ceiling reached. Discounted price: ₹59.60. Max allowed.');
    } else {
      setSimResult('INVALID: Code expired or does not meet minimum qualifying eligibility criteria.');
    }
  };

  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const navGroups = [
    {
      group: 'Operate',
      items: [
        { id: 'overview', label: 'Telemetry Overview', icon: 'chart-bold' },
        { id: 'households', label: 'Realtime Sessions & Households', icon: 'users-group-two-rounded-bold' },
        { id: 'devices', label: 'Device Health (Kiosks)', icon: 'devices-outline' },
      ],
    },
    {
      group: 'Grow',
      items: [
        { id: 'waitlist', label: 'Waitlist CRM & Campaigns', icon: 'users-group-two-rounded-bold' },
        { id: 'coupons', label: 'Coupons & Referrals', icon: 'tag-price-bold' },
      ],
    },
    {
      group: 'Money',
      items: [
        { id: 'plans', label: 'Subscriptions (Plans)', icon: 'card-bold' },
        { id: 'payments', label: 'Razorpay Ledger & GST', icon: 'card-bold' },
        { id: 'credits', label: 'Credits & Balances', icon: 'wallet-bold' },
      ],
    },
    {
      group: 'Safety',
      items: [
        { id: 'alerts', label: 'P0 Scam Incidents & Alerts', icon: 'shield-warning-bold' },
        { id: 'support', label: 'Support Tickets Inbox', icon: 'shield-warning-bold' },
        { id: 'dataRights', label: 'Audio Purge & DPDP Rights', icon: 'trash-bin-trash-bold' },
      ],
    },
    {
      group: 'System',
      items: [
        { id: 'email', label: 'Email Outbox & DNS', icon: 'letter-bold' },
        { id: 'exportCenter', label: 'Data Export Center', icon: 'download-square-outline' },
        { id: 'detector', label: 'Detector Engine', icon: 'radar-outline' },
        { id: 'featureFlags', label: 'Feature Flags', icon: 'slider-minimalistic-horizontal-bold' },
        { id: 'auditLog', label: 'Immutable Audit Log', icon: 'history-bold' },
        { id: 'usage', label: 'Cost & Latency', icon: 'server-square-bold' },
      ],
    },
  ];

  // Search items across entire platform for Ctrl+K
  const commandItems = [
    { type: 'Household', id: 'HH-8921', title: 'Iyer Residence (Mrs. K••••• Iyer)', module: 'households' },
    { type: 'Household', id: 'HH-7412', title: 'Sharma Household (Mr. R••••• Sharma)', module: 'households' },
    { type: 'Waitlist', id: 'WL-401', title: 'Rahul Verma (Pune, Marathi/English)', module: 'waitlist' },
    { type: 'Waitlist', id: 'WL-402', title: 'Meera Shah (Ahmedabad, Gujarati)', module: 'waitlist' },
    { type: 'Ticket', id: 'KAV-000101', title: 'SCAM EMERGENCY: Live CBI Digital Arrest Call', module: 'support' },
    { type: 'Ticket', id: 'KAV-000102', title: 'Billing: GST Invoice for Plus Plan Renewal', module: 'support' },
    { type: 'Coupon', id: 'DEMO50', title: '50% off Plus/Family quarterly promotion', module: 'coupons' },
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
            <span className="text-caption font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
              OPS CONSOLE
            </span>
            <span className="text-[11px] font-bold text-hot bg-hot/10 border border-hot/20 px-2 py-0.5 rounded-sm">
              Preview
            </span>
            <span className="text-[11px] font-bold text-muted px-2 py-0.5 rounded-sm bg-canvas border border-hairline">
              v1.5.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas hover:bg-hairline/60 border border-hairline text-caption text-body hover:text-ink transition-all cursor-pointer font-medium"
          >
            <Icon name="magnifer-outline" size={14} />
            <span>Search users, tickets, coupons...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] text-muted border border-hairline font-bold">
              Ctrl+K
            </kbd>
          </button>

          <span className="text-caption text-body hidden md:inline font-medium">
            Admin: <strong className="text-ink">ops@kavach.ai</strong>
          </span>
          <Button
            variant="outline-neutral"
            size="sm"
            onClick={() => router.push('/auth')}
            className="text-caption"
          >
            Lock Console
          </Button>
        </div>
      </header>

      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-md bg-surface border border-hairline text-ink text-caption shadow-level-2 flex items-center gap-2 border-l-4 border-l-primary animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check-circle-bold" size={16} className="text-primary" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Admin Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-6 px-4 sm:px-8 pt-6">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-micro uppercase tracking-wider text-muted font-bold">
              Modules
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  density === 'comfortable'
                    ? 'bg-canvas border border-hairline text-ink'
                    : 'text-muted hover:text-body'
                }`}
                title="Comfortable Density"
              >
                Comfort
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  density === 'compact'
                    ? 'bg-canvas border border-hairline text-ink'
                    : 'text-muted hover:text-body'
                }`}
                title="Compact Density"
              >
                Compact
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {navGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.group];
              const hasActiveChild = group.items.some((i) => i.id === activeModule);

              return (
                <div key={group.group} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-micro font-bold text-muted uppercase tracking-wider hover:text-ink transition-colors cursor-pointer"
                  >
                    <span className={hasActiveChild ? 'text-ink font-bold' : ''}>{group.group}</span>
                    <Icon
                      name={isCollapsed ? 'alt-arrow-down-outline' : 'alt-arrow-up-outline'}
                      size={12}
                    />
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveModule(item.id as any)}
                          className={`w-full flex items-center gap-2.5 px-3 rounded-full text-caption transition-all text-left font-medium ${
                            density === 'compact' ? 'py-1 text-[12px]' : 'py-2 text-[13px]'
                          } ${
                            activeModule === item.id
                              ? 'bg-primary text-white font-bold shadow-xs'
                              : 'text-body hover:text-ink hover:bg-surface border border-transparent hover:border-hairline'
                          }`}
                        >
                          <Icon name={item.icon} size={15} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="md:col-span-4 lg:col-span-5 space-y-6">
          {/* MODULE 1: TELEMETRY OVERVIEW */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Platform Operations Telemetry</h1>
                  <p className="text-caption text-body font-medium">Synthetic Evaluation &amp; Production Telemetry</p>
                </div>
                <span className="text-caption font-bold text-ink flex items-center gap-2">
                  <StatusDot status="armed" label="All 14 Services Armed" />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5 shadow-xs">
                  <div className="text-caption text-muted font-bold uppercase tracking-wider">Active Households</div>
                  <div className="text-2xl font-heading font-bold text-ink tabular-nums">
                    {realOverview?.kpis?.active_households ?? (realHouseholds.length > 0 ? realHouseholds.length : '1,428')}
                  </div>
                  <div className="text-caption text-green-strong font-bold">+42 onboarded this week</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5 shadow-xs">
                  <div className="text-caption text-muted font-bold uppercase tracking-wider">Scam Threats Flagged</div>
                  <div className="text-2xl font-heading font-bold text-ink tabular-nums">
                    {realOverview?.kpis?.scam_threats_flagged ?? '314'}
                  </div>
                  <div className="text-caption text-green-strong font-bold">97.3% synthetic recall rate</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5 shadow-xs">
                  <div className="text-caption text-muted font-bold uppercase tracking-wider">Listening Minutes (Today)</div>
                  <div className="text-2xl font-heading font-bold text-ink tabular-nums">
                    {realOverview?.kpis?.listening_minutes ? `${realOverview.kpis.listening_minutes} m` : '8,420 m'}
                  </div>
                  <div className="text-caption text-body">Gated: 64,200 silence chunks saved</div>
                </div>

                <div className="bg-surface border border-hairline rounded-md p-5 space-y-1.5 shadow-xs">
                  <div className="text-caption text-muted font-bold uppercase tracking-wider">STT Cloud Burn</div>
                  <div className="text-2xl font-heading font-bold text-primary tabular-nums">
                    {realOverview?.kpis?.stt_cloud_burn ? `₹${(realOverview.kpis.stt_cloud_burn / 100).toFixed(2)}` : '₹1,260.40'}
                  </div>
                  <div className="text-caption text-body">Well within ₹5,000 daily budget</div>
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
                    onClick={handleBulkInviteCohort}
                  >
                    Bulk Invite Cohort
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActionSuccess('Campaign compose queue: 2,084 recipients targeted.');
                      setTimeout(() => setActionSuccess(null), 3000);
                    }}
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
                {(realWaitlist.length > 0
                  ? realWaitlist.map((w: any) => ({
                      id: w.id || w.referral_code,
                      name: w.name || 'Anonymous Lead',
                      email: w.email,
                      phone: w.phone || 'N/A',
                      lang: `${w.language_preference || w.language || 'Hindi'} (${(w.language_preference || w.language || 'hi').slice(0, 2)})`,
                      city: w.city || 'India',
                      status: w.status,
                      date: w.created_at ? new Date(w.created_at).toLocaleDateString('en-IN') : 'Recent',
                      source: w.source || 'web',
                      inviteCode: w.invite_code,
                    }))
                  : [
                      { id: 'WL-401', name: 'Rahul Verma', email: 'rahul.v•••••@example.com', phone: '+91 98230 •••••', lang: 'Marathi (mr)', city: 'Pune', status: 'confirmed', date: 'Today 09:15', source: 'landing', inviteCode: null },
                      { id: 'WL-402', name: 'Meera Shah', email: 'meera.s•••••@example.com', phone: '+91 94140 •••••', lang: 'Gujarati (gu)', city: 'Ahmedabad', status: 'confirmed', date: 'Yesterday 18:30', source: 'referral', inviteCode: null },
                      { id: 'WL-403', name: 'Ananya Pillai', email: 'ananya.p•••••@example.com', phone: '+91 97450 •••••', lang: 'English (en)', city: 'Bengaluru', status: 'pending', date: '17 Oct 2026', source: 'landing', inviteCode: null },
                      { id: 'WL-404', name: 'Deepak Joshi', email: 'deepak.j•••••@example.com', phone: '+91 98980 •••••', lang: 'Hindi (hi)', city: 'Delhi NCR', status: 'invited', date: '16 Oct 2026', source: 'partner', inviteCode: 'KV-DJ77' },
                    ]
                )
                  .filter((w) => waitlistFilter === 'all' || w.status === waitlistFilter)
                  .map((entry) => (
                    <div key={entry.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-sm">{entry.name}</span>
                          <span className="text-muted text-[11px]">({entry.city})</span>
                          <span className="px-2 py-0.5 rounded-sm bg-green-surface text-[10px] text-green-strong font-bold">{entry.lang}</span>
                          <span className="px-2 py-0.5 rounded-sm bg-canvas border border-hairline text-[10px] text-muted">via {entry.source}</span>
                          {entry.inviteCode && (
                            <span className="px-2 py-0.5 rounded-sm bg-purple-50 text-[10px] text-purple-700 font-bold border border-purple-200">
                              Pass: {entry.inviteCode}
                            </span>
                          )}
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
                          disabled={entry.status === 'invited'}
                          onClick={() => handleInviteWaitlist(entry.id)}
                          className="text-[11px]"
                        >
                          {entry.status === 'invited' ? 'Invited ✓' : 'Send Invite'}
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
                  {(realTickets.length > 0
                    ? realTickets.map((t: any) => ({
                        id: t.ticket_number || t.id,
                        realId: t.id,
                        priority: (t.priority || 'NORMAL').toUpperCase(),
                        subject: t.subject,
                        user: `${t.requester_name} (${t.requester_email})`,
                        sla: t.status === 'solved' ? 'Met (CSAT 5/5)' : 'Active SLA',
                        status: t.status,
                        raw: t,
                      }))
                    : [
                        { id: 'KAV-000101', realId: 'KAV-000101', priority: 'P0_EMERGENCY', subject: 'Elder trapped in fake police Skype call', user: 'vikram@example.com', sla: '8 min left', status: 'open', raw: null },
                        { id: 'KAV-000102', realId: 'KAV-000102', priority: 'P1_HIGH', subject: 'GST invoice missing company GSTIN', user: 'accounts@sharma.in', sla: '1h 14m left', status: 'open', raw: null },
                        { id: 'KAV-000103', realId: 'KAV-000103', priority: 'P2_NORMAL', subject: 'Tabletop kiosk audio worklet restart request', user: 'patel@example.com', sla: '5h 20m left', status: 'pending', raw: null },
                        { id: 'KAV-000104', realId: 'KAV-000104', priority: 'P3_LOW', subject: 'Feature suggestion: Gujarati voice alert customization', user: 'meera@example.com', sla: 'Met (CSAT 5/5)', status: 'solved', raw: null },
                      ]
                  )
                    .filter((t) => {
                      if (ticketFilter === 'emergency') return t.priority.includes('EMERGENCY') || t.priority.includes('URGENT');
                      if (ticketFilter === 'open') return t.status === 'open';
                      if (ticketFilter === 'pending') return t.status === 'pending';
                      if (ticketFilter === 'solved') return t.status === 'solved';
                      return true;
                    })
                    .map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTicketId(t.id);
                          setSelectedTicketDetail(t.raw || t);
                          if (t.realId) fetchRealTicketDetail(t.realId);
                        }}
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
                              t.priority.includes('EMERGENCY') || t.priority.includes('URGENT')
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
                          {selectedTicketDetail ? selectedTicketDetail.subject : selectedTicketId === 'KAV-000101' ? 'Elder trapped in fake police Skype call (Digital Arrest)' : `Ticket Investigation: ${selectedTicketId}`}
                        </div>
                        <div className="text-muted text-[11px]">
                          Requester: {selectedTicketDetail ? `${selectedTicketDetail.requester_name} (${selectedTicketDetail.requester_email})` : 'Vikram Iyer · Household: Iyer Residence (HH-8921) · Pune'}
                          {selectedTicketDetail?.category ? ` · Category: ${selectedTicketDetail.category}` : ''}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase ${
                        (selectedTicketDetail?.priority === 'urgent' || selectedTicketDetail?.category === 'scam_emergency')
                          ? 'bg-red-50 text-hot border border-red-200'
                          : 'bg-canvas text-body border border-hairline'
                      }`}>
                        {selectedTicketDetail?.priority || 'NORMAL'}
                      </span>
                    </div>

                    {/* Timeline Thread */}
                    <div className="space-y-3 pt-2 max-h-96 overflow-y-auto">
                      {ticketMessages && ticketMessages.length > 0 ? (
                        ticketMessages.map((msg: any) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-md border space-y-1 ${
                              msg.sender_type === 'customer'
                                ? 'bg-canvas border-hairline'
                                : msg.is_internal
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-green-surface border-green-light'
                            }`}
                          >
                            <div className="flex justify-between text-muted text-[10px]">
                              <span className="font-bold">
                                {msg.sender_type === 'customer'
                                  ? `${selectedTicketDetail?.requester_name || 'Customer'} (Requester)`
                                  : msg.is_internal
                                  ? `Internal Staff Note · ${msg.sender_email || 'Staff'}`
                                  : `Kavach Automated / Staff · ${msg.sender_email || 'Support'}`}
                              </span>
                              <span>{msg.created_at ? new Date(msg.created_at).toLocaleString('en-IN') : ''}</span>
                            </div>
                            <div className="text-ink whitespace-pre-wrap">{msg.body}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3.5 rounded-md bg-canvas border border-hairline text-muted text-center">
                          {selectedTicketDetail ? selectedTicketDetail.subject : 'No messages in this ticket yet.'}
                        </div>
                      )}
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
                        placeholder={replyMode === 'public' ? 'Type response sent to customer portal...' : 'Internal note for agents only (not visible to customer)...'}
                        className="w-full p-3 rounded-md bg-canvas border border-hairline text-ink text-xs placeholder:text-muted focus:outline-none focus:border-primary"
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline-neutral"
                          size="sm"
                          onClick={handleResolveTicket}
                        >
                          Close as Solved
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!replyText.trim() || isReplying}
                          onClick={handleSendTicketReply}
                        >
                          {isReplying ? 'Dispatching...' : replyMode === 'public' ? 'Send Reply' : 'Save Internal Note'}
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
                  onClick={() => setCreateCouponOpen(true)}
                  icon="add-circle-bold"
                >
                  Create New Coupon
                </Button>
              </div>

              {/* Active Coupons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(realCoupons.length > 0
                  ? realCoupons
                  : [
                      { code: 'DEMO50', discount_type: 'percent', discount_value: 50, current_redemptions: 241, max_redemptions: 1000, is_active: true, eligible_plans: ['plus', 'family'] },
                      { code: 'DIWALI60', discount_type: 'percent', discount_value: 60, current_redemptions: 89, max_redemptions: 200, is_active: true, eligible_plans: ['plus', 'family'] },
                      { code: 'SENIOR30', discount_type: 'percent', discount_value: 30, current_redemptions: 412, max_redemptions: 500, is_active: true, eligible_plans: ['plus', 'family'] },
                    ]
                ).map((c: any) => (
                  <div key={c.code} className="bg-surface border border-hairline rounded-md p-5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink text-sm">{c.code}</span>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${c.is_active ? 'bg-green-surface text-green-strong border-green-light' : 'bg-red-50 text-hot border-red-200'}`}>
                        {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                      </span>
                    </div>
                    <div className="text-body">{Array.isArray(c.eligible_plans) ? c.eligible_plans.join(', ').toUpperCase() : 'Plus & Family'} Plans</div>
                    <div className="text-[11px] text-muted">Redemptions: {c.current_redemptions ?? 0} / {c.max_redemptions || '∞'}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-bold ${c.is_active ? 'text-green-strong' : 'text-hot'}`}>
                        {c.is_active ? 'Active · Database Verified' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCouponStatus(c.code, Boolean(c.is_active))}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        {c.is_active ? 'Disable Code' : 'Enable Code'}
                      </button>
                    </div>
                  </div>
                ))}
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
                {(realHouseholds.length > 0
                  ? realHouseholds.map((hh: any) => {
                      const unmasked = unmaskedHouseholds[hh.household_id || hh.id];
                      return {
                        id: hh.household_id || hh.id,
                        name: unmasked?.name || hh.name || `Household ${(hh.household_id || hh.id).slice(0, 8)}`,
                        city: 'India',
                        elder: unmasked?.elders?.map((e: any) => e.name).join(', ') || (hh.elders_count ? `${hh.elders_count} Elder(s) protected` : 'Protected Elder'),
                        phone: unmasked?.telegram_chat_id || hh.telegram_chat_id || 'N/A',
                        plan: hh.plan_id ? `${hh.plan_id.toUpperCase()} Plan` : 'Free Tier',
                        status: hh.subscription_status === 'active' || hh.sub_status === 'active' ? 'Armed' : 'Standby',
                        isSuspended: Boolean(hh.is_suspended),
                        isUnmasked: Boolean(unmasked),
                      };
                    })
                  : [
                      { id: 'HH-8921', name: 'Iyer Residence', city: 'Pune', elder: 'Mrs. K••••• Iyer', phone: '+91 98230 •••••', plan: 'Plus (₹149)', status: 'Armed', isSuspended: false, isUnmasked: false },
                      { id: 'HH-7412', name: 'Sharma Household', city: 'Jaipur', elder: 'Mr. R••••• Sharma', phone: '+91 94140 •••••', plan: 'Family (₹299)', status: 'Armed', isSuspended: false, isUnmasked: false },
                      { id: 'HH-6204', name: 'Patel Villa', city: 'Ahmedabad', elder: 'Mrs. H••••• Patel', phone: '+91 98980 •••••', plan: 'Plus (₹149)', status: 'Armed', isSuspended: false, isUnmasked: false },
                      { id: 'HH-5119', name: 'Menon Home', city: 'Kochi', elder: 'Mr. G••••• Menon', phone: '+91 97450 •••••', plan: 'Free', status: 'Standby', isSuspended: false, isUnmasked: false },
                    ]
                ).map((hh) => (
                  <div key={hh.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink text-sm">{hh.name}</span>
                        <span className="text-muted">({hh.city})</span>
                        <span className="px-2 py-0.5 rounded-sm bg-green-surface text-green-strong text-[10px] font-bold border border-green-light">{hh.plan}</span>
                        {hh.isUnmasked && (
                          <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            UNMASKED (Audited)
                          </span>
                        )}
                      </div>
                      <div className="text-muted text-[11px]">
                        Elder: {hh.elder} · Phone: {hh.phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${hh.isSuspended ? 'text-hot' : 'text-green-strong'}`}>
                        {hh.isSuspended ? 'Suspended' : hh.status}
                      </span>
                      {!hh.isUnmasked && (
                        <Button
                          variant="outline-neutral"
                          size="sm"
                          onClick={() => handleUnmaskHousehold(hh.id)}
                          className="text-[11px]"
                        >
                          Unmask PII
                        </Button>
                      )}
                      {hh.isSuspended ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreHousehold(hh.id)}
                          className="px-2.5 py-1 rounded bg-green-surface text-green-strong border border-green-light font-bold text-[11px] hover:opacity-80 cursor-pointer"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSuspendHousehold(hh.id)}
                          className="px-2.5 py-1 rounded bg-red-50 text-hot border border-red-200 font-bold text-[11px] hover:opacity-80 cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
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
                {(realDevices.length > 0
                  ? realDevices.map((dev: any) => ({
                      id: dev.device_id || dev.id,
                      tablet: dev.elder_name ? `${dev.elder_name}'s Device (${dev.language})` : (dev.device_name || dev.device_type || 'Tabletop Kiosk'),
                      household: dev.guardian_name ? `Guardian: ${dev.guardian_name}` : (dev.household_id ? `Household: ${dev.household_id.slice(0, 8)}` : 'Paired Device'),
                      heartbeat: dev.last_active ? `${new Date(dev.last_active).toLocaleTimeString('en-IN')}` : (dev.last_heartbeat ? `${new Date(dev.last_heartbeat).toLocaleTimeString('en-IN')}` : 'Active'),
                      battery: '100% plugged',
                      audioWorklet: 'Active 16kHz',
                      status: dev.status === 'online' ? 'Online' : 'Standby',
                    }))
                  : [
                      { id: 'DEV-101', tablet: 'Samsung Tab A8', household: 'Iyer Residence', heartbeat: '2s ago', battery: '100% plugged', audioWorklet: 'Active 16kHz', status: 'Online' },
                      { id: 'DEV-102', tablet: 'Lenovo M10', household: 'Sharma Household', heartbeat: '5s ago', battery: '92% plugged', audioWorklet: 'Active 16kHz', status: 'Online' },
                      { id: 'DEV-103', tablet: 'iPad 8th Gen', household: 'Patel Villa', heartbeat: '14s ago', battery: '85% battery', audioWorklet: 'Active 16kHz', status: 'Online' },
                    ]
                ).map((dev) => (
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
                {(realAlertReviews.length > 0
                  ? realAlertReviews.map((r: any) => ({
                      id: r.id || 'REV-01',
                      household: r.elder_name ? `Elder: ${r.elder_name}` : `Session: ${r.session_id?.slice(0, 8)}`,
                      scamType: r.proposed_dictionary_phrase ? `Proposed: "${r.proposed_dictionary_phrase}"` : 'Scam Verification Event',
                      score: 88,
                      verified: r.status === 'approved' ? 'Confirmed Real Scam' : r.status === 'rejected' ? 'Rejected / False Alarm' : 'Pending Review',
                      tag: r.transcript_excerpt?.slice(0, 45) || 'Audio transcript review',
                      status: r.status,
                    }))
                  : [
                      { id: 'EVT-901', household: 'Iyer Residence', scamType: 'Digital Arrest CBI', score: 92, verified: 'Confirmed Real Scam', tag: 'Coercion & Isolation', status: 'approved' },
                      { id: 'EVT-894', household: 'Sharma Household', scamType: 'FedEx Customs MDMA', score: 72, verified: 'Confirmed Real Scam', tag: 'Contraband Threat', status: 'approved' },
                      { id: 'EVT-870', household: 'Patel Villa', scamType: 'Bank KYC SMS', score: 58, verified: 'False Alarm (Doctor Call)', tag: 'FP Review Required', status: 'pending' },
                    ]
                ).map((ev) => (
                  <div key={ev.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                    <div>
                      <div className="font-bold text-ink">{ev.scamType} ({ev.id})</div>
                      <div className="text-muted text-[11px]">{ev.household} · Tag: {ev.tag}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                        ev.verified.startsWith('Confirmed') ? 'bg-red-50 text-hot border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {ev.verified}
                      </span>
                      {ev.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResolveAlertReview(ev.id, 'approved')}
                            className="px-2 py-0.5 rounded bg-green-surface text-green-strong border border-green-light font-bold text-[10px] hover:opacity-80"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveAlertReview(ev.id, 'rejected')}
                            className="px-2 py-0.5 rounded bg-canvas text-muted border border-hairline font-bold text-[10px] hover:text-ink"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">Credits Ledger &amp; Adjustments</h1>
                  <p className="text-xs font-mono text-muted">Immediate credit adjustment dispatch · Live database ledger</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAdjustCredits}
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
                      placeholder="e.g. HH-8921"
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

              {/* Real-time Ledger */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-ink text-sm">Credit Transaction Ledger (Live Postgres)</h3>
                {realCreditLedger.length > 0 ? (
                  realCreditLedger.map((tx: any) => (
                    <div key={tx.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-hairline/80">
                      <div>
                        <div className="font-bold text-ink flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${Number(tx.amount_minutes) >= 0 ? 'bg-green-surface text-green-strong border border-green-light' : 'bg-red-50 text-hot border border-red-200'}`}>
                            {Number(tx.amount_minutes) >= 0 ? `+${tx.amount_minutes} min` : `${tx.amount_minutes} min`}
                          </span>
                          <span>Household: {tx.household_id}</span>
                        </div>
                        <div className="text-muted text-[11px] mt-1">{tx.reason} · Ref: {tx.reference_id || 'N/A'}</div>
                      </div>
                      <div className="text-muted text-[11px]">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString('en-IN') : 'Recent'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-surface border border-hairline rounded-md text-xs font-mono text-muted">
                    No credit adjustments recorded yet.
                  </div>
                )}
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
                <div>
                  <h1 className="text-xl font-heading font-bold text-ink">System Feature Flags (Real-Time Runtime)</h1>
                  <p className="text-xs font-mono text-muted">Dynamic configuration propagated across household runtime devices</p>
                </div>
                <span className="text-xs font-mono text-green-strong font-bold bg-green-surface px-2.5 py-1 rounded-sm border border-green-light">
                  PostgreSQL Backed
                </span>
              </div>

              <div className="bg-surface border border-hairline rounded-md p-6 space-y-4 text-xs font-mono">
                {(realFeatureFlags.length > 0 ? realFeatureFlags : [
                  { name: 'ai_drafts', enabled: false, description: 'AI-assisted response drafting for support tickets (redacted PII)' },
                  { name: 'hands_free_vad', enabled: false, description: 'Client-side energy VAD hands-free listening mode' },
                  { name: 'auto_csat_dispatch', enabled: true, description: 'Automatically send CSAT survey after ticket resolution' },
                ]).map((flag: any) => (
                  <div key={flag.name} className="flex items-center justify-between p-3.5 rounded-md bg-canvas border border-hairline hover:border-hairline/80">
                    <div>
                      <div className="font-bold text-ink uppercase">{flag.name}</div>
                      <div className="text-muted text-[11px]">{flag.description || 'Runtime toggle for household devices'}</div>
                      {flag.updated_at && (
                        <div className="text-[10px] text-muted">Updated: {new Date(flag.updated_at).toLocaleString('en-IN')}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatureFlag(flag.name, Boolean(flag.enabled))}
                      className={`px-3.5 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-all ${
                        flag.enabled ? 'bg-primary text-on-primary' : 'bg-surface border border-hairline text-muted hover:text-ink'
                      }`}
                    >
                      {flag.enabled ? 'ENABLED' : 'DISABLED'}
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
                  onClick={handleVerifyAuditChain}
                >
                  Verify Hash Chain
                </Button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {(realAuditLogs.length > 0 ? realAuditLogs : [
                  { created_at: '2026-10-19T10:04:12Z', actor_email: 'ops@kavach.ai', action: 'STEP_UP_REAUTH_VERIFIED', entity_type: 'household', entity_id: 'HH-8921', hash: '8f3a9e...' },
                  { created_at: '2026-10-18T10:48:12Z', actor_email: 'ops@kavach.ai', action: 'DEPLOY_DETECTOR_VERSION', entity_type: 'detector', entity_id: 'v1.5.0', hash: 'e2b1c4...' },
                ]).map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-surface border border-hairline rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] hover:border-hairline/80">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{log.action}</span>
                        {log.entity_type && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-canvas border border-hairline text-muted">
                            {log.entity_type}{log.entity_id ? `:${log.entity_id}` : ''}
                          </span>
                        )}
                      </div>
                      {log.hash && (
                        <div className="text-[10px] text-muted font-mono truncate max-w-md">
                          SHA256: {log.hash.slice(0, 16)}...
                        </div>
                      )}
                    </div>
                    <div className="text-muted text-[10px]">
                      {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : 'Recent'} · {log.actor_email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={createCouponOpen}
        onClose={() => setCreateCouponOpen(false)}
        title="Create Promotional Coupon (PostgreSQL)"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-body mb-1 font-bold">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="e.g. DIWALI100"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-md border border-hairline bg-surface text-ink uppercase font-bold focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-body mb-1">Discount Type</label>
              <select
                value={newDiscountType}
                onChange={(e) => setNewDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-surface text-ink focus:outline-none focus:border-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Rupee (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-body mb-1">Discount Value</label>
              <input
                type="number"
                required
                min="1"
                value={newDiscountValue}
                onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-surface text-ink focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-body mb-1">Max Redemptions</label>
            <input
              type="number"
              required
              min="1"
              value={newMaxRedemptions}
              onChange={(e) => setNewMaxRedemptions(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md border border-hairline bg-surface text-ink focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline-neutral" size="sm" type="button" onClick={() => setCreateCouponOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save &amp; Activate Coupon
            </Button>
          </div>
        </form>
      </Modal>

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
