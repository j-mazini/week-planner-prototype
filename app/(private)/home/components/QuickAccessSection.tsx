import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { NavigationCard, TypeStylesMap } from '../types';
import { NavigationCardComponent } from '../NavigationCard';
import { SectionTitle } from './SectionTitle';
import { homePageAnimations } from './animations';

interface QuickAccessSectionProps {
  navigationCards: NavigationCard[];
  typeStyles: TypeStylesMap;
  isSidebarOpen: boolean;
}

const QuickAccessSectionContent: React.FC<QuickAccessSectionProps> = ({ 
  navigationCards, 
  typeStyles,
  isSidebarOpen 
}) => {
  const cardsWithStyles = useMemo(() => {
    if (!navigationCards || navigationCards.length === 0) {
      console.warn('[QuickAccessSection] No navigationCards provided');
      return [];
    }
    return navigationCards.map((card) => {
      const styles = typeStyles[card.type];
      if (!styles) {
        console.warn(`[QuickAccessSection] No styles found for card type: ${card.type}`);
      }
      return {
        card,
        styles: styles || typeStyles.ops // Fallback to ops styles
      };
    });
  }, [navigationCards, typeStyles]);

  const gridVariants = React.useMemo(() => homePageAnimations.grid, []);

  // Don't render if no cards
  if (!cardsWithStyles || cardsWithStyles.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="space-y-4"
      variants={homePageAnimations.section}
      initial="visible"
      animate="visible"
    >
      <SectionTitle title="Quick Access" indicatorColor="navigation" />
      
      <motion.div
        className={`
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
          gap-2 sm:gap-3 transition-all duration-300
          ${isSidebarOpen ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5' : ''}
        `}
        variants={gridVariants}
        initial="visible"
        animate="visible"
      >
        {cardsWithStyles.map(({ card, styles }) => (
          <NavigationCardComponent
            key={card.href}
            card={card}
            styles={styles}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export const QuickAccessSection = memo(QuickAccessSectionContent);
QuickAccessSection.displayName = 'QuickAccessSection';

