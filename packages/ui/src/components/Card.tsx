import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  padding = 'lg',
  className = '',
  children,
  ...rest
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[padding];

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-hairline-dark hover:shadow-level-2 transition-all duration-180 ease-out hover:-translate-y-[1px]'
    : '';

  return (
    <div
      className={`bg-surface border border-hairline rounded-md text-ink ${paddingStyles} ${interactiveStyles} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
