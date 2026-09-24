import { useQuery } from '@tanstack/react-query';
import { fetchRoutes, fetchNalcRoute } from '@/lib/api/routes';

export function useRoutes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
    ...options,
  });
}

export function useNalcRoute(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['routes', 'nalc'],
    queryFn: fetchNalcRoute,
    ...options,
  });
}
