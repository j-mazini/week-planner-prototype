import type { WorkflowRecord } from './invoice-workflow';

/**
 * The self-billing invoice a record becomes once it is opened on the desk.
 *
 * The desk carries one number per record — what the driver is owed — and the
 * document has to show the work behind it. There is no billing system here to
 * ask, so the lines are derived from the record itself: deterministically, so
 * the same record always opens the same document, and reconciled, so the lines
 * less the deductions are exactly the balance the desk has been showing.
 *
 * Every amount is integer pence.
 */

export interface InvoiceLine {
  date: Date;
  route: string;
  vat: string;
  amount: number;
}

export interface InvoiceDeduction {
  label: string;
  reference: string;
  amount: number;
}

export interface InvoiceDocument {
  number: string;
  vendor: string;
  vendorId: string;
  email: string;
  issuedDate: Date;
  dueDate: Date;
  terms: string;
  totalStops: number;
  lines: InvoiceLine[];
  subtotal: number;
  vat: number;
  deductions: InvoiceDeduction[];
  deductionsTotal: number;
  balance: number;
}

/** What a day on the road pays: a double drop, a single route, a route plus a DHOC. */
const RATES = [13000, 16000, 17500] as const;
const SINGLES = ['LL4B', 'LL3C', 'LL4X', 'LL3A', 'LL3D', 'LL3B'];
const DEDUCTION_REASONS = [
  { label: 'REPAIRS & DAMAGES', prefix: 'RPD' },
  { label: 'ADVANCE REPAYMENT', prefix: 'ADV' },
  { label: 'FINES & PENALTIES', prefix: 'FIN' },
];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** A record's id and vendor are its identity, so the document seeds from both. */
function seedOf(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function random(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const initialsOf = (vendor: string) =>
  vendor.split(/\s+/).filter(Boolean).map(part => part[0].toUpperCase()).join('').slice(0, 2) || 'XX';

const pad = (value: number, length = 2) => String(value).padStart(length, '0');
const stamp = (date: Date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;

/** "Sep 2026" — the month the work was done. Anything unreadable bills the current month. */
function parsePeriod(period: string): { year: number; month: number } {
  const [name, year] = period.trim().split(/\s+/);
  const month = MONTHS.indexOf((name ?? '').slice(0, 3).toLowerCase());
  const now = new Date();
  if (month < 0 || !/^\d{4}$/.test(year ?? '')) return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  return { year: Number(year), month };
}

/** Deliveries run Monday to Saturday, so Sundays are not billable days. */
function workingDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  for (let day = 1; day <= new Date(Date.UTC(year, month + 1, 0)).getUTCDate(); day += 1) {
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCDay() !== 0) days.push(date);
  }
  return days;
}

/**
 * Lines that cover the balance. Full-rate days are drawn until what is left
 * fits in one more day, which is then billed at the cheapest rate that covers
 * it — so a balance the rate table hits exactly carries no deduction at all,
 * and any overshoot is at most one day's rate.
 */
function billLines(balance: number, next: () => number): number[] {
  if (balance <= 0) return [];
  const amounts: number[] = [];
  let remaining = balance;
  const top = RATES[RATES.length - 1];
  // 400 days is far beyond any one period; it only stops a runaway balance.
  while (remaining > top && amounts.length < 400) {
    const rate = RATES[Math.floor(next() * RATES.length)];
    amounts.push(rate);
    remaining -= rate;
  }
  amounts.push(RATES.find(rate => rate >= remaining) ?? top);
  return amounts;
}

export function buildInvoiceDocument(record: WorkflowRecord): InvoiceDocument {
  const next = random(seedOf(`${record.id}|${record.vendor}|${record.period}`));
  const { year, month } = parsePeriod(record.period);
  const issuedDate = new Date(Date.UTC(year, month + 1, 0));
  const dueDate = new Date(Date.UTC(year, month + 1, 15));
  const initials = initialsOf(record.vendor);
  const days = workingDays(year, month);

  const amounts = billLines(record.amount, next);
  const lines = amounts.map((amount, index) => {
    // Spread the days evenly across the period and keep them in date order.
    const date = days[Math.min(days.length - 1, Math.floor((index * days.length) / amounts.length))];
    return { date, route: routeFor(amount, next), vat: 'NO VAT', amount };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const overshoot = subtotal - record.amount;
  const reason = DEDUCTION_REASONS[Math.floor(next() * DEDUCTION_REASONS.length)];
  const deductions = overshoot > 0
    ? [{
        label: reason.label,
        reference: `${reason.prefix}-${initials}${record.id.replace(/\D/g, '').slice(-3)}-${stamp(issuedDate).slice(2)}`,
        amount: overshoot,
      }]
    : [];

  return {
    number: `#${stamp(issuedDate)}-${initials}`,
    vendor: record.vendor,
    vendorId: `${initials}${record.id.replace(/\D/g, '').slice(-3)}`,
    email: `${record.vendor.toLowerCase().replace(/[^a-z]+/g, '.')}@baexpress.co.uk`,
    issuedDate,
    dueDate,
    terms: 'NET 15',
    totalStops: lines.reduce((sum, line) => sum + 28 + (line.amount % 17), 0),
    lines,
    subtotal,
    vat: 0,
    deductions,
    deductionsTotal: overshoot > 0 ? overshoot : 0,
    balance: record.amount,
  };
}

/** The route has to match what the day paid, or the lines stop adding up visually. */
function routeFor(amount: number, next: () => number): string {
  const single = () => SINGLES[Math.floor(next() * SINGLES.length)];
  if (amount === 13000) return 'DHOC, DHOC';
  if (amount === 16000) return single();
  return next() < 0.5 ? `${single()}, DHOC` : `DHOC, ${single()}`;
}
