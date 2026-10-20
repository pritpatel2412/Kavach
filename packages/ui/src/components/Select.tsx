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
          <span className="absolute left-3.5 text-muted pointer-events-none">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
          </span>
        )}

        <select
          id={generatedId}
          className={`w-full bg-surface border rounded-md py-2.5 text-body text-ink appearance-none transition-colors outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50 disabled:bg-canvas ${
            icon ? 'pl-10 pr-9' : 'pl-3.5 pr-9'
          } ${
            error ? 'border-hot focus:border-hot focus:ring-hot' : 'border-hairline'
          } ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface text-ink">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron indicator */}
        <span className="absolute right-3.5 text-muted pointer-events-none">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:alt-arrow-down-linear" width="16" height="16" />
        </span>
      </div>

      {error && (
        <p className="mt-1 text-caption text-hot flex items-center gap-1 font-medium">
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:danger-circle-bold" width="12" height="12" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

