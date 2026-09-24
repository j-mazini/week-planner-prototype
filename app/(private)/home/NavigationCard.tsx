import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerItem } from '@/components/animations/page-animation';
import { NavigationCard, TypeStyles } from './types';

interface NavigationCardComponentProps {
  card: NavigationCard;
  styles: TypeStyles;
}

// Helper function to get gradient based on card type
const getIconGradient = (type: 'ops' | 'fin' | 'plan'): string => {
  switch (type) {
    case 'ops':
      return 'from-blue-500 to-cyan-500';
    case 'fin':
      return 'from-emerald-500 to-teal-500';
    case 'plan':
      return 'from-purple-500 to-indigo-500';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

export const NavigationCardComponent: React.FC<NavigationCardComponentProps> = memo(({ card, styles }) => {
  const iconGradient = useMemo(() => getIconGradient(card.type), [card.type]);
  
  return (
    <StaggerItem key={card.href}>
      <Link 
        href={card.href}
        prefetch={false}
        className="block"
      >
        <motion.div
          className="relative bg-white rounded-lg p-2.5 sm:p-3 h-16 sm:h-20 border border-slate-100 shadow-sm hover:shadow-md group cursor-pointer overflow-hidden flex flex-row items-center gap-2.5 transition-all duration-300 ease-out"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -2, 
            scale: 1.01,
            transition: { 
              type: "spring", 
              stiffness: 360, 
              damping: 24 
            }
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            mass: 0.6,
            opacity: { duration: 0.4 },
            y: { duration: 0.5 }
          }}
        >
          {/* Accent bar */}
          <motion.div 
            className={`absolute left-0 top-0 right-0 ${styles.accent}`}
            style={{ height: 3 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            whileHover={{ 
              height: 4,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
          />
          
          {/* Icon box */}
          <motion.div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconGradient} text-white flex items-center justify-center shadow-md flex-shrink-0 transition-all duration-300`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1
            }}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 }
            }}
          >
            <i className={`bi ${card.icon} text-lg`}></i>
          </motion.div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0 gap-0.5 pr-6">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight line-clamp-1">
              {card.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 leading-snug line-clamp-1">
              {card.description}
            </p>
          </div>
          
          {/* Arrow icon */}
          <motion.i 
            className="bi bi-arrow-right absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ 
              color: '#475569',
              x: 4,
              transition: { duration: 0.2 }
            }}
          />
        </motion.div>
      </Link>
    </StaggerItem>
  );
});

NavigationCardComponent.displayName = 'NavigationCardComponent';

