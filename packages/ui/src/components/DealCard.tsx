'use client';

import React from 'react';


export interface DealCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  thumbnail?: React.ReactNode | string;

  temperature?: number | string;
  isHot?: boolean;
  title: React.ReactNode;
  price?: React.ReactNode;
  originalPrice?: React.ReactNode;
  discount?: string;
  merchant?: string;
  author?: string;
  timestamp?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionHref?: string;
  commentCount?: number;
  children?: React.ReactNode;
}

export const DealCard: React.FC<DealCardProps> = ({
  thumbnail,
  temperature,
  isHot = true,
  title,
  price,
  originalPrice,
  discount,
  merchant,
  author,
  timestamp,
  primaryActionLabel = 'Zum Deal',
  onPrimaryAction,
  primaryActionHref,
  commentCount = 0,
  children,
  className = '',
  ...rest
}) => {
  return (
    <article
      className={`bg-surface border border-hairline rounded-md p-4 text-ink transition-shadow duration-150 hover:shadow-level-2 ${className}`}
      {...rest}
    >
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Media Column / Thumbnail */}
        {thumbnail && (
          <div className="w-full md:w-36 h-36 flex-shrink-0 bg-canvas rounded-md overflow-hidden flex items-center justify-center border border-hairline/60">
            {typeof thumbnail === 'string' ? (
              <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              thumbnail
            )}
          </div>
        )}

        {/* Content Column */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
          <div>
            {/* Meta Row: Timestamp, Merchant, Author */}
            <div className="flex items-center gap-2 text-caption text-body mb-1 flex-wrap">
              {merchant && <span className="font-bold text-ink">{merchant}</span>}
              {author && <span>von {author}</span>}
              {timestamp && (
                <span className="bg-canvas px-2 py-0.5 rounded-md text-caption text-body">
                  {timestamp}
                </span>
              )}
            </div>

            {/* Deal Title */}
            <h3 className="text-heading font-bold text-ink hover:text-primary transition-colors cursor-pointer leading-tight mb-2">
              {title}
            </h3>

            {/* Price Lockup & Temperature */}
            <div className="flex items-center gap-3 my-2 flex-wrap">
              {price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-heading-lg font-bold text-primary">{price}</span>
                  {originalPrice && (
                    <span className="text-ui font-medium text-muted line-through">
                      {originalPrice}
                    </span>
                  )}
                  {discount && (
                    <span className="bg-discount-surface text-green-strong text-ui font-bold px-2 py-0.5 rounded-sm">
                      {discount}
                    </span>
                  )}
                </div>
              )}

              {temperature !== undefined && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-hairline bg-surface text-ui font-bold">
                  <span className="text-cold select-none cursor-pointer">▼</span>
                  <span className="text-hot font-bold">{temperature}°</span>
                  <span className="text-hot select-none cursor-pointer">▲</span>
                </div>
              )}
            </div>

            {children}
          </div>

          {/* Card Foot Actions */}
          <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4 text-body text-caption font-medium">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-ink transition-colors p-1"
                aria-label="Comments"
              >
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:chat-dots-bold" width="16" height="16" />
                <span>{commentCount}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-ink transition-colors p-1"
                aria-label="Share"
              >
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:share-bold" width="16" height="16" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-ink transition-colors p-1"
                aria-label="Bookmark"
              >
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:bookmark-bold" width="16" height="16" />
              </button>
            </div>

            {primaryActionHref ? (
              <a
                href={primaryActionHref}
                className="inline-flex items-center justify-center bg-primary text-on-primary text-ui font-bold px-3.5 h-9 rounded-full hover:bg-green-strong transition-colors gap-1.5"
              >
                <span>{primaryActionLabel}</span>
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16" />
              </a>
            ) : onPrimaryAction ? (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center justify-center bg-primary text-on-primary text-ui font-bold px-3.5 h-9 rounded-full hover:bg-green-strong transition-colors gap-1.5"
              >
                <span>{primaryActionLabel}</span>
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};
