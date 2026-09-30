import type {
  ClearingDeskBoard, Money, Payee, PaymentMode, RouteSummary,
} from '../types';

export interface PayeeDTO {
  id: string;
  name: string;
  vehicle: string;
  payment_mode: string;
  payment: string;
  sort: string;
  sort_value: string;
  adhoc_service: string;
  per_stop: number;
}

export interface ClearingDeskBoardDTO {
  depot: string;
  route_summary: { postcodes: string[]; stops: number; pre_12: number };
  payees: PayeeDTO[];
  cleared: string[];
}

/** The design writes an unknown figure as an em dash, and a hyphen for "no adhoc service". */
const EM_DASH = '—';

/** "£160" → 160 · "£145.00 flat" → 145 · "—" → null */
function parseMoney(raw: string): Money {
  const flat = /\bflat\b/i.test(raw);
  const digits = raw.replace(/[^0-9.,]/g, '');
  if (!digits) return { amount: null, flat: false };
  return { amount: parseDecimal(digits), flat };
}

/** The design mixes separators: "0,00" and "20.00" both appear. */
function parseDecimal(raw: string): number {
  const value = Number(raw.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

export function formatMoney(amount: number | null, flat: boolean): string {
  if (amount === null) return EM_DASH;
  return `£${amount.toFixed(2)}${flat ? ' flat' : ''}`;
}

export function mapPayee(dto: PayeeDTO): Payee {
  return {
    id: dto.id,
    name: dto.name,
    vehicle: dto.vehicle === 'NOVEHICLE' ? null : dto.vehicle,
    mode: dto.payment_mode as PaymentMode,
    payment: parseMoney(dto.payment),
    sort: dto.sort.toUpperCase() === 'YES',
    sortValue: parseDecimal(dto.sort_value),
    adhoc: dto.adhoc_service === '-' ? null : dto.adhoc_service,
    perStop: dto.per_stop,
  };
}

function mapRouteSummary(dto: ClearingDeskBoardDTO['route_summary']): RouteSummary {
  return { postcodes: dto.postcodes, stops: dto.stops, pre12: dto.pre_12 };
}

export function mapBoard(dto: ClearingDeskBoardDTO): ClearingDeskBoard {
  return {
    depot: dto.depot,
    routeSummary: mapRouteSummary(dto.route_summary),
    payees: dto.payees.map(mapPayee),
    cleared: dto.cleared,
  };
}
