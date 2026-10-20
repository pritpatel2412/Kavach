'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select } from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

const CATEGORY_OPTIONS = [
  { value: 'scam_emergency', label: '🚨 Active Scam Emergency (Caller on Line)' },
  { value: 'device_listening', label: 'Tabletop Device & Acoustic Listening' },
  { value: 'billing', label: 'Billing, Plans & Invoices' },
  { value: 'account_login', label: 'Account Access & Guardian Magic Link' },
  { value: 'voice_consent', label: 'Voice Cloning, Consent & Deletion' },
  { value: 'privacy_data', label: 'DPDP Privacy & Data Rights Request' },
  { value: 'bug', label: 'Software Bug Report' },
  { value: 'feedback', label: 'Feedback & Feature Request' },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'scam_emergency',
    subject: '',
    message: '',
    hp: '', // Honeypot
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<{
    ticket_number: string;
    portal_url: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.hp) return; // bot detection silently ignored

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
          hp: formData.hp,
          diagnostics: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            platform: typeof navigator !== 'undefined' ? navigator.platform : '',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.message || data.error || 'Failed to submit support ticket.');
      }

      setCreatedTicket({
        ticket_number: data.ticket_number,
        portal_url: data.portal_url,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const portalPath = createdTicket?.portal_url
    ? createdTicket.portal_url.includes('/support/t/')
      ? `/support/t/${createdTicket.portal_url.split('/support/t/')[1]}`
      : createdTicket.portal_url
    : null;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/support" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:chat-round-line-bold" width="16" height="16" />
            <span>Caregiver Support &amp; Incident Desk</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            How Can We Help Protect Your Family?
          </h1>

          <p className="text-lead text-body font-medium">
            Submit a support inquiry or report an incident. Scam emergencies are handled under urgent 1-hour SLA.
          </p>
        </div>

        {/* Success Card */}
        {createdTicket && (
          <div className="bg-surface border border-hairline rounded-md p-8 shadow-sm space-y-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-heading font-bold text-ink">Support Ticket Registered</h2>
              <p className="text-body text-caption font-mono">
                Ticket ID: <span className="text-primary font-bold">{createdTicket.ticket_number}</span>
              </p>
              <p className="text-body text-caption">
                A confirmation email with your secure magic link has been sent to your email address. You can also view and track your ticket right now:
              </p>
            </div>

            {portalPath && (
              <div className="pt-2">
                <Link href={portalPath}>
                  <Button variant="primary" size="lg" className="w-full">
                    Open Your Ticket Portal ↗
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Public Intake Form */}
        {!createdTicket && (
          <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            {error && (
              <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-caption font-medium">
                {error}
              </div>
            )}

            {formData.category === 'scam_emergency' && (
              <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-ink space-y-2">
                <div className="flex items-center gap-2 text-danger font-bold text-caption">
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:danger-triangle-bold" width="18" height="18" />
                  <span>URGENT: Active Call Guidance</span>
                </div>
                <p className="text-caption text-body">
                  If an elder is currently on a suspicious phone or video call demanding bank transfers or threatening arrest:
                  <strong> HANG UP IMMEDIATELY.</strong> Indian law enforcement authorities never conduct arrests or demand money via video calls.
                  Dial the National Cybercrime Helpline at <strong>1930</strong> immediately.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot field */}
              <input
                type="text"
                name="hp"
                value={formData.hp}
                onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-label="Bot Check"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number (Optional)"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Select
                  label="Inquiry Category"
                  options={CATEGORY_OPTIONS}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <Input
                label="Subject"
                placeholder="Brief summary of your inquiry or issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />

              <div className="space-y-1">
                <label className="block text-caption font-bold text-ink">
                  Details / Message
                </label>
                <textarea
                  rows={5}
                  className="w-full rounded-md border border-hairline bg-surface p-3 text-caption text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Please describe the issue or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  minLength={5}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </Button>
            </form>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
