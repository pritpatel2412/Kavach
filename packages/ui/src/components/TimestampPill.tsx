import React from 'react';

export interface TimestampPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const TimestampPill: React.FC<TimestampPillProps> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <span
      className={`inline-flex items-center bg-canvas text-body text-caption font-medium px-2 py-0.5 rounded-md ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
