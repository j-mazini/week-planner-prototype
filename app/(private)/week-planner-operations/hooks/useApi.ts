"use client";

import { useCallback } from 'react';
import { usePlanner } from '../contexts/PlannerContext';
import {
  fetchWeekPlannerTypes,
  fetchWeekPlannersPaginated,
  fetchAllWeekPlannersForDate,
  createWeekPlanner,
  updateWeekPlanner,
  deleteWeekPlanner,
  submitWeekPlanners,
  exportWeekPlanners,
  type WeekPlannerCreateDTO,
} from '../services/apiService';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';

/**
 * Hook for API operations
 */
export const useApi = () => {
  const { state, dispatch } = usePlanner();
  const itemsPerPage = 50;

  const loadWeekPlannerTypes = useCallback(async () => {
    try {
      const types = await fetchWeekPlannerTypes();
      dispatch({ type: 'SET_WEEK_PLANNER_TYPES', payload: types });
    } catch (err) {
      console.error("Error fetching week planner types:", err);
    }
  }, [dispatch]);

  const loadOperations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const result = await fetchWeekPlannersPaginated(
        state.currentPage,
        itemsPerPage,
        state.selectedDate,
        state.searchTerm
      );

      dispatch({ type: 'SET_OPERATIONS', payload: result.data });
      
      const calculatedTotalPages = Math.ceil(result.total / itemsPerPage) || 1;
      dispatch({ type: 'SET_TOTAL_PAGES', payload: calculatedTotalPages });
      dispatch({ type: 'SET_TOTAL_RECORDS', payload: result.total });
      
      if (state.currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        dispatch({ type: 'SET_CURRENT_PAGE', payload: calculatedTotalPages });
      }
    } catch (err) {
      console.error("Error fetching week planners:", err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : "Failed to load week planners" 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPage, state.selectedDate, state.searchTerm, state.refreshTrigger, dispatch]);

  const loadAllWeekPlannersForDate = useCallback(async (date: string): Promise<WeekPlannerRecord[]> => {
    try {
      const data = await fetchAllWeekPlannersForDate(date);
      
      // Update state with complete data for this date
      const otherDates = state.allOperations.filter(wp => wp.date !== date);
      dispatch({ type: 'SET_OPERATIONS', payload: [...otherDates, ...data] });
      
      return data;
    } catch (err) {
      console.error("Error fetching all week planners:", err);
      return [];
    }
  }, [state.allOperations, dispatch]);

  const saveWeekPlanner = useCallback(async (
    payload: WeekPlannerCreateDTO,
    editingId: number | null,
    _rawData?: Record<string, unknown>
  ): Promise<WeekPlannerRecord> => {
    let weekPlanner: WeekPlannerRecord;
    
    if (editingId) {
      weekPlanner = await updateWeekPlanner(editingId, payload);
    } else {
      weekPlanner = await createWeekPlanner(payload);
    }

    dispatch({ type: 'UPSERT_OPERATION', payload: weekPlanner });
    dispatch({ type: 'INCREMENT_REFRESH_TRIGGER' });
    
    return weekPlanner;
  }, [dispatch]);

  const removeWeekPlanner = useCallback(async (id: number): Promise<void> => {
    await deleteWeekPlanner(id);
    dispatch({ type: 'REMOVE_OPERATION', payload: id });
    dispatch({ type: 'INCREMENT_REFRESH_TRIGGER' });
  }, [dispatch]);

  const submitWeekPlannersData = useCallback(async (
    weekPlanners: WeekPlannerRecord[]
  ): Promise<void> => {
    await submitWeekPlanners(weekPlanners);
    dispatch({ type: 'INCREMENT_REFRESH_TRIGGER' });
  }, [dispatch]);

  const downloadWeekPlanners = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { blob, filename } = await exportWeekPlanners(state.selectedDate, state.searchTerm);
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error("Error downloading week planners:", error);
      alert(error instanceof Error ? error.message : "Error downloading file. Please try again.");
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedDate, state.searchTerm, dispatch]);

  return {
    loadWeekPlannerTypes,
    loadOperations,
    loadAllWeekPlannersForDate,
    saveWeekPlanner,
    removeWeekPlanner,
    submitWeekPlannersData,
    downloadWeekPlanners,
  };
};

