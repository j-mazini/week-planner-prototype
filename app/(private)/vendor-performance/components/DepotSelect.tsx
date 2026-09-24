"use client";

import { memo } from 'react';
import type { DepositOption } from '../hooks/useDeposits';

interface DepotSelectProps {
  deposits: DepositOption[];
  value: number | null;
  onChange: (depositId: number | null) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const DepotSelect = memo(function DepotSelect({
  deposits,
  value,
  onChange,
  loading = false,
  disabled = false,
  label = 'Depot',
  className = '',
}: DepotSelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor="depot-select" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      <select
        id="depot-select"
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : Number(v));
        }}
        disabled={disabled || loading}
        className="w-full min-w-[180px] max-w-[280px] px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="">Select depot to view vendors</option>
        {deposits.map((d) => (
          <option key={d.depositId} value={d.depositId}>
            {d.depositName}
          </option>
        ))}
      </select>
    </div>
  );
});

