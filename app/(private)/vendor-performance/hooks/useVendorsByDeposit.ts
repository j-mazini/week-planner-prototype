import { useState, useEffect } from 'react';
import { fetchVendorsByDeposit } from '@/lib/vendors';

/**
 * Returns set of userIds for vendors in the given deposit.
 * Used to filter the full performance list by depot.
 */
export function useVendorsByDeposit(depositId: number | null) {
  const [vendorUserIds, setVendorUserIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (depositId == null || depositId <= 0) {
      setVendorUserIds(new Set());
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchVendorsByDeposit(depositId)
      .then((vendors) => {
        if (cancelled) return;
        setVendorUserIds(new Set(vendors.map((d) => d.userId)));
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setVendorUserIds(new Set());
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [depositId]);

  return { vendorUserIds, loading, error };
}

