"use client";

import { memo } from 'react';
import { ModernPageHeader, type Metric } from '@/components/modern-page-header';
import { MetricCard } from './MetricCard';

interface GeneralPerformanceDashboardProps {
  subtitle: string;
  metrics: Metric[];
  loading?: boolean;
}

/**
 * Dashboard shown when no depot is selected — overall performance across all vendors.
 */
export const GeneralPerformanceDashboard = memo(function GeneralPerformanceDashboard({
  subtitle,
  metrics,
  loading = false,
}: GeneralPerformanceDashboardProps) {
  const totalVendors = metrics.find((m) => m.label === 'Total Vendors')?.value ?? 0;
  const avgTw = metrics.find((m) => m.label === 'Avg TW')?.value ?? '0%';
  const avgSpr = metrics.find((m) => m.label === 'Avg SPR')?.value ?? '0';
  const avgAfd = metrics.find((m) => m.label === 'Avg AFD')?.value ?? '0%';

  return (
    <main className="pt-6 space-y-6">
      <div className="mb-4">
        <ModernPageHeader
          title="Vendor Performance"
          subtitle={subtitle}
          metrics={metrics}
          gradientFrom="slate-900"
          gradientTo="indigo-600"
        />
      </div>

      <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">General overview</h2>
        <p className="text-sm text-slate-500 mb-6">
          Select a depot above to see the vendor list and performance for that depot.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" aria-hidden />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Vendors" value={String(totalVendors)} />
            <MetricCard label="Avg Time Window" value={String(avgTw)} />
            <MetricCard label="Avg Stops Per Route" value={String(avgSpr)} />
            <MetricCard label="Avg AFD" value={String(avgAfd)} />
          </div>
        )}
      </div>
    </main>
  );
});
