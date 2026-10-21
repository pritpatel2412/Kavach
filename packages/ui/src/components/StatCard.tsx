import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  source?: string;
  sourceUrl?: string;
  className?: string;
  statusColor?: 'primary' | 'calm' | 'caution' | 'alert' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  source,
  sourceUrl,
  className = '',
  statusColor = 'neutral',
}) => {
  const iconColor = {
    primary: 'text-primary bg-green-surface',
    calm: 'text-risk-calm bg-risk-calm-surface',
    caution: 'text-risk-caution bg-risk-caution-surface',
    alert: 'text-risk-alert bg-risk-alert-surface',
    neutral: 'text-muted bg-canvas',
  }[statusColor];

  return (
    <div className={`bg-surface border border-hairline rounded-md p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-caption font-bold text-muted uppercase tracking-wider select-none">
          {label}
        </span>
        {icon && (
          <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
          </span>
        )}
      </div>

      <div className="my-1">
        <div className="text-heading-lg font-bold text-ink tracking-tight font-sans" style={{ fontFeatureSettings: '"tnum"' }}>
          {value}
        </div>
        {subtext && (
          <p className="text-caption font-medium text-body mt-1">{subtext}</p>
        )}
      </div>

      {source && (
        <div className="mt-3 pt-2 border-t border-hairline/60">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro font-medium text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>Source: {source}</span>
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:link-minimalistic-linear" width="10" height="10" />
            </a>
          ) : (
            <span className="text-micro font-medium text-muted">Source: {source}</span>
          )}
        </div>
      )}
    </div>
  );
};
