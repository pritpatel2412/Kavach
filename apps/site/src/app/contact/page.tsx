'use client';

import React, { useState } from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Input,
  Icon,
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
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader currentPath="/contact" />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="letter-bold" size={14} color="#c8f542" />
            <span>Caregiver Support &amp; Vulnerability Disclosure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            Get in Touch with Our Team
          </h1>

          <p className="text-sm sm:text-base text-white/60 font-body">
            Reach our Bangalore engineering and privacy compliance team for technical questions, partnership inquiries, or vulnerability reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <GlassCard className="p-6 space-y-4">
              <h3 className="font-heading font-bold text-white/95 text-base">Direct Channels</h3>

              <div className="space-y-3 text-xs font-body">
                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">General Support</div>
                  <a href="mailto:support@kavach.ai" className="text-[#c8f542] font-semibold hover:underline">
                    support@kavach.ai
                  </a>
                </div>

                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Security &amp; Vulnerabilities</div>
                  <a href="mailto:security@kavach.ai" className="text-[#c8f542] font-semibold hover:underline">
                    security@kavach.ai
                  </a>
                </div>

                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Grievance Officer (IT Rules)</div>
                  <div className="text-white/80">grievance@kavach.ai</div>
                </div>

                <div>
                  <div className="text-white/40 uppercase font-mono text-[10px]">Headquarters</div>
                  <div className="text-white/70 leading-relaxed">
                    Kavach Security Technologies Pvt. Ltd.<br />
                    Koramangala 4th Block, Bengaluru, Karnataka 560034, India
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-2 border-amber-400/30">
              <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                Support SLA
              </div>
              <p className="text-xs text-white/70 font-body leading-relaxed">
                Critical active-scam false alarm inquiries are handled within 2 hours. General support tickets receive responses within 4 business hours.
              </p>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <GlassCard className="p-6 sm:p-8">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#c8f542]/20 text-[#c8f542] flex items-center justify-center mx-auto">
                    <Icon name="check-circle-bold" size={28} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white">Message Dispatched</h3>
                  <p className="text-xs text-white/60 max-w-sm mx-auto">
                    Thank you for reaching out. A confirmation has been logged and our Bangalore support team will reply to {formData.email}.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading font-bold text-white/95 text-lg">Send an Inquiry</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      placeholder="e.g. Vikram Iyer"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="vikram@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-semibold text-white/90 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/5 text-white/90 text-xs focus:outline-none focus:border-[#c8f542]"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="support" className="bg-stone-900">Household Tablet Setup Support</option>
                      <option value="false-alarm" className="bg-stone-900">False Positive / Alarm Review</option>
                      <option value="security" className="bg-stone-900">Vulnerability Disclosure (security.txt)</option>
                      <option value="press" className="bg-stone-900">Press &amp; Research Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-semibold text-white/90 mb-1.5">
                      Message Details
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe your setup question, error details, or inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/5 text-white/90 text-xs focus:outline-none focus:border-[#c8f542] placeholder:text-white/30"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button variant="lime" size="md" type="submit" icon="send-bold" className="w-full justify-center">
                    Dispatch Message
                  </Button>
                </form>
              )}
            </GlassCard>
          </div>
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
