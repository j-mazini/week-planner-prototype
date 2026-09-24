import { useState, useEffect } from 'react';
import { fetchVendors, type Vendor } from '@/lib/vendors';

/**
 * Returns the list of vendors, optionally filtered by servicePartnerId.
 */
export function useAllVendors(servicePartnerId?: number) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchVendors(servicePartnerId ? { servicePartnerId } : undefined)
      .then((list) => {
        if (cancelled) return;
        setVendors(list);
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
    return () => { cancelled = true; };
  }, [servicePartnerId]);

  return { vendors, loading, error };
}
