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

import { fetchClearingDeskBoard } from '@/lib/clearing-desk-api';
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
      sort: false, sortValue: 12.5, adhoc: null,
    }));
    await waitFor(() => {
      const carlos = result.current.board!.payees.find(p => p.id === 'MD7E')!;
      expect(carlos.name).toBe('Carlos S.');
      expect(carlos.mode).toBe('VSR');
      expect(carlos.sortValue).toBe(12.5);
    });
  });

  it('surfaces a failed load', async () => {
    vi.mocked(fetchClearingDeskBoard).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useClearingDesk({}), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
