"use client";

import React, { memo, useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SCROLL_STEP = 120;

interface DashboardWidgetCardProps {
  children: React.ReactNode;
  /** Show drag handle and edit mode borders */
  showDragHandle: boolean;
}

function useHorizontalOverflow(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);

  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setLeft(scrollLeft > 2);
    setRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, containerRef]);

  return { canScrollLeft: left, canScrollRight: right };
}

function DashboardWidgetCardComponent({ children, showDragHandle }: DashboardWidgetCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight } = useHorizontalOverflow(scrollRef);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  }, []);
  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
  }, []);

  return (
    <div
      className={`
        h-full w-full min-h-0 flex flex-col overflow-hidden
        transition-[border-color,box-shadow,background-color] duration-200 ease-out
        ${showDragHandle
          ? "rounded-xl border-2 border-amber-400/90 bg-amber-50/30 shadow-md shadow-amber-900/5 ring-2 ring-amber-400/30"
          : "bg-transparent rounded-xl"
        }
      `}
    >
      {showDragHandle && (
        <div
          className="dashboard-widget-drag-handle flex-shrink-0 h-8 w-full cursor-grab active:cursor-grabbing flex items-center justify-center touch-none rounded-t-[10px] border-b border-amber-300/60 bg-gradient-to-b from-amber-100 to-amber-50/80 hover:from-amber-200 hover:to-amber-100/90 text-amber-800"
          aria-label="Drag to reposition"
        >
          <span className="text-xs font-medium select-none flex items-center gap-1">
            <span className="opacity-60">⋮⋮</span> Drag
          </span>
        </div>
      )}
      <div className="flex-1 min-h-0 relative rounded-b-xl group/scroll">
        <div
          ref={scrollRef}
          className="h-full w-full overflow-auto rounded-b-xl scroll-smooth"
        >
          {children}
        </div>
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            className={`
              absolute left-0 top-0 bottom-0 w-10 z-10 flex items-center justify-center
              bg-gradient-to-r from-slate-200/95 to-transparent opacity-0 group-hover/scroll:opacity-100
              hover:from-slate-300/95 transition-opacity duration-200 rounded-l-xl
              focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400
            `}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" aria-hidden />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            className={`
              absolute right-0 top-0 bottom-0 w-10 z-10 flex items-center justify-center
              bg-gradient-to-l from-slate-200/95 to-transparent opacity-0 group-hover/scroll:opacity-100
              hover:from-slate-300/95 transition-opacity duration-200 rounded-r-xl
              focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400
            `}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export const DashboardWidgetCard = memo(DashboardWidgetCardComponent);
