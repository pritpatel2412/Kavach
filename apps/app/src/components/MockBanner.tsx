'use client';

import React from 'react';
import { Icon } from '@kavach/ui';

export function MockBanner() {
  return (
    <div className="bg-amber-400 text-stone-950 px-4 py-1.5 text-xs font-mono font-bold flex items-center justify-between z-50 sticky top-0 border-b border-amber-500 shadow-sm">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <Icon name="shield-warning-bold" size={16} color="#0c0a09" />
          <span>MOCK SIMULATION MODE ACTIVE — Zero Live Gnani Credits Burned · Pure Offline Test Data</span>
        </div>
        <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider bg-stone-900 text-amber-300 px-2 py-0.5 rounded font-mono">
          DEV/MOCK PORT 3001
        </span>
      </div>
    </div>
  );
}
