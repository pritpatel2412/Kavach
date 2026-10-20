'use client';

import React from 'react';

interface LegalBannerProps {
  category?: string;
}

export function LegalBanner({ category = 'Document' }: LegalBannerProps) {
  return (
    <div className="mb-6 p-3.5 rounded-md border border-warning-surface bg-warning-surface text-warning-text text-caption font-mono flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {/* @ts-expect-error solar icon */}
        <iconify-icon icon="solar:shield-warning-bold" width="18" height="18" />
        <span>
          <strong className="uppercase tracking-wider font-bold">DRAFT: Pending legal review</strong>
          {' — '}
          This {category.toLowerCase()} is published for private beta and technical evaluation under DPDP Act 2023 guidelines.
        </span>
      </div>
      <span className="hidden sm:inline-block px-2 py-0.5 rounded-sm bg-surface text-warning-text border border-warning-text/20 text-micro tracking-wide uppercase font-bold">
        Beta Draft v0.9
      </span>
    </div>
  );
}

