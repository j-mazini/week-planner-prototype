import React, { memo } from 'react';
import { IconRenderer } from './IconRenderer';

interface MobileStatCardProps {
  value: string;
}

export const MobileStatCard = memo<MobileStatCardProps>(({ value }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-4 shadow-md border-2 border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Total Value</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-lg flex-shrink-0 ml-3 flex items-center justify-center">
          <IconRenderer iconName="bi-journal" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});

MobileStatCard.displayName = 'MobileStatCard';

