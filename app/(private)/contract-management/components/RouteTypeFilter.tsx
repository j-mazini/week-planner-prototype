'use client';

import React from 'react';

interface RouteTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const RouteTypeFilter: React.FC<RouteTypeFilterProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 mb-1">Route Type</p>
      <div className="flex flex-wrap gap-2">
        {['all', 'Child', 'Flex'].map((type) => (
          <button
            key={type}
            className={`border rounded-full px-3 py-1.5 text-sm font-semibold transition shadow-sm ${
              value === type
                ? 'bg-[#b2f746] text-[#003b3e] border-[#446900] shadow-md'
                : 'bg-white text-slate-900 border-slate-200 hover:border-[#446900] hover:shadow'
            }`}
            onClick={() => onChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};
