import { describe, expect, it } from 'vitest';
import {
  CARD_ENTER, CARD_SETTLED, QUEUE_EXIT, CLEARED_EXIT, cardTransition,
} from './motion';

describe('the clearing desk card motion', () => {
  it('enters from above, so a card arriving in either column drops into place', () => {
    expect(CARD_ENTER.opacity).toBe(0);
    expect(CARD_ENTER.y).toBeLessThan(0);
    expect(CARD_SETTLED).toEqual({ opacity: 1, x: 0, y: 0 });
  });

  it('exits toward the column the card is moving to', () => {
    // The queue sits left of the cleared column: approving sends a card right,
    // returning sends it back left. The signs are the whole point of the pair.
    expect(QUEUE_EXIT.x).toBeGreaterThan(0);
    expect(CLEARED_EXIT.x).toBeLessThan(0);
    expect(QUEUE_EXIT.opacity).toBe(0);
    expect(CLEARED_EXIT.opacity).toBe(0);
  });

  it('leaves faster than it arrives, so the gap does not linger', () => {
    const { exit, enter } = cardTransition(false);
    expect(exit.duration).toBeLessThan(enter.duration);
  });

  it('collapses to no duration when the viewer asks for reduced motion', () => {
    const { exit, enter } = cardTransition(true);
    expect(exit.duration).toBe(0);
    expect(enter.duration).toBe(0);
  });
});
