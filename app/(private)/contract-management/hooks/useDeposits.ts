import { useState, useCallback, useMemo } from 'react';
import { 
  fetchDepositsWithLoopsAndRoutes, 
  type DepositWithLoopsAndRoutesDTO,
} from '@/lib/serviceTypes';

export const useDeposits = () => {
  const [depositsWithLoops, setDepositsWithLoops] = useState<DepositWithLoopsAndRoutesDTO[]>([]);
  const [isLoadingDepositsWithRoutes, setIsLoadingDepositsWithRoutes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeposits = useCallback(async () => {
    setIsLoadingDepositsWithRoutes(true);
    setError(null);
    try {
      const data = await fetchDepositsWithLoopsAndRoutes();
      setDepositsWithLoops(data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setError(error instanceof Error ? error.message : 'Error loading deposits');
    } finally {
      setIsLoadingDepositsWithRoutes(false);
    }
  }, []);

  const loadDepositsWithRoutes = useCallback(async () => {
    setIsLoadingDepositsWithRoutes(true);
    setError(null);
    try {
      const data = await fetchDepositsWithLoopsAndRoutes();
      setDepositsWithLoops(data);
    } catch (error) {
      console.error('Error fetching deposits with loops and routes:', error);
      setError(error instanceof Error ? error.message : 'Error loading deposits with loops and routes');
    } finally {
      setIsLoadingDepositsWithRoutes(false);
    }
  }, []);

  const availableLoops = useMemo(() => {
    const loopsSet = new Set<string>();
    depositsWithLoops.forEach(dep => {
      dep.loops?.forEach(loop => {
        if (loop.loop_name) {
          loopsSet.add(loop.loop_name);
        }
      });
    });
    return Array.from(loopsSet).sort();
  }, [depositsWithLoops]);

  const availableDeposits = useMemo(
    () => depositsWithLoops.map(dep => ({ id: dep.depositId, name: dep.depositName || `Deposit ${dep.depositId}` })),
    [depositsWithLoops]
  );

  return {
    depositsWithLoops,
    isLoadingDepositsWithRoutes,
    error,
    loadDeposits,
    loadDepositsWithRoutes,
    availableLoops,
    availableDeposits,
  };
};


