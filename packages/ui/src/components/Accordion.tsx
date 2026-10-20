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
    <div className={`space-y-3 font-sans ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="rounded-md border border-hairline bg-surface overflow-hidden transition-shadow hover:shadow-level-2"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 text-left text-ui font-bold text-ink hover:text-primary transition-colors cursor-pointer"
            >
              <span>{item.question}</span>
              <span
                className={`ml-3 shrink-0 text-muted transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-primary' : ''
                }`}
              >
                {/* @ts-expect-error solar icon */}
                <iconify-icon icon="solar:alt-arrow-down-linear" width="18" height="18" />
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 text-caption font-medium text-body leading-relaxed border-t border-hairline pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

