import React from 'react';

export interface AppShellProps {
  banner?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
}

export const AppShell: React.FC<AppShellProps> = ({
  banner,
  header,
  sidebar,
  footer,
  children,
  className = '',
  maxWidth = '7xl',
}) => {
  const maxWidthClass = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div className={`min-h-screen bg-canvas text-ink font-sans flex flex-col ${className}`}>
      {banner}
      {header}

      <div className="flex-1 flex flex-col">
        {sidebar ? (
          <div className={`${maxWidthClass} mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6 flex-1`}>
            <aside className="w-64 shrink-0 hidden md:block">{sidebar}</aside>
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        ) : (
          <main className={`${maxWidthClass} mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1`}>
            {children}
          </main>
        )}
      </div>

      {footer}
    </div>
  );
};
