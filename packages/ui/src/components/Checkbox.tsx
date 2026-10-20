import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  error,
  className = '',
  id,
  ...rest
}) => {
  const generatedId = id || `chk-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <div className={`flex items-start gap-2.5 select-none text-left font-sans ${className}`}>
      <div className="flex items-center h-5 mt-0.5">
        <input
          type="checkbox"
          id={generatedId}
          className="h-4 w-4 rounded-xs border-hairline text-primary accent-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
          {...rest}
        />
      </div>

      <div className="text-caption">
        <label htmlFor={generatedId} className="font-bold text-ink cursor-pointer leading-tight block">
          {label}
        </label>
        {description && <p className="text-body font-medium mt-0.5 leading-normal">{description}</p>}
        {error && <p className="text-hot font-medium mt-1">{error}</p>}
      </div>
    </div>
  );
};

