import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { dailyPerformanceInsightStyles } from "./styles";

interface DaysCarouselProps {
  displayMonth: Date;
  selectedDate: Date;
  onDayClick: (day: number) => void;
  hasNoData?: boolean;
  isLoading?: boolean;
}

export const DaysCarousel = React.memo<DaysCarouselProps>(({ 
  displayMonth, 
  selectedDate, 
  onDayClick, 
  hasNoData = false, 
  isLoading = false 
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Rola o carrossel para o dia atual quando a página é carregada ou a data muda
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const centerActive = () => {
      const active = container.querySelector<HTMLElement>('[data-day-active="true"]');
      if (!active) return;
      const bounds = container.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      container.scrollTo({ left: container.scrollLeft + item.left - bounds.left - (bounds.width - item.width) / 2, behavior: "instant" });
    };
    centerActive();
    const observer = new ResizeObserver(centerActive);
    observer.observe(container);
    return () => observer.disconnect();
  }, [selectedDate, displayMonth]);

  // Gera os itens do carrossel memoizado
  const carouselItems = useMemo(() => {
    const items: JSX.Element[] = [];
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const isSelected = format(d, "yyyy-MM-dd") === selectedDateStr;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const hasNoDataForDay = isSelected && !isLoading && hasNoData;
      const shouldDim = isWeekend && (!isSelected || hasNoDataForDay);
      
      items.push(
        <motion.button
          key={day}
          type="button"
          aria-label={format(d, "EEEE, dd MMMM yyyy")}
          aria-pressed={isSelected}
          data-day-active={isSelected}
          onClick={() => onDayClick(day)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          animate={{ opacity: shouldDim ? 0.4 : 1 }}
          transition={{ duration: 0.2 }}
          className={`${dailyPerformanceInsightStyles.dayCardBase} ${isSelected ? dailyPerformanceInsightStyles.dayCardSelected : dailyPerformanceInsightStyles.dayCardUnselected}`}
        >
          <div className={`${dailyPerformanceInsightStyles.dayCardNumber} ${isSelected ? dailyPerformanceInsightStyles.dayCardNumberSelected : ''}`}>
            {format(d, "d")}
          </div>
          <div className={`${dailyPerformanceInsightStyles.dayCardWeekday} ${isSelected ? dailyPerformanceInsightStyles.dayCardWeekdaySelected : dailyPerformanceInsightStyles.dayCardWeekdayUnselected}`}>
            {format(d, "EEE")}
          </div>
        </motion.button>
      );
    }
    return items;
  }, [displayMonth, selectedDate, hasNoData, isLoading, onDayClick]);

  return (
    <div className={dailyPerformanceInsightStyles.daysCarouselWrapper}>
      <div 
        ref={carouselRef}
        className={dailyPerformanceInsightStyles.daysCarouselScroll}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {carouselItems}
      </div>
    </div>
  );
});

DaysCarousel.displayName = 'DaysCarousel';

