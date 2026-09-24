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
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg'
                : 'bg-white text-slate-900 border-slate-200 hover:border-blue-200 hover:shadow'
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

