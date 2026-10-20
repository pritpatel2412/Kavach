'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Accordion,
  PriceLockup,
  DiscountBadge,
  Badge,
} from '@kavach/ui';
import {
  PLANS,
  PRICING_CONFIRMED,
  PRICING_FAQS,
  Coupon,
  mockApi,
} from '@kavach/api-contract';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Waitlist form state
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'hi' | 'gu'>('en');
  const [formConsent, setFormConsent] = useState(false);
  const [formHoneypot, setFormHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ message: string; position: number } | null>(null);
  const [submitError, setSubmitError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await mockApi.validateCoupon(couponCode);
      if (res.valid) {
        setAppliedCoupon(res);
      } else {
        setCouponError(res.message);
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubmitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConsent) {
      setSubmitError('Please check the consent box to proceed.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          contact: formContact,
          language: formLang,
          consent: formConsent,
          honeypot: formHoneypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitSuccess(data);
    } catch (err: unknown) {
      // @ts-expect-error message
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/pricing" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Title & Proposed Pricing Notice */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          {!PRICING_CONFIRMED && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-warning-surface bg-warning-surface text-warning-text text-caption font-bold">
              <span>Pricing preview — proposed plans during private beta</span>
            </div>
          )}

          <h1 className="text-display font-bold text-ink tracking-tight">
            Simple, Transparent Elder Care Protection
          </h1>
          <p className="text-lead text-body font-medium">
            Every plan includes zero-interception acoustic monitoring, deterministic 5-stage scam detection, and instant family Telegram alerts.
          </p>

          {/* Monthly / Yearly Toggle (Full-round pills per DESIGN.md) */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full border border-hairline bg-surface shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-ui font-bold transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-ink text-surface'
                    : 'text-body hover:text-ink'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-full text-ui font-bold flex items-center gap-1.5 transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-ink text-surface'
                    : 'text-body hover:text-ink'
                }`}
              >
                <span>Yearly</span>
                <DiscountBadge>Save 27%</DiscountBadge>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards (ex-pricing-tier per DESIGN.md) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const rawPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const discount = appliedCoupon ? (rawPrice * appliedCoupon.discountPercent) / 100 : 0;
            const finalPrice = Math.max(0, rawPrice - discount);

            const isFeatured = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`bg-surface border rounded-md p-6 text-ink flex flex-col justify-between transition-shadow hover:shadow-level-2 ${
                  isFeatured ? 'border-primary ring-2 ring-primary/20' : 'border-hairline'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-heading font-bold text-ink">{plan.name}</h3>
                    {isFeatured && (
                      <Badge variant="primary">Most Popular</Badge>
                    )}
                  </div>

                  <p className="text-caption text-body mb-4 min-h-[32px]">{plan.tagline}</p>

                  {/* Price Lockup per DESIGN.md */}
                  <div className="my-4">
                    <PriceLockup
                      price={finalPrice}
                      currency={plan.currency}
                      period={plan.priceMonthly === 0 ? '' : billingCycle === 'yearly' ? '/year' : '/month'}
                      originalPrice={appliedCoupon && discount > 0 ? `${plan.currency}${rawPrice}` : undefined}
                      discount={appliedCoupon && discount > 0 ? `${appliedCoupon.discountPercent}% OFF` : undefined}
                    />
                  </div>

                  {/* Quota Highlights */}
                  <div className="p-3 rounded-md bg-canvas border border-hairline mb-6 space-y-1.5 text-caption font-mono">
                    <div className="flex justify-between text-body">
                      <span>Listening Quota:</span>
                      <span className="text-primary font-bold">{plan.minutesPerMonth} min/mo</span>
                    </div>
                    <div className="flex justify-between text-body">
                      <span>Emergency Reserve:</span>
                      <span className="text-ink font-bold">{plan.emergencyReserveMinutes} min</span>
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-2.5 text-caption font-sans mb-8">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`shrink-0 mt-0.5 ${f.included ? 'text-primary' : 'text-muted'}`}>
                          {/* @ts-expect-error solar icon */}
                          <iconify-icon icon={f.included ? 'solar:check-circle-bold' : 'solar:close-circle-linear'} width="16" height="16" />
                        </span>
                        <span className={f.included ? 'text-ink font-medium' : 'text-muted line-through'}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant={isFeatured ? 'primary' : 'outline-neutral'}
                  size="md"
                  href="#waitlist"
                  className="w-full"
                >
                  {plan.ctaLabel}
                </Button>
              </div>
            );
          })}
        </div>

        {/* GST Notice & Coupon Section */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="text-caption text-body font-mono">
            * All displayed subscription prices are inclusive of 18% GST. Tax invoices provided for all payments.
          </div>

          {/* Coupon Field Card */}
          <div className="bg-surface border border-hairline rounded-md p-6 max-w-md mx-auto text-left shadow-sm">
            <div className="text-ui font-bold text-ink mb-2 flex items-center gap-1.5">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:ticket-sale-bold" width="18" height="18" class="text-primary" />
              <span>Have a referral or promo code?</span>
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="Coupon Code"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="text-caption uppercase font-mono"
              />
              <Button
                variant="outline-green"
                size="md"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon}
              >
                {validatingCoupon ? 'Checking...' : 'Apply'}
              </Button>
            </div>

            {appliedCoupon && (
              <p className="mt-2 text-caption text-primary font-bold flex items-center gap-1 font-mono">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:check-circle-bold" width="16" height="16" />
                <span>{appliedCoupon.message} ({appliedCoupon.discountPercent}% off applied)</span>
              </p>
            )}

            {couponError && (
              <p className="mt-2 text-caption text-hot font-bold flex items-center gap-1 font-mono">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:danger-circle-bold" width="16" height="16" />
                <span>{couponError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Quota Explainer Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface border border-hairline rounded-md p-8 space-y-4">
            <h3 className="text-heading font-bold text-ink flex items-center gap-2">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:shield-check-bold" width="22" height="22" class="text-primary" />
              <span>How Listening Quotas & the Emergency Reserve Work</span>
            </h3>
            <p className="text-body font-medium text-body leading-relaxed">
              Kavach never streams quiet room audio. Our local browser worklet only uploads speech frames
              when continuous conversation is detected over speakerphone. A typical household taking 2–3 unfamiliar
              courier or delivery calls a week uses fewer than 40 minutes per month.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-md bg-canvas border border-hairline">
                <div className="text-ui font-bold text-primary mb-1">Silence Gating (Zero Burn)</div>
                <div className="text-caption text-body">
                  Room silence and everyday background household TV/noise do not deplete your monthly minutes.
                </div>
              </div>
              <div className="p-4 rounded-md bg-canvas border border-hairline">
                <div className="text-ui font-bold text-warm mb-1">Emergency Reserve Guarantee</div>
                <div className="text-caption text-body">
                  If an active scam call is detected and monthly quota is exhausted, Kavach seamlessly draws from the reserve so protection never drops mid-incident.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Form Section */}
        <section id="waitlist" className="max-w-xl mx-auto pt-4 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-heading-lg font-bold text-ink">
              Join the Private Beta Waitlist
            </h2>
            <p className="text-caption text-body">
              Early caregivers receive 1 year of free Plus protection and direct access to linguistic engineering updates.
            </p>
          </div>

          <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 shadow-sm">
            {submitSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-discount-surface text-green-strong flex items-center justify-center mx-auto">
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:check-circle-bold" width="28" height="28" />
                </div>
                <h3 className="text-heading font-bold text-ink">
                  You are on the list!
                </h3>
                <p className="text-body font-medium text-body max-w-sm mx-auto">
                  {submitSuccess.message}
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-canvas border border-hairline text-caption font-bold text-primary">
                  Waitlist Position: #{submitSuccess.position}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitWaitlist} className="space-y-4">
                <Input
                  label="Caregiver Full Name"
                  placeholder="e.g. Rahul Sharma"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />

                <Input
                  label="Mobile Number or Email"
                  placeholder="+91 98765 43210 or name@gmail.com"
                  required
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                />

                <Select
                  label="Elder Preferred Language"
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'hi', label: 'Hindi (हिंदी)' },
                    { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
                  ]}
                  value={formLang}
                  onChange={(e) => setFormLang(e.target.value as 'en' | 'hi' | 'gu')}
                />

                {/* Honeypot field for anti-bot protection */}
                <input
                  type="text"
                  name="kavach_bot_check"
                  aria-label="Bot Check"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formHoneypot}
                  onChange={(e) => setFormHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                />

                <Checkbox
                  label="I consent to receive security alerts and project updates."
                  description="We respect your privacy. No spam. You can unsubscribe at any time."
                  checked={formConsent}
                  onChange={(e) => setFormConsent(e.target.checked)}
                />

                {submitError && (
                  <p className="text-caption text-hot flex items-center gap-1 font-medium">
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:danger-circle-bold" width="16" height="16" />
                    <span>{submitError}</span>
                  </p>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4"
                >
                  {submitting ? 'Submitting...' : 'Join Early Protection Beta'}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto space-y-6 pt-4">
          <div className="text-center">
            <h2 className="text-heading-lg font-bold text-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-caption text-body mt-1">Everything you need to know about Kavach protection and pricing.</p>
          </div>

          <Accordion items={PRICING_FAQS} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
