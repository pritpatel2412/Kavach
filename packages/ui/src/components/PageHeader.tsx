import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`mb-6 pb-4 border-b border-hairline/80 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-caption text-muted">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-ink transition-colors font-medium">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-ink font-bold">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-heading-lg font-bold text-ink tracking-tight">{title}</h1>
          {badge}
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
      </div>

      {description && <p className="text-body font-medium text-body mt-1 max-w-3xl">{description}</p>}
    </div>
  );
};
