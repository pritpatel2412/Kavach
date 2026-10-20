import React from 'react';

export interface DiscountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center bg-discount-surface text-green-strong text-ui font-bold px-2 py-1 rounded-sm select-none ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
