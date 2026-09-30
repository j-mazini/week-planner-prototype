# Clearing Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/clearing-desk`, a payment authorization and clearing page for admins and supervisors, from the `clearing-desk-react` Figma export.

**Architecture:** A client page under `app/(private)/clearing-desk/` rendered inside `NavbarWrapper`, following the same shape as `week-planner` and `daily-game-plan`. Server state lives in TanStack Query, fed by `lib/clearing-desk-api.ts`; because the backend has no clearing endpoints yet, `lib/mocks/page-payload.ts` answers those paths from fixtures, which is the repo's existing offline mechanism rather than a new one. Mutations update the query cache optimistically so the screen reacts in `MOCK_MODE`, where every non-GET returns a generic success.

**Tech Stack:** Next.js 15.5.26 (App Router), React 19, TypeScript, TanStack Query v5, Vitest + Testing Library, plain CSS scoped by class.

**Spec:** `docs/superpowers/specs/2026-09-30-clearing-desk-design.md`

## Global Constraints

- Route path is exactly `/clearing-desk`. Never `cleaning-desk`.
- Visible to admin (`USER_TYPE.ADMIN = 1`) and supervisor (`USER_TYPE.SUPERVISOR = 3`) only. Drivers and service partners must not see it.
- No `fetch` inside any `.tsx`. Data access lives in `lib/`.
- No new endpoint may be invented in `logix-sphere-backend`. The paths in this plan exist only in the mock layer until the backend ships them.
- `queryKey` is `["clearing-desk", depot, date]`. Do not reuse or shadow it.
- Currency is GBP, rendered `£ 0.00` (space after the symbol, two decimals) exactly as the export does.
- Source export lives at `<scratchpad>/cd/clearing-desk-react/`. It is a reference to copy from, never a dependency to install.
- All four gates must pass before the final commit: `npx tsc --noEmit`, `npx eslint .`, `npm test`, `npm run build`.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `app/(private)/clearing-desk/types.ts` | Screen-level types. No DTOs. |
| `app/(private)/clearing-desk/utils/mappers.ts` | `snake_case` DTO → screen type; normalises money, decimals, absent values. |
| `lib/mocks/clearing-desk-fixtures.ts` | The six payees transcribed from the design. |
| `lib/mocks/page-payload.ts` | *(modify)* Route `/bff/clearing-desk` to the fixtures. |
| `lib/clearing-desk-api.ts` | The five calls. Uses `lib/api-client.ts`. |
| `hooks/useClearingDesk.ts` | `useQuery` + four mutations with optimistic cache updates. |
| `lib/route-permissions.ts` | *(modify)* Whitelist the path for supervisors. |
| `app/(private)/components/NavbarWrapper.tsx` | *(modify)* Sidebar entry + `NavKey` fix. |
| `app/(private)/clearing-desk/page.tsx` | Orchestrator inside `NavbarWrapper`. |
| `app/(private)/clearing-desk/loading.tsx` | `PrivateRouteLoading`. |
| `app/(private)/clearing-desk/styles.css` | Export CSS, scoped under `.clearing-desk`. |
| `app/(private)/clearing-desk/ClearingDeskContent.tsx` | Composition; owns selection/search/edit state. |
| `app/(private)/clearing-desk/components/PendingQueue.tsx` | Search, list, counter, empty-queue state. |
| `app/(private)/clearing-desk/components/PayeeCard.tsx` | One queue row. |
| `app/(private)/clearing-desk/components/ClearingPanel.tsx` | Detail card + approve button. |
| `app/(private)/clearing-desk/components/RouteBalanceResume.tsx` | Postcodes / stops / pre-12. |
| `app/(private)/clearing-desk/components/PayableEstimate.tsx` | Per stop / total. |
| `app/(private)/clearing-desk/components/ManagementNotes.tsx` | Notes textarea + save. |
| `app/(private)/clearing-desk/components/PayeeEditor.tsx` | Edit form. |
| `app/(private)/clearing-desk/components/ClearedSession.tsx` | Counter, progress, cleared cards. |
| `app/(private)/clearing-desk/components/CompletionPanel.tsx` | Empty-queue celebration. |
| `public/clearing-desk/assets/*.svg` | The 20 exported SVGs. |

---

## Task 1: Domain types and mappers

The riskiest unit in the build: the export stored money, decimals and absences as display strings. Everything downstream depends on getting this conversion right.

**Files:**
- Create: `app/(private)/clearing-desk/types.ts`
- Create: `app/(private)/clearing-desk/utils/mappers.ts`
- Test: `app/(private)/clearing-desk/utils/mappers.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PaymentMode`, `Payee`, `PayeeUpdate`, `ClearingDeskBoard`, `RouteSummary` (types); `mapPayee(dto: PayeeDTO): Payee`, `mapBoard(dto: ClearingDeskBoardDTO): ClearingDeskBoard`, `formatMoney(amount: number | null, flat: boolean): string`.

- [ ] **Step 1: Write the failing test**

Create `app/(private)/clearing-desk/utils/mappers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mapPayee, mapBoard, formatMoney } from './mappers';

const dto = {
  id: 'DY1B', name: 'Diego Ferreira', vehicle: 'YF25 OZL',
  payment_mode: 'DAF', payment: '£160', sort: 'YES',
  sort_value: '0,00', adhoc_service: '-', per_stop: 2,
};

describe('mapPayee', () => {
  it('reads a plain amount', () => {
    expect(mapPayee(dto).payment).toEqual({ amount: 160, flat: false });
  });

  it('reads a flat amount and keeps the flag', () => {
    expect(mapPayee({ ...dto, payment: '£145.00 flat' }).payment)
      .toEqual({ amount: 145, flat: true });
  });

  it('treats the em dash as an absent amount', () => {
    expect(mapPayee({ ...dto, payment: '—' }).payment)
      .toEqual({ amount: null, flat: false });
  });

  it('accepts both decimal separators', () => {
    expect(mapPayee({ ...dto, sort_value: '0,00' }).sortValue).toBe(0);
    expect(mapPayee({ ...dto, sort_value: '20.00' }).sortValue).toBe(20);
  });

  it('turns the NOVEHICLE placeholder into null', () => {
    expect(mapPayee({ ...dto, vehicle: 'NOVEHICLE' }).vehicle).toBeNull();
  });

  it('turns the hyphen adhoc placeholder into null', () => {
    expect(mapPayee({ ...dto, adhoc_service: '-' }).adhoc).toBeNull();
    expect(mapPayee({ ...dto, adhoc_service: 'Extra Belt Sort' }).adhoc)
      .toBe('Extra Belt Sort');
  });

  it('reads sort as a boolean', () => {
    expect(mapPayee(dto).sort).toBe(true);
    expect(mapPayee({ ...dto, sort: 'NO' }).sort).toBe(false);
  });
});

describe('formatMoney', () => {
  it('renders an amount with two decimals', () => {
    expect(formatMoney(160, false)).toBe('£160.00');
  });

  it('appends the flat suffix', () => {
    expect(formatMoney(145, true)).toBe('£145.00 flat');
  });

  it('renders an absent amount as an em dash', () => {
    expect(formatMoney(null, false)).toBe('—');
  });
});

describe('mapBoard', () => {
  it('maps every payee and carries the route summary', () => {
    const board = mapBoard({
      depot: 'DEPOT_LCY',
      route_summary: { postcodes: ['ME1', 'ME2'], stops: 15, pre_12: 2 },
      payees: [dto],
      cleared: [],
    });
    expect(board.depot).toBe('DEPOT_LCY');
    expect(board.routeSummary).toEqual({ postcodes: ['ME1', 'ME2'], stops: 15, pre12: 2 });
    expect(board.payees).toHaveLength(1);
    expect(board.payees[0].name).toBe('Diego Ferreira');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(private)/clearing-desk/utils/mappers.test.ts"`
