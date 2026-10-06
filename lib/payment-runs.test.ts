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

import { EMPTY_ENTRY, RUNS_AHEAD, buildSchedule, type ScheduleState } from './payment-runs';
import { buildInvoiceDocument } from './invoice-document';

const today = on('2026-10-06');
const invoiced = records.filter(record => record.status === 'invoiced');
/** The seed grows; what a run holds is derived from it, never written down. */
const invoicedBy = (method: string) =>
  invoiced.filter(record => record.method === method).map(record => record.id).sort();
const runOn = (state: ScheduleState, date: string) =>
  buildSchedule(records, state, {}, today).runs.find(run => run.kind === 'payment' && iso(run.date) === date);

describe('which run an invoice sits in', () => {
  it('puts each invoiced record in the next run of its own method', () => {
    const bank = runOn({}, '2026-10-09')!;
    const self = runOn({}, '2026-10-25')!;
    expect(bank.invoices.map(invoice => invoice.record.id).sort()).toEqual(invoicedBy('weekly-bank'));
    expect(self.invoices.map(invoice => invoice.record.id).sort()).toEqual(invoicedBy('monthly-self-billing'));
  });

  it('leaves records short of invoiced off the desk entirely', () => {
    const scheduled = buildSchedule(records, {}, {}, today).runs.flatMap(run => run.invoices);
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
    const state: ScheduleState = { 'REC-2025005': { ...EMPTY_ENTRY, shift: 1 } };
    expect(runOn(state, '2026-10-09')!.invoices.map(invoice => invoice.record.id).sort())
      .toEqual(invoicedBy('weekly-bank').filter(id => id !== 'REC-2025005'));
    expect(runOn(state, '2026-10-16')!.invoices.map(invoice => invoice.record.id)).toEqual(['REC-2025005']);
  });

  it('holds an invoice out of every run, under no date at all', () => {
    const state: ScheduleState = { 'REC-2025008': { ...EMPTY_ENTRY, held: true } };
    const schedule = buildSchedule(records, state, {}, today);
    expect(schedule.runs.flatMap(run => run.invoices).map(invoice => invoice.record.id))
      .not.toContain('REC-2025008');
    expect(schedule.held.map(invoice => invoice.record.id)).toEqual(['REC-2025008']);
    expect(schedule.held[0].date).toBeNull();
  });

  it('takes a paid invoice off the desk', () => {
    const state: ScheduleState = { 'REC-2025008': { ...EMPTY_ENTRY, paid: true } };
    const schedule = buildSchedule(records, state, {}, today);
    expect(schedule.runs.flatMap(run => run.invoices)).toHaveLength(invoiced.length - 1);
    expect(schedule.held).toHaveLength(0);
  });

  it('shows the runs ahead in date order, both methods merged', () => {
    const schedule = buildSchedule(records, {}, {}, today);
    expect(schedule.runs.filter(run => run.kind === 'payment')).toHaveLength(RUNS_AHEAD);
    expect(schedule.runs.map(run => iso(run.date))).toEqual([...schedule.runs.map(run => iso(run.date))].sort());
  });
});

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
    const run = buildSchedule(records, {}, {}, today).runs.find(item => item.kind === 'payment' && iso(item.date) === '2026-10-09')!;
    const closed = closeRun({}, run);
    expect(closed['REC-2025005'].paid).toBe(true);
    expect(closed['REC-2025030'].paid).toBe(true);
    expect(closed['REC-2025008']).toBeUndefined();
    // Closing the bank run leaves exactly the self-billing side still owed.
    expect(buildSchedule(records, closed, {}, today).runs.flatMap(item => item.invoices)
      .map(invoice => invoice.record.id).sort()).toEqual(invoicedBy('monthly-self-billing'));
  });

  it('never writes through the state it was given', () => {
    const state: ScheduleState = {};
    hold(state, 'REC-2025005');
    reschedule(state, 'REC-2025005');
    expect(state).toEqual({});
  });
});

import { bonusOf, registerSpms, type SpmsLog } from './payment-runs';

const bank = records.filter(record => record.method === 'weekly-bank');
const withBonus = bank.filter(record => bonusOf(record) > 0);
const schedule = (state: ScheduleState = {}, spms: SpmsLog = {}) =>
  buildSchedule(records, state, spms, today);
const firstBank = () => schedule().runs.find(run => run.kind === 'payment' && run.method === 'weekly-bank')!;

