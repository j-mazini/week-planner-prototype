'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchAdhocServices,
  type AdhocService,
} from '@/lib/types-config-api';

export const useAdhocServicesConfig = () => {
  const [adhocServices, setAdhocServices] = useState<AdhocService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string; servicePartnerId: number | 'all' }>({
    search: '',
    servicePartnerId: 'all',
  });

  const loadAdhocServices = useCallback(async (servicePartnerId?: number | 'all') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdhocServices({ servicePartnerId });
      setAdhocServices(data || []);
    } catch (err) {
      console.error('Error loading adhoc services:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load adhoc services';
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        console.warn('Adhoc services table does not exist yet. The backend may need to create the table first.');
        setAdhocServices([]);
        setError('Adhoc services feature is not available yet. Please contact the administrator to set up the database tables.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredAdhocServices = useMemo(() => {
    if (!filter.search) return adhocServices;
    const searchLower = filter.search.toLowerCase();
    return adhocServices.filter((as) => (
      as.adhocName?.toLowerCase().includes(searchLower) ||
      as.adhocServiceId?.toString().includes(searchLower)
    ));
  }, [adhocServices, filter.search]);

  // Recarrega do backend quando o partner muda — server-side filter.
  useEffect(() => {
    loadAdhocServices(filter.servicePartnerId);
  }, [loadAdhocServices, filter.servicePartnerId]);

  return {
    adhocServices,
    filteredAdhocServices,
    isLoading,
    error,
    filter,
    setFilter,
    loadAdhocServices,
  };
};


