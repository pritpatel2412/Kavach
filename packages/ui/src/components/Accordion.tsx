'use client';

import React, { useState } from 'react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-3 font-body ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-md overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-heading font-medium tracking-tight text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <span>{item.question}</span>
              <span
                className={`ml-3 shrink-0 text-white/50 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#c8f542]' : ''
                }`}
              >
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:alt-arrow-down-linear" width="18" height="18" />
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-white/70 leading-relaxed border-t border-white/8 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
