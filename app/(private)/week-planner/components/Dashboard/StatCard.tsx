"use client";

import React from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  subtitle?: string;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  subtitle 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${colorClasses[color]}`}>
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-white/80">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold leading-tight mb-1">{value}</div>
        <div className="text-[0.85rem] font-semibold opacity-90">{title}</div>
        {subtitle && <div className="text-[0.75rem] opacity-70 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;

