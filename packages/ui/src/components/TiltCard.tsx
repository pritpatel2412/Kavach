'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTiltDeg?: number; // max ~6deg
  perspective?: number; // ~800
  isHighlighted?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTiltDeg = 6,
  perspective = 800,
  isHighlighted = false,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.set(el, { transformPerspective: perspective, transformStyle: 'preserve-3d' });

    const rotateXTo = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power2.out' });
    const rotateYTo = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power2.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width - 0.5) * 2; // -1 to 1
      const normY = (y / rect.height - 0.5) * 2; // -1 to 1

      // tilt: rotateX tilts up/down (negative when cursor is top)
      rotateXTo(-normY * maxTiltDeg);
      rotateYTo(normX * maxTiltDeg);
      yTo(-6); // hover -translate-y-1.5 (~6px)
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTiltDeg, perspective]);

  const highlightBorder = isHighlighted
    ? 'border-[rgba(200,245,66,0.30)] shadow-[0_0_25px_rgba(200,245,66,0.15)]'
    : 'border-white/12 hover:border-white/20';

  return (
    <div
      ref={cardRef}
      className={`relative backdrop-blur-md bg-white/5 border rounded-[20px] p-6 text-white/90 will-change-transform ${highlightBorder} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
