'use client';

import React from 'react';
import { Icon } from '@kavach/ui';

export function MockBanner() {
  return (
    <div className="bg-warning-surface text-warning-text px-4 py-2 text-micro font-mono font-bold flex items-center justify-between z-50 sticky top-0 border-b border-hairline">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <Icon name="shield-warning-bold" size={16} className="text-warning-text shrink-0" />
          <span>MOCK SIMULATION MODE ACTIVE — Zero Live Gnani Credits Burned · Pure Offline Test Data</span>
        </div>
        <span className="hidden sm:inline-block text-micro uppercase tracking-wider bg-surface text-warning-text border border-hairline px-2 py-0.5 rounded-sm font-mono font-bold">
          DEV/MOCK PORT 3001
        </span>
      </div>
    </div>
  );
}