Expected: FAIL — `Failed to resolve import "./mappers"`.

- [ ] **Step 3: Write the types**

Create `app/(private)/clearing-desk/types.ts`:

```ts
export type PaymentMode = 'DAF' | 'DR' | 'VSR' | 'SP_VSR';

export interface Money {
  /** null when the design shows an em dash: the figure is not known for this payee. */
  amount: number | null;
  /** true when the design labels the amount "flat". */
  flat: boolean;
}

export interface Payee {
  /** Route code, used as the identity throughout: DY1B, MD7E, DHOC, DY1A, LL2A, LL2X. */
  id: string;
  name: string;
  /** null when the design shows NOVEHICLE. */
  vehicle: string | null;
  mode: PaymentMode;
  payment: Money;
  sort: boolean;
  sortValue: number;
  /** null when the design shows a hyphen. */
  adhoc: string | null;
  perStop: number;
}

export interface RouteSummary {
  postcodes: string[];
  stops: number;
  pre12: number;
}

export interface ClearingDeskBoard {
  depot: string;
  routeSummary: RouteSummary;
  payees: Payee[];
  /** Route ids already cleared, most recent first. */
  cleared: string[];
}

/** The fields the editor can change. */
export interface PayeeUpdate {
  name: string;
  vehicle: string | null;
  mode: PaymentMode;
  sort: boolean;
  sortValue: number;
  adhoc: string | null;
}
```

- [ ] **Step 4: Write the mappers**

Create `app/(private)/clearing-desk/utils/mappers.ts`:

```ts
import type {
  ClearingDeskBoard, Money, Payee, PaymentMode, RouteSummary,
} from '../types';

export interface PayeeDTO {
  id: string;
  name: string;
  vehicle: string;
  payment_mode: string;
  payment: string;
  sort: string;
  sort_value: string;
  adhoc_service: string;
  per_stop: number;
}

export interface ClearingDeskBoardDTO {
  depot: string;
  route_summary: { postcodes: string[]; stops: number; pre_12: number };
  payees: PayeeDTO[];
  cleared: string[];
}

/** The design writes an unknown figure as an em dash, and a hyphen for "no adhoc service". */
const EM_DASH = '—';

/** "£160" → 160 · "£145.00 flat" → 145 · "—" → null */
function parseMoney(raw: string): Money {
  const flat = /\bflat\b/i.test(raw);
  const digits = raw.replace(/[^0-9.,]/g, '');
  if (!digits) return { amount: null, flat: false };
  return { amount: parseDecimal(digits), flat };
}

/** The design mixes separators: "0,00" and "20.00" both appear. */
function parseDecimal(raw: string): number {
  const value = Number(raw.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

export function formatMoney(amount: number | null, flat: boolean): string {
  if (amount === null) return EM_DASH;
  return `£${amount.toFixed(2)}${flat ? ' flat' : ''}`;
}

export function mapPayee(dto: PayeeDTO): Payee {
  return {
    id: dto.id,
    name: dto.name,
    vehicle: dto.vehicle === 'NOVEHICLE' ? null : dto.vehicle,
    mode: dto.payment_mode as PaymentMode,
    payment: parseMoney(dto.payment),
    sort: dto.sort.toUpperCase() === 'YES',
    sortValue: parseDecimal(dto.sort_value),
    adhoc: dto.adhoc_service === '-' ? null : dto.adhoc_service,
    perStop: dto.per_stop,
  };
}

function mapRouteSummary(dto: ClearingDeskBoardDTO['route_summary']): RouteSummary {
  return { postcodes: dto.postcodes, stops: dto.stops, pre12: dto.pre_12 };
}

export function mapBoard(dto: ClearingDeskBoardDTO): ClearingDeskBoard {
  return {
    depot: dto.depot,
    routeSummary: mapRouteSummary(dto.route_summary),
    payees: dto.payees.map(mapPayee),
    cleared: dto.cleared,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run "app/(private)/clearing-desk/utils/mappers.test.ts"`
Expected: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/clearing-desk/types.ts" "app/(private)/clearing-desk/utils/"
git commit -m "feat: clearing desk domain types and DTO mappers"
```

---

## Task 2: Data layer — fixtures, mock route, API module

**Files:**
- Create: `lib/mocks/clearing-desk-fixtures.ts`
- Create: `lib/clearing-desk-api.ts`
- Modify: `lib/mocks/page-payload.ts`
- Test: `lib/mocks/clearing-desk-fixtures.test.ts`

**Interfaces:**
- Consumes: `PayeeDTO`, `ClearingDeskBoardDTO` from Task 1.
- Produces: `clearingDeskFixture(): ClearingDeskBoardDTO`; `fetchClearingDeskBoard`, `approveClearing`, `returnToQueue`, `updatePayee`, `saveRouteNote`.

- [ ] **Step 1: Write the failing test**

Create `lib/mocks/clearing-desk-fixtures.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clearingDeskFixture } from './clearing-desk-fixtures';
import { mapBoard } from '@/app/(private)/clearing-desk/utils/mappers';

