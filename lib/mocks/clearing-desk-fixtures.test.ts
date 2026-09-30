import { describe, expect, it } from 'vitest';
import { clearingDeskFixture } from './clearing-desk-fixtures';
import { mapBoard } from '@/app/(private)/clearing-desk/utils/mappers';

describe('the clearing desk fixture', () => {
  it('carries the six payees from the design, in order', () => {
    expect(clearingDeskFixture().payees.map(p => p.id))
      .toEqual(['DY1B', 'MD7E', 'DHOC', 'DY1A', 'LL2A', 'LL2X']);
  });

  it('starts with an empty cleared list', () => {
    expect(clearingDeskFixture().cleared).toEqual([]);
  });

  it('maps cleanly, including the two payees with no known amount', () => {
    const board = mapBoard(clearingDeskFixture());
    const unknown = board.payees.filter(p => p.payment.amount === null);
    expect(unknown.map(p => p.name)).toEqual(['Terry Roberts', 'Codrin Stephan']);
  });

  it('returns a fresh object each call so tests cannot pollute each other', () => {
    const first = clearingDeskFixture();
    first.payees[0].name = 'mutated';
    expect(clearingDeskFixture().payees[0].name).toBe('Diego Ferreira');
  });
});
