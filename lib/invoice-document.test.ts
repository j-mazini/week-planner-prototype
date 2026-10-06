import { describe, expect, it } from 'vitest';
import { buildInvoiceDocument } from './invoice-document';
import type { WorkflowRecord } from './invoice-workflow';

const record: WorkflowRecord = { id: 'REC-2025001', vendor: 'Benjamin Harris', period: 'Sep 2026', amount: 248920, status: 'pending' };

describe('invoice document', () => {
  it('reconciles: the lines less the deductions are the balance the desk shows', () => {
    for (const amount of [12500, 64341, 92910, 248920, 1004999]) {
      const doc = buildInvoiceDocument({ ...record, amount });
      const lines = doc.lines.reduce((sum, line) => sum + line.amount, 0);
      expect(lines).toBe(doc.subtotal);
      expect(doc.subtotal + doc.vat - doc.deductionsTotal).toBe(doc.balance);
      expect(doc.balance).toBe(amount);
      expect(doc.deductionsTotal).toBe(doc.deductions.reduce((sum, item) => sum + item.amount, 0));
    }
  });

  it('is the same document every time it is opened', () => {
    expect(buildInvoiceDocument(record)).toEqual(buildInvoiceDocument(record));
    // The record, not the object, is what identifies the document.
    expect(buildInvoiceDocument({ ...record })).toEqual(buildInvoiceDocument(record));
  });

  it('gives a different vendor a different document', () => {
    const other = buildInvoiceDocument({ ...record, id: 'REC-2025002', vendor: 'James Anderson' });
    expect(other.number).not.toBe(buildInvoiceDocument(record).number);
    expect(other.vendorId).not.toBe(buildInvoiceDocument(record).vendorId);
  });

  it('bills every line inside the period it covers, and falls due after it', () => {
    const doc = buildInvoiceDocument(record);
    expect(doc.lines.length).toBeGreaterThan(0);
    for (const line of doc.lines) {
      expect(line.date.getUTCFullYear()).toBe(2026);
      expect(line.date.getUTCMonth()).toBe(8);
      // Deliveries run Monday to Saturday.
      expect(line.date.getUTCDay()).not.toBe(0);
    }
    const dates = doc.lines.map(line => line.date.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
    expect(doc.dueDate.getTime()).toBeGreaterThan(doc.issuedDate.getTime());
  });

  it('leaves out the deductions block when there is nothing to deduct', () => {
    // A balance that the rate table hits exactly has no overshoot to deduct.
    const exact = buildInvoiceDocument({ ...record, amount: 13000 });
    expect(exact.deductions).toHaveLength(0);
    expect(exact.deductionsTotal).toBe(0);
  });

  it('refuses to invent a document for an amount it cannot bill', () => {
    expect(buildInvoiceDocument({ ...record, amount: 0 }).lines).toHaveLength(0);
    expect(buildInvoiceDocument({ ...record, amount: -500 }).lines).toHaveLength(0);
  });
});
