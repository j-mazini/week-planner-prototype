'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveClearing, fetchClearingDeskBoard, returnToQueue, saveRouteNote, updatePayee,
} from '@/lib/clearing-desk-api';
import { mapBoard } from '@/app/(private)/clearing-desk/utils/mappers';
import type { ClearingDeskBoard, PayeeUpdate } from '@/app/(private)/clearing-desk/types';

interface Params { depot?: string; date?: string }

export function useClearingDesk({ depot, date }: Params) {
  const queryClient = useQueryClient();
  const queryKey = ['clearing-desk', depot, date] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => mapBoard(await fetchClearingDeskBoard({ depot, date })),
  });

  const edit = (change: (board: ClearingDeskBoard) => ClearingDeskBoard) =>
    queryClient.setQueryData<ClearingDeskBoard>(queryKey, current =>
      (current ? change(current) : current));

  // No `onSettled` invalidation here. MOCK_MODE answers every non-GET with a
  // generic `{ success: true }` and persists nothing, so a refetch after
  // mutating would re-fetch the pristine fixture and silently erase the
  // optimistic edit above — the edit is what actually drives the screen while
  // the mock is in place. Against a real backend this trades away
  // reconciliation with server-computed state (e.g. a route re-sorted by
  // someone else); re-add `onSettled: () => queryClient.invalidateQueries({ queryKey })`
  // once `updatePayee`/`approveClearing`/`returnToQueue` hit a real API that
  // echoes back authoritative state. In place of that reconciliation, each
  // mutation below snapshots the pre-edit board in `onMutate` and restores it
  // in `onError`, so a failed call rolls the cache back instead of leaving it
  // silently diverged from the server — that rollback is what `onSettled`
  // would otherwise have covered, and it should stay even after `onSettled`
  // is reinstated for a real backend.
  const approveMutation = useMutation({
    mutationFn: (id: string) => approveClearing(id),
    onMutate: (id) => {
      const previous = queryClient.getQueryData<ClearingDeskBoard>(queryKey);
      edit(board => ({ ...board, cleared: [id, ...board.cleared] }));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => returnToQueue(id),
    onMutate: (id) => {
      const previous = queryClient.getQueryData<ClearingDeskBoard>(queryKey);
      edit(board => ({ ...board, cleared: board.cleared.filter(c => c !== id) }));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const savePayeeMutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: PayeeUpdate }) => updatePayee(id, update),
    onMutate: ({ id, update }) => {
      const previous = queryClient.getQueryData<ClearingDeskBoard>(queryKey);
      edit(board => ({
        ...board,
        payees: board.payees.map(p => (p.id === id ? { ...p, ...update } : p)),
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => saveRouteNote(id, note),
  });

  return {
    board: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    approve: (id: string) => approveMutation.mutate(id),
    restore: (id: string) => restoreMutation.mutate(id),
    savePayee: (id: string, update: PayeeUpdate) => savePayeeMutation.mutate({ id, update }),
    saveNote: (id: string, note: string) => saveNoteMutation.mutate({ id, note }),
  };
}
