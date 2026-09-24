'use client';

import React from 'react';

interface LoopFilterProps {
  value: string;
  onChange: (value: string) => void;
  loops: string[];
}

export const LoopFilter: React.FC<LoopFilterProps> = ({ 
  value, 
  onChange, 
  loops 
}) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 mb-1">Loop</p>
      <div className="flex flex-wrap gap-2">
        {['all', ...loops].map((loop) => (
          <button
            key={loop}
            className={`border rounded-full px-3 py-1.5 text-sm font-semibold transition shadow-sm ${
              value === loop
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg'
                : 'bg-white text-slate-900 border-slate-200 hover:border-blue-200 hover:shadow'
            }`}
            onClick={() => onChange(loop)}
          >
            {loop === 'all' ? 'All' : loop.toUpperCase()}
          </button>
        ))}
        {loops.length === 0 && (
          <span className="text-xs text-slate-400">No loops available</span>
        )}
      </div>
    </div>
  );
};

