'use client';

import React from 'react';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ 
  value, 
  onChange,
  options = ['all', 'active', 'inactive']
}) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
      <div className="flex flex-wrap gap-2">
        {options.map((status) => (
          <button
            key={status}
            className={`border rounded-full px-3 py-1.5 text-sm font-semibold transition shadow-sm ${
              value === status
                ? 'bg-[#b2f746] text-[#003b3e] border-[#446900] shadow-md'
                : 'bg-white text-slate-900 border-slate-200 hover:border-[#446900] hover:shadow'
            }`}
            onClick={() => onChange(status)}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
