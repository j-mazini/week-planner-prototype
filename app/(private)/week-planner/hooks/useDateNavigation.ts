"use client";

import { useCallback, useEffect } from 'react';
import { usePlanner } from '../contexts/PlannerContext';

/**
 * Hook for date navigation and management
 */
export const useDateNavigation = () => {
  const { state, dispatch } = usePlanner();

  const setSelectedDate = useCallback((date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  }, [dispatch]);

  // Reset to page 1 when date or search changes
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 1 });
  }, [state.selectedDate, state.searchTerm, dispatch]);

  return {
    selectedDate: state.selectedDate,
    setSelectedDate,
  };
};
