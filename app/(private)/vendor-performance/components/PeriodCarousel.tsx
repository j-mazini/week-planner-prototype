"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import type { PerformancePeriodOption } from "../hooks/useAvailablePerformancePeriods";

interface PeriodCarouselProps {
  periods: PerformancePeriodOption[];
  selectedYear: number;
  selectedMonth: number; // 0-based
  onSelect: (year: number, month: number) => void; // 0-based
  loading?: boolean;
  className?: string;
}

export const PeriodCarousel = memo(function PeriodCarousel({
  periods,
  selectedYear,
  selectedMonth,
  onSelect,
  loading: _loading = false,
  className = "",
}: PeriodCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const DRAG_THRESHOLD_PX = 6;

  const fallbackLast12 = useMemo<PerformancePeriodOption[]>(() => {
    const today = new Date();
    const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad2 = (n: number) => String(n).padStart(2, "0");

    const out: PerformancePeriodOption[] = [];
    // Oldest -> newest (past months on the left)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const value = `${year}-${pad2(month + 1)}`;
      const label = `${monthShort[month]} ${year}`;
      out.push({ year, month, value, label });
    }
    return out;
  }, []);

  const normalized = useMemo(() => {
    // If API-derived periods are empty (or still loading), fall back to last 12 months so the UI never "disappears".
    const base = periods && periods.length > 0 ? periods : fallbackLast12;

    // Defensive: ensure unique + stable ordering (keep insertion order from base).
    const dedup = new Map<string, PerformancePeriodOption>();
    for (const p of base) {
      dedup.set(p.value, p);
    }
    // Ensure chronological order: past months on the left.
    return Array.from(dedup.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [periods, fallbackLast12]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    
    const scrollToActive = () => {
      const active = container.querySelector<HTMLElement>('[data-active="true"]');
      if (active) {
        // Centraliza o item ativo no carousel
        const containerRect = container.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const scrollLeft = active.offsetLeft - (containerRect.width / 2) + (activeRect.width / 2);
        container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
      }
    };

    // Aguarda um pouco para garantir que o DOM está renderizado
    const timer = setTimeout(scrollToActive, 150);
    
    // Também tenta quando o container estiver pronto
    if (container.scrollWidth > 0) {
      scrollToActive();
    }
    
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth, normalized.length]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scroll-smooth cursor-grab active:cursor-grabbing select-none touch-pan-x"
        style={{ scrollbarWidth: 'thin' }}
        role="listbox"
        aria-label="Select period"
        onPointerDown={(e) => {
          const container = carouselRef.current;
          if (!container) return;
          isDraggingRef.current = false;
          dragMovedRef.current = false;
          dragPointerIdRef.current = e.pointerId;
          dragStartXRef.current = e.clientX;
          dragStartScrollLeftRef.current = container.scrollLeft;
        }}
        onPointerMove={(e) => {
          const container = carouselRef.current;
          if (!container) return;
          if (dragPointerIdRef.current !== e.pointerId) return;
          const dx = e.clientX - dragStartXRef.current;
          if (!isDraggingRef.current) {
            if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
            isDraggingRef.current = true;
            dragMovedRef.current = true;
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {
              // ignore
            }
          }
          container.scrollLeft = dragStartScrollLeftRef.current - dx;
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
          dragPointerIdRef.current = null;
          setTimeout(() => {
            dragMovedRef.current = false;
          }, 0);
        }}
        onPointerCancel={() => {
          isDraggingRef.current = false;
          dragPointerIdRef.current = null;
          dragMovedRef.current = false;
        }}
        onWheel={(e) => {
          const container = carouselRef.current;
          if (!container) return;
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        {normalized.map((p) => {
          const isActive = p.year === selectedYear && p.month === selectedMonth;
          return (
            <button
              key={p.value}
              type="button"
              data-active={isActive}
              onClick={() => {
                if (dragMovedRef.current) return;
                onSelect(p.year, p.month);
              }}
              className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 border flex-shrink-0
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                    : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              role="option"
              aria-selected={isActive}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

