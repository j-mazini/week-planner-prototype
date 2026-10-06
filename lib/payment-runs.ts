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
