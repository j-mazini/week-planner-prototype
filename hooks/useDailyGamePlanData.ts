import { useQuery } from '@tanstack/react-query';
import { fetchVehiclesAvailableByDate } from '@/lib/vehicles';
import { fetchVendorsFromUsers } from '@/lib/vendors';
import { fetchRoutes } from '@/lib/api/routes';

/**
 * Hook composto para centralizar os dados necessários para o Daily Game Plan.
 * 
 * @param date A data no formato YYYY-MM-DD para filtragem de veículos disponíveis.
 * @returns Um objeto contendo os estados do React Query para vehicles, vendors e routes.
 * 
 * @example
 * const { vehicles, vendors, routes } = useDailyGamePlanData('2026-04-01');
 * 
 * @see {@link fetchVehiclesAvailableByDate} Fonte de dados para vehicles (disponíveis por data).
 * @see {@link fetchVendorsFromUsers} Fonte de dados para vendors (vendors ativos).
 * @see {@link fetchRoutes} Fonte de dados para routes (todas as rotas).
 * 
 * Sem cache client-side: cada montagem/refetch deve consultar o backend.
 */
export function useDailyGamePlanData(date: string) {
  const vehicles = useQuery({
    queryKey: ['vehicles', 'available', date],
    queryFn: () => fetchVehiclesAvailableByDate(date),
    enabled: !!date,
  });

  const vendors = useQuery({
    queryKey: ['vendors', 'active', { status: 'eligible' }],
    queryFn: () => fetchVendorsFromUsers({ status: 'eligible' }),
  });

  const routes = useQuery({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
  });

  return { vehicles, vendors, routes };
}
