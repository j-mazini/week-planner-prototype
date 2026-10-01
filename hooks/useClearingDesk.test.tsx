// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clearingDeskFixture } from '@/lib/mocks/clearing-desk-fixtures';

vi.mock('@/lib/clearing-desk-api', () => ({
  fetchClearingDeskBoard: vi.fn(),
  approveClearing: vi.fn(async () => ({ success: true })),
  returnToQueue: vi.fn(async () => ({ success: true })),
  updatePayee: vi.fn(async () => ({ success: true })),
  saveRouteNote: vi.fn(async () => ({ success: true })),
}));

import {
  fetchClearingDeskBoard, approveClearing, returnToQueue, updatePayee,
} from '@/lib/clearing-desk-api';
import { useClearingDesk } from './useClearingDesk';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  vi.mocked(fetchClearingDeskBoard).mockResolvedValue(clearingDeskFixture());
});

describe('useClearingDesk', () => {
  it('maps the board once loaded', async () => {
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    expect(result.current.board!.payees).toHaveLength(6);
    expect(result.current.board!.payees[0].payment).toEqual({ amount: 160, flat: false });
  });

  it('moves an approved payee into cleared, most recent first', async () => {
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    act(() => result.current.approve('DY1B'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual(['DY1B']));
    act(() => result.current.approve('MD7E'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual(['MD7E', 'DY1B']));
  });

  it('restores a payee back out of cleared', async () => {
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    act(() => result.current.approve('DY1B'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual(['DY1B']));
    act(() => result.current.restore('DY1B'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual([]));
  });

  it('applies an edit to the payee in the cache', async () => {
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    act(() => result.current.savePayee('MD7E', {
      name: 'Carlos S.', vehicle: 'MA26 XWK', mode: 'VSR',
      payment: { amount: 212.75, flat: true },
      sort: false, sortValue: 12.5, adhoc: null,
    }));
    await waitFor(() => {
      const carlos = result.current.board!.payees.find(p => p.id === 'MD7E')!;
      expect(carlos.name).toBe('Carlos S.');
      expect(carlos.mode).toBe('VSR');
      expect(carlos.sortValue).toBe(12.5);
      expect(carlos.payment).toEqual({ amount: 212.75, flat: true });
    });
  });

  // A deferred (manually-settled) promise lets these tests confirm the
  // optimistic edit actually landed in the cache *before* the mutation fails,
  // instead of racing an already-rejected promise against React Query's own
  // notify batching — the polling-based version of this test passed even
  // with no rollback implemented, because both the optimistic edit and the
  // rollback settled before the first `waitFor` poll ever ran.
  function deferred<T>() {
    let reject!: (err: unknown) => void;
    const promise = new Promise<T>((_resolve, rej) => { reject = rej; });
    return { promise, reject };
  }

  it('rolls back an approve that fails', async () => {
    const pending = deferred<{ success: boolean }>();
    vi.mocked(approveClearing).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    act(() => result.current.approve('DY1B'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual(['DY1B']));
    act(() => pending.reject(new Error('boom')));
    await waitFor(() => expect(result.current.board!.cleared).toEqual([]));
  });

  it('rolls back a restore that fails', async () => {
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    act(() => result.current.approve('DY1B'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual(['DY1B']));
    const pending = deferred<{ success: boolean }>();
    vi.mocked(returnToQueue).mockReturnValueOnce(pending.promise);
    act(() => result.current.restore('DY1B'));
    await waitFor(() => expect(result.current.board!.cleared).toEqual([]));
    act(() => pending.reject(new Error('boom')));
    await waitFor(() => expect(result.current.board!.cleared).toEqual(['DY1B']));
  });

  it('rolls back a payee edit that fails', async () => {
    const pending = deferred<{ success: boolean }>();
    vi.mocked(updatePayee).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.board).toBeDefined());
    const originalName = result.current.board!.payees.find(p => p.id === 'MD7E')!.name;
    act(() => result.current.savePayee('MD7E', {
      name: 'Carlos S.', vehicle: 'MA26 XWK', mode: 'VSR',
      payment: { amount: 212.75, flat: true },
      sort: false, sortValue: 12.5, adhoc: null,
    }));
    await waitFor(() => {
      const carlos = result.current.board!.payees.find(p => p.id === 'MD7E')!;
      expect(carlos.name).toBe('Carlos S.');
    });
    act(() => pending.reject(new Error('boom')));
    await waitFor(() => {
      const carlos = result.current.board!.payees.find(p => p.id === 'MD7E')!;
      expect(carlos.name).toBe(originalName);
    });
  });

  it('surfaces a failed load', async () => {
    vi.mocked(fetchClearingDeskBoard).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
