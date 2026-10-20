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
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-md border border-hairline bg-surface text-ink ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-canvas border border-hairline text-primary mb-3.5">
        {/* @ts-expect-error solar icon */}
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="24" height="24" />
      </div>

      <h4 className="font-heading font-bold text-heading text-ink">
        {title}
      </h4>

      {description && (
        <p className="text-body font-medium text-body max-w-sm mt-1.5 leading-relaxed">{description}</p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

