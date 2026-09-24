"use client";

import { useRef, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { DayCard } from "./DayCard";

interface DaysCarouselProps {
  date: Date;
  loading: boolean;
  hasData: boolean;
  hasError: boolean;
  onDateSelect: (date: Date) => void;
}

export const DaysCarousel = memo(function DaysCarousel({
  date,
  loading,
  hasData,
  hasError,
  onDateSelect,
}: DaysCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll to active day when date changes
  useEffect(() => {
    const scrollToActive = () => {
      const activeElement = carouselRef.current?.querySelector('[data-day-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    };

    const timeout1 = setTimeout(scrollToActive, 100);
    const timeout2 = setTimeout(scrollToActive, 300);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [date]);

  // Memoize carousel items for performance
  const carouselItems = useMemo(() => {
    const items: JSX.Element[] = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const selectedDateStr = format(date, "yyyy-MM-dd");
    
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const isSelected = format(d, "yyyy-MM-dd") === selectedDateStr;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const hasNoData = isSelected && !loading && (!hasData || hasError);
      
      items.push(
        <DayCard
          key={day}
          date={d}
          isSelected={isSelected}
          isWeekend={isWeekend}
          hasNoData={hasNoData}
          onSelect={() => onDateSelect(d)}
          index={day - 1}
        />
      );
    }
    return items;
  }, [date, loading, hasData, hasError, onDateSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-5 relative"
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-2xl -z-10" />
      
      {/* Scroll indicator dots */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-300"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div
        ref={carouselRef}
        className="flex overflow-x-scroll gap-3 py-3 pb-4 snap-x-mandatory touch-pan-x scrollbar-hide px-2 [-webkit-overflow-scrolling:touch] [scroll-snap-type:x_mandatory]"
      >
        {carouselItems}
      </div>
    </motion.div>
  );
});

