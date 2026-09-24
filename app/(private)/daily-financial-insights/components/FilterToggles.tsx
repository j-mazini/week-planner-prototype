"use client";

import React, { memo, useMemo } from 'react';
import { FilterState } from '../types';
import { CostModel } from '@/lib/cost-models';
import { dailyFinancialInsightsStyles } from '../styles';
import { cn } from '@/lib/utils';

const costModelID_TO_FILTER_VALUE: Record<number, string> = {
  1: '1',
  2: 'DR',
  3: 'FSR',
  4: 'VSR',
  7: '7',
};

const costModel_DISPLAY_NAME: Partial<Record<number, string>> = {
  7: 'Hourly Rate',
};

function Chip({
  label,
  active,
  onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white/80 text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
      )}
    >
      {label}
    </button>
  );
}

interface FilterTogglesProps {
  filters: FilterState;
  availableLoops: string[];
  uniqueDepots: string[];
  costModels: CostModel[];
  onToggle: (key: keyof FilterState, value: string) => void;
  onClearFilters?: () => void;
}

export const FilterToggles = memo<FilterTogglesProps>(function FilterToggles({
  filters,
  availableLoops,
  uniqueDepots,
  costModels,
  onToggle,
  onClearFilters,
}) {
  const hasActiveFilters =
    filters.depot !== 'All' ||
    filters.loop !== 'All' ||
    (filters.payment ?? 'All') !== 'All';

  const paymentOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [
      { value: 'All', label: 'All Modes' },
    ];
    const sorted = [...costModels].sort((a, b) => a.costModelId - b.costModelId);
    sorted.forEach((cm) => {
      const value = costModelID_TO_FILTER_VALUE[cm.costModelId] ?? String(cm.costModelId);
      const label = costModel_DISPLAY_NAME[cm.costModelId] ?? cm.name ?? `Cost Model ${cm.costModelId}`;
      options.push({ value, label });
    });
    return options;
  }, [costModels]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2">
      <div className={dailyFinancialInsightsStyles.filterTogglesChipRow}>
        <div className="flex items-center gap-2">
          <span className={dailyFinancialInsightsStyles.filterTogglesLabel}>Depot</span>
          <div className={dailyFinancialInsightsStyles.filterTogglesChips}>
            <Chip label="All" active={filters.depot === 'All'} onClick={() => onToggle('depot', 'All')} />
            {uniqueDepots.map((depot) => (
              <Chip
                key={depot}
                label={depot}
                active={filters.depot === depot}
                onClick={() => onToggle('depot', depot)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={dailyFinancialInsightsStyles.filterTogglesLabel}>Loop</span>
          <div className={dailyFinancialInsightsStyles.filterTogglesChips}>
            {availableLoops.map((option) => (
              <Chip
                key={option}
                label={option === 'All' ? 'All' : option}
                active={filters.loop === option}
                onClick={() => onToggle('loop', option)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={dailyFinancialInsightsStyles.filterTogglesLabel}>Payment</span>
          <div className={dailyFinancialInsightsStyles.filterTogglesChips}>
            {paymentOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={(filters.payment ?? 'All') === option.value}
                onClick={() => onToggle('payment', option.value)}
              />
            ))}
          </div>
        </div>
      </div>
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={dailyFinancialInsightsStyles.filterTogglesClear}
        >
          Clear filters
        </button>
      )}
    </div>
  );
});

