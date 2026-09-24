import { useState, useEffect, useCallback } from 'react';
import { fetchVendors, createVendor, updateVendor, deactivateVendor, type Vendor } from '@/lib/vendors-api';

export const useVendors = (_servicePartnerId?: number | string) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const vendorsData = await fetchVendors();
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadVendorsByServicePartner = useCallback(async (spId?: number | string) => {
    setIsLoading(true);
    try {
      const filters = spId ? { servicePartnerId: Number(spId) } : undefined;
      const vendorsData = await fetchVendors(filters);
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error loading vendors by service partner:', error);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const addVendor = useCallback(async (vendorData: Omit<Vendor, 'id'>) => {
    try {
      await createVendor(vendorData);
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }, []);

  const editVendor = useCallback(async (id: number, vendorData: Partial<Vendor>) => {
    try {
      await updateVendor(id, vendorData);
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }, []);

  const deactivateVendorHandler = useCallback(async (id: number) => {
    try {
      await deactivateVendor(id);
      setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Inactive' as const } : v));
    } catch (error) {
      console.error('Error deactivating vendor:', error);
      throw error;
    }
  }, []);

  return {
    vendors,
    isLoading,
    loadVendors,
    loadVendorsByServicePartner,
    addVendor,
    editVendor,
    deactivateVendor: deactivateVendorHandler,
  };
};

