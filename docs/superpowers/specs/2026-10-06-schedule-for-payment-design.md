# Schedule for Payment — two payment methods

**Date:** 2026-10-06
**Status:** approved, ready for implementation

## Why

BA Express pays its drivers two different ways, and which one applies is
fixed by the driver's contract:

- **Weekly · Bank** — a bank run every Friday.
- **Monthly · Self-billing** — one run a month, on the 25th.

The Schedule for Payment tab is today a static Figma canvas (`82-7755`). It
shows a single run and calls it "DHL PAYMENT CYCLE", which cannot represent
two cadences at once. This replaces that canvas with a working desk.

## Scope

In: the schedule desk, its run arithmetic, and the four actions finance needs.
Out: anything that leaves the browser. The repo runs in `MOCK_MODE`
(`lib/mock-api.ts`); this feature adds no request, no endpoint, no hook. Its
data is the existing `records.json` seed plus `localStorage`, exactly as the
invoice processing desk already works.

## Model

### Payment method lives on the driver

Each record in `records.json` gains `method: 'weekly-bank' | 'monthly-self-billing'`.
It comes from the contract. Nothing in the UI sets or changes it — the desk
only groups by it.

### A run is a pair (method, date)

| Method | Cadence | Date |
|---|---|---|
| `weekly-bank` | every week | Friday |
| `monthly-self-billing` | every month | the 25th |

Run dates are computed from an injected `today`, never from `Date.now()` inside
the logic, so the arithmetic is testable across month and year boundaries.

The two cadences interleave: a typical month holds 4–5 bank dates and 1
self-billing date. The upcoming-dates strip shows them merged in date order,
each marked with its method — not two separate lists.

### How an invoice enters a run

A record that reaches `invoiced` on the processing desk joins **the next run of
its driver's method**: the first date of that cadence not yet past.

### The four actions

| Action | Effect |
|---|---|
| `HOLD` | Leaves its run and joins no other. Held invoices belong to no date. |
| `RELEASE` | Returns to the next available run of its method. |
| `RESCHEDULE` | Moves to the following run **of the same method** — a week on, or a month. Never changes method. |
| `CLOSE RUN` | Settles the whole batch for that date: its invoices become paid and leave the desk, and the next run becomes current. The one irreversible step, so it confirms first, showing date, count and net. |

### Money comes from the invoice document

A row's gross, deduction and net are `subtotal`, `deductionsTotal` and
`balance` from `buildInvoiceDocument` (`lib/invoice-document.ts`). The schedule
and the issued invoice cannot disagree, so they share one function.

## Screen

Chosen over a two-lane split: the daily work is operating one run's nine-column
table, and half a screen cannot hold it. Comparing methods is a lookup, not an
operation, so two summary cards answer it.

1. **Heading** — title, total scheduled, net across both methods.
2. **Two method cards, side by side** — `WEEKLY · BANK` and
   `MONTHLY · SELF-BILLING`, each with its next date, invoice count and net.
   One is selected; clicking switches.
3. **Upcoming dates strip** — the next ~6 runs across both methods in date
   order, each badged with its method. Clicking a date opens that run.
4. **The selected run** — date, weekday, counts, the three totals, then the
   table: `SEL · INVOICE · SUBCONTRACTOR/PERIOD · PAYMENT DATE · GROSS ·
   DEDUCTION · NET · STATUS · ACTIONS`.
5. **Held block** — below the table, not inside it, with `RELEASE`. A held
   invoice belongs to no run; showing it under a date would be a lie.
6. **`CLOSE RUN`** — confirms before settling.

## Files

| File | Role |
|---|---|
| `lib/payment-runs.ts` | New. Run dates, grouping, and every transition. Pure, `today` injected. |
| `lib/payment-runs.test.ts` | New. Month and year rollover, interleaving, each transition. |
| `src/features/invoice-management/PaymentSchedule.tsx` | New. The desk. |
| `src/features/invoice-management/PaymentSchedule.test.tsx` | New. Switching method, hold, release, close. |
| `src/features/invoice-management/schedule.css` | New. |
| `src/features/invoice-management/records.json` | `method` per record. |
| `src/features/invoice-management/InvoiceManagement.tsx` | Tab `82-7755` renders the desk instead of the Figma canvas. |

## State

Reads `logix.invoice-workflow.v1` to know which records are `invoiced`. Writes
its own `logix.payment-schedule.v1`: per invoice, whether it is held, how many
runs it has been pushed, and whether it has been paid. Both are prototype
storage, and the desk keeps the same footer note saying so.

## Testing

The run arithmetic is pure and carries the weight: dates across month and year
ends, the two cadences interleaving, and each transition landing an invoice
where it should. The component test covers what the screen promises — the two
cards, switching between them, hold removing a row from the run, release
returning it, and closing a run emptying it and promoting the next.
