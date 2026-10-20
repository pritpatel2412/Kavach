'use client';

import React from 'react';
import { Icon } from '@kavach/ui';

interface AdminBannerProps {
  env?: 'LOCAL' | 'STAGING' | 'PROD';
  isDemoData?: boolean;
  onOpenCommandPalette?: () => void;
}

export function AdminBanner({
  env = 'LOCAL',
  isDemoData = true,
  onOpenCommandPalette,
}: AdminBannerProps) {
  return (
    <div className="bg-warning-surface text-warning-text px-4 py-2 text-micro font-mono font-bold flex items-center justify-between sticky top-0 z-50 border-b border-hairline">
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-sm bg-surface border border-hairline text-warning-text font-bold text-micro tracking-wider uppercase">
            ADMIN
          </span>
          <span className="text-micro font-bold text-warning-text hidden sm:inline">
            Security Operations Console &amp; System Administration
          </span>
          {isDemoData && (
            <span className="px-2 py-0.5 rounded-sm bg-surface/60 text-warning-text border border-hairline text-micro font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning-text animate-pulse" />
              DEMO DATASET ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface hover:bg-canvas text-ink text-micro border border-hairline transition-all cursor-pointer font-bold"
            title="Open Command Palette"
          >
            <Icon name="magnifer-outline" size={13} />
            <span>Search (Ctrl+K)</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-sm text-micro tracking-widest uppercase font-mono font-bold ${
                env === 'PROD'
                  ? 'bg-hot text-on-primary'
                  : env === 'STAGING'
                  ? 'bg-warm text-on-primary'
                  : 'bg-surface text-warning-text border border-hairline'
              }`}
            >
              ENV: {env}
            </span>
            <span className="hidden lg:inline text-micro text-warning-text font-mono font-bold">
              PORT 3002
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