describe('the clearing desk fixture', () => {
  it('carries the six payees from the design, in order', () => {
    expect(clearingDeskFixture().payees.map(p => p.id))
      .toEqual(['DY1B', 'MD7E', 'DHOC', 'DY1A', 'LL2A', 'LL2X']);
  });

  it('starts with an empty cleared list', () => {
    expect(clearingDeskFixture().cleared).toEqual([]);
  });

  it('maps cleanly, including the two payees with no known amount', () => {
    const board = mapBoard(clearingDeskFixture());
    const unknown = board.payees.filter(p => p.payment.amount === null);
    expect(unknown.map(p => p.name)).toEqual(['Terry Roberts', 'Codrin Stephan']);
  });

  it('returns a fresh object each call so tests cannot pollute each other', () => {
    const first = clearingDeskFixture();
    first.payees[0].name = 'mutated';
    expect(clearingDeskFixture().payees[0].name).toBe('Diego Ferreira');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/mocks/clearing-desk-fixtures.test.ts`
Expected: FAIL — `Failed to resolve import "./clearing-desk-fixtures"`.

- [ ] **Step 3: Write the fixtures**

Create `lib/mocks/clearing-desk-fixtures.ts`. Values transcribed from the Figma export's `src/data.ts`; they are design values, not a payroll calculation.

```ts
import type { ClearingDeskBoardDTO } from '@/app/(private)/clearing-desk/utils/mappers';

/**
 * The six payees drawn in the Clearing Desk frames. Terry and Codrin have no
 * financial detail in any frame, so their payment is the design's em dash.
 * A fresh deep copy is returned per call so callers can mutate freely.
 */
export function clearingDeskFixture(): ClearingDeskBoardDTO {
  return structuredClone({
    depot: 'DEPOT_LCY',
    route_summary: { postcodes: ['ME1', 'ME2'], stops: 15, pre_12: 2 },
    cleared: [],
    payees: [
      { id: 'DY1B', name: 'Diego Ferreira', vehicle: 'YF25 OZL', payment_mode: 'DAF', payment: '£160', sort: 'YES', sort_value: '0,00', adhoc_service: '-', per_stop: 2 },
      { id: 'MD7E', name: 'Carlos Silva', vehicle: 'MA26 XWK', payment_mode: 'DAF', payment: '£160.00', sort: 'YES', sort_value: '0,00', adhoc_service: '-', per_stop: 2 },
      { id: 'DHOC', name: 'Lee Roberts', vehicle: 'NOVEHICLE', payment_mode: 'DR', payment: '£145.00 flat', sort: 'YES', sort_value: '0,00', adhoc_service: 'Extra Belt Sort', per_stop: 2 },
      { id: 'DY1A', name: 'Aliu Balde', vehicle: 'LV21 UFC', payment_mode: 'VSR', payment: '£122.50 flat', sort: 'YES', sort_value: '20.00', adhoc_service: 'Extra Belt Sort', per_stop: 1.75 },
      { id: 'LL2A', name: 'Terry Roberts', vehicle: 'CK26 KWJ', payment_mode: 'SP_VSR', payment: '—', sort: 'YES', sort_value: '0.00', adhoc_service: '-', per_stop: 2 },
      { id: 'LL2X', name: 'Codrin Stephan', vehicle: 'CE25 PYX', payment_mode: 'VSR', payment: '—', sort: 'YES', sort_value: '0.00', adhoc_service: '-', per_stop: 2 },
    ],
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/mocks/clearing-desk-fixtures.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Route the mock path**

Open `lib/mocks/page-payload.ts` and read the existing `pagePayload(url: URL)` body to match its style. Add the import at the top:

```ts
import { clearingDeskFixture } from './clearing-desk-fixtures';
```

Add this branch inside `pagePayload`, before its final fallback return:

```ts
if (url.pathname.includes('/clearing-desk')) return clearingDeskFixture();
```

- [ ] **Step 6: Write the API module**

Create `lib/clearing-desk-api.ts`:

```ts
import { api } from '@/lib/api-client';
import type { ClearingDeskBoardDTO } from '@/app/(private)/clearing-desk/utils/mappers';
import type { PayeeUpdate } from '@/app/(private)/clearing-desk/types';

/**
 * These paths do not exist in logix-sphere-backend yet — see the spec, section 5.2.
 * Until they do, lib/mocks/page-payload.ts answers the GET and api-client returns a
 * generic success for the mutations.
 */
export const fetchClearingDeskBoard = (params: { depot?: string; date?: string }) =>
  api.get<ClearingDeskBoardDTO>('/bff/clearing-desk', { params });

export const approveClearing = (id: string) =>
  api.post(`/bff/clearing-desk/${id}/approve`, {});

export const returnToQueue = (id: string) =>
  api.post(`/bff/clearing-desk/${id}/return`, {});

export const updatePayee = (id: string, body: PayeeUpdate) =>
  api.patch(`/bff/clearing-desk/${id}`, body);

export const saveRouteNote = (id: string, note: string) =>
  api.put(`/bff/clearing-desk/${id}/note`, { note });
```

Before writing this, confirm the exact exported surface of `lib/api-client.ts` (whether it exports `api` with `.get/.post/.patch/.put`, and the shape of `RequestOptions`). Match it; do not assume.

- [ ] **Step 7: Run the suite**

Run: `npx vitest run lib/mocks/`
Expected: PASS, including the pre-existing `page-payload.test.ts`.

- [ ] **Step 8: Commit**

```bash
git add lib/clearing-desk-api.ts lib/mocks/clearing-desk-fixtures.ts lib/mocks/clearing-desk-fixtures.test.ts lib/mocks/page-payload.ts
git commit -m "feat: clearing desk data layer with offline fixtures"
```

---

## Task 3: Query hook

**Files:**
- Create: `hooks/useClearingDesk.ts`
- Test: `hooks/useClearingDesk.test.tsx`

**Interfaces:**
- Consumes: `fetchClearingDeskBoard`, `approveClearing`, `returnToQueue`, `updatePayee`, `saveRouteNote` (Task 2); `mapBoard`, `ClearingDeskBoard`, `PayeeUpdate` (Task 1).
- Produces: `useClearingDesk(params: { depot?: string; date?: string })` returning `{ board, isLoading, isError, refetch, approve, restore, savePayee, saveNote }`, where `approve(id: string)`, `restore(id: string)`, `savePayee(id: string, update: PayeeUpdate)` and `saveNote(id: string, note: string)` are all `(…) => void`.

- [ ] **Step 1: Write the failing test**

Create `hooks/useClearingDesk.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run hooks/useClearingDesk.test.tsx`
Expected: FAIL — `Failed to resolve import "./useClearingDesk"`.

- [ ] **Step 3: Write the hook**

Create `hooks/useClearingDesk.ts`:

```ts
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

  /**
   * MOCK_MODE answers every non-GET with a generic success and persists nothing
   * (lib/mock-api.ts), so the cache edit below is what actually drives the screen.
   * Against a real backend the same edit is ordinary optimism and onSettled reconciles.
   */
  const edit = (change: (board: ClearingDeskBoard) => ClearingDeskBoard) =>
    queryClient.setQueryData<ClearingDeskBoard>(queryKey, current =>
      current ? change(current) : current);

  const settle = () => { void queryClient.invalidateQueries({ queryKey }); };

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveClearing(id),
    onMutate: (id) => edit(board => ({ ...board, cleared: [id, ...board.cleared] })),
    onSettled: settle,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => returnToQueue(id),
    onMutate: (id) => edit(board => ({
      ...board, cleared: board.cleared.filter(c => c !== id),
    })),
    onSettled: settle,
  });

  const savePayeeMutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: PayeeUpdate }) => updatePayee(id, update),
    onMutate: ({ id, update }) => edit(board => ({
      ...board,
      payees: board.payees.map(p => (p.id === id ? { ...p, ...update } : p)),
    })),
    onSettled: settle,
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run hooks/useClearingDesk.test.tsx`
Expected: PASS, 5 tests.

If `onSettled`'s invalidation re-fetches the pristine fixture and undoes the optimistic edit, the test for "moves an approved payee into cleared" will flake. Fix it in the hook, not the test: have the mock branch in `page-payload.ts` hold session state, or drop `onSettled` for the two queue mutations and leave a comment naming the reason. Do not weaken the assertion.

- [ ] **Step 5: Commit**

```bash
git add hooks/useClearingDesk.ts hooks/useClearingDesk.test.tsx
git commit -m "feat: clearing desk query hook with optimistic queue updates"
```

---

## Task 4: Access — permissions, sidebar, NavKey

Small but it is the gate: without it the page exists and nobody reaches it.

**Files:**
- Modify: `lib/route-permissions.ts`
- Modify: `app/(private)/components/NavbarWrapper.tsx`
- Test: `lib/route-permissions.test.ts`, `app/(private)/components/NavbarWrapper.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `/clearing-desk` allowed for admin and supervisor; a sidebar link labelled exactly `Clearing Desk`.

- [ ] **Step 1: Write the failing tests**

Append to the `describe('route permissions', …)` block in `lib/route-permissions.test.ts`:

```ts
  it('lets admins and supervisors reach the clearing desk', () => {
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.ADMIN, '/clearing-desk')).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, '/clearing-desk')).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.DRIVER, '/clearing-desk')).toBe(false);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SERVICE_PARTNER, '/clearing-desk')).toBe(false);
  });