describe('the bonus the SPMS carries', () => {
  it('grants some drivers a bonus and not others, the same ones every time', () => {
    expect(withBonus.length).toBeGreaterThan(0);
    expect(withBonus.length).toBeLessThan(bank.length);
    expect(bank.map(bonusOf)).toEqual(bank.map(bonusOf));
  });

  it('never grants one on the monthly run, because the SPMS is a weekly document', () => {
    for (const record of records.filter(item => item.method === 'monthly-self-billing')) {
      expect(bonusOf(record)).toBe(0);
    }
  });

  it('leaves the day rate run exactly as it was — it never waits for the document', () => {
    const run = firstBank();
    expect(run.net).toBe(run.invoices.reduce((sum, invoice) => sum + invoice.net, 0));
    for (const invoice of run.invoices) expect(invoice.net).toBe(invoice.record.amount);
  });
});

describe('the bonus run', () => {
  const paying = () => firstBank();
  const bonusDue = () => paying().invoices.filter(invoice => bonusOf(invoice.record) > 0);

  it('waits with no date at all until the SPMS arrives', () => {
    const awaiting = schedule().awaiting;
    const week = awaiting.find(item => item.week.getTime() === paying().date.getTime());
    expect(week).toBeDefined();
    expect(week!.net).toBe(bonusDue().reduce((sum, invoice) => sum + bonusOf(invoice.record), 0));
    expect(schedule().runs.some(run => run.kind === 'bonus')).toBe(false);
  });

  it('takes a date on the next bank run once the document is registered', () => {
    const spms = registerSpms({}, paying().date, on('2026-10-13'));
    const run = schedule({}, spms).runs.find(item => item.kind === 'bonus')!;
    expect(iso(run.date)).toBe('2026-10-16');
    expect(run.week!.getTime()).toBe(paying().date.getTime());
    expect(run.invoices.map(invoice => invoice.record.id).sort())
      .toEqual(bonusDue().map(invoice => invoice.record.id).sort());
    expect(schedule({}, spms).awaiting.some(item => item.week.getTime() === paying().date.getTime())).toBe(false);
  });

  it('pays the bonus, not the invoice', () => {
    const spms = registerSpms({}, paying().date, on('2026-10-13'));
    const run = schedule({}, spms).runs.find(item => item.kind === 'bonus')!;
    for (const invoice of run.invoices) {
      expect(invoice.net).toBe(bonusOf(invoice.record));
      expect(invoice.net).not.toBe(invoice.record.amount);
    }
  });

  it('still owes the bonus after the day rate run has been settled', () => {
    const settled = closeRun({}, paying());
    const awaiting = buildSchedule(records, settled, {}, today).awaiting;
    expect(awaiting.find(item => item.week.getTime() === paying().date.getTime())!.invoices)
      .toHaveLength(bonusDue().length);
  });

  it('closes on its own, leaving the invoices paid once and the bonus once', () => {
    const spms = registerSpms({}, paying().date, on('2026-10-13'));
    const run = buildSchedule(records, {}, spms, today).runs.find(item => item.kind === 'bonus')!;
    const settled = closeRun({}, run);
    const after = buildSchedule(records, settled, spms, today);
    expect(after.runs.some(item => item.kind === 'bonus')).toBe(false);
    expect(after.awaiting).toHaveLength(0);
    // The day rate is still owed: settling a bonus run pays no invoice.
    expect(after.runs.find(item => item.kind === 'payment' && item.method === 'weekly-bank')!.invoices)
      .toHaveLength(paying().invoices.length);
  });
});

describe('state written before the desk knew about the SPMS', () => {
  /** What the previous version stored: no `paidOn`, no `bonusPaid`. */
  const legacy = { 'REC-2025005': { held: false, shift: 0, paid: true } } as unknown as ScheduleState;

  it('never derives a week from a settlement it has no date for', () => {
    const schedule = buildSchedule(records, legacy, {}, today);
    for (const week of schedule.awaiting) expect(Number.isNaN(week.week.getTime())).toBe(false);
    for (const run of schedule.runs) expect(Number.isNaN(run.date.getTime())).toBe(false);
  });

  it('reads a legacy entry as one that has simply never been bonus-paid', () => {
    const schedule = buildSchedule(records, legacy, {}, today);
    // REC-2025005 was settled by a run this state cannot name, so its bonus
    // belongs to no week — but REC-2025030 is still waiting on its own.
    expect(schedule.awaiting.every(week => week.invoices.every(invoice => invoice.record.id !== 'REC-2025005')))
      .toBe(true);
    expect(schedule.runs.flatMap(run => run.invoices).map(invoice => invoice.record.id))
      .not.toContain('REC-2025005');
  });
});
