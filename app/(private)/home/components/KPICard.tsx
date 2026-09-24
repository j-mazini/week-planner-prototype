import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { KpiCard } from '../types';

interface KPICardProps {
  kpi: KpiCard;
  index: number;
  isSidebarOpen?: boolean;
}

export const KPICard: React.FC<KPICardProps> = memo(({ kpi, index, isSidebarOpen = false }) => {
  return (
    <motion.div
      className={`
        w-full bg-white border border-slate-100 rounded-2xl shadow-sm 
        hover:shadow-lg flex items-center gap-4 relative overflow-hidden 
        cursor-pointer transition-all duration-300
        ${isSidebarOpen ? 'p-3 sm:p-3.5' : 'p-3.5 sm:p-4'}
      `}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05, 
        type: 'spring', 
        stiffness: 260, 
        damping: 24 
      }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Icon container */}
      <div className={`
        w-14 h-14 rounded-2xl bg-gradient-to-br ${kpi.accent}
        text-white flex items-center justify-center
        shadow-lg flex-shrink-0
        transition-all duration-300
      `}>
        <i className={`bi ${kpi.icon} text-2xl`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`
          uppercase tracking-wide text-slate-500 mb-1 
          transition-all duration-300
          ${isSidebarOpen ? 'text-[10px]' : 'text-[11px]'}
        `}>
          {kpi.title}
        </p>
        <div className={`
          font-semibold text-slate-800 leading-tight 
          transition-all duration-300
          ${isSidebarOpen ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}
        `}>
          {kpi.value}
        </div>
        {kpi.trendLabel && (
          <div className={`
            flex items-center gap-1 font-semibold 
            transition-all duration-300
            ${isSidebarOpen ? 'text-[10px]' : 'text-xs'}
            ${kpi.trendDirection === 'down' ? 'text-rose-600' : 'text-emerald-600'}
          `}>
            <i className={`bi ${kpi.trendDirection === 'down' ? 'bi-arrow-down' : 'bi-arrow-up'}`} />
            {kpi.trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
});

KPICard.displayName = 'KPICard';
