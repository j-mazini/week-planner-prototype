import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { homePageAnimations } from './animations';

interface SectionTitleProps {
  title: string;
  indicatorColor: 'kpi' | 'navigation' | 'monthly' | 'daily';
}

const SectionTitleContent: React.FC<SectionTitleProps> = ({ title, indicatorColor }) => {
  const indicatorClass = useMemo(() => {
    switch (indicatorColor) {
      case 'kpi':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'navigation':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'monthly':
        return 'bg-gradient-to-r from-violet-500 to-purple-500';
      case 'daily':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  }, [indicatorColor]);

  const titleVariants = useMemo(() => homePageAnimations.title, []);

  return (
    <motion.div 
      className="flex items-center gap-3 mb-2.5"
      variants={titleVariants}
    >
      <div className={`h-1 w-12 rounded-full ${indicatorClass}`} />
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
        {title}
      </h2>
    </motion.div>
  );
};

export const SectionTitle = memo(SectionTitleContent);
SectionTitle.displayName = 'SectionTitle';

