import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'lime' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'lime',
  size = 'md',
  href,
  className = '',
  icon,
  iconPosition = 'left',
  children,
  ...rest
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-heading font-medium tracking-tight rounded-full transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8f542] disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  }[size];

  const variantStyles = {
    lime: 'bg-[#c8f542] text-[#0a2a12] font-semibold hover:bg-[#b5e332] hover:shadow-lime-glow active:scale-95',
    ghost:
      'border border-white/18 text-white/90 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/28 hover:scale-104 active:scale-95',
    danger:
      'bg-[#ff5a4d] text-white font-semibold hover:bg-[#eb4b3e] shadow-lg shadow-red-500/20 active:scale-95',
    link: 'text-[#c8f542] hover:underline underline-offset-4 p-0 bg-transparent',
  }[variant];

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        // @ts-expect-error solar icon
        <iconify-icon icon={`solar:${icon.replace(/^solar:/, '')}`} width="18" height="18" />
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
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
      {...rest}
    >
      {content}
    </button>
  );
};
