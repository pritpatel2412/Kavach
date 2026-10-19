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
    <div className="bg-amber-400 text-stone-950 px-4 py-1.5 text-xs font-mono font-bold flex items-center justify-between sticky top-0 z-50 border-b-2 border-stone-950 shadow-md">
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-stone-950 text-amber-300 font-extrabold text-[11px] tracking-wider uppercase">
            ADMIN
          </span>
          <span className="text-[11px] font-semibold text-stone-900 hidden sm:inline">
            Security Operations Console &amp; System Administration
          </span>
          {isDemoData && (
            <span className="px-2 py-0.5 rounded bg-amber-600/20 text-stone-950 border border-stone-900/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
              DEMO DATASET ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 text-[11px] border border-stone-950/20 transition-all cursor-pointer"
            title="Open Command Palette"
          >
            <Icon name="magnifer-outline" size={13} />
            <span>Search (Ctrl+K)</span>
          </button>

          <div className="flex items-center gap-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] tracking-widest uppercase font-mono font-bold ${
                env === 'PROD'
                  ? 'bg-rose-600 text-white'
                  : env === 'STAGING'
                  ? 'bg-amber-600 text-stone-950'
                  : 'bg-stone-950 text-amber-300'
              }`}
            >
              ENV: {env}
            </span>
            <span className="hidden lg:inline text-[10px] text-stone-900 font-medium">
              PORT 3002
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
