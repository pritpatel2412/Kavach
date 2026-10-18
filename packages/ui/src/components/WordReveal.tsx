'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface WordRevealProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  triggerOnScroll?: boolean;
  delay?: number;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  children,
  as: Component = 'h1',
  className = '',
  triggerOnScroll = false,
  delay = 0.1,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const words = children.split(/\s+/);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const wordEls = el.querySelectorAll('.word-inner');

    const ctx = gsap.context(() => {
      if (triggerOnScroll) {
        gsap.fromTo(
          wordEls,
          {
            yPercent: 115,
            filter: 'blur(8px)',
            opacity: 0,
          },
          {
            yPercent: 0,
            filter: 'blur(0px)',
            opacity: 1,
            stagger: 0.06,
            ease: 'power4.out',
            duration: 1.1,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      } else {
        gsap.fromTo(
          wordEls,
          {
            yPercent: 115,
            filter: 'blur(8px)',
            opacity: 0,
          },
          {
            yPercent: 0,
            filter: 'blur(0px)',
            opacity: 1,
            stagger: 0.06,
            ease: 'power4.out',
            duration: 1.2,
            delay,
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [triggerOnScroll, delay]);

  return (
    <Component
      ref={containerRef as any}
      data-reveal-words="true"
      className={`inline-flex flex-wrap gap-x-[0.25em] leading-[1.1] ${className}`}
    >
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span className="word-inner inline-block transform-gpu will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
};
