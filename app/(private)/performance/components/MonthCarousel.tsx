"use client";

import { useRef, useEffect, memo } from "react";

interface MonthCarouselItem {
  key: string;
  year: number;
  month: number;
  label: string;
}

interface MonthCarouselProps {
  items: MonthCarouselItem[];
  selectedYear: number;
  selectedMonth: number;
  onSelect: (year: number, month: number) => void;
}

export const MonthCarousel = memo(function MonthCarousel({
  items,
  selectedYear,
  selectedMonth,
  onSelect,
}: MonthCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLDivElement>('[data-active="true"]');
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedYear, selectedMonth]);

  return (
    <section className="overflow-x-auto bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-4 py-2.5 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex flex-nowrap gap-2 px-4" ref={carouselRef}>
        {items.map((item) => {
          const isActive = item.year === selectedYear && item.month === selectedMonth;
          return (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              data-active={isActive}
              className={`
                flex-none px-4 py-2.5 rounded-[20px] font-semibold text-sm text-center cursor-pointer
                transition-all duration-200 border-2
                ${
                  isActive
                    ? "bg-gradient-to-b from-white via-blue-50/80 to-white text-[#3498db] border-[#3498db] shadow-[0_6px_18px_rgba(52,152,219,0.14)]"
                    : "bg-[#f8f9fa] text-[#7f8c8d] border-transparent hover:opacity-80"
                }
                active:opacity-80
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(item.year, item.month);
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </section>
  );
});

