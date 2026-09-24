import { useState, useEffect, useMemo } from 'react';
import { fetchDailyOverviewList } from '@/lib/vendor-performance-api';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type MonthOption = { year: number; month: number; label: string };

function buildLast12MonthCandidates(): { year: number; month: number }[] {
  const today = new Date();
  const result: { year: number; month: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

function hasData(response: Awaited<ReturnType<typeof fetchDailyOverviewList>>): boolean {
  if (!response?.dailyEarnings?.length) return false;
  const withOps = response.dailyEarnings.some((e) => e.operations?.length);
  return withOps;
}

/**
 * Returns only the months (last 12) where the vendor has at least one record.
 * Used to show only dates with data in the carousel.
 */
export function useAvailableMonthsForVendor(userId: number | null) {
  const [monthsWithData, setMonthsWithData] = useState<MonthOption[]>([]);
  const [loading, setLoading] = useState(false);

  const candidates = useMemo(() => buildLast12MonthCandidates(), []);

  useEffect(() => {
    if (userId == null || userId <= 0) {
      setMonthsWithData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const checkMonth = async (year: number, month: number) => {
      const apiMonth = month + 1;
      const res = await fetchDailyOverviewList(userId, apiMonth, year);
      return hasData(res) ? { year, month } : null;
    };

    Promise.all(candidates.map(({ year, month }) => checkMonth(year, month)))
      .then((results) => {
        if (cancelled) return;
        const withData = results.filter((r): r is { year: number; month: number } => r != null);
        const sorted = withData.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        setMonthsWithData(
          sorted.map(({ year, month }) => ({
            year,
            month,
            label: `${MONTH_SHORT[month]}/${year}`,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setMonthsWithData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, candidates]);

  return { monthsWithData, loading };
}
