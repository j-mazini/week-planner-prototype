# Schedule for Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Schedule for Payment canvas with a working desk that schedules invoiced records into two payment runs — a weekly bank run and a monthly self-billing run — and lets finance hold, reschedule and close them.

**Architecture:** All run arithmetic and every state transition live in one pure module, `lib/payment-runs.ts`, with `today` injected so dates are testable across month and year ends. The screen, `PaymentSchedule.tsx`, is a reader of that module: it holds only which method and which date the user is looking at. Money per row comes from `buildInvoiceDocument`, so the schedule and the issued invoice cannot disagree.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest + React Testing Library, plain CSS in the feature's own files. No new dependency.

**Spec:** `docs/superpowers/specs/2026-10-06-schedule-for-payment-design.md`

## Global Constraints

- **No network.** The repo runs in `MOCK_MODE` (`lib/mock-api.ts`). This feature adds no fetch, no hook, no endpoint. Data is `records.json` plus `localStorage`.
- **Weekly bank run: Friday.** `getUTCDay() === 5`.
- **Monthly self-billing run: the 25th.**
- **All dates are UTC.** Build them with `Date.UTC`, read them with `getUTC*`. The rest of the feature already does (`lib/invoice-document.ts`).
- **All money is integer pence**, formatted with `Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })`.
- **Payment method is fixed by contract.** No UI sets it. A vendor appearing on two records carries the same method on both.
- **Storage keys:** read `logix.invoice-workflow.v1` (owned by the processing desk), write `logix.payment-schedule.v1` (owned by this desk).
- **Tests live beside the code** and run with `npx vitest run <path>`. `src/**/*.test.{ts,tsx}` is already in `vitest.config.ts`.

---

### Task 1: The payment method on each record

**Files:**
- Create: `lib/payment-runs.ts`
- Create: `lib/payment-runs.test.ts`
- Modify: `src/features/invoice-management/records.json` (all 14 records)

**Interfaces:**
- Consumes: `WorkflowRecord` from `lib/invoice-workflow.ts`.
- Produces: `type PaymentMethod = 'weekly-bank' | 'monthly-self-billing'`; `interface PayableRecord extends WorkflowRecord { method: PaymentMethod }`; `const PAYMENT_METHODS: { id: PaymentMethod; label: string; cadence: string }[]`.

- [ ] **Step 1: Write the failing test**

Create `lib/payment-runs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PAYMENT_METHODS, type PayableRecord } from './payment-runs';
import seed from '@/src/features/invoice-management/records.json';

const records = seed as PayableRecord[];

describe('payment methods', () => {
  it('names both ways the company pays', () => {
    expect(PAYMENT_METHODS.map(method => method.id)).toEqual(['weekly-bank', 'monthly-self-billing']);
  });

  it('gives every record a method the desk knows', () => {
    const known = PAYMENT_METHODS.map(method => method.id);
    for (const record of records) expect(known).toContain(record.method);
  });

  it('keeps a vendor on one method, because the contract does', () => {
    const byVendor = new Map<string, string>();
    for (const record of records) {
      const seen = byVendor.get(record.vendor);
      if (seen) expect(record.method).toBe(seen);
      byVendor.set(record.vendor, record.method);
    }
  });

  it('has invoiced records waiting on both methods, so the desk is never empty', () => {
    const waiting = records.filter(record => record.status === 'invoiced');
    expect(new Set(waiting.map(record => record.method)).size).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: FAIL — `Failed to resolve import "./payment-runs"`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/payment-runs.ts`:

```ts
import type { WorkflowRecord } from './invoice-workflow';

/**
 * The two ways BA Express pays its drivers. Which one applies is fixed by the
 * driver's contract, so nothing here chooses it — the desk only groups by it.
 */
export type PaymentMethod = 'weekly-bank' | 'monthly-self-billing';

export interface PayableRecord extends WorkflowRecord {
  method: PaymentMethod;
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; cadence: string }[] = [
  { id: 'weekly-bank', label: 'Weekly · Bank', cadence: 'Every Friday' },
  { id: 'monthly-self-billing', label: 'Monthly · Self-billing', cadence: 'The 25th' },
];
```

Then add `"method"` to every record in `src/features/invoice-management/records.json`, keeping each vendor on one method:

| Vendor | method |
|---|---|
| Benjamin Harris | `weekly-bank` |
| James Anderson | `monthly-self-billing` |
| Charlotte Walker | `weekly-bank` |
| Alexander Lee | `monthly-self-billing` |
| Emma Wilson | `weekly-bank` |
| Maria Garcia | `weekly-bank` |
| Olivia Taylor | `monthly-self-billing` |
| Amelia Lewis | `weekly-bank` |
| Sarah Brown | `monthly-self-billing` |
| Mia Rodriguez | `weekly-bank` |
| Robert Johnson | `monthly-self-billing` |

So `REC-2025005` (Emma Wilson, invoiced) and `REC-2025030` (Amelia Lewis, invoiced) land on the bank run, and `REC-2025008` (Olivia Taylor, invoiced) on the self-billing run.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/payment-runs.ts lib/payment-runs.test.ts src/features/invoice-management/records.json
git commit -m "feat(invoices): each driver's contract carries its payment method"
```

---

### Task 2: When the runs fall

**Files:**
- Modify: `lib/payment-runs.ts`
- Modify: `lib/payment-runs.test.ts`

**Interfaces:**
- Produces: `nextRunDate(method, today): Date`; `runDates(method, today, count): Date[]`; `interface RunSlot { method: PaymentMethod; date: Date }`; `upcomingRuns(today, count): RunSlot[]`.
- A run date on `today` itself still counts as next: finance works the run on the day it pays.

- [ ] **Step 1: Write the failing test**

Append to `lib/payment-runs.test.ts`:

```ts
import { nextRunDate, runDates, upcomingRuns } from './payment-runs';

const iso = (date: Date) => date.toISOString().slice(0, 10);
const on = (text: string) => new Date(`${text}T00:00:00.000Z`);

