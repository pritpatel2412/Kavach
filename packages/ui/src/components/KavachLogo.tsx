import React from 'react';

interface KavachLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const KavachLogo: React.FC<KavachLogoProps> = ({
  className = '',
  size = 30,
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Original SVG mark: viewBox 0 0 30 30, stroke #c8f542; shield outline with sound-wave arcs */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Kavach Shield Logo"
      >
        {/* Outer shield outline */}
        <path
          d="M15 3L5 7.5V14.5C5 20.8 9.3 26.2 15 27.5C20.7 26.2 25 20.8 25 14.5V7.5L15 3Z"
          stroke="#30a83c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner sound-wave arcs */}
        <path
          d="M15 10V20"
          stroke="#30a83c"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11 12.5C10.4 13.3 10 14.1 10 15C10 15.9 10.4 16.7 11 17.5"
          stroke="#30a83c"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M19 12.5C19.6 13.3 20 14.1 20 15C20 15.9 19.6 16.7 19 17.5"
          stroke="#30a83c"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="font-heading font-bold text-lg tracking-tight text-ink">
          Kavach
        </span>
      )}
    </div>
  );
};
