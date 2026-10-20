'use client';

import React from 'react';
import {
  Button,
  Accordion,
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
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/help" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            <span>Knowledge Base &amp; Setup Guide</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            How Can We Help You?
          </h1>

          <p className="text-lead text-body font-medium">
            Step-by-step instructions for placing your tabletop tablet and answering scam questions.
          </p>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-heading font-bold text-ink">3-Minute Living Room Setup</h2>
            <p className="text-caption text-body">Everything you need to activate tabletop protection today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {setupSteps.map((stg) => (
              <div key={stg.step} className="bg-surface border border-hairline rounded-md p-6 space-y-3 hover:shadow-level-2 transition-shadow">
                <span className="w-10 h-10 rounded-md bg-canvas border border-hairline text-primary flex items-center justify-center font-bold text-ui">
                  {stg.step}
                </span>
                <h3 className="text-ui font-bold text-ink">{stg.title}</h3>
                <p className="text-caption font-medium text-body leading-relaxed">{stg.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          <h2 className="text-heading font-bold text-ink text-center">Frequently Asked Questions</h2>
          <Accordion items={faqs} />
        </div>

        {/* Contact CTA */}
        <div className="bg-surface border border-hairline rounded-md p-8 text-center space-y-3 shadow-sm">
          <h3 className="text-heading font-bold text-ink">Still have questions?</h3>
          <p className="text-body font-medium text-body max-w-md mx-auto">
            Our caregiver engineering team is available 7 days a week to help configure tablets for elderly parents.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" size="md" href="/contact">
              Contact Caregiver Support
            </Button>
            <Button variant="outline-neutral" size="md" href="/how-it-works">
              Read How It Works
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
