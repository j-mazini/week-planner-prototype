"use client";

import { useEffect, useCallback } from 'react';
import { usePlanner } from '../contexts/PlannerContext';
import { usePlannerAPI } from './usePlannerAPI';
import { getWeekDates } from '../utils/dateUtils';

/**
 * Hook for initializing the planner with data
 */
export const usePlannerInitialization = () => {
  const { state, dispatch } = usePlanner();
  const { loadInitialData } = usePlannerAPI();

  /**
   * Initialize planner data
   */
  const initialize = useCallback(async () => {
    try {
      await loadInitialData();
      
      // Set week dates
      const weekDates = getWeekDates(state.displayDate);
      dispatch({ type: 'SET_WEEK_DATES', payload: weekDates });
    } catch (error) {
      console.error('Error initializing planner:', error);
    }
  }, [state.displayDate, loadInitialData, dispatch]);

  /**
   * Initialize on mount and when display date changes
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    initialize,
  };
};

