import React from 'react';

export type RiskLevel = 0 | 1 | 2 | 3;

interface RiskMeterProps {
  level: RiskLevel;
  score?: number; // 0 to 100
  showBar?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LEVEL_META: Record<
  RiskLevel,
  { label: string; subtext: string; icon: string; colorClass: string; barBg: string }
> = {
  0: {
    label: 'Safe',
    subtext: 'Listening for known coercion patterns',
    icon: 'shield-check-bold',
    colorClass: 'text-[#c8f542] border-[#c8f542]/30 bg-[#c8f542]/10',
    barBg: 'bg-[#c8f542]',
  },
  1: {
    label: 'Monitoring',
    subtext: 'Unverified authority claim detected',
    icon: 'info-circle-bold',
    colorClass: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
    barBg: 'bg-emerald-400',
  },
  2: {
    label: 'Caution',
    subtext: 'Multi-stage scam pattern in progress',
    icon: 'danger-triangle-bold',
    colorClass: 'text-[#f5b942] border-[#f5b942]/40 bg-[#f5b942]/15',
    barBg: 'bg-[#f5b942]',
  },
  3: {
    label: 'Critical Threat',
    subtext: 'Immediate payment or credential demand: HANG UP',
    icon: 'siren-bold',
    colorClass: 'text-[#ff5a4d] border-[#ff5a4d]/50 bg-[#ff5a4d]/20 animate-pulse',
    barBg: 'bg-[#ff5a4d]',
  },
};

export const RiskMeter: React.FC<RiskMeterProps> = ({
  level,
  score,
  showBar = true,
  className = '',
  size = 'md',
}) => {
  const meta = LEVEL_META[level] || LEVEL_META[0];

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  }[size];

  return (
    <div
      data-testid="risk-meter"
      className={`border rounded-xl backdrop-blur-md transition-all ${meta.colorClass} ${sizeClasses} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Always paired with icon + text (never color alone) */}
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon={`solar:${meta.icon}`} width={size === 'lg' ? 24 : 18} height={size === 'lg' ? 24 : 18} />
          <div>
            <div className="font-heading font-semibold tracking-tight leading-none">
              Level {level}: {meta.label}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">{meta.subtext}</div>
          </div>
        </div>

        {score !== undefined && (
          <div className="font-mono font-bold text-right">
            <span className="text-xs opacity-70">Score </span>
            <span>{score}/100</span>
          </div>
        )}
      </div>

      {showBar && (
        <div className="mt-2.5 h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${meta.barBg}`}
            style={{ width: `${score !== undefined ? score : (level / 3) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
