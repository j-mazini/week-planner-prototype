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

/** Valid payment modes. */
const VALID_PAYMENT_MODES: readonly string[] = ['DAF', 'DR', 'VSR', 'SP_VSR'];

/** Validate that a payment mode string is one of the allowed literals. */
function validatePaymentMode(raw: string): PaymentMode {
  if (VALID_PAYMENT_MODES.includes(raw)) {
    return raw as PaymentMode;
  }
  throw new Error(`Invalid payment mode: "${raw}". Expected one of: ${VALID_PAYMENT_MODES.join(', ')}`);
}

/**
 * Parse a decimal string with flexible separator handling.
 * Keeps leading minus sign. If both ',' and '.' are present, treats the last one as
 * the decimal separator and removes the thousands separator. Returns null for
 * genuinely empty input or malformed strings (e.g., "£1.2.3").
 */
function parseDecimal(raw: string): number | null {
  // Strip currency symbols and spaces, but keep leading minus and separators
  const normalized = raw.replace(/[^\d.,\-]/g, '');

  // Genuinely empty after normalization
  if (!normalized || normalized === '-') return null;

  // Count separators: if more than 2 or ambiguous, it's malformed
  const commaCount = (normalized.match(/,/g) || []).length;
  const dotCount = (normalized.match(/\./g) || []).length;

  if (commaCount + dotCount > 2) {
    // More than 2 separators total is malformed (e.g., "£1.2.3")
    return null;
  }

  // Determine decimal separator logic
  let decimalNormalized = normalized;
  if (commaCount === 1 && dotCount === 1) {
    // Both separators present: last one is decimal, other is thousands
    const lastCommaIdx = decimalNormalized.lastIndexOf(',');
    const lastDotIdx = decimalNormalized.lastIndexOf('.');
    const decimalSep = lastCommaIdx > lastDotIdx ? ',' : '.';
    const thousandsSep = decimalSep === ',' ? '.' : ',';
    // Remove thousands separator, keep decimal separator
    decimalNormalized = decimalNormalized.replace(new RegExp(`\\${thousandsSep}`, 'g'), '');
  }

  // Normalize comma to dot for Number parsing
  const value = Number(decimalNormalized.replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

/** "£160" → 160 · "£145.00 flat" → 145 · "—" → null */
function parseMoney(raw: string): Money {
  const flat = /\bflat\b/i.test(raw);
  const amount = parseDecimal(raw);
  return { amount, flat };
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
    mode: validatePaymentMode(dto.payment_mode),
    payment: parseMoney(dto.payment),
    sort: dto.sort.toUpperCase() === 'YES',
    sortValue: parseDecimal(dto.sort_value) ?? 0,
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
