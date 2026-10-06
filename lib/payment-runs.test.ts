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
