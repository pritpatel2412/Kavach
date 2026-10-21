'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Checkbox,
  Stepper,
  Icon,
  KavachLogo,
  Badge,
} from '@kavach/ui';
import { BRAND } from '@kavach/api-contract';

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
    <div className="min-h-screen bg-canvas text-ink font-body py-8 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <a href="/" className="flex items-center gap-2">
          <KavachLogo size={28} showWordmark={true} />
        </a>
        <Badge variant="neutral-subtle" className="font-mono text-caption">
          Step {currentStep} of {steps.length}
        </Badge>
      </div>

      {/* Stepper Progress */}
      <div className="py-6">
        <Stepper
          steps={steps}
          activeStep={currentStep - 1}
          onStepClick={(idx) => setCurrentStep(idx + 1)}
        />
      </div>

      {/* Main Step Container */}
      <div className="py-4 max-w-2xl mx-auto w-full">
        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-10 space-y-6 shadow-level-1">
          {/* STEP 1: Household Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="primary" className="font-mono text-micro uppercase">Step 01</Badge>
                <h2 className="text-display font-heading font-bold text-ink">Household Profile</h2>
                <p className="text-ui text-body">
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
                <Button variant="primary" size="md" onClick={() => setCurrentStep(2)} icon="arrow-right-linear">
                  Continue to Elder Setup
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Elder Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="primary" className="font-mono text-micro uppercase">Step 02</Badge>
                <h2 className="text-display font-heading font-bold text-ink">Elder Profile</h2>
                <p className="text-ui text-body">
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
                  <label className="block text-ui font-heading font-bold text-ink mb-1.5">
                    Primary Language Spoken at Home
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-full border border-hairline bg-surface text-ink text-ui focus:outline-none focus:border-primary"
                    value={elderLang}
                    onChange={(e) => setElderLang(e.target.value)}
                  >
                    <option value="hindi">Hindi (हिन्दी)</option>
                    <option value="hinglish">Hinglish (Conversational)</option>
                    <option value="gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="english">Indian English</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline-neutral" size="md" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setCurrentStep(3)} icon="arrow-right-linear">
                  Review Elder Consent
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Plain-Language Consent */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="warning" className="font-mono text-micro uppercase font-bold">Step 03 · Statutory DPDP Notice</Badge>
                <h2 className="text-display font-heading font-bold text-ink">Elder Notice &amp; Consent</h2>
                <p className="text-ui text-body">
                  Under the Digital Personal Data Protection Act (DPDP 2023), household members must be informed of second-device monitoring.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-3 text-ui text-body leading-relaxed">
                <div className="font-heading font-bold text-ink text-lead">Household Declaration:</div>
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
                  href={`${BRAND.siteUrl}/consent-notice`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1 font-mono text-caption"
                >
                  <span>Open Printable Trilingual Consent Notice</span>
                  <Icon name="arrow-right-up-linear" size={12} />
                </a>
              </div>
 
              <div className="p-4 rounded-md bg-canvas border border-hairline space-y-2">
                <div className="text-caption font-bold text-ink uppercase tracking-wider font-mono">
                  Direct Elder Consent Requirement (DPDP Policy)
                </div>
                <p className="text-caption text-body leading-relaxed">
                  Under India&apos;s DPDP framework, consent cannot be granted by a proxy or guardian checkbox. During device pairing (Step 5), {elderName} must review the plain-language notice and grant explicit consent directly by tapping the prompt on the tabletop tablet screen (Notice version: <strong className="font-mono text-primary font-bold">2026-10-elder-v1</strong>).
                </p>
              </div>

              <div className="pt-2">
                <Checkbox
                  id="consent-check"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  label={`I acknowledge that ${elderName} must directly tap to grant consent on the tabletop tablet screen during device setup.`}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline-neutral" size="md" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
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
                <Badge variant="primary" className="font-mono text-micro uppercase">Step 04</Badge>
                <h2 className="text-display font-heading font-bold text-ink">Familial Voice Intervention</h2>
                <p className="text-ui text-body">
                  In extreme panic, elders respond immediately to their child’s familiar voice.
                </p>
              </div>

              {!usePresetVoice ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md border border-hairline bg-canvas space-y-2">
                    <div className="text-caption font-mono text-primary uppercase font-bold">
                      Liveness Challenge Phrase (3 of 3)
                    </div>
                    <div className="text-lead font-heading font-bold text-ink italic">
                      {livenessPhrases[livenessPhraseIndex]}
                    </div>
                  </div>

                  {!recordingDone ? (
                    <div className="text-center py-4 space-y-3">
                      <button
                        type="button"
                        onClick={handleSimulateRecording}
                        className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto transition-all ${
                          isRecording
                            ? 'border-hot bg-hot/10 text-hot animate-pulse'
                            : 'border-primary bg-discount-surface text-green-strong hover:scale-105'
                        }`}
                      >
                        <Icon name={isRecording ? 'pause-bold' : 'microphone-large-bold'} size={28} />
                      </button>
                      <div className="text-caption font-mono text-muted">
                        {isRecording ? 'Recording 3-second sample...' : 'Tap to read phrase aloud for consent verification'}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-md bg-discount-surface border border-primary/20 space-y-3">
                      <div className="flex items-center justify-between text-caption font-mono text-green-strong">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Icon name="check-circle-bold" size={16} />
                          <span>Voice Consent &amp; Liveness Verified</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecordingDone(false)}
                          className="hover:underline font-bold"
                        >
                          Re-record
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-ui text-ink">Preview synthesized emergency alert:</span>
                        <Button
                          variant="outline-neutral"
                          size="sm"
                          onClick={handleSimulatePlayWarning}
                          disabled={previewPlaying}
                          icon="volume-loud-bold"
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
                      className="text-caption text-muted hover:text-ink underline font-mono font-medium"
                    >
                      Skip cloning and use standard reassuring synthetic voice instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-md bg-canvas border border-hairline space-y-3 text-ui">
                  <div className="font-heading font-bold text-ink">Using Reassuring Default Voice</div>
                  <p className="text-body">
                    Kavach will use a gentle, authoritative synthetic voice trained in neutral Hindi and Indian English.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUsePresetVoice(false)}
                    className="text-primary font-bold hover:underline font-mono text-caption"
                  >
                    Switch back to familial voice cloning
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button variant="outline-neutral" size="md" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button
                  variant="primary"
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
                <Badge variant="primary" className="font-mono text-micro uppercase">Step 05</Badge>
                <h2 className="text-display font-heading font-bold text-ink">Pair Tabletop Device</h2>
                <p className="text-ui text-body">
                  Open the Kavach tablet link on your spare tablet or phone placed on the table.
                </p>
              </div>

              <div className="p-6 rounded-md bg-canvas border border-hairline text-center space-y-4">
                <div className="text-caption font-mono text-muted uppercase tracking-widest font-bold">
                  Household Pairing Code
                </div>
                <div className="text-display font-mono font-bold tracking-widest text-primary py-2 select-all">
                  {pairingCode}
                </div>
                <p className="text-ui text-body max-w-sm mx-auto">
                  On the tablet, navigate to <code className="text-green-strong font-mono font-bold">{BRAND.appUrl}/elder</code>, enter this code, and have <strong>{elderName}</strong> tap the on-screen consent prompt (Notice version <code className="font-mono text-primary font-bold">2026-10-elder-v1</code>) to activate Tabletop Mode.
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline-neutral" size="md" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setCurrentStep(6)} icon="arrow-right-linear">
                  Simulate Test Alert
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Test Call Simulation & Ready */}
          {currentStep === 6 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-md bg-discount-surface text-green-strong flex items-center justify-center mx-auto">
                <Icon name="shield-check-bold" size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-display font-heading font-bold text-ink">Household Protection Armed!</h2>
                <p className="text-ui text-body max-w-md mx-auto leading-relaxed">
                  Your household &ldquo;{householdName}&rdquo; is registered. When {elderName} takes a speakerphone call, Kavach will analyze acoustic patterns and alert you instantly.
                </p>
              </div>

              <div className="p-4 rounded-md bg-canvas border border-hairline text-ui font-mono text-body text-left space-y-1">
                <div>✓ Tabletop Kiosk paired: Tablet #1 (Living Room)</div>
                <div>✓ Silence gating active: 0 STT credits burned when quiet</div>
                <div>✓ Emergency Telegram dispatch configured</div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button variant="primary" size="lg" onClick={handleCompleteOnboarding} icon="arrow-right-linear">
                  Launch Guardian Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-caption text-muted font-mono pt-4">
        DPDP Act 2023 Compliant · Zero Permanent Audio Storage · Bangalore, India
      </div>
    </div>
  );
}

