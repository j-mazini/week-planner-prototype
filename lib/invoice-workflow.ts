export const INVOICE_STAGES = [
  { id: 'current', label: 'Current Period', action: 'Submit for verification' },
  { id: 'pending', label: 'Pending Verification', action: 'Verify record' },
  { id: 'ready', label: 'Ready for Invoicing', action: 'Generate invoice' },
  { id: 'invoiced', label: 'Invoiced', action: null },
] as const;

export type InvoiceStage = typeof INVOICE_STAGES[number]['id'];
export interface WorkflowRecord {
  id: string;
  vendor: string;
  period: string;
  /** Integer pence, so moving records preserves exact totals. */
  amount: number;
  status: InvoiceStage;
}

export function nextInvoiceStage(status: InvoiceStage): InvoiceStage | undefined {
  return INVOICE_STAGES[INVOICE_STAGES.findIndex(stage => stage.id === status) + 1]?.id;
}

export function moveInvoice(records: WorkflowRecord[], id: string, from: InvoiceStage, to: InvoiceStage): WorkflowRecord[] {
  if (nextInvoiceStage(from) !== to) return records;
  return records.map(record => record.id === id && record.status === from ? { ...record, status: to } : record);
}

export function restoreInvoiceStages(seed: WorkflowRecord[], saved: unknown): WorkflowRecord[] {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return seed;
  const values = saved as Record<string, unknown>;
  return seed.map(record => {
    const index = INVOICE_STAGES.findIndex(stage => stage.id === values[record.id]);
    const original = INVOICE_STAGES.findIndex(stage => stage.id === record.status);
    return index >= original ? { ...record, status: INVOICE_STAGES[index].id } : record;
  });
}
