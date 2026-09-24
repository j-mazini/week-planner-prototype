import { useQuery } from '@tanstack/react-query';
import { fetchDepositsWithRoutesFull, type DepositWithRoutesFullDTO } from '@/lib/api/routes';

/**
 * Hook para buscar a lista de depósitos contendo todas as rotas associadas.
 * 
 * @returns Um objeto do React Query contendo a lista completa de depósitos e rotas.
 * 
 * @see {@link fetchDepositsWithRoutesFull} Fonte de dados com as rotas detalhadas por depósito.
 */
export function useDepositsWithRoutes(options?: { enabled?: boolean }) {
  return useQuery<DepositWithRoutesFullDTO[]>({
    queryKey: ['deposits', 'routes', 'full'],
    queryFn: () => fetchDepositsWithRoutesFull(),
    ...options,
  });
}
