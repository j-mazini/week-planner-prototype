import React, { useMemo, useEffect, useRef } from 'react';

// Month names in English
const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface DateCarouselProps {
  today: Date;
  selectedYear: number;
  selectedMonth: number;
  onMonthSelect: (year: number, month: number) => void;
}

export const DateCarousel = React.memo(({ today, selectedYear, selectedMonth, onMonthSelect }: DateCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const carouselMonths = useMemo(() => {
    const months: Array<{ year: number; month: number; label: string }> = [];
    for (let i = -11; i <= 0; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = MONTH_NAMES_SHORT[month] || 'Unknown';
      months.push({
        year,
        month,
        label: `${monthName}/${year}`
      });
    }
    return months;
  }, [today]);

  // Effect to scroll carousel to active item (selected month)
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = carouselRef.current;
      if (!container) return;
      const activeItem = container.querySelector<HTMLDivElement>('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="mb-6 pb-3">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scroll-smooth touch-pan-x"
      >
        {carouselMonths.map((item, idx) => {
          const isActive = item.year === selectedYear && item.month === selectedMonth;
          return (
            <button
              key={idx}
              data-active={isActive}
              className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 border flex-shrink-0
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
                }`}
              onClick={() => onMonthSelect(item.year, item.month)}
            >
              <span className="flex flex-col items-center">
                <span>{item.label.split('/')[0]}</span>
                <span className="text-xs opacity-90">{item.year}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

DateCarousel.displayName = 'DateCarousel';

