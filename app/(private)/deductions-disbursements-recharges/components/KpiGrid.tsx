'use client';
import React, { useMemo, memo } from 'react';
import KpiCard from './KpiCard';

interface DisplayDeduction {
  id: string;
  dateOfIncident: string;
  courierName: string;
  type: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Disputed';
  [key: string]: unknown;
}

interface KPICard {
  key: string;
  title: string;
  icon: string;
  bg: string;
  color: string;
  filterType: string;
  hasAdd: boolean;
}

interface KpiGridProps {
  data: DisplayDeduction[];
  currentMonth: Date;
  activeFilter: string;
  onFilterChange: (filterType: string) => void;
  onAddEntry: (entryType: string) => void;
  kpiCards: KPICard[];
  kpiTotals?: Record<string, number>;
  onKpiAddClick?: (card: KPICard, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const KpiGrid = memo(function KpiGrid({ 
  data, 
  currentMonth, 
  activeFilter, 
  onFilterChange, 
  onAddEntry, 
  kpiCards, 
  kpiTotals: externalKpiTotals, 
  onKpiAddClick 
}: KpiGridProps) {
  const internalKpiTotals = useMemo(() => {
    const totals: Record<string, number> = {
      Total: 0,
      'Repairs & Damages': 0,
      'Pre-Payments': 0,
      'Liquidation Damages': 0,
      'Traffic Penalties': 0,
      Other: 0,
      All: 0
    };

    const monthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      // Incluir installments ou itens que correspondem ao mês atual
      const matchesMonth = item.isInstallment || 
        (item.dateOfIncident && item.dateOfIncident.startsWith(monthString));
      
      if (matchesMonth) {
        const amount = Number(item.amount);
        // Garantir que apenas valores válidos e positivos sejam somados
        if (!Number.isNaN(amount) && Number.isFinite(amount) && amount > 0) {
          totals.Total += amount;
          totals.All += amount;
          const type = item.type;
          if (type in totals) {
            totals[type] += amount;
          }
        }
      }
    }

    return totals;
  }, [data, currentMonth]);

  const kpiTotals = externalKpiTotals || internalKpiTotals;

  return (
    <div 
      className="grid grid-cols-6 gap-3 w-full overflow-x-auto"
    >
      {kpiCards.map((card) => {
        const isActive =
          (card.filterType === 'All' && !activeFilter) || activeFilter === card.filterType;
        const totalValue =
          card.filterType === 'All'
            ? kpiTotals.Total
            : (card.filterType in kpiTotals ? kpiTotals[card.filterType] : 0);

        return (
          <KpiCard
            key={card.key}
            title={card.title}
            value={totalValue}
            icon={card.icon}
            colors={{ bg: card.bg, text: card.color }}
            filterType={card.filterType}
            onFilterChange={onFilterChange}
            onAddEntry={onAddEntry}
            onKpiAddClick={onKpiAddClick ? (e) => onKpiAddClick(card, e) : undefined}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
});

export default KpiGrid;
