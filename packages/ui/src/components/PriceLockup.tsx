import React from 'react';
import { DiscountBadge } from './DiscountBadge';

export interface PriceLockupProps {
  price: string | number;
  originalPrice?: string | number;
  discount?: string;
  currency?: string;
  period?: string;
  className?: string;
}

export const PriceLockup: React.FC<PriceLockupProps> = ({
  price,
  originalPrice,
  discount,
  currency = '',
  period = '',
  className = '',
}) => {
  return (
    <div className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
      {/* Primary Green Current Price */}
      <div className="flex items-baseline">
        <span className="text-heading-lg font-bold text-primary">
          {currency}
          {price}
        </span>
        {period && (
          <span className="text-caption font-medium text-body ml-1">{period}</span>
        )}
      </div>

      {/* Struck-through Muted Original Price */}
      {originalPrice && (
        <span className="text-body font-medium text-muted line-through">
          {currency}
          {originalPrice}
        </span>
      )}

      {/* Soft Mint Discount Badge */}
      {discount && <DiscountBadge>{discount}</DiscountBadge>}
    </div>
  );
};
