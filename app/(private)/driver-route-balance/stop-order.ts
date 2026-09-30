export type OrderedStop = { id: string; address: string; postcode: string; customer: string; flag: string; special: boolean };

function field(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if ((typeof value === 'string' && value.trim()) || typeof value === 'number') return String(value);
  }
  return '';
}

export function normalizeStops(rows: Record<string, unknown>[]): OrderedStop[] {
  const occurrences = new Map<string, number>();
  return rows.map(row => {
    const address = field(row, ['address', 'stopAddress', 'deliveryAddress', 'addressLine1']);
    const postcode = field(row, ['postcode', 'postCode', 'postalCode', 'postal_code']);
    const customer = field(row, ['customerName', 'customer', 'recipientName', 'name']);
    const flag = field(row, ['flag', 'category', 'serviceType', 'deliveryType']);
    const identity = field(row, ['stopId', 'shipmentId', 'id', 'trackingNumber']) || JSON.stringify([address, postcode, customer, flag]);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    const special = row.isSpecialDelivery === true || row.specialDelivery === true || /\b(ASR|BSR|DSR|PRE[ -]?12|SPECIAL)\b/i.test(flag);
    return {id: `${identity}:${occurrence}`, address, postcode, customer, flag, special};
  });
}

/** Keep saved stops in order, drop removed stops, and append new stops. */
export function reconcileStopOrder(stops: OrderedStop[], saved: unknown): OrderedStop[] {
  if (!Array.isArray(saved)) return stops;
  const remaining = new Map(stops.map(stop => [stop.id, stop]));
  const result: OrderedStop[] = [];
  for (const id of saved) {
    if (typeof id !== 'string') continue;
    const stop = remaining.get(id);
    if (stop) { result.push(stop); remaining.delete(id); }
  }
  return [...result, ...remaining.values()];
}

export function moveStop(stops: OrderedStop[], id: string, position: number): OrderedStop[] {
  const from = stops.findIndex(stop => stop.id === id);
  if (from < 0 || !Number.isInteger(position) || position < 0 || position >= stops.length || from === position) return stops;
  const next = [...stops];
  const [stop] = next.splice(from, 1);
  next.splice(position, 0, stop);
  return next;
}

export const demoStops = normalizeStops([
  {id: 'demo-1', address: '141 Victoria Avenue', postcode: 'ME2 2AB', customer: 'Customer 381', flag: 'PRE 12'},
  {id: 'demo-2', address: '28 High Street', postcode: 'ME1 1AA', customer: 'Customer 301', flag: 'AM'},
  {id: 'demo-3', address: '7 Station Road', postcode: 'ME2 4AB', customer: 'Customer 214', flag: 'ASR'},
  {id: 'demo-4', address: '52 Church Road', postcode: 'ME1 3AB', customer: 'Customer 112', flag: 'DSR'},
]);

