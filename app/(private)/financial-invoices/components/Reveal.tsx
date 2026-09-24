import React, { memo } from 'react';
import { useInView } from "react-intersection-observer";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

export const Reveal = memo<RevealProps>(({ children, className = "" }) => {
  const { ref, inView } = useInView({
    threshold: 0.08,
    rootMargin: '0px 0px -10% 0px',
    triggerOnce: true,
  });

  const hasRevealClass = className.includes('reveal');
  const baseClasses = hasRevealClass 
    ? (inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10px]')
    : '';
  const transitionClasses = hasRevealClass && inView
    ? 'transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]' 
    : '';
  
  const combinedClassName = `${className} ${baseClasses} ${transitionClasses}`.trim();

  return (
    <div ref={ref} className={combinedClassName}>
      {children}
    </div>
  );
});

Reveal.displayName = 'Reveal';

