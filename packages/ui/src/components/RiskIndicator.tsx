import React from 'react';

export type KavachRiskLevel = 'calm' | 'caution' | 'alert' | 'emergency' | 'L0' | 'L1' | 'L2' | 'L3';

export interface RiskIndicatorProps {
  level: KavachRiskLevel;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const RISK_CONFIG = {
  calm: {
    stage: 'L0 Calm',
    defaultLabel: 'Calm / Monitoring',
    icon: 'shield-check-bold',
    styles: 'bg-risk-calm-surface text-risk-calm border-risk-calm-border',
    iconColor: 'text-risk-calm',
    pulse: false,
  },
  caution: {
    stage: 'L1 Caution',
    defaultLabel: 'Caution: Unverified Authority',
    icon: 'danger-triangle-bold',
    styles: 'bg-risk-caution-surface text-risk-caution border-risk-caution-border',
    iconColor: 'text-risk-caution',
    pulse: false,
  },
  alert: {
    stage: 'L2 Alert',
    defaultLabel: 'Alert: Scam Coercion Flagged',
    icon: 'alarm-bold',
    styles: 'bg-risk-alert-surface text-risk-alert border-risk-alert-border',
    iconColor: 'text-risk-alert',
    pulse: false,
  },
  emergency: {
    stage: 'L3 Emergency',
    defaultLabel: 'EMERGENCY: Immediate Payment Demand',
    icon: 'siren-bold',
    styles: 'bg-risk-emergency text-white border-risk-emergency-border shadow-sm',
    iconColor: 'text-white',
    pulse: true,
  },
};

function normalizeRiskLevel(level: KavachRiskLevel): 'calm' | 'caution' | 'alert' | 'emergency' {
  if (level === 'L0' || level === 'calm') return 'calm';
  if (level === 'L1' || level === 'caution') return 'caution';
  if (level === 'L2' || level === 'alert') return 'alert';
  if (level === 'L3' || level === 'emergency') return 'emergency';
  return 'calm';
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  label,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const normalized = normalizeRiskLevel(level);
  const cfg = RISK_CONFIG[normalized];
  const displayLabel = label || cfg.defaultLabel;

  const sizeStyles = {
    sm: 'text-caption px-2.5 py-0.5 gap-1.5',
    md: 'text-ui px-3.5 py-1 gap-2',
    lg: 'text-body px-4 py-2 gap-2.5 font-bold',
  }[size];

  const iconSizes = {
    sm: '14',
    md: '16',
    lg: '20',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border transition-all duration-180 select-none ${cfg.styles} ${sizeStyles} ${
        cfg.pulse ? 'animate-pulse' : ''
      } ${className}`}
      role="status"
      aria-label={`Risk state: ${displayLabel}`}
    >
      {showIcon && (
        <span className="flex items-center shrink-0">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon={`solar:${cfg.icon}`} width={iconSizes} height={iconSizes} />
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
