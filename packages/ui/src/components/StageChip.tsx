import React from 'react';

export type ScamStage = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

interface StageChipProps {
  stage: ScamStage;
  label?: string;
  className?: string;
  active?: boolean;
}

const STAGE_META: Record<
  ScamStage,
  { name: string; icon: string; desc: string; defaultColor: string }
> = {
  S1: {
    name: 'S1 Authority',
    icon: 'shield-warning-bold',
    desc: 'CBI, Police, Customs, ED, TRAI',
    defaultColor: 'border-cold/30 text-cold bg-cold/10 font-bold',
  },
  S2: {
    name: 'S2 Accusation',
    icon: 'danger-triangle-bold',
    desc: 'Narcotics parcel, money laundering, power cut',
    defaultColor: 'border-warning-text/30 text-warning-text bg-warning-surface font-bold',
  },
  S3: {
    name: 'S3 Isolation',
    icon: 'eye-closed-bold',
    desc: 'Keep confidential, stay on video, do not tell family',
    defaultColor: 'border-warm/30 text-warm bg-warm/10 font-bold',
  },
  S4: {
    name: 'S4 Urgency',
    icon: 'alarm-bold',
    desc: 'Within 10 minutes, immediate warrant, right now',
    defaultColor: 'border-hot/30 text-hot bg-hot/10 font-bold',
  },
  S5: {
    name: 'S5 Payment',
    icon: 'card-transfer-bold',
    desc: 'Safe account, verification bond, bail deposit',
    defaultColor: 'border-transparent text-white bg-hot font-bold shadow-sm',
  },
};

export const StageChip: React.FC<StageChipProps> = ({
  stage,
  label,
  className = '',
  active = true,
}) => {
  const meta = STAGE_META[stage] || STAGE_META.S1;
  const displayLabel = label || meta.name;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-mono border transition-all select-none ${
        active ? meta.defaultColor : 'border-hairline text-muted bg-canvas opacity-60'
      } ${className}`}
      title={meta.desc}
    >
      {/* Enforce solar icon */}
      {/* @ts-expect-error solar icon */}
      <iconify-icon icon={`solar:${meta.icon}`} width="14" height="14" />
      <span>{displayLabel}</span>
    </span>
  );
};

