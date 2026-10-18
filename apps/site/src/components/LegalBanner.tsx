'use client';

import React from 'react';
import { Icon } from '@kavach/ui';

interface LegalBannerProps {
  category?: string;
}

export function LegalBanner({ category = 'Document' }: LegalBannerProps) {
  return (
    <div className="mb-8 p-3.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-200 text-xs font-mono flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon name="shield-warning-bold" size={18} color="#f5b942" />
        <span>
          <strong className="text-amber-300 uppercase tracking-wider font-semibold">DRAFT: Pending legal review</strong>
          {' — '}
          This {category.toLowerCase()} is published for private beta and technical evaluation under DPDP Act 2023 guidelines.
        </span>
      </div>
      <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] tracking-wide uppercase font-semibold">
        Beta Draft v0.9
      </span>
    </div>
  );
}
