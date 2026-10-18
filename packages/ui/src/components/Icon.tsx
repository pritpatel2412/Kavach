import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string; // e.g. "shield-check-bold", "phone-calling-broken"
  size?: number | string;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color,
  ...rest
}) => {
  // Ensure the solar: prefix is enforced
  const cleanName = name.replace(/^solar:/, '');
  const iconFullName = `solar:${cleanName}`;

  return (
    // @ts-expect-error iconify-icon custom element
    <iconify-icon
      icon={iconFullName}
      width={size}
      height={size}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        verticalAlign: 'middle',
      }}
      class={className}
      {...rest}
    />
  );
};
