import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isHighlighted?: boolean;
  withHoverShift?: boolean; // hover -translate-y-1.5
  withLimeGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  isHighlighted = false,
  withHoverShift = false,
  withLimeGlow = false,
  ...rest
}) => {
  const highlightClass = isHighlighted
    ? 'border-[rgba(200,245,66,0.30)] shadow-[0_0_30px_rgba(200,245,66,0.12)]'
    : 'border-white/12 hover:border-white/20';

  const hoverShiftClass = withHoverShift
    ? 'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl'
    : 'transition-colors duration-200';

  const glowClass = withLimeGlow ? 'shadow-lime-glow' : '';

  return (
    <div
      className={`relative backdrop-blur-md bg-white/5 border rounded-[20px] p-6 text-white/90 overflow-hidden ${highlightClass} ${hoverShiftClass} ${glowClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
