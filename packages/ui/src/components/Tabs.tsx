import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

export const Tabs: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pill' | 'primary';
}> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'pill',
}) => {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        const activeStyles = variant === 'primary'
          ? 'bg-primary text-on-primary border-primary shadow-sm'
          : 'bg-ink text-surface border-ink shadow-sm';

        const inactiveStyles = 'bg-surface text-body border-hairline hover:bg-canvas hover:text-ink';

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-ui font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive ? activeStyles : inactiveStyles
            }`}
          >
            {tab.icon && (
              // @ts-expect-error solar icon
              <iconify-icon icon={`solar:${tab.icon.replace(/^solar:/, '')}`} width="16" height="16" />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-micro px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-surface/20 text-surface' : 'bg-canvas text-body'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

