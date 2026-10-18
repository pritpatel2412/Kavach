import React from 'react';

interface BarsProps {
  count?: number; // 14 animated bars
  className?: string;
  barColor?: string;
}

export const Bars: React.FC<BarsProps> = ({
  count = 14,
  className = '',
  barColor = '#c8f542',
}) => {
  const bars = Array.from({ length: count });

  return (
    <div
      data-testid="audio-bars"
      className={`flex items-end gap-1 h-8 px-2 py-1 ${className}`}
      aria-label="Real-time acoustic analysis meter"
    >
      {bars.map((_, i) => {
        // Staggered durations and delay calculations
        const duration = 0.8 + ((i * 7) % 11) * 0.1;
        const delay = ((i * 3) % 7) * 0.12;

        return (
          <span
            key={i}
            className="w-1 rounded-full will-change-transform origin-bottom"
            style={{
              backgroundColor: barColor,
              height: '100%',
              animation: `barPulse ${duration}s ease-in-out ${delay}s infinite alternate`,
            }}
          />
        );
      })}
    </div>
  );
};
