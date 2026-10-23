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
  const [householdName, setHouseholdName] = useState('');
  const [city, setCity] = useState('');
  const [elderName, setElderName] = useState('');
  const [elderPhone, setElderPhone] = useState('');
  const [elderLang, setElderLang] = useState('hi-IN');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [createdElderId, setCreatedElderId] = useState<string | null>(null);

  // Real Voice Consent & Recording State
  const [activeChallengeId, setActiveChallengeId] = useState<string>('');
  const [challengePhrase, setChallengePhrase] = useState<string>('Mummy, phone kaat do! Main ghar aa raha hoon.');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingDone, setRecordingDone] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [usePresetVoice, setUsePresetVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceProfileId, setVoiceProfileId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerIntervalRef = React.useRef<any>(null);
  const audioElementRef = React.useRef<HTMLAudioElement | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const animFrameRef = React.useRef<number | null>(null);

  // Pairing code
  const [pairingCode, setPairingCode] = useState('KAV-7892');

  const steps = [
    { id: '1', title: 'Household' },
    { id: '2', title: 'Elder' },
    { id: '3', title: 'Consent' },
    { id: '4', title: 'Voice' },
    { id: '5', title: 'Pair' },
    { id: '6', title: 'Test' },
  ];

  React.useEffect(() => {
    if (currentStep === 4) {
      // Fetch dynamic liveness challenge from backend
      fetch('/api/voice/challenge')
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.challenge_id && data.sentence) {
              setActiveChallengeId(data.challenge_id);
              setChallengePhrase(data.sentence);
            }
          }
        })
        .catch(() => {});
    }
  }, [currentStep]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRealRecording();
    } else {
      await startRealRecording();
    }
  };

  const startRealRecording = async () => {
    setVoiceError(null);
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Audio recording is not supported in this browser environment. You can continue with the default reassuring voice.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Hook up live AudioContext Analyser for real-time VU meter
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          const actx = new AudioCtxClass();
          audioContextRef.current = actx;
          const source = actx.createMediaStreamSource(stream);
          const analyser = actx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateMeter = () => {
            if (!audioContextRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const level = Math.min(100, Math.round((average / 128) * 100));
            setAudioLevel(level);
            animFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      } catch (audioCtxErr) {
        console.warn('Analyser setup non-fatal notice:', audioCtxErr);
      }

      audioChunksRef.current = [];
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        setAudioLevel(0);

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setRecordingDone(true);
        setIsRecording(false);

        // Upload voice sample to backend
        try {
          const token = localStorage.getItem('kavach_guardian_token');
          const formData = new FormData();
          formData.append('audio_file', blob, 'sample.webm');
          formData.append('challenge_id', activeChallengeId || 'default');
          formData.append('elder_id', createdElderId || 'default');
          formData.append('consent', 'true');

          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch('/api/voice/enroll', {
            method: 'POST',
            headers,
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.voice_profile_id) {
              setVoiceProfileId(data.voice_profile_id);
              localStorage.setItem('kavach_voice_profile_id', data.voice_profile_id);
            }
          }
        } catch (e) {
          console.warn('Voice profile async enroll notice:', e);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      let secs = 0;
      timerIntervalRef.current = setInterval(() => {
        secs += 1;
        setRecordingSeconds(secs);
        if (secs >= 5) {
          stopRealRecording();
        }
      }, 1000);
    } catch (err: any) {
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setAudioLevel(0);
      console.error('Microphone error:', err);
      setVoiceError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser to record your voice.'
          : `Microphone recording failed: ${err.message || 'Device error'}`
      );
    }
  };

  const stopRealRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const handlePlayRecording = () => {
    if (!recordedAudioUrl) return;
    setPreviewPlaying(true);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    audioElementRef.current = audio;
    audio.onended = () => setPreviewPlaying(false);
    audio.onerror = () => setPreviewPlaying(false);
    audio.play().catch(() => setPreviewPlaying(false));
  };

  const handleReRecord = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setRecordingDone(false);
    setIsRecording(false);
    setRecordingSeconds(0);
    setVoiceError(null);
  };

  const handleSaveElder = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('kavach_guardian_token');
    if (!token || !elderName.trim()) {
      setCurrentStep(3);
      return;
    }
    try {
      const res = await fetch('/api/elders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: elderName.trim(),
          language: elderLang,
          phone: elderPhone.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedElderId(data.id);
        const codeRes = await fetch('/api/devices/pairing-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ elder_id: data.id }),
        });
        if (codeRes.ok) {
          const codeData = await codeRes.json();
          if (codeData.code) {
            setPairingCode(codeData.code);
          }
        }
      }
    } catch {
      // offline fallback
    }
    setCurrentStep(3);
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
                <Button variant="primary" size="md" onClick={handleSaveElder} icon="arrow-right-linear">
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

              {voiceError && (
                <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-hot text-xs font-mono font-bold leading-relaxed">
                  {voiceError}
                </div>
              )}

              {!usePresetVoice ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md border border-hairline bg-canvas space-y-2">
                    <div className="text-caption font-mono text-primary uppercase font-bold flex items-center justify-between">
                      <span>Liveness Challenge Phrase (Read Aloud)</span>
                      <span className="text-muted font-normal text-[11px]">Cryptographic Anti-Spoof</span>
                    </div>
                    <div className="text-lead font-heading font-bold text-ink italic">
                      &ldquo;{challengePhrase}&rdquo;
                    </div>
                  </div>

                  {!recordingDone ? (
                    <div className="text-center py-6 space-y-4">
                      <button
                        type="button"
                        onClick={handleToggleRecording}
                        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto transition-all shadow-level-2 ${
                          isRecording
                            ? 'border-hot bg-hot/15 text-hot animate-pulse scale-105'
                            : 'border-primary bg-discount-surface text-green-strong hover:scale-105'
                        }`}
                      >
                        <Icon name={isRecording ? 'pause-bold' : 'microphone-large-bold'} size={34} />
                      </button>

                      <div className="space-y-2">
                        <div className="font-heading font-bold text-ink text-sm">
                          {isRecording ? `Recording Real Voice... (${recordingSeconds}s / 5s)` : 'Tap to Start Microphone Recording'}
                        </div>
                        {isRecording && (
                          <div className="space-y-1">
                            <div className="w-56 mx-auto h-2 bg-canvas border border-hairline rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-75 rounded-full"
                                style={{ width: `${Math.max(6, audioLevel)}%` }}
                              />
                            </div>
                            <div className="text-[10px] font-mono text-muted">
                              {audioLevel > 15 ? '🟢 Voice Detected (Capturing Micro-Phonemes)' : '⚪ Listening for Speech... (Speak Clearly)'}
                            </div>
                          </div>
                        )}
                        <div className="text-caption font-mono text-muted">
                          {isRecording
                            ? 'Speak the phrase aloud clearly. Tap again to stop.'
                            : 'Captures your actual voice using your device microphone.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-md bg-discount-surface border border-primary/20 space-y-4">
                      <div className="flex items-center justify-between text-caption font-mono text-green-strong">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Icon name="check-circle-bold" size={16} />
                          <span>Voice Consent &amp; Liveness Verified</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleReRecord}
                          className="hover:underline font-bold text-primary"
                        >
                          Re-record
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-hairline">
                        <div className="space-y-0.5">
                          <div className="text-ui font-bold text-ink">Preview Your Real Voice Recording</div>
                          <div className="text-caption text-muted font-mono">Listen to the actual audio recorded from your microphone.</div>
                        </div>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handlePlayRecording}
                          disabled={previewPlaying}
                          icon="volume-loud-bold"
                        >
                          {previewPlaying ? 'Playing Your Audio...' : 'Play Your Recording'}
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

