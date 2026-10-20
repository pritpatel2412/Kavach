import React from 'react';

export interface ToastProps {
  id?: string;
  title: string;
  message?: string;
  variant?: 'primary' | 'warning' | 'hot' | 'cold' | 'lime' | 'amber' | 'red' | 'info';
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'primary',
  onClose,
  className = '',
}) => {
  // Normalize legacy variant keys
  let normalizedVariant = variant;
  if (variant === 'lime') normalizedVariant = 'primary';
  if (variant === 'amber') normalizedVariant = 'warning';
  if (variant === 'red') normalizedVariant = 'hot';
  if (variant === 'info') normalizedVariant = 'cold';

  const meta = {
    primary: {
      border: 'border-primary/40',
      icon: 'check-circle-bold',
      iconColor: 'text-primary',
    },
    warning: {
      border: 'border-warning-text/40',
      icon: 'danger-triangle-bold',
      iconColor: 'text-warning-text',
    },
    hot: {
      border: 'border-hot/40',
      icon: 'siren-bold',
      iconColor: 'text-hot',
    },
    cold: {
      border: 'border-cold/40',
      icon: 'info-circle-bold',
      iconColor: 'text-cold',
    },
  }[normalizedVariant as 'primary' | 'warning' | 'hot' | 'cold'] || {
    border: 'border-hairline',
    icon: 'info-circle-bold',
    iconColor: 'text-body',
  };

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-4 rounded-md bg-surface border shadow-level-2 text-ink max-w-sm font-sans ${meta.border} ${className}`}
    >
      <span className={`shrink-0 mt-0.5 ${meta.iconColor}`}>
        {/* @ts-expect-error solar icon */}
        <iconify-icon icon={`solar:${meta.icon}`} width="20" height="20" />
      </span>

      <div className="flex-1 text-caption">
        <h4 className="font-heading font-bold text-ui text-ink leading-tight">{title}</h4>
        {message && <p className="text-body font-medium mt-0.5 leading-normal">{message}</p>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss toast"
          className="text-muted hover:text-ink p-0.5 transition-colors"
        >
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:close-circle-linear" width="16" height="16" />
        </button>
      )}
    </div>
  );
};

