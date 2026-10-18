import React from 'react';

export interface ToastProps {
  id?: string;
  title: string;
  message?: string;
  variant?: 'lime' | 'amber' | 'red' | 'info';
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'lime',
  onClose,
  className = '',
}) => {
  const meta = {
    lime: {
      border: 'border-[#c8f542]/40',
      icon: 'check-circle-bold',
      iconColor: 'text-[#c8f542]',
    },
    amber: {
      border: 'border-[#f5b942]/40',
      icon: 'danger-triangle-bold',
      iconColor: 'text-[#f5b942]',
    },
    red: {
      border: 'border-[#ff5a4d]/50',
      icon: 'siren-bold',
      iconColor: 'text-[#ff5a4d]',
    },
    info: {
      border: 'border-white/20',
      icon: 'info-circle-bold',
      iconColor: 'text-white/80',
    },
  }[variant];

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-3.5 rounded-2xl bg-[#0d3617]/95 backdrop-blur-md border shadow-xl text-white/90 max-w-sm font-body ${meta.border} ${className}`}
    >
      <span className={`shrink-0 mt-0.5 ${meta.iconColor}`}>
        {/* @ts-expect-error solar icon */}
        <iconify-icon icon={`solar:${meta.icon}`} width="20" height="20" />
      </span>

      <div className="flex-1 text-xs">
        <h4 className="font-heading font-semibold text-white/95 leading-tight">{title}</h4>
        {message && <p className="text-white/60 mt-0.5 leading-normal">{message}</p>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss toast"
          className="text-white/40 hover:text-white p-0.5 transition-colors"
        >
          {/* @ts-expect-error solar icon */}
          <iconify-icon icon="solar:close-circle-linear" width="16" height="16" />
        </button>
      )}
    </div>
  );
};
