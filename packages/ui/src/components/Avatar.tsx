import React from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-7 h-7 text-micro',
    md: 'w-9 h-9 text-caption',
    lg: 'w-12 h-12 text-ui',
  }[size];

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-circle bg-canvas text-body font-bold ring-2 ring-surface border border-hairline overflow-hidden flex-shrink-0 ${sizeStyles} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
