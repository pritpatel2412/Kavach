import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'hot' | 'cold' | 'outline' | 'lime' | 'amber' | 'red';
  size?: 'sm' | 'md';
  icon?: string;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...rest
}) => {
  // Normalize legacy variants
  let resolvedVariant = variant;
  if (variant === 'lime') resolvedVariant = 'primary';
  if (variant === 'amber') resolvedVariant = 'warning';
  if (variant === 'red') resolvedVariant = 'hot';

  const sizeStyles = {
    sm: 'text-micro px-2.5 py-0.5 gap-1',
    md: 'text-caption px-3 py-1 gap-1.5',
  }[size];

  const variantStyles = {
    default: 'bg-canvas text-body border border-hairline',
    primary: 'bg-primary text-on-primary border border-transparent font-bold',
    warning: 'bg-warning-surface text-warning-text border border-warning-surface font-bold',
    hot: 'bg-hot text-white border border-transparent font-bold',
    cold: 'bg-cold text-white border border-transparent font-bold',
    outline: 'border border-hairline text-ink bg-surface',
    lime: 'bg-primary text-on-primary border border-transparent font-bold',
    amber: 'bg-warning-surface text-warning-text border border-warning-surface font-bold',
    red: 'bg-hot text-white border border-transparent font-bold',
  }[resolvedVariant];

  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded-full select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...rest}
    >
      {icon && (
        // @ts-expect-error solar icon
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="14" height="14" />
      )}
      <span>{children}</span>
    </span>
  );
};

