'use client';

import React from 'react';
import { Icon } from '@kavach/ui';

interface AdminBannerProps {
  env?: 'LOCAL' | 'STAGING' | 'PROD';
  isDemoData?: boolean;
  onOpenCommandPalette?: () => void;
}

export function AdminBanner({
  env = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'PROD' : 'LOCAL',
  isDemoData = false,
  onOpenCommandPalette,
}: AdminBannerProps) {
  return (
    <div className="h-8 bg-surface border-b border-hairline text-caption font-medium text-ink px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 select-none">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-micro font-bold tracking-wider uppercase bg-canvas border border-hairline text-body">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              env === 'PROD'
                ? 'bg-risk-emergency'
                : env === 'STAGING'
                ? 'bg-risk-caution'
                : 'bg-risk-calm'
            }`}
          />
          {env}
        </span>
        <span className="text-micro text-body hidden sm:inline">
          Kavach Security Operations &amp; Administration
        </span>
        {isDemoData && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-canvas border border-hairline text-micro font-bold text-body">
            <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
            DEMO DATA
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1.5 text-micro text-body hover:text-ink transition-colors font-medium cursor-pointer"
            title="Open Command Palette (Ctrl+K)"
          >
            <Icon name="magnifer-outline" size={12} />
            <span>Search</span>
            <kbd className="px-1 py-0.2 rounded bg-canvas border border-hairline text-[10px] text-muted">
              Ctrl+K
            </kbd>
          </button>
        )}
        <span className="text-micro text-muted font-bold">OPERATIONS</span>
      </div>
    </div>
  );
}

