import type { Payee } from '../types';

/** Sums perStop * stops over only the payees whose id is in clearedIds. */
export function computeClearedTotal(payees: Payee[], clearedIds: string[], stops: number): number {
  return clearedIds.reduce((sum, id) => {
    const payee = payees.find(p => p.id === id);
    return payee ? sum + payee.perStop * stops : sum;
  }, 0);
}
