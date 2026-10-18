'use client';

import React from 'react';
import { Icon } from '@kavach/ui';

export function AdminBanner() {
  return (
    <div className="bg-amber-400 text-stone-950 px-4 py-2 text-xs font-mono font-bold flex items-center justify-between sticky top-0 z-50 border-b-2 border-stone-950 shadow-md">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <Icon name="shield-warning-bold" size={18} color="#0c0a09" />
          <span className="tracking-wider">
            ADMIN [MOCK, NOT SECURE, DO NOT DEPLOY] — Synthetic Telemetry &amp; Mock Household Administration
          </span>
        </div>
        <span className="hidden sm:inline-block bg-stone-950 text-amber-300 px-2.5 py-0.5 rounded text-[10px] tracking-widest uppercase font-mono">
          PORT 3002 · INTERNAL USE ONLY
        </span>
      </div>
    </div>
  );
}
