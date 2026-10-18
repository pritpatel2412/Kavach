import React from 'react';

export type DeviceStatus = 'armed' | 'listening' | 'offline' | 'reconnecting';

interface StatusDotProps {
  status?: DeviceStatus;
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'listening',
  label,
  className = '',
}) => {
  const meta: Record<DeviceStatus, { color: string; pingColor: string; defaultLabel: string }> = {
    armed: {
      color: 'bg-[#c8f542]',
      pingColor: 'bg-[#c8f542]',
      defaultLabel: 'Armed & Ready',
    },
    listening: {
      color: 'bg-[#c8f542]',
      pingColor: 'bg-[#c8f542]',
      defaultLabel: 'Kavach is listening',
    },
    offline: {
      color: 'bg-[#ff5a4d]',
      pingColor: 'bg-[#ff5a4d]',
      defaultLabel: 'Device Offline',
    },
    reconnecting: {
      color: 'bg-[#f5b942]',
      pingColor: 'bg-[#f5b942]',
      defaultLabel: 'Reconnecting...',
    },
  };

  const current = meta[status] || meta.listening;
  const displayLabel = label || current.defaultLabel;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pingColor}`}
        />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${current.color}`} />
      </span>
      {displayLabel && (
        <span className="text-xs font-mono font-medium tracking-tight text-white/90">
          {displayLabel}
        </span>
      )}
    </div>
  );
};
