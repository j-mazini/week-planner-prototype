import React, { memo } from 'react';
import { StatCard } from './StatCard';

interface StatsSectionProps {
  totalValue: string;
}

export const StatsSection = memo<StatsSectionProps>(({ totalValue }) => {
  return (
    <section className="mb-4">
      <div className="grid grid-cols-3 gap-6 w-full items-stretch">
        <StatCard
          icon="bi-journal"
          iconColor="blue"
          label="Total Value"
          value={totalValue}
        />
        <StatCard
          icon="bi-clock"
          iconColor="yellow"
          label="Pending Verification"
          value="$0.00"
        />
        <StatCard
          icon="bi-check-circle"
          iconColor="green"
          label="Ready for Invoicing"
          value="$0.00"
        />
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';

