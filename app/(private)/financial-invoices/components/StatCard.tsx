import React, { memo } from 'react';
import { Reveal } from './Reveal';
import { IconRenderer } from './IconRenderer';

interface StatCardProps {
  icon: string;
  iconColor: 'blue' | 'yellow' | 'green';
  label: string;
  value: string;
}

export const StatCard = memo<StatCardProps>(({ icon, iconColor, label, value }) => {
  const iconColorClasses = {
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconText: 'text-white',
      cardBorder: 'border-blue-100',
      cardBg: 'bg-gradient-to-br from-blue-50/50 to-white',
    },
    yellow: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconText: 'text-white',
      cardBorder: 'border-amber-100',
      cardBg: 'bg-gradient-to-br from-amber-50/50 to-white',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      iconText: 'text-white',
      cardBorder: 'border-emerald-100',
      cardBg: 'bg-gradient-to-br from-emerald-50/50 to-white',
    },
    red: {
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      iconText: 'text-white',
      cardBorder: 'border-red-100',
      cardBg: 'bg-gradient-to-br from-red-50/50 to-white',
    }
  };

  const colors = iconColorClasses[iconColor] || iconColorClasses.blue;

  return (
    <Reveal className="reveal">
      <div className={`
        ${colors.cardBg}
        rounded-xl shadow-lg shadow-gray-200/50 
        p-6 flex items-center gap-5 w-full h-full min-h-[120px] 
        box-border border-2 ${colors.cardBorder}
        transition-all duration-300 animate-fadeInUp 
        overflow-hidden relative
        hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1
        group
      `}>
        <div className={`
          ${colors.iconBg} ${colors.iconText}
          min-w-[64px] w-[64px] h-[64px] 
          rounded-2xl flex items-center justify-center 
          transition-all duration-300 flex-shrink-0
          group-hover:scale-110 group-hover:rotate-3
          shadow-lg shadow-gray-400/30
        `}>
          <div className="flex items-center justify-center w-full h-full">
            <IconRenderer iconName={icon} className="w-7 h-7" />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </label>
          <span className="text-3xl font-bold text-slate-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {value}
          </span>
        </div>
      </div>
    </Reveal>
  );
});

StatCard.displayName = 'StatCard';

