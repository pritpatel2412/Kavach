import React from 'react';

export interface SidebarCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;

  action?: React.ReactNode;
  children: React.ReactNode;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({
  title,
  action,
  children,
  className = '',
  ...rest
}) => {
  return (
    <aside
      className={`bg-surface border border-hairline rounded-md p-4 text-ink mb-3 ${className}`}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
          {title && <h4 className="text-ui font-bold text-ink">{title}</h4>}
          {action && <div className="text-caption text-primary font-bold">{action}</div>}
        </div>
      )}
      {children}
    </aside>
  );
};
