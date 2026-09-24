import { memo } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  className?: string;
  isNA?: boolean;
}

export const MetricCard = memo(function MetricCard({ 
  label, 
  value, 
  className = '',
  isNA = false
}: MetricCardProps) {
  return (
    <div className="flex-1 min-w-[140px] p-5 bg-gray-50 rounded-lg border-none flex flex-col items-center justify-center shadow-sm">
      <span className="text-xs font-semibold text-slate-500 uppercase mb-3 tracking-wide">
        {label}
      </span>
      <span 
        className={`text-3xl font-bold leading-tight ${
          isNA ? 'text-gray-400' : className || 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
});

