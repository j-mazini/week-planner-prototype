import { useState, useEffect } from 'react';
import { fetchDailyOverviewSummary, type OverallPerformanceSummary } from '@/lib/vendor-performance-api';

export type GeneralSummaryStats = OverallPerformanceSummary;

const EMPTY_STATS: GeneralSummaryStats = {
  totalVendors: 0,
  avgTw: '--:--',
  avgSpr: '--:--',
  avgSporH: '--:--',
  avgAfd: '--:--',
};

export function useGeneralSummary(month: number, year: number, enabled: boolean) {
  const [stats, setStats] = useState<GeneralSummaryStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStats(EMPTY_STATS);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const apiMonth = month + 1;
    fetchDailyOverviewSummary(apiMonth, year)
      .then((data) => {
        if (cancelled) return;
        setStats(data.overall);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [month, year, enabled]);

  return { stats, loading, error };
}
