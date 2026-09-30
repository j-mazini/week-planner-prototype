import { describe, it, expect } from 'vitest';
import { DEPOTS, LINKS, neighbours, chooseHop, nextHop } from './delivery-network';

const ids = () => DEPOTS.map((d) => d.id);

describe('delivery network graph', () => {
  it('links only depots that exist', () => {
    for (const [a, b] of LINKS) {
      expect(ids()).toContain(a);
      expect(ids()).toContain(b);
    }
  });

  it('leaves no depot stranded without a route', () => {
    for (const depot of DEPOTS) {
      expect(neighbours(depot.id).length).toBeGreaterThan(0);
    }
  });

  it('keeps the top band clear for the wordmark', () => {
    // The wordmark sits in the panel's first ~14%, and it is narrow: only depots
    // on the left half can collide with it.
    for (const depot of DEPOTS) {
      if (depot.x < 50) expect(depot.y).toBeGreaterThan(14);
    }
  });

  it('keeps every depot inside the viewBox', () => {
    for (const depot of DEPOTS) {
      expect(depot.x).toBeGreaterThanOrEqual(0);
      expect(depot.x).toBeLessThanOrEqual(100);
      expect(depot.y).toBeGreaterThanOrEqual(0);
      expect(depot.y).toBeLessThanOrEqual(100);
    }
  });
});

describe('nextHop', () => {
  const first = () => 0;

  it('moves to a depot the current one is actually linked to', () => {
    for (const depot of DEPOTS) {
      const hop = nextHop(depot.id, undefined, first);
      expect(neighbours(depot.id)).toContain(hop);
    }
  });

  it('does not double back when another route is available', () => {
    const from = DEPOTS.find((d) => neighbours(d.id).length > 1)!;
    const cameFrom = neighbours(from.id)[0];
    const hop = nextHop(from.id, cameFrom, first);
    expect(hop).not.toBe(cameFrom);
  });

});

describe('chooseHop', () => {
  const first = () => 0;

  it('turns around at a dead end rather than stalling', () => {
    expect(chooseHop(['north'], 'north', first)).toBe('north');
  });

  it('skips the depot the delivery just came from', () => {
    expect(chooseHop(['north', 'south'], 'north', first)).toBe('south');
  });
});