describe('when the runs fall', () => {
  it('pays the bank run on the next Friday, today included', () => {
    expect(iso(nextRunDate('weekly-bank', on('2026-10-06')))).toBe('2026-10-09');
    expect(iso(nextRunDate('weekly-bank', on('2026-10-09')))).toBe('2026-10-09');
    expect(iso(nextRunDate('weekly-bank', on('2026-10-10')))).toBe('2026-10-16');
  });

  it('pays self-billing on the 25th, rolling into the next month once it is past', () => {
    expect(iso(nextRunDate('monthly-self-billing', on('2026-10-06')))).toBe('2026-10-25');
    expect(iso(nextRunDate('monthly-self-billing', on('2026-10-25')))).toBe('2026-10-25');
    expect(iso(nextRunDate('monthly-self-billing', on('2026-10-26')))).toBe('2026-11-25');
  });

  it('rolls over the end of the year', () => {
    expect(iso(nextRunDate('monthly-self-billing', on('2026-12-26')))).toBe('2027-01-25');
    expect(iso(nextRunDate('weekly-bank', on('2026-12-28')))).toBe('2027-01-01');
  });

  it('counts forward one cadence at a time', () => {
    expect(runDates('weekly-bank', on('2026-10-06'), 3).map(iso))
      .toEqual(['2026-10-09', '2026-10-16', '2026-10-23']);
    expect(runDates('monthly-self-billing', on('2026-10-06'), 3).map(iso))
      .toEqual(['2026-10-25', '2026-11-25', '2026-12-25']);
  });

  it('interleaves the two cadences in date order', () => {
    const slots = upcomingRuns(on('2026-10-06'), 6);
    expect(slots.map(slot => iso(slot.date))).toEqual([...slots.map(slot => iso(slot.date))].sort());
    expect(slots.map(slot => `${iso(slot.date)} ${slot.method}`)).toEqual([
      '2026-10-09 weekly-bank',
      '2026-10-16 weekly-bank',
      '2026-10-23 weekly-bank',
      '2026-10-25 monthly-self-billing',
      '2026-10-30 weekly-bank',
      '2026-11-06 weekly-bank',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: FAIL — `nextRunDate is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `lib/payment-runs.ts`:

```ts
/** Friday, as `getUTCDay` counts. */
const BANK_DAY = 5;
/** The day of the month self-billing settles on. */
const SELF_BILLING_DAY = 25;

const midnight = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/**
 * The first run of `method` on or after `today`. A run date on `today` itself
 * still counts: finance works the run on the day it pays.
 */
export function nextRunDate(method: PaymentMethod, today: Date): Date {
  const from = midnight(today);
  if (method === 'weekly-bank') {
    const wait = (BANK_DAY - from.getUTCDay() + 7) % 7;
    return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + wait));
  }
  const month = from.getUTCMonth() + (from.getUTCDate() > SELF_BILLING_DAY ? 1 : 0);
  return new Date(Date.UTC(from.getUTCFullYear(), month, SELF_BILLING_DAY));
}

/** `count` runs of `method`, the next one first. */
export function runDates(method: PaymentMethod, today: Date, count: number): Date[] {
  const first = nextRunDate(method, today);
  return Array.from({ length: Math.max(0, count) }, (_, index) =>
    method === 'weekly-bank'
      ? new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate() + index * 7))
      : new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + index, SELF_BILLING_DAY)));
}

export interface RunSlot {
  method: PaymentMethod;
  date: Date;
}

/**
 * The next `count` runs across both methods, in date order. The two cadences
 * interleave — a month holds four or five bank dates and one self-billing date
 * — and the strip shows them merged, not as two lists.
 */
