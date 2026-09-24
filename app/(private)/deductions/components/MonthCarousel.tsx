"use client";

import React, { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { deductionsStyles } from '../styles';

interface MonthItem {
  year: number;
  month: number;
  label: string;
  isSelected: boolean;
}

interface MonthCarouselProps {
  months: MonthItem[];
  onMonthClick: (year: number, month: number) => void;
}

export const MonthCarousel = memo<MonthCarouselProps>(({ months, onMonthClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);

  // Encontra o índice do mês ativo
  const activeIndex = months.findIndex(item => item.isSelected);
  
  // Centraliza o mês ativo sempre que mudar
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const itemsContainer = itemsContainerRef.current;
    
    if (!scrollContainer || !itemsContainer || activeIndex === -1) return;

    const centerActive = () => {
      // Encontra o botão ativo usando a classe
      const activeButton = itemsContainer.querySelector<HTMLButtonElement>(
        ".carousel-month-item-active"
      );
      
      if (!activeButton) return;

      // Usa getBoundingClientRect para posições precisas
      const scrollRect = scrollContainer.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      // Calcula o centro do botão e do container
      const buttonCenter = buttonRect.left + (buttonRect.width / 2);
      const containerCenter = scrollRect.left + (scrollRect.width / 2);
      
      // Calcula quanto precisa scrollar
      const scrollDelta = buttonCenter - containerCenter;
      const newScrollLeft = scrollContainer.scrollLeft + scrollDelta;
      
      // Limita dentro dos limites
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const finalScroll = Math.max(0, Math.min(newScrollLeft, maxScroll));
      
      scrollContainer.scrollTo({
        left: finalScroll,
        behavior: "smooth"
      });
    };

    // Aguarda a renderização completa e múltiplas tentativas
    const timer1 = setTimeout(centerActive, 100);
    const timer2 = setTimeout(centerActive, 300);
    const timer3 = setTimeout(centerActive, 500);
    const timer4 = setTimeout(centerActive, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [activeIndex, months]);

  return (
    <section className={deductionsStyles.monthCarouselSection}>
      <div
        ref={scrollContainerRef}
        className={deductionsStyles.monthCarouselScroll}
      >
        <div
          className={deductionsStyles.monthCarouselItems}
          ref={itemsContainerRef}
        >
          {months.map((item) => {
            const active = item.isSelected;
            const uniqueKey = `${item.year}-${item.month}`;

            return (
              <motion.button
                key={uniqueKey}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`carousel-month-item${active ? "-active" : ""} ${
                  deductionsStyles.monthCarouselButtonBase
                } ${
                  active
                    ? deductionsStyles.monthCarouselButtonActive
                    : deductionsStyles.monthCarouselButtonInactive
                }`}
                onClick={() => {
                  if (!active) {
                    onMonthClick(item.year, item.month);
                  }
                }}
              >
                <span className={deductionsStyles.monthCarouselButtonLabel}>
                  <span>{item.label.split('/')[0]}</span>
                  <span className={deductionsStyles.monthCarouselButtonYear}>
                    {item.year}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
});

MonthCarousel.displayName = 'MonthCarousel';
