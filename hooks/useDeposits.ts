import { useQuery } from '@tanstack/react-query';
import { fetchDeposits } from '@/lib/api/deposits';

export function useDeposits() {
  return useQuery({
    queryKey: ['deposits'],
    queryFn: fetchDeposits,
  });
}
