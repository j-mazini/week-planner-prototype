'use client';

import React from 'react';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';

interface Deposit {
  id: number;
  name: string;
}

interface DepositSelectProps {
  value: string;
  onChange: (value: string) => void;
  deposits: Deposit[];
}

export const DepositSelect: React.FC<DepositSelectProps> = ({ 
  value, 
  onChange, 
  deposits 
}) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 mb-1">Deposit</p>
      <select
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All</option>
        {filterAllowedDeposits(
          deposits as unknown as Array<Deposit & { depositName?: string | null; depositId?: number; isPhysical?: boolean }>
        ).map((dep) => (
          <option key={dep.id} value={String(dep.id)}>
            {dep.name}
          </option>
        ))}
      </select>
    </div>
  );
};

