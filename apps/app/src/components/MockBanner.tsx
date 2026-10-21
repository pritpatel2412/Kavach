'use client';

import React from 'react';

export function MockBanner() {
  return (
    <div className="bg-canvas text-body px-4 py-1.5 text-caption font-medium flex items-center justify-between z-50 sticky top-0 border-b border-hairline select-none">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface border border-hairline text-micro font-bold text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Demo mode</span>
          </span>
          <span className="text-xs text-muted hidden sm:inline">
            Offline simulated environment with role-played calls. No live telecom audio is streamed.
          </span>
        </div>
        <span className="text-micro text-muted font-bold tracking-wide uppercase">
          Sample data
        </span>
      </div>
    </div>
  );
}
