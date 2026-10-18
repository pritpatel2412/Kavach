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
    defaultColor: 'border-blue-400/30 text-blue-300 bg-blue-500/10',
  },
  S2: {
    name: 'S2 Accusation',
    icon: 'danger-triangle-bold',
    desc: 'Narcotics parcel, money laundering, power cut',
    defaultColor: 'border-amber-400/30 text-amber-300 bg-amber-500/10',
  },
  S3: {
    name: 'S3 Isolation',
    icon: 'eye-closed-bold',
    desc: 'Keep confidential, stay on video, do not tell family',
    defaultColor: 'border-orange-400/30 text-orange-300 bg-orange-500/10',
  },
  S4: {
    name: 'S4 Urgency',
    icon: 'alarm-bold',
    desc: 'Within 10 minutes, immediate warrant, right now',
    defaultColor: 'border-rose-400/30 text-rose-300 bg-rose-500/10',
  },
  S5: {
    name: 'S5 Payment',
    icon: 'card-transfer-bold',
    desc: 'Safe account, verification bond, bail deposit',
    defaultColor: 'border-[#ff5a4d]/40 text-[#ff5a4d] bg-[#ff5a4d]/15 font-semibold',
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-md transition-all select-none ${
        active ? meta.defaultColor : 'border-white/10 text-white/40 bg-white/5 opacity-50'
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
