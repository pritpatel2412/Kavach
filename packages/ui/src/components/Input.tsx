import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  variant?: 'search-pill' | 'text-input' | 'email-input' | 'default';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  variant = 'default',
  className = '',
  id,
  ...rest
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Variant styling per DESIGN.md:
  // - search-pill: rounded-full (540px), hairline border, surface fill
  // - text-input: rounded-full (540px), padding 9px 35px, surface fill, ink text
  // - email-input: rounded-md (8px), padding 9px 16px, surface fill
  // - default: rounded-md (8px), px-3.5 py-2.5, surface fill
  const variantStyles = {
    'search-pill': 'rounded-full px-4 py-2 border border-hairline bg-surface text-ink placeholder:text-muted',
    'text-input': 'rounded-full px-8 py-2.5 border border-hairline bg-surface text-ink placeholder:text-muted',
    'email-input': 'rounded-md px-4 py-2.5 border border-hairline bg-surface text-ink placeholder:text-muted',
    default: 'rounded-md px-3.5 py-2.5 border border-hairline bg-surface text-ink placeholder:text-muted',
  }[variant];

  const focusStyles = error
    ? 'border-hot focus:border-hot focus:ring-1 focus:ring-hot'
    : 'focus:border-primary focus:ring-1 focus:ring-primary';

  return (
    <div className="w-full text-left font-sans">
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-ui font-bold text-ink mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
          </span>
        )}

        <input
          id={generatedId}
          className={`w-full text-body font-medium transition-colors outline-none disabled:opacity-50 disabled:bg-canvas ${variantStyles} ${
            icon ? 'pl-10' : ''
          } ${focusStyles} ${className}`}
          {...rest}
        />
      </div>

      {error ? (
        <p className="mt-1 text-caption font-medium text-hot flex items-center gap-1">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:danger-circle-bold" width="12" height="12" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-caption text-body">{helperText}</p>
      ) : null}
    </div>
  );
};

