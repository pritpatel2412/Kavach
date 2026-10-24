'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal } from '@kavach/ui';

export default function ElderTabletopKioskPage() {
  const [isArmed, setIsArmed] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('hi');
  const [scamAlertActive, setScamAlertActive] = useState(false);
  const [intercomActive, setIntercomActive] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);

  // Pairing & Real Device State
  const [isPaired, setIsPaired] = useState<boolean | null>(null); // null = checking
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [deviceLabelInput, setDeviceLabelInput] = useState('Living Room Tablet');
  const [elderConsentChecked, setElderConsentChecked] = useState(false);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState<string | null>(null);

  // Device Info
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [elderName, setElderName] = useState<string>('Kamala-ji');
  const [deviceLabel, setDeviceLabel] = useState<string>('Home Tablet');
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<string>('Live');

  const heartbeatIntervalRef = useRef<any>(null);

  // Translations tailored for Indian seniors (high contrast, large clear type)
  const content = {
    en: {
      setupTitle: 'Activate Kavach Tabletop Protection',
      setupSubtitle: 'Enter the 6-character Pairing Code generated on your family guardian\'s phone app.',
      codeLabel: 'Pairing Code',
      codePlaceholder: 'e.g. ABC942',
      labelTitle: 'Device Location / Label',
      labelPlaceholder: 'e.g. Living Room Tablet',
      consentTitle: 'Explicit Elder Consent (DPDP Act 2023)',
      consentNotice: 'I agree to let Kavach passively listen when a phone call is placed on speakerphone. Audio is analyzed in real time to alert me against fake police or extortion calls and is NEVER stored permanently (Notice 2026-10-elder-v1).',
      btnActivate: 'Connect & Activate Protection',
      demoBypass: 'Simulate Demo Mode (No Code Needed)',
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
      deviceSettingsTitle: 'Tabletop Device Information',
      unpairBtn: 'Unpair & Reset Device',
    },
    hi: {
      setupTitle: 'कवच टैबलेट सुरक्षा सेटअप',
      setupSubtitle: 'सुरक्षा चालू करने के लिए अपने परिवार (Guardian) के मोबाइल ऐप पर बना 6-अक्षरों का कोड दर्ज करें।',
      codeLabel: 'पेयरिंग कोड (Pairing Code)',
      codePlaceholder: 'उदा. ABC942',
      labelTitle: 'टैबलेट का स्थान / नाम',
      labelPlaceholder: 'उदा. लिविंग रूम टैबलेट',
      consentTitle: 'वरिष्ठ नागरिक सहमति (DPDP Act 2023)',
      consentNotice: 'मैं सहमति देता/देती हूँ कि फोन को स्पीकरफोन (Speaker) पर रखने पर कवच मुझे ठगी और फर्जी पुलिस कॉल्स से बचाने के लिए बात सुने। यह आवाज़ कभी भी रिकॉर्ड या सुरक्षित नहीं की जाएगी (Notice 2026-10-elder-v1)।',
      btnActivate: 'सुरक्षा कनेक्ट और सक्रिय करें',
      demoBypass: 'डेमो मोड में देखें (बिना कोड के)',
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
      deviceSettingsTitle: 'टैबलेट डिवाइस जानकारी',
      unpairBtn: 'डिवाइस अनपेयर और रीसेट करें',
    },
    gu: {
      setupTitle: 'કવચ ટેબ્લેટ સુરક્ષા સેટઅપ',
      setupSubtitle: 'સુરક્ષા શરૂ કરવા માટે તમારા પરિવારની મોબાઇલ એપમાંથી 6-અક્ષરનો કોડ અહીં લખો.',
      codeLabel: 'પેરિંગ કોડ (Pairing Code)',
      codePlaceholder: 'દા.ત. ABC942',
      labelTitle: 'ટેબ્લેટનું સ્થાન / નામ',
      labelPlaceholder: 'દા.ત. લિવિંગ રૂમ ટેબ્લેટ',
      consentTitle: 'વડીલ સંમતિ (DPDP Act 2023)',
      consentNotice: 'હું સંમતિ આપું છું કે સ્પીકરફોન પર કોલ આવવા પર કવચ મને છેતરપિંડીથી બચાવવા માટે સાંભળે. આ ઓડિયો ક્યારેય સેવ થશે નહીં (Notice 2026-10-elder-v1).',
      btnActivate: 'કનેક્ટ કરો અને સુરક્ષા શરૂ કરો',
      demoBypass: 'ડેમો મોડ (કોડ વગર જુઓ)',
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
      deviceSettingsTitle: 'ટેબ્લેટ માહિતી',
      unpairBtn: 'ડિવાઇસ અનપેર કરો',
    },
  }[lang];

  // Check existing device pairing state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const isDemoParam = urlParams.get('demo') === '1' || urlParams.get('sandbox') === '1' || urlParams.get('mock') === '1';

    const storedToken = localStorage.getItem('kavach_device_token');
    const storedId = localStorage.getItem('kavach_device_id');
    const storedElder = localStorage.getItem('kavach_elder_name');
    const storedLabel = localStorage.getItem('kavach_device_label');

    if (storedToken && storedId) {
      setDeviceId(storedId);
      setDeviceToken(storedToken);
      if (storedElder) setElderName(storedElder);
      if (storedLabel) setDeviceLabel(storedLabel);
      setIsPaired(true);
    } else if (isDemoParam) {
      // In demo param mode, auto-arm with demo mock device
      setDeviceId('dev_demo_kiosk_01');
      setDeviceToken('kav_dev_demo_token');
      setElderName('Kamala-ji');
      setDeviceLabel('Home Tablet');
      setIsPaired(true);
    } else {
      setIsPaired(false);
    }
  }, []);

  // Periodic heartbeat loop when paired
  useEffect(() => {
    if (!isPaired || !deviceId || !deviceToken) {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      return;
    }

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/devices/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: deviceId,
            device_token: deviceToken,
            status: isArmed ? 'armed' : 'standby',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.revoked) {
            handleUnpair();
          } else {
            setLastHeartbeatTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        }
      } catch (err) {
        // network silent retry
      }
    };

    // Initial heartbeat
    sendHeartbeat();

    // Heartbeat every 25 seconds
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 25000);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [isPaired, deviceId, deviceToken, isArmed]);

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairingError(null);

    const cleanCode = pairingCodeInput.trim().toUpperCase();
    if (cleanCode.length < 6) {
      setPairingError(lang === 'hi' ? 'कृपया 6-अक्षरों का सही कोड दर्ज करें।' : 'Please enter the valid 6-character code.');
      return;
    }

    if (!elderConsentChecked) {
      setPairingError(
        lang === 'hi'
          ? 'सुरक्षा शुरू करने के लिए कृपया वरिष्ठ नागरिक सहमति बॉक्स पर टिक करें।'
          : 'Explicit elder consent is required before passive listening device pairing can proceed.'
      );
      return;
    }

    setPairingLoading(true);

    try {
      const res = await fetch('/api/devices/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          elder_consent: true,
          notice_version: '2026-10-elder-v1',
          label: deviceLabelInput.trim() || 'Tabletop Kiosk',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.detail?.message || data.message || (lang === 'hi' ? 'कोड अमान्य या समाप्त हो गया है।' : 'Invalid or expired code.');
        setPairingError(msg);
        setPairingLoading(false);
        return;
      }

      if (data.ok && data.device_token) {
        localStorage.setItem('kavach_device_token', data.device_token);
        localStorage.setItem('kavach_device_id', data.device_id);
        if (data.elder_name) localStorage.setItem('kavach_elder_name', data.elder_name);
        if (data.label) localStorage.setItem('kavach_device_label', data.label);

        setDeviceId(data.device_id);
        setDeviceToken(data.device_token);
        if (data.elder_name) setElderName(data.elder_name);
        if (data.label) setDeviceLabel(data.label);

        setIsPaired(true);
      }
    } catch (err: any) {
      setPairingError(err.message || 'Connection failed. Please check internet.');
    } finally {
      setPairingLoading(false);
    }
  };

  const handleBypassDemo = () => {
    localStorage.setItem('kavach_device_token', 'kav_dev_demo_token');
    localStorage.setItem('kavach_device_id', 'dev_demo_kiosk_01');
    localStorage.setItem('kavach_elder_name', 'Kamala-ji');
    localStorage.setItem('kavach_device_label', 'Living Room Tablet');

    setDeviceId('dev_demo_kiosk_01');
    setDeviceToken('kav_dev_demo_token');
    setElderName('Kamala-ji');
    setDeviceLabel('Living Room Tablet');
    setIsPaired(true);
  };

  const handleUnpair = () => {
    localStorage.removeItem('kavach_device_token');
    localStorage.removeItem('kavach_device_id');
    localStorage.removeItem('kavach_elder_name');
    localStorage.removeItem('kavach_device_label');

    setDeviceId('');
    setDeviceToken('');
    setIsPaired(false);
    setDeviceSettingsOpen(false);
  };

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

  // Checking storage state
  if (isPaired === null) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-8">
        <div className="text-xl font-bold font-mono text-muted animate-pulse">
          Initializing Kavach Tabletop Guardian...
        </div>
      </div>
    );
  }

  // SCREEN 1: UNPAIRED SETUP & CODE ENTRY SCREEN
  if (!isPaired) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-4 sm:p-8 select-none font-sans">
        {/* Header with Language Switcher */}
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
              <div className="text-caption font-medium text-muted">
                Tabletop Kiosk Setup · Tabletop Protection
              </div>
            </div>
          </div>

          {/* Language Switcher */}
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

        {/* Pairing Form Card */}
        <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-12 max-w-2xl mx-auto w-full">
          <div className="bg-surface border border-hairline rounded-md p-6 sm:p-10 space-y-6 w-full shadow-sm">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-green-surface text-green-strong flex items-center justify-center mx-auto mb-2">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:devices-bold" width="36" height="36" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
                {content.setupTitle}
              </h1>
              <p className="text-lg text-body font-medium leading-relaxed max-w-lg mx-auto">
                {content.setupSubtitle}
              </p>
            </div>

            {pairingError && (
              <div className="p-4 rounded-md bg-risk-emergency/10 border border-risk-emergency/30 text-risk-emergency font-bold text-sm leading-relaxed flex items-center gap-3">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:danger-triangle-bold" width="22" height="22" className="flex-shrink-0" />
                <span>{pairingError}</span>
              </div>
            )}

            <form onSubmit={handlePairSubmit} className="space-y-6">
              {/* 6-Character Pairing Code Input */}
              <div className="space-y-2">
                <label className="block text-ui font-bold text-ink">
                  {content.codeLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={pairingCodeInput}
                    onChange={(e) => setPairingCodeInput(e.target.value.toUpperCase())}
                    placeholder={content.codePlaceholder}
                    className="w-full text-center tracking-[0.25em] font-mono text-3xl sm:text-4xl font-bold py-4 px-6 rounded-md bg-canvas border-2 border-hairline focus:border-primary focus:outline-none uppercase text-ink transition-all placeholder:text-muted/50"
                  />
                </div>
                <p className="text-caption text-muted text-center font-mono">
                  {lang === 'hi' ? '6-अक्षरों का कोड (उदा. ABC942)' : '6 uppercase alphanumeric characters'}
                </p>
              </div>

              {/* Tablet Location / Label */}
              <div className="space-y-2">
                <label className="block text-ui font-bold text-ink">
                  {content.labelTitle}
                </label>
                <input
                  type="text"
                  value={deviceLabelInput}
                  onChange={(e) => setDeviceLabelInput(e.target.value)}
                  placeholder={content.labelPlaceholder}
                  className="w-full text-ui font-medium py-3 px-4 rounded-md bg-canvas border border-hairline focus:border-primary focus:outline-none text-ink"
                />
              </div>

              {/* Explicit Elder DPDP Consent Card */}
              <div className="p-5 rounded-md bg-canvas border border-hairline space-y-3">
                <div className="flex items-center gap-2 text-ui font-bold text-green-strong">
                  {/* @ts-expect-error solar icon */}
                  <iconify-icon icon="solar:shield-check-bold" width="20" height="20" />
                  <span>{content.consentTitle}</span>
                </div>
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={elderConsentChecked}
                    onChange={(e) => setElderConsentChecked(e.target.checked)}
                    className="w-6 h-6 mt-1 rounded border-hairline text-primary focus:ring-primary accent-primary cursor-pointer flex-shrink-0"
                  />
                  <span className="text-body text-sm leading-relaxed font-medium">
                    {content.consentNotice}
                  </span>
                </label>
              </div>

              {/* Connect Button */}
              <button
                type="submit"
                disabled={pairingLoading}
                className="w-full min-h-[64px] px-8 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xl sm:text-2xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {pairingLoading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:check-circle-bold" width="28" height="28" />
                    <span>{content.btnActivate}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Bypass for Video Recording / Evaluation */}
            <div className="pt-2 text-center border-t border-hairline">
              <button
                type="button"
                onClick={handleBypassDemo}
                className="text-caption text-muted hover:text-ink font-mono font-medium underline cursor-pointer"
              >
                {content.demoBypass}
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center text-caption text-muted font-mono pt-4">
          DPDP Act 2023 Compliant · Passive Tabletop Speakerphone Monitoring · Bangalore, India
        </footer>
      </div>
    );
  }

  // SCREEN 2: ACTIVE ARMED TABLETOP PROTECTION (LIVE PAIRED)
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-4 sm:p-8 select-none font-sans">
      {/* 1. Top Header: Quiet Language Switcher & Real Paired Device Info */}
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
            {/* Real Paired Moniker and Elder Name */}
            <div className="text-caption font-medium text-muted flex items-center gap-2">
              <span>{deviceLabel} · {elderName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-green-strong font-bold">Armed</span>
            </div>
          </div>
        </div>

        {/* Quiet Language Toggle & Settings */}
        <div className="flex items-center gap-3">
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

          <button
            type="button"
            onClick={() => setDeviceSettingsOpen(true)}
            className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-body hover:text-ink transition-colors"
            title={content.deviceSettingsTitle}
          >
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:settings-bold" width="22" height="22" />
          </button>
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
                className="min-h-[56px] px-8 rounded-full bg-white text-risk-emergency font-bold text-xl hover:bg-canvas transition-colors cursor-pointer"
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
                  className="min-h-[64px] px-8 rounded-full font-bold text-xl text-body bg-canvas border border-hairline hover:bg-surface hover:text-ink hover:border-body transition-all flex items-center justify-center gap-3 cursor-pointer"
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
                  className="min-h-[72px] px-12 rounded-full font-bold text-2xl text-white bg-primary hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
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
          <span className="text-green-strong font-bold">Heartbeat: {lastHeartbeatTime}</span>
          <span>·</span>
          <span>Battery: 100% (Plugged in)</span>
        </div>

        {/* Demo / Simulation buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerDemoScamSimulation}
            className="px-3.5 py-1.5 rounded-full bg-canvas hover:bg-surface text-ink text-caption font-bold border border-hairline transition-colors cursor-pointer"
          >
            [Demo] Simulate Scam Call Alarm
          </button>
          <button
            onClick={triggerIntercomSimulation}
            className="px-3.5 py-1.5 rounded-full bg-risk-calm-surface text-risk-calm text-caption font-bold border border-risk-calm-border transition-colors cursor-pointer"
          >
            [Demo] Test Guardian Intercom
          </button>
          <a
            href="/"
            className="px-3.5 py-1.5 rounded-full bg-surface hover:bg-canvas text-body text-caption font-bold border border-hairline transition-colors"
          >
            Guardian Dashboard
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
              className="flex-1 min-h-[56px] px-6 rounded-full bg-primary text-white font-bold text-ui hover:bg-primary-hover transition-colors cursor-pointer"
            >
              {content.confirmKeepAction}
            </button>
            <button
              onClick={handleConfirmStop}
              className="flex-1 min-h-[56px] px-6 rounded-full bg-surface text-body border border-hairline-dark hover:bg-canvas hover:text-ink font-bold text-ui transition-colors cursor-pointer"
            >
              {content.confirmStopAction}
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Device Settings & Unpair Modal */}
      <Modal
        isOpen={deviceSettingsOpen}
        onClose={() => setDeviceSettingsOpen(false)}
        title={content.deviceSettingsTitle}
        description="Active Tabletop Protection Kiosk"
      >
        <div className="space-y-4 pt-2 text-caption">
          <div className="p-4 rounded-md bg-canvas border border-hairline space-y-2 font-mono">
            <div><strong>Device ID:</strong> <span className="text-muted">{deviceId}</span></div>
            <div><strong>Protected Elder:</strong> <span className="text-ink font-bold">{elderName}</span></div>
            <div><strong>Location:</strong> <span className="text-ink">{deviceLabel}</span></div>
            <div><strong>DPDP Consent:</strong> <span className="text-green-strong font-bold">Verified (2026-10-elder-v1)</span></div>
            <div><strong>Audio Mode:</strong> <span>16 kHz PCM16 Real-Time</span></div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="outline-neutral"
              size="md"
              onClick={() => setDeviceSettingsOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleUnpair}
            >
              {content.unpairBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
