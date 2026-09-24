import { useQuery } from '@tanstack/react-query';
import { fetchUserTypes } from '@/lib/vendors-api';

export function useUserTypes() {
  return useQuery({
    queryKey: ['userTypes'],
    queryFn: fetchUserTypes,
  });
}
