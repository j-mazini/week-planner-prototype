'use client';
import React, { memo, useCallback } from 'react';
import { IconRenderer } from './IconRenderer';

const formatCurrency = (val: number) => `£${val.toFixed(2)}`;

interface KpiCardProps {
  title: string;
  value: number;
  icon: string;
  colors: { bg: string; text: string };
  filterType: string;
  onFilterChange: (filterType: string) => void;
  onAddEntry: (filterType: string) => void;
  onKpiAddClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isActive: boolean;
}

const KpiCard = memo(function KpiCard({ 
  title, 
  value, 
  icon, 
  colors, 
  filterType, 
  onFilterChange, 
  onAddEntry, 
  onKpiAddClick, 
  isActive 
}: KpiCardProps) {
  const handleCardClick = useCallback(() => {
    onFilterChange(filterType);
  }, [onFilterChange, filterType]);

  const handleAddClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onKpiAddClick) {
      onKpiAddClick(e);
    } else {
      onAddEntry(filterType);
    }
  }, [onKpiAddClick, onAddEntry, filterType]);

  return (
    <div className="min-w-0 flex-1 p-1.5">
      <div
        className={`relative flex items-center justify-center pl-3 pr-8 py-3 gap-2 min-h-[80px] rounded-lg cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'border-2 border-gray-300 bg-gray-50' 
            : 'border border-gray-200 bg-white'
        } hover:-translate-y-1 hover:shadow-lg`}
        onClick={handleCardClick}
      >
        <div 
          className="text-sm p-2 rounded-full flex items-center justify-center flex-shrink-0 w-9 h-9"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          <IconRenderer iconName={icon} />
        </div>
        <div className="flex-1 flex flex-col justify-center text-center min-w-0 min-h-[2.5rem]">
          <div className="text-[8px] font-semibold text-gray-500 uppercase leading-tight flex items-center justify-center truncate">
            {title}
          </div>
          <div className="text-sm font-bold text-gray-800 leading-tight m-0 truncate">
            {formatCurrency(value)}
          </div>
        </div>
        {filterType !== 'Total' && filterType !== 'All' && (
          <button
            className="absolute top-1.5 right-1.5 text-sm leading-none text-gray-500 bg-transparent border-none p-0 w-5 h-5 flex items-center justify-center hover:text-blue-500 transition-colors duration-200 z-[5]"
            title={`Add new ${title} deduction`}
            onClick={handleAddClick}
            type="button"
          >
            <IconRenderer iconName="bi-plus-circle" />
          </button>
        )}
      </div>
    </div>
  );
});

export default KpiCard;
