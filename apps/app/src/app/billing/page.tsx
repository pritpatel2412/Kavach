'use client';

import React, { useState } from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Input,
  Modal,
  Icon,
  KavachLogo,
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
    if (couponCode.trim().toUpperCase() === 'KAVACH50') {
      setDiscountPercent(50);
      setCouponStatus('success: KAVACH50 applied! 50% discount for first 3 months.');
    } else {
      setDiscountPercent(0);
      setCouponStatus('error: Invalid coupon code. Try KAVACH50 for beta discount.');
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
    <Frame withHatch={false} className="pb-16 min-h-screen">
      <HatchOverlay />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 sm:px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 focus:outline-none">
            <KavachLogo size={32} showWordmark={true} />
          </a>
          <span className="text-white/20">/</span>
          <span className="text-xs font-heading font-bold text-white/90">Plans &amp; Listening Usage</span>
        </div>

        <Button variant="ghost" size="sm" href="/" icon="arrow-left-linear">
          Dashboard
        </Button>
      </header>

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-8 max-w-5xl mx-auto space-y-10">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Subscription, Usage &amp; Invoices
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-body">
            Manage your household speech-to-text quotas, emergency reserves, and GST billing.
          </p>
        </div>

        {/* Listening Usage Ledger */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-mono text-[#c8f542] uppercase tracking-wider">
                Current Billing Cycle: 01 Oct 2026 – 31 Oct 2026
              </div>
              <h2 className="text-lg font-heading font-bold text-white">Speech-to-Text Listening Quota</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                Active Plan: <strong className="text-[#c8f542]">Plus (₹149/mo)</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="text-xs text-white/50 font-mono">Monthly Used</div>
              <div className="text-2xl font-heading font-bold text-white">74 mins</div>
              <div className="text-[11px] text-white/40">Out of 300 minutes allocated</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#c8f542] h-full" style={{ width: '24.6%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-white/50 font-mono">Today&apos;s Guard Cap</div>
              <div className="text-2xl font-heading font-bold text-white">12 mins</div>
              <div className="text-[11px] text-white/40">18 minutes remaining today (30m cap)</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-400 h-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-white/50 font-mono">Emergency Buffer</div>
              <div className="text-2xl font-heading font-bold text-emerald-300">30 mins</div>
              <div className="text-[11px] text-white/40">Reserved strictly for active scam calls</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-400 h-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Plans Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-white">Available Household Plans</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === selectedPlanId;
              return (
                <GlassCard
                  key={plan.id}
                  className={`p-6 flex flex-col justify-between space-y-6 ${
                    isCurrent ? 'border-[#c8f542] ring-1 ring-[#c8f542]/40' : 'border-white/10'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-white text-lg">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-mono uppercase bg-[#c8f542] text-stone-950 font-bold px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-heading font-bold text-white">
                        {plan.priceMonthly === 0 ? '₹0' : `₹${plan.priceMonthly}`}
                      </span>
                      <span className="text-xs text-white/50">/month</span>
                    </div>

                    <p className="text-xs text-white/60 font-body">{plan.tagline}</p>

                    <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/70">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <span className={feat.included ? 'text-[#c8f542]' : 'text-white/30'}>
                            {feat.included ? '✓' : '✕'}
                          </span>
                          <span className={feat.included ? 'text-white/80' : 'text-white/40'}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={isCurrent ? 'ghost' : 'lime'}
                    size="sm"
                    onClick={() => handleStartPayment(plan.id)}
                    className="w-full justify-center text-xs font-semibold"
                  >
                    {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                  </Button>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Coupon Code Box */}
        <GlassCard className="p-6 space-y-3">
          <h3 className="font-heading font-bold text-white text-sm">Have a Private Beta Coupon?</h3>
          <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              placeholder="e.g. KAVACH50"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-white/18 bg-white/5 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#c8f542] flex-1"
            />
            <Button variant="lime" size="sm" type="submit">
              Apply Code
            </Button>
          </form>
          {couponStatus && (
            <div
              className={`text-xs font-mono ${
                couponStatus.startsWith('success') ? 'text-[#c8f542]' : 'text-[#ff5a4d]'
              }`}
            >
              {couponStatus}
            </div>
          )}
        </GlassCard>

        {/* GST Invoices Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-white">Billing History &amp; GST Invoices</h2>

          <div className="space-y-2">
            {invoices.map((inv) => (
              <GlassCard key={inv.id} className="p-4 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4">
                  <Icon name="notes-bold" size={16} color="#c8f542" />
                  <div>
                    <div className="font-bold text-white">{inv.id}</div>
                    <div className="text-white/40 text-[11px]">{inv.date} · {inv.plan}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">{inv.amount}</span>
                  <span className="text-emerald-300 text-[11px]">{inv.status}</span>
                  <button
                    onClick={() => alert(`Simulated downloading tax invoice: ${inv.id}.pdf`)}
                    className="text-[#c8f542] hover:underline text-[11px] flex items-center gap-1"
                  >
                    <Icon name="download-square-bold" size={14} />
                    <span>PDF</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Razorpay Mock Payment Modal */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Confirm ${currentPlan.name} Subscription`}
        >
          <div className="space-y-4 text-xs font-body">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60">Subscription Tier:</span>
                <span className="font-heading font-bold text-white">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Base Monthly Price:</span>
                <span className="font-mono text-white">
                  {currentPlan.priceMonthly === 0 ? '₹0' : `₹${currentPlan.priceMonthly}`}
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-[#c8f542]">
                  <span>Coupon Discount ({discountPercent}%):</span>
                  <span className="font-mono">-₹74.50</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-white text-sm">
                <span>Total Due Now (GST Included):</span>
                <span className="text-[#c8f542]">
                  {discountPercent > 0 ? '₹74.50' : currentPlan.priceMonthly === 0 ? '₹0' : `₹${currentPlan.priceMonthly}`}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-[11px] font-mono flex items-center gap-2">
              <Icon name="shield-check-bold" size={14} />
              <span>Razorpay Sandbox Simulation · Zero real card charges</span>
            </div>

            {!paymentSuccess ? (
              <Button
                variant="lime"
                size="md"
                disabled={paymentProcessing}
                onClick={handleSimulateRazorpay}
                className="w-full justify-center font-heading font-bold"
              >
                {paymentProcessing ? 'Processing UPI Payment...' : 'Pay via Razorpay Sandbox'}
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-mono font-bold">
                ✓ Payment Authorized! Subscription Updated.
              </div>
            )}
          </div>
        </Modal>
      </main>
    </Frame>
  );
}
