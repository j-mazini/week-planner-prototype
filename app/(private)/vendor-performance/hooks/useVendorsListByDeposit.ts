import { useState, useEffect } from 'react';
import { fetchVendorsByDeposit } from '@/lib/vendors';
import type { Vendor } from '@/lib/vendors';

/**
 * Returns the full list of vendors for the given deposit.
 * Used to populate the vendor dropdown without fetching all performance data.
 * Only fetches when depositId is set.
 */
export function useVendorsListByDeposit(depositId: number | null) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (depositId == null || depositId <= 0) {
      setVendors([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchVendorsByDeposit(depositId)
      .then((list) => {
        if (cancelled) return;
        setVendors(list);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setVendors([]);
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [depositId]);

  return { vendors, loading, error };
}
