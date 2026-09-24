"use client";

import { useState, useEffect, useRef, RefObject } from 'react';

interface UseStickyPanelOptions {
  /**
   * Ref to the element that triggers the sticky behavior (usually the header)
   */
  triggerRef: RefObject<HTMLElement>;
  /**
   * Scroll threshold in pixels before activating sticky mode
   * @default 100
   */
  scrollThreshold?: number;
  /**
   * Whether to enable the sticky behavior
   * @default true
   */
  enabled?: boolean;
}

interface UseStickyPanelReturn {
  /**
   * Whether the panel should be in sticky mode
   */
  isSticky: boolean;
}

/**
 * Optimized hook to manage sticky panel behavior using IntersectionObserver
 * Much more performant than scroll listeners
 */
export function useStickyPanel({
  triggerRef,
  scrollThreshold = 100,
  enabled = true,
}: UseStickyPanelOptions): UseStickyPanelReturn {
  const [isSticky, setIsSticky] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use IntersectionObserver for better performance
  useEffect(() => {
    if (!enabled || !triggerRef.current) {
      setIsSticky(false);
      return;
    }

    // Fallback scroll check function
    const checkScroll = () => {
      if (!triggerRef.current) {
        setIsSticky(false);
        return;
      }

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const headerBottom = triggerRef.current.getBoundingClientRect().bottom;
      const shouldBeSticky = headerBottom <= 0 || scrollY > scrollThreshold;

      setIsSticky((prev) => (prev !== shouldBeSticky ? shouldBeSticky : prev));
    };

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use IntersectionObserver for better performance
    try {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            // When header is not intersecting (scrolled past), make sticky
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const shouldBeSticky = !entry.isIntersecting || scrollY > scrollThreshold;
            setIsSticky((prev) => (prev !== shouldBeSticky ? shouldBeSticky : prev));
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0,
        }
      );

      if (triggerRef.current) {
        observerRef.current.observe(triggerRef.current);
      }
    } catch (_e) {
      // Fallback to scroll listener
      checkScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Initial check
    checkScroll();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [triggerRef, scrollThreshold, enabled]);

  return {
    isSticky,
  };
}

