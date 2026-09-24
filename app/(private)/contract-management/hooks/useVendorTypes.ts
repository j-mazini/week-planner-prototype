'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchVendorTypes,
  createVendorType,
  updateVendorType,
  type VendorType,
  type VendorTypeCreateDTO,
  type VendorTypeUpdateDTO,
} from '@/lib/types-config-api';

export const useVendorTypes = () => {
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string }>({ search: '' });

  const loadVendorTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchVendorTypes();
      setVendorTypes(data || []);
    } catch (err) {
      console.error('Error loading vendor types:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vendor types';
      // If the table does not exist, do not show critical error, just warning
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        console.warn('Vendor types table does not exist yet. The backend may need to create the table first.');
        setVendorTypes([]);
        setError('Vendor types feature is not available yet. Please contact the administrator to set up the database tables.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredVendorTypes = useMemo(() => {
    if (!filter.search) {
      return vendorTypes;
    }

    const searchLower = filter.search.toLowerCase();
    return vendorTypes.filter((vt) => {
      return (
        vt.nameType?.toLowerCase().includes(searchLower) ||
        vt.vendorTypeId?.toString().includes(searchLower)
      );
    });
  }, [vendorTypes, filter]);

  const handleSave = useCallback(async (
    vendorTypeData: VendorTypeCreateDTO | VendorTypeUpdateDTO,
    selectedVendorType: VendorType | null
  ) => {
    try {
      if (selectedVendorType?.vendorTypeId) {
        await updateVendorType(selectedVendorType.vendorTypeId, vendorTypeData as VendorTypeUpdateDTO);
      } else {
        await createVendorType(vendorTypeData as VendorTypeCreateDTO);
      }
      await loadVendorTypes();
    } catch (error) {
      console.error('Error saving vendor type:', error);
      throw error;
    }
  }, [loadVendorTypes]);

  // Load automatically when hook is used
  useEffect(() => {
    loadVendorTypes();
  }, [loadVendorTypes]);

  return {
    vendorTypes,
    filteredVendorTypes,
    isLoading,
    error,
    filter,
    setFilter,
    loadVendorTypes,
    handleSave,
  };
};


