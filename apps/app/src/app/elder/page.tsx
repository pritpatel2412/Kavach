'use client';

import React, { useState } from 'react';
import { Icon, KavachLogo, Badge, Button } from '@kavach/ui';

export default function ElderTabletopKioskPage() {
  const [isArmed, setIsArmed] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('hi');
  const [activeCallSim, setActiveCallSim] = useState(false);
  const [scamAlertActive, setScamAlertActive] = useState(false);
  const [intercomActive, setIntercomActive] = useState(false);

  // Translations tailored for seniors
  const content = {
    en: {
      statusArmed: 'Kavach is Protecting You',
      statusStandby: 'Protection Paused',
      subArmed: 'Answer any unfamiliar call on Speakerphone. Kavach will warn you if it is a scam.',
      subStandby: 'Tap the green button below to re-activate scam protection.',
      btnStop: 'Pause Protection',
      btnStart: 'Start Scam Protection',
      listeningBadge: 'Microphone Listening on Speaker',
      dangerAlertTitle: 'WARNING: SCAM DETECTED!',
      dangerAlertBody: 'Hang up the phone immediately! Do NOT send money! Your daughter has been notified.',
      intercomTitle: 'CAREGIVER SPEAKING LIVE...',
      intercomBody: 'Your daughter Pooja is speaking through this tablet speaker.',
      language: 'Language',
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
      intercomBody: 'आपकी बेटी पूजा इस टैबलेट के स्पीकर से बात कर रही हैं।',
      language: 'भाषा बदलें',
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
      intercomBody: 'તમારી દીકરી પૂજા આ ટેબ્લેટ પરથી વાત કરી રહી છે.',
      language: 'ભાષા',
    },
  }[lang];

  const triggerDemoScamSimulation = () => {
    setActiveCallSim(true);
    setScamAlertActive(false);
    setTimeout(() => {
      setScamAlertActive(true);
    }, 2000);
  };

  const triggerIntercomSimulation = () => {
    setIntercomActive(true);
    setTimeout(() => {
      setIntercomActive(false);
    }, 4500);
  };

  const dismissAlerts = () => {
    setActiveCallSim(false);
    setScamAlertActive(false);
    setIntercomActive(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-4 sm:p-8 select-none font-body">
      {/* Top Header: High-Contrast Info Bar */}
      <header className="bg-surface border border-hairline rounded-md p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-discount-surface text-green-strong flex items-center justify-center font-bold">
            <Icon name="shield-check-bold" size={32} />
          </div>
          <div>
            <div className="text-display font-bold text-ink font-heading leading-tight">
              KAVACH · કવચ · कवच
            </div>
            <div className="text-ui text-muted font-mono">
              Living Room Tablet · Mrs. Kamala Iyer
            </div>
          </div>
        </div>

        {/* Language Selection Buttons (High Contrast Full-Round Pills) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('hi')}
            className={`min-h-[48px] px-5 rounded-full font-bold text-ui border transition-all ${
              lang === 'hi'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface text-body border-hairline hover:bg-canvas'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLang('en')}
            className={`min-h-[48px] px-5 rounded-full font-bold text-ui border transition-all ${
              lang === 'en'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface text-body border-hairline hover:bg-canvas'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('gu')}
            className={`min-h-[48px] px-5 rounded-full font-bold text-ui border transition-all ${
              lang === 'gu'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface text-body border-hairline hover:bg-canvas'
            }`}
          >
            ગુજરાતી
          </button>
        </div>
      </header>

      {/* Main Status Display Area */}
      <main className="flex-1 flex flex-col justify-center items-center text-center py-6 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
        {/* INTERCOM OVERRIDE BANNER */}
        {intercomActive && (
          <div className="w-full p-8 rounded-md bg-surface border-2 border-cold shadow-level-3 animate-pulse space-y-4">
            <div className="flex items-center justify-center gap-3 text-cold">
              <Icon name="volume-loud-bold" size={48} />
              <div className="text-display font-heading font-bold tracking-tight text-ink">
                {content.intercomTitle}
              </div>
            </div>
            <div className="text-lead text-body font-medium">
              {content.intercomBody}
            </div>
          </div>
        )}

        {/* ACTIVE SCAM ESCALATION ALARM (Level 3 Red Banner) */}
        {scamAlertActive && (
          <div className="w-full p-8 sm:p-12 rounded-md bg-surface border-2 border-hot shadow-level-3 animate-bounce space-y-6">
            <div className="flex items-center justify-center gap-4 text-hot">
              <Icon name="shield-warning-bold" size={56} />
              <div className="text-display font-heading font-bold tracking-tight text-ink">
                {content.dangerAlertTitle}
              </div>
            </div>
            <div className="text-lead font-medium text-body leading-relaxed max-w-2xl mx-auto">
              {content.dangerAlertBody}
            </div>
            <div className="pt-4 flex justify-center">
              <button
                onClick={dismissAlerts}
                className="min-h-[56px] px-8 rounded-full bg-hot text-on-primary font-bold text-lead hover:opacity-90 transition-opacity"
              >
                I have hung up the call (Dismiss)
              </button>
            </div>
          </div>
        )}

        {/* Normal Armed / Standby Display */}
        {!scamAlertActive && !intercomActive && (
          <div className="bg-surface border border-hairline rounded-md p-8 sm:p-12 space-y-8 w-full shadow-level-1">
            {/* Always-visible listening status pill */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-primary/20 bg-discount-surface text-green-strong text-lead font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-primary animate-ping" />
              <span>{content.listeningBadge}</span>
            </div>

            {/* Status Title */}
            <div className="space-y-3">
              <h1 className="text-display sm:text-[44px] font-heading font-bold text-ink leading-tight">
                {isArmed ? content.statusArmed : content.statusStandby}
              </h1>
              <p className="text-lead text-body max-w-2xl mx-auto font-medium leading-relaxed">
                {isArmed ? content.subArmed : content.subStandby}
              </p>
            </div>

            {/* Giant Central Button (Exceeds 56px touch target; 120px height for arthritis / tremor friendly tapping) */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setIsArmed(!isArmed)}
                className={`w-full max-w-md min-h-[110px] rounded-full font-bold text-display tracking-wide flex items-center justify-center gap-4 transition-all border active:scale-95 ${
                  isArmed
                    ? 'bg-surface border-hairline text-body hover:border-hot hover:text-hot hover:bg-canvas'
                    : 'bg-primary border-primary text-on-primary hover:bg-green-strong'
                }`}
              >
                <Icon name={isArmed ? 'pause-bold' : 'shield-check-bold'} size={36} />
                <span>{isArmed ? content.btnStop : content.btnStart}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Kiosk Status & Test Simulations */}
      <footer className="bg-surface border border-hairline rounded-md p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-ui text-muted font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-ink font-bold">Wi-Fi: Connected</span>
          </span>
          <span>·</span>
          <span>Battery: 100% (Plugged in)</span>
        </div>

        {/* Demo / Simulation buttons for judge evaluation */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerDemoScamSimulation}
            className="px-3 py-1.5 rounded-full bg-canvas hover:bg-surface text-ink text-caption font-bold border border-hairline transition-colors"
          >
            [Demo] Simulate Scam Call Alarm
          </button>
          <button
            onClick={triggerIntercomSimulation}
            className="px-3 py-1.5 rounded-full bg-cold/10 hover:bg-cold/20 text-cold text-caption font-bold border border-cold/20 transition-colors"
          >
            [Demo] Test Daughter Intercom
          </button>
          <a
            href="/"
            className="px-3 py-1.5 rounded-full bg-surface hover:bg-canvas text-body text-caption font-bold border border-hairline transition-colors"
          >
            Exit Kiosk
          </a>
        </div>
      </footer>
    </div>
  );
}

