import { useQuery } from '@tanstack/react-query';
import { fetchCurrentCompany, type CompanyDTO } from '@/lib/companies-api';
import { hasAuthSession } from '@/lib/auth';

/**
 * Hook para buscar a company do usuario autenticado (derivada do companyId no JWT).
 * Sem cache client-side: cada montagem/refetch deve consultar o backend.
 */
export function useCurrentCompany() {
  return useQuery<CompanyDTO>({
    queryKey: ['current-company'],
    queryFn: fetchCurrentCompany,
    enabled: typeof window !== 'undefined' && hasAuthSession(),
    retry: 1,
  });
}
