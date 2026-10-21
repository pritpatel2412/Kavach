'use client';

import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  size = 'md',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-240 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Surface */}
      <div
        className={`relative w-full ${sizeClasses} bg-surface border border-hairline rounded-md p-6 shadow-level-3 text-ink z-10 overflow-hidden transform transition-all ${className}`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h3 className="font-heading font-bold text-heading tracking-tight text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-caption text-body mt-0.5">{description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-full text-muted hover:text-ink hover:bg-canvas transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:close-circle-bold" width="20" height="20" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

