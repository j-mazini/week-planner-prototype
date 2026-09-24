"use client";

import { useMemo } from 'react';
import { usePlanner } from '../contexts/PlannerContext';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';

const PENDING_STATUSES = new Set(["pending", "awaiting_review", "pending_review"]);

export type PendingDay = {
  date: string;
  data: WeekPlannerRecord[];
};

/**
 * Hook for managing planner data and derived state
 */
export const usePlannerData = () => {
  const { state } = usePlanner();

  // Get current operations for selected date
  const currentOperations = useMemo(
    () => state.allOperations.filter((weekPlanner) => weekPlanner.date === state.selectedDate),
    [state.allOperations, state.selectedDate],
  );

  // Filter operations that don't have operationId (not yet processed)
  const currentOperationsWithoutOperationId = useMemo(
    () => currentOperations.filter((item) => item.operationId === undefined || item.operationId === null),
    [currentOperations],
  );

  // Get pending days
  const pendingDays: PendingDay[] = useMemo(() => {
    if (state.allOperations.length === 0) return [];

    const grouped = new Map<string, WeekPlannerRecord[]>();

    state.allOperations.forEach((weekPlanner) => {
      if (weekPlanner.date === state.selectedDate) {
        return;
      }

      const status = weekPlanner.status?.toLowerCase();
      if (status && PENDING_STATUSES.has(status)) {
        const collection = grouped.get(weekPlanner.date) ?? [];
        collection.push(weekPlanner);
        grouped.set(weekPlanner.date, collection);
      }
    });

    return Array.from(grouped.entries())
      .map(([date, data]) => ({ date, data }))
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [state.allOperations, state.selectedDate]);

  // Get paginated and sorted data
  const paginatedDataSource = useMemo(() => {
    const filtered = currentOperationsWithoutOperationId.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        item.route.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        item.vehicle.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        item.registrationPlate.toLowerCase().includes(state.searchTerm.toLowerCase());

      return matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const key = state.sortConfig.key;
      const directionFactor = state.sortConfig.direction === "asc" ? 1 : -1;

      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      // Handle date sorting
      if (key === "date") {
        const aDate = aValue ? new Date(String(aValue)).getTime() : 0;
        const bDate = bValue ? new Date(String(bValue)).getTime() : 0;
        return (aDate - bDate) * directionFactor;
      }

      // Handle numeric fields
      const isNumeric = key === "routeSort" || key === "adhocSort";
      if (isNumeric) {
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        return (aNum - bNum) * directionFactor;
      }

      // Default string comparison
      return String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase()) * directionFactor;
    });

    return sorted;
  }, [currentOperationsWithoutOperationId, state.searchTerm, state.sortConfig]);

  // Get pending day for review
  const pendingDayForReview = useMemo(() => {
    if (!state.pendingReviewDate) return null;
    return state.allOperations.filter((weekPlanner) => weekPlanner.date === state.pendingReviewDate);
  }, [state.allOperations, state.pendingReviewDate]);

  return {
    currentOperations,
    currentOperationsWithoutOperationId,
    pendingDays,
    paginatedDataSource,
    pendingDayForReview,
  };
};

