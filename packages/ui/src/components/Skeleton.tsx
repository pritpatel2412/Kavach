import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'full' | 'md' | 'xl' | '2xl';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  style = {},
  ...rest
}) => {
  const roundedClasses = {
    full: 'rounded-full',
    md: 'rounded-md',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-white/10 ${roundedClasses} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
};
