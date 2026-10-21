'use client';

import React, { useState } from 'react';
import { Button, Modal } from '@kavach/ui';

export default function ElderTabletopKioskPage() {
  const [isArmed, setIsArmed] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('hi');
  const [scamAlertActive, setScamAlertActive] = useState(false);
  const [intercomActive, setIntercomActive] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);

  // Translations tailored for Indian seniors (high contrast, large clear type)
  const content = {
    en: {
      statusArmed: 'Kavach is Protecting You',
      statusStandby: 'Protection Paused',
      subArmed: 'Answer any unknown call on Speakerphone. Kavach will speak a warning if it detects a scam.',
      subStandby: 'Tap the green button below to resume scam protection.',
      btnStop: 'Pause Protection',
      btnStart: 'Resume Protection',
      listeningBadge: 'Microphone Listening on Speaker',
      dangerAlertTitle: 'WARNING: SCAM EXTORTION DETECTED!',
      dangerAlertBody: 'Hang up the phone immediately! Do NOT send money! Your family guardian has been alerted.',
      intercomTitle: 'FAMILY GUARDIAN SPEAKING LIVE...',
      intercomBody: 'Your family member is speaking through this tablet speaker.',
      language: 'Language',
      confirmStopTitle: 'Pause Scam Protection?',
      confirmStopBody: 'While protection is paused, Kavach cannot warn you against fake police or CBI extortion calls.',
      confirmStopAction: 'Yes, Pause Protection',
      confirmKeepAction: 'Keep Protecting Me',
    },
    hi: {
      statusArmed: 'कवच आपकी सुरक्षा कर रहा है',
      statusStandby: 'सुरक्षा रुकी हुई है',
      subArmed: 'किसी भी अनजान कॉल को स्पीकरफोन (Speaker) पर रखें। ठगी होने पर यह आवाज़ देकर सावधान करेगा।',
      subStandby: 'सुरक्षा फिर से शुरू करने के लिए नीचे हरा बटन दबाएं।',
      btnStop: 'सुरक्षा रोकें',
      btnStart: 'सुरक्षा शुरू करें',
      listeningBadge: 'माइक्रोफोन सुन रहा है (स्पीकरफोन)',
      dangerAlertTitle: 'सावधान: फर्जी कॉल का खतरा!',
      dangerAlertBody: 'तुरंत फोन काट दें! कोई पैसा न भेजें! आपके परिवार को सूचना भेज दी गई है।',
      intercomTitle: 'परिवार के सदस्य बोल रहे हैं...',
      intercomBody: 'आपके परिवार के सदस्य इस टैबलेट के स्पीकर से सीधे बात कर रहे हैं।',
      language: 'भाषा बदलें',
      confirmStopTitle: 'क्या आप सुरक्षा रोकना चाहते हैं?',
      confirmStopBody: 'सुरक्षा रोकने पर कवच आपको फर्जी पुलिस या बैंक ठगी के कॉल पर सावधान नहीं कर पाएगा।',
      confirmStopAction: 'हाँ, सुरक्षा रोकें',
      confirmKeepAction: 'सुरक्षा चालू रखें',
    },
    gu: {
      statusArmed: 'કવચ તમારી રક્ષા કરી રહ્યું છે',
      statusStandby: 'રક્ષણ થોભાવેલ છે',
      subArmed: 'કોઈપણ અજાણ્યા કોલને સ્પીકર (Speakerphone) પર રાખો. છેતરપિંડી હશે તો આ તમને ચેતવણી આપશે.',
      subStandby: 'રક્ષણ ફરી શરૂ કરવા માટે નીચે લીલું બટન દબાવો.',
      btnStop: 'રક્ષણ રોકો',
      btnStart: 'રક્ષણ શરૂ કરો',
      listeningBadge: 'માઇક્રોફોન સાંભળી રહ્યું છે',
      dangerAlertTitle: 'ચેતવણી: છેતરપિંડીનો કોલ!',
      dangerAlertBody: 'તરત જ ફોન કાપી નાખો! કોઈ પૈસા મોકલશો નહીં! તમારા પરિવારને જાણ કરી છે.',
      intercomTitle: 'પરિવારના સભ્ય બોલી રહ્યા છે...',
      intercomBody: 'તમારા પરિવારના સભ્ય આ ટેબ્લેટના સ્પીકર પરથી સીધી વાત કરી રહ્યા છે.',
      language: 'ભાષા',
      confirmStopTitle: 'શું તમે રક્ષણ રોકવા માંગો છો?',
      confirmStopBody: 'રક્ષણ થોભાવવાથી નકલી પોલીસ કે બેંક છેતરપિંડી દરમિયાન કવચ તમને ચેતવી શકશે નહીં.',
      confirmStopAction: 'હા, રક્ષણ રોકો',
      confirmKeepAction: 'રક્ષણ ચાલુ રાખો',
    },
  }[lang];

  const triggerDemoScamSimulation = () => {
    setScamAlertActive(true);
  };

  const triggerIntercomSimulation = () => {
    setIntercomActive(true);
    setTimeout(() => {
      setIntercomActive(false);
    }, 4500);
  };

  const dismissAlerts = () => {
    setScamAlertActive(false);
    setIntercomActive(false);
  };

  const handleStopClick = () => {
    if (isArmed) {
      setConfirmStopOpen(true);
    } else {
      setIsArmed(true);
    }
  };

  const handleConfirmStop = () => {
    setIsArmed(false);
    setConfirmStopOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-4 sm:p-8 select-none font-sans">
      {/* 1. Top Header: Quiet Language Switcher & Home Tablet Moniker (Full Name Hidden) */}
      <header className="bg-surface border border-hairline rounded-md p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-surface text-green-strong flex items-center justify-center font-bold">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:shield-check-bold" width="30" height="30" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
              KAVACH · કવચ · कवच
            </div>
            {/* Hide full legal name for elder privacy */}
            <div className="text-caption font-medium text-muted">
              Home Tablet · Kamala-ji
            </div>
          </div>
        </div>

        {/* Quiet Language Toggle (Pill buttons >= 48px touch target) */}
        <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-full border border-hairline">
          {(['hi', 'en', 'gu'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`min-h-[48px] px-5 rounded-full font-bold text-ui transition-all ${
                lang === l
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-body hover:text-ink'
              }`}
            >
              {l === 'hi' ? 'हिन्दी' : l === 'gu' ? 'ગુજરાતી' : 'English'}
            </button>
          ))}
        </div>
      </header>

      {/* 2. Main High-Contrast Guidance Screen */}
      <main className="flex-1 flex flex-col justify-center items-center text-center py-6 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
        {/* INTERCOM OVERRIDE BANNER */}
        {intercomActive && (
          <div className="w-full p-8 rounded-md bg-surface border-2 border-risk-calm shadow-level-3 space-y-4">
            <div className="flex items-center justify-center gap-3 text-risk-calm">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:volume-loud-bold" width="48" height="48" />
              <div className="text-3xl sm:text-4xl font-bold text-ink">
                {content.intercomTitle}
              </div>
            </div>
            <div className="text-2xl text-body font-medium">
              {content.intercomBody}
            </div>
          </div>
        )}

        {/* ACTIVE SCAM ESCALATION ALARM (Level 3 High-Contrast Warning, Gentle Pulse, No Bounce) */}
        {scamAlertActive && (
          <div className="w-full p-8 sm:p-12 rounded-md bg-risk-emergency text-white border-2 border-red-900 shadow-level-3 space-y-6">
            <div className="flex items-center justify-center gap-4 text-white">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:siren-bold" width="56" height="56" />
              <div className="text-3xl sm:text-5xl font-bold tracking-tight">
                {content.dangerAlertTitle}
              </div>
            </div>
            <div className="text-2xl font-medium leading-relaxed max-w-2xl mx-auto text-white">
              {content.dangerAlertBody}
            </div>
            <div className="pt-4 flex justify-center">
              <button
                onClick={dismissAlerts}
                className="min-h-[56px] px-8 rounded-full bg-white text-risk-emergency font-bold text-xl hover:bg-canvas transition-colors"
              >
                I have hung up the call (Dismiss)
              </button>
            </div>
          </div>
        )}

        {/* Normal Armed / Standby State (One large message at a time) */}
        {!scamAlertActive && !intercomActive && (
          <div className="bg-surface border border-hairline rounded-md p-8 sm:p-12 space-y-8 w-full shadow-sm">
            {/* Always-visible listening status indicator */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-primary/20 bg-green-surface text-green-strong text-xl font-bold">
              <span className={`w-3.5 h-3.5 rounded-full ${isArmed ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
              <span>{isArmed ? content.listeningBadge : content.statusStandby}</span>
            </div>

            {/* Status Line >= 48px with line-height >= 1.5 for Indic scripts */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-[48px] font-bold text-ink leading-[1.4] tracking-tight">
                {isArmed ? content.statusArmed : content.statusStandby}
              </h1>
              <p className="text-2xl sm:text-[24px] text-body max-w-2xl mx-auto font-medium leading-[1.6]">
                {isArmed ? content.subArmed : content.subStandby}
              </p>
            </div>

            {/* Demoted Stop Button / Primary Resume Button (Touch target >= 56px) */}
            <div className="pt-2 flex justify-center">
              {isArmed ? (
                <button
                  type="button"
                  onClick={handleStopClick}
                  className="min-h-[64px] px-8 rounded-full font-bold text-xl text-body bg-canvas border border-hairline hover:bg-surface hover:text-ink hover:border-body transition-all flex items-center justify-center gap-3"
                  aria-label={content.btnStop}
                >
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:pause-bold" width="24" height="24" />
                  <span>{content.btnStop}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopClick}
                  className="min-h-[72px] px-12 rounded-full font-bold text-2xl text-white bg-primary hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-3"
                  aria-label={content.btnStart}
                >
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:shield-check-bold" width="28" height="28" />
                  <span>{content.btnStart}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Kiosk Status & Test Controls */}
      <footer className="bg-surface border border-hairline rounded-md p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-ink font-bold">Wi-Fi Connected</span>
          </span>
          <span>·</span>
          <span>Battery: 100% (Plugged in)</span>
        </div>

        {/* Demo / Simulation buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerDemoScamSimulation}
            className="px-3.5 py-1.5 rounded-full bg-canvas hover:bg-surface text-ink text-caption font-bold border border-hairline transition-colors"
          >
            [Demo] Simulate Scam Call Alarm
          </button>
          <button
            onClick={triggerIntercomSimulation}
            className="px-3.5 py-1.5 rounded-full bg-risk-calm-surface text-risk-calm text-caption font-bold border border-risk-calm-border transition-colors"
          >
            [Demo] Test Guardian Intercom
          </button>
          <a
            href="/"
            className="px-3.5 py-1.5 rounded-full bg-surface hover:bg-canvas text-body text-caption font-bold border border-hairline transition-colors"
          >
            Exit Kiosk
          </a>
        </div>
      </footer>

      {/* 4. Deliberate 2-Step Confirmation Sheet for Stopping Protection */}
      <Modal
        isOpen={confirmStopOpen}
        onClose={() => setConfirmStopOpen(false)}
        title={content.confirmStopTitle}
        description={content.confirmStopBody}
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-md bg-risk-caution-surface border border-risk-caution-border text-risk-caution font-medium text-caption">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:danger-triangle-bold" width="16" height="16" className="inline mr-1.5" />
            <span>Kavach keeps your elderly family members protected while on speakerphone.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setConfirmStopOpen(false)}
              className="flex-1 min-h-[56px] px-6 rounded-full bg-primary text-white font-bold text-ui hover:bg-primary-hover transition-colors"
            >
              {content.confirmKeepAction}
            </button>
            <button
              onClick={handleConfirmStop}
              className="flex-1 min-h-[56px] px-6 rounded-full bg-surface text-body border border-hairline-dark hover:bg-canvas hover:text-ink font-bold text-ui transition-colors"
            >
              {content.confirmStopAction}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
