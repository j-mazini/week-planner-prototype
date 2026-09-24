// hooks/useDailyGamePlanActions.ts
/**
 * Hook providing mutation actions for Daily Game Plan operations.
 * It wraps the API service functions with React Query `useMutation`
 * and handles cache invalidation via `queryClient`.
 *
 * Exported mutations:
 * - createOperation
 * - updateOperation
 * - deleteOperation
 * - transitionOperation
 * - bulkCreateOperations
 * - bulkDayOffManagement
 *
 * Each mutation returns the `mutateAsync` function for easy async/await usage
 * and the mutation object for status tracking.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDailyGamePlanOperation,
  updateDailyGamePlanOperation,
  deleteDailyGamePlanOperation,
  transitionDailyGamePlanOperation,
  bulkCreateDailyGamePlanOperations,
  bulkDayOffDailyOperationsManagement,
} from '@/app/(private)/daily-game-plan/api';
import type {
  DailyGamePlanOperationCreateDTO,
  DailyGamePlanOperationUpdateDTO,
  DailyOperationsManagementBulkCreateItemDTO,
} from '@/app/(private)/daily-game-plan/api';

/**
 * Custom hook exposing mutation functions for Daily Game Plan.
 *
 * @returns An object containing mutation functions and their status objects.
 */
export const useDailyGamePlanActions = () => {
  const queryClient = useQueryClient();

  // Helper to invalidate relevant queries after a mutation.
  const invalidate = () => {
    // Adjust query keys according to your app's data fetching hooks.
    queryClient.invalidateQueries({ queryKey: ['dailyGamePlans'] });
    queryClient.invalidateQueries({ queryKey: ['dailyGamePlanOperations'] });
    queryClient.invalidateQueries({ queryKey: ['weekPlanners'] });
  };

  // ---------------------------------------------------------------------
  // Create operation
  // ---------------------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (payload: DailyGamePlanOperationCreateDTO) => createDailyGamePlanOperation(payload),
    onSuccess: () => {
      invalidate();
    },
  });

  // ---------------------------------------------------------------------
  // Update operation (partial patch)
  // ---------------------------------------------------------------------
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DailyGamePlanOperationUpdateDTO }) =>
      updateDailyGamePlanOperation(id, payload),
    onSuccess: () => {
      invalidate();
    },
  });

  // ---------------------------------------------------------------------
  // Delete operation
  // ---------------------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDailyGamePlanOperation(id),
    onSuccess: () => {
      invalidate();
    },
  });

  // ---------------------------------------------------------------------
  // Transition operation (status change)
  // ---------------------------------------------------------------------
  const transitionMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      transitionDailyGamePlanOperation(id, action),
    onSuccess: () => {
      invalidate();
    },
  });

  // ---------------------------------------------------------------------
  // Bulk create operations
  // ---------------------------------------------------------------------
  const bulkCreateMutation = useMutation({
    mutationFn: (items: DailyOperationsManagementBulkCreateItemDTO[]) =>
      bulkCreateDailyGamePlanOperations({ items }),
    onSuccess: () => {
      invalidate();
    },
  });

  // ---------------------------------------------------------------------
  // Bulk day‑off management (used for BAOP re‑allocation)
  // ---------------------------------------------------------------------
  const bulkDayOffMutation = useMutation({
    mutationFn: (payload: Partial<import('@/app/(private)/daily-game-plan/api').DailyGamePlanOperationDTO>[]) =>
      bulkDayOffDailyOperationsManagement(payload),
    onSuccess: () => {
      invalidate();
    },
  });

  return {
    /** Create a new Daily Game Plan operation */
    createOperation: createMutation.mutateAsync,
    createStatus: createMutation,

    /** Update an existing operation (partial) */
    updateOperation: updateMutation.mutateAsync,
    updateStatus: updateMutation,

    /** Delete an operation */
    deleteOperation: deleteMutation.mutateAsync,
    deleteStatus: deleteMutation,

    /** Transition operation status (e.g., move_to_day_off) */
    transitionOperation: transitionMutation.mutateAsync,
    transitionStatus: transitionMutation,

    /** Bulk‑create many operations at once */
    bulkCreateOperations: bulkCreateMutation.mutateAsync,
    bulkCreateStatus: bulkCreateMutation,

    /** Bulk day‑off management (used for BAOP re‑allocation) */
    bulkDayOffManagement: bulkDayOffMutation.mutateAsync,
    bulkDayOffStatus: bulkDayOffMutation,
  };
};


