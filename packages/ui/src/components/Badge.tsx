import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral-subtle' | 'filled' | 'premium' | 'warning' | 'primary' | 'hot' | 'cold';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral-subtle',
  children,
  className = '',
  ...rest
}) => {
  const variantStyles = {
    'neutral-subtle': 'bg-surface text-ink border border-hairline rounded-md',
    filled: 'bg-canvas text-body border border-surface rounded-sm',
    premium: 'bg-surface text-premium border border-premium/30 rounded-sm font-bold',
    warning: 'bg-warning-surface text-warning-text rounded-sm font-bold',
    primary: 'bg-primary text-on-primary rounded-full font-bold',
    hot: 'bg-hot text-white rounded-full font-bold',
    cold: 'bg-cold text-white rounded-full font-bold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-caption select-none ${variantStyles} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
