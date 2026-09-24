import { useQuery } from '@tanstack/react-query';
import { fetchAdhocServices } from '@/lib/adhoc-services-api';

/**
 * Hook para buscar serviços ad-hoc.
 * 
 * @returns Um objeto do React Query contendo a lista de serviços ad-hoc.
 * 
 * @see {@link fetchAdhocServices} Fonte de dados para serviços ad-hoc.
 */
export function useAdhocServices() {
  return useQuery({
    queryKey: ['adhoc-services'],
    queryFn: fetchAdhocServices,
  });
}
