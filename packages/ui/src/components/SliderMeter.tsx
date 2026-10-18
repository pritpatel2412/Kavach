'use client';

import React, { useState } from 'react';

interface SliderMeterProps {
  label?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  className?: string;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}

export const SliderMeter: React.FC<SliderMeterProps> = ({
  label = 'Monthly Listening Quota',
  min = 0,
  max = 300,
  defaultValue = 120,
  unit = 'min',
  className = '',
  onChange,
  readOnly = false,
}) => {
  const [val, setVal] = useState<number>(defaultValue);

  const percentage = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const next = Number(e.target.value);
    setVal(next);
    onChange?.(next);
  };

  return (
    <div className={`w-full text-xs font-mono select-none ${className}`}>
      <div className="flex justify-between items-center mb-1.5 text-white/70">
        <span className="font-heading font-medium tracking-tight text-white/90">{label}</span>
        <span className="font-semibold text-[#c8f542]">
          {val} {unit}
        </span>
      </div>

      {/* Track container */}
      <div className="relative h-2.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
        {/* Animated fill width transition */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-[#c8f542] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!readOnly && (
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onChange={handleChange}
          aria-label={label}
          className="w-full mt-2 h-1 bg-transparent cursor-pointer accent-[#c8f542] opacity-75 hover:opacity-100 transition-opacity"
        />
      )}

      <div className="flex justify-between mt-1 text-[10px] text-white/40">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};
