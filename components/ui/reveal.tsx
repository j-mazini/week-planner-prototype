"use client";

import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const Reveal = ({ 
  children, 
  className = "", 
  threshold = 0.08, 
  rootMargin = '0px 0px -10% 0px',
  triggerOnce = true 
}: RevealProps) => {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const combinedClassName = `${className} ${inView ? 'visible' : ''}`.trim();

  return (
    <div ref={ref} className={combinedClassName}>
      {children}
    </div>
  );
};

