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
