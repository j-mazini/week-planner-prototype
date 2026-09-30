/**
 * The delivery map behind the login panel: which depots exist, how they connect,
 * and where a delivery goes next. Pure data and pure functions — the drawing and
 * the motion live in `components/DeliveryNetwork.tsx`.
 */

export interface Depot {
  id: string;
  name: string;
  /** Position in the 0–100 viewBox the panel draws into. */
  x: number;
  y: number;
}

/** Hand-placed, not generated: they sit high and to the right so the headline stays clear. */
export const DEPOTS: readonly Depot[] = [
  { id: "north", name: "North Dock", x: 12, y: 28 },
  { id: "central", name: "Central Hub", x: 34, y: 19 },
  { id: "east", name: "East Gate", x: 58, y: 22 },
  { id: "south", name: "South Yard", x: 80, y: 12 },
  { id: "riverside", name: "Riverside", x: 92, y: 34 },
  { id: "harbour", name: "Harbour", x: 70, y: 44 },
  { id: "westfield", name: "Westfield", x: 46, y: 38 },
  { id: "kilnbrook", name: "Kilnbrook", x: 88, y: 62 },
  { id: "lowgate", name: "Lowgate", x: 86, y: 82 },
];

export const LINKS: readonly (readonly [string, string])[] = [
  ["north", "central"],
  ["central", "east"],
  ["east", "south"],
  ["south", "riverside"],
  ["riverside", "harbour"],
  ["east", "harbour"],
  ["central", "westfield"],
  ["westfield", "east"],
  ["harbour", "lowgate"],
  ["riverside", "kilnbrook"],
  ["kilnbrook", "lowgate"],
  ["westfield", "north"],
];

const byId = new Map(DEPOTS.map((d) => [d.id, d]));

/** @throws if the id is not a depot — a typo in LINKS should fail loudly, not draw nothing. */
export const depot = (id: string): Depot => {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown depot: ${id}`);
  return found;
};

export const neighbours = (id: string): string[] =>
  LINKS.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

/** Random by default; tests pass a deterministic picker. */
type Picker = (count: number) => number;
const randomIndex: Picker = (count) => Math.floor(Math.random() * count);

/**
 * Picks where a delivery heads next. Prefers to keep going rather than retrace the
 * leg it just drove, but a dead end is a turnaround, not a stall.
 */
export const chooseHop = (
  options: string[],
  cameFrom: string | undefined,
  pick: Picker = randomIndex
): string => {
  const onward = options.filter((id) => id !== cameFrom);
  const candidates = onward.length > 0 ? onward : options;
  return candidates[pick(candidates.length)];
};

export const nextHop = (from: string, cameFrom?: string, pick: Picker = randomIndex): string =>
  chooseHop(neighbours(from), cameFrom, pick);
