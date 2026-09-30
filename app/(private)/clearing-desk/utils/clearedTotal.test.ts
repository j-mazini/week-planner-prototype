import { describe, expect, it } from 'vitest';
import { computeClearedTotal } from './clearedTotal';
import { mapBoard } from './mappers';
import { clearingDeskFixture } from '@/lib/mocks/clearing-desk-fixtures';

describe('computeClearedTotal', () => {
  const board = mapBoard(clearingDeskFixture());

  it('sums every payee when all are cleared', () => {
    // 2·15 + 2·15 + 2·15 + 1.75·15 + 2·15 + 2·15 = 176.25
    const allIds = board.payees.map(p => p.id);
    expect(computeClearedTotal(board.payees, allIds, board.routeSummary.stops)).toBe(176.25);
  });

  it('sums only the cleared subset, not the whole board', () => {
    // 2·15 (DY1B) + 1.75·15 (DY1A) = 56.25 — diverges from the all-cleared 176.25,
    // so this distinguishes "sum over cleared" from "sum over all".
    expect(computeClearedTotal(board.payees, ['DY1B', 'DY1A'], board.routeSummary.stops)).toBe(56.25);
  });

  it('returns 0 when nothing is cleared', () => {
    expect(computeClearedTotal(board.payees, [], board.routeSummary.stops)).toBe(0);
  });
});
