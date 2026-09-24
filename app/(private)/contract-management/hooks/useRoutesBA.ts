import { useState, useCallback, useMemo, useEffect } from 'react';
import { fetchRoutes, deleteRoute, type Route } from '@/lib/api/routes';

export const useRoutesBA = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string; active: string; servicePartnerId: number | 'all' }>({
    search: '',
    active: 'all',
    servicePartnerId: 'all',
  });

  const loadRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError(error instanceof Error ? error.message : 'Error loading routes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const filteredRoutes = useMemo(() => {
    let filtered = routes;

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(route => 
        (route.routeName || '').toLowerCase().includes(searchLower) ||
        String(route.routeId || '').includes(searchLower) ||
        String(route.depositId || '').includes(searchLower) ||
        String(route.customerId || '').includes(searchLower)
      );
    }

    if (filter.active !== 'all') {
      const isActive = filter.active === 'active';
      filtered = filtered.filter(route => (route.active ?? true) === isActive);
    }

    if (filter.servicePartnerId !== 'all') {
      const target = Number(filter.servicePartnerId);
      filtered = filtered.filter(route => {
        if (route.servicePartnerId == null) return false;
        return Number(route.servicePartnerId) === target;
      });
    }

    return filtered;
  }, [routes, filter]);

  const handleDeleteRoute = useCallback(async (routeId: number) => {
    try {
      await deleteRoute(routeId);
      await loadRoutes(); // Reload routes after deletion
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }, [loadRoutes]);

  return {
    routes,
    filteredRoutes,
    isLoading,
    error,
    filter,
    setFilter,
    loadRoutes,
    deleteRoute: handleDeleteRoute,
  };
};


