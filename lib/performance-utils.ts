// --- Worked Hours: Sort time by depot + vendor extra ---
// (TW/SPR/SPOR-H/AFD now come pre-computed from the backend's PerformanceCalculationService)

/** Sort time (hours) to add to Total Worked Hours per depot: LSE 2:45, LCY 2:00, MSE 1:45 */
export const DEPOT_SORT_HOURS: Record<string, number> = {
  LSE: 2 + 45 / 60,   // 2:45h
  LCY: 2,             // 2:00h
  MSE: 1 + 45 / 60,   // 1:45h
};

/** Extra hours to add per vendor who operated on the day (15 min) */
export const VENDOR_EXTRA_HOURS = 15 / 60;

/** True when operation has Sort = y (add depot sort time) */
export function hasSortY(routeSort: number | string | null | undefined): boolean {
  if (routeSort == null) return false;
  if (typeof routeSort === 'string') return routeSort.toLowerCase() === 'y' || parseFloat(routeSort) > 0;
  return Number(routeSort) > 0;
}

/**
 * Get depot from route name by prefix:
 * - MSE: routes starting with MD
 * - LSE: routes starting with LL
 * - LCY: routes starting with DY
 */
export function getDepotFromRouteName(routeName: string | null | undefined): 'LSE' | 'LCY' | 'MSE' | null {
  if (!routeName || typeof routeName !== 'string') return null;
  const trimmed = routeName.trim().toUpperCase();
  if (trimmed.startsWith('MD')) return 'MSE';
  if (trimmed.startsWith('LL')) return 'LSE';
  if (trimmed.startsWith('DY')) return 'LCY';
  return null;
}

/**
 * Parse worked hours to decimal hours. Accepts "HH:MM" / "HH:MM:SS" or numeric hours.
 * Returns 0 for null, undefined, NaN or negative.
 */
export function parseWorkedHoursToDecimal(
  value: string | number | null | undefined
): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    if (isNaN(value) || value < 0) return 0;
    return value;
  }
  const s = String(value).trim();
  if (!s) return 0;
  const parts = s.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m) && h >= 0 && m >= 0) return Math.max(0, h + m / 60);
  }
  const n = parseFloat(s);
  return isNaN(n) || n < 0 ? 0 : n;
}

export interface DayExtraHoursOp {
  routeName?: string | null;
  userId?: number | null;
  /** e.g. vendor/courier name when userId not available */
  vendorKey?: string | null;
  routeSort?: number | string | null;
}

/**
 * Extra hours to add to Total Worked Hours for a day:
 * - Depot sort time (once per depot) only when Sort = y (routeSort) for that operation.
 * - 15 min at end of operation for every vendor (all get +15 min).
 */
export function getDaySortAndVendorExtraHours(operations: DayExtraHoursOp[]): number {
  const depotsWithSort = new Set<string>();
  const vendors = new Set<string | number>();
  for (const op of operations) {
    if (hasSortY(op.routeSort)) {
      const depot = getDepotFromRouteName(op.routeName ?? null);
      if (depot) depotsWithSort.add(depot);
    }
    const userId = op.userId ?? op.vendorKey;
    if (userId != null && userId !== '') vendors.add(userId);
  }
  let extra = 0;
  for (const depot of depotsWithSort) {
    const sortHours = DEPOT_SORT_HOURS[depot];
    if (typeof sortHours === 'number') extra += sortHours;
  }
  extra += vendors.size * VENDOR_EXTRA_HOURS;
  return extra;
}

/** Apenas 15 min por motorista (para somar ao total quando o sort já está nas linhas). */
export function getVendorExtraHoursOnly(operations: DayExtraHoursOp[]): number {
  const vendors = new Set<string | number>();
  for (const op of operations) {
    const userId = op.userId ?? op.vendorKey;
    if (userId != null && userId !== '') vendors.add(userId);
  }
  return vendors.size * VENDOR_EXTRA_HOURS;
}


