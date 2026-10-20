'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'support', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/contact" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:letter-bold" width="16" height="16" />
            <span>Caregiver Support &amp; Vulnerability Disclosure</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Get in Touch with Our Team
          </h1>

          <p className="text-lead text-body font-medium">
            Reach our Bangalore engineering and privacy compliance team for technical questions, partnership inquiries, or vulnerability reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Direct Channels Column */}
          <div className="space-y-4">
            <div className="bg-surface border border-hairline rounded-md p-6 space-y-4 shadow-sm">
              <h3 className="text-heading font-bold text-ink">Direct Channels</h3>

              <div className="space-y-3 text-caption font-sans">
                <div>
                  <div className="text-muted uppercase font-mono text-micro">General Support</div>
                  <a href="mailto:support@kavach.ai" className="text-primary font-bold hover:underline">
                    support@kavach.ai
                  </a>
                </div>

                <div>
                  <div className="text-muted uppercase font-mono text-micro">Security Vulnerabilities</div>
                  <a href="mailto:security@kavach.ai" className="text-primary font-bold hover:underline">
                    security@kavach.ai
                  </a>
                </div>

                <div>
                  <div className="text-muted uppercase font-mono text-micro">DPDP Grievance Officer</div>
                  <a href="mailto:grievance@kavach.ai" className="text-primary font-bold hover:underline">
                    grievance@kavach.ai
                  </a>
                </div>

                <div>
                  <div className="text-muted uppercase font-mono text-micro">Engineering Lab</div>
                  <div className="text-ink font-medium">Bangalore, Karnataka, India</div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-hairline rounded-md p-6 space-y-2 shadow-sm">
              <div className="text-ui font-bold text-hot flex items-center gap-1.5">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:shield-warning-bold" width="18" height="18" />
                <span>Active Scam Emergency?</span>
              </div>
              <p className="text-caption text-body font-medium leading-relaxed">
                If someone in your family has transferred money in the last 2 hours, immediately dial the Government of India helpline:
              </p>
              <div className="pt-2">
                <a
                  href="tel:1930"
                  className="inline-flex items-center justify-center w-full py-2 rounded-full bg-hot text-white font-bold text-ui shadow-sm"
                >
                  Dial 1930 Helpline
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2">
            <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-discount-surface text-green-strong flex items-center justify-center mx-auto">
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:check-circle-bold" width="28" height="28" />
                  </div>
                  <h3 className="text-heading font-bold text-ink">Message Received</h3>
                  <p className="text-body font-medium text-body max-w-sm mx-auto">
                    Thank you, {formData.name || 'caregiver'}. Our team will respond to {formData.email} within 24 hours.
                  </p>
                  <Button variant="outline-neutral" size="sm" onClick={() => setSubmitted(false)}>
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-heading font-bold text-ink">Send us an Inquiry</h3>

                  <Input
                    label="Your Name"
                    placeholder="e.g. Ananya Rao"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@family.org"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  <div className="w-full text-left font-sans">
                    <label className="block text-ui font-bold text-ink mb-1.5">Subject</label>
                    <select
                      className="w-full bg-surface border border-hairline rounded-md py-2.5 px-3.5 text-body text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="support">Caregiver Technical Support</option>
                      <option value="beta">Private Beta Waitlist Question</option>
                      <option value="security">Vulnerability Disclosure (RFC 9116)</option>
                      <option value="partnership">Healthcare / Elder NGO Partnership</option>
                    </select>
                  </div>

                  <div className="w-full text-left font-sans">
                    <label className="block text-ui font-bold text-ink mb-1.5">Message</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Describe your inquiry, tablet model, or feedback in detail..."
                      className="w-full bg-surface border border-hairline rounded-md p-3.5 text-body text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button variant="primary" size="lg" type="submit" className="w-full">
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
