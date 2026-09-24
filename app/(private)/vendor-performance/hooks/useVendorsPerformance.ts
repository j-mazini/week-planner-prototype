import { useState, useEffect, useCallback } from 'react';
import { fetchDailyOverviewSummary } from '@/lib/vendor-performance-api';
import { mapVendorSummaryToProcessedVendors, type ProcessedVendor } from '../utils';

export function useVendorsPerformance(month: number, year: number) {
  const [vendorsData, setVendorsData] = useState<ProcessedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendorsPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiMonth = month + 1; // Convert from 0-based to 1-based
      const { vendors } = await fetchDailyOverviewSummary(apiMonth, year);
      const processedVendors = mapVendorSummaryToProcessedVendors(vendors);

      setVendorsData(processedVendors);
    } catch (err) {
      console.error('Error loading vendors performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vendors performance');
      setVendorsData([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadVendorsPerformance();
  }, [loadVendorsPerformance]);

  return { vendorsData, loading, error, refetch: loadVendorsPerformance };
}

