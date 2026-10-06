import { describe, expect, it } from 'vitest';
import {
  calculateInstallments,
  parseScheduleTerms,
  validateInstallmentInputs,
  type InstallmentPreview,
} from './deduction-installments';

const ref = 'ADV-GSOUZA-130925-001';
const entry = '2026-03-10';
const sum = (items: InstallmentPreview[]) =>
  Math.round(items.reduce((total, item) => total + item.amount, 0) * 100) / 100;
const lastDayOf = (iso: string) => {
  const [year, month] = iso.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

describe('what a deduction is split into', () => {
  it('always adds back up to what was deducted', () => {
    // The one invariant that cannot bend: a driver is charged the total, no
    // more and no less, however it is sliced.
    for (const total of [1, 55.5, 200, 200.01, 349.99, 1000, 1234.56, 7777.77]) {
      for (const schedule of [null, '', '1x', '2x', '3 months', '7x', '12x']) {
        const items = calculateInstallments(total, schedule, ref, entry)!;
        expect(items.length).toBeGreaterThan(0);
        expect(sum(items)).toBe(total);
      }
    }
  });

  it('caps an unscheduled deduction at 200 a month, the last one carrying the rest', () => {
    const items = calculateInstallments(950, null, ref, entry)!;
    expect(items).toHaveLength(5);
    expect(items.slice(0, 4).map(item => item.amount)).toEqual([200, 200, 200, 200]);
    expect(items[4].amount).toBe(150);
  });

  it('takes a small unscheduled deduction in one go', () => {
    const items = calculateInstallments(200, null, ref, entry)!;
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe(200);
  });

  it('honours the agreed number of instalments, 200 cap or not', () => {
    const items = calculateInstallments(950, '2x', ref, entry)!;
    expect(items).toHaveLength(2);
    expect(items.map(item => item.amount)).toEqual([475, 475]);
  });

  it('gives the rounding leftovers to the last instalment, never loses them', () => {
    const items = calculateInstallments(100, '3x', ref, entry)!;
    expect(items.map(item => item.amount)).toEqual([33, 33, 34]);
  });

  it('refuses to invent a schedule for an amount or a reference it cannot use', () => {
    expect(calculateInstallments(0, '3x', ref, entry)).toBeNull();
    expect(calculateInstallments(-50, '3x', ref, entry)).toBeNull();
    expect(calculateInstallments(100, '3x', '', entry)).toBeNull();
    expect(calculateInstallments(100, '3x', ref, 'not a date')).toBeNull();
    expect(validateInstallmentInputs(100, ref, '2026-03-10')).toBe(true);
  });
});

describe('when each instalment falls', () => {
  it('always lands on the last calendar day of its month', () => {
    for (const items of [
      calculateInstallments(1000, '6x', ref, '2026-01-15')!,
      calculateInstallments(1000, '6x', ref, '2026-11-02')!,
    ]) {
      for (const item of items) expect(Number(item.date.slice(8))).toBe(lastDayOf(item.date));
    }
  });

  it('runs month after month with no gap, over a year end', () => {
    const items = calculateInstallments(1000, '4x', ref, '2026-11-02')!;
    expect(items.map(item => item.date.slice(0, 7))).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });

  it('pushes to next month when the deduction is entered on the last day', () => {
    const items = calculateInstallments(400, '2x', ref, '2026-03-31')!;
    expect(items.map(item => item.date.slice(0, 7))).toEqual(['2026-04', '2026-05']);
  });

  it('starts a repair deduction in the month it was entered', () => {
    const items = calculateInstallments(400, '2x', 'RPD-GSOUZA-130925-001', '2026-03-10')!;
    expect(items.map(item => item.date.slice(0, 7))).toEqual(['2026-03', '2026-04']);
  });

  it('runs a repair deduction month after month even when entered on the last day', () => {
    const items = calculateInstallments(400, '2x', 'RPD-GSOUZA-130925-001', '2026-03-31')!;
    expect(items.map(item => item.date.slice(0, 7))).toEqual(['2026-03', '2026-04']);
  });
});

describe('how the instalments are referenced', () => {
  it('keeps the deduction s reference on the first and counts up from it', () => {
    const items = calculateInstallments(600, '3x', 'ADV-GSOUZA-130925-001', entry)!;
    expect(items.map(item => item.referenceNumber))
      .toEqual(['ADV-GSOUZA-130925-001', 'ADV-GSOUZA-130925-002', 'ADV-GSOUZA-130925-003']);
  });

  it('keeps the three digits when the count crosses ten', () => {
    const items = calculateInstallments(2400, '12x', 'ADV-GSOUZA-130925-008', entry)!;
    expect(items[2].referenceNumber).toBe('ADV-GSOUZA-130925-010');
    expect(items[11].referenceNumber).toBe('ADV-GSOUZA-130925-019');
  });
});

describe('reading the agreed terms', () => {
  it('takes the count out of however it was written', () => {
    for (const written of ['3x', '3 months', '3', '3 instalments', ' 3X ']) {
      expect(parseScheduleTerms(written)).toBe(3);
    }
  });

  it('falls back to the 200 rule when there is no usable count', () => {
    for (const written of [null, undefined, '', '   ', 'monthly', '0x', '999x']) {
      expect(parseScheduleTerms(written)).toBeNull();
    }
  });
});
