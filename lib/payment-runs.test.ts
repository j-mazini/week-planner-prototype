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
