import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...rest
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const focusStyles = error
    ? 'border-hot focus:border-hot focus:ring-1 focus:ring-hot'
    : 'border-hairline focus:border-primary focus:ring-1 focus:ring-primary';

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

      <textarea
        id={generatedId}
        rows={rows}
        className={`w-full text-body font-medium transition-colors outline-none bg-surface rounded-md p-3 text-ink placeholder:text-muted disabled:opacity-50 disabled:bg-canvas ${focusStyles} ${className}`}
        {...rest}
      />

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
