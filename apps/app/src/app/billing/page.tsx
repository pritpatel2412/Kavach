'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Modal,
  KavachLogo,
  Badge,
} from '@kavach/ui';
import { PLANS } from '@kavach/api-contract';
import { MockBanner } from '../../components/MockBanner';

export default function BillingPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('plus');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponExpanded, setCouponExpanded] = useState(false);

  // Razorpay Mock Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const invoices = [
    { id: 'INV-2026-1002', date: '01 Oct 2026', amount: '₹149', plan: 'Kavach Plus (Monthly)', status: 'Paid via UPI' },
    { id: 'INV-2026-0901', date: '01 Sep 2026', amount: '₹149', plan: 'Kavach Plus (Monthly)', status: 'Paid via UPI' },
  ];

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          plan_id: selectedPlanId === 'free' ? 'plus' : selectedPlanId,
          billing_cycle: 'monthly',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setDiscountPercent(data.discount_paise ? 50 : 20);
          setCouponStatus(`success: ${data.code} applied! ${data.message || 'Discount applied.'}`);
          return;
        } else {
          setDiscountPercent(0);
          setCouponStatus(`error: ${data.message || 'Invalid coupon code.'}`);
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    if (couponCode.trim().toUpperCase() === 'DEMO50') {
      setDiscountPercent(50);
      setCouponStatus('success: DEMO50 applied! 50% discount applied to your next renewal.');
    } else {
      setDiscountPercent(0);
      setCouponStatus('error: Invalid coupon code. Please verify your beta invite code.');
    }
  };

  const handleStartPayment = (planId: string) => {
    setSelectedPlanId(planId);
    setPaymentModalOpen(true);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
  };

  const handleSimulateRazorpay = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentModalOpen(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <MockBanner />

      {/* Header */}
      <header className="bg-surface border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 sticky top-8 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 focus:outline-none">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="text-muted">/</span>
            <span className="text-ui font-bold text-ink">Plans &amp; Listening Usage</span>
          </div>

          <Button variant="outline-neutral" size="sm" href="/">
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-display font-bold text-ink tracking-tight">
            Subscription, Usage &amp; Invoices
          </h1>
          <p className="text-body font-medium text-body">
            Manage your speech-to-text quotas, emergency reserves, and GST billing.
          </p>
        </div>

        {/* Listening Usage Ledger */}
        <Card padding="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
            <div>
              <div className="text-caption text-primary uppercase tracking-wider font-bold">
                Current Billing Cycle: 01 Oct 2026 – 31 Oct 2026
              </div>
              <h2 className="text-heading font-bold text-ink mt-0.5">Speech-to-Text Listening Quota</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-body bg-canvas border border-hairline px-3 py-1 rounded-full font-medium">
                Active Plan: <strong className="text-primary font-bold">Plus (₹149/mo)</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="text-caption text-muted font-bold uppercase tracking-wider text-micro">Monthly Used</div>
              <div className="text-display font-bold text-ink" style={{ fontFeatureSettings: '"tnum"' }}>74m</div>
              <div className="text-caption text-muted">Out of 150 minutes allocated</div>
              <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '49.3%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-caption text-muted font-bold uppercase tracking-wider text-micro">Daily Listening Guard</div>
              <div className="text-display font-bold text-ink" style={{ fontFeatureSettings: '"tnum"' }}>12m</div>
              <div className="text-caption text-muted">18 minutes remaining today (30m cap)</div>
              <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-risk-caution h-full rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-caption text-muted font-bold uppercase tracking-wider text-micro">Emergency Scam Reserve</div>
              <div className="text-display font-bold text-green-strong" style={{ fontFeatureSettings: '"tnum"' }}>30m</div>
              <div className="text-caption text-muted">Reserved strictly for active extortion calls</div>
              <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Plans Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-heading font-bold text-ink">Available Household Plans</h2>
            <span className="text-caption text-muted font-medium">* All prices include 18% GST</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === selectedPlanId;
              const isRecommended = plan.id === 'plus';
              const isDowngrade = plan.id === 'free' && selectedPlanId !== 'free';

              // Determine button variant: primary ONLY for recommended upgrade
              let buttonVariant: 'primary' | 'outline-neutral' = 'outline-neutral';
              if (!isCurrent && isRecommended) {
                buttonVariant = 'primary';
              }

              return (
                <div
                  key={plan.id}
                  className={`bg-surface border rounded-md p-6 flex flex-col justify-between space-y-6 transition-all ${
                    isCurrent
                      ? 'border-primary ring-2 ring-primary/20 shadow-level-2'
                      : isRecommended
                      ? 'border-primary/60 shadow-sm'
                      : 'border-hairline'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-ink text-lead">{plan.name}</h3>
                      {isCurrent ? (
                        <Badge variant="primary">Current Plan</Badge>
                      ) : isRecommended ? (
                        <Badge variant="calm">Recommended</Badge>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-ink" style={{ fontFeatureSettings: '"tnum"' }}>
                          {plan.priceMonthly === 0 ? '₹0' : `₹${plan.priceMonthly}`}
                        </span>
                        <span className="text-caption text-muted font-medium">/ month</span>
                      </div>
                      <span className="text-micro text-muted font-medium">incl. 18% GST (Billed Monthly)</span>
                    </div>

                    <p className="text-caption text-body font-medium">{plan.tagline}</p>

                    <ul className="space-y-2 pt-2 border-t border-hairline text-caption text-body">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <span className={feat.included ? 'text-primary font-bold' : 'text-muted'}>
                            {feat.included ? '✓' : '✕'}
                          </span>
                          <span className={feat.included ? 'text-ink font-medium' : 'text-muted line-through'}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={buttonVariant}
                    size="md"
                    onClick={() => handleStartPayment(plan.id)}
                    className="w-full justify-center"
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : isDowngrade ? 'Switch to Free Tier' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Coupon Field */}
        <div className="bg-surface border border-hairline rounded-md p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setCouponExpanded(!couponExpanded)}
            className="w-full flex items-center justify-between text-ui font-bold text-ink focus:outline-none"
          >
            <div className="flex items-center gap-2">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:ticket-sale-bold" width="18" height="18" className="text-primary" />
              <span>Have a private beta referral or promo coupon?</span>
            </div>
            {/* @ts-expect-error solar icon */}
            <iconify-icon
              icon={couponExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
              width="18"
              height="18"
              className="text-muted"
            />
          </button>

          {couponExpanded && (
            <div className="mt-4 pt-4 border-t border-hairline">
              <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Enter code (e.g. DEMO50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="px-4 py-2 rounded-full border border-hairline bg-surface text-ink text-ui uppercase focus:outline-none focus:border-primary flex-1"
                />
                <Button variant="outline-green" size="md" type="submit">
                  Apply Coupon
                </Button>
              </form>
              {couponStatus && (
                <div
                  className={`mt-2 text-caption font-bold ${
                    couponStatus.startsWith('success') ? 'text-green-strong' : 'text-hot'
                  }`}
                >
                  {couponStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* GST Invoices Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-heading font-bold text-ink">Billing History &amp; GST Invoices</h2>
            <Badge variant="neutral">Sample data</Badge>
          </div>

          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption"
              >
                <div className="flex items-center gap-3">
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:notes-bold" width="18" height="18" className="text-primary" />
                  <div>
                    <div className="font-bold text-ink">
                      <span className="font-mono">{inv.id}</span> · {inv.amount} (incl. GST)
                    </div>
                    <div className="text-muted">{inv.date} · {inv.plan}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="calm">{inv.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => alert(`Downloading GST invoice ${inv.id}`)}>
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Razorpay Mock Checkout Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Secure Checkout · FakeProvider (Test Mode)"
        description="Private beta payment gateway. Zero real money is charged (Test mode)."
      >
        <div className="space-y-4 pt-2 text-caption font-medium">
          <div className="flex items-center justify-between pb-1">
            <span className="text-micro font-bold text-muted uppercase tracking-wider">Gateway Status</span>
            <Badge variant="primary">Test mode</Badge>
          </div>
          <div className="p-4 bg-canvas rounded-md border border-hairline flex justify-between items-center">
            <div>
              <span className="font-bold text-ink block text-ui">Selected Subscription</span>
              <span className="text-muted">Kavach {selectedPlanId.toUpperCase()} Tier</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-ink text-heading block" style={{ fontFeatureSettings: '"tnum"' }}>
                {selectedPlanId === 'free' ? '₹0' : selectedPlanId === 'plus' ? '₹149' : '₹299'}
              </span>
              <span className="text-micro text-muted">Includes 18% GST</span>
            </div>
          </div>

          {paymentSuccess ? (
            <div className="p-4 bg-green-surface rounded-md border border-primary/20 text-center text-green-strong font-bold">
              ✓ Payment verified! Your subscription is active.
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleSimulateRazorpay}
                loading={paymentProcessing}
                className="w-full"
              >
                Simulate Successful UPI Payment
              </Button>
              <Button
                variant="outline-neutral"
                size="md"
                onClick={() => setPaymentModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
