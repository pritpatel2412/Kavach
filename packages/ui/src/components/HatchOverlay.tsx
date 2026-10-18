import React from 'react';

interface HatchOverlayProps {
  className?: string;
  opacity?: number;
}

export const HatchOverlay: React.FC<HatchOverlayProps> = ({
  className = '',
  opacity = 1,
}) => {
  return (
    <div
      data-testid="hatch-overlay"
      className={`absolute inset-0 pointer-events-none z-[1] ${className}`}
      style={{
        opacity,
        backgroundImage:
          'repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px)',
      }}
      aria-hidden="true"
    />
  );
};
