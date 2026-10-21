'use client';

import React, { useState, useEffect } from 'react';
import { KavachLogo, Button } from '@kavach/ui';
import { BRAND } from '@kavach/api-contract';

interface SiteHeaderProps {

  currentPath?: string;
  lang?: 'en' | 'hi' | 'gu';
  onLangChange?: (lang: 'en' | 'hi' | 'gu') => void;
}

export function SiteHeader({ currentPath, lang = 'en', onLangChange }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Esc key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Learn', href: '/learn' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <>
      {/* 1. Slim Top Utility Bar with Helpline and Language Switcher */}
      <div className="bg-canvas border-b border-hairline/80 text-caption font-medium text-body select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-hot animate-pulse shrink-0" />
            <span className="font-bold text-ink">National Cyber Helpline:</span>
            <a
              href="tel:1930"
              className="text-hot font-bold hover:underline"
              title="Call national cybercrime emergency helpline"
            >
              Dial 1930
            </a>
            <span className="hidden sm:inline text-muted">·</span>
            <span className="hidden sm:inline text-muted text-micro">
              National Cybercrime Reporting Portal (cybercrime.gov.in)
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onLangChange && (
              <div className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded-full border border-hairline text-micro font-bold">
                {(['en', 'hi', 'gu'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onLangChange(l)}
                    className={`px-1.5 py-0.2 rounded-full transition-colors ${
                      lang === l ? 'bg-primary text-white' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Single line, whitespace-nowrap, max 5 items + CTA) */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-hairline font-sans whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo + Navigation Links */}
          <div className="flex items-center gap-8 min-w-0">
            <a href="/" className="flex items-center gap-2.5 focus:outline-none shrink-0" aria-label="Kavach Home">
              <KavachLogo size={32} showWordmark={true} />
            </a>

            <nav className="hidden md:flex items-center gap-6 text-ui font-bold">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`transition-colors py-1 ${
                      isActive ? 'text-primary' : 'text-body hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Search Bar / Collapsible Search + Actions */}
          <div className="flex items-center gap-3">
            {/* Search input: full on xl, toggle button below xl */}
            <div className="hidden xl:flex items-center relative w-64">
              <span className="absolute left-3 text-muted pointer-events-none flex items-center">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:magnifer-linear" width="16" height="16" />
              </span>
              <input
                type="text"
                aria-label="Search scams, numbers, and advisories"
                placeholder="Search scams, numbers, advisories..."
                className="w-full h-8 pl-8 pr-3 rounded-full border border-hairline bg-surface text-ink text-caption placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="xl:hidden p-2 rounded-full text-body hover:text-ink hover:bg-canvas transition-colors"
              aria-label="Search"
            >
              {/* @ts-expect-error solar icon */}
              <iconify-icon icon="solar:magnifer-linear" width="18" height="18" />
            </button>

            {/* Sign in link */}
            <a
              href={`${BRAND.appUrl}/auth`}
              className="hidden sm:inline-flex text-ui font-bold text-body hover:text-primary transition-colors px-2 py-1"
            >
              Sign In
            </a>

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="sm"
              href={BRAND.appUrl}
              className="shrink-0"
            >
              Guardian App
            </Button>


            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full border border-hairline text-ink hover:bg-canvas transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {/* @ts-expect-error solar icon */}
              <iconify-icon
                icon={mobileMenuOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'}
                width="20"
                height="20"
              />
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Search Overlay */}
        {searchOpen && (
          <div className="xl:hidden px-4 py-2 border-t border-hairline bg-canvas">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted pointer-events-none flex items-center">
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:magnifer-linear" width="16" height="16" />
              </span>
              <input
                type="text"
                autoFocus
                aria-label="Search scams, numbers, and advisories"
                placeholder="Search scams, numbers, advisories..."
                className="w-full h-9 pl-9 pr-3 rounded-full border border-hairline bg-surface text-ink text-caption placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer with Focus Trap */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="fixed inset-y-0 right-0 w-72 bg-surface p-6 shadow-level-3 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <KavachLogo size={28} showWordmark={true} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-canvas"
                    aria-label="Close menu"
                  >
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:close-circle-bold" width="20" height="20" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-2 mt-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-ui font-bold text-ink py-2 px-3 rounded-full hover:bg-canvas transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href={`${BRAND.appUrl}/elder`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ui font-bold text-body py-2 px-3 rounded-full hover:bg-canvas transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Tabletop Kiosk</span>
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:external-link-linear" width="16" height="16" />
                  </a>
                </nav>
              </div>

              <div className="pt-4 border-t border-hairline space-y-2">
                <Button variant="primary" size="md" href={BRAND.appUrl} className="w-full">
                  Open Guardian App
                </Button>
                <Button variant="outline-neutral" size="md" href={`${BRAND.appUrl}/auth`} className="w-full">
                  Sign In to Account
                </Button>
              </div>

            </div>
          </div>
        )}
      </header>
    </>
  );
}
