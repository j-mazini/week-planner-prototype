import { useQuery } from '@tanstack/react-query';
import { fetchVehicles } from '@/lib/vendors-api';

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });
}
