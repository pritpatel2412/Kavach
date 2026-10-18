import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-fit ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-heading font-medium tracking-tight transition-all cursor-pointer ${
              isActive
                ? 'bg-[#c8f542] text-[#0a2a12] font-semibold shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon && (
              // @ts-expect-error solar icon
              <iconify-icon icon={`solar:${tab.icon.replace(/^solar:/, '')}`} width="14" height="14" />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#0a2a12] text-[#c8f542]' : 'bg-white/10 text-white/80'
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
