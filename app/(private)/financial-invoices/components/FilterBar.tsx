import React, { memo, useMemo } from 'react';
import { MonthOption } from '../types';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";

interface FilterBarProps {
  userTypeId: number;
  selectedPeriod: string;
  availableMonths: MonthOption[];
  onPeriodChange: (value: string) => void;
}

export const FilterBar = memo<FilterBarProps>(({
  userTypeId,
  selectedPeriod,
  availableMonths,
  onPeriodChange
}) => {
  const periodItems = useMemo<SelectItem[]>(() => {
    return [
      { value: 'all', label: 'All Periods' },
      ...availableMonths.map((m) => ({
        value: m.value,
        label: m.label
      }))
    ];
  }, [availableMonths]);

  // Não renderizar apenas se userTypeId for diferente de `ADMIN` e não for 0 (carregando)
  if (userTypeId !== BUSINESS_RULES.USER_TYPE.ADMIN && userTypeId !== 0) return null;

  return (
    <div className="flex items-center gap-3 flex-shrink-0 h-11">
      <strong className="whitespace-nowrap text-sm text-slate-700">Period:</strong>
      <SearchableSelect
        items={periodItems}
        value={selectedPeriod}
        onValueChange={onPeriodChange}
        placeholder="Select period..."
        searchPlaceholder="Search period..."
        title="Periods"
        className="min-w-[200px]"
      />
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

