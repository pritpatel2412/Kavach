import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'lime' | 'amber' | 'red' | 'outline';
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
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  }[size];

  const variantStyles = {
    default: 'bg-white/10 text-white/90 border border-white/14',
    lime: 'bg-[#c8f542]/15 text-[#c8f542] border border-[#c8f542]/30',
    amber: 'bg-[#f5b942]/15 text-[#f5b942] border border-[#f5b942]/30',
    red: 'bg-[#ff5a4d]/15 text-[#ff5a4d] border border-[#ff5a4d]/30',
    outline: 'border border-white/20 text-white/80 bg-transparent',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-heading font-medium tracking-tight rounded-full backdrop-blur-sm select-none ${sizeStyles} ${variantStyles} ${className}`}
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
