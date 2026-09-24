import { useQuery } from '@tanstack/react-query';
import { fetchCalculateRevenue } from '@/lib/api/calculations';
import { CalculateRevenueParams } from '@/lib/utils';

/**
 * Hook to calculate revenue using the backend service.
 * 
 * @param params - The revenue calculation parameters.
 * @param enabled - Whether the query should be enabled.
 * @returns The query result for the revenue calculation.
 */
export function useCalculateRevenue(params: CalculateRevenueParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['calculateRevenue', params],
    queryFn: () => fetchCalculateRevenue(params),
    enabled: enabled && !!params.routeName,
    retry: 1,
  });
}
