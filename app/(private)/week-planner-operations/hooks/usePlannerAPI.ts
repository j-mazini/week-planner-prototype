"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useCallback } from 'react';
import { usePlanner } from '../contexts/PlannerContext';
import type { Assignment, DayOffEntry, Route, Vendor, Vehicle } from '../types/planner';
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth';
import { guardedFetch } from "@/lib/in-flight-guard";

const API_BASE_URL = getApiBaseUrl() || '';

/**
 * Hook for all API operations related to the planner
 */
export const usePlannerAPI = () => {
  const { state, dispatch } = usePlanner();

  /**
   * Load initial data (vendors, routes, vehicles, assignments)
   */
  const loadInitialData = useCallback(async () => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      // Load vendors
      const vendorsResponse = await guardedFetch(`${API_BASE_URL}/api/vendors`, {
        headers: { ...getBearerAuthHeader() },
      });
      const vendors: Vendor[] = await vendorsResponse.json();
      dispatch({ type: 'SET_VENDORS', payload: vendors });

      // Load routes
      const routesResponse = await guardedFetch(`${API_BASE_URL}/api/routes`, {
        headers: { ...getBearerAuthHeader() },
      });
      const routes: Route[] = await routesResponse.json();
      dispatch({ type: 'SET_ROUTES', payload: routes });

      // Load vehicles
      const vehiclesResponse = await guardedFetch(`${API_BASE_URL}/api/vehicles`, {
        headers: { ...getBearerAuthHeader() },
      });
      const vehicles: Vehicle[] = await vehiclesResponse.json();

      // Load assignments for current week
      const weekStart = new Date(state.displayDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const assignmentsResponse = await guardedFetch(
        `${API_BASE_URL}/api/week-planners?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
        { headers: { ...getBearerAuthHeader() } }
      );
      const assignments: Assignment[] = await assignmentsResponse.json();
      dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });

      // Load day off entries
      const dayOffResponse = await guardedFetch(
        `${API_BASE_URL}/api/day-off?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
        { headers: { ...getBearerAuthHeader() } }
      );
      const dayOffEntries: DayOffEntry[] = await dayOffResponse.json();
      dispatch({ type: 'SET_DAY_OFF_ENTRIES', payload: dayOffEntries });

      return { vendors, routes, vehicles, assignments, dayOffEntries };
    } catch (error) {
      console.error('Error loading initial data:', error);
      throw error;
    }
  }, [state.displayDate, dispatch]);

  /**
   * Update an assignment
   */
  const updateAssignment = useCallback(async (assignment: Assignment): Promise<Assignment> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const response = await guardedFetch(`${API_BASE_URL}/api/week-planners/${assignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      const updated: Assignment = await response.json();
      dispatch({ type: 'UPDATE_ASSIGNMENT', payload: updated });
      return updated;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Save a new assignment
   */
  const saveAssignment = useCallback(async (assignment: Omit<Assignment, 'id'>): Promise<Assignment> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const response = await guardedFetch(`${API_BASE_URL}/api/week-planners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      const created: Assignment = await response.json();
      dispatch({ type: 'ADD_ASSIGNMENT', payload: created });
      return created;
    } catch (error) {
      console.error('Error saving assignment:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Delete an assignment
   */
  const deleteAssignment = useCallback(async (assignmentId: string | number): Promise<void> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const response = await guardedFetch(`${API_BASE_URL}/api/week-planners/${assignmentId}`, {
        method: 'DELETE',
        headers: { ...getBearerAuthHeader() },
      });

      if (!response.ok) throw new Error('Failed to delete assignment');

      dispatch({ type: 'DELETE_ASSIGNMENT', payload: assignmentId });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Register a day off
   */
  const registerDayOff = useCallback(async (entry: Omit<DayOffEntry, 'id'>): Promise<DayOffEntry> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const response = await guardedFetch(`${API_BASE_URL}/api/day-off`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) throw new Error('Failed to register day off');

      const created: DayOffEntry = await response.json();
      dispatch({ type: 'ADD_DAY_OFF', payload: created });
      return created;
    } catch (error) {
      console.error('Error registering day off:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Delete a day off
   */
  const deleteDayOff = useCallback(async (dayOffId: string | number): Promise<void> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const response = await guardedFetch(`${API_BASE_URL}/api/day-off/${dayOffId}`, {
        method: 'DELETE',
        headers: { ...getBearerAuthHeader() },
      });

      if (!response.ok) throw new Error('Failed to delete day off');

      dispatch({ type: 'DELETE_DAY_OFF', payload: dayOffId });
    } catch (error) {
      console.error('Error deleting day off:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Submit week planners
   */
  const submitWeekPlanners = useCallback(async (date: string): Promise<void> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const weekAssignments = state.assignments.filter(a => {
        const assignmentDate = new Date(a.date);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return assignmentDate >= weekStart && assignmentDate <= weekEnd;
      });

      const response = await guardedFetch(`${API_BASE_URL}/api/week-planners/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify({ assignments: weekAssignments.map(a => a.id) }),
      });

      if (!response.ok) throw new Error('Failed to submit week planners');

      // Update assignments status
      weekAssignments.forEach(a => {
        dispatch({
          type: 'UPDATE_ASSIGNMENT',
          payload: { ...a, status: 'submitted' },
        });
      });
    } catch (error) {
      console.error('Error submitting week planners:', error);
      throw error;
    }
  }, [state.assignments, dispatch]);

  /**
   * Export week planners
   */
  const exportWeekPlanners = useCallback(async (date: string): Promise<Blob> => {
    try {
      if (!hasAuthSession()) throw new Error('No authentication token');

      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const response = await guardedFetch(
        `${API_BASE_URL}/api/week-planners/export?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
        { headers: { ...getBearerAuthHeader() } }
      );

      if (!response.ok) throw new Error('Failed to export week planners');

      return await response.blob();
    } catch (error) {
      console.error('Error exporting week planners:', error);
      throw error;
    }
  }, []);

  return {
    loadInitialData,
    updateAssignment,
    saveAssignment,
    deleteAssignment,
    registerDayOff,
    deleteDayOff,
    submitWeekPlanners,
    exportWeekPlanners,
  };
};
