'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  StageChip,
  RiskMeter,
  Icon,
  KavachLogo,
  Badge,
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

  const handleSendFeedback = async (type: 'confirmed-scam' | 'false-alarm') => {
    setFeedbackType(type);
    setFeedbackSent(true);
    try {
      await fetch(`/api/sessions/${alertId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict: type === 'confirmed-scam' ? 'confirmed_scam' : 'false_positive',
          reason: type === 'false-alarm' ? falseAlarmReason : undefined,
        }),
      });
    } catch {
      // Offline fallback
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      {/* Header */}
      <header className="bg-surface border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 focus:outline-none">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="text-muted">/</span>
            <span className="text-caption font-mono text-muted">Incident ID: {alertId}</span>
          </div>

          <Button variant="outline-neutral" size="sm" href="/" icon="arrow-left-linear">
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Incident Summary Banner */}
        <div className="p-6 rounded-md border border-hairline bg-surface space-y-4 shadow-level-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-hot animate-ping" />
              <h1 className="text-heading font-heading font-bold text-ink">
                Critical Incident: Digital Arrest Extortion Attempt
              </h1>
              <Badge variant="neutral">Sample data</Badge>
            </div>
            <span className="text-caption font-mono text-muted">Today at 10:14 AM IST</span>
          </div>

          <p className="text-ui text-body leading-relaxed">
            Kavach detected high-probability psychological coercion on speakerphone in the living room.
            The caller commanded Mrs. Kamala Iyer to enter room isolation and threatened criminal prosecution.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <RiskMeter level={3} score={92} showBar={true} className="max-w-xs" />
            <div className="text-caption font-mono text-muted">
              Triggered pre-rendered audio at 10:15:28 AM
            </div>
          </div>
        </div>

        {/* Push-to-Talk Intercom Box */}
        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-4 text-center shadow-level-1">
          <div className="w-12 h-12 rounded-full bg-discount-surface text-green-strong flex items-center justify-center mx-auto">
            <Icon name="microphone-large-bold" size={24} />
          </div>

          <div className="space-y-1">
            <h2 className="text-heading font-heading font-bold text-ink">
              Remote Caregiver Intercom (Push-to-Talk)
            </h2>
            <p className="text-ui text-body max-w-md mx-auto">
              Broadcast your real voice directly out of the living room tabletop tablet to interrupt the scammer immediately.
            </p>
          </div>

          <div className="py-2">
            <button
              onMouseDown={handleStartIntercom}
              onMouseUp={handleStopIntercom}
              onTouchStart={handleStartIntercom}
              onTouchEnd={handleStopIntercom}
              className={`px-8 py-3.5 rounded-full font-heading font-bold text-ui tracking-wide transition-all select-none ${
                isIntercomActive
                  ? 'bg-hot text-on-primary scale-95 shadow-level-2'
                  : 'bg-primary text-on-primary hover:bg-green-strong shadow-level-2 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon name={isIntercomActive ? 'soundwave-square-bold' : 'microphone-large-bold'} size={20} />
                <span>{isIntercomActive ? 'SPEAKING LIVE INTO TABLET...' : 'HOLD TO TALK TO ELDER'}</span>
              </div>
            </button>
          </div>

          <div className="text-caption font-mono text-muted">
            {isIntercomActive ? 'Audio stream broadcasting at 16 kHz to tablet' : 'Press and hold button to broadcast your voice'}
          </div>
        </div>

        {/* Utterance Progression Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-heading font-heading font-bold text-ink">
              Utterance by Utterance Progression
            </h2>
            <span className="text-caption font-mono text-muted">Auto-purged after 7 days</span>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-hairline">
            {timelineUtterances.map((utt, idx) => (
              <div key={idx} className="relative pl-8 space-y-2">
                <div
                  className={`absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 border-surface ${
                    utt.stage === 'ALERT'
                      ? 'bg-hot'
                      : utt.stage
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />

                <div className="bg-surface border border-hairline rounded-md p-4 sm:p-5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-ui">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-ink">{utt.speaker}</span>
                      {utt.stage && (
                        <div className="flex items-center gap-1.5">
                          {utt.stage !== 'ALERT' && <StageChip stage={utt.stage as any} />}
                          <span className="text-caption font-mono text-muted">({utt.stageLabel})</span>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-caption text-muted">{utt.time}</span>
                  </div>

                  <p className="text-ui text-body leading-relaxed">
                    {utt.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caregiver Feedback Section */}
        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-4">
          <h2 className="text-heading font-heading font-bold text-ink">
            Caregiver Feedback &amp; Verification
          </h2>

          {!feedbackSent ? (
            <div className="space-y-4">
              <p className="text-ui text-body">
                Your feedback calibrates our offline benign filter to prevent future false alarms in your household.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSendFeedback('confirmed-scam')}
                  icon="shield-check-bold"
                >
                  Confirm Real Scam Call
                </Button>

                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-1.5 rounded-full border border-hairline bg-surface text-ink text-caption focus:outline-none"
                    value={falseAlarmReason}
                    onChange={(e) => setFalseAlarmReason(e.target.value)}
                  >
                    <option value="doctor-call">False Positive: Doctor Appointment</option>
                    <option value="legitimate-bank">False Positive: Legitimate Bank Call</option>
                    <option value="tv-ambient">False Positive: TV / News / Serials</option>
                    <option value="relative">False Positive: Family Member</option>
                  </select>

                  <Button
                    variant="outline-neutral"
                    size="sm"
                    onClick={() => handleSendFeedback('false-alarm')}
                  >
                    Mark False Positive
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-md bg-discount-surface border border-primary/20 text-caption font-mono text-green-strong flex items-center gap-2 font-bold">
              <Icon name="check-circle-bold" size={16} />
              <span>
                Feedback recorded: {feedbackType === 'confirmed-scam' ? 'Confirmed Real Scam' : `False Positive (${falseAlarmReason})`}. Thank you for securing the household.
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

