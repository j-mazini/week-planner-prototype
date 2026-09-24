'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchCostModels,
  createCostModel,
  updateCostModel,
  type CostModel,
  type CostModelCreateDTO,
  type CostModelUpdateDTO,
} from '@/lib/types-config-api';

export const useCostModels = () => {
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string }>({ search: '' });

  const loadCostModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCostModels();
      setCostModels(data || []);
    } catch (err) {
      console.error('Error loading cost models:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cost models';
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        console.warn('Cost models table does not exist yet. The backend may need to create the table first.');
        setCostModels([]);
        setError('Cost models feature is not available yet. Please contact the administrator to set up the database tables.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredCostModels = useMemo(() => {
    if (!filter.search) {
      return costModels;
    }

    const searchLower = filter.search.toLowerCase();
    return costModels.filter((cm) => {
      return (
        cm.name?.toLowerCase().includes(searchLower) ||
        cm.description?.toLowerCase().includes(searchLower) ||
        cm.costModelId?.toString().includes(searchLower)
      );
    });
  }, [costModels, filter]);

  const handleSave = useCallback(async (
    costModelData: CostModelCreateDTO | CostModelUpdateDTO,
    selectedCostModel: CostModel | null
  ) => {
    try {
      if (selectedCostModel?.costModelId) {
        await updateCostModel(selectedCostModel.costModelId, costModelData as CostModelUpdateDTO);
      } else {
        await createCostModel(costModelData as CostModelCreateDTO);
      }
      await loadCostModels();
    } catch (error) {
      console.error('Error saving cost model:', error);
      throw error;
    }
  }, [loadCostModels]);

  // Load automatically when hook is used
  useEffect(() => {
    loadCostModels();
  }, [loadCostModels]);

  return {
    costModels,
    filteredCostModels,
    isLoading,
    error,
    filter,
    setFilter,
    loadCostModels,
    handleSave,
  };
};


