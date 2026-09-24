"use client";

import React from 'react';
import { formatDate } from '../../utils/dateUtils';

type DayCardProps = {
  date: string;
  dayName: string;
  count: number;
  isWeekend: boolean;
};

const DayCard: React.FC<DayCardProps> = ({ 
  date, 
  dayName, 
  count, 
  isWeekend 
}) => {
  return (
    <div className={`bg-white border border-slate-300/20 rounded-lg p-3 text-center transition-all duration-200 hover:border-indigo-500/30 hover:shadow-[0_2px_8px_rgba(99,102,241,0.1)] ${
      isWeekend ? 'bg-orange-50/50 border-amber-300/20' : ''
    }`}>
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-[0.75rem] font-bold uppercase text-slate-500 tracking-[0.05em]">{dayName}</span>
        <span className="text-[0.85rem] font-semibold text-slate-800">{formatDate(date, 'dd/mm')}</span>
      </div>
      <div className={`text-2xl font-bold mb-1 ${isWeekend ? 'text-orange-600' : 'text-indigo-600'}`}>{count}</div>
      <div className="text-[0.7rem] text-slate-400 uppercase tracking-[0.05em]">assignments</div>
    </div>
  );
};

export default DayCard;

