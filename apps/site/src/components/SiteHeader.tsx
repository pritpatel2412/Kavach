'use client';

import React from 'react';
import { KavachLogo, Button, Icon } from '@kavach/ui';

interface SiteHeaderProps {
  currentPath?: string;
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  const navLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'Learn', href: '/learn' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
  ];

  return (
    <header className="relative z-20 px-6 py-4 sm:px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/[0.02]">
      {/* Brand */}
      <a href="/" className="flex items-center gap-2.5 focus:outline-none">
        <KavachLogo size={32} showWordmark={true} />
      </a>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = currentPath === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`text-xs font-heading font-medium tracking-tight transition-colors ${
                isActive ? 'text-[#c8f542]' : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <a
          href="/help"
          className="hidden sm:inline-flex text-xs font-heading font-medium tracking-tight text-white/60 hover:text-white transition-colors"
        >
          Support
        </a>
        <Button variant="ghost" size="sm" href="http://localhost:3001">
          Guardian App
        </Button>
        <Button variant="lime" size="sm" href="/pricing#waitlist">
          Join Waitlist
        </Button>
      </div>
    </header>
  );
}