```

Append to the `describe('the operations Route Balance link', …)` file — a new block in `app/(private)/components/NavbarWrapper.test.tsx`. It reuses the `asProfile`, `renderShell` and `openGroup` helpers already defined there:

```tsx
describe('the Clearing Desk link', () => {
  it('is offered to an admin', () => {
    asProfile(BUSINESS_RULES.USER_TYPE.ADMIN, ['admin']);
    renderShell();
    openGroup('Operations');
    expect(screen.getByRole('link', { name: 'Clearing Desk' }))
      .toHaveAttribute('href', '/clearing-desk');
  });

  it('is offered to a supervisor', () => {
    asProfile(BUSINESS_RULES.USER_TYPE.SUPERVISOR, ['supervisor']);
    renderShell();
    openGroup('Operations');
    expect(screen.getByRole('link', { name: 'Clearing Desk' }))
      .toHaveAttribute('href', '/clearing-desk');
  });

  it('stays hidden from a driver', () => {
    asProfile(BUSINESS_RULES.USER_TYPE.DRIVER, ['driver']);
    renderShell();
    openGroup('Operations');
    expect(screen.queryByRole('link', { name: 'Clearing Desk' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/route-permissions.test.ts "app/(private)/components/NavbarWrapper.test.tsx"`
Expected: FAIL — the supervisor assertion returns `false`, and the link is not found for admin or supervisor.

- [ ] **Step 3: Whitelist the path**

In `lib/route-permissions.ts`, add `"/clearing-desk"` to `USER_TYPE_3_ALLOWED`, directly after `"/route-balance"`:

```ts
export const USER_TYPE_3_ALLOWED = [
  ...MY_PERFORMANCE_ROUTES,
  "/route-balance",
  "/clearing-desk",
  "/week-planner",
  "/daily-game-plan",
  "/vendor",
  "/vehicles",
] as const;
```

- [ ] **Step 4: Add the sidebar entry and fix NavKey**

In `app/(private)/components/NavbarWrapper.tsx`:

Add `ClipboardCheck` to the existing `lucide-react` import list, keeping alphabetical position.

In the `sidebarGroups` array, inside the group whose `label` is `"Operations"`, add the entry immediately after the `/route-balance` line:

```ts
      ["/clearing-desk", "Clearing Desk", ClipboardCheck],
```

Fix the orphan type on the `NavKey` line:

```ts
type NavKey = "home" | "week-planner" | "route-balance" | "clearing-desk";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/route-permissions.test.ts "app/(private)/components/NavbarWrapper.test.tsx"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/route-permissions.ts lib/route-permissions.test.ts "app/(private)/components/NavbarWrapper.tsx" "app/(private)/components/NavbarWrapper.test.tsx"
git commit -m "feat: open the clearing desk to admins and supervisors"
```

---

## Task 5: Page shell, assets and styles

No new behaviour: this task makes the route exist and render an empty frame, so later tasks have somewhere to put components.

**Files:**
- Create: `app/(private)/clearing-desk/page.tsx`
- Create: `app/(private)/clearing-desk/loading.tsx`
- Create: `app/(private)/clearing-desk/styles.css`
- Create: `app/(private)/clearing-desk/ClearingDeskContent.tsx`
- Create: `public/clearing-desk/assets/*.svg` (20 files)

**Interfaces:**
- Consumes: `useClearingDesk` (Task 3).
- Produces: default export `ClearingDeskContent` (no props); the route `/clearing-desk`.

- [ ] **Step 1: Copy the SVG assets**

```bash
mkdir -p "public/clearing-desk/assets"
cp <scratchpad>/cd/clearing-desk-react/public/assets/*.svg "public/clearing-desk/assets/"
ls "public/clearing-desk/assets" | wc -l   # expect 20
```

- [ ] **Step 2: Adapt the stylesheet**

Copy `<scratchpad>/cd/clearing-desk-react/src/styles.css` to `app/(private)/clearing-desk/styles.css`, then make four mechanical edits:

1. Delete the `@font-face` blocks. `app/globals.css` already declares Space Grotesk and IBM Plex Mono and exposes `--font-sans` / `--font-mono`; use those variables. If a weight the design needs (500, 600) is missing there, add the `@font-face` to `globals.css`, not here.
2. Delete every rule for `.sidebar`, `.sidebar-surface`, `.brand`, `.nav-item`, `.sidebar-bottom`, `.sidebar-toggle`, `.topbar`, `.user-menu`, `.user-popover` and `footer`. `NavbarWrapper` supplies all of that.
3. Prefix every remaining selector with `.clearing-desk` so nothing leaks. `.desk-columns` becomes `.clearing-desk .desk-columns`, and so on.
4. Delete the `#screen-gallery` rules and anything else serving the export's review gallery.

- [ ] **Step 3: Write loading.tsx**

```tsx
import { PrivateRouteLoading } from '../components/PrivateRouteLoading';

export default function ClearingDeskLoading() {
  return <PrivateRouteLoading />;
}
```

- [ ] **Step 4: Write page.tsx**

```tsx
"use client";

import NavbarWrapper from '../components/NavbarWrapper';
import ClearingDeskContent from './ClearingDeskContent';

export default function Page() {
  return (
    <NavbarWrapper title="CLEARING DESK" active="clearing-desk">
      <ClearingDeskContent />
    </NavbarWrapper>
  );
}
```

Confirm the import path and default-vs-named export of `NavbarWrapper` against `app/(private)/route-balance/page.tsx` before writing; match it exactly.

- [ ] **Step 5: Write the content shell**

```tsx
"use client";

import { useClearingDesk } from '@/hooks/useClearingDesk';
import './styles.css';

export default function ClearingDeskContent() {
  const { board, isLoading, isError, refetch } = useClearingDesk({});

  if (isError) {
    return (
      <div className="clearing-desk">
        <p role="alert">Could not load the clearing desk.</p>
        <button type="button" onClick={() => void refetch()}>Try again</button>
      </div>
    );
  }

  return (
    <div className="clearing-desk">
      <header className="page-heading">
        <h1>CLEARING DESK</h1>
        <p>Payment authorization &amp; clearing</p>
      </header>
      {isLoading || !board
        ? <p role="status">Loading transactions…</p>
        : <div className="desk-columns" />}
    </div>
  );
}
```

- [ ] **Step 6: Verify the route renders**

Run `npm run dev`, open `http://localhost:3000/clearing-desk`, confirm the heading renders inside the real sidebar and topbar with no console error. Then stop the server.

- [ ] **Step 7: Commit**

```bash
git add "app/(private)/clearing-desk/" "public/clearing-desk/"
git commit -m "feat: clearing desk route shell, assets and scoped styles"
```

---

## Task 6: Pending queue

**Files:**
- Create: `app/(private)/clearing-desk/components/PendingQueue.tsx`
- Create: `app/(private)/clearing-desk/components/PayeeCard.tsx`
- Modify: `app/(private)/clearing-desk/ClearingDeskContent.tsx`
- Test: `app/(private)/clearing-desk/ClearingDeskContent.test.tsx`

**Interfaces:**
- Consumes: `Payee` (Task 1), `useClearingDesk` (Task 3).
- Produces: `PendingQueue({ payees, depot, selectedId, query, onQueryChange, onSelect })` and `PayeeCard({ payee, selected, onSelect })`.

- [ ] **Step 1: Write the failing test**

Create `app/(private)/clearing-desk/ClearingDeskContent.test.tsx`. Mock the hook so the test drives the UI, not the network:

```tsx
// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { mapBoard } from './utils/mappers';
import { clearingDeskFixture } from '@/lib/mocks/clearing-desk-fixtures';

const hook = vi.hoisted(() => ({
  value: {} as ReturnType<typeof import('@/hooks/useClearingDesk').useClearingDesk>,
}));
vi.mock('@/hooks/useClearingDesk', () => ({ useClearingDesk: () => hook.value }));

import ClearingDeskContent from './ClearingDeskContent';

beforeEach(() => {
  cleanup();
  hook.value = {
    board: mapBoard(clearingDeskFixture()),
    isLoading: false, isError: false,
    refetch: vi.fn(), approve: vi.fn(), restore: vi.fn(),
    savePayee: vi.fn(), saveNote: vi.fn(),
  } as typeof hook.value;
});

describe('the pending queue', () => {
  it('lists every pending payee with its total', () => {
    render(<ClearingDeskContent />);
    expect(screen.getByText('6 TOTAL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Diego Ferreira/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Codrin Stephan/ })).toBeInTheDocument();
  });

  it('filters by name, by route and by vehicle', () => {
    render(<ClearingDeskContent />);
    const search = screen.getByLabelText('Search pending transactions');

    fireEvent.change(search, { target: { value: 'aliu' } });
    expect(screen.getByRole('button', { name: /Aliu Balde/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Diego Ferreira/ })).toBeNull();

    fireEvent.change(search, { target: { value: 'DHOC' } });
    expect(screen.getByRole('button', { name: /Lee Roberts/ })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'CE25 PYX' } });
    expect(screen.getByRole('button', { name: /Codrin Stephan/ })).toBeInTheDocument();
  });

  it('says so when nothing matches', () => {
    render(<ClearingDeskContent />);
    fireEvent.change(screen.getByLabelText('Search pending transactions'), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText('No matching transactions.')).toBeInTheDocument();
  });

  it('hides payees already cleared', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B'] } };
    render(<ClearingDeskContent />);
    expect(screen.queryByRole('button', { name: /Diego Ferreira/ })).toBeNull();
    expect(screen.getByText('5 TOTAL')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx"`
Expected: FAIL — `Unable to find an element with the text: 6 TOTAL`.

- [ ] **Step 3: Write PayeeCard**

```tsx
import type { Payee } from '../types';

export default function PayeeCard({ payee, selected, onSelect }: {
  payee: Payee; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`pending-card${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="card-row">
        <span className="route-id">{payee.id}</span>
        <span className="pending-badge">PENDING</span>
      </span>
      <span className="card-row">
        <span>{payee.name}</span>
        <strong>{payee.mode}</strong>
      </span>
      <span className="vehicle-id">{payee.vehicle ?? 'NOVEHICLE'}</span>
    </button>
  );
}
```

- [ ] **Step 4: Write PendingQueue**

```tsx
import type { Payee } from '../types';
import PayeeCard from './PayeeCard';

export default function PendingQueue({
  payees, depot, selectedId, query, onQueryChange, onSelect,
}: {
  payees: Payee[]; depot: string; selectedId: string | null;
  query: string; onQueryChange: (value: string) => void; onSelect: (id: string) => void;
}) {
  const matches = payees.filter(p =>
    `${p.id} ${p.name} ${p.vehicle ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="pending-panel" aria-label="Pending authorizations">
      <div className="pending-heading">
        <h2>PENDING AUTH</h2>
        <span>{payees.length} TOTAL</span>
      </div>
      <label className="sr-only" htmlFor="clearing-desk-search">Search pending transactions</label>
      <input
        id="clearing-desk-search"
        aria-label="Search pending transactions"
        value={query}
        onChange={event => onQueryChange(event.target.value)}
        placeholder="SEARCH..."
      />
      <div className="depot-heading">{depot}</div>
      {matches.map(payee => (
        <PayeeCard
          key={payee.id}
          payee={payee}
          selected={payee.id === selectedId}
          onSelect={() => onSelect(payee.id)}
        />
      ))}
      {matches.length === 0 && <p className="no-results">No matching transactions.</p>}
    </aside>
  );
}
```

- [ ] **Step 5: Wire it into the content**

Replace the `<div className="desk-columns" />` placeholder from Task 5 with:

```tsx
      <div className="desk-columns">
        <PendingQueue
          payees={pending}
          depot={board.depot}
          selectedId={active?.id ?? null}
          query={query}
          onQueryChange={setQuery}
          onSelect={id => { setSelectedId(id); setEditing(false); }}
        />
      </div>
```

and add the state above the early returns:

```tsx
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const pending = board ? board.payees.filter(p => !board.cleared.includes(p.id)) : [];
  const active = pending.find(p => p.id === selectedId) ?? pending[0];
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx"`
Expected: PASS, 4 tests.

- [ ] **Step 7: Commit**

```bash
git add "app/(private)/clearing-desk/"
git commit -m "feat: clearing desk pending queue with search and selection"
```

---

## Task 7: Clearing panel, summary, estimate and notes

**Files:**
- Create: `app/(private)/clearing-desk/components/ClearingPanel.tsx`
- Create: `app/(private)/clearing-desk/components/RouteBalanceResume.tsx`
- Create: `app/(private)/clearing-desk/components/PayableEstimate.tsx`
- Create: `app/(private)/clearing-desk/components/ManagementNotes.tsx`
- Modify: `app/(private)/clearing-desk/ClearingDeskContent.tsx`
- Test: `app/(private)/clearing-desk/ClearingDeskContent.test.tsx`

**Interfaces:**
- Consumes: `Payee`, `RouteSummary`, `formatMoney` (Task 1).
- Produces: `ClearingPanel({ payee, onEdit, onApprove })`, `RouteBalanceResume({ summary })`, `PayableEstimate({ perStop, stops })`, `ManagementNotes({ payeeId, onSave })`.

- [ ] **Step 1: Write the failing test**

Append to `ClearingDeskContent.test.tsx`:

```tsx
describe('the clearing panel', () => {
  it('shows the first pending payee by default', () => {
    render(<ClearingDeskContent />);
    expect(screen.getByRole('heading', { name: 'Diego Ferreira' })).toBeInTheDocument();
    expect(screen.getByText('YF25 OZL')).toBeInTheDocument();
    expect(screen.getByText('£160.00')).toBeInTheDocument();
  });

  it('renders an unknown amount as an em dash', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: /Terry Roberts/ }));
    expect(screen.getByRole('heading', { name: 'Terry Roberts' })).toBeInTheDocument();
    expect(screen.getByTestId('payment-amount')).toHaveTextContent('—');
  });

  it('computes the estimate from per-stop and stops, not a fixed figure', () => {
    render(<ClearingDeskContent />);
    expect(screen.getByTestId('estimate-per-stop')).toHaveTextContent('£ 2.00');
    expect(screen.getByTestId('estimate-total')).toHaveTextContent('£ 30.00');
    fireEvent.click(screen.getByRole('button', { name: /Aliu Balde/ }));
    expect(screen.getByTestId('estimate-per-stop')).toHaveTextContent('£ 1.75');
    expect(screen.getByTestId('estimate-total')).toHaveTextContent('£ 26.25');
  });

  it('carries the route summary from the board', () => {
    render(<ClearingDeskContent />);
    expect(screen.getByText('ME1, ME2')).toBeInTheDocument();
    expect(screen.getByTestId('summary-stops')).toHaveTextContent('15');
    expect(screen.getByTestId('summary-pre12')).toHaveTextContent('2');
  });

  it('approves the selected payee', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve Diego Ferreira' }));
    expect(hook.value.approve).toHaveBeenCalledWith('DY1B');
  });

  it('saves a note against the selected payee', () => {
    render(<ClearingDeskContent />);
    fireEvent.change(screen.getByLabelText('MANANGEMENT NOTES'), {
      target: { value: 'checked with depot' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE NOTE' }));
    expect(hook.value.saveNote).toHaveBeenCalledWith('DY1B', 'checked with depot');
  });
});
```

The `MANANGEMENT NOTES` spelling is the design's. Keep it; changing copy is a separate decision.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx" -t "the clearing panel"`
Expected: FAIL — heading `Diego Ferreira` not found.

- [ ] **Step 3: Write RouteBalanceResume**

```tsx
import type { RouteSummary } from '../types';

export default function RouteBalanceResume({ summary }: { summary: RouteSummary }) {
  return (
    <section className="route-summary">
      <h3>ROUTE BALANCE RESUME</h3>
      <dl>
        <div><dt>POSTCODES</dt><dd>{summary.postcodes.join(', ')}</dd></div>
        <div><dt>STOPS</dt><dd data-testid="summary-stops">{summary.stops}</dd></div>
        <div><dt>PRE 12</dt><dd data-testid="summary-pre12">{summary.pre12}</dd></div>
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Write PayableEstimate**

```tsx
export default function PayableEstimate({ perStop, stops }: { perStop: number; stops: number }) {
  return (
    <section className="estimate">
      <h3>ESTIMATE OF AMOUNTS PAYABLE</h3>
      <dl>
        <div>
          <dt>PER STOP</dt>
          <dd data-testid="estimate-per-stop">£ {perStop.toFixed(2)}</dd>
        </div>
        <div>
          <dt>TOTAL</dt>
          <dd data-testid="estimate-total">£ {(perStop * stops).toFixed(2)}</dd>
        </div>
      </dl>
    </section>
  );
}
```

- [ ] **Step 5: Write ManagementNotes**

```tsx
import { useEffect, useState } from 'react';

export default function ManagementNotes({ payeeId, onSave }: {
  payeeId: string; onSave: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  useEffect(() => { setNote(''); }, [payeeId]);

  return (
    <section className="notes">
      <label htmlFor="management-notes">MANANGEMENT NOTES</label>
      <textarea
        id="management-notes"
        value={note}
        onChange={event => setNote(event.target.value)}
        placeholder="Enter operational notes or clearance rationale..."
      />
      <button type="button" onClick={() => onSave(note)}>SAVE NOTE</button>
    </section>
  );
}
```

- [ ] **Step 6: Write ClearingPanel**

```tsx
import type { Payee } from '../types';
import { formatMoney } from '../utils/mappers';

export default function ClearingPanel({ payee, onEdit, onApprove }: {
  payee: Payee; onEdit: () => void; onApprove: () => void;
}) {
  return (
    <article className="payee-card">
      <div className="route-seam">ROUTE: {payee.id}</div>
      <div className="payee-info">
        <div className="person-heading">
          <div>
            <h2>{payee.name}</h2>
            <p><b>VEHICLE:</b> {payee.vehicle ?? 'NOVEHICLE'}</p>
          </div>
          <button className="small-button" type="button" onClick={onEdit}>EDITAR</button>
        </div>
        <div className="payment">
          <p>PAYMENT MODE</p>
          <div>
            <strong>{payee.mode}:</strong>{' '}
            <span data-testid="payment-amount">
              {formatMoney(payee.payment.amount, payee.payment.flat)}
            </span>
          </div>
        </div>
        <div className="details">
          <p><b>SORT:</b> {payee.sort ? 'YES' : 'NO'}</p>
          <p><b>SORT VALUE:</b> {payee.sortValue.toFixed(2)}</p>
          <p><b>ADHOC-SERVICE:</b> {payee.adhoc ?? '-'}</p>
        </div>
      </div>
      <button
        className="approve"
        type="button"
        onClick={onApprove}
        aria-label={`Approve ${payee.name}`}
      >
        <span className="approve-mark" aria-hidden="true" />
        <span>APPROVE</span>
      </button>
    </article>
  );
}
```

- [ ] **Step 7: Wire the bench column into the content**

Inside `.desk-columns`, after `<PendingQueue …/>`:

```tsx
        <section className="bench" aria-label="Selected transaction">
          {active && (
            <>
              <ClearingPanel
                payee={active}
                onEdit={() => setEditing(true)}
                onApprove={() => approve(active.id)}
              />
              <RouteBalanceResume summary={board.routeSummary} />
              <PayableEstimate perStop={active.perStop} stops={board.routeSummary.stops} />
              <ManagementNotes payeeId={active.id} onSave={note => saveNote(active.id, note)} />
            </>
          )}
        </section>
```

Destructure `approve` and `saveNote` from `useClearingDesk` at the top of the component.

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx"`
Expected: PASS, 10 tests.

- [ ] **Step 9: Commit**

```bash
git add "app/(private)/clearing-desk/"
git commit -m "feat: clearing desk detail panel, summary, estimate and notes"
```

---

## Task 8: Payee editor

**Files:**
- Create: `app/(private)/clearing-desk/components/PayeeEditor.tsx`
- Modify: `app/(private)/clearing-desk/ClearingDeskContent.tsx`
- Test: `app/(private)/clearing-desk/ClearingDeskContent.test.tsx`

**Interfaces:**
- Consumes: `Payee`, `PayeeUpdate`, `PaymentMode` (Task 1).
- Produces: `PayeeEditor({ payee, onSave, onCancel })`.

- [ ] **Step 1: Write the failing test**

Append to `ClearingDeskContent.test.tsx`:

```tsx
describe('the payee editor', () => {
  it('opens on EDITAR with the payee already filled in', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Diego Ferreira');
    expect(screen.getByLabelText('Vehicle')).toHaveValue('YF25 OZL');
    expect(screen.getByLabelText('Sort value')).toHaveValue(0);
  });

  it('saves the edited payee as typed values, not strings', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'D. Ferreira' } });
    fireEvent.change(screen.getByLabelText('Sort value'), { target: { value: '12.50' } });
    fireEvent.change(screen.getByLabelText('Payment mode'), { target: { value: 'VSR' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(hook.value.savePayee).toHaveBeenCalledWith('DY1B', {
      name: 'D. Ferreira', vehicle: 'YF25 OZL', mode: 'VSR',
      sort: true, sortValue: 12.5, adhoc: null,
    });
  });

  it('closes without saving on cancel', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }));
    expect(hook.value.savePayee).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Diego Ferreira' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx" -t "the payee editor"`
Expected: FAIL — no element labelled `Name`.

- [ ] **Step 3: Write PayeeEditor**

```tsx
import { useState, type FormEvent } from 'react';
import type { Payee, PayeeUpdate, PaymentMode } from '../types';

const MODES: PaymentMode[] = ['DAF', 'DR', 'VSR', 'SP_VSR'];
const ADHOC_OPTIONS = ['NONE', 'Extra Belt Sort'];

export default function PayeeEditor({ payee, onSave, onCancel }: {
  payee: Payee; onSave: (update: PayeeUpdate) => void; onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PayeeUpdate>({
    name: payee.name,
    vehicle: payee.vehicle,
    mode: payee.mode,
    sort: payee.sort,
    sortValue: payee.sortValue,
    adhoc: payee.adhoc,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <form className="payee-info editor" onSubmit={submit}>
      <div className="editor-save">
        <button className="small-button" type="submit">SAVE</button>
        <button className="small-button" type="button" onClick={onCancel}>CANCEL</button>
      </div>
      <div className="form-grid">
        <label className="form-field wide">
          <span>NAME</span>
          <input
            aria-label="Name" required value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="form-field">
          <span>VEHICLE</span>
          <input
            aria-label="Vehicle" value={draft.vehicle ?? ''}
            onChange={e => setDraft({ ...draft, vehicle: e.target.value || null })}
          />
        </label>
        <label className="form-field">
          <span>PAYMENT MODE</span>
          <select
            aria-label="Payment mode" value={draft.mode}
            onChange={e => setDraft({ ...draft, mode: e.target.value as PaymentMode })}
          >
            {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>SORT</span>
          <select
            aria-label="Sort" value={draft.sort ? 'YES' : 'NO'}
            onChange={e => setDraft({ ...draft, sort: e.target.value === 'YES' })}
          >
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </label>
        <label className="form-field">
          <span>SORT VALUE</span>
          <input
            aria-label="Sort value" type="number" min="0" step="0.01" required
            value={draft.sortValue}
            onChange={e => setDraft({ ...draft, sortValue: Number(e.target.value) })}
          />
        </label>
        <label className="form-field wide">
          <span>ADHOC-SERVICE</span>
          <select
            aria-label="Adhoc service" value={draft.adhoc ?? 'NONE'}
            onChange={e => setDraft({
              ...draft, adhoc: e.target.value === 'NONE' ? null : e.target.value,
            })}
          >
            {ADHOC_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Swap the panel for the editor when editing**

In `ClearingDeskContent.tsx`, replace the `<ClearingPanel …/>` line with:

```tsx
              {editing ? (
                <article className="payee-card is-editing">
                  <div className="route-seam">ROUTE: {active.id}</div>
                  <PayeeEditor
                    key={active.id}
                    payee={active}
                    onCancel={() => setEditing(false)}
                    onSave={update => { savePayee(active.id, update); setEditing(false); }}
                  />
                </article>
              ) : (
                <ClearingPanel
                  payee={active}
                  onEdit={() => setEditing(true)}
                  onApprove={() => approve(active.id)}
                />
              )}
```

Destructure `savePayee` from `useClearingDesk`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx"`
Expected: PASS, 13 tests.

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/clearing-desk/"
git commit -m "feat: clearing desk payee editor"
```

---

## Task 9: Cleared session and completion

**Files:**
- Create: `app/(private)/clearing-desk/components/ClearedSession.tsx`
- Create: `app/(private)/clearing-desk/components/CompletionPanel.tsx`
- Modify: `app/(private)/clearing-desk/ClearingDeskContent.tsx`
- Test: `app/(private)/clearing-desk/ClearingDeskContent.test.tsx`

**Interfaces:**
- Consumes: `Payee` (Task 1).
- Produces: `ClearedSession({ payees, clearedIds, total, onReturn })`, `CompletionPanel()`.

- [ ] **Step 1: Write the failing test**

Append to `ClearingDeskContent.test.tsx`:

```tsx
describe('the cleared session', () => {
  it('counts nothing cleared at the start', () => {
    render(<ClearingDeskContent />);
    expect(screen.getByRole('heading', { name: '0 / 6 CLEARED' })).toBeInTheDocument();
  });

  it('lists a cleared payee and counts it', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B', 'MD7E'] } };
    render(<ClearingDeskContent />);
    expect(screen.getByRole('heading', { name: '2 / 6 CLEARED' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return Diego Ferreira to queue' }))
      .toBeInTheDocument();
  });

  it('returns a cleared payee to the queue', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B'] } };
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Return Diego Ferreira to queue' }));
    expect(hook.value.restore).toHaveBeenCalledWith('DY1B');
  });

  it('shows the completion panel, not a generic empty state, once the queue drains', () => {
    const board = hook.value.board!;
    hook.value = {
      ...hook.value,
      board: { ...board, cleared: board.payees.map(p => p.id) },
    };
    render(<ClearingDeskContent />);
    expect(screen.getByRole('heading', { name: /ZERO QUEUE/ })).toBeInTheDocument();
    expect(screen.getByText('100% EXCELLENCE')).toBeInTheDocument();
  });

  it('totals the cleared payees instead of the design constant', () => {
    const board = hook.value.board!;
    hook.value = {
      ...hook.value,
      board: { ...board, cleared: board.payees.map(p => p.id) },
    };
    render(<ClearingDeskContent />);
    // 2·15 + 2·15 + 2·15 + 1.75·15 + 2·15 + 2·15 = 176.25
    expect(screen.getByTestId('cleared-total')).toHaveTextContent('£176.25');
    expect(screen.queryByText('£21,420.00')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx" -t "the cleared session"`
Expected: FAIL — heading `0 / 6 CLEARED` not found.

- [ ] **Step 3: Write CompletionPanel**

```tsx
export default function CompletionPanel() {
  return (
    <section className="completion" aria-label="All transactions cleared">
      <div className="trophy" aria-hidden="true" />
      <span className="excellence">100% EXCELLENCE</span>
      <h2>ZERO QUEUE &amp; MAXIMUM RECOGNITION</h2>
      <div className="completion-progress">
        <div />
        <small>100% REACHED</small>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write ClearedSession**

```tsx
import type { Payee } from '../types';

export default function ClearedSession({ payees, clearedIds, total, onReturn }: {
  payees: Payee[]; clearedIds: string[]; total: number; onReturn: (id: string) => void;
}) {
  const byId = new Map(payees.map(payee => [payee.id, payee]));
  const done = clearedIds.length === payees.length && payees.length > 0;

  return (
    <aside className="history" aria-label="Cleared history">
      <div className="cleared-counter">
        <h2>{clearedIds.length} / {payees.length} CLEARED</h2>
        <div>
          <span style={{ width: `${(clearedIds.length / payees.length) * 100}%` }} />
        </div>
      </div>
      <div className="history-heading">
        CLEARED SESSION
        {done && <span data-testid="cleared-total">TOTAL: £{total.toFixed(2)}</span>}
      </div>
      <div className="history-list">
        {clearedIds.map(id => {
          const payee = byId.get(id);
          if (!payee) return null;
          return (
            <article className="cleared-card" key={id}>
              <div className="cleared-person">
                <span className="route-id">{payee.id}</span>
                <span className="vehicle-id">{payee.vehicle ?? 'NOVEHICLE'}</span>
                <h3>{payee.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => onReturn(id)}
                aria-label={`Return ${payee.name} to queue`}
              >
                RETURN TO QUEUE
              </button>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Wire both into the content**

Inside the `bench` section, make the whole block conditional on there being a selection, falling back to completion:

```tsx
        <section className="bench" aria-label="Selected transaction">
          {active ? (
            <>{/* existing panel / editor / summary / estimate / notes */}</>
          ) : (
            <CompletionPanel />
          )}
        </section>
```

Then add the third column after it:

```tsx
        <ClearedSession
          payees={board.payees}
          clearedIds={board.cleared}
          total={clearedTotal}
          onReturn={restore}
        />
```

and compute the total next to the other derived values:

```tsx
  const clearedTotal = board
    ? board.cleared.reduce((sum, id) => {
        const payee = board.payees.find(p => p.id === id);
        return payee ? sum + payee.perStop * board.routeSummary.stops : sum;
      }, 0)
    : 0;
```

Destructure `restore` from `useClearingDesk`.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx"`
Expected: PASS, 18 tests.

- [ ] **Step 7: Commit**

```bash
git add "app/(private)/clearing-desk/"
git commit -m "feat: clearing desk cleared session and completion state"
```

- [ ] **Step 8: Write the failing test for the progress notice**

The design shows a dismissible "GOAL IN SIGHT!" banner in the queue column once three
payees are cleared (frame `154:1842`). Append to `ClearingDeskContent.test.tsx`:

```tsx
describe('the progress notice', () => {
  const withCleared = (ids: string[]) => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ids } };
  };

  it('stays hidden below three cleared', () => {
    withCleared(['DY1B', 'MD7E']);
    render(<ClearingDeskContent />);
    expect(screen.queryByText('GOAL IN SIGHT!')).toBeNull();
  });

  it('appears at three cleared, with the remaining count', () => {
    withCleared(['DY1B', 'MD7E', 'DHOC']);
    render(<ClearingDeskContent />);
    expect(screen.getByText('GOAL IN SIGHT!')).toBeInTheDocument();
    expect(screen.getByText('ONLY 3 APPROVALS LEFT!')).toBeInTheDocument();
  });

  it('can be dismissed and stays dismissed', () => {
    withCleared(['DY1B', 'MD7E', 'DHOC']);
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss goal' }));
    expect(screen.queryByText('GOAL IN SIGHT!')).toBeNull();
  });
});
```

- [ ] **Step 9: Run test to verify it fails**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx" -t "the progress notice"`
Expected: FAIL — `GOAL IN SIGHT!` not found for the three-cleared case.

- [ ] **Step 10: Write ProgressNotice**

Create `app/(private)/clearing-desk/components/ProgressNotice.tsx`:

```tsx
export default function ProgressNotice({ remaining, percent, onDismiss }: {
  remaining: number; percent: number; onDismiss: () => void;
}) {
  return (
    <div className="goal">
      <div className="goal-title">
        GOAL IN SIGHT!
        <button type="button" aria-label="Dismiss goal" onClick={onDismiss}>×</button>
      </div>
      <div className="goal-message">
        <strong>ONLY {remaining} APPROVALS LEFT!</strong>
        <p>You are among today&rsquo;s fastest controllers.</p>
      </div>
      <div className="goal-track"><span style={{ width: `${percent}%` }} /></div>
      <small>{percent}% REACHED</small>
    </div>
  );
}
```

- [ ] **Step 11: Render it from the queue column**

In `ClearingDeskContent.tsx`, add the dismissal state next to the other UI state:

```tsx
  const [goalDismissed, setGoalDismissed] = useState(false);
```

and pass the notice into `PendingQueue` as a child so it sits above the cards, matching
the design:

```tsx
        <PendingQueue
          payees={pending}
          depot={board.depot}
          selectedId={active?.id ?? null}
          query={query}
          onQueryChange={setQuery}
          onSelect={id => { setSelectedId(id); setEditing(false); }}
        >
          {board.cleared.length === 3 && !goalDismissed && (
            <ProgressNotice
              remaining={board.payees.length - board.cleared.length}
              percent={Math.round((board.cleared.length / board.payees.length) * 100)}
              onDismiss={() => setGoalDismissed(true)}
            />
          )}
        </PendingQueue>
```

Widen `PendingQueue`'s props with `children?: React.ReactNode` and render `{children}`
immediately after the `depot-heading` div, before the card list.

- [ ] **Step 12: Run test to verify it passes**

Run: `npx vitest run "app/(private)/clearing-desk/ClearingDeskContent.test.tsx"`
Expected: PASS, 21 tests.

- [ ] **Step 13: Commit**

```bash
git add "app/(private)/clearing-desk/"
git commit -m "feat: clearing desk progress notice"
```

---

## Task 10: Gates and manual validation

**Files:**
- Modify: whatever the gates flag.

**Interfaces:**
- Consumes: everything.
- Produces: a page that passes all four gates.

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: PASS. The count should be the pre-existing 157 plus the new tests.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no new error.

- [ ] **Step 3: Lint**

Run: `npx eslint .`
Expected: clean for the new files. Pre-existing `@next/next/no-img-element` warnings elsewhere are not yours to fix.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exit 0, and `/clearing-desk` listed in the route table.

Remember `next.config.ts` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`, so a green build alone proves nothing. Steps 2 and 3 are the real gates.

- [ ] **Step 5: Validate the three states by hand**

Run `npm run dev` and, at `/clearing-desk`:
- loading, then the six-item queue;
- approve four payees and confirm the counter, the progress bar and the queue all follow;
- approve the remaining two and confirm the completion panel replaces the detail column;
- return one from the cleared column and confirm it reappears in the queue;
- search for `aliu`, `DHOC` and `CE25 PYX`;
- open EDITAR, change the payment mode, save, confirm the detail reflects it;
- resize to 390 px and confirm there is no horizontal scrollbar.

Then stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: gates green for the clearing desk page"
```

---

## Notes for whoever executes this

- **Do not port the export's `Sidebar`, `topbar` or `footer`.** `NavbarWrapper` owns them. The export drew them because it had no shell.
- **Do not port the hash gallery** (`/#initial`, `/#edit`, …). It was a review aid.
- **The design's copy has quirks** — `MANANGEMENT NOTES`, `EDITAR` in Portuguese amid English, `ADHOC-SERVICE`. Keep them; changing copy is a product decision, not a build decision.
- **`ROUTE: DHOC` on Aliu's frame contradicts his queue id `DY1A`.** The export's README flags this. Follow the selected item's id, as the export does.
- **The £2-per-stop rate and the 15 stops are design values.** They are not a payroll rule. The spec's section 11 puts real calculation out of scope.
