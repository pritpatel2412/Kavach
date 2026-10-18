'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  StageChip,
  RiskMeter,
  Icon,
  KavachLogo,
} from '@kavach/ui';

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params?.id || 'alt-9821';

  // Intercom state
  const [isIntercomActive, setIsIntercomActive] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [falseAlarmReason, setFalseAlarmReason] = useState('legitimate-bank');

  const timelineUtterances = [
    {
      time: '10:14:02 AM',
      speaker: 'Caller (Scammer)',
      text: '“Namaste, main Mumbai Crime Branch aur CBI officer bol raha hoon. Aapka naam Mrs. Kamala Iyer hai?”',
      stage: 'S1',
      stageLabel: 'Authority Impersonation',
      riskScore: 24,
    },
    {
      time: '10:14:18 AM',
      speaker: 'Elder (Kamala)',
      text: '“Haan beta, bolo kya baat hai? Main toh ghar pe hi hoon.”',
      stage: null,
      stageLabel: null,
      riskScore: 24,
    },
    {
      time: '10:14:35 AM',
      speaker: 'Caller (Scammer)',
      text: '“Aapke Aadhaar card se Canara Bank mein account khula hai jisme Naresh Goyal money laundering ka 40 lakh transfer hua hai. Aapke khilaf non-bailable arrest warrant issue hua hai!”',
      stage: 'S2',
      stageLabel: 'Threat & Coercion',
      riskScore: 56,
    },
    {
      time: '10:14:52 AM',
      speaker: 'Elder (Kamala)',
      text: '“Nahi nahi officer saab! Maine koi account nahi khola! Mere bete ko phone lagau?”',
      stage: null,
      stageLabel: null,
      riskScore: 56,
    },
    {
      time: '10:15:10 AM',
      speaker: 'Caller (Scammer)',
      text: '“Nahi! Kisi ko mat batana! Yeh Official Secrets Act hai. Agar kisi ko bataya toh beta bhi arrest ho jayega. Room ka darwaza band rakho aur video call par raho!”',
      stage: 'S3',
      stageLabel: 'Isolation Mandate (Red Line)',
      riskScore: 84,
    },
    {
      time: '10:15:28 AM',
      speaker: 'Kavach Tablet Intervention',
      text: '[Pre-rendered Audio]: “Mummy, yeh scam call hai! Phone kaat do! Main ghar aa raha hoon.” (Daughter Voice)',
      stage: 'ALERT',
      stageLabel: 'Emergency Voice Triggered',
      riskScore: 92,
    },
  ];

  const handleStartIntercom = () => {
    setIsIntercomActive(true);
  };

  const handleStopIntercom = () => {
    setIsIntercomActive(false);
  };

  const handleSendFeedback = (type: 'confirmed-scam' | 'false-alarm') => {
    setFeedbackType(type);
    setFeedbackSent(true);
  };

  return (
    <Frame withHatch={false} className="pb-16 min-h-screen">
      <HatchOverlay />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 sm:px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 focus:outline-none">
            <KavachLogo size={32} showWordmark={true} />
          </a>
          <span className="text-white/20">/</span>
          <span className="text-xs font-mono text-white/60">Incident ID: {alertId}</span>
        </div>

        <Button variant="ghost" size="sm" href="/" icon="arrow-left-linear">
          Back to Dashboard
        </Button>
      </header>

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-8 max-w-4xl mx-auto space-y-8">
        {/* Incident Summary Banner */}
        <div className="p-6 rounded-2xl border border-[#ff5a4d]/50 bg-[#ff5a4d]/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5a4d] shadow-md shadow-[#ff5a4d] animate-ping" />
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Critical Incident: Digital Arrest Extortion Attempt
              </h1>
            </div>
            <span className="text-xs font-mono text-white/60">Today at 10:14 AM IST</span>
          </div>

          <p className="text-xs sm:text-sm text-white/80 font-body leading-relaxed">
            Kavach detected high-probability psychological coercion on speakerphone in the living room.
            The caller commanded Mrs. Kamala Iyer to enter room isolation and threatened criminal prosecution.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <RiskMeter level={3} score={92} showBar={true} className="max-w-xs" />
            <div className="text-xs font-mono text-white/60">
              Triggered pre-rendered audio at 10:15:28 AM
            </div>
          </div>
        </div>

        {/* Push-to-Talk Intercom Box */}
        <GlassCard className="p-6 sm:p-8 space-y-4 text-center border-[#c8f542]/40 bg-[#c8f542]/5">
          <div className="w-12 h-12 rounded-2xl bg-[#c8f542]/20 text-[#c8f542] flex items-center justify-center mx-auto">
            <Icon name="microphone-large-bold" size={24} />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
              Remote Caregiver Intercom (Push-to-Talk)
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto font-body">
              Broadcast your real voice directly out of the living room tabletop tablet to interrupt the scammer immediately.
            </p>
          </div>

          <div className="py-2">
            <button
              onMouseDown={handleStartIntercom}
              onMouseUp={handleStopIntercom}
              onTouchStart={handleStartIntercom}
              onTouchEnd={handleStopIntercom}
              className={`px-8 py-4 rounded-2xl font-heading font-bold text-sm tracking-wide transition-all shadow-xl select-none ${
                isIntercomActive
                  ? 'bg-[#ff5a4d] text-white scale-95 shadow-[#ff5a4d]/50 ring-4 ring-[#ff5a4d]/30'
                  : 'bg-[#c8f542] text-stone-950 hover:bg-[#b5e032] shadow-[#c8f542]/30 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon name={isIntercomActive ? 'soundwave-square-bold' : 'microphone-large-bold'} size={20} />
                <span>{isIntercomActive ? 'SPEAKING LIVE INTO TABLET...' : 'HOLD TO TALK TO ELDER'}</span>
              </div>
            </button>
          </div>

          <div className="text-[11px] font-mono text-white/40">
            {isIntercomActive ? 'Audio stream broadcasting at 16 kHz to tablet' : 'Press and hold button to broadcast your voice'}
          </div>
        </GlassCard>

        {/* Utterance Progression Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-white">
              Utterance by Utterance Progression
            </h2>
            <span className="text-xs font-mono text-white/50">Auto-purged after 7 days</span>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-white/10">
            {timelineUtterances.map((utt, idx) => (
              <div key={idx} className="relative pl-8 space-y-2">
                <div
                  className={`absolute left-1.5 top-2 w-3.5 h-3.5 rounded-full border-2 border-[#0a2a12] ${
                    utt.stage === 'ALERT'
                      ? 'bg-[#ff5a4d] shadow-sm shadow-[#ff5a4d]'
                      : utt.stage
                      ? 'bg-[#c8f542]'
                      : 'bg-white/30'
                  }`}
                />

                <GlassCard className="p-4 sm:p-5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-white/90">{utt.speaker}</span>
                      {utt.stage && (
                        <div className="flex items-center gap-1.5">
                          {utt.stage !== 'ALERT' && <StageChip stage={utt.stage as any} />}
                          <span className="text-[11px] font-mono text-white/60">({utt.stageLabel})</span>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-white/40">{utt.time}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-white/80 font-body leading-relaxed">
                    {utt.text}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>

        {/* Caregiver Feedback Section */}
        <GlassCard className="p-6 sm:p-8 space-y-4 border-white/10">
          <h2 className="text-base font-heading font-bold text-white">
            Caregiver Feedback &amp; Verification
          </h2>

          {!feedbackSent ? (
            <div className="space-y-4">
              <p className="text-xs text-white/70 font-body">
                Your feedback calibrates our offline benign filter to prevent future false alarms in your household.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => handleSendFeedback('confirmed-scam')}
                  icon="shield-check-bold"
                >
                  Confirm Real Scam Call
                </Button>

                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-1.5 rounded-xl border border-white/18 bg-white/5 text-white/90 text-xs focus:outline-none"
                    value={falseAlarmReason}
                    onChange={(e) => setFalseAlarmReason(e.target.value)}
                  >
                    <option value="doctor-call" className="bg-stone-900">False Positive: Doctor Appointment</option>
                    <option value="legitimate-bank" className="bg-stone-900">False Positive: Legitimate Bank Call</option>
                    <option value="tv-ambient" className="bg-stone-900">False Positive: TV / News / Serials</option>
                    <option value="relative" className="bg-stone-900">False Positive: Family Member</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendFeedback('false-alarm')}
                    className="text-xs"
                  >
                    Mark False Positive
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#c8f542] flex items-center gap-2">
              <Icon name="check-circle-bold" size={16} />
              <span>
                Feedback recorded: {feedbackType === 'confirmed-scam' ? 'Confirmed Real Scam' : `False Positive (${falseAlarmReason})`}. Thank you for securing the household.
              </span>
            </div>
          )}
        </GlassCard>
      </main>
    </Frame>
  );
}
