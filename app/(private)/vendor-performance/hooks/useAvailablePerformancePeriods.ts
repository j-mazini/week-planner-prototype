import { useEffect, useMemo, useState } from 'react';
import { fetchDailyOverviewSummary } from '@/lib/vendor-performance-api';
import { mapVendorSummaryToProcessedVendors, type ProcessedVendor } from '../utils';

export type PerformancePeriodOption = {
  year: number;
  month: number; // 0-based
  value: string; // YYYY-MM
  label: string; // e.g. Jan 2026
};

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function buildLast12Candidates(today: Date): PerformancePeriodOption[] {
  const candidates: PerformancePeriodOption[] = [];
  // current month + 11 previous
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const value = `${year}-${pad2(month + 1)}`;
    const label = `${MONTH_SHORT[month]} ${year}`;
    candidates.push({ year, month, value, label });
  }
  return candidates;
}

/**
 * Fetches data only for the selected period (current date on initial load).
 * availablePeriods = last 12 months (static, for dropdown options).
 * vendorsByPeriod = cached data, fetched on demand when user selects a period.
 */
export function useAvailablePerformancePeriods(selectedYear: number, selectedMonth: number) {
  const today = useMemo(() => new Date(), []);
  const availablePeriods = useMemo(() => buildLast12Candidates(today), [today]);

  const [vendorsByPeriod, setVendorsByPeriod] = useState<Record<string, ProcessedVendor[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  useEffect(() => {
    let cancelled = false;
    const p = availablePeriods.find((x) => x.value === periodKey);
    if (!p) {
      // Selected period outside last 12 months - clear loading
      setLoading(false);
      return;
    }

    if (vendorsByPeriod[periodKey]?.length !== undefined) {
      // Already in cache
      setLoading(false);
      return;
    }

    async function run() {
      if (!p) return; // Guard to ensure p is defined
      setLoading(true);
      setError(null);
      try {
        const { vendors: summaryVendors } = await fetchDailyOverviewSummary(p.month + 1, p.year);
        if (cancelled) return;
        const vendors = mapVendorSummaryToProcessedVendors(summaryVendors);
        setVendorsByPeriod((prev) => ({ ...prev, [periodKey]: vendors }));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load period');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [periodKey, selectedYear, selectedMonth, vendorsByPeriod, availablePeriods]);

  return { availablePeriods, vendorsByPeriod, loading, error };
}


