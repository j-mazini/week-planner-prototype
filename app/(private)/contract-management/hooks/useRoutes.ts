import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRoutesByLoop, 
  createRoute, 
  updateRoute, 
  deleteRoute,
  type RouteManagement 
} from '@/lib/api/routes-management-api';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Record<string, RouteManagement[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const routesData = await fetchRoutesByLoop();
      setRoutes(routesData);
      
      // If empty structure returned, there may be no routes for the current grouping yet.
      if (Object.keys(routesData).length === 0) {
        console.warn('No routes data returned from /bff/routes.');
        setError(null);
      }
    } catch (error) {
      console.error('Error loading routes:', error);
      // In case of error (like authentication), show message
      if (error instanceof Error) {
        const isAuthError = error.message.includes('token') || error.message.includes('authentication') || error.message.includes('401') || error.message.includes('403');
        
        if (isAuthError) {
          setError(error.message);
        } else {
          // For other errors, log but continue
          console.warn('Error loading routes, but continuing with empty structure:', error.message);
          setError(error.message);
        }
      }
      setRoutes({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const addRoute = useCallback(async (routeData: Partial<RouteManagement>, loopId: string) => {
    try {
      const newRoute = await createRoute({ ...routeData, loopId });
      // Reload full list after creating
      await loadRoutes();
      return newRoute;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }, [loadRoutes]);

  const editRoute = useCallback(async (
    routeId: string,
    loopId: string,
    routeData: Partial<RouteManagement>
  ) => {
    try {
      const updatedRoute = await updateRoute(routeId, loopId, routeData);
      // Reload full list after editing
      await loadRoutes();
      return updatedRoute;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }, [loadRoutes]);

  const removeRoute = useCallback(async (routeId: string, loopId: string) => {
    try {
      await deleteRoute(routeId, loopId);
      // Update local state immediately
      setRoutes(prev => {
        const updated = { ...prev };
        if (updated[loopId]) {
          updated[loopId] = updated[loopId].filter(r => r.id !== routeId);
        }
        return updated;
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }, []);

  return {
    routes,
    isLoading,
    error,
    loadRoutes,
    addRoute,
    editRoute,
    removeRoute,
  };
};

