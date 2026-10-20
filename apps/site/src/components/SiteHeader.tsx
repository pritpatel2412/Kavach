'use client';

import React, { useState } from 'react';
import { KavachLogo, Button } from '@kavach/ui';

interface SiteHeaderProps {
  currentPath?: string;
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { label: 'All Alerts', href: '/' },
    { label: 'Digital Arrest', href: '/learn/digital-arrest' },
    { label: 'Customs & Courier', href: '/learn/courier-parcel' },
    { label: 'Bank KYC / OTP', href: '/learn/kyc-otp' },
    { label: 'Detection Engine', href: '/features' },
    { label: 'Pricing & Plans', href: '/pricing' },
    { label: 'System Status', href: '/status' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-hairline font-sans">
      {/* Primary Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Menu Pill */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 focus:outline-none">
            <KavachLogo size={32} showWordmark={true} />
          </a>

          {/* Outline Neutral Menu Button */}
          <Button
            variant="outline-neutral"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            icon="hamburger-menu-linear"
          >
            Menü
          </Button>
        </div>

        {/* Search Pill (Full-Round 540px) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2">
          <div className="relative w-full flex items-center">
            <span className="absolute left-3.5 text-muted pointer-events-none flex items-center">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:magnifer-linear" width="18" height="18" />
            </span>
            <input
              type="text"
              placeholder="Search scams, numbers, advisories..."
              className="w-full h-9 pl-10 pr-4 rounded-full border border-hairline bg-surface text-ink text-body placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Text Links & Actions */}
        <div className="flex items-center gap-4">
          <a
            href="/learn"
            className="hidden lg:inline-flex text-ui font-bold text-ink hover:text-primary transition-colors"
          >
            Scam Alerts
          </a>
          <a
            href="http://localhost:3001/auth"
            className="hidden sm:inline-flex text-ui font-bold text-ink hover:text-primary transition-colors"
          >
            Einloggen
          </a>

          {/* Brand Green Action: Outline Green button */}
          <Button
            variant="outline-green"
            size="sm"
            href="/pricing#waitlist"
            icon="shield-plus-linear"
          >
            + Get Kavach
          </Button>

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="sm"
            href="http://localhost:3001"
            className="hidden sm:inline-flex"
          >
            Guardian App
          </Button>
        </div>
      </div>

      {/* Category Strip Below */}
      <div className="border-t border-hairline bg-surface hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-6 overflow-x-auto text-caption font-bold">
          {categories.map((cat) => {
            const isActive = currentPath === cat.href;
            return (
              <a
                key={cat.href}
                href={cat.href}
                className={`whitespace-nowrap transition-colors hover:text-primary ${
                  isActive ? 'text-primary border-b-2 border-primary py-2' : 'text-body'
                }`}
              >
                {cat.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-surface p-4 space-y-3">
          <div className="relative w-full flex items-center mb-3">
            <span className="absolute left-3.5 text-muted pointer-events-none flex items-center">
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:magnifer-linear" width="18" height="18" />
            </span>
            <input
              type="text"
              placeholder="Search scams..."
              className="w-full h-9 pl-10 pr-4 rounded-full border border-hairline bg-surface text-ink text-body placeholder:text-muted focus:border-primary outline-none"
            />
          </div>
          <div className="flex flex-col space-y-2">
            {categories.map((cat) => (
              <a
                key={cat.href}
                href={cat.href}
                className="text-ui font-bold text-ink py-1.5 hover:text-primary"
              >
                {cat.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-hairline flex flex-col gap-2">
            <Button variant="primary" size="md" href="http://localhost:3001" className="w-full">
              Guardian Dashboard
            </Button>
            <Button variant="outline-neutral" size="md" href="http://localhost:3001/auth" className="w-full">
              Einloggen
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

