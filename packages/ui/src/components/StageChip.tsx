import React from 'react';

export type ScamStage = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export interface StageChipProps {
  stage: ScamStage;
  label?: string;
  className?: string;
  active?: boolean;
}

export const STAGE_META: Record<
  ScamStage,
  { name: string; title: string; icon: string; desc: string; defaultColor: string }
> = {
  S1: {
    name: 'S1 Authority',
    title: 'Authority Impersonation',
    icon: 'shield-warning-bold',
    desc: 'CBI, Mumbai Police, Customs, ED, TRAI impersonation',
    defaultColor: 'border-risk-calm-border text-risk-calm bg-risk-calm-surface font-bold',
  },
  S2: {
    name: 'S2 Accusation',
    title: 'Extortion Accusation',
    icon: 'danger-triangle-bold',
    desc: 'Narcotics parcel, money laundering, bank freeze, non-bailable warrant',
    defaultColor: 'border-warning-border text-warning-text bg-warning-surface font-bold',
  },
  S3: {
    name: 'S3 Isolation',
    title: 'Secrecy Coercion',
    icon: 'eye-closed-bold',
    desc: 'Keep confidential, stay on camera, do not disconnect, secret digital arrest',
    defaultColor: 'border-risk-caution-border text-risk-caution bg-risk-caution-surface font-bold',
  },
  S4: {
    name: 'S4 Urgency',
    title: 'Timer Coercion',
    icon: 'alarm-bold',
    desc: 'Within 10 minutes, immediate arrest, right now, urgent compliance',
    defaultColor: 'border-risk-alert-border text-risk-alert bg-risk-alert-surface font-bold',
  },
  S5: {
    name: 'S5 Payment',
    title: 'Asset Transfer Demand',
    icon: 'card-transfer-bold',
    desc: 'Safe government account, RBI verification deposit, bail bond RTGS',
    defaultColor: 'border-risk-emergency-border text-white bg-risk-emergency font-bold shadow-sm',
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-bold border transition-all select-none ${
        active ? meta.defaultColor : 'border-hairline text-muted bg-canvas opacity-50'
      } ${className}`}
      title={meta.desc}
    >
      {/* @ts-expect-error solar icon */}
      <iconify-icon icon={`solar:${meta.icon}`} width="14" height="14" />
      <span>{displayLabel}</span>
    </span>
  );
};

export interface StageChipsProps {
  stages: ScamStage[];
  activeStages?: ScamStage[];
  className?: string;
}

export const StageChips: React.FC<StageChipsProps> = ({
  stages,
  activeStages,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {stages.map((stg) => {
        const isActive = activeStages ? activeStages.includes(stg) : true;
        return <StageChip key={stg} stage={stg} active={isActive} />;
      })}
    </div>
  );
};
