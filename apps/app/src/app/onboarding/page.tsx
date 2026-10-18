'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Input,
  Checkbox,
  Stepper,
  Icon,
  KavachLogo,
} from '@kavach/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [householdName, setHouseholdName] = useState('Iyer Residence');
  const [city, setCity] = useState('Pune, Maharashtra');
  const [elderName, setElderName] = useState('Mrs. Kamala Iyer');
  const [elderPhone, setElderPhone] = useState('+91 98230 11223');
  const [elderLang, setElderLang] = useState('hindi');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);

  // Voice Consent State
  const [livenessPhraseIndex, setLivenessPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [usePresetVoice, setUsePresetVoice] = useState(false);

  // Pairing code
  const pairingCode = 'KAV-7892';

  const steps = [
    { id: '1', title: 'Household' },
    { id: '2', title: 'Elder' },
    { id: '3', title: 'Consent' },
    { id: '4', title: 'Voice' },
    { id: '5', title: 'Pair' },
    { id: '6', title: 'Test' },
  ];

  const livenessPhrases = [
    '“Mummy, phone kaat do! Main ghar aa raha hoon.”',
    '“Papa, yeh scam call hai! Koi paise mat bhejna.”',
    '“Please stop the call right now, I am verifying with the bank.”',
  ];

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRecordingDone(true);
    }, 2000);
  };

  const handleSimulatePlayWarning = () => {
    setPreviewPlaying(true);
    setTimeout(() => {
      setPreviewPlaying(false);
    }, 2500);
  };

  const handleCompleteOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kavach_onboarded', 'true');
      localStorage.setItem('kavach_household_name', householdName);
      localStorage.setItem('kavach_elder_name', elderName);
    }
    router.push('/');
  };

  return (
    <Frame withHatch={false} className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col justify-between">
      <HatchOverlay />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
        <a href="/" className="flex items-center gap-2">
          <KavachLogo size={28} showWordmark={true} />
        </a>
        <div className="text-xs font-mono text-white/50">
          Step {currentStep} of {steps.length}
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="relative z-10 py-6">
        <Stepper
          steps={steps}
          activeStep={currentStep - 1}
          onStepClick={(idx) => setCurrentStep(idx + 1)}
        />
      </div>

      {/* Main Step Container */}
      <div className="relative z-10 py-4 max-w-2xl mx-auto w-full">
        <GlassCard className="p-6 sm:p-10 space-y-6">
          {/* STEP 1: Household Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8f542]">Step 01</span>
                <h2 className="text-2xl font-heading font-bold text-white">Household Profile</h2>
                <p className="text-xs text-white/60 font-body">
                  Give your family household a recognizable label for emergency notifications.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Household Nickname"
                  placeholder="e.g. Iyer Residence or Parents Flat"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  required
                />
                <Input
                  label="City / Location"
                  placeholder="e.g. Pune, Maharashtra"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="lime" size="md" onClick={() => setCurrentStep(2)} icon="arrow-right-linear">
                  Continue to Elder Setup
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Elder Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8f542]">Step 02</span>
                <h2 className="text-2xl font-heading font-bold text-white">Elder Profile</h2>
                <p className="text-xs text-white/60 font-body">
                  Who is the primary senior citizen answering calls on speakerphone?
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Senior Citizen Name"
                  placeholder="e.g. Mrs. Kamala Iyer"
                  value={elderName}
                  onChange={(e) => setElderName(e.target.value)}
                  required
                />
                <Input
                  label="Elder Mobile Phone Number"
                  placeholder="+91 98230 11223"
                  value={elderPhone}
                  onChange={(e) => setElderPhone(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-heading font-semibold text-white/90 mb-1.5">
                    Primary Language Spoken at Home
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/5 text-white/90 text-xs focus:outline-none focus:border-[#c8f542]"
                    value={elderLang}
                    onChange={(e) => setElderLang(e.target.value)}
                  >
                    <option value="hindi" className="bg-stone-900">Hindi (हिन्दी)</option>
                    <option value="hinglish" className="bg-stone-900">Hinglish (Conversational)</option>
                    <option value="gujarati" className="bg-stone-900">Gujarati (ગુજરાતી)</option>
                    <option value="english" className="bg-stone-900">Indian English</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button variant="lime" size="md" onClick={() => setCurrentStep(3)} icon="arrow-right-linear">
                  Review Elder Consent
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Plain-Language Consent */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">Step 03 · Statutory DPDP Notice</span>
                <h2 className="text-2xl font-heading font-bold text-white">Elder Notice &amp; Consent</h2>
                <p className="text-xs text-white/60 font-body">
                  Under the Digital Personal Data Protection Act (DPDP 2023), household members must be informed of second-device monitoring.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 text-xs text-white/80 leading-relaxed font-body">
                <div className="font-heading font-bold text-white text-sm">Household Declaration:</div>
                <p>
                  1. The tabletop tablet operates in common living areas and only analyzes audio when calls are put on speakerphone.
                </p>
                <p>
                  2. No raw audio files are ever recorded or stored permanently.
                </p>
                <p>
                  3. I have read or displayed the trilingual notice card to {elderName}.
                </p>
                <a
                  href="http://localhost:3000/consent-notice"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[#c8f542] hover:underline pt-1 font-mono text-[11px]"
                >
                  <span>Open Printable Trilingual Consent Notice</span>
                  <Icon name="arrow-right-up-linear" size={12} />
                </a>
              </div>

              <div className="pt-2">
                <Checkbox
                  id="consent-check"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  label={`I confirm that ${elderName} is aware that this tablet assists during speakerphone calls.`}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button
                  variant="lime"
                  size="md"
                  disabled={!consentAcknowledged}
                  onClick={() => setCurrentStep(4)}
                  icon="arrow-right-linear"
                >
                  Configure Voice Shield
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Voice Shield Liveness Challenge */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8f542]">Step 04</span>
                <h2 className="text-2xl font-heading font-bold text-white">Familial Voice Intervention</h2>
                <p className="text-xs text-white/60 font-body">
                  In extreme panic, elders respond immediately to their child’s familiar voice.
                </p>
              </div>

              {!usePresetVoice ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                    <div className="text-[11px] font-mono text-[#c8f542] uppercase">
                      Liveness Challenge Phrase (3 of 3)
                    </div>
                    <div className="text-sm font-heading font-bold text-white italic">
                      {livenessPhrases[livenessPhraseIndex]}
                    </div>
                  </div>

                  {!recordingDone ? (
                    <div className="text-center py-4 space-y-3">
                      <button
                        type="button"
                        onClick={handleSimulateRecording}
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                          isRecording
                            ? 'border-[#ff5a4d] bg-[#ff5a4d]/20 text-[#ff5a4d] animate-pulse'
                            : 'border-[#c8f542] bg-[#c8f542]/20 text-[#c8f542] hover:scale-105'
                        }`}
                      >
                        <Icon name={isRecording ? 'pause-bold' : 'microphone-large-bold'} size={28} />
                      </button>
                      <div className="text-xs font-mono text-white/60">
                        {isRecording ? 'Recording 3-second sample...' : 'Tap to read phrase aloud for consent verification'}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Icon name="check-circle-bold" size={16} />
                          <span>Voice Consent &amp; Liveness Verified</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecordingDone(false)}
                          className="hover:underline text-[11px]"
                        >
                          Re-record
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-white/80">Preview synthesized emergency alert:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSimulatePlayWarning}
                          disabled={previewPlaying}
                          icon="volume-loud-bold"
                          className="text-xs"
                        >
                          {previewPlaying ? 'Playing Audio...' : 'Test Playback'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setUsePresetVoice(true)}
                      className="text-xs text-white/50 hover:text-white underline font-mono"
                    >
                      Skip cloning and use standard reassuring synthetic voice instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
                  <div className="font-heading font-bold text-white">Using Reassuring Default Voice</div>
                  <p className="text-white/70">
                    Kavach will use a gentle, authoritative synthetic voice trained in neutral Hindi and Indian English.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUsePresetVoice(false)}
                    className="text-[#c8f542] hover:underline font-mono"
                  >
                    Switch back to familial voice cloning
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button
                  variant="lime"
                  size="md"
                  disabled={!usePresetVoice && !recordingDone}
                  onClick={() => setCurrentStep(5)}
                  icon="arrow-right-linear"
                >
                  Generate Pairing Code
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Tablet Pairing Code */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8f542]">Step 05</span>
                <h2 className="text-2xl font-heading font-bold text-white">Pair Tabletop Device</h2>
                <p className="text-xs text-white/60 font-body">
                  Open the Kavach tablet link on your spare tablet or phone placed on the table.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-4">
                <div className="text-xs font-mono text-white/50 uppercase tracking-widest">
                  Household Pairing Code
                </div>
                <div className="text-4xl font-mono font-bold tracking-widest text-[#c8f542] py-2 select-all">
                  {pairingCode}
                </div>
                <p className="text-xs text-white/70 font-body max-w-sm mx-auto">
                  On the tablet, navigate to <code className="text-[#c8f542]">localhost:3001/elder</code> and enter this code to lock the device into Tabletop Mode.
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                <Button variant="lime" size="md" onClick={() => setCurrentStep(6)} icon="arrow-right-linear">
                  Simulate Test Alert
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Test Call Simulation & Ready */}
          {currentStep === 6 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-[#c8f542]/20 text-[#c8f542] flex items-center justify-center mx-auto">
                <Icon name="shield-check-bold" size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-bold text-white">Household Protection Armed!</h2>
                <p className="text-xs sm:text-sm text-white/60 font-body max-w-md mx-auto leading-relaxed">
                  Your household &ldquo;{householdName}&rdquo; is registered. When {elderName} takes a speakerphone call, Kavach will analyze acoustic patterns and alert you instantly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70 text-left space-y-1">
                <div>✓ Tabletop Kiosk paired: Tablet #1 (Living Room)</div>
                <div>✓ Silence gating active: 0 STT credits burned when quiet</div>
                <div>✓ Emergency Telegram dispatch configured</div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button variant="lime" size="lg" onClick={handleCompleteOnboarding} icon="arrow-right-linear">
                  Launch Guardian Dashboard
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-[11px] text-white/40 font-mono pt-4">
        DPDP Act 2023 Compliant · Zero Permanent Audio Storage · Bangalore, India
      </div>
    </Frame>
  );
}
