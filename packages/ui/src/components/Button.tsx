import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline-green' | 'outline-neutral' | 'muted' | 'tag' | 'danger' | 'link' | 'lime' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  ...rest
}) => {
  // Normalize legacy variants
  let resolvedVariant = variant;
  if (variant === 'lime') resolvedVariant = 'primary';
  if (variant === 'ghost') resolvedVariant = 'outline-neutral';

  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-normal transition-colors duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = resolvedVariant === 'tag'
    ? 'text-caption px-2 py-0.5 rounded-md gap-1'
    : {
        sm: 'text-caption h-7 px-3 rounded-full gap-1.5',
        md: 'text-ui h-9 px-3.5 rounded-full gap-2',
        lg: 'text-body h-11 px-5 rounded-full gap-2.5',
      }[size];

  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-green-strong shadow-sm border border-transparent',
    'outline-green': 'bg-surface text-primary border border-primary hover:bg-discount-surface',
    'outline-neutral': 'bg-surface text-ink border border-hairline hover:bg-canvas hover:border-body/40',
    muted: 'bg-surface text-body border border-hairline hover:text-ink hover:bg-canvas',
    tag: 'bg-surface text-ink border border-hairline hover:bg-canvas rounded-md',
    danger: 'bg-hot text-white hover:bg-red-700 shadow-sm border border-transparent',
    link: 'text-primary hover:underline underline-offset-4 p-0 bg-transparent rounded-none h-auto font-bold',
    lime: 'bg-primary text-on-primary hover:bg-green-strong shadow-sm border border-transparent',
    ghost: 'bg-surface text-ink border border-hairline hover:bg-canvas',
  }[resolvedVariant];

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        // @ts-expect-error solar icon
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        // @ts-expect-error solar icon
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {content}
    </button>
  );
};
