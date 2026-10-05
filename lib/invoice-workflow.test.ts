import { describe, expect, it } from 'vitest';
import { INVOICE_STAGES, moveInvoice, nextInvoiceStage, restoreInvoiceStages, type WorkflowRecord } from './invoice-workflow';

const records: WorkflowRecord[] = [
  { id: 'A', vendor: 'Vendor A', period: 'Sep 2026', amount: 248920, status: 'current' },
  { id: 'B', vendor: 'Vendor B', period: 'Sep 2026', amount: 92910, status: 'pending' },
];

describe('invoice workflow', () => {
  it('allows only sequential progress and preserves record identity and amounts', () => {
    let result = records;
    for (const to of ['pending', 'ready', 'invoiced'] as const) {
      result = moveInvoice(result, 'A', result[0].status, to);
      expect(result[0].status).toBe(to);
      expect(result[0].amount).toBe(248920);
      expect(result[1]).toBe(records[1]);
    }
    expect(nextInvoiceStage('invoiced')).toBeUndefined();
    expect(result.reduce((sum, item) => sum + item.amount, 0)).toBe(341830);
  });

  it('rejects skipped stages, reversals and stale or duplicate confirmations', () => {
    for (const from of INVOICE_STAGES) {
      for (const to of INVOICE_STAGES) {
        if (nextInvoiceStage(from.id) === to.id) continue;
        const source = [{ ...records[0], status: from.id }];
        expect(moveInvoice(source, 'A', from.id, to.id)).toBe(source);
      }
    }
    const advanced = moveInvoice(records, 'A', 'current', 'pending');
    expect(moveInvoice(advanced, 'A', 'current', 'pending')).toEqual(advanced);
    expect(moveInvoice(records, 'unknown', 'current', 'pending')).toEqual(records);
  });

  it('restores valid saved stages without accepting unknown stages or altering amounts', () => {
    expect(restoreInvoiceStages(records, { A: 'ready', B: 'invalid' })).toEqual([{ ...records[0], status: 'ready' }, records[1]]);
    expect(restoreInvoiceStages(records, { B: 'current' })).toEqual(records);
    expect(restoreInvoiceStages(records, null)).toEqual(records);
    expect(restoreInvoiceStages(records, [])).toEqual(records);
  });
});
