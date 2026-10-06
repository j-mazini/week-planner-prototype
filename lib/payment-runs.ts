import { buildInvoiceDocument } from './invoice-document';
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
