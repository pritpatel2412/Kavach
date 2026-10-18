import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  icon?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  icon,
  className = '',
  id,
  ...rest
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left font-body">
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-xs font-heading font-medium tracking-tight text-white/80 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-white/40 pointer-events-none">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
          </span>
        )}

        <select
          id={generatedId}
          className={`w-full bg-[#0d3617] border rounded-xl py-2.5 text-sm text-white/90 appearance-none backdrop-blur-md transition-all outline-none focus:border-[#c8f542] focus:ring-1 focus:ring-[#c8f542] cursor-pointer disabled:opacity-50 ${
            icon ? 'pl-10 pr-9' : 'pl-3.5 pr-9'
          } ${
            error ? 'border-[#ff5a4d] focus:border-[#ff5a4d]' : 'border-white/14'
          } ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a2a12] text-white">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron indicator */}
        <span className="absolute right-3.5 text-white/40 pointer-events-none">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:alt-arrow-down-linear" width="16" height="16" />
        </span>
      </div>

      {error && (
        <p className="mt-1 text-xs text-[#ff5a4d] flex items-center gap-1">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:danger-circle-bold" width="12" height="12" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
