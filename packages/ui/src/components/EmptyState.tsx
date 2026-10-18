import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-line-bold',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-md text-white/80 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-[#c8f542] mb-3.5">
        {/* @ts-expect-error solar icon */}
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="24" height="24" />
      </div>

      <h4 className="font-heading font-semibold text-base tracking-tight text-white/90">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-white/60 max-w-sm mt-1 leading-relaxed">{description}</p>
      )}

      {actionLabel && onAction && (
        <Button variant="lime" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
