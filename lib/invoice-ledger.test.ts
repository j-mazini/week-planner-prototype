import { describe, it, expect } from 'vitest';
import { buildLedger } from './invoice-ledger';
import type { Invoice } from '@/app/(private)/mobile-invoice/types';

const invoice = (invoiceId: number, referenceDate: string, totalPayment: number, invoiceNumber = `INV-${invoiceId}`): Invoice => ({
  invoiceId,
  invoiceNumber,
  userCode: 'DEMO',
  courier: 'João Silva',
  invoiceCreatedOn: referenceDate,
  totalPayment,
  referenceDate,
});

describe('buildLedger', () => {
  it('groups invoices by the month they cover', () => {
    const ledger = buildLedger([
      invoice(1, '2026-08-03', 100),
      invoice(2, '2026-08-19', 250),
      invoice(3, '2026-07-06', 80),
    ]);
    expect(ledger.months.map((m) => m.label)).toEqual(['August 2026', 'July 2026']);
    expect(ledger.months[0].invoices).toHaveLength(2);
  });

  it('totals each month', () => {
    const ledger = buildLedger([invoice(1, '2026-08-03', 100), invoice(2, '2026-08-19', 250.5)]);
    expect(ledger.months[0].total).toBe(350.5);
  });

  it('puts the most recent month first', () => {
    const ledger = buildLedger([invoice(1, '2026-01-10', 10), invoice(2, '2026-12-10', 20)]);
    expect(ledger.months.map((m) => m.label)).toEqual(['December 2026', 'January 2026']);
  });

  it('reports the latest payment and the period it covers', () => {
    const ledger = buildLedger([invoice(1, '2026-07-06', 80), invoice(2, '2026-08-19', 250)]);
    expect(ledger.latest).toEqual({ amount: 250, period: 'August 2026' });
  });

  it('counts every invoice, not just the latest month', () => {
    const ledger = buildLedger([invoice(1, '2026-07-06', 80), invoice(2, '2026-08-19', 250)]);
    expect(ledger.count).toBe(2);
  });

  it('survives an empty list rather than inventing a payment', () => {
    const ledger = buildLedger([]);
    expect(ledger.months).toEqual([]);
    expect(ledger.latest).toBeNull();
    expect(ledger.count).toBe(0);
  });

  it('ignores invoices whose reference date cannot be read', () => {
    const ledger = buildLedger([invoice(1, 'not-a-date', 50), invoice(2, '2026-08-19', 250)]);
    expect(ledger.months.map((m) => m.label)).toEqual(['August 2026']);
    expect(ledger.count).toBe(1);
  });
});
