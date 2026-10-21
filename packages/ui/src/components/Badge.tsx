import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'calm'
  | 'caution'
  | 'alert'
  | 'emergency'
  | 'premium'
  | 'primary'
  | 'warning'
  | 'accent'
  | 'neutral-subtle'
  | 'filled'
  | 'hot'
  | 'cold';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}) => {
  // Normalize legacy and alias variants
  let resolvedVariant = variant;
  if (variant === 'accent') resolvedVariant = 'primary';
  if (variant === 'neutral-subtle' || variant === 'filled') resolvedVariant = 'neutral';
  if (variant === 'cold') resolvedVariant = 'calm';
  if (variant === 'hot') resolvedVariant = 'alert';

  const variantStyles: Record<string, string> = {
    neutral: 'bg-canvas text-body border border-hairline',
    calm: 'bg-risk-calm-surface text-risk-calm border border-risk-calm-border',
    caution: 'bg-risk-caution-surface text-risk-caution border border-risk-caution-border',
    alert: 'bg-risk-alert-surface text-risk-alert border border-risk-alert-border',
    emergency: 'bg-risk-emergency text-white border border-risk-emergency-border',
    premium: 'bg-premium-surface text-premium border border-premium-border',
    primary: 'bg-green-surface text-green-strong border border-primary/20',
    warning: 'bg-warning-surface text-warning-text border border-warning-border',
  };

  const styleClass = variantStyles[resolvedVariant] || variantStyles.neutral;
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-micro' : 'px-2.5 py-0.5 text-caption';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full select-none ${sizeStyles} ${styleClass} ${className}`}
      {...rest}
    >
      {icon && (
        // @ts-expect-error solar icon
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="12" height="12" />
      )}
      <span>{children}</span>
    </span>
  );
};
