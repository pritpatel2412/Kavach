'use client';

import React, { useState } from 'react';
import { KavachLogo, Button } from '@kavach/ui';

interface SiteHeaderProps {
  currentPath?: string;
  lang?: 'en' | 'hi' | 'gu';
  onLangChange?: (lang: 'en' | 'hi' | 'gu') => void;
}

export function SiteHeader({ currentPath, lang = 'en', onLangChange }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Threat Intel', href: '/learn' },
    { label: 'Tabletop Kiosk', href: 'http://localhost:3001/elder', external: true },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-hairline font-sans transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5 focus:outline-none group">
            <KavachLogo size={34} showWordmark={true} />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-ui font-bold text-body">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer' : undefined}
                  className={`transition-colors hover:text-primary ${
                    isActive ? 'text-primary font-bold' : 'text-body hover:text-ink'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Search Pill (Full-Round 540px with D-008 Accessible Aria Label) */}
        <div className="hidden xl:flex items-center relative max-w-xs w-full">
          <span className="absolute left-3.5 text-muted pointer-events-none flex items-center">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:magnifer-linear" width="16" height="16" />
          </span>
          <input
            type="text"
            aria-label="Search scams, numbers, and advisories"
            placeholder="Search scams, numbers, advisories..."
            className="w-full h-8 pl-9 pr-3 rounded-full border border-hairline bg-surface text-ink text-xs placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        {/* Center / Right Quick Action: 1930 Emergency Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200/80 rounded-full text-xs font-bold text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span>National Cyber Helpline: </span>
          <a href="tel:1930" className="underline hover:text-red-900 font-bold font-mono">
            Dial 1930
          </a>
        </div>

        {/* Right Section: Language Toggle, Login, CTA */}
        <div className="flex items-center gap-3">
          {/* Multilingual Selector */}
          {onLangChange && (
            <div className="hidden sm:flex items-center gap-0.5 bg-canvas p-1 rounded-full border border-hairline text-caption font-bold">
              {(['en', 'hi', 'gu'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLangChange(l)}
                  className={`px-2 py-0.5 rounded-full transition-all text-xs font-bold ${
                    lang === l ? 'bg-primary text-white shadow-sm' : 'text-body hover:text-ink'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Sign In Link (English) */}
          <a
            href="http://localhost:3001/auth"
            className="hidden sm:inline-flex text-ui font-bold text-body hover:text-primary transition-colors px-2 py-1"
          >
            Sign In
          </a>

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="sm"
            href="http://localhost:3001"
            className="font-bold shadow-sm"
          >
            Guardian App
          </Button>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-hairline text-ink hover:bg-canvas transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon={mobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="20" height="20" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-hairline bg-surface p-4 space-y-4 shadow-lg animate-in fade-in duration-200">
          {/* 1930 Alert in Mobile */}
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              National Cyber Helpline:
            </span>
            <a href="tel:1930" className="underline font-bold font-mono">
              Dial 1930
            </a>
          </div>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                className="text-ui font-bold text-ink py-2 px-3 rounded-lg hover:bg-canvas hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Language Selector Mobile */}
          {onLangChange && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-hairline text-xs font-bold">
              <span className="text-body">Language / भाषा:</span>
              <div className="flex gap-1">
                {(['en', 'hi', 'gu'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      onLangChange(l);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      lang === l ? 'bg-primary text-white' : 'bg-surface text-body border border-hairline'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-hairline flex flex-col gap-2">
            <Button variant="primary" size="md" href="http://localhost:3001" className="w-full">
              Open Guardian App
            </Button>
            <Button variant="outline-neutral" size="md" href="http://localhost:3001/auth" className="w-full">
              Sign In to Account
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
