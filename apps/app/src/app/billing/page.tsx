'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  Icon,
  KavachLogo,
  PriceLockup,
  Badge,
} from '@kavach/ui';
import { PLANS } from '@kavach/api-contract';

export default function BillingPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('plus');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Razorpay Mock Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];

  const invoices = [
    { id: 'INV-2026-1002', date: '01 Oct 2026', amount: '₹149', plan: 'Kavach Plus (Monthly)', status: 'Paid via UPI' },
    { id: 'INV-2026-0901', date: '01 Sep 2026', amount: '₹149', plan: 'Kavach Plus (Monthly)', status: 'Paid via UPI' },
  ];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'DEMO50') {
      setDiscountPercent(50);
      setCouponStatus('success: DEMO50 applied! 50% discount for first 3 months.');
    } else {
      setDiscountPercent(0);
      setCouponStatus('error: Invalid coupon code. Please check your beta invite email.');
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
    <div className="min-h-screen bg-canvas text-ink font-body">
      {/* Header */}
      <header className="bg-surface border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 focus:outline-none">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="text-muted">/</span>
            <span className="text-ui font-heading font-bold text-ink">Plans &amp; Listening Usage</span>
          </div>

          <Button variant="outline-neutral" size="sm" href="/" icon="arrow-left-linear">
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-display font-heading font-bold text-ink">
            Subscription, Usage &amp; Invoices
          </h1>
          <p className="text-ui text-body">
            Manage your household speech-to-text quotas, emergency reserves, and GST billing.
          </p>
        </div>

        {/* Listening Usage Ledger */}
        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 shadow-level-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
            <div>
              <div className="text-caption font-mono text-primary uppercase tracking-wider font-bold">
                Current Billing Cycle: 01 Oct 2026 – 31 Oct 2026
              </div>
              <h2 className="text-heading font-heading font-bold text-ink">Speech-to-Text Listening Quota</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption font-mono text-body bg-canvas border border-hairline px-3 py-1 rounded-sm">
                Active Plan: <strong className="text-primary font-bold">Plus (₹149/mo)</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="text-caption text-muted font-mono">Monthly Used</div>
              <div className="text-display font-heading font-bold text-ink">74 mins</div>
              <div className="text-caption text-muted">Out of 300 minutes allocated</div>
              <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '24.6%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-caption text-muted font-mono">Today&apos;s Guard Cap</div>
              <div className="text-display font-heading font-bold text-ink">12 mins</div>
              <div className="text-caption text-muted">18 minutes remaining today (30m cap)</div>
              <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-warm h-full rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-caption text-muted font-mono">Emergency Buffer</div>
              <div className="text-display font-heading font-bold text-green-strong">30 mins</div>
              <div className="text-caption text-muted">Reserved strictly for active scam calls</div>
              <div className="w-full bg-canvas border border-hairline h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="space-y-4">
          <h2 className="text-heading font-heading font-bold text-ink">Available Household Plans</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === selectedPlanId;
              return (
                <div
                  key={plan.id}
                  className={`bg-surface border rounded-md p-6 flex flex-col justify-between space-y-6 transition-all ${
                    isCurrent
                      ? 'border-primary ring-2 ring-primary/20 shadow-level-2'
                      : 'border-hairline hover:shadow-level-2'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-ink text-lead">{plan.name}</h3>
                      {isCurrent && (
                        <Badge variant="primary">Current</Badge>
                      )}
                    </div>

                    <div>
                      <PriceLockup
                        price={plan.priceMonthly === 0 ? '₹0' : `₹${plan.priceMonthly}`}
                        originalPrice={plan.priceMonthly > 0 ? `₹${plan.priceMonthly + 150}` : undefined}
                        discount={plan.priceMonthly > 0 ? '50% OFF' : undefined}
                      />
                      <span className="text-caption text-muted font-mono"> / month (Billed Monthly)</span>
                    </div>

                    <p className="text-caption text-body">{plan.tagline}</p>

                    <ul className="space-y-2 pt-2 border-t border-hairline text-caption text-body">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <span className={feat.included ? 'text-primary font-bold' : 'text-muted'}>
                            {feat.included ? '✓' : '✕'}
                          </span>
                          <span className={feat.included ? 'text-ink' : 'text-muted'}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={isCurrent ? 'outline-neutral' : 'primary'}
                    size="sm"
                    onClick={() => handleStartPayment(plan.id)}
                    className="w-full justify-center"
                  >
                    {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coupon Code Box */}
        <div className="bg-surface border border-hairline rounded-md p-6 space-y-3 shadow-level-1">
          <h3 className="font-heading font-bold text-ink text-ui">Have a Private Beta Coupon?</h3>
          <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              placeholder="e.g. DEMO50"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="px-4 py-2 rounded-full border border-hairline bg-surface text-ink text-ui font-mono uppercase focus:outline-none focus:border-primary flex-1"
            />
            <Button variant="primary" size="sm" type="submit">
              Apply Code
            </Button>
          </form>
          {couponStatus && (
            <div
              className={`text-caption font-mono font-bold ${
                couponStatus.startsWith('success') ? 'text-green-strong' : 'text-hot'
              }`}
            >
              {couponStatus}
            </div>
          )}
        </div>

        {/* GST Invoices Table */}
        <div className="space-y-4">
          <h2 className="text-heading font-heading font-bold text-ink">Billing History &amp; GST Invoices</h2>

          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-surface border border-hairline rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-ui font-mono">
                <div className="flex items-center gap-3">
                  <Icon name="notes-bold" size={16} className="text-primary" />
                  <div>
                    <div className="font-bold text-ink">{inv.id}</div>
                    <div className="text-muted text-caption">{inv.date} · {inv.plan}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-ink">{inv.amount}</span>
                  <Badge variant="primary">{inv.status}</Badge>
                  <button
                    onClick={() => alert(`Simulated downloading tax invoice: ${inv.id}.pdf`)}
                    className="text-primary hover:underline text-caption font-bold flex items-center gap-1"
                  >
                    <Icon name="download-square-bold" size={14} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Razorpay Mock Payment Modal */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Confirm ${currentPlan.name} Subscription`}
        >
          <div className="space-y-4 text-ui font-body">
            <div className="p-4 rounded-md bg-canvas border border-hairline space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Subscription Tier:</span>
                <span className="font-heading font-bold text-ink">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Base Monthly Price:</span>
                <span className="font-mono text-ink">
                  {currentPlan.priceMonthly === 0 ? '₹0' : `₹${currentPlan.priceMonthly}`}
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-strong font-bold">
                  <span>Coupon Discount ({discountPercent}%):</span>
                  <span className="font-mono">-₹74.50</span>
                </div>
              )}
              <div className="flex justify-between border-t border-hairline pt-2 font-bold text-ink text-lead">
                <span>Total Due Now (GST Included):</span>
                <span className="text-primary">
                  {discountPercent > 0 ? '₹74.50' : currentPlan.priceMonthly === 0 ? '₹0' : `₹${currentPlan.priceMonthly}`}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-canvas border border-hairline text-body text-caption font-mono flex items-center gap-2">
              <Icon name="shield-check-bold" size={14} className="text-primary" />
              <span>Razorpay Sandbox Simulation · Zero real card charges</span>
            </div>

            {!paymentSuccess ? (
              <Button
                variant="primary"
                size="md"
                disabled={paymentProcessing}
                onClick={handleSimulateRazorpay}
                className="w-full justify-center font-heading font-bold"
              >
                {paymentProcessing ? 'Processing UPI Payment...' : 'Pay via Razorpay Sandbox'}
              </Button>
            ) : (
              <div className="p-3 rounded-md bg-discount-surface border border-primary/20 text-green-strong text-center font-mono font-bold">
                ✓ Payment Authorized! Subscription Updated.
              </div>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
}

