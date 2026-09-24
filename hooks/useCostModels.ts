import { useQuery } from '@tanstack/react-query';
import { fetchCostModels } from '@/lib/api/cost-models';

export function useCostModels() {
  return useQuery({
    queryKey: ['costModels'],
    queryFn: fetchCostModels,
  });
}
