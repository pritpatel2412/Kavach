import React from 'react';

export interface PillTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

export interface PillTabsProps {
  tabs: PillTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  size = 'md',
}) => {
  const itemPadding = size === 'sm' ? 'px-3 py-1 text-caption' : 'px-4 py-1.5 text-ui';

  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 p-1 bg-canvas border border-hairline rounded-full select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 font-bold rounded-full transition-all duration-180 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${itemPadding} ${
              isActive
                ? 'bg-surface text-ink shadow-sm border border-hairline/60'
                : 'text-muted hover:text-ink hover:bg-surface/40 border border-transparent'
            }`}
          >
            {tab.icon && (
              // @ts-expect-error solar icon
              <iconify-icon icon={`solar:${tab.icon.replace(/^solar:/, '')}`} width="16" height="16" />
            )}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-micro font-bold ${
                  isActive ? 'bg-canvas text-ink' : 'bg-surface text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
