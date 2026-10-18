import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
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

        <input
          id={generatedId}
          className={`w-full bg-white/5 border rounded-xl py-2.5 text-sm text-white/90 placeholder:text-white/30 backdrop-blur-md transition-all outline-none focus:border-[#c8f542] focus:ring-1 focus:ring-[#c8f542] disabled:opacity-50 ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
            error ? 'border-[#ff5a4d] focus:border-[#ff5a4d] focus:ring-[#ff5a4d]' : 'border-white/14'
          } ${className}`}
          {...rest}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-[#ff5a4d] flex items-center gap-1">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:danger-circle-bold" width="12" height="12" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-white/50">{helperText}</p>
      ) : null}
    </div>
  );
};
