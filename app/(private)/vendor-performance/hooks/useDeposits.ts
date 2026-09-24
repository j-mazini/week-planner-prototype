import { useState, useCallback, useEffect } from 'react';
import { fetchDeposits } from '@/lib/api/deposits';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';

export type DepositOption = {
  depositId: number;
  depositName: string;
};

export function useDeposits() {
  const [deposits, setDeposits] = useState<DepositOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeposits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeposits();
      setDeposits(
        filterAllowedDeposits(data || []).map((d) => ({
          depositId: d.depositId,
          depositName: d.depositName || 'Deposit ' + d.depositId,
        }))
      );
    } catch (err) {
      console.error('Error loading deposits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deposits');
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  return { deposits, loading, error, refetch: loadDeposits };
}

