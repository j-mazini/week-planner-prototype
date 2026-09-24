'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchVehicleTypes,
  createVehicleType,
  updateVehicleType,
  type VehicleType,
  type VehicleTypeCreateDTO,
  type VehicleTypeUpdateDTO,
} from '@/lib/types-config-api';

export const useVehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string }>({ search: '' });

  const loadVehicleTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchVehicleTypes();
      setVehicleTypes(data || []);
    } catch (err) {
      console.error('Error loading vehicle types:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicle types';
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        console.warn('Vehicle types table does not exist yet. The backend may need to create the table first.');
        setVehicleTypes([]);
        setError('Vehicle types feature is not available yet. Please contact the administrator to set up the database tables.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredVehicleTypes = useMemo(() => {
    if (!filter.search) {
      return vehicleTypes;
    }

    const searchLower = filter.search.toLowerCase();
    return vehicleTypes.filter((vt) => {
      return (
        vt.typeName?.toLowerCase().includes(searchLower) ||
        vt.vehicleTypeId?.toString().includes(searchLower)
      );
    });
  }, [vehicleTypes, filter]);

  const handleSave = useCallback(async (
    vehicleTypeData: VehicleTypeCreateDTO | VehicleTypeUpdateDTO,
    selectedVehicleType: VehicleType | null
  ) => {
    try {
      if (selectedVehicleType?.vehicleTypeId) {
        await updateVehicleType(selectedVehicleType.vehicleTypeId, vehicleTypeData as VehicleTypeUpdateDTO);
      } else {
        await createVehicleType(vehicleTypeData as VehicleTypeCreateDTO);
      }
      await loadVehicleTypes();
    } catch (error) {
      console.error('Error saving vehicle type:', error);
      throw error;
    }
  }, [loadVehicleTypes]);

  // Load automatically when hook is used
  useEffect(() => {
    loadVehicleTypes();
  }, [loadVehicleTypes]);

  return {
    vehicleTypes,
    filteredVehicleTypes,
    isLoading,
    error,
    filter,
    setFilter,
    loadVehicleTypes,
    handleSave,
  };
};

