import { buildInvoiceDocument } from './invoice-document';
import { seededRandom } from './seeded-random';
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
  /** The run that settled it, so its bonus still knows which week it belongs to. */
  paidOn: number | null;
  bonusPaid: boolean;
}

/** When the SPMS for a bank run arrived, keyed by that run's date in ms. */
export type SpmsLog = Record<string, string>;

export type ScheduleState = Record<string, ScheduleEntry>;

export const EMPTY_ENTRY: ScheduleEntry = { held: false, shift: 0, paid: false, paidOn: null, bonusPaid: false };

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

/** A run pays either the day rate the invoice carries, or the bonus behind it. */
export type RunKind = 'payment' | 'bonus';

export interface PaymentRun extends RunSlot {
  kind: RunKind;
  /** For a bonus run, the payment run whose week it settles. */
  week: Date | null;
  invoices: ScheduledInvoice[];
  gross: number;
  deductions: number;
  net: number;
}

/** A week's bonus with nowhere to go yet: its SPMS has not arrived. */
export interface PendingBonus {
  /** The payment run whose week this bonus belongs to. */
  week: Date;
  invoices: ScheduledInvoice[];
  net: number;
}

export interface Schedule {
  runs: PaymentRun[];
  held: ScheduledInvoice[];
  awaiting: PendingBonus[];
}

/**
 * The bonus the SPMS carries for a record, in pence. Most carry none — the
 * company grants some — and the same record always carries the same one.
 *
 * The SPMS is a weekly document covering the day-rate drivers, so a monthly
 * self-billing record never has one. There is no SPMS file to read here, so
 * the figure is derived rather than looked up.
 */
export function bonusOf(record: PayableRecord): number {
  if (record.method !== 'weekly-bank') return 0;
  const next = seededRandom(`${record.id}|${record.vendor}|spms`);
  if (next() >= 0.45) return 0;
  // £25 to £150, in the £5 steps a granted bonus is written in.
  return 2500 + Math.floor(next() * 26) * 500;
}

/** The document for `runDate` landed on `arrivedOn`; its bonus can be dated. */
export const registerSpms = (log: SpmsLog, runDate: Date, arrivedOn: Date): SpmsLog =>
  ({ ...log, [String(runDate.getTime())]: arrivedOn.toISOString() });

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
/** The bonus row for a record: the SPMS figure, with nothing taken off it. */
function bonusRow(record: PayableRecord, state: ScheduleState, date: Date | null): ScheduledInvoice {
  const amount = bonusOf(record);
  return { record, method: record.method, date, shift: entryOf(state, record.id).shift, gross: amount, deduction: 0, net: amount };
}

/**
 * Which records a bank run's bonus covers: those it is about to pay, and those
 * it already paid. A settled run still owes its week's bonus, so the link
 * survives the settlement through `paidOn`.
 */
function bonusMembers(records: PayableRecord[], state: ScheduleState, week: number, today: Date) {
  return records.filter(record => {
    // A record short of invoiced is still work on the processing desk; its
    // week has not been paid, so there is no bonus behind it yet.
    if (record.status !== 'invoiced') return false;
    if (record.method !== 'weekly-bank' || bonusOf(record) === 0) return false;
    const entry = entryOf(state, record.id);
    if (entry.bonusPaid) return false;
    if (entry.paid) return entry.paidOn === week;
    if (entry.held) return false;
    return runDates(record.method, today, entry.shift + 1)[entry.shift].getTime() === week;
  });
}

/**
 * The desk: the runs ahead with their invoices, whatever is held out of them,
 * and the weeks whose bonus is still waiting on its SPMS.
 *
 * Records short of invoiced are not here — they are still work on the
 * processing desk.
 */
export function buildSchedule(
  records: PayableRecord[],
  state: ScheduleState,
  spms: SpmsLog,
  today: Date,
  count = RUNS_AHEAD,
): Schedule {
  const waiting = records.filter(record => payable(record, state)).map(record => place(record, state, today));
  const payments: PaymentRun[] = upcomingRuns(today, count).map(slot => {
    const invoices = waiting.filter(invoice =>
      invoice.method === slot.method && invoice.date?.getTime() === slot.date.getTime());
    const gross = invoices.reduce((sum, invoice) => sum + invoice.gross, 0);
    const deductions = invoices.reduce((sum, invoice) => sum + invoice.deduction, 0);
    return { ...slot, kind: 'payment' as const, week: null, invoices, gross, deductions, net: gross - deductions };
  });

  // Every bank run has a bonus behind it: the ones ahead, and the ones already
  // settled whose document has still not arrived.
  const weeks = new Set<number>([
    ...payments.filter(run => run.method === 'weekly-bank').map(run => run.date.getTime()),
    ...Object.values(state).map(entry => entry.paidOn).filter((date): date is number => date !== null),
  ]);

  const bonuses: PaymentRun[] = [];
  const awaiting: PendingBonus[] = [];
  for (const week of [...weeks].sort((a, b) => a - b)) {
    const members = bonusMembers(records, state, week, today);
    if (!members.length) continue;
    const arrival = spms[String(week)];
    const net = members.reduce((sum, record) => sum + bonusOf(record), 0);
    if (!arrival) {
      awaiting.push({ week: new Date(week), invoices: members.map(record => bonusRow(record, state, null)), net });
      continue;
    }
    // The money leaves on a run day, so the bonus pays on the first bank date
    // on or after the document landed.
    const date = nextRunDate('weekly-bank', new Date(arrival));
    bonuses.push({
      kind: 'bonus',
      method: 'weekly-bank',
      date,
      week: new Date(week),
      invoices: members.map(record => bonusRow(record, state, date)),
      gross: net,
      deductions: 0,
      net,
    });
  }

  const runs = [...payments, ...bonuses].sort((a, b) => a.date.getTime() - b.date.getTime());
  return { runs, held: waiting.filter(invoice => invoice.date === null), awaiting };
}

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

/**
 * The batch is settled. A payment run pays the invoices and remembers which
 * run paid them, so their bonus still knows its week; a bonus run settles only
 * the bonus, and leaves the day rate owed.
 */
export function closeRun(state: ScheduleState, run: PaymentRun): ScheduleState {
  const change: Partial<ScheduleEntry> = run.kind === 'bonus'
    ? { bonusPaid: true }
    : { paid: true, paidOn: run.date.getTime() };
  return run.invoices.reduce((current, invoice) => write(current, invoice.record.id, change), state);
}
