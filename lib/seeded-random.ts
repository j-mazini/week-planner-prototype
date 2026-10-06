/**
 * A deterministic number stream from a piece of text.
 *
 * The prototype derives figures it has no system to ask for — the days behind
 * an invoice, say. They must not change between two renders of the same
 * record, so they come from here rather than `Math.random`.
 */

/** FNV-1a: short, stable, and enough to separate one record from another. */
function seedOf(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32, seeded by `text`. Returns numbers in [0, 1). */
export function seededRandom(text: string): () => number {
  let state = seedOf(text) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
