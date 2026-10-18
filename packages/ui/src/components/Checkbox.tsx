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
    <div className={`flex items-start gap-3 select-none text-left font-body ${className}`}>
      <div className="flex items-center h-5 mt-0.5">
        <input
          type="checkbox"
          id={generatedId}
          className="h-4 w-4 rounded bg-white/5 border-white/20 text-[#c8f542] accent-[#c8f542] focus:ring-[#c8f542] focus:ring-offset-0 cursor-pointer"
          {...rest}
        />
      </div>

      <div className="text-xs">
        <label htmlFor={generatedId} className="font-medium text-white/90 cursor-pointer leading-tight block">
          {label}
        </label>
        {description && <p className="text-white/50 mt-0.5 leading-normal">{description}</p>}
        {error && <p className="text-[#ff5a4d] mt-1">{error}</p>}
      </div>
    </div>
  );
};
