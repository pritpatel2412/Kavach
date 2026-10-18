'use client';

import React from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Accordion,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function HelpPage() {
  const setupSteps = [
    {
      step: '01',
      title: 'Find a Spare Phone or Tablet',
      desc: 'Any Android (v8+) or iPad device connected to home Wi-Fi and kept on the tabletop plugged into power works perfectly.',
    },
    {
      step: '02',
      title: 'Open Tabletop Mode in Browser',
      desc: 'Navigate to Kavach Tabletop mode. Enter the 6-digit family pairing code from your Guardian app to sync alerts.',
    },
    {
      step: '03',
      title: 'Instruct Elder to Answer on Speaker',
      desc: 'Whenever an unfamiliar number, robocall, or video caller rings, simply press the phone’s Speakerphone button so both parties can hear.',
    },
  ];

  const faqs = [
    {
      id: 'speakerphone-requirement',
      question: 'Why does Kavach require the call to be on speakerphone?',
      answer:
        'Kavach respects telecom privacy laws. We do not tap, intercept, or reroute phone lines at the carrier level. Kavach sits in the room as an acoustic guardian. Speakerphone enables the microphone to hear both the scammer’s voice and the elder’s answers without any software installed on the elder’s personal phone.',
    },
    {
      id: 'family-voice-recording',
      question: 'How do you clone the family voice? Is my voice data secure?',
      answer:
        'During caregiver onboarding, you read a 3-phrase randomized liveness challenge to prove consent. Voice embeddings are generated through Gnani Timbre and stored under cryptographic isolation. We never train public foundation models on your voice. You can delete your voice profile and all cached audio with a single tap in the Guardian App.',
    },
    {
      id: 'poor-internet',
      question: 'What happens if home Wi-Fi disconnects during a call?',
      answer:
        'The tabletop tablet maintains an immediate acoustic fallback. If internet drops, it displays an amber visual banner and warns the elder that active cloud analysis is paused. Pre-rendered emergency warning audio clips remain cached locally in browser storage.',
    },
    {
      id: 'languages-supported',
      question: 'Which Indian languages does Kavach support?',
      answer:
        'Our streaming pipeline supports Hinglish, pure Hindi, and Indian English, with active dialect models for Gujarati and Marathi currently in synthetic testing. The acoustic normalizer handles cross-code switching seamlessly.',
    },
    {
      id: 'elderly-accidental-touches',
      question: 'Can my elderly parents accidentally mess up the settings?',
      answer:
        'Tabletop mode features a locked-down, high-contrast kiosk interface. There are no configuration menus, account settings, or billing options accessible on the tabletop tablet. It features a single giant green "Armed" status button with AAA contrast.',
    },
  ];

  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader currentPath="/help" />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="help-bold" size={14} color="#c8f542" />
            <span>Help Center &amp; Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-white/95">
            How Can We Help You?
          </h1>

          <p className="text-sm sm:text-base text-white/60 font-body">
            Everything you need to pair an old tablet, configure caregiver alerts, and protect your family.
          </p>
        </div>

        {/* Quick Setup 3-Step Guide */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-white/95">
              3-Minute Living Room Setup
            </h2>
            <span className="text-xs font-mono text-[#c8f542]">Zero App Installation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {setupSteps.map((st) => (
              <GlassCard key={st.step} className="p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-[#c8f542]/20 text-[#c8f542] font-mono font-bold text-xs flex items-center justify-center">
                  {st.step}
                </div>
                <h3 className="font-heading font-bold text-white/90 text-sm">{st.title}</h3>
                <p className="text-xs text-white/60 font-body leading-relaxed">{st.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-bold text-white/95">
            Frequently Asked Questions
          </h2>
          <Accordion items={faqs} allowMultiple={false} />
        </div>

        {/* Still need help card */}
        <GlassCard className="p-8 text-center space-y-4 border-[#c8f542]/20">
          <div className="w-12 h-12 rounded-2xl bg-[#c8f542]/10 border border-[#c8f542]/30 text-[#c8f542] flex items-center justify-center mx-auto">
            <Icon name="chat-square-call-bold" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-white/95">
              Have a Specific Household Setup Question?
            </h3>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
              Our engineering team responds to caregiver inquiries within 4 business hours.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="lime" size="sm" href="/contact">
              Contact Caregiver Support
            </Button>
          </div>
        </GlassCard>

        <SiteFooter />
      </main>
    </Frame>
  );
}
