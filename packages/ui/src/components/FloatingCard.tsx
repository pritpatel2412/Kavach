import React from 'react';

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delaySeconds?: number;
  durationSeconds?: number;
  floatDistancePx?: number; // e.g. 6 to 12px
  isAbsoluteOnDesktop?: boolean;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  delaySeconds = 0,
  durationSeconds = 4.5,
  floatDistancePx = 8,
  isAbsoluteOnDesktop = true,
  style = {},
  ...rest
}) => {
  const positioning = isAbsoluteOnDesktop
    ? 'lg:absolute relative'
    : 'relative';

  return (
    <div
      data-float="true"
      className={`${positioning} backdrop-blur-md bg-white/5 border border-white/14 rounded-[18px] p-4 text-white/90 shadow-glass-card will-change-transform ${className}`}
      style={{
        animation: `heroFloat ${durationSeconds}s ease-in-out ${delaySeconds}s infinite alternate`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
