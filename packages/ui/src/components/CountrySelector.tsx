'use client';

import React, { useState } from 'react';


export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface CountrySelectorProps {
  options?: CountryOption[];
  selected?: string;
  onChange?: (code: string) => void;
  className?: string;
}

const DEFAULT_OPTIONS: CountryOption[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
];

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  options = DEFAULT_OPTIONS,
  selected = 'IN',
  onChange,
  className = '',
}) => {
  const [current, setCurrent] = useState(selected);
  const selectedCountry = options.find((o) => o.code === current) || options[0];

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={current}
        onChange={(e) => {
          setCurrent(e.target.value);
          onChange?.(e.target.value);
        }}
        aria-label="Select Country"
        className="appearance-none bg-surface border border-hairline rounded-md px-3 py-1.5 pr-8 text-ui font-medium text-ink cursor-pointer hover:border-body/40 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.flag} {opt.name}
          </option>
        ))}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">
        ▼
      </span>
    </div>
  );
};