export function upcomingRuns(today: Date, count: number): RunSlot[] {
  return PAYMENT_METHODS
    .flatMap(method => runDates(method.id, today, count).map(date => ({ method: method.id, date })))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/payment-runs.ts lib/payment-runs.test.ts
git commit -m "feat(invoices): the weekly and monthly run calendars"
```

---

### Task 3: Which run an invoice sits in

**Files:**
- Modify: `lib/payment-runs.ts`
- Modify: `lib/payment-runs.test.ts`

**Interfaces:**
- Consumes: `buildInvoiceDocument` from `lib/invoice-document.ts` — its `subtotal`, `deductionsTotal` and `balance` are the row's gross, deduction and net.
- Produces: `interface ScheduleEntry { held: boolean; shift: number; paid: boolean }`; `type ScheduleState = Record<string, ScheduleEntry>`; `interface ScheduledInvoice { record: PayableRecord; method: PaymentMethod; date: Date | null; shift: number; gross: number; deduction: number; net: number }`; `interface PaymentRun extends RunSlot { invoices: ScheduledInvoice[]; gross: number; deductions: number; net: number }`; `interface Schedule { runs: PaymentRun[]; held: ScheduledInvoice[] }`; `buildSchedule(records, state, today, count?): Schedule`; `const RUNS_AHEAD = 6`.
- Only `status === 'invoiced'` and not `paid` is payable. A held invoice has `date: null` and appears in `held`, never in a run.

- [ ] **Step 1: Write the failing test**

Append to `lib/payment-runs.test.ts`:

```ts
import { RUNS_AHEAD, buildSchedule, type ScheduleState } from './payment-runs';
import { buildInvoiceDocument } from './invoice-document';

const today = on('2026-10-06');
const invoiced = records.filter(record => record.status === 'invoiced');
const runOn = (state: ScheduleState, date: string) =>
  buildSchedule(records, state, today).runs.find(run => iso(run.date) === date);

describe('which run an invoice sits in', () => {
  it('puts each invoiced record in the next run of its own method', () => {
    const bank = runOn({}, '2026-10-09')!;
    const self = runOn({}, '2026-10-25')!;
    expect(bank.invoices.map(invoice => invoice.record.id).sort()).toEqual(['REC-2025005', 'REC-2025030']);
    expect(self.invoices.map(invoice => invoice.record.id)).toEqual(['REC-2025008']);
  });

  it('leaves records short of invoiced off the desk entirely', () => {
    const scheduled = buildSchedule(records, {}, today).runs.flatMap(run => run.invoices);
    expect(scheduled).toHaveLength(invoiced.length);
    expect(scheduled.every(invoice => invoice.record.status === 'invoiced')).toBe(true);
  });

  it('bills each row exactly what its invoice says', () => {
    const row = runOn({}, '2026-10-09')!.invoices.find(invoice => invoice.record.id === 'REC-2025005')!;
    const doc = buildInvoiceDocument(row.record);
    expect([row.gross, row.deduction, row.net]).toEqual([doc.subtotal, doc.deductionsTotal, doc.balance]);
    expect(row.net).toBe(row.record.amount);
  });

  it('totals a run from its own rows', () => {
    const run = runOn({}, '2026-10-09')!;
    expect(run.gross).toBe(run.invoices.reduce((sum, invoice) => sum + invoice.gross, 0));
    expect(run.deductions).toBe(run.invoices.reduce((sum, invoice) => sum + invoice.deduction, 0));
    expect(run.net).toBe(run.gross - run.deductions);
  });

  it('pushes a rescheduled invoice one run on, never to the other method', () => {
    const state: ScheduleState = { 'REC-2025005': { held: false, shift: 1, paid: false } };
    expect(runOn(state, '2026-10-09')!.invoices.map(invoice => invoice.record.id)).toEqual(['REC-2025030']);
    expect(runOn(state, '2026-10-16')!.invoices.map(invoice => invoice.record.id)).toEqual(['REC-2025005']);
  });

  it('holds an invoice out of every run, under no date at all', () => {
    const state: ScheduleState = { 'REC-2025008': { held: true, shift: 0, paid: false } };
    const schedule = buildSchedule(records, state, today);
    expect(schedule.runs.flatMap(run => run.invoices).map(invoice => invoice.record.id))
      .not.toContain('REC-2025008');
    expect(schedule.held.map(invoice => invoice.record.id)).toEqual(['REC-2025008']);
    expect(schedule.held[0].date).toBeNull();
  });

  it('takes a paid invoice off the desk', () => {
    const state: ScheduleState = { 'REC-2025008': { held: false, shift: 0, paid: true } };
    const schedule = buildSchedule(records, state, today);
    expect(schedule.runs.flatMap(run => run.invoices)).toHaveLength(2);
    expect(schedule.held).toHaveLength(0);
  });

  it('shows the runs ahead in date order, both methods merged', () => {
    const schedule = buildSchedule(records, {}, today);
    expect(schedule.runs).toHaveLength(RUNS_AHEAD);
    expect(schedule.runs.map(run => iso(run.date))).toEqual([...schedule.runs.map(run => iso(run.date))].sort());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: FAIL — `buildSchedule is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `lib/payment-runs.ts` (and add `import { buildInvoiceDocument } from './invoice-document';` at the top):

```ts
/** How far ahead the strip looks. */
export const RUNS_AHEAD = 6;

/** What the desk knows about an invoice that the record itself does not. */
export interface ScheduleEntry {
  held: boolean;
  /** How many runs it has been pushed past the next one. */
  shift: number;
  paid: boolean;
}

export type ScheduleState = Record<string, ScheduleEntry>;

export const EMPTY_ENTRY: ScheduleEntry = { held: false, shift: 0, paid: false };

export interface ScheduledInvoice {
  record: PayableRecord;
  method: PaymentMethod;
  /** The run it sits in, or null while it is held out of all of them. */
  date: Date | null;
  shift: number;
  gross: number;
  deduction: number;
  net: number;
}

export interface PaymentRun extends RunSlot {
  invoices: ScheduledInvoice[];
  gross: number;
  deductions: number;
  net: number;
}

export interface Schedule {
  runs: PaymentRun[];
  held: ScheduledInvoice[];
}

const entryOf = (state: ScheduleState, id: string) => state[id] ?? EMPTY_ENTRY;

/** Only an issued, unpaid invoice is waiting for a payment date. */
const payable = (record: PayableRecord, state: ScheduleState) =>
  record.status === 'invoiced' && !entryOf(state, record.id).paid;

function place(record: PayableRecord, state: ScheduleState, today: Date): ScheduledInvoice {
  const { held, shift } = entryOf(state, record.id);
  // The figures are the invoice's own, so the desk and the document agree.
  const doc = buildInvoiceDocument(record);
  return {
    record,
    method: record.method,
    date: held ? null : runDates(record.method, today, shift + 1)[shift],
    shift,
    gross: doc.subtotal,
    deduction: doc.deductionsTotal,
    net: doc.balance,
  };
}

/**
 * The desk: the runs ahead with their invoices, and whatever is held out of
 * them. Records short of invoiced are not here — they are still work on the
 * processing desk.
 */
export function buildSchedule(
  records: PayableRecord[],
  state: ScheduleState,
  today: Date,
  count = RUNS_AHEAD,
): Schedule {
  const waiting = records.filter(record => payable(record, state)).map(record => place(record, state, today));
  const runs = upcomingRuns(today, count).map(slot => {
    const invoices = waiting.filter(invoice =>
      invoice.method === slot.method && invoice.date?.getTime() === slot.date.getTime());
    const gross = invoices.reduce((sum, invoice) => sum + invoice.gross, 0);
    const deductions = invoices.reduce((sum, invoice) => sum + invoice.deduction, 0);
    return { ...slot, invoices, gross, deductions, net: gross - deductions };
  });
  return { runs, held: waiting.filter(invoice => invoice.date === null) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: PASS, 17 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/payment-runs.ts lib/payment-runs.test.ts
git commit -m "feat(invoices): group issued invoices into the runs that will pay them"
```

---

### Task 4: Hold, release, reschedule, close

**Files:**
- Modify: `lib/payment-runs.ts`
- Modify: `lib/payment-runs.test.ts`

**Interfaces:**
- Produces: `hold(state, id): ScheduleState`; `release(state, id): ScheduleState`; `reschedule(state, id): ScheduleState`; `closeRun(state, run): ScheduleState`. Every one returns a new object and never mutates its argument.
- `release` clears the hold and leaves the shift alone, so a released invoice returns to the run it was pushed to, not to one it had already passed.

- [ ] **Step 1: Write the failing test**

Append to `lib/payment-runs.test.ts`:

```ts
import { closeRun, hold, release, reschedule } from './payment-runs';

describe('what finance does to an invoice', () => {
  it('holds it out of the runs and releases it back', () => {
    const held = hold({}, 'REC-2025005');
    expect(held['REC-2025005'].held).toBe(true);
    expect(release(held, 'REC-2025005')['REC-2025005'].held).toBe(false);
  });

  it('keeps a released invoice at the run it was pushed to', () => {
    const pushed = hold(reschedule({}, 'REC-2025005'), 'REC-2025005');
    expect(release(pushed, 'REC-2025005')['REC-2025005'].shift).toBe(1);
  });

  it('pushes one run at a time', () => {
    const once = reschedule({}, 'REC-2025005');
    expect(once['REC-2025005'].shift).toBe(1);
    expect(reschedule(once, 'REC-2025005')['REC-2025005'].shift).toBe(2);
  });

  it('settles every invoice in the run it closes, and nothing else', () => {
    const run = buildSchedule(records, {}, today).runs.find(item => iso(item.date) === '2026-10-09')!;
    const closed = closeRun({}, run);
    expect(closed['REC-2025005'].paid).toBe(true);
    expect(closed['REC-2025030'].paid).toBe(true);
    expect(closed['REC-2025008']).toBeUndefined();
    expect(buildSchedule(records, closed, today).runs.flatMap(item => item.invoices)
      .map(invoice => invoice.record.id)).toEqual(['REC-2025008']);
  });

  it('never writes through the state it was given', () => {
    const state: ScheduleState = {};
    hold(state, 'REC-2025005');
    reschedule(state, 'REC-2025005');
    expect(state).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: FAIL — `hold is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `lib/payment-runs.ts`:

```ts
const write = (state: ScheduleState, id: string, change: Partial<ScheduleEntry>): ScheduleState =>
  ({ ...state, [id]: { ...entryOf(state, id), ...change } });

/** Out of every run, under no date, until someone releases it. */
export const hold = (state: ScheduleState, id: string): ScheduleState => write(state, id, { held: true });

/**
 * Back into the runs. The shift stays as it was: an invoice released after
 * being pushed returns to the run it was pushed to, not to one already past.
 */
export const release = (state: ScheduleState, id: string): ScheduleState => write(state, id, { held: false });

/** One run on, in its own cadence. Never to the other method. */
export const reschedule = (state: ScheduleState, id: string): ScheduleState =>
  write(state, id, { shift: entryOf(state, id).shift + 1 });

/** The batch is settled: its invoices are paid and leave the desk. */
export function closeRun(state: ScheduleState, run: PaymentRun): ScheduleState {
  return run.invoices.reduce((current, invoice) => write(current, invoice.record.id, { paid: true }), state);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/payment-runs.test.ts`
Expected: PASS, 22 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/payment-runs.ts lib/payment-runs.test.ts
git commit -m "feat(invoices): hold, release, reschedule and close a payment run"
```

---

### Task 5: The desk — two method cards and the dates ahead

**Files:**
- Create: `src/features/invoice-management/PaymentSchedule.tsx`
- Create: `src/features/invoice-management/PaymentSchedule.test.tsx`
- Create: `src/features/invoice-management/schedule.css`

**Interfaces:**
- Consumes: `buildSchedule`, `PAYMENT_METHODS`, `RUNS_AHEAD`, `type PayableRecord`, `type ScheduleState` from `lib/payment-runs.ts`; `restoreInvoiceStages` from `lib/invoice-workflow.ts`; `records.json`.
- Produces: `export default function PaymentSchedule()`. Its landmarks, which Task 6 and Task 7 extend: `aria-label="Payment methods"` on the card row, `aria-label="Upcoming payment runs"` on the strip, `aria-label="Selected payment run"` on the run.
- The storage key is `logix.payment-schedule.v1`.

- [ ] **Step 1: Write the failing test**

Create `src/features/invoice-management/PaymentSchedule.test.tsx`:

```tsx
// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import PaymentSchedule from './PaymentSchedule';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const methods = () => within(screen.getByLabelText('Payment methods'));
const strip = () => within(screen.getByLabelText('Upcoming payment runs'));
const run = () => within(screen.getByLabelText('Selected payment run'));

describe('the payment schedule desk', () => {
  it('shows both ways the company pays, with the bank run selected first', () => {
    render(<PaymentSchedule />);
    expect(methods().getByRole('button', { name: /Weekly · Bank/ })).toHaveAttribute('aria-pressed', 'true');
    expect(methods().getByRole('button', { name: /Monthly · Self-billing/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the other method when its card is picked', () => {
    render(<PaymentSchedule />);
    fireEvent.click(methods().getByRole('button', { name: /Monthly · Self-billing/ }));
    expect(run().getByText(/Monthly · Self-billing/)).toBeInTheDocument();
    expect(methods().getByRole('button', { name: /Monthly · Self-billing/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('lists the dates ahead of both methods in one strip', () => {
    render(<PaymentSchedule />);
    const dates = strip().getAllByRole('button');
    expect(dates.length).toBeGreaterThan(1);
    // Both cadences are in the one strip, not two lists.
    expect(strip().getAllByText(/BANK/).length).toBeGreaterThan(0);
    expect(strip().getAllByText(/SELF-BILLING/).length).toBeGreaterThan(0);
  });

  it('opens a run when its date is picked from the strip', () => {
    render(<PaymentSchedule />);
    const dates = strip().getAllByRole('button');
    fireEvent.click(dates[dates.length - 1]);
    expect(dates[dates.length - 1]).toHaveAttribute('aria-pressed', 'true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/invoice-management/PaymentSchedule.test.tsx`
Expected: FAIL — `Failed to resolve import "./PaymentSchedule"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/features/invoice-management/PaymentSchedule.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { restoreInvoiceStages } from '@/lib/invoice-workflow';
import {
  PAYMENT_METHODS,
  RUNS_AHEAD,
  buildSchedule,
  type PayableRecord,
  type PaymentMethod,
  type ScheduleState,
} from '@/lib/payment-runs';
import seedData from './records.json';
import './schedule.css';

const seed = seedData as PayableRecord[];
const workflowKey = 'logix.invoice-workflow.v1';
const scheduleKey = 'logix.payment-schedule.v1';

const money = (pence: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
const longDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(date).toUpperCase();
const shortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
const weekday = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(date).toUpperCase();
const labelOf = (method: PaymentMethod) => PAYMENT_METHODS.find(item => item.id === method)!.label;

export default function PaymentSchedule() {
  const [records, setRecords] = useState(seed);
  const [state, setState] = useState<ScheduleState>({});
  const [method, setMethod] = useState<PaymentMethod>('weekly-bank');
  const [openDate, setOpenDate] = useState<number | null>(null);
  // Fixed for the life of the desk: the runs must not slide under the user.
  const [today] = useState(() => new Date());

  useEffect(() => {
    try {
      const stages = localStorage.getItem(workflowKey);
      if (stages) setRecords(restoreInvoiceStages(seed, JSON.parse(stages)) as PayableRecord[]);
      const saved = localStorage.getItem(scheduleKey);
      if (saved) setState(JSON.parse(saved));
    } catch { /* A prototype that cannot read its storage simply starts fresh. */ }
  }, []);

  const schedule = useMemo(() => buildSchedule(records, state, today, RUNS_AHEAD), [records, state, today]);
  const forMethod = schedule.runs.filter(run => run.method === method);
  const open = schedule.runs.find(run => run.date.getTime() === openDate) ?? forMethod[0];
  const net = schedule.runs.reduce((sum, run) => sum + run.net, 0);
  const scheduled = schedule.runs.reduce((sum, run) => sum + run.invoices.length, 0);

  return (
    <section className="pay-desk" aria-label="Schedule for payment">
      <header className="pay-heading">
        <div>
          <p className="pay-eyebrow">FINANCE / INVOICES</p>
          <h1>Schedule for Payment</h1>
          <p>{scheduled} invoices scheduled across both payment methods.</p>
        </div>
        <div className="pay-total">
          <span>NET PAYABLE / RUNS AHEAD</span>
          <strong>{money(net)}</strong>
        </div>
      </header>

      <div className="pay-methods" aria-label="Payment methods">
        {PAYMENT_METHODS.map(item => {
          const next = schedule.runs.find(run => run.method === item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`pay-method${item.id === method ? ' selected' : ''}`}
              aria-pressed={item.id === method}
              onClick={() => { setMethod(item.id); setOpenDate(null); }}
            >
              <span className="pay-method-name">{item.label}</span>
              <span className="pay-method-cadence">{item.cadence}</span>
              <span className="pay-method-date">{next ? longDate(next.date) : '—'}</span>
              <span className="pay-method-figures">
                <span>{next?.invoices.length ?? 0} INVOICES</span>
                <strong>{money(next?.net ?? 0)}</strong>
              </span>
            </button>
          );
        })}
      </div>

      <div className="pay-strip" aria-label="Upcoming payment runs">
        {schedule.runs.map(run => (
          <button
            key={`${run.method}-${run.date.toISOString()}`}
            type="button"
            className={`pay-slot${run.date.getTime() === open?.date.getTime() ? ' selected' : ''}`}
            aria-pressed={run.date.getTime() === open?.date.getTime()}
            onClick={() => { setMethod(run.method); setOpenDate(run.date.getTime()); }}
          >
            <span className="pay-slot-date">{shortDate(run.date)}</span>
            <span className="pay-slot-method">
              {run.method === 'weekly-bank' ? 'BANK' : 'SELF-BILLING'}
            </span>
            <span className="pay-slot-count">{run.invoices.length}</span>
          </button>
        ))}
      </div>

      <section className="pay-run" aria-label="Selected payment run">
        {open ? (
          <header className="pay-run-head">
            <div>
              <p className="pay-run-when">{longDate(open.date)}</p>
              <p className="pay-run-meta">
                {weekday(open.date)} · {labelOf(open.method)} · {open.invoices.length} INVOICES
              </p>
            </div>
            <dl className="pay-run-totals">
              <div><dt>GROSS AMOUNT</dt><dd>{money(open.gross)}</dd></div>
              <div><dt>DEDUCTIONS</dt><dd>− {money(open.deductions)}</dd></div>
              <div className="pay-run-net"><dt>NET PAYABLE</dt><dd>{money(open.net)}</dd></div>
            </dl>
          </header>
        ) : (
          <p className="pay-empty">No runs ahead for this method.</p>
        )}
      </section>

      <p className="pay-note">Prototype, saved in this browser. No payment is made or sent.</p>
    </section>
  );
}
```

Create `src/features/invoice-management/schedule.css`:

```css
/* The payment schedule desk. Same ink and type as the processing desk next
   door — it is the same screen's other half of the job. */

.pay-desk {
  --pay-ink: #1a1c16;
  --pay-muted: #707979;
  --pay-line: #bfc8c9;
  --pay-soft: #d9ded6;
  --pay-paper: #fffef8;
  --pay-surface: #eeeee4;
  --pay-teal: #27676c;
  --pay-deep: #003b3e;
  --pay-olive: #446900;
  --pay-lime: #b2f746;
  --pay-mono: 'IBM Plex Mono', monospace;

  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 28px 22px;
  color: var(--pay-ink);
  font-family: 'Space Grotesk', sans-serif;
}

.pay-heading { display: flex; justify-content: space-between; gap: 24px; align-items: end; padding-bottom: 14px; border-bottom: 1px solid var(--pay-muted); }
.pay-heading h1 { margin: 8px 0; font-size: clamp(24px, 2.1vw, 34px); font-weight: 700; letter-spacing: -.04em; text-transform: uppercase; }
.pay-heading p { margin: 0; color: #3f4849; font-size: 13px; }
.pay-eyebrow { font: 10px var(--pay-mono); letter-spacing: .1em; color: var(--pay-muted); }
.pay-total { display: grid; gap: 6px; text-align: right; flex-shrink: 0; }
.pay-total span { font: 10px var(--pay-mono); color: var(--pay-muted); }
.pay-total strong { font-size: 28px; color: var(--pay-deep); }

/* ---------- the two methods ---------- */

.pay-methods { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.pay-method {
  display: grid; gap: 6px; padding: 14px; text-align: left;
  border: 1px solid var(--pay-soft); background: var(--pay-surface);
  color: var(--pay-ink); font: inherit; cursor: pointer;
}
.pay-method:hover { border-color: var(--pay-teal); }
.pay-method.selected { border-color: var(--pay-deep); background: var(--pay-paper); box-shadow: inset 3px 0 var(--pay-lime); }
.pay-method:focus-visible { outline: 2px solid var(--pay-deep); outline-offset: 2px; }
.pay-method-name { font-size: 15px; font-weight: 700; }
.pay-method-cadence { font: 10px var(--pay-mono); letter-spacing: .06em; color: var(--pay-muted); }
.pay-method-date { font: 600 12px var(--pay-mono); letter-spacing: .05em; color: var(--pay-deep); }
.pay-method-figures { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-top: 6px; border-top: 1px solid var(--pay-soft); }
.pay-method-figures span { font: 10px var(--pay-mono); color: var(--pay-muted); }
.pay-method-figures strong { font-size: 16px; color: var(--pay-deep); }

/* ---------- the dates ahead ---------- */

.pay-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.pay-slot {
  flex: none; display: grid; gap: 3px; min-width: 104px; padding: 9px 11px; text-align: left;
  border: 1px solid var(--pay-soft); background: var(--pay-paper);
  color: var(--pay-ink); font: inherit; cursor: pointer;
}
.pay-slot:hover { border-color: var(--pay-teal); }
.pay-slot.selected { border-color: var(--pay-deep); background: var(--pay-surface); }
.pay-slot:focus-visible { outline: 2px solid var(--pay-deep); outline-offset: 2px; }
.pay-slot-date { font: 600 12px var(--pay-mono); letter-spacing: .04em; }
.pay-slot-method { font: 9px var(--pay-mono); letter-spacing: .06em; color: var(--pay-muted); }
.pay-slot-count { font: 9px var(--pay-mono); color: var(--pay-olive); }

/* ---------- the run ---------- */

.pay-run { display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--pay-line); background: var(--pay-paper); padding: 16px; }
.pay-run-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: end; }
.pay-run-when { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.03em; }
.pay-run-meta { margin: 4px 0 0; font: 10px var(--pay-mono); letter-spacing: .06em; color: var(--pay-muted); }
.pay-run-totals { display: flex; flex-wrap: wrap; gap: 22px; margin: 0; }
.pay-run-totals dt { font: 10px var(--pay-mono); letter-spacing: .07em; color: var(--pay-muted); }
.pay-run-totals dd { margin: 4px 0 0; font-size: 17px; font-weight: 700; }
.pay-run-net dd { color: var(--pay-deep); }

.pay-empty { margin: 6px 0; font: 11px var(--pay-mono); color: var(--pay-muted); }
.pay-note { margin: 0; font: 10px var(--pay-mono); color: var(--pay-muted); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/invoice-management/PaymentSchedule.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/invoice-management/PaymentSchedule.tsx src/features/invoice-management/PaymentSchedule.test.tsx src/features/invoice-management/schedule.css
git commit -m "feat(invoices): the payment desk, its two methods and the dates ahead"
```

---

### Task 6: The run's table, and what is held out of it

**Files:**
- Modify: `src/features/invoice-management/PaymentSchedule.tsx`
- Modify: `src/features/invoice-management/PaymentSchedule.test.tsx`
- Modify: `src/features/invoice-management/schedule.css`

**Interfaces:**
- Consumes: `hold`, `release`, `reschedule` from `lib/payment-runs.ts`.
- Produces: the held block under `aria-label="Held invoices"`. Schedule state is written to `logix.payment-schedule.v1` on every change.

- [ ] **Step 1: Write the failing test**

Append to `src/features/invoice-management/PaymentSchedule.test.tsx`:

```tsx
const held = () => within(screen.getByLabelText('Held invoices'));

describe('working the run', () => {
  it('lists each invoice with the money its document carries', () => {
    render(<PaymentSchedule />);
    const row = run().getByRole('row', { name: /REC-2025005/ });
    expect(within(row).getByText('Emma Wilson')).toBeInTheDocument();
    expect(within(row).getByText('£1,670.29')).toBeInTheDocument();
  });

  it('holds an invoice out of the run and into its own block', () => {
    render(<PaymentSchedule />);
    const row = run().getByRole('row', { name: /REC-2025005/ });
    fireEvent.click(within(row).getByRole('button', { name: /HOLD/i }));

    expect(run().queryByRole('row', { name: /REC-2025005/ })).not.toBeInTheDocument();
    expect(held().getByText('REC-2025005')).toBeInTheDocument();
  });

  it('releases a held invoice back into the run', () => {
    render(<PaymentSchedule />);
    fireEvent.click(within(run().getByRole('row', { name: /REC-2025005/ })).getByRole('button', { name: /HOLD/i }));
    fireEvent.click(held().getByRole('button', { name: /RELEASE/i }));

    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Held invoices')).not.toBeInTheDocument();
  });

  it('pushes a rescheduled invoice to the next date of the same method', () => {
    render(<PaymentSchedule />);
    fireEvent.click(within(run().getByRole('row', { name: /REC-2025005/ })).getByRole('button', { name: /RESCHEDULE/i }));
    expect(run().queryByRole('row', { name: /REC-2025005/ })).not.toBeInTheDocument();

    // The desk reads the real clock, so the strip's order shifts with the day.
    // Pick the second BANK slot by its method rather than by position.
    const bankDates = strip().getAllByRole('button').filter(slot => within(slot).queryByText('BANK'));
    fireEvent.click(bankDates[1]);
    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
    // Still a bank run — rescheduling never changes the method.
    expect(run().getByText(/Weekly · Bank/)).toBeInTheDocument();
  });

  it('remembers what it was told, across a remount', () => {
    const first = render(<PaymentSchedule />);
    fireEvent.click(within(run().getByRole('row', { name: /REC-2025005/ })).getByRole('button', { name: /HOLD/i }));
    first.unmount();

    render(<PaymentSchedule />);
    expect(held().getByText('REC-2025005')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/invoice-management/PaymentSchedule.test.tsx`
Expected: FAIL — `Unable to find an accessible element with the role "row"`.

- [ ] **Step 3: Write minimal implementation**

In `PaymentSchedule.tsx`, extend the import from `@/lib/payment-runs` with `hold`, `release`, `reschedule`, and add the write-back effect after the read effect:

```tsx
  const [loaded, setLoaded] = useState(false);
```

Set `setLoaded(true)` at the end of the existing read effect, and add:

```tsx
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(scheduleKey, JSON.stringify(state)); }
    catch { /* The desk still works for this session without storage. */ }
  }, [state, loaded]);
```

Then, inside `<section className="pay-run">`, after the `<header>`, add the table:

```tsx
            <table className="pay-table">
              <thead>
                <tr>
                  <th scope="col">INVOICE</th>
                  <th scope="col">SUBCONTRACTOR / PERIOD</th>
                  <th scope="col">PAYMENT DATE</th>
                  <th scope="col" className="pay-right">GROSS</th>
                  <th scope="col" className="pay-right">DEDUCTION</th>
                  <th scope="col" className="pay-right">NET</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {open.invoices.map(invoice => (
                  <tr key={invoice.record.id}>
                    <td className="pay-id">{invoice.record.id}</td>
                    <td>
                      <span className="pay-vendor">{invoice.record.vendor}</span>
                      <span className="pay-period">{invoice.record.period.toUpperCase()}</span>
                    </td>
                    <td className="pay-id">{longDate(invoice.date!)}</td>
                    <td className="pay-right">{money(invoice.gross)}</td>
                    <td className="pay-right">− {money(invoice.deduction)}</td>
                    <td className="pay-right pay-net">{money(invoice.net)}</td>
                    <td>
                      <span className={`pay-status${invoice.shift ? ' is-moved' : ''}`}>
                        {invoice.shift ? 'RESCHEDULED' : 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="pay-actions">
                      <button type="button" onClick={() => setState(current => reschedule(current, invoice.record.id))}>
                        RESCHEDULE
                      </button>
                      <button type="button" onClick={() => setState(current => hold(current, invoice.record.id))}>
                        HOLD
                      </button>
                    </td>
                  </tr>
                ))}
                {!open.invoices.length && (
                  <tr><td colSpan={8} className="pay-empty">Nothing scheduled for this date.</td></tr>
                )}
              </tbody>
            </table>
```

And after the `</section>` of the run, before the note, the held block:

```tsx
      {schedule.held.length > 0 && (
        <section className="pay-held" aria-label="Held invoices">
          <h2>ON HOLD · {schedule.held.length}</h2>
          <p className="pay-held-note">Held invoices sit under no payment date until they are released.</p>
          {schedule.held.map(invoice => (
            <article className="pay-held-row" key={invoice.record.id}>
              <span className="pay-id">{invoice.record.id}</span>
              <span className="pay-vendor">{invoice.record.vendor}</span>
              <span className="pay-held-method">{labelOf(invoice.method)}</span>
              <strong>{money(invoice.net)}</strong>
              <button type="button" onClick={() => setState(current => release(current, invoice.record.id))}>
                RELEASE
              </button>
            </article>
          ))}
        </section>
      )}
```

Append to `schedule.css`:

```css
/* ---------- the run's table ---------- */

.pay-table { width: 100%; border-collapse: collapse; }
.pay-table th { padding: 8px 10px; border-bottom: 1px solid var(--pay-ink); font: 600 9px var(--pay-mono); letter-spacing: .08em; color: var(--pay-muted); text-align: left; white-space: nowrap; }
.pay-table td { padding: 9px 10px; border-bottom: 1px solid var(--pay-soft); font-size: 12px; vertical-align: middle; }
.pay-table tr:last-child td { border-bottom: 0; }
.pay-right { text-align: right; }
.pay-net { font-weight: 700; color: var(--pay-deep); }
.pay-id { font: 10px var(--pay-mono); color: var(--pay-muted); letter-spacing: .04em; white-space: nowrap; }
.pay-vendor { display: block; font-weight: 600; }
.pay-period { display: block; font: 9px var(--pay-mono); color: var(--pay-muted); letter-spacing: .05em; }
.pay-status { padding: 2px 6px; border: 1px solid var(--pay-line); background: var(--pay-surface); font: 9px var(--pay-mono); letter-spacing: .05em; color: var(--pay-muted); white-space: nowrap; }
.pay-status.is-moved { border-color: #e4d9af; background: #f6f1df; color: #6a5725; }
.pay-actions { display: flex; gap: 6px; }
.pay-actions button { border: 1px solid var(--pay-line); background: transparent; color: var(--pay-muted); padding: 4px 8px; font: 9px var(--pay-mono); letter-spacing: .05em; cursor: pointer; white-space: nowrap; }
.pay-actions button:hover { border-color: var(--pay-teal); color: var(--pay-deep); }
.pay-actions button:focus-visible { outline: 2px solid var(--pay-deep); outline-offset: 2px; }

/* ---------- held out of every run ---------- */

.pay-held { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; border: 1px solid #e4d9af; background: #f9f6ea; }
.pay-held h2 { margin: 0; font: 700 11px var(--pay-mono); letter-spacing: .09em; color: #6a5725; }
.pay-held-note { margin: 0; font: 10px var(--pay-mono); color: var(--pay-muted); }
.pay-held-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 9px 11px; border: 1px solid var(--pay-soft); background: var(--pay-paper); }
.pay-held-row .pay-vendor { flex: 1 1 auto; min-width: 120px; font-size: 13px; }
.pay-held-method { font: 9px var(--pay-mono); letter-spacing: .05em; color: var(--pay-muted); }
.pay-held-row strong { color: var(--pay-deep); font-size: 13px; }
.pay-held-row button { border: 1px solid var(--pay-line); background: transparent; color: var(--pay-muted); padding: 4px 9px; font: 9px var(--pay-mono); letter-spacing: .05em; cursor: pointer; }
.pay-held-row button:hover { border-color: var(--pay-teal); color: var(--pay-deep); }
.pay-held-row button:focus-visible { outline: 2px solid var(--pay-deep); outline-offset: 2px; }

@media (max-width: 860px) {
  .pay-run { overflow-x: auto; }
  .pay-table { min-width: 720px; }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/invoice-management/PaymentSchedule.test.tsx`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/invoice-management/PaymentSchedule.tsx src/features/invoice-management/PaymentSchedule.test.tsx src/features/invoice-management/schedule.css
git commit -m "feat(invoices): work a run — its table, holds and reschedules"
```

---

### Task 7: Closing a run

**Files:**
- Modify: `src/features/invoice-management/PaymentSchedule.tsx`
- Modify: `src/features/invoice-management/PaymentSchedule.test.tsx`
- Modify: `src/features/invoice-management/schedule.css`

**Interfaces:**
- Consumes: `closeRun` from `lib/payment-runs.ts`.
- Produces: a two-step confirmation inside the run header. The first click arms it and shows date, count and net; the second settles. Any other click on the desk disarms it.

- [ ] **Step 1: Write the failing test**

Append to `src/features/invoice-management/PaymentSchedule.test.tsx`:

```tsx
describe('closing a run', () => {
  it('asks before settling, naming the date, the count and the net', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    const confirm = run().getByRole('button', { name: /CONFIRM/i });
    expect(confirm).toBeInTheDocument();
    expect(run().getByText(/2 INVOICES/)).toBeInTheDocument();
  });

  it('settles the batch and leaves the run empty', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CONFIRM/i }));

    expect(run().getByText('Nothing scheduled for this date.')).toBeInTheDocument();
    expect(run().queryByRole('row', { name: /REC-2025005/ })).not.toBeInTheDocument();
  });

  it('leaves the run of the other method untouched', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CONFIRM/i }));

    fireEvent.click(methods().getByRole('button', { name: /Monthly · Self-billing/ }));
    expect(run().getByRole('row', { name: /REC-2025008/ })).toBeInTheDocument();
  });

  it('backs out when the confirmation is dismissed', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CANCEL/i }));

    expect(run().queryByRole('button', { name: /CONFIRM/i })).not.toBeInTheDocument();
    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/invoice-management/PaymentSchedule.test.tsx`
Expected: FAIL — no button named `CLOSE RUN`.

- [ ] **Step 3: Write minimal implementation**

In `PaymentSchedule.tsx`, add `closeRun` to the `@/lib/payment-runs` import and the arming state:

```tsx
  /** The run date the user has armed for closing — the one irreversible step. */
  const [closing, setClosing] = useState<number | null>(null);
```

Disarm whenever the user looks elsewhere: in the method card's `onClick` and the strip slot's `onClick`, add `setClosing(null);`.

Add this to the end of the run's `<header className="pay-run-head">`:

```tsx
            <div className="pay-close">
              {closing === open.date.getTime() ? (
                <>
                  <p className="pay-close-ask">
                    SETTLE {longDate(open.date)} · {open.invoices.length} INVOICES · {money(open.net)}
                  </p>
                  <div className="pay-close-pair">
                    <button
                      type="button"
                      className="pay-close-go"
                      onClick={() => {
                        setState(current => closeRun(current, open));
                        setClosing(null);
                      }}
                    >
                      CONFIRM
                    </button>
                    <button type="button" onClick={() => setClosing(null)}>CANCEL</button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="pay-close-go"
                  disabled={!open.invoices.length}
                  onClick={() => setClosing(open.date.getTime())}
                >
                  CLOSE RUN
                </button>
              )}
            </div>
```

Append to `schedule.css`:

```css
/* ---------- settling a run ---------- */

.pay-close { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; }
.pay-close-ask { margin: 0; font: 10px var(--pay-mono); letter-spacing: .05em; color: #6a5725; text-align: right; }
.pay-close-pair { display: flex; gap: 7px; }
.pay-close-go {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 38px; padding: 0 16px;
  border: 1px solid var(--pay-deep); background: var(--pay-deep); color: #fafaef;
  font: 600 11px var(--pay-mono); letter-spacing: .06em; cursor: pointer;
}
.pay-close-go:hover:not(:disabled) { background: var(--pay-teal); border-color: var(--pay-teal); }
.pay-close-go:disabled { opacity: .45; cursor: not-allowed; }
.pay-close-pair button:not(.pay-close-go) { min-height: 38px; padding: 0 14px; border: 1px solid var(--pay-line); background: transparent; color: var(--pay-muted); font: 600 11px var(--pay-mono); letter-spacing: .06em; cursor: pointer; }
.pay-close-pair button:not(.pay-close-go):hover { border-color: var(--pay-teal); color: var(--pay-deep); }
.pay-close button:focus-visible { outline: 2px solid var(--pay-deep); outline-offset: 2px; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/invoice-management/PaymentSchedule.test.tsx`
Expected: PASS, 13 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/invoice-management/PaymentSchedule.tsx src/features/invoice-management/PaymentSchedule.test.tsx src/features/invoice-management/schedule.css
git commit -m "feat(invoices): settle a payment run, once it is confirmed"
```

---

### Task 8: The tab opens the desk

**Files:**
- Modify: `src/features/invoice-management/InvoiceManagement.tsx`
- Modify: `src/features/invoice-management/InvoiceBoard.test.tsx` (no change expected — run it to prove nothing broke)

**Interfaces:**
- Consumes: `PaymentSchedule` from `./PaymentSchedule`.
- The tab id for Schedule for Payment is `82-7755`. `InvoiceManagement.tsx` currently treats `41-2474` and `82-8787` as desks (`isDesk`) and renders every other id through `ScreenRouter` as a fixed-width Figma canvas.

- [ ] **Step 1: Write the failing test**

Create `src/features/invoice-management/InvoiceManagement.test.tsx`:

```tsx
// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import InvoiceManagement from './InvoiceManagement';

beforeEach(() => { window.location.hash = ''; });
afterEach(() => { cleanup(); localStorage.clear(); });

describe('the invoice management tabs', () => {
  it('opens the processing desk by default', () => {
    render(<InvoiceManagement />);
    expect(screen.getByLabelText('Invoice processing desk')).toBeInTheDocument();
  });

  it('opens the payment desk on the schedule tab', () => {
    window.location.hash = '#82-7755';
    render(<InvoiceManagement />);
    expect(screen.getByLabelText('Schedule for payment')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment methods')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/invoice-management/InvoiceManagement.test.tsx`
Expected: FAIL — `Unable to find a label with the text of: Schedule for payment` (the tab still renders the Figma canvas).

- [ ] **Step 3: Write minimal implementation**

In `src/features/invoice-management/InvoiceManagement.tsx`, add the import:

```tsx
import PaymentSchedule from './PaymentSchedule';
```

Replace the screen-choosing block. The schedule is a desk of its own, so it joins the two that are already pinned rather than going through `ScreenRouter`:

```tsx
  // The desks are ours; the rest are still the imported Figma canvases, which
  // are a fixed 1277px and need the shell to scroll.
  const isDesk = screenId === initialScreen || screenId === '82-8787' || screenId === '82-7755';

  function screenBody() {
    if (screenId === '82-7755') return <PaymentSchedule />;
    if (isDesk) return <InvoiceBoard history={screenId === '82-8787'} />;
    return (
      <div className="invoice-management-canvas" style={{ minHeight: screen.height - 64 }}>
        <ScreenRouter screenId={screenId} />
      </div>
    );
  }
```

and render `{screenBody()}` where the old ternary was.

The payment desk scrolls with the page rather than pinning its columns, so exclude it from the pinned-height rule in `src/features/invoice-management/desk.css`:

```css
@media (min-width: 768px) {
  .invoice-management.is-desk:not(:has(.pay-desk)) {
    height: calc(100vh - 65px);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/invoice-management/`
Expected: PASS — the two new tests plus the five already in `InvoiceBoard.test.tsx` and the thirteen in `PaymentSchedule.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/features/invoice-management/InvoiceManagement.tsx src/features/invoice-management/InvoiceManagement.test.tsx src/features/invoice-management/desk.css
git commit -m "feat(invoices): the schedule tab opens the payment desk"
```

---

### Task 9: Whole-suite check

**Files:** none changed unless something breaks.

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/` or `src/`. Three pre-existing errors about `app/(private)/logistics/page.js` come from a stale `.next` directory and are not yours — ignore them.

- [ ] **Step 2: Lint**

Run: `npx eslint lib/payment-runs.ts lib/payment-runs.test.ts src/features/invoice-management`
Expected: `0 errors`. Warnings about `<img>` in the `design/` folder are pre-existing.

- [ ] **Step 3: Full suite**

Run: `npx vitest run`
Expected: every test file passes.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "test(invoices): keep the suite green for the payment desk"
```
