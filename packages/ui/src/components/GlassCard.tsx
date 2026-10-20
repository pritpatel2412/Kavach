import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isHighlighted?: boolean;
  withHoverShift?: boolean;
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
  // Resting cards use a hairline border only, no shadow.
  // Soft shadow (level-2) is reserved for elevated or hovered cards per DESIGN.md.
  const highlightClass = isHighlighted
    ? 'border-primary ring-1 ring-primary'
    : 'border-hairline';

  const hoverClass = withHoverShift
    ? 'transition-all duration-150 hover:shadow-level-2'
    : 'transition-colors duration-150';

  return (
    <div
      className={`relative bg-surface border rounded-md p-4 text-ink ${highlightClass} ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

