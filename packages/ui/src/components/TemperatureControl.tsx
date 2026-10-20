'use client';

import React from 'react';


export interface TemperatureControlProps {
  value: number;
  unit?: string;
  onUpVote?: () => void;
  onDownVote?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TemperatureControl: React.FC<TemperatureControlProps> = ({
  value,
  unit = '°',
  onUpVote,
  onDownVote,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-caption px-2 py-0.5 gap-1',
    md: 'text-ui px-3 py-1 gap-2',
    lg: 'text-lead px-4 py-1.5 gap-2.5',
  }[size];

  // If value is negative or cold, reading can be cold; per spec, reading is typically hot-red
  const isCold = value < 0;
  const valueColor = isCold ? 'text-cold' : 'text-hot';

  return (
    <div
      role="group"
      aria-label={`Temperature rating ${value}${unit}`}
      className={`inline-flex items-center rounded-full border border-hairline bg-surface select-none shadow-sm ${sizeStyles} ${className}`}
    >
      {/* Cold Blue Down-Arrow */}
      <button
        type="button"
        onClick={onDownVote}
        disabled={disabled || !onDownVote}
        aria-label="Decrease temperature (cold vote)"
        className="text-cold hover:opacity-75 active:scale-90 transition-transform font-bold p-0.5 disabled:opacity-40 disabled:cursor-default cursor-pointer flex items-center justify-center"
      >
        ▼
      </button>

      {/* Temperature Degree Reading */}
      <span className={`${valueColor} font-bold tracking-tight px-0.5`}>
        {value > 0 ? `+${value}` : value}
        {unit}
      </span>

      {/* Hot Red Up-Arrow */}
      <button
        type="button"
        onClick={onUpVote}
        disabled={disabled || !onUpVote}
        aria-label="Increase temperature (hot vote)"
        className="text-hot hover:opacity-75 active:scale-90 transition-transform font-bold p-0.5 disabled:opacity-40 disabled:cursor-default cursor-pointer flex items-center justify-center"
      >
        ▲
      </button>
    </div>
  );
};
