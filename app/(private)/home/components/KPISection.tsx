import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { KpiCard } from '../types';
import { KPICard } from './KPICard';
import { SectionTitle } from './SectionTitle';
import { KPISkeleton } from './KPISkeleton';
import { homePageAnimations } from './animations';

interface KPISectionProps {
  kpis: KpiCard[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  title: string;
  indicatorColor: 'monthly' | 'daily';
}

const KPISectionContent: React.FC<KPISectionProps> = ({ 
  kpis, 
  isLoading, 
  isSidebarOpen,
  title,
  indicatorColor
}) => {
  const gridVariants = React.useMemo(() => homePageAnimations.grid, []);

  return (
    <motion.section
      className="space-y-3"
      variants={homePageAnimations.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <SectionTitle title={title} indicatorColor={indicatorColor} />
      
      <motion.div
        className={`
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
          gap-4 sm:gap-5 transition-all duration-300
          ${isSidebarOpen ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4' : ''}
        `}
        variants={gridVariants}
      >
        {isLoading ? (
          <KPISkeleton count={kpis.length || 6} isSidebarOpen={isSidebarOpen} />
        ) : kpis && kpis.length > 0 ? (
          kpis.map((kpi, index) => (
            <KPICard 
              key={kpi.id} 
              kpi={kpi} 
              index={index} 
              isSidebarOpen={isSidebarOpen} 
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <i className="bi bi-info-circle text-2xl mb-2 block"></i>
              <span>No data available at the moment</span>
              <div className="text-xs mt-2">Check the console for more details</div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};

export const KPISection = memo(KPISectionContent);
KPISection.displayName = 'KPISection';

