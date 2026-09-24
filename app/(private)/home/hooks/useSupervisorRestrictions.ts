import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { resolveSupervisorDepots, type DailySupervisorCheckRecord } from '@/lib/daily-supervisor-check';
import { useDepositsWithRoutes } from '@/hooks/useDepositsWithRoutes';

export function useSupervisorRestrictions(date: string) {
  const { user } = useAuth();
  // Pré-carrega/aquece o cache de depósitos+rotas para outros consumidores (React Query).
  useDepositsWithRoutes();

  const [supervisorDepots, setSupervisorDepots] = useState<DailySupervisorCheckRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isSupervisor = user?.userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR;

  // Resolve todos os depots do supervisor para a data selecionada
  useEffect(() => {
    if (!isSupervisor) return;

    setIsLoading(true);
    resolveSupervisorDepots(date)
      .then((depots) => setSupervisorDepots(depots ?? []))
      .catch(() => setSupervisorDepots([]))
      .finally(() => setIsLoading(false));
  }, [isSupervisor, date]);

  return {
    isSupervisor,
    supervisorDepots,
    isLoading,
  };
}
