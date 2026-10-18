'use client';

import React, { useState } from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  MagneticButton,
  Input,
  Select,
  Checkbox,
  Accordion,
  Icon,
  KavachLogo,
} from '@kavach/ui';
import {
  PLANS,
  PRICING_CONFIRMED,
  PRICING_FAQS,
  Coupon,
  mockApi,
} from '@kavach/api-contract';

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
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 sm:px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <a href="/" className="flex items-center gap-2.5 focus:outline-none">
          <KavachLogo size={32} showWordmark={true} />
        </a>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs font-heading font-medium tracking-tight text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Icon name="arrow-left-linear" size={14} />
            <span>Back to Home</span>
          </a>

          <MagneticButton strength={0.25}>
            <Button variant="lime" size="sm" href="#waitlist">
              Join Waitlist
            </Button>
          </MagneticButton>
        </div>
      </header>

      <div className="relative z-10 px-6 sm:px-10 lg:px-12 pt-10 space-y-16">
        {/* Title & Proposed Pricing Notice */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          {!PRICING_CONFIRMED && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-300 text-xs font-mono mb-2">
              <Icon name="info-circle-bold" size={14} />
              <span>Pricing preview — proposed plans during private beta</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            Simple, Transparent Elder Care Protection
          </h1>
          <p className="text-sm sm:text-base text-white/60 font-body">
            Every plan includes zero-interception acoustic monitoring, deterministic 5-stage scam detection, and instant family Telegram alerts.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full border border-white/14 bg-white/5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium tracking-tight transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#c8f542] text-[#0a2a12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium tracking-tight flex items-center gap-1.5 transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-[#c8f542] text-[#0a2a12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
                  Save 27%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const rawPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const discount = appliedCoupon ? (rawPrice * appliedCoupon.discountPercent) / 100 : 0;
            const finalPrice = Math.max(0, rawPrice - discount);

            return (
              <GlassCard
                key={plan.id}
                isHighlighted={plan.isPopular}
                withHoverShift={true}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-lg text-white/95">{plan.name}</h3>
                    {plan.isPopular && (
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#c8f542] text-[#0a2a12]">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/60 mb-6 min-h-[32px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-white/95">
                      {plan.currency}{finalPrice}
                    </span>
                    <span className="text-xs text-white/50 font-mono">
                      {plan.priceMonthly === 0 ? '' : billingCycle === 'yearly' ? '/year' : '/month'}
                    </span>
                    {appliedCoupon && discount > 0 && (
                      <span className="ml-2 text-xs text-[#c8f542] line-through font-mono">
                        {plan.currency}{rawPrice}
                      </span>
                    )}
                  </div>

                  {/* Quota Highlights */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/8 mb-6 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-white/80">
                      <span>Listening Quota:</span>
                      <span className="text-[#c8f542] font-semibold">{plan.minutesPerMonth} min/mo</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Emergency Reserve:</span>
                      <span className="text-amber-300 font-semibold">{plan.emergencyReserveMinutes} min</span>
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-2.5 text-xs font-body mb-8">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`shrink-0 mt-0.5 ${f.included ? 'text-[#c8f542]' : 'text-white/20'}`}>
                          <Icon name={f.included ? 'check-circle-bold' : 'close-circle-linear'} size={14} />
                        </span>
                        <span className={f.included ? 'text-white/80' : 'text-white/30 line-through'}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant={plan.isPopular ? 'lime' : 'ghost'}
                  size="md"
                  href="#waitlist"
                  className="w-full"
                >
                  {plan.ctaLabel}
                </Button>
              </GlassCard>
            );
          })}
        </div>

        {/* GST-inclusive Note & Coupon Section */}
        <div className="max-w-2xl mx-auto text-center space-y-6 pt-2">
          <div className="text-xs text-white/50 font-mono">
            * All displayed subscription prices are inclusive of 18% GST. Tax invoices provided for all payments.
          </div>

          {/* Coupon Field */}
          <GlassCard className="p-6 max-w-md mx-auto text-left">
            <div className="text-xs font-heading font-semibold text-white/90 mb-2 flex items-center gap-1.5">
              <Icon name="ticket-sale-bold" size={16} />
              <span>Have a referral or promo code?</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Try KAVACH50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="text-xs uppercase font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon}
              >
                {validatingCoupon ? 'Checking...' : 'Apply'}
              </Button>
            </div>

            {appliedCoupon && (
              <p className="mt-2 text-xs text-[#c8f542] flex items-center gap-1 font-mono">
                <Icon name="check-circle-bold" size={14} />
                <span>{appliedCoupon.message} ({appliedCoupon.discountPercent}% off)</span>
              </p>
            )}

            {couponError && (
              <p className="mt-2 text-xs text-[#ff5a4d] flex items-center gap-1 font-mono">
                <Icon name="danger-circle-bold" size={14} />
                <span>{couponError}</span>
              </p>
            )}
          </GlassCard>
        </div>

        {/* Listening Minute Explainer & Emergency Reserve */}
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 space-y-4">
            <h3 className="font-heading font-semibold text-xl text-white/95 flex items-center gap-2">
              <Icon name="shield-check-bold" size={22} color="#c8f542" />
              <span>How Listening Quotas & the Emergency Reserve Work</span>
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-body leading-relaxed">
              Kavach never streams quiet room audio. Our local browser worklet only uploads speech frames
              when continuous conversation is detected over speakerphone. A typical household taking 2–3 unfamiliar
              courier or delivery calls a week uses fewer than 40 minutes per month.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="font-mono text-xs font-bold text-[#c8f542] mb-1">Silence Gating (Zero Burn)</div>
                <div className="text-xs text-white/60">
                  Room silence and everyday background household TV/noise do not deplete your monthly minutes.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="font-mono text-xs font-bold text-amber-300 mb-1">Emergency Reserve Guarantee</div>
                <div className="text-xs text-white/60">
                  If an active scam call is detected and monthly quota is exhausted, Kavach seamlessly draws from the reserve so protection never drops mid-incident.
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ========================================================================= */}
        {/* WAITLIST FORM SECTION */}
        {/* ========================================================================= */}
        <section id="waitlist" className="max-w-xl mx-auto pt-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white/95">
              Join the Private Beta Waitlist
            </h2>
            <p className="text-xs text-white/60 font-body">
              Early caregivers receive 1 year of free Plus protection and direct access to linguistic engineering updates.
            </p>
          </div>

          <GlassCard isHighlighted={true} className="p-6 sm:p-8">
            {submitSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#c8f542]/20 border border-[#c8f542] text-[#c8f542] flex items-center justify-center mx-auto">
                  <Icon name="check-circle-bold" size={24} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-white/95">
                  You are on the list!
                </h3>
                <p className="text-xs text-white/70 font-body max-w-sm mx-auto">
                  {submitSuccess.message}
                </p>
                <div className="inline-block px-3 py-1 rounded-full border border-white/14 bg-white/5 text-xs font-mono text-[#c8f542]">
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
                  <p className="text-xs text-[#ff5a4d] flex items-center gap-1 font-mono">
                    <Icon name="danger-circle-bold" size={14} />
                    <span>{submitError}</span>
                  </p>
                )}

                <Button
                  variant="lime"
                  size="md"
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4"
                >
                  {submitting ? 'Submitting...' : 'Join Early Protection Beta'}
                </Button>
              </form>
            )}
          </GlassCard>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto space-y-6 pt-8">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-white/95">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-white/60 mt-1">Everything you need to know about Kavach protection and pricing.</p>
          </div>

          <Accordion items={PRICING_FAQS} />
        </section>
      </div>
    </Frame>
  );
}
